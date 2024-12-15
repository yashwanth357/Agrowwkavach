import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Home,
  User,
  Clock,
  MessageSquare,
  PlusCircle,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  useAuth,
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useClerk,
} from "@clerk/clerk-react";
import axios from "axios";
import HomePage from "../pages/HomePage";
import TimelinePage from "../pages/TimelinePage";
import ProfilePage from "../pages/ProfilePage";
import ChatPage from "../pages/ChatPage";
import CreatePostModal from "../components/CreatePostModal";

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const MainLayout = () => {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Only fetch profile if user is signed in
      if (!isSignedIn || !user) {
        return;
      }

      setIsLoadingProfile(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:5003/api/profile/${user.id}`,
        );
        setUserProfile(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          // If profile doesn't exist, create one
          try {
            const createResponse = await axios.post(
              "http://localhost:5003/api/profile",
              {
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                location: "Not specified",
                farmSize: "0",
                mainCrops: ["None"],
                farmingType: "conventional",
              },
            );
            setUserProfile(createResponse.data);
          } catch (createError) {
            console.error("Error creating profile:", createError);
            setError("Failed to create user profile");
          }
        } else {
          console.error("Error fetching profile:", error);
          setError("Failed to load user profile");
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isSignedIn, user]);

  const handleLogout = async () => {
    try {
      await signOut();
      // Reset local state
      setUserProfile(null);
      setError(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const publicSidebarItems = [
    { icon: <Home size={24} />, label: "Home", path: "/" },
  ];

  const protectedSidebarItems = [
    { icon: <Clock size={24} />, label: "Timeline", path: "/timeline" },
    { icon: <MessageSquare size={24} />, label: "Chat", path: "/chat" },
    { icon: <User size={24} />, label: "Profile", path: "/profile" },
  ];

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return "Home";
      case "/timeline":
        return "Timeline";
      case "/chat":
        return "Chat";
      case "/profile":
        return "Profile";
      default:
        return "Home";
    }
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div
      className={`flex flex-col h-full bg-white ${isMobile ? "p-4" : "p-3"}`}
    >
      <div className="text-xl font-bold px-3 py-2">Agroww Kavach</div>

      <nav className="flex-1 mt-6">
        {/* Public Routes */}
        {publicSidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-4 mb-2 text-base px-4 py-4 rounded-lg
              hover:bg-gray-100 font-medium transition-colors
              ${isActive ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-600"}
            `}
            onClick={() => isMobile && document.body.click()}
          >
            <span
              className={
                location.pathname === item.path
                  ? "text-gray-900"
                  : "text-gray-500"
              }
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        {/* Protected Routes - Only shown when signed in */}
        <SignedIn>
          {protectedSidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center gap-4 mb-2 text-base px-4 py-4 rounded-lg
                hover:bg-gray-100 font-medium transition-colors
                ${isActive ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-600"}
              `}
              onClick={() => isMobile && document.body.click()}
            >
              <span
                className={
                  location.pathname === item.path
                    ? "text-gray-900"
                    : "text-gray-500"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </SignedIn>
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto space-y-3">
        <SignedIn>
          <Button
            onClick={() => setIsPostModalOpen(true)}
            className="w-full mb-3 py-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
            size="lg"
          >
            <PlusCircle className="mr-2" size={20} />
            New Post
          </Button>
          <div className="flex flex-col gap-2 p-4 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                {userProfile?.location && (
                  <p className="text-sm text-gray-500 truncate">
                    {userProfile.location}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="space-y-3 p-4">
            <SignInButton mode="modal">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                size="lg"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-100"
                size="lg"
              >
                Sign Up
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  );

  // Show nothing while Clerk is initializing
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen bg-white">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed w-[240px] h-screen border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 px-4 py-2">
          <div className="flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-[280px] border-r bg-white shadow-lg"
              >
                <SidebarContent isMobile={true} />
              </SheetContent>
            </Sheet>
            <span className="text-xl font-bold">Agroww Kavach</span>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex justify-center">
          <div className="w-full md:ml-[240px] lg:ml-[240px] max-w-[600px] xl:max-w-[600px]">
            <div className="mt-14 md:mt-0">
              <div className="px-4 py-3 border-b border-gray-200 bg-white sticky top-0 md:top-0 z-10">
                <h1 className="text-xl font-bold text-gray-900">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>

              {/* Show error states only for authenticated users */}
              {isSignedIn && error && (
                <div className="p-4 bg-red-50 text-red-600">{error}</div>
              )}

              {/* Main Routes */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/timeline"
                  element={
                    <ProtectedRoute>
                      <TimelinePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage
                        userProfile={userProfile}
                        setUserProfile={setUserProfile}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal - Only rendered when signed in */}
      <SignedIn>
        <CreatePostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
        />
      </SignedIn>
    </>
  );
};

export default MainLayout;
