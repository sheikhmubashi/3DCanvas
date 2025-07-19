// src/main.tsx (CORRECTED)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

// Import your components
import App from "./App";
import { Dashboard } from "@/components/dashboard";
import { ErrorPage } from "./components/error-page";
import { NotFound } from "./components/not-found";
// --- SUGGESTION: Rename EditorPage.tsx to DesignPage.tsx to match the route ---
// --- I've used DesignPage here for clarity. ---
import DesignPage from "./pages/DesignPage"; 

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Create router with new data router API
const router = createBrowserRouter([
  {
    // --- THIS IS YOUR MAIN APP & DASHBOARD LAYOUT ---
    // All routes inside 'children' will have the App.tsx layout (header, sidebar, etc.)
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      // --- The "3d-design" route has been MOVED OUT of here ---
      {
        path: "circuits",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Circuits</h1>
            <p>Coming soon...</p>
          </div>
        ),
      },
      {
        path: "codeblocks",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold">Codeblocks</h1>
            <p>Coming soon...</p>
          </div>
        ),
      },
      // ... all your other child routes ...
    ],
  },
  
  // --- THIS IS THE NEW, STANDALONE ROUTE FOR THE FULL-SCREEN EDITOR ---
  // It is now a sibling to the '/' route, so it does NOT get the App.tsx layout.
  {
    path: "3d-design",
    element: <DesignPage />,
    errorElement: <ErrorPage />,
  },
  
  // --- YOUR NOT-FOUND ROUTE (UNCHANGED) ---
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);