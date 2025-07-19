// src/store/useCadStore.ts

import { createWithEqualityFn } from 'zustand/traditional';
import * as THREE from 'three';
import { produce } from 'immer';
import React from 'react';
import TWEEN from '@tweenjs/tween.js';
import { shallow } from 'zustand/shallow';

// --- TYPES ---
export type ShapeType = 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'wedge' | 'gear' | 'group' | 'pyramid';

export type ShapeProperties = {
  width?: number; height?: number; depth?: number; radius?: number; widthSegments?: number;
  heightSegments?: number; radiusTop?: number; radiusBottom?: number; radialSegments?: number;
  tube?: number; tubularSegments?: number; teeth?: number;
};

export type CadObject = {
  id: string; type: ShapeType; transform: { position: [number, number, number];
  rotation: [number, number, number]; scale: [number, number, number]; }; color: string;
  metalness: number; roughness: number; isHole: boolean;
  properties: ShapeProperties; parentId: string | null;
};

export type ViewDirection = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK';
type ProjectFile = { objects: Record<string, CadObject>; };
export type ViewCubeLabels = { x: ViewDirection; y: ViewDirection; z: ViewDirection; };
type ScreenshotCallback = (() => void) | null;

// --- STATE DEFINITION ---
export type State = {
  objects: Record<string, CadObject>;
  selectedObjectIds: string[];
  primedForMoveId: string | null;
  clipboard: Record<string, CadObject> | null;
  cameraControlsRef: React.RefObject<any> | null;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | THREE.OrthographicCamera> | null;
  screenshotFunction: ScreenshotCallback;
  viewCubeLabels: ViewCubeLabels;
  pendingShapeType: ShapeType | null;
  pendingShapeColor: string;
  snapSize: number;
  lastMousePosition: [number, number, number];
};

type HistoryState = { 
  history: { 
    past: Omit<State, 'cameraControlsRef' | 'cameraRef' | 'screenshotFunction'>[]; 
    future: Omit<State, 'cameraControlsRef' | 'cameraRef' | 'screenshotFunction'>[]; 
  }; 
};

// --- ACTIONS DEFINITION ---
type Actions = {
  setPrimedForMove: (id: string | null) => void;
  addObject: (position: [number, number, number]) => void;
  setPendingShape: (type: ShapeType | null, color?: string) => void;
  setObjectHole: (id: string, isHole: boolean) => void;
  setSnapSize: (size: number) => void;
  selectObject: (id: string | null, shiftKey?: boolean) => void;
  deleteSelectedObjects: () => void;
  duplicateSelectedObjects: () => void;
  mirrorSelectedObjects: () => void;
  groupSelectedObjects: () => void;
  ungroupObjects: () => void;
  setObjectPosition: (id: string, position: [number, number, number]) => void;
  setObjectRotation: (id: string, rotation: [number, number, number]) => void;
  setObjectScale: (id: string, scale: [number, number, number]) => void;
  setObjectTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  setObjectDimensions: (id: string, dimension: 'width' | 'height' | 'depth' | 'radius', newDimensionValue: number) => void;
  updateObjectMaterial: (id: string, key: 'metalness' | 'roughness', value: number) => void;
  updateObjectColor: (id: string, newColor: string) => void;
  updateObjectProperties: (id: string, newProperties: Partial<ShapeProperties>) => void;
  copySelectedObjects: () => void;
  pasteObjects: () => void;
  undo: () => void;
  redo: () => void;
  exportProject: () => void;
  loadProject: (jsonString: string) => void;
  triggerScreenshot: () => void;
  setScreenshotFunction: (func: ScreenshotCallback) => void;
  setCameraControlsRef: (ref: React.RefObject<any>) => void;
  setCameraRef: (ref: React.RefObject<THREE.PerspectiveCamera | THREE.OrthographicCamera>) => void;
  recordInteraction: () => void;
  getShapeDefaultProperties: (type: ShapeType) => ShapeProperties;
  setLastMousePosition: (position: [number, number, number]) => void;
  zoomToFit: () => void;
  setOrthographicView: (direction: ViewDirection) => void;
  updateViewCube: () => void;
};

const recordHistory = (set: any, get: any) => {
  const { history, cameraControlsRef, cameraRef, screenshotFunction, ...currentState } = get();
  set({ history: { past: [...history.past, currentState].slice(-50), future: [] } });
};

