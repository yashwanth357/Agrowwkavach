// src/App.tsx
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
const App = () => {
  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        navigate={(to) => (window.location.href = to)}
      >
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  );
};

export default App;
