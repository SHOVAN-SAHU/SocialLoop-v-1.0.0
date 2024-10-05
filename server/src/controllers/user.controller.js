import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Like } from "../models/like.model.js";
import { Follow } from "../models/follow.model.js";
import { Comment } from "../models/comment.model.js";
import bcrypt from "bcrypt";

import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";
import { deleteFromCloudinary } from "../utils/deleteFromCloudinary.js";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username)
      return res
        .status(401)
        .json({ message: "Username is required", success: false });
    if (!email)
      return res
        .status(401)
        .json({ message: "Email is required", success: false });
    if (!password)
      return res
        .status(401)
        .json({ message: "Password is required", success: false });
    if (!email.includes("@"))
      return res
        .status(401)
        .json({ message: "Email is not valid", success: false });

    const existedEmail = await User.findOne({ email });
    if (existedEmail)
      return res.status(401).json({
        message: "User with this email already exist",
        success: false,
      });
    const existedUsername = await User.findOne({ username });
    if (existedUsername)
      return res.status(401).json({
        message: "User with this Username already exist",
        success: false,
      });

    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password,
    });
    const accessToken = await user.generateAccessToken();
    const createdUser = await User.findById(user?._id).select("-password");

    return res
      .status(201)
      .cookie("accessToken", accessToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        user: createdUser,
        message: "User registered successfully",
      });
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email)
      return res
        .status(401)
        .json({ message: "Email is required", success: false });
    if (!password)
      return res
        .status(401)
        .json({ message: "Password is required", success: false });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        message: "User with this email doesn't exist",
        success: false,
      });

    const matchPassword = await user.isPasswordCorrect(password);
    if (!matchPassword)
      return res.status(401).json({
        message: "Password is incorrect",
        success: false,
      });

    const accessToken = await user.generateAccessToken();

    const userProfile = await User.aggregate([
      {
        $match: {
          _id: user._id,
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followingTo",
          as: "followers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as: "followerUser",
                pipeline: [
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
              $unwind: "$followerUser",
            },
            {
              $replaceRoot: { newRoot: "$followerUser" },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "follower",
          as: "following",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "followingTo",
                foreignField: "_id",
                as: "followingUser",
                pipeline: [
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
              $unwind: "$followingUser",
            },
            {
              $replaceRoot: { newRoot: "$followingUser" },
            },
          ],
        },
      },
      {
        $project: {
          username: 1,
          fullName: 1,
          profileImage: 1,
          followers: 1,
          following: 1,
        },
      },
    ]);

    if (!userProfile.length)
      return res.status(401).json({
        message: "User doesnot exist on aggregate",
        success: false,
      });

    const userPosts = await Post.aggregate([
      {
        $match: {
          owner: user._id,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedUsers",
                pipeline: [
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
              $unwind: "$likedUsers",
            },
            {
              $project: {
                _id: "$likedUsers._id",
                username: "$likedUsers.username",
                profileImage: "$likedUsers.profileImage",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [new mongoose.Types.ObjectId(user._id), "$likes._id"],
          },
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "commentedUser",
                pipeline: [
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
              $unwind: "$commentedUser",
            },
            {
              $project: {
                _id: "$commentedUser._id",
                username: "$commentedUser.username",
                profileImage: "$commentedUser.profileImage",
                comment: "$comment",
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          caption: 1,
          image: 1,
          likes: 1,
          comments: 1,
          isLiked: 1,
          owner: 1,
        },
      },
    ]);

    return res
      .status(201)
      .cookie("accessToken", accessToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        user: { userProfile: userProfile[0], userPosts },
        message: `Welcome back ${
          user?.fullName ? user.fullName : user.username
        }`,
      });
  } catch (error) {
    console.log(error);
  }
};

