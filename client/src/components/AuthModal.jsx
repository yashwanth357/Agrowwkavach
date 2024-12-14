import React, { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AuthModal = ({ isOpen, onClose, isLogin: initialIsLogin, onSuccess }) => {
  const { signIn, isLoading: isSigningIn } = useSignIn();
  const { signUp, isLoading: isSigningUp } = useSignUp();
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    farmSize: "",
    mainCrops: "",
    farmingType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // Handle Sign In
        const result = await signIn.create({
          identifier: formData.email,
          password: formData.password,
        });

        if (result.status === "complete") {
          onSuccess();
          onClose();
        }
      } else {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        // Handle Sign Up
        const signUpResult = await signUp.create({
          emailAddress: formData.email,
          password: formData.password,
        });

        // Create user metadata with farm details
        if (signUpResult.status === "complete") {
          try {
            // You can use Clerk's public metadata to store farm details
            await signUpResult.createdSessionId.setPublicMetadata({
              location: formData.location,
              farmSize: formData.farmSize,
              mainCrops: formData.mainCrops
                .split(",")
                .map((crop) => crop.trim()),
              farmingType: formData.farmingType,
            });

            onSuccess();
            onClose();
          } catch (metadataError) {
            console.error("Error setting metadata:", metadataError);
            setError("Account created but failed to save farm details");
          }
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.errors?.[0]?.message || "Authentication failed");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      location: "",
      farmSize: "",
      mainCrops: "",
      farmingType: "",
    });
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full"
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full"
              required
            />

            {!isLogin && (
              <>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full"
                  required
                />

                <Input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full"
                  required
                />

                <Input
                  type="text"
                  name="farmSize"
                  placeholder="Farm Size (in acres)"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="w-full"
                  required
                />

                <Input
                  type="text"
                  name="mainCrops"
                  placeholder="Main Crops (comma separated)"
                  value={formData.mainCrops}
                  onChange={handleChange}
                  className="w-full"
                  required
                />

                <Select
                  name="farmingType"
                  onValueChange={(value) =>
                    handleChange({ target: { name: "farmingType", value } })
                  }
                >
                  <SelectTrigger className="w-full bg-white border border-input">
                    <SelectValue placeholder="Select Farming Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-input shadow-md">
                    <SelectItem value="organic" className="hover:bg-gray-100">
                      Organic Farming
                    </SelectItem>
                    <SelectItem value="mixed" className="hover:bg-gray-100">
                      Mixed Farming
                    </SelectItem>
                    <SelectItem
                      value="conventional"
                      className="hover:bg-gray-100"
                    >
                      Conventional Farming
                    </SelectItem>
                    <SelectItem
                      value="sustainable"
                      className="hover:bg-gray-100"
                    >
                      Sustainable Farming
                    </SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gray-900 text-white hover:bg-gray-800"
            size="lg"
            disabled={isSigningIn || isSigningUp}
          >
            {isSigningIn || isSigningUp
              ? "Loading..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:underline font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
