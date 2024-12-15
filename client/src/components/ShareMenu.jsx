import React, { useState } from "react";
import { Copy, Link, Twitter, Facebook } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

const ShareMenu = ({ post }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const shareUrl = `${window.location.origin}/post/${post._id}`;
  const shareText = `Check out this post on Agroww Kavach: ${post.content.slice(0, 100)}...`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleShare = (platform) => {
    let shareLink;
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText,
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl,
        )}`;
        break;
      default:
        return;
    }
    window.open(shareLink, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600"
          >
            <Share size={18} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white sm:max-w-[425px] gap-0">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle className="text-lg">Share Post</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              Choose how you'd like to share this post
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-white hover:bg-gray-50"
              onClick={handleCopyLink}
            >
              <Copy className="mr-2 h-4 w-4" />
              {showSuccess ? "Copied!" : "Copy link"}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-white hover:bg-gray-50"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="mr-2 h-4 w-4" />
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-white hover:bg-gray-50"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="mr-2 h-4 w-4" />
              Share on Facebook
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white hover:bg-gray-50">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShareMenu;
