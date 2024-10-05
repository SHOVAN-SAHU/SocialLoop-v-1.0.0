import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);
  const { users } = useSelector((store) => store.suggested);

  const su = user?.userProfile?.following.map((u) => u._id);
  const suggestedUsers = users.filter((u) => !su?.includes(u._id));

  return (
    <div className="hidden sm:block fixed right-0 top-0 w-fit my-10 lg:mr-20">
      <div className="flex flex-col items-center border-b pb-3 w-full">
        <Link
          to={`/profile/${user?.userProfile._id}`}
          className="flex items-center gap-2"
        >
          <Avatar className="w-8 h-8 flex justify-center items-center border object-cover cursor-pointer">
            <AvatarImage src={user?.userProfile.profileImage} alt="user img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="cursor-pointer">{user?.userProfile.username}</h1>
        </Link>
        <span>{user?.userProfile?.fullName || ""}</span>
      </div>
      <div className="flex flex-col w-full items-center">
        <h2 className="text-lg font-semibold pb-2">Suggested users</h2>
        {suggestedUsers.length ? (
          <div className="flex flex-col">
            {suggestedUsers.map((u) => (
              <div key={u?._id} className="hover:bg-gray-100 p-3">
                <Link
                  to={`/profile/${u?._id}`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="w-7 h-7 flex justify-center items-center border object-cover cursor-pointer">
                    <AvatarImage src={u?.profileImage} alt="post img" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <h1 className="cursor-pointer">{u?.username}</h1>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-40 text-center">There are no other users to catch up</div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
