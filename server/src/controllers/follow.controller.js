import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";

const followOrUnfollowUser = async (req, res) => {
  try {
    const { _id } = req.params;

    if (_id === req.user?._id.toString())
      return res.status(400).json({
        success: false,
        message: "You cannot follow or unfollow yourself",
      });

    const user = await User.findById(_id).select("username profileImage");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const isFollowed = await Follow.findOne({
      follower: req.user?._id,
      followingTo: _id,
    });

    if (isFollowed) {
      await Follow.deleteOne({
        follower: req.user?._id,
        followingTo: _id,
      });
      return res
        .status(200)
        .json({ success: true, user, message: "Unfollow successfully" });
    } else {
      const follow = await Follow.create({
        follower: req.user?._id,
        followingTo: _id,
      });

      if (!follow)
        return res
          .status(401)
          .json({ success: false, message: "Failed to follow" });

      return res.status(201).json({
        success: true,
        user,
        message: "follow successfully",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export { followOrUnfollowUser };
