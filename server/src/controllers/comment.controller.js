import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";

const addComment = async (req, res) => {
  try {
    const { _id } = req.params;
    const { comment } = req.body;

    if (!comment)
      return res
        .status(400)
        .json({ success: false, message: "Comment required" });

    const post = await Post.findById(_id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    const newComment = await Comment.create({
      comment,
      postId: _id,
      commentedBy: req.user._id,
    });

    if (!newComment)
      return res
        .status(401)
        .json({ success: false, message: "Problem while commenting" });

    return res
      .status(201)
      .json({ success: true, comment: newComment, message: "Comment added" });
  } catch (error) {
    console.log(error);
  }
};

const deleteComment = async (req, res) => {
  try {
    const { _id } = req.params;

    const commentDocument = await Comment.findById(_id);
    if (!commentDocument)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    const comment = await Comment.deleteOne({
      _id: _id,
      commentedBy: req.user?._id,
    });
    if (!comment.deletedCount)
      return res
        .status(400)
        .json({ success: false, message: "Error while deleting the comment" });

    return res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.log(error);
  }
};

export { addComment, deleteComment };
