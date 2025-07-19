import { create } from "zustand";
import { Shape } from "../types";

interface EditorAction {
 type:
  | "ADD_SHAPE"
  | "REMOVE_SHAPE"
  | "UPDATE_SHAPE"
  | "DUPLICATE_SHAPE"
  | "GROUP_SHAPES"
  | "UNGROUP_SHAPES";
 payload: any;
 timestamp: number;
}

interface EditorState {
 shapes: Shape[];
 selectedShapeId: string | null;
 selectedShapeIds: string[];
 snapGridSize: number;
 showGrid: boolean;
 transformMode: "translate" | "rotate" | "scale";
 clipboard: Shape[];
 actionHistory: EditorAction[];
 historyIndex: number;
 groups: { [key: string]: string[] };

 // Shape operations
 addShape: (shape: Omit<Shape, "id">) => void;
 removeShape: (id: string) => void;
 selectShape: (id: string | null) => void;
 selectMultipleShapes: (ids: string[]) => void;
 updateShape: (id: string, updates: Partial<Shape>) => void;
 duplicateShape: (id: string) => void;

 // Clipboard operations
 copySelectedShapes: () => void;
 pasteShapes: () => void;
 cutSelectedShapes: () => void;

 // Group operations
 groupSelectedShapes: () => void;
 ungroupSelectedShapes: () => void;

 // Alignment operations
 alignShapes: (
  alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
 ) => void;
 distributeShapes: (direction: "horizontal" | "vertical") => void;

 // History operations
 undo: () => void;
 redo: () => void;
 addToHistory: (action: EditorAction) => void;

 // Utility operations
 setSnapGridSize: (size: number) => void;
 toggleGrid: () => void;
 setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
 clearAll: () => void;
 deleteSelectedShapes: () => void;
 resetCamera: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
 shapes: [],
 selectedShapeId: null,
 selectedShapeIds: [],
 snapGridSize: 1,
 showGrid: true,
 transformMode: "translate",
 clipboard: [],
 actionHistory: [],
 historyIndex: -1,
 groups: {},

 addShape: (shape) => {
  const newShape: Shape = {
   ...shape,
   id: Math.random().toString(36).substr(2, 9),
  };

  const action: EditorAction = {
   type: "ADD_SHAPE",
   payload: newShape,
   timestamp: Date.now(),
  };

  set((state) => ({
   shapes: [...state.shapes, newShape],
   selectedShapeId: newShape.id,
   selectedShapeIds: [newShape.id],
  }));

  get().addToHistory(action);
 },

 removeShape: (id) => {
  const state = get();
  const shapeToRemove = state.shapes.find((s) => s.id === id);

  if (shapeToRemove) {
   const action: EditorAction = {
    type: "REMOVE_SHAPE",
    payload: shapeToRemove,
    timestamp: Date.now(),
   };

   set((state) => ({
    shapes: state.shapes.filter((shape) => shape.id !== id),
    selectedShapeId:
     state.selectedShapeId === id ? null : state.selectedShapeId,
    selectedShapeIds: state.selectedShapeIds.filter((sid) => sid !== id),
   }));

   get().addToHistory(action);
  }
 },

 selectShape: (id) => {
  set({
   selectedShapeId: id,
   selectedShapeIds: id ? [id] : [],
  });
 },

 selectMultipleShapes: (ids) => {
  set({
   selectedShapeIds: ids,
   selectedShapeId: ids.length === 1 ? ids[0] : null,
  });
 },

 updateShape: (id, updates) => {
  const state = get();
  const originalShape = state.shapes.find((s) => s.id === id);

  if (originalShape) {
   const action: EditorAction = {
    type: "UPDATE_SHAPE",
    payload: { id, original: originalShape, updates },
    timestamp: Date.now(),
   };

   set((state) => ({
    shapes: state.shapes.map((shape) =>
     shape.id === id ? { ...shape, ...updates } : shape
    ),
   }));

   get().addToHistory(action);
  }
 },

