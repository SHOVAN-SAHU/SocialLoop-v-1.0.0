import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";

const Likes = ({ likesOpen, setLikesOpen, likes }) => {
  return (
    <Dialog open={likesOpen}>
      <DialogContent onInteractOutside={() => setLikesOpen(false)}>
        <section className="min-h-96 flex flex-col items-center w-full">
          <DialogHeader>
            <DialogTitle>All Likes</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-96 w-full pt-2">
            {likes.map((like) => (
              <Link
                to={`/profile/${like?._id}`}
                className="flex w-full justify-center items-center gap-2 hover:bg-gray-100"
                key={like?._id}
              >
                <Avatar className="h-7 w-7 cursor-pointer">
                  <AvatarImage src={like?.profileImage} alt="profile image" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <p className="hover:text-[#4a55ce] cursor-pointer">
                  {like?.username}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default Likes;
