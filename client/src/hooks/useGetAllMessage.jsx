import { setAuthUser } from "@/redux/authSlice";
import { setChatRendering, setMessages } from "@/redux/chatSlice";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const useGetAllMessages = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(setChatRendering(true));
    const fetchAllMessages = async () => {
      try {
        const res = await axios.get(
          `https://socialloop-server.onrender.com/api/v1/messages/${selectedUser?._id}/get`,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.log(error);
        if (error.response.data.unauthorized) {
          dispatch(setAuthUser(null));
          navigate("/login");
        }
      } finally {
        dispatch(setChatRendering(false));
      }
    };
    fetchAllMessages();
  }, [selectedUser]);
};

export default useGetAllMessages;
