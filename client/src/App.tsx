import React, { useState } from "react";
import {
  Home,
  User,
  Clock,
  LogOut,
  PlusCircle,
  Heart,
  Share,
  MessageCircle,
  Repeat2,
  Menu,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Rest of the constants remain the same...
  const sidebarItems = [
    { icon: <Home size={24} />, label: "Home" },
    { icon: <Clock size={24} />, label: "Timeline" },
    { icon: <User size={24} />, label: "Profile" },
  ];

  const posts = [
    {
      id: 1,
      author: "Farmer John",
      handle: "@farmerjohn",
      content:
        "Just implemented new sustainable farming practices! #AgriTech #Sustainability",
      timestamp: "2h ago",
      likes: 24,
      comments: 5,
      shares: 3,
    },
    {
      id: 2,
      author: "AgroTech Solutions",
      handle: "@agrotech",
      content:
        "New weather prediction models showing promising results for the upcoming season.",
      timestamp: "3h ago",
      likes: 42,
      comments: 8,
      shares: 12,
    },
  ];

  const trends = [
    { topic: "#Agriculture", posts: "12.5K posts" },
    { topic: "#Sustainability", posts: "8.2K posts" },
    { topic: "#FarmTech", posts: "5.3K posts" },
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`flex flex-col h-full ${isMobile ? "p-4" : "p-3"}`}>
      <div className="text-xl font-bold px-3 py-2">Agroww-Kavach</div>
      <nav className="flex-1 mt-6">
        {sidebarItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start gap-4 mb-2 text-base px-4 py-4 hover:bg-gray-100 text-gray-900 font-medium"
          >
            {item.icon}
            {item.label}
          </Button>
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
          <span className="text-xl font-bold">Agroww-Kavach</span>
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
              <h1 className="text-xl font-bold text-gray-900">Home</h1>
            </div>
            <div>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors p-4"
                >
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gray-200">
                        {post.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 text-sm">
                        <span className="font-bold hover:underline cursor-pointer text-gray-900">
                          {post.author}
                        </span>
                        <span className="text-gray-500">{post.handle}</span>
                        <span className="text-gray-500">
                          · {post.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-900 break-words">
                        {post.content}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-gray-500">
                        <button className="flex items-center gap-1 hover:text-blue-600">
                          <MessageCircle size={18} />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-green-600">
                          <Repeat2 size={18} />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-red-600">
                          <Heart size={18} />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-600">
                          <Share size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Trends */}
        <div className="hidden lg:block w-[350px] ml-8 flex-shrink-0">
          <div className="fixed w-[350px]">
            <div className="p-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h2 className="text-xl font-bold mb-3 text-gray-900">
                  Trending
                </h2>
                {trends.map((trend, index) => (
                  <div
                    key={index}
                    className="mb-3 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                  >
                    <div className="font-bold text-gray-900">{trend.topic}</div>
                    <div className="text-gray-500 text-sm">{trend.posts}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
