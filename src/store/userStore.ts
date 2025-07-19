import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AppState {
 isDarkMode: boolean;
 toggleDarkMode: () => void;
 sidebarCollapsed: boolean;
 setSidebarCollapsed: (collapsed: boolean) => void;
 activeSection: string;
 setActiveSection: (section: string) => void;
 user: {
  name: string;
  email: string;
  avatar?: string;
 } | null;
 setUser: (user: AppState["user"]) => void;
}

export const useAppStore = create<AppState>()(
 devtools(
  persist(
   (set) => ({
    isDarkMode: false,
    toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    sidebarCollapsed: false,
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    activeSection: "dashboard",
    setActiveSection: (section) => set({ activeSection: section }),
    user: {
     name: "Alex Johnson",
     email: "alex@designstudio.com",
    },
    setUser: (user) => set({ user }),
   }),
   {
    name: "app-storage",
   }
  ),
  {
   name: "app-store",
  }
 )
);
