import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId, //one who is following
      ref: "User",
      index: true,
    },
    followingTo: {
      type: mongoose.Schema.Types.ObjectId, //one to whom follower is following
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

export const Follow = mongoose.model("Follow", followSchema);
