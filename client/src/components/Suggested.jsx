import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";

const HorizontalScroll = () => {
  const { user } = useSelector((store) => store.auth);
  const { users } = useSelector((store) => store.suggested);

  const su = user?.userProfile?.following.map((u) => u._id);
  const suggestedUsers = users.filter((u) => !su?.includes(u._id));

  return (
    <div className="my-20 sm:hidden">
      <h1 className="font-bold pl-5">Suggested Users</h1>
      <div className="relative overflow-x-auto whitespace-nowrap my-5">
        <div className="flex space-x-4 p-4 gap-1">
          {suggestedUsers.length ? (
            suggestedUsers.map((u) => {
              return (
                <Link
                  to={`/profile/${u?._id}`}
                  className="flex flex-col justify-center items-center border-r border-l px-2"
                  key={u?._id}
                >
                  <Avatar className="h-[3rem] w-[3rem] rounded-full">
                    <AvatarImage src={u?.profileImage} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <h1 className="text-sm">{u?.username}</h1>
                </Link>
              );
            })
          ) : (
            <div className="w-40 text-center">
              There are no other users to catch up
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScroll;