const getDefaultProperties = (type: ShapeType): ShapeProperties => {
  switch (type) {
    case 'box': return { width: 2, height: 2, depth: 2 };
    case 'sphere': return { radius: 1, widthSegments: 32, heightSegments: 16 };
    case 'cylinder': return { radiusTop: 1, radiusBottom: 1, height: 2, radialSegments: 32 };
    case 'cone': return { radius: 1, height: 2, radialSegments: 32 };
    case 'pyramid': return { radius: 1, height: 2, radialSegments: 4 };
    case 'torus': return { radius: 1, tube: 0.2, radialSegments: 16, tubularSegments: 32 };
    case 'gear': return { radius: 1, height: 0.4, teeth: 12 };
    default: return {};
  }
};

const findTopLevelParentId = (objectId: string, objects: Record<string, CadObject>): string => {
  let current = objects[objectId];
  if (!current || !current.parentId) return objectId;
  while (current.parentId && objects[current.parentId]) {
    current = objects[current.parentId];
  }
  return current.id;
};

const expandWorldBBox = (objId: string, objects: Record<string, CadObject>, parentMatrix: THREE.Matrix4, box: THREE.Box3, rootOffset: THREE.Vector3 = new THREE.Vector3(0,0,0)) => {
    const obj = objects[objId];
    if (!obj) return;

    const position = new THREE.Vector3(...obj.transform.position);
    if(parentMatrix.equals(new THREE.Matrix4())) {
        position.add(rootOffset);
    }

    const localMatrix = new THREE.Matrix4().compose(
        position,
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...obj.transform.rotation)),
        new THREE.Vector3(...obj.transform.scale)
    );

    const worldMatrix = parentMatrix.clone().multiply(localMatrix);

    if (obj.type !== 'group') {
        const props = obj.properties;
        const baseWidth = props.width ?? props.radius ?? 1;
        const baseHeight = props.height ?? (props.radius ? props.radius * 2 : 1);
        const baseDepth = props.depth ?? props.radius ?? 1;

        const geometryBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(baseWidth, baseHeight, baseDepth)
        );

        geometryBox.applyMatrix4(worldMatrix);
        box.union(geometryBox);
    }

    Object.values(objects).forEach(child => {
        if (child.parentId === objId) {
            expandWorldBBox(child.id, objects, worldMatrix, box);
        }
    });
};


