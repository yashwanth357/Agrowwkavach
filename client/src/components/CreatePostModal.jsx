import React, { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const CreatePostModal = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("clerkId", user.id);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await axios.post("http://localhost:5003/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      onClose();

      // Optional: Refresh the posts feed
      window.location.reload();
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.response?.data?.error || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-lg">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-xl font-semibold">
            Create Post
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 items-start">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {user?.firstName?.[0] ||
                  user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in your farm?"
              className="flex-1 resize-none border-none focus-visible:ring-0 text-lg bg-transparent"
              rows={4}
            />
          </div>

          {imagePreview && (
            <div className="relative bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-[300px] w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <div className="flex items-center">
              <label
                htmlFor="image-upload"
                className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ImageIcon className="text-blue-500" size={22} />
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="font-semibold hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 text-white hover:bg-gray-800"
                disabled={(!content.trim() && !selectedImage) || isLoading}
              >
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
