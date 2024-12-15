import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

const ProfileForm = ({ initialData, onUpdateSuccess }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    location: "",
    farmSize: "",
    mainCrops: "",
    farmingType: "conventional",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5003/api/profile/${user.id}`,
        );
        const { location, farmSize, mainCrops, farmingType } = response.data;
        const formattedData = {
          location: location || "",
          farmSize: farmSize || "",
          mainCrops: Array.isArray(mainCrops)
            ? mainCrops.join(", ")
            : mainCrops || "",
          farmingType: farmingType || "conventional",
        };
        setFormData(formattedData);
        if (onUpdateSuccess) {
          onUpdateSuccess(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.put(
        `http://localhost:5003/api/profile/${user.id}`,
        {
          ...formData,
          mainCrops: formData.mainCrops.split(",").map((crop) => crop.trim()),
        },
      );

      setSuccess(true);
      if (onUpdateSuccess) {
        onUpdateSuccess(response.data);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Location</label>
        <Input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Farm Size (in acres)
        </label>
        <Input
          type="number"
          name="farmSize"
          value={formData.farmSize}
          onChange={handleChange}
          className="w-full"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Main Crops (comma separated)
        </label>
        <Input
          type="text"
          name="mainCrops"
          value={formData.mainCrops}
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Farming Type
        </label>
        <div className="relative">
          <Select
            name="farmingType"
            value={formData.farmingType}
            onValueChange={(value) =>
              handleChange({ target: { name: "farmingType", value } })
            }
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select farming type" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="organic">Organic Farming</SelectItem>
              <SelectItem value="conventional">Conventional Farming</SelectItem>
              <SelectItem value="mixed">Mixed Farming</SelectItem>
              <SelectItem value="sustainable">Sustainable Farming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gray-900 text-white hover:bg-gray-800"
        disabled={isLoading}
      >
        {isLoading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  );
};

export default ProfileForm;
