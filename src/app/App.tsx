import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import { router } from "./routes";

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1C1C1E",
            border: "1px solid #2C2C2E",
            color: "#fff",
          },
        }}
      />
    </AppProvider>
  );
}