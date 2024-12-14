import React, { useState, useEffect } from "react";
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
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose, isLogin: initialIsLogin, onSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setError("");
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
        farmSize: "",
        mainCrops: "",
        farmingType: "",
      });
    }
  }, [isOpen, isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (!isLogin) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      // Registration-specific validations
      if (
        !formData.location ||
        !formData.farmSize ||
        !formData.mainCrops ||
        !formData.farmingType
      ) {
        setError("All farm details are required");
        return false;
      }

      // Validate farm size is a number
      if (isNaN(formData.farmSize)) {
        setError("Farm size must be a number");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await authAPI.login(formData.email, formData.password);
      } else {
        // Process mainCrops before sending
        const mainCropsArray = formData.mainCrops
          .split(",")
          .map((crop) => crop.trim())
          .filter((crop) => crop.length > 0);

        result = await authAPI.register({
          email: formData.email.toLowerCase(),
          password: formData.password,
          location: formData.location,
          farmSize: formData.farmSize,
          mainCrops: mainCropsArray,
          farmingType: formData.farmingType,
        });
      }

      // Store the token
      localStorage.setItem("token", result.token);

      // Call the success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
        farmSize: "",
        mainCrops: "",
        farmingType: "",
      });

      // Close the modal
      onClose();

      // Navigate to timeline
      navigate("/timeline");
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.details ||
          "Authentication failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full"
              required
              disabled={isLoading}
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
                  disabled={isLoading}
                />

                <Input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full"
                  required
                  disabled={isLoading}
                />

                <Input
                  type="number"
                  name="farmSize"
                  placeholder="Farm Size (in acres)"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="w-full"
                  required
                  disabled={isLoading}
                  min="0"
                  step="0.01"
                />

                <Input
                  type="text"
                  name="mainCrops"
                  placeholder="Main Crops (comma separated)"
                  value={formData.mainCrops}
                  onChange={handleChange}
                  className="w-full"
                  required
                  disabled={isLoading}
                />

                <Select
                  name="farmingType"
                  onValueChange={(value) =>
                    handleSelectChange("farmingType", value)
                  }
                  value={formData.farmingType}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full bg-white border border-input">
                    <SelectValue placeholder="Select Farming Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-input shadow-md">
                    <SelectItem value="organic">Organic Farming</SelectItem>
                    <SelectItem value="conventional">
                      Conventional Farming
                    </SelectItem>
                    <SelectItem value="mixed">Mixed Farming</SelectItem>
                    <SelectItem value="sustainable">
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
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
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
              disabled={isLoading}
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
