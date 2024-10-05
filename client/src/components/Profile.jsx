import useGetUserProfile from "@/hooks/useGetUserProfile";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { SlUserFollow } from "react-icons/sl";
import { RiUserUnfollowLine } from "react-icons/ri";
import { Heart, Loader2, MessageCircle } from "lucide-react";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { Followers } from "./Followers";
import { Following } from "./Following";

const Profile = () => {
  const params = useParams();
  useGetUserProfile(params._id);
  const navigate = useNavigate();
  const { user, userProfile } = useSelector((store) => store.auth);
  const { profileRendering } = useSelector((store) => store.suggested);
  const [isOpenFollowers, setIsOpenFollowers] = useState(false);
  const [isOpenFollowing, setIsOpenFollowing] = useState(false);

  const dispatch = useDispatch();

  const deletePost = async (postId) => {
    try {
      const res = await axios.delete(
        `https://socialloop-server.onrender.com/api/v1/posts/${postId}/delete`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        const updatedUserPostsData = userProfile?.userPosts.filter(
          (post) => post?._id !== postId
        );
        dispatch(
          setUserProfile({ ...userProfile, userPosts: updatedUserPostsData })
        );
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    }
  };

  const followAndUnfollowHandler = async (userId) => {
    try {
      const res = await axios.get(
        `https://socialloop-server.onrender.com/api/v1/follow/${userId}/follow-unfollow`,
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        const updatedUserFollowers = userProfile?.userProfile.isFollowing
          ? userProfile?.userProfile.followers.filter(
              (follower) => follower._id !== user?.userProfile._id
            )
          : [
              {
                _id: user?.userProfile._id,
                username: user?.userProfile.username,
                profileImage: user?.userProfile.profileImage,
              },
              ...userProfile?.userProfile.followers,
            ];

        const updatedAuthFollowing = userProfile?.userProfile.isFollowing
          ? user?.userProfile.following.filter(
              (followingUser) => followingUser._id !== userId
            )
          : [
              {
                _id: res.data.user?._id,
                username: res.data.user?.username,
                profileImage: res.data.user?.profileImage,
              },
              ...user?.userProfile.following,
            ];

        dispatch(
          setAuthUser({
            ...user,
            userProfile: {
              ...user?.userProfile,
              following: updatedAuthFollowing,
            },
          })
        );

        dispatch(
          setUserProfile({
            ...userProfile,
            userProfile: {
              ...userProfile?.userProfile,
              followers: updatedUserFollowers,
              isFollowing: !userProfile?.userProfile.isFollowing,
            },
          })
        );
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    }
  };

  if (profileRendering || !userProfile) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return (
    userProfile?.userProfile && (
      <div className="flex max-w-4xl justify-center mx-auto sm:pl-10 mt-20 sm:mt-5">
        <div className="flex flex-col gap-3 p-8">
          <div className="flex flex-col sm:flex-row justify-center items-center sm:gap-4  pb-10">
            <section className="flex justify-center items-center">
              <Avatar className="sm:h-28 sm:w-28 h-20 w-20">
                <AvatarImage
                  src={userProfile?.userProfile.profileImage}
                  alt="profile img"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </section>
            <section className="flex justify-center items-center flex-col gap-4">
              <div className="flex flex-col gap-3 justify-center items-center ">
                <div className="flex flex-col justify-center items-center ">
                  <h1 className="font-semibold text-balance">
                    {userProfile?.userProfile.fullName || ""}
                  </h1>
                  <span>{userProfile?.userProfile.username}</span>
                </div>
                <div className="flex gap-4">
                  <p
                    className="flex flex-col justify-center items-center cursor-pointer"
                    onClick={() => setIsOpenFollowers(!isOpenFollowers)}
                  >
                    <span>{userProfile?.userProfile.followers.length}</span>{" "}
                    Followers
                  </p>
                  <Followers
                    isOpen={isOpenFollowers}
                    setOpen={setIsOpenFollowers}
                  />
                  <p
                    className="flex flex-col justify-center items-center cursor-pointer"
                    onClick={() => setIsOpenFollowing(!isOpenFollowing)}
                  >
                    <span>{userProfile?.userProfile.following.length}</span>{" "}
                    Following
                  </p>
                  <Following
                    isOpen={isOpenFollowing}
                    setOpen={setIsOpenFollowing}
                  />
                  <p className="flex flex-col justify-center items-center">
                    <span>{userProfile?.userPosts.length}</span>{" "}
                    {userProfile?.userPosts.length > 1 ? "Posts" : "Post"}
                  </p>
                </div>
              </div>
              {user?.userProfile._id === userProfile?.userProfile._id ? (
                <Button
                  variant="secondary"
                  className="hover:bg-gray-200 h-8"
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit profile
                </Button>
              ) : userProfile?.userProfile.isFollowing ? (
                <Button
                  onClick={() => followAndUnfollowHandler(params._id)}
                  variant="secondary"
                  className="h-8 flex gap-2 hover:bg-gray-200"
                >
                  <span>Unfollow </span>
                  <RiUserUnfollowLine />
                </Button>
              ) : (
                <Button
                  className="h-8 flex gap-2 px-6"
                  onClick={() => followAndUnfollowHandler(params._id)}
                >
                  <span>Follow</span>
                  <SlUserFollow />
                </Button>
              )}
            </section>
          </div>
          <div className="border-t border-t-gray-200 ">
            <div className="flex justify-center items-center gap-10 text-sm">
              <span className="py-3">POSTS</span>
            </div>
            <div className="grid grid-cols-3 gap-1 sm:pl-20">
              {userProfile?.userPosts.map((post) => {
                return (
                  <div
                    key={post?._id}
                    className="cursor-pointer relative group"
                  >
                    <img
                      src={post?.image}
                      alt="post img"
                      className="rounded-sm my-2 w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 my-2">
                      <div className="flex flex-col items-center sm:flex-row justify-center text-white sm:gap-3">
                        <button className="flex items-center gap-2">
                          <Heart />
                          <span>{post.likes.length}</span>
                        </button>
                        <button className="flex items-center gap-2">
                          <MessageCircle />
                          <span>{post.comments.length}</span>
                        </button>
                        {user?.userProfile._id ===
                          userProfile?.userProfile?._id && (
                          <MdDelete
                            className="h-6 w-6  hover:text-gray-300"
                            onClick={() => deletePost(post?._id)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Profile;