export const useCadStore = createWithEqualityFn<State & HistoryState & Actions>((set, get) => ({
  // Initial State
  objects: {},
  selectedObjectIds: [],
  primedForMoveId: null,
  clipboard: null,
  cameraControlsRef: null,
  cameraRef: null,
  screenshotFunction: null,
  viewCubeLabels: { x: 'RIGHT', y: 'TOP', z: 'FRONT' },
  history: { past: [], future: [] },
  pendingShapeType: null,
  pendingShapeColor: '#cccccc',
  snapSize: 0.1,
  lastMousePosition: [0, 0, 0],

  // Getters & Simple Setters
  setPrimedForMove: (id) => set({ primedForMoveId: id }),
  getShapeDefaultProperties: getDefaultProperties,
  setSnapSize: (size) => set({ snapSize: size }),
  setScreenshotFunction: (func) => set({ screenshotFunction: func }),
  setCameraRef: (ref) => set({ cameraRef: ref }),
  setCameraControlsRef: (ref) => set({ cameraControlsRef: ref }),
  recordInteraction: () => recordHistory(set, get),
  setLastMousePosition: (position) => set({ lastMousePosition: position }),

  setPendingShape: (type, color) => {
    set({ pendingShapeType: type, ...(color && { pendingShapeColor: color }) });
  },

  addObject: (position) => {
    const { pendingShapeType, pendingShapeColor } = get();
    if (!pendingShapeType) return;
    recordHistory(set, get);
    set(produce((draft: State) => {
      const newProperties = getDefaultProperties(pendingShapeType);

      let tempHeight = 1;
      if (newProperties.height) tempHeight = newProperties.height;
      else if (newProperties.radius) tempHeight = newProperties.radius * 2;
      
      position[1] = tempHeight / 2;

      const newObject: CadObject = {
        id: THREE.MathUtils.generateUUID(),
        type: pendingShapeType,
        transform: { position, rotation: [0, 0, 0], scale: [1, 1, 1] },
        color: pendingShapeColor,
        metalness: 0.1,
        roughness: 0.8,
        isHole: false,
        properties: newProperties,
        parentId: null,
      };
      draft.objects[newObject.id] = newObject;
      draft.selectedObjectIds = [newObject.id];
      draft.pendingShapeType = null;
    }));
  },

  selectObject: (id, shiftKey = false) => {
    const topLevelId = id ? findTopLevelParentId(id, get().objects) : null;
    set(produce((draft: State) => {
      draft.primedForMoveId = null;
      if (!topLevelId) {
        draft.selectedObjectIds = [];
      } else if (shiftKey) {
        const index = draft.selectedObjectIds.indexOf(topLevelId);
        if (index > -1) draft.selectedObjectIds.splice(index, 1);
        else draft.selectedObjectIds.push(topLevelId);
      } else {
        if (draft.selectedObjectIds.includes(topLevelId) && draft.selectedObjectIds.length === 1) return;
        draft.selectedObjectIds = [topLevelId];
      }
    }));
  },

  setObjectPosition: (id, position) => {
    set(produce((draft: State) => {
      if (draft.objects[id]) draft.objects[id].transform.position = position;
    }));
  },
  
  setObjectRotation: (id, rotation) => {
    set(produce((draft: State) => {
      if (draft.objects[id]) draft.objects[id].transform.rotation = rotation;
    }));
  },

  setObjectScale: (id, scale) => {
    set(produce((draft: State) => {
      if (draft.objects[id]) draft.objects[id].transform.scale = scale;
    }));
  },

  setObjectTransform: (id, position, rotation, scale) => {
    set(produce((draft: State) => {
      if (draft.objects[id]) draft.objects[id].transform = { position, rotation, scale };
    }));
  },
  
  setObjectDimensions: (id, dimension, newDimensionValue) => {
    recordHistory(set, get);
    set(produce((draft: State) => {
        const obj = draft.objects[id];
        if (!obj) return;
        
        if (obj.type === 'gear') {
            if (dimension === 'height') {
                // Only change height, keep other proportions
                obj.properties.height = newDimensionValue;
            } else if (dimension === 'radius') {
                // Change radius and adjust teeth count proportionally
                // Note: The value passed might be a "diameter" from the handle, so we divide by 2
                const newRadius = newDimensionValue / 2;
                const ratio = newRadius / (obj.properties.radius || 1);
                obj.properties.radius = newRadius;
                obj.properties.teeth = Math.max(6, Math.min(32, 
                    Math.round((obj.properties.teeth || 12) * Math.sqrt(ratio))
                ));
            }
             // Always reset scale for gears when dimensions change
            obj.transform.scale = [1, 1, 1];
        } else {
            // Standard behavior for other shapes
            if (obj.properties[dimension as keyof ShapeProperties] !== undefined) {
                (obj.properties as any)[dimension] = newDimensionValue;
                if (dimension === 'width' || dimension === 'height' || dimension === 'depth') {
                  if (obj.properties.radius !== undefined) {
                    obj.properties.radius = newDimensionValue / 2;
                  }
                }
                obj.transform.scale = [1, 1, 1];
            }
        }
    }));
  },

  updateObjectMaterial: (id, key, value) => {
    set(produce((draft: State) => {
      if (draft.objects[id]) draft.objects[id][key] = value;
    }));
  },

  updateObjectColor: (id, newColor) => {
    recordHistory(set, get);
    set(produce((draft: State) => {
      if (draft.objects[id]) draft.objects[id].color = newColor;
    }));
  },

  setObjectHole: (id, isHole) => {
    recordHistory(set, get);
    set(produce((draft: State) => {
      if (draft.objects[id]) draft.objects[id].isHole = isHole;
    }));
  },

  updateObjectProperties: (id, newProperties) => {
    recordHistory(set, get);
    set(produce((draft: State) => {
      if (draft.objects[id]) Object.assign(draft.objects[id].properties, newProperties);
    }));
  },

  deleteSelectedObjects: () => {
    if (get().selectedObjectIds.length === 0) return;
    recordHistory(set, get);
    set(produce((draft: State) => {
      const idsToDelete = new Set(draft.selectedObjectIds);
      draft.selectedObjectIds.forEach(id => {
        const findChildren = (parentId: string) => {
          Object.values(draft.objects).forEach(obj => {
            if (obj.parentId === parentId) { idsToDelete.add(obj.id); findChildren(obj.id); }
          });
        };
        findChildren(id);
      });
      idsToDelete.forEach(id => { delete draft.objects[id]; });
      draft.selectedObjectIds = [];
    }));
  },

  mirrorSelectedObjects: () => {
    if (get().selectedObjectIds.length === 0) return;
    recordHistory(set, get);
    set(produce((draft: State) => {
      draft.selectedObjectIds.forEach(id => {
        const obj = draft.objects[id];
        if (obj) obj.transform.scale[0] *= -1;
      });
    }));
  },

  groupSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    const topLevelSelection = selectedObjectIds.filter(id => objects[id] && !objects[id].parentId);
    if (topLevelSelection.length < 2) return;
    recordHistory(set, get);
    set(produce((draft: State) => {
      const center = new THREE.Vector3();
      topLevelSelection.forEach(id => center.add(new THREE.Vector3(...objects[id].transform.position)));
      center.divideScalar(topLevelSelection.length);
      const groupId = THREE.MathUtils.generateUUID();
      const groupObject: CadObject = {
        id: groupId, type: 'group', transform: { position: center.toArray(), rotation: [0, 0, 0], scale: [1, 1, 1] },
        color: '#ffffff', metalness: 0, roughness: 1, isHole: false, properties: {}, parentId: null
      };
      draft.objects[groupId] = groupObject;
      topLevelSelection.forEach(id => {
        const obj = draft.objects[id];
        const relativePos = new THREE.Vector3(...obj.transform.position).sub(center);
        obj.transform.position = relativePos.toArray();
        obj.parentId = groupId;
      });
      draft.selectedObjectIds = [groupId];
    }));
  },

  ungroupObjects: () => {
    const { selectedObjectIds, objects } = get();
    const groupsToUngroup = selectedObjectIds.filter(id => objects[id]?.type === 'group');
    if (groupsToUngroup.length === 0) return;
    recordHistory(set, get);
    set(produce((draft: State) => {
      const newSelection: string[] = [];
      groupsToUngroup.forEach(groupId => {
        const group = draft.objects[groupId];
        if (!group) return;
        const groupTransform = new THREE.Matrix4().compose(
          new THREE.Vector3(...group.transform.position),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(...group.transform.rotation)),
          new THREE.Vector3(...group.transform.scale)
        );
        Object.values(draft.objects).forEach(obj => {
          if (obj.parentId === groupId) {
            const childLocalTransform = new THREE.Matrix4().compose(
              new THREE.Vector3(...obj.transform.position),
              new THREE.Quaternion().setFromEuler(new THREE.Euler(...obj.transform.rotation)),
              new THREE.Vector3(...obj.transform.scale)
            );
            const childWorldTransform = groupTransform.clone().multiply(childLocalTransform);
            const pos = new THREE.Vector3(), rot = new THREE.Quaternion(), scale = new THREE.Vector3();
            childWorldTransform.decompose(pos, rot, scale);
            obj.parentId = null;
            obj.transform = {
              position: pos.toArray() as [number, number, number],
              rotation: new THREE.Euler().setFromQuaternion(rot).toArray().slice(0, 3) as [number, number, number],
              scale: scale.toArray() as [number, number, number]
            };
            newSelection.push(obj.id);
          }
        });
        delete draft.objects[groupId];
      });
      draft.selectedObjectIds = newSelection;
    }));
  },

  copySelectedObjects: () => {
    const { objects, selectedObjectIds } = get();
    if (selectedObjectIds.length === 0) return;
    const clipboardData: Record<string, CadObject> = {};
    const idsToCopy = new Set<string>();
    const queue = [...selectedObjectIds];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (objects[currentId]) {
        idsToCopy.add(currentId);
        Object.values(objects).forEach(obj => {
          if (obj.parentId === currentId) queue.push(obj.id);
        });
      }
    }
    idsToCopy.forEach(id => { clipboardData[id] = JSON.parse(JSON.stringify(objects[id])); });
    set({ clipboard: clipboardData });
  },

  pasteObjects: () => {
    const { clipboard, lastMousePosition } = get();
    if (!clipboard) return;
    recordHistory(set, get);
    set(produce((draft: State) => {
      const idMap: Record<string, string> = {};
      const newTopLevelIds: string[] = [];
      const topLevelInClipboard: CadObject[] = [];

      Object.values(clipboard).forEach(objInClipboard => {
        const newId = THREE.MathUtils.generateUUID();
        idMap[objInClipboard.id] = newId;
        const newObject = { ...JSON.parse(JSON.stringify(objInClipboard)), id: newId };
        draft.objects[newId] = newObject;
        if (!objInClipboard.parentId || !clipboard[objInClipboard.parentId]) {
          topLevelInClipboard.push(objInClipboard);
          newTopLevelIds.push(newId);
        }
      });

      Object.values(idMap).forEach(newId => {
        const obj = draft.objects[newId];
        if (obj.parentId && idMap[obj.parentId]) {
          obj.parentId = idMap[obj.parentId];
        } else {
          obj.parentId = null;
        }
      });

      const originalCenter = new THREE.Vector3();
      if (topLevelInClipboard.length > 0) {
        topLevelInClipboard.forEach(obj => originalCenter.add(new THREE.Vector3(...obj.transform.position)));
        originalCenter.divideScalar(topLevelInClipboard.length);
      }

      const targetPosition = new THREE.Vector3(...lastMousePosition);
      const offset = targetPosition.clone().sub(originalCenter);
      
      newTopLevelIds.forEach(id => {
        const obj = draft.objects[id];
        const newPos = new THREE.Vector3(...obj.transform.position).add(offset);
        obj.transform.position = newPos.toArray();
      });

      const finalBBox = new THREE.Box3();
      newTopLevelIds.forEach(id => expandWorldBBox(id, draft.objects, new THREE.Matrix4(), finalBBox));

      if (!finalBBox.isEmpty()) {
        const yAdjustment = -finalBBox.min.y;
        newTopLevelIds.forEach(id => {
          draft.objects[id].transform.position[1] += yAdjustment;
        });
      }

      draft.selectedObjectIds = newTopLevelIds;
    }));
  },

  duplicateSelectedObjects: () => {
    const { selectedObjectIds, objects, snapSize } = get();
    if (selectedObjectIds.length === 0) return;

    get().copySelectedObjects();
    const { clipboard } = get();
    if (!clipboard) return;
    
    recordHistory(set, get);

    const obstacleIds = Object.keys(objects).filter(id => objects[id].parentId === null);
    const obstacleBBoxes = obstacleIds.map(id => {
        const box = new THREE.Box3();
        expandWorldBBox(id, objects, new THREE.Matrix4(), box);
        return box;
    });

    set(produce((draft: State) => {
        const idMap: Record<string, string> = {};
        const newTopLevelIds: string[] = [];

        Object.values(clipboard).forEach(objInClipboard => {
            const newId = THREE.MathUtils.generateUUID();
            idMap[objInClipboard.id] = newId;
            const newObject = JSON.parse(JSON.stringify(objInClipboard));
            newObject.id = newId;
            draft.objects[newId] = newObject;

            if (!objInClipboard.parentId || !clipboard[objInClipboard.parentId]) {
                newTopLevelIds.push(newId);
            }
        });

        Object.values(idMap).forEach(newId => {
            const obj = draft.objects[newId];
            if (obj.parentId && idMap[obj.parentId]) {
                obj.parentId = idMap[obj.parentId];
            } else {
                obj.parentId = null;
            }
        });

        const originalBBox = new THREE.Box3();
        selectedObjectIds.forEach(id => expandWorldBBox(id, objects, new THREE.Matrix4(), originalBBox));
        const stepSize = originalBBox.getSize(new THREE.Vector3());
        stepSize.x = Math.max(stepSize.x, snapSize);

        const PADDING = snapSize * 2; 

        let finalOffset = new THREE.Vector3(stepSize.x + PADDING, 0, 0);
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const candidateBBox = new THREE.Box3();
            newTopLevelIds.forEach(id => {
                expandWorldBBox(id, draft.objects, new THREE.Matrix4(), candidateBBox, finalOffset);
            });

            let collisionFound = false;
            for (const obstacleBBox of obstacleBBoxes) {
                const paddedObstacleBBox = obstacleBBox.clone().expandByScalar(PADDING / 2);

                if (candidateBBox.intersectsBox(paddedObstacleBBox)) {
                    collisionFound = true;
                    break;
                }
            }

            if (!collisionFound) break;

            finalOffset.x += stepSize.x / 2;
            attempts++;
        }
        
        newTopLevelIds.forEach(id => {
            const obj = draft.objects[id];
            const newPos = new THREE.Vector3(...obj.transform.position).add(finalOffset);
            obj.transform.position = newPos.toArray();
        });

        const finalBBox = new THREE.Box3();
        newTopLevelIds.forEach(id => expandWorldBBox(id, draft.objects, new THREE.Matrix4(), finalBBox));

        if (!finalBBox.isEmpty()) {
            const yAdjustment = -finalBBox.min.y;
            newTopLevelIds.forEach(id => {
                draft.objects[id].transform.position[1] += yAdjustment;
            });
        }
        draft.selectedObjectIds = newTopLevelIds;
    }));
  },

  undo: () => set(state => {
    if (state.history.past.length === 0) return state;
    const previousState = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, state.history.past.length - 1);
    const { history, ...currentState } = state;
    return { ...previousState, history: { past: newPast, future: [{ ...currentState, history: state.history }, ...history.future] } };
  }),

  redo: () => set(state => {
    if (state.history.future.length === 0) return state;
    const nextState = state.history.future[0];
    const newFuture = state.history.future.slice(1);
    const { history, ...currentState } = state;
    return { ...nextState, history: { past: [...history.past, { ...currentState, history: state.history }], future: newFuture } };
  }),

  exportProject: () => {
    const { objects } = get();
    const projectData: ProjectFile = { objects };
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fibercad-design.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  loadProject: (jsonString) => {
    try {
      const data: ProjectFile = JSON.parse(jsonString);
      if (typeof data.objects !== 'object' || data.objects === null) throw new Error('Invalid project file');
      recordHistory(set, get);
      const validatedObjects = Object.fromEntries(
        Object.entries(data.objects).map(([id, obj]) => [
          id, { ...obj, metalness: obj.metalness ?? 0, roughness: obj.roughness ?? 1, isHole: obj.isHole ?? false,
            properties: obj.properties || getDefaultProperties(obj.type), parentId: obj.parentId ?? null }
        ])
      );
      set({ objects: validatedObjects, selectedObjectIds: [] });
    } catch (error) { console.error("Failed to parse project file:", error); alert("Error: Could not load the project file."); }
  },

  triggerScreenshot: () => get().screenshotFunction?.(),
  
  zoomToFit: () => {
    const { cameraControlsRef, objects, selectedObjectIds } = get();
    if (!cameraControlsRef?.current || Object.keys(objects).length === 0) return;

    const idsToFit = selectedObjectIds.length > 0 ? selectedObjectIds : Object.keys(objects);
    const box = new THREE.Box3();

    idsToFit.forEach(id => {
      expandWorldBBox(id, objects, new THREE.Matrix4(), box);
    });

    if (box.isEmpty()) return;

    cameraControlsRef.current.fitToBox(box, true, {
      paddingLeft: 0.2, paddingRight: 0.2, paddingBottom: 0.2, paddingTop: 0.2
    });
  },

  setOrthographicView: (direction) => {
    const { cameraControlsRef, cameraRef } = get();
    if (!cameraControlsRef?.current || !cameraRef?.current) return;

    const camera = cameraRef.current;
    const controls = cameraControlsRef.current;
    const target = new THREE.Vector3();
    controls.getTarget(target);

    let position = new THREE.Vector3();
    let up = new THREE.Vector3(0, 1, 0);

    switch (direction) {
      case 'TOP': position.set(target.x, target.y + 10, target.z); up.set(0, 0, -1); break;
      case 'BOTTOM': position.set(target.x, target.y - 10, target.z); up.set(0, 0, 1); break;
      case 'LEFT': position.set(target.x - 10, target.y, target.z); break;
      case 'RIGHT': position.set(target.x + 10, target.y, target.z); break;
      case 'FRONT': position.set(target.x, target.y, target.z + 10); break;
      case 'BACK': position.set(target.x, target.y, target.z - 10); break;
    }

    new TWEEN.Tween(camera.position).to(position, 500).easing(TWEEN.Easing.Quadratic.Out).start();
    new TWEEN.Tween(camera.up).to(up, 500).easing(TWEEN.Easing.Quadratic.Out).onUpdate(() => camera.lookAt(target)).start();

    controls.target.copy(target);
    controls.update();
  },

  updateViewCube: () => {
    const { cameraRef } = get();
    if (!cameraRef?.current) return;

    const camera = cameraRef.current;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.normalize();

    const absX = Math.abs(direction.x);
    const absY = Math.abs(direction.y);
    const absZ = Math.abs(direction.z);

    let xLabel: ViewDirection = 'RIGHT';
    let yLabel: ViewDirection = 'TOP';
    let zLabel: ViewDirection = 'FRONT';

    if (absX > absY && absX > absZ) { xLabel = direction.x > 0 ? 'RIGHT' : 'LEFT';
    } else if (absY > absX && absY > absZ) { yLabel = direction.y > 0 ? 'TOP' : 'BOTTOM';
    } else if (absZ > absX && absZ > absY) { zLabel = direction.z > 0 ? 'FRONT' : 'BACK'; }

    set({ viewCubeLabels: { x: xLabel, y: yLabel, z: zLabel } });
  },
}), shallow);