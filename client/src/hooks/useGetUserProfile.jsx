import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { setProfileRendering } from "@/redux/suggestedSlice";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(setProfileRendering(true));
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `https://socialloop.onrender.com/api/v1/users/${userId}/profile`,
          { withCredentials: true }
        );

        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        toast.error(error.response.data.message);
        if (error.response.data.unauthorized) {
          dispatch(setAuthUser(null));
          navigate("/login");
        }
      } finally {
        dispatch(setProfileRendering(false));
      }
    };
    if (userId) fetchUserProfile();
  }, [userId]);
};

export default useGetUserProfile;
