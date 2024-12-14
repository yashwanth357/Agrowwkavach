// layouts/MainLayout.jsx
import React from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Home, User, Clock, LogOut, PlusCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import HomePage from "../pages/HomePage";
import TimelinePage from "../pages/TimelinePage";
import ProfilePage from "../pages/ProfilePage";
import TrendingSidebar from "../components/TrendingSidebar";

const MainLayout = () => {
  const location = useLocation();

  const sidebarItems = [
    { icon: <Home size={24} />, label: "Home", path: "/" },
    { icon: <Clock size={24} />, label: "Timeline", path: "/timeline" },
    { icon: <User size={24} />, label: "Profile", path: "/profile" },
  ];

  const getPageTitle = (pathname) => {
    return sidebarItems.find((item) => item.path === pathname)?.label || "Home";
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`flex flex-col h-full ${isMobile ? "p-4" : "p-3"}`}>
      <div className="text-xl font-bold px-3 py-2">Agroww Kavach</div>
      <nav className="flex-1 mt-6">
        {sidebarItems.map((item, index) => (
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
      <div className="mt-auto">
        <Button
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
        >
          <LogOut className="mr-2" size={20} />
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:block fixed w-[240px] h-screen border-r border-gray-200">
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
            <SheetContent side="left" className="p-0">
              <SidebarContent isMobile={true} />
            </SheetContent>
          </Sheet>
          <span className="text-xl font-bold">Agroww Kavach</span>
          <Avatar className="w-8 h-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Container for Main Content and Right Sidebar */}
      <div className="flex-1 flex justify-center">
        {/* Main Content */}
        <div className="w-full md:ml-[240px] lg:ml-[240px] max-w-[600px] xl:max-w-[600px]">
          <div className="mt-14 md:mt-0">
            <div className="px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 md:top-0 z-10">
              <h1 className="text-xl font-bold text-gray-900">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
        </div>

        {/* Right Sidebar - Trends */}
        <div className="hidden lg:block w-[350px] ml-8 flex-shrink-0">
          <TrendingSidebar />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
