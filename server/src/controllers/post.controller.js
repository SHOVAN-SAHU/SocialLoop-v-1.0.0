import { Post } from "../models/post.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const addPost = async (req, res) => {
  try {
    const imageLocalPath = req.file?.path;
    const { caption } = req.body;

    if (!imageLocalPath)
      return res
        .status(400)
        .json({ success: false, message: "Couldn't find local path" });

    const imageUrl = await uploadOnCloudinary(imageLocalPath);
    if (!imageUrl)
      return res
        .status(400)
        .json({ success: false, message: "Faild to upload on cloudinary" });

    const createdPost = await Post.create({
      caption: caption || "",
      image: imageUrl,
      owner: req.user?._id,
    });

    const post = await Post.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(createdPost._id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likedUsers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $replaceRoot: { newRoot: "$user" },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "commentedUsers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                user_id: "$user._id",
                username: "$user.username",
                fullName: "$user.fullName",
                profileImage: "$user.profileImage",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(`${req.user._id}`),
              "$likedUsers._id",
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          caption: 1,
          image: 1,
          isLiked: 1,
          likedUsers: 1,
          commentedUsers: 1,
          "owner._id": 1,
          "owner.username": 1,
          "owner.fullName": 1,
          "owner.profileImage": 1,
        },
      },
    ]);

    return res
      .status(201)
      .json({ success: true, post: post[0], message: "New post created" });
  } catch (error) {
    console.log(error);
  }
};

const getRandomPost = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likedUsers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $replaceRoot: { newRoot: "$user" },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "commentedUsers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                createdAt: 1,
                user_id: "$user._id",
                username: "$user.username",
                profileImage: "$user.profileImage",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [new mongoose.Types.ObjectId(req.user._id), "$likedUsers._id"],
          },
        },
      },
      {
        $project: {
          _id: 1,
          caption: 1,
          image: 1,
          isLiked: 1,
          likedUsers: 1,
          commentedUsers: 1,
          createdAt: 1,
          "owner._id": 1,
          "owner.username": 1,
          "owner.fullName": 1,
          "owner.profileImage": 1,
        },
      },
    ]);

    return res
      .status(200)
      .json({ success: true, posts, message: "Posts fetched successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getPostDetails = async (req, res) => {
  try {
    const { _id } = req.params;

    const post = await Post.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(`${_id}`),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likedUsers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $replaceRoot: { newRoot: "$user" },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "commentedUsers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                user_id: "$user._id",
                username: "$user.username",
                profileImage: "$user.profileImage",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(`${req.user._id}`),
              "$likedUsers._id",
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          caption: 1,
          image: 1,
          isLiked: 1,
          likedUsers: 1,
          commentedUsers: 1,
          "owner._id": 1,
          "owner.username": 1,
          "owner.fullName": 1,
          "owner.profileImage": 1,
        },
      },
    ]);

    if (!post)
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });

    return res.status(200).json({
      success: true,
      post: post[0],
      message: "Post fetched successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const savedPosts = async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(req.user?._id);

    if (user.savedPosts.includes(_id)) {
      console.log("true");
      await User.findByIdAndUpdate(
        req.user?._id,
        {
          $pull: {
            savedPosts: _id,
          },
        },
        {
          new: true,
        }
      ).select("-password");

      return res.status(200).json({ success: true, message: "Post unsaved" });
    } else {
      console.log("false");
      await User.findByIdAndUpdate(
        req.user?._id,
        {
          $addToSet: {
            savedPosts: _id,
          },
        },
        {
          new: true,
        }
      ).select("-password");

      return res.status(200).json({ success: true, message: "Post saved" });
    }
  } catch (error) {
    console.log(error);
  }
};

const deletePost = async (req, res) => {
  try {
    const { _id } = req.params;

    const post = await Post.findById(_id);
    if (!post)
      return res
        .status(400)
        .json({ success: false, message: "Couldn't find post" });

    if (post.owner.toString() !== req.user?._id.toString())
      return res.status(400).json({
        success: false,
        message: "You cannot delete other users post",
      });

    await Like.deleteMany({ postId: post._id });
    await Comment.deleteMany({ postId: post._id });
    await deleteFromCloudinary(post.image);
    await Post.deleteOne(post._id);

    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.log(error);
  }
};

export { addPost, deletePost, getRandomPost, getPostDetails, savedPosts };
