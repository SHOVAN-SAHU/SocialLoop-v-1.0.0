import {
  Heart,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { setCreatePost } from "@/redux/createPostSlice";
import { setMessages, setOnlineUsers } from "@/redux/chatSlice";
import { setSuggestedUsers } from "@/redux/suggestedSlice";

const Navbar = () => {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const { user } = useSelector((store) => store.auth);

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, text: "Home" },
    { icon: <Search className="w-5 h-5" />, text: "Search" },
    // { icon: <TrendingUp className="w-5 h-5" />, text: "Trending" },
    { icon: <MessageCircle className="w-5 h-5" />, text: "Message" },
    { icon: <PlusSquare className="w-5 h-5" />, text: "Add post" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.userProfile.profileImage} alt="avatar" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    user
      ? { icon: <LogOut className="w-5 h-5" />, text: "Logout" }
      : { icon: <LogIn />, text: "Login" },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Login") {
      navigate("/login");
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Add post") {
      if (user) {
        dispatch(setCreatePost(true));
      } else {
        navigate("/login");
        toast.error("Login to create a post");
      }
    } else if (textType === "Profile") {
      navigate(`/profile/${user?.userProfile._id}`);
    } else if (textType === "Message") {
      navigate("/chat");
    }
  };

  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        "https://socialloop.onrender.com/api/v1/users/logout",
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setUserProfile(null));
        dispatch(setOnlineUsers([]));
        dispatch(setMessages([]));
        dispatch(setSuggestedUsers([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        navigate("/login");
        dispatch(setAuthUser(null));
        dispatch(setUserProfile(null));
        dispatch(setOnlineUsers([]));
        dispatch(setMessages([]));
        dispatch(setSuggestedUsers([]));
      }
    }
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenu(false);
    }
  };

  useEffect(() => {
    if (menu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menu]);
  return (
    <>
      <nav className="w-screen fixed top-0 left-0 bg-white z-50">
        <div className="border-b border-gray-300 sm:hidden p-3 flex justify-center items-center text-lg">
          <div className="w-[50%] flex justify-center font-bold  text-3xl font-serif items-center">
            <span className="text-blue-800 text-4xl">S</span>ocial
            <span className="text-red-400 font-mono">Loop</span>
          </div>
          <div className="w-[50%] flex justify-end cursor-pointer">
            {!menu && <Menu onClick={() => setMenu(!menu)} />}
            {menu && <X onClick={() => setMenu(!menu)} />}
          </div>
        </div>
        <div className="flex flex-col cursor-pointer sm:hidden z-10 w-full">
          <div className="flex" ref={menuRef}>
            <div className="flex flex-col w-[100%]">
              {menu &&
                sidebarItems.map((item, i) => (
                  <div
                    key={i}
                    className=" bg-white flex gap-2 cursor-pointer border border-gray-300 relative p-3 items-center  hover:bg-gray-100 w-full"
                    onClick={() => {
                      setMenu(false);
                      navHandler(item.text);
                    }}
                  >
                    {item.icon}
                    {item.text}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
