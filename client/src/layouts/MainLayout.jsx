import React, { useState } from "react";
import {
  Routes,
  Route,
  NavLink,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Home, User, Clock, LogOut, PlusCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import HomePage from "../pages/HomePage";
import TimelinePage from "../pages/TimelinePage";
import ProfilePage from "../pages/ProfilePage";
import CreatePostModal from "../components/CreatePostModal";
import AuthModal from "../components/AuthModal";

const MainLayout = () => {
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const publicSidebarItems = [
    { icon: <Home size={24} />, label: "Home", path: "/" },
  ];

  const protectedSidebarItems = [
    { icon: <Clock size={24} />, label: "Timeline", path: "/timeline" },
    { icon: <User size={24} />, label: "Profile", path: "/profile" },
  ];

  const handleOpenAuth = (isLoginMode) => {
    setIsLogin(isLoginMode);
    setIsAuthModalOpen(true);
  };

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return "Home";
      case "/timeline":
        return "Timeline";
      case "/profile":
        return "Profile";
      default:
        return "Home";
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div
      className={`flex flex-col h-full bg-white ${isMobile ? "p-4" : "p-3"}`}
    >
      <div className="text-xl font-bold px-3 py-2">Agroww Kavach</div>
      <nav className="flex-1 mt-6">
        {publicSidebarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-4 mb-2 text-base px-4 py-4 rounded-lg
              hover:bg-gray-100 font-medium transition-colors
              ${
                isActive
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-600"
              }
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

        {isAuthenticated &&
          protectedSidebarItems.map((item, index) => (
            <NavLink
              key={`protected-${index}`}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center gap-4 mb-2 text-base px-4 py-4 rounded-lg
                hover:bg-gray-100 font-medium transition-colors
                ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-600"
                }
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
      </nav>
      <div className="mt-auto space-y-3">
        {isAuthenticated ? (
          <>
            <Button
              onClick={() => setIsPostModalOpen(true)}
              className="w-full mb-3 py-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
              size="lg"
            >
              <PlusCircle className="mr-2" size={20} />
              New Post
            </Button>
            <Button
              variant="outline"
              className="w-full py-3 border-gray-200 text-gray-900"
              size="lg"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={20} />
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              size="lg"
              onClick={() => handleOpenAuth(true)}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-200 hover:bg-gray-100"
              size="lg"
              onClick={() => handleOpenAuth(false)}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex min-h-screen bg-white">
        <div className="hidden md:block fixed w-[240px] h-screen border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>

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
                style={{
                  backgroundColor: "white",
                  "--tw-bg-opacity": "1",
                }}
              >
                <SidebarContent isMobile={true} />
              </SheetContent>
            </Sheet>
            <span className="text-xl font-bold">Agroww Kavach</span>
            {isAuthenticated ? (
              <Avatar className="w-8 h-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenAuth(true)}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  size="sm"
                  onClick={() => handleOpenAuth(false)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="w-full md:ml-[240px] lg:ml-[240px] max-w-[600px] xl:max-w-[600px]">
            <div className="mt-14 md:mt-0">
              <div className="px-4 py-3 border-b border-gray-200 bg-white sticky top-0 md:top-0 z-10">
                <h1 className="text-xl font-bold text-gray-900">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>
              <Routes>
                <Route path="/" element={<HomePage />} />
                {isAuthenticated ? (
                  <>
                    <Route path="/timeline" element={<TimelinePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </>
                ) : (
                  <>
                    <Route
                      path="/timeline"
                      element={<Navigate to="/" replace />}
                    />
                    <Route
                      path="/profile"
                      element={<Navigate to="/" replace />}
                    />
                  </>
                )}
              </Routes>
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <CreatePostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isLogin={isLogin}
        onSuccess={() => {
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
        }}
      />
    </>
  );
};

export default MainLayout;