 duplicateShape: (id) => {
  const state = get();
  const shapeToDuplicate = state.shapes.find((shape) => shape.id === id);
  if (shapeToDuplicate) {
   const newShape: Shape = {
    ...shapeToDuplicate,
    id: Math.random().toString(36).substr(2, 9),
    position: [
     shapeToDuplicate.position[0] + 2,
     shapeToDuplicate.position[1],
     shapeToDuplicate.position[2] + 2,
    ],
   };

   const action: EditorAction = {
    type: "DUPLICATE_SHAPE",
    payload: { original: shapeToDuplicate, duplicate: newShape },
    timestamp: Date.now(),
   };

   set((state) => ({
    shapes: [...state.shapes, newShape],
    selectedShapeId: newShape.id,
    selectedShapeIds: [newShape.id],
   }));

   get().addToHistory(action);
  }
 },

 copySelectedShapes: () => {
  const state = get();
  const selectedShapes = state.shapes.filter((shape) =>
   state.selectedShapeIds.includes(shape.id)
  );
  set({ clipboard: selectedShapes });
 },

 pasteShapes: () => {
  const state = get();
  if (state.clipboard.length > 0) {
   const newShapes = state.clipboard.map((shape) => ({
    ...shape,
    id: Math.random().toString(36).substr(2, 9),
    position: [
     shape.position[0] + 2,
     shape.position[1],
     shape.position[2] + 2,
    ] as [number, number, number],
   }));

   set((state) => ({
    shapes: [...state.shapes, ...newShapes],
    selectedShapeIds: newShapes.map((s) => s.id),
    selectedShapeId: newShapes.length === 1 ? newShapes[0].id : null,
   }));
  }
 },

 cutSelectedShapes: () => {
  const state = get();
  get().copySelectedShapes();
  state.selectedShapeIds.forEach((id) => get().removeShape(id));
 },

 groupSelectedShapes: () => {
  const state = get();
  if (state.selectedShapeIds.length > 1) {
   const groupId = Math.random().toString(36).substr(2, 9);
   set((state) => ({
    groups: {
     ...state.groups,
     [groupId]: state.selectedShapeIds,
    },
   }));
  }
 },

 ungroupSelectedShapes: () => {
  const state = get();
  const groupToUngroup = Object.entries(state.groups).find(([_, shapeIds]) =>
   shapeIds.some((id) => state.selectedShapeIds.includes(id))
  );

  if (groupToUngroup) {
   const [groupId] = groupToUngroup;
   set((state) => {
    const newGroups = { ...state.groups };
    delete newGroups[groupId];
    return { groups: newGroups };
   });
  }
 },

 alignShapes: (alignment) => {
  const state = get();
  const selectedShapes = state.shapes.filter((shape) =>
   state.selectedShapeIds.includes(shape.id)
  );

  if (selectedShapes.length < 2) return;

  let referenceValue: number;

  switch (alignment) {
   case "left":
    referenceValue = Math.min(...selectedShapes.map((s) => s.position[0]));
    selectedShapes.forEach((shape) => {
     get().updateShape(shape.id, {
      position: [referenceValue, shape.position[1], shape.position[2]],
     });
    });
    break;
   case "right":
    referenceValue = Math.max(...selectedShapes.map((s) => s.position[0]));
    selectedShapes.forEach((shape) => {
     get().updateShape(shape.id, {
      position: [referenceValue, shape.position[1], shape.position[2]],
     });
    });
    break;
   case "center":
    const avgX =
     selectedShapes.reduce((sum, s) => sum + s.position[0], 0) /
     selectedShapes.length;
    selectedShapes.forEach((shape) => {
     get().updateShape(shape.id, {
      position: [avgX, shape.position[1], shape.position[2]],
     });
    });
    break;
   case "top":
    referenceValue = Math.max(...selectedShapes.map((s) => s.position[1]));
    selectedShapes.forEach((shape) => {
     get().updateShape(shape.id, {
      position: [shape.position[0], referenceValue, shape.position[2]],
     });
    });
    break;
   case "bottom":
    referenceValue = Math.min(...selectedShapes.map((s) => s.position[1]));
    selectedShapes.forEach((shape) => {
     get().updateShape(shape.id, {
      position: [shape.position[0], referenceValue, shape.position[2]],
     });
    });
    break;
   case "middle":
    const avgY =
     selectedShapes.reduce((sum, s) => sum + s.position[1], 0) /
     selectedShapes.length;
    selectedShapes.forEach((shape) => {
     get().updateShape(shape.id, {
      position: [shape.position[0], avgY, shape.position[2]],
     });
    });
    break;
  }
 },

