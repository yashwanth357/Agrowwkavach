import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

const LogoutButton = () => {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
