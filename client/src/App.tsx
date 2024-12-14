// App.tsx
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// Get this from your Clerk Dashboard
const PUBLISHABLE_KEY =
  "pk_test_Y3JlZGlibGUtZWdyZXQtNTYuY2xlcmsuYWNjb3VudHMuZGV2JA";

const App = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ClerkProvider>
  );
};

export default App;
