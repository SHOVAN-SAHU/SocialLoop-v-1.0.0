import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const likeOrUnlikePost = async (req, res) => {
  try {
    const { _id } = req.params;

    const post = await Post.findById(_id);
    if (!post)
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });

    const likedDocument = await Like.findOne({
      postId: _id,
      likedBy: req.user?._id,
    });

    if (likedDocument) {
      const unlike = await Like.deleteOne({
        postId: _id,
        likedBy: req.user?._id,
      });
      if (!unlike.deletedCount)
        return res
          .status(404)
          .json({ success: false, message: "Couldn't find like" });

      // const user = await User.findById(req.user?._id).select(
      //   "username profileImage"
      // );
      // const postOwnerId = post?.owner.toString();
      // if (postOwnerId !== req.user?._id) {
      //   //send a notification
      //   const notification = {
      //     type: "unlike",
      //     user,
      //     postId: _id,
      //     message: `Your post unliked by ${user?.username}`,
      //   };
      //   const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      //   io.to(postOwnerSocketId).emit("notification", notification);
      // }

      return res.status(200).json({ success: true, message: "Post unliked" });
    } else {
      const like = await Like.create({
        postId: _id,
        likedBy: req.user?._id,
      });
      if (!like)
        return res
          .status(401)
          .json({ success: false, message: "Failed to like a post" });

      // const user = await User.findById(req.user?._id).select(
      //   "username profileImage"
      // );
      // const postOwnerId = post?.owner.toString();
      // if (postOwnerId !== req.user?._id) {
      //   //send a notification
      //   const notification = {
      //     type: "like",
      //     user,
      //     postId: _id,
      //     message: `Your post liked by ${user?.username}`,
      //   };
      //   const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      //   io.to(postOwnerSocketId).emit("notification", notification);
      // }

      return res.status(201).json({ success: true, message: "Post liked" });
    }
  } catch (error) {
    console.log(error);
  }
};

export { likeOrUnlikePost };