const logoutUser = async (_, res) => {
  try {
    return res
      .status(200)
      .clearCookie("accessToken", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true, message: "User logged out" });
  } catch (error) {
    console.log(error);
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { _id } = req.params;
    const userProfile = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(`${_id}`),
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "followingTo",
          as: "followers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as: "followerUser",
                pipeline: [
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
              $unwind: "$followerUser",
            },
            {
              $replaceRoot: { newRoot: "$followerUser" },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "follower",
          as: "following",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "followingTo",
                foreignField: "_id",
                as: "followingUser",
                pipeline: [
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
              $unwind: "$followingUser",
            },
            {
              $replaceRoot: { newRoot: "$followingUser" },
            },
          ],
        },
      },
      {
        $addFields: {
          isFollowing: {
            $in: [
              new mongoose.Types.ObjectId(`${req.user._id}`),
              "$followers._id",
            ],
          },
        },
      },
      {
        $project: {
          username: 1,
          fullName: 1,
          email: 1,
          profileImage: 1,
          followers: 1,
          following: 1,
          isFollowing: 1,
        },
      },
    ]);

    if (!userProfile.length)
      return res.status(401).json({
        message: "User doesnot exist",
        success: false,
      });

    const userPosts = await Post.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(`${_id}`),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedUsers",
                pipeline: [
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
              $unwind: "$likedUsers",
            },
            {
              $project: {
                _id: "$likedUsers._id",
                username: "$likedUsers.username",
                profileImage: "$likedUsers.profileImage",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: [req.user?._id, "$likes._id"],
          },
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "commentedBy",
                foreignField: "_id",
                as: "commentedUser",
                pipeline: [
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
              $unwind: "$commentedUser",
            },
            {
              $project: {
                _id: "$commentedUser._id",
                username: "$commentedUser.username",
                profileImage: "$commentedUser.profileImage",
                comment: "$comment",
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      user: { userProfile: userProfile[0], userPosts },
      message: "User profile fetched successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const editProfile = async (req, res) => {
  const { fullName, oldPassword, newPassword } = req.body;
  const localPath = req.file?.path;

  const user = await User.findById(req.user?._id);

  if (fullName) user.fullName = fullName;

  if (oldPassword && newPassword) {
    const verifyPassword = await bcrypt.compare(oldPassword, user.password);

    if (!verifyPassword)
      return res
        .status(401)
        .json({ success: false, message: "Your old password is incorrect" });

    user.password = newPassword;
  } else if (oldPassword || newPassword) {
    return res.status(401).json({
      success: false,
      message: "Old password and New password both are required",
    });
  }

  if (localPath) {
    const profileImageUrl = await uploadOnCloudinary(localPath);
    if (localPath && profileImageUrl) {
      if (user.profileImage) await deleteFromCloudinary(user?.profileImage);
      user.profileImage = profileImageUrl;
    }
  }

  await user.save();

  return res.status(200).json({
    success: true,
    user: user,
    message: "Profile updated",
  });
};

const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(`${req.user?._id}`) },
        },
      },
      {
        $sample: {
          size: 7,
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          profileImage: 1,
        },
      },
    ]);

    if (!suggestedUsers.length)
      return res.status(200).json({
        success: true,
        suggestedUsers: [],
        message: "There are no other users",
      });

    return res.status(200).json({
      success: true,
      suggestedUsers,
      messsage: "Suggested users fetched",
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user.profileImage) await deleteFromCloudinary(user.profileImage);

    const userToDelete = await User.deleteOne({ _id: req.user?._id });
    if (!userToDelete.deletedCount)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    await Like.deleteMany({ likedBy: req.user?._id });

    await Comment.deleteMany({
      commentedBy: req.user?._id,
    });

    const posts = await Post.find({ owner: req.user?._id });
    if (posts.length > 0) {
      await Promise.all(
        posts.map(async (post) => {
          await deleteFromCloudinary(post.image);
        })
      );
    }

    await Post.deleteMany({ owner: req.user?._id });

    await Follow.deleteMany({
      $or: [{ follower: req.user?._id }, { followingTo: req.user?._id }],
    });

    return res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    console.error("Error deleting user data:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting user data",
    });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  editProfile,
  getSuggestedUsers,
  deleteUser,
};
