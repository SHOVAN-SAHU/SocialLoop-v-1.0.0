import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setAuthUser, setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import { useState } from "react";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ChatPage = () => {
  const { user, selectedUser } = useSelector((store) => store.auth);
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const [textMessage, setTextMessage] = useState("");
  const navigate = useNavigate();

  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `https://socialloop-server.onrender.com/api/v1/messages/${receiverId}/send`,
        { message: textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:h-screen mt-[20%] sm:mt-0 sm:ml-[16%] ml-[2%]">
      <section className="w-full sm:w-1/4">
        {user?.userProfile.following.length < 1 ? (
          <h1>Follow eachothers to start a conversation</h1>
        ) : (
          <div className="overflow-x-auto sm:overflow-y-auto h-[9vh] sm:h-[100vh] flex sm:block">
            {user?.userProfile.following.map((user) => {
              const isOnline = onlineUsers.includes(user?._id);
              return (
                <div
                  key={user?._id}
                  className="flex gap-3 items-center p-3 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                  onClick={() => dispatch(setSelectedUser(user))}
                >
                  <Avatar>
                    <AvatarImage src={user?.profileImage} alt="user image" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.username}</span>
                    <span
                      className={`text-xs font-bold ${
                        isOnline ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isOnline ? "online" : "offline"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {selectedUser ? (
        <section className="flex-1 sm:border-l border-l-gray-300 flex flex-col justify-between h-full">
          <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 bg-white z-10">
            <Avatar>
              <AvatarImage src={selectedUser?.profileImage} alt="user image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{selectedUser?.username}</span>
            </div>
            {onlineUsers.includes(selectedUser?._id) ? (
              <span className="text-green-600 text-xs font-bold">online</span>
            ) : (
              <span className="text-red-600 text-xs font-bold">offline</span>
            )}
          </div>
          <div className="flex-grow overflow-y-auto h-[60vh] sm:h-auto">
            <Messages selectedUser={selectedUser} />
          </div>
          <div className="flex items-center p-4 border-t border-t-gray-300">
            <Input
              type="text"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Messages..."
            />
            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto my-8 sm:my-0">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium text-xl">Your messages</h1>
          <span>Send a message to start a conversation</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
