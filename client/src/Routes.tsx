import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import HomePage from "./pages/HomePage";
import TimelinePage from "./pages/TimelinePage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";

// Remove LoadingScreen since we want to minimize loading states
const PrivateRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Return null instead of loading screen
  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Modified to minimize unnecessary API calls
const PublicOnlyRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function Routes() {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      {/* Protected Routes */}
      <Route
        path="/timeline"
        element={
          <PrivateRoute>
            <TimelinePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <ChatPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      {/* Auth Routes */}
      <Route
        path="/sign-in/*"
        element={
          <PublicOnlyRoute>
            <Navigate to="/" replace />
          </PublicOnlyRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
}

export default Routes;
