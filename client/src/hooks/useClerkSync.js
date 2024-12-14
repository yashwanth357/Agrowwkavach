// src/hooks/useClerkSync.js
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const useClerkSync = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const syncUserWithDatabase = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const response = await axios.post(
            "http://localhost:5003/api/profile",
            {
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              // Set default values for required fields
              location: "Not specified",
              farmSize: "0",
              mainCrops: ["None"],
              farmingType: "conventional",
            },
          );

          if (!response.data) {
            throw new Error("Failed to sync user data");
          }
        } catch (error) {
          console.error("Error syncing user:", error);
          setSyncError(error.message);
        }
      }
    };

    syncUserWithDatabase();
  }, [isLoaded, isSignedIn, user]);

  return { syncError };
};

export default useClerkSync;
