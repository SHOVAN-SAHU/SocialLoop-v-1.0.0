import React, { useState } from "react";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { DialogDescription, DialogTrigger } from "@radix-ui/react-dialog";
import { Bookmark, Loader2, MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import Comments from "./Comments";
import { Link, useNavigate } from "react-router-dom";
import Likes from "./Likes";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
import { RiSendPlaneFill } from "react-icons/ri";
import { setAuthUser } from "@/redux/authSlice";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
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
  const deletePostHandler = async (postId) => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `https://socialloop.onrender.com/api/v1/posts/${postId}/delete`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        const updatedPostData = posts.filter((post) => post?._id !== postId);
        dispatch(setPosts(updatedPostData));
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const likeOrUnlikeHandler = async (postId) => {
    try {
      const res = await axios.get(
        `https://socialloop.onrender.com/api/v1/likes/${postId}/like-unlike`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        const updatedPostWithLikes = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likedUsers: p.isLiked
                  ? p.likedUsers.filter((u) => u._id !== user?.userProfile._id)
                  : [
                      {
                        profileImage: user?.userProfile.profileImage || "",
                        username: user?.userProfile.username,
                        _id: user?.userProfile._id,
                      },
                      ...p.likedUsers,
                    ],
                isLiked: !p.isLiked,
              }
            : p
        );
        dispatch(setPosts(updatedPostWithLikes));
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    }
  };

  const commentHandler = async (postId) => {
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
          p._id === post._id
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
  };

  const handleSavePost = async (postId) => {
    try {
      const res = await axios.get(
        `https://socialloop.onrender.com/api/v1/posts/${postId}/save`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
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
    <div className="my-8 w-[80%] max-w-sm mx-auto md:mx-0 shadow-lg p-2">
      <div className="flex items-center justify-between">
        <Link to={`/profile/${post?.owner._id}`}>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 flex justify-center items-center border object-cover">
              <AvatarImage src={post?.owner?.profileImage} alt="post img" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1>{post.owner.username}</h1>
            {post?.owner._id === user?.userProfile._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </Link>

        {user?.userProfile._id === post?.owner._id && (
          <Dialog>
            <DialogTrigger asChild>
              <MoreHorizontal className="cursor-pointer hover:text-gray-600" />
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center text-sm rounded-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  Additional features
                </DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              {loading ? (
                <Button
                  className="flex justify-center items-center gap-2 text-red-600"
                  variant="ghost"
                >
                  Deleting... <Loader2 className="w-4 h-4 animate-spin" />
                </Button>
              ) : (
                <Button
                  onClick={() => deletePostHandler(post?._id)}
                  variant="ghost"
                  className="cursor-pointer w-fit text-red-600"
                >
                  Delete
                </Button>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
      <img
        className="rounded-md my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post image"
      />
      <div className="flex justify-between items-center my-2 px-2">
        <div className="flex items-center gap-3">
          {post.isLiked ? (
            <FaHeart
              className="cursor-pointer text-red-600"
              size={"1.5rem"}
              onClick={() => likeOrUnlikeHandler(post?._id)}
            />
          ) : (
            <FaRegHeart
              onClick={() => likeOrUnlikeHandler(post?._id)}
              size={"1.5rem"}
              className="cursor-pointer hover:text-gray-600"
            />
          )}
          <MessageCircle
            onClick={() => setCommentOpen(true)}
            className="cursor-pointer hover:text-gray-600"
          />
        </div>
        <Bookmark
          onClick={() => handleSavePost(post?._id)}
          className="cursor-pointer hover:text-gray-600"
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center">
          <p
            className="font-medium text-base inline hover:text-[#4a55ce] cursor-pointer"
            onClick={() => setLikesOpen(true)}
          >
            <span>{post?.likedUsers?.length}</span> Likes
          </p>
          <Likes
            likesOpen={likesOpen}
            setLikesOpen={setLikesOpen}
            likes={post?.likedUsers}
          />
          <LuDot className="inline" />
          <p
            className="font-medium text-base inline hover:text-[#4a55ce] cursor-pointer"
            onClick={() => setCommentOpen(true)}
          >
            <span>{post?.commentedUsers?.length}</span> Comments
          </p>
          <Comments
            commentOpen={commentOpen}
            setCommentOpen={setCommentOpen}
            comments={post?.commentedUsers}
            post={post}
          />
        </div>
        <span className="text-xs">{getCreatedTime(post?.createdAt)}</span>
      </div>
      <p className="font-medium block text-sm text-gray-600">{post.caption}</p>
      <div className="flex items-center justify-between py-2 border-b border-l rounded-md">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          className="outline-none text-base w-full pl-2"
          onChange={changeEventHandler}
        />
        {text && (
          <RiSendPlaneFill
            className="text-[#3BADF8] pr-2 cursor-pointer w-9 h-6 hover:text-[#4aa1dc]"
            onClick={() => commentHandler(post?._id)}
          />
        )}
      </div>
    </div>
  );
};

export default Post;