 distributeShapes: (direction) => {
  const state = get();
  const selectedShapes = state.shapes
   .filter((shape) => state.selectedShapeIds.includes(shape.id))
   .sort((a, b) =>
    direction === "horizontal"
     ? a.position[0] - b.position[0]
     : a.position[2] - b.position[2]
   );

  if (selectedShapes.length < 3) return;

  const first = selectedShapes[0];
  const last = selectedShapes[selectedShapes.length - 1];
  const totalDistance =
   direction === "horizontal"
    ? last.position[0] - first.position[0]
    : last.position[2] - first.position[2];
  const step = totalDistance / (selectedShapes.length - 1);

  selectedShapes.forEach((shape, index) => {
   if (index === 0 || index === selectedShapes.length - 1) return;

   const newPosition =
    direction === "horizontal"
     ? [first.position[0] + step * index, shape.position[1], shape.position[2]]
     : [shape.position[0], shape.position[1], first.position[2] + step * index];

   get().updateShape(shape.id, {
    position: newPosition as [number, number, number],
   });
  });
 },

 undo: () => {
  const state = get();
  if (state.historyIndex >= 0) {
   const action = state.actionHistory[state.historyIndex];

   // Reverse the action
   switch (action.type) {
    case "ADD_SHAPE":
     set((state) => ({
      shapes: state.shapes.filter((s) => s.id !== action.payload.id),
      historyIndex: state.historyIndex - 1,
     }));
     break;
    case "REMOVE_SHAPE":
     set((state) => ({
      shapes: [...state.shapes, action.payload],
      historyIndex: state.historyIndex - 1,
     }));
     break;
    case "UPDATE_SHAPE":
     set((state) => ({
      shapes: state.shapes.map((s) =>
       s.id === action.payload.id ? action.payload.original : s
      ),
      historyIndex: state.historyIndex - 1,
     }));
     break;
   }
  }
 },

 redo: () => {
  const state = get();
  if (state.historyIndex < state.actionHistory.length - 1) {
   const nextIndex = state.historyIndex + 1;
   const action = state.actionHistory[nextIndex];

   // Reapply the action
   switch (action.type) {
    case "ADD_SHAPE":
     set((state) => ({
      shapes: [...state.shapes, action.payload],
      historyIndex: nextIndex,
     }));
     break;
    case "REMOVE_SHAPE":
     set((state) => ({
      shapes: state.shapes.filter((s) => s.id !== action.payload.id),
      historyIndex: nextIndex,
     }));
     break;
    case "UPDATE_SHAPE":
     set((state) => ({
      shapes: state.shapes.map((s) =>
       s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
      ),
      historyIndex: nextIndex,
     }));
     break;
   }
  }
 },

 addToHistory: (action) => {
  set((state) => {
   const newHistory = state.actionHistory.slice(0, state.historyIndex + 1);
   newHistory.push(action);

   // Limit history to 50 actions
   if (newHistory.length > 50) {
    newHistory.shift();
   }

   return {
    actionHistory: newHistory,
    historyIndex: newHistory.length - 1,
   };
  });
 },

 deleteSelectedShapes: () => {
  const state = get();
  state.selectedShapeIds.forEach((id) => get().removeShape(id));
  set({ selectedShapeIds: [], selectedShapeId: null });
 },

 resetCamera: () => {
  // This will be handled by the Canvas3D component
  window.dispatchEvent(new CustomEvent("resetCamera"));
 },

 setSnapGridSize: (size) => {
  set({ snapGridSize: size });
 },

 toggleGrid: () => {
  set((state) => ({ showGrid: !state.showGrid }));
 },

 setTransformMode: (mode) => {
  set({ transformMode: mode });
 },

 clearAll: () => {
  set({
   shapes: [],
   selectedShapeId: null,
   selectedShapeIds: [],
   actionHistory: [],
   historyIndex: -1,
   groups: {},
  });
 },
}));
