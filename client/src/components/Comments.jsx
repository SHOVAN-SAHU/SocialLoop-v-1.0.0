import React, { useState } from "react";
import "../App.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
import axios from "axios";
import { Badge } from "./ui/badge";
import { setAuthUser } from "@/redux/authSlice";

const Comments = ({ commentOpen, setCommentOpen, comments, post }) => {
  const [text, setText] = useState("");
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const dispatch = useDispatch();
  const sendMessageHandler = async (postId) => {
    if (text.trim()) {
      try {
        const res = await axios.post(
          `https://socialloop.onrender.com/api/v1/comments/${postId}/add`,
          { comment: text },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setText("");
          toast.success(res.data.message);
          const updatedPostWithComments = posts.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  commentedUsers: [
                    {
                      _id: res.data.comment._id,
                      comment: res.data.comment.comment,
                      user_id: res.data.comment.commentedBy,
                      username: user?.userProfile.username,
                      profileImage: user?.userProfile.profileImage,
                    },
                    ...p.commentedUsers,
                  ],
                }
              : p
          );
          dispatch(setPosts(updatedPostWithComments));
        }
      } catch (error) {
        toast.error(error.response.data.message);
        if (error.response.data.unauthorized) {
          dispatch(setAuthUser(null));
          navigate("/login");
        }
      }
    } else {
      toast.error("Type some comment to send");
    }
  };

  const deleteCommentHandler = async (commentId, postId) => {
    try {
      const res = await axios.delete(
        `https://socialloop.onrender.com/api/v1/comments/${commentId}/delete`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        const updatedPostWithComments = posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                commentedUsers: p.commentedUsers.filter(
                  (comment) => comment._id !== commentId
                ),
              }
            : p
        );
        dispatch(setPosts(updatedPostWithComments));
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    }
  };

  const getCreatedTime = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInMs = now - createdDate;

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return years === 1 ? "1 year ago" : `${years} years ago`;
    } else if (months > 0) {
      return months === 1 ? "1 month ago" : `${months} months ago`;
    } else if (weeks > 0) {
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else if (days > 0) {
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (minutes > 0) {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    } else {
      return seconds <= 1 ? "just now" : `${seconds || 0} seconds ago`;
    }
  };

  return (
    <Dialog open={commentOpen}>
      <DialogContent
        onInteractOutside={() => setCommentOpen(false)}
        className="lg:min-w-fit p-1 rounded-md flex flex-col min-w-72 max-w-[80%] 
        sm:max-w-[80%] min-h-96"
      >
        <section
          className="flex flex-col lg:flex-row flex-1 gap-1 max-h-screen 
          lg:max-h-none lg:h-auto"
        >
          <div className="w-full lg:w-1/2 flex flex-col lg:justify-around">
            <div className="flex flex-col justify-center items-center">
              {/* <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  All comments
                </DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader> */}
              <img
                className="rounded-lg w-full aspect-square object-cover sm:rounded-l-lg 
                sm:rounded-r-none hidden lg:block"
                src={post?.image}
                alt="post image"
              />
            </div>
            <div className="flex flex-col gap-3 bg-white">
              <input
                className="outline-none border-l border-b rounded hidden lg:block pl-2"
                type="text"
                placeholder="Add a new comment..."
                value={text}
                onChange={changeEventHandler}
              />
              <Button
                className="hidden lg:block "
                disabled={!text.trim()}
                onClick={() => sendMessageHandler(post?._id)}
              >
                Send
              </Button>
            </div>
          </div>

          <div
            className="relative w-full lg:w-1/2 flex flex-col justify-between 
            h-full lg:h-auto"
          >
            <div className="flex items-center justify-center p-4">
              <div className="flex gap-1 justify-center">
                <Link to={`/profile/${post?.owner._id}`}>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={post?.owner.profileImage} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link
                    to={`/profile/${post?.owner._id}`}
                    className="font-semibold text-xs"
                  >
                    {post?.owner.username}
                  </Link>
                </div>
              </div>
            </div>
            <hr />
            <div className="overflow-y-auto flex-1 px-4 max-h-80 lg:max-h-96 pb-10 lg:p-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex flex-col gap-1 justify-center border-b py-1"
                >
                  <div className="flex items-center gap-1 justify-between">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/profile/${comment?.user_id}`}
                        className="flex items-center gap-1"
                      >
                        <Avatar className="h-7 w-7 cursor-pointer">
                          <AvatarImage
                            src={comment?.profileImage}
                            alt="user profile image"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h1 className="font-semibold text-xs cursor-pointer hover:text-[#4a55ce]">
                          {comment.username}
                        </h1>
                      </Link>
                      {comment?.user_id === post?.owner._id && (
                        <Badge variant="secondary">Author</Badge>
                      )}
                    </div>
                    <span className="text-xs">
                      {getCreatedTime(comment?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="whitespace-normal break-all">
                      {comment.comment}
                    </p>
                    {comment?.user_id === user?.userProfile._id && (
                      <Button
                        onClick={() =>
                          deleteCommentHandler(comment._id, post?._id)
                        }
                        variant="ghost"
                        className="cursor-pointer w-fit h-8 text-red-600 hover:bg-transparent hover:text-red-800"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                className="outline-none border-l border-b rounded p-2 lg:hidden 
                fixed bottom-0 left-0 w-3/4"
                type="text"
                onChange={changeEventHandler}
                value={text}
                placeholder="Add a comment..."
              />
              <Button
                onClick={() => sendMessageHandler(post?._id)}
                // disabled={!text.trim()}
                className="lg:hidden fixed bottom-0 right-0 w-1/4"
              >
                Send
              </Button>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default Comments;
