import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessages from "@/hooks/useGetAllMessage";
import { Loader2 } from "lucide-react";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  useGetRTM();
  useGetAllMessages();
  const { messages, chatRendering } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <div className="overflow-y-auto flex-1 p-4 ">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profileImage} alr="user image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>{selectedUser?.username}</span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="h-8 my-2 " variant="secondary">
              View profile
            </Button>
          </Link>
        </div>
      </div>
      {chatRendering ? (
        <div className="flex justify-center mt-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages?.map((msg) => {
            return (
              <div
                className={`flex ${
                  msg?.senderId === user?.userProfile._id
                    ? "justify-end"
                    : "justify-start"
                }`}
                key={msg?._id}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs break-word ${
                    msg?.senderId === user?.userProfile._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg?.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default Messages;
