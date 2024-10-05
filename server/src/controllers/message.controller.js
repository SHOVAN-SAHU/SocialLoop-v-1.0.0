import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
const sendMessage = async (req, res) => {
  try {
    const { _id } = req.params;
    const { message } = req.body;

    const existedConversation = await Conversation.findOne({
      participants: { $all: [req.user?._id, _id] },
    });

    if (!existedConversation) {
      const newConversation = await Conversation.create({
        participants: [req.user?._id, _id],
      });

      if (!newConversation)
        return res.status(401).json({
          success: false,
          message: "Error while creating conversation",
        });

      const newMessage = await Message.create({
        senderId: req.user?._id,
        recieverId: _id,
        message,
      });

      if (!newMessage)
        return res
          .status(401)
          .json({ success: false, message: "Error while creating message" });

      const updateConversation = await Conversation.findOneAndUpdate(
        {
          participants: { $all: [req.user?._id, _id] },
        },
        {
          $push: {
            messages: newMessage._id,
          },
        },
        {
          new: true,
        }
      );

      if (!updateConversation)
        return res
          .status(401)
          .json({ success: false, message: "Failed to send message" });

      //socket.io
      const receiverSocketId = getReceiverSocketId(_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      return res
        .status(200)
        .json({ success: true, message: "Message send", newMessage });
    }

    const newMessage = await Message.create({
      senderId: req.user?._id,
      recieverId: _id,
      message,
    });

    if (!newMessage)
      return res
        .status(401)
        .json({ success: false, message: "Error while creating message" });

    const updateConversation = await Conversation.findOneAndUpdate(
      {
        participants: { $all: [req.user?._id, _id] },
      },
      {
        $push: {
          messages: newMessage._id,
        },
      },
      {
        new: true,
      }
    );

    if (!updateConversation)
      return res.status(401).json({
        success: false,
        message: "Failed to send message",
      });

    // socket.io;
    const receiverSocketId = getReceiverSocketId(_id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res
      .status(200)
      .json({ success: true, message: "Message send", newMessage });
  } catch (error) {
    console.log(error);
  }
};

const getMessage = async (req, res) => {
  try {
    const { _id } = req.params;

    const conversation = await Conversation.findOne({
      participants: { $all: [req.user?._id, _id] },
    }).populate("messages");

    if (!conversation)
      return res.status(200).json({
        success: true,
        messages: [],
        message: "Send message to start a conversation",
      });

    return res.status(200).json({
      success: true,
      messages: conversation?.messages,
      message: "Messages fetched successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export { sendMessage, getMessage };
