import { useState, useEffect } from "react";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import HomePage from "./pages/HomePage";
import TimelinePage from "./pages/TimelinePage";
import ProfilePage from "./pages/ProfilePage";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

const ClerkUserSync = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const syncUserWithDatabase = async () => {
      if (!syncAttempted && isLoaded && isSignedIn && user) {
        try {
          const userData = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            location: "", // Can be updated later in profile
            farmSize: "", // Can be updated later in profile
            mainCrops: [], // Can be updated later in profile
            farmingType: "", // Can be updated later in profile
          };

          // Make API call to your backend
          const response = await fetch("http://localhost:5003/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            throw new Error("Failed to sync user data");
          }

          setSyncAttempted(true);
        } catch (error) {
          console.error("Error syncing user:", error);
          setSyncError(error.message);
        }
      }
    };

    syncUserWithDatabase();
  }, [isLoaded, isSignedIn, user, syncAttempted]);

  if (syncError) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error syncing user data: {syncError}</p>
        <button
          onClick={() => {
            setSyncError(null);
            setSyncAttempted(false);
          }}
          className="underline ml-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
};

const PublicOnlyRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function Routes() {
  return (
    <>
      <ClerkUserSync />
      <RouterRoutes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/timeline"
          element={
            <PrivateRoute>
              <TimelinePage />
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
        <Route
          path="/sign-in/*"
          element={
            <PublicOnlyRoute>
              <Navigate to="/" replace />
            </PublicOnlyRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </>
  );
}

export default Routes;
