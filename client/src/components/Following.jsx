import React from "react";
import { useSelector } from "react-redux";
import { Dialog, DialogContent } from "./ui/dialog";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const Following = ({ isOpen, setOpen }) => {
  const { userProfile } = useSelector((store) => store.auth);
  return (
    <Dialog open={isOpen}>
      <DialogContent onInteractOutside={() => setOpen(!isOpen)} className="py-3 flex justify-center">
        {userProfile.userProfile.following.length ? (
          <div className="flex flex-col gap-3">
            {userProfile.userProfile.following.map((user) => (
              <Link
                to={`/profile/${user?._id}`}
                className="flex justify-center items-center gap-3"
                onClick={() => setOpen(!isOpen)}
              >
                <Avatar className="h-7 w-7  cursor-pointer">
                  <AvatarImage src={user?.profileImage} alt="profile image" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p className="hover:text-[#4a55ce] cursor-pointer">
                  {user?.username}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div>0 Following</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
