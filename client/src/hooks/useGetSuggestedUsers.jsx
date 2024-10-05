import { setAuthUser } from "@/redux/authSlice";
import { setSuggestedUsers } from "@/redux/suggestedSlice";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get(
          "https://socialloop.onrender.com/api/v1/users/suggested-users",
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.suggestedUsers));
        }
      } catch (error) {
        console.log(error);
        if (error.response.data.unauthorized) {
          dispatch(setAuthUser(null));
          navigate("/login");
        }
      }
    };
    if (user) fetchSuggestedUsers();
  }, []);
};

export default useGetSuggestedUsers;
