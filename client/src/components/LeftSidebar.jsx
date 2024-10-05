import {
  Heart,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setCreatePost } from "@/redux/createPostSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { setMessages, setOnlineUsers } from "@/redux/chatSlice";
import { setSuggestedUsers } from "@/redux/suggestedSlice";

const LeftSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  const sidebarItems = [
    {
      icon: <Home className="sm:w-3.5 md:w-5 sm:h-3.5 md:h-5" />,
      text: "Home",
    },
    {
      icon: <Search className="sm:w-3.5 md:w-5 sm:h-3.5 md:h-5" />,
      text: "Search",
    },
    // {
    //   icon: <TrendingUp className="sm:w-3.5 md:w-5 sm:h-3.5 md:h-5" />,
    //   text: "Trending",
    // },
    {
      icon: <MessageCircle className="sm:w-3.5 md:w-5 sm:h-3.5 md:h-5" />,
      text: "Message",
    },
    {
      icon: <PlusSquare className="sm:w-3.5 md:w-5 sm:h-3.5 md:h-5" />,
      text: "Add post",
    },
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
  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Login") {
      navigate("/login");
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
        "https://socialloop-server.onrender.com/api/v1/users/logout",
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
      toast.error(error?.response?.data?.message);
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
  return (
    <>
      <aside className="hidden sm:block  border-r border-gray-300 border-b h-screen items-center fixed top-0 left-0 z-10 md:w-[16%] bg-white">
        <div className="flex flex-col">
          <h1 className="my-8 pl-3 font-bold text-xl font-serif">
            <span className="text-blue-800 text-3xl">S</span>ocial
            <span className="text-red-400 font-mono">Loop</span>
          </h1>
          {sidebarItems.map((item, i) => (
            <div
              key={i}
              onClick={() => sidebarHandler(item.text)}
              className="flex gap-2 cursor-pointer relative hover:bg-gray-100 items-center text-sm p-4"
            >
              {item.icon}
              <span>{item.text}</span>
              {/* {item.text === "Notifications" && likeNotification?.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      className="rounded-full h-5 w-5 absolute bottom-6 left-6"
                    >
                      {likeNotification?.length}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div>
                      {likeNotification?.length === 0 ? (
                        <p>No new notification</p>
                      ) : (
                        likeNotification?.map((notification) => {
                          return (
                            <div key={notification.user._id}>
                              <Avatar>
                                <AvatarImage
                                  src={notification.user?.profileImage}
                                />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <p className="text-sm">
                                <span className="font-bold">
                                  {notification.user.username}
                                </span>{" "}
                                Liked your post
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )} */}
            </div>
          ))}
        </div>
        <CreatePost />
      </aside>
    </>
  );
};

export default LeftSidebar;
