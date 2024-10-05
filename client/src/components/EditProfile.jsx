import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { IoMdSave } from "react-icons/io";
import axios from "axios";
import { setAuthUser } from "@/redux/authSlice";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const imageRef = useRef();
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [input, setInput] = useState({
    fullName: "",
    oldPassword: "",
    newPassword: "",
    profileImage: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDeleteUser = async () => {
    try {
      const confirmingDeletation = confirm(
        "Confirming deletation! Are you sure?"
      );
      if (confirmingDeletation) {
        setDeleteLoading(true);
        const res = await axios.delete(
          "https://socialloop-server.onrender.com/api/v1/users/delete",
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          toast.success(res.data.message);
          navigate("/login");
          dispatch(setAuthUser(null));
        }
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profileImage: file });
  };

  const inputChangeHandler = (e) => {
    const { name, value } = e.target;
    if (name === "oldPassword" || name === "newPassword") {
      setInput({
        ...input,
        [name]: value.trim(),
      });
    } else {
      setInput({
        ...input,
        [name]: value,
      });
    }
  };

  const editProfileHandler = async () => {
    setSaveLoading(true);
    const formData = new FormData();
    if (input.fullName) formData.append("fullName", input.fullName);
    if (input.oldPassword) formData.append("oldPassword", input.oldPassword);
    if (input.newPassword) formData.append("newPassword", input.newPassword);
    if (input.profileImage) formData.append("profileImage", input.profileImage);
    try {
      const res = await axios.patch(
        "https://socialloop-server.onrender.com/api/v1/users/edit-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        const updatedUserData = {
          ...user,
          userProfile: {
            ...user.userProfile,
            profileImage: res.data.user.profileImage,
            fullName: res.data.user.fullName,
          },
        };
        dispatch(setAuthUser(updatedUserData));
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex max-w-2xl mx-auto px-4 sm:mx-40 md:px-10 sm:pl-10 pt-20 sm:pt-10 md:mx-auto">
      <section className="flex flex-col gap-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-xl">Edit profile</h1>
          {deleteLoading ? (
            <Button
              variant="secondary"
              disabled
              className="flex justify-between items-center gap-2 text-red-600"
            >
              Delete
              <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="flex justify-between items-center gap-2 text-red-600 hover:bg-gray-200"
              onClick={handleDeleteUser}
            >
              Delete <MdDelete className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar className="flex justify-center items-center border">
              <AvatarImage
                src={user?.userProfile.profileImage}
                alt="user image"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <span className="text-gray-600">
                {user?.userProfile.username}
              </span>
              <h1 className="font-bold">{user?.userProfile.fullName || ""}</h1>
            </div>
          </div>
          <input
            type="file"
            className="hidden"
            ref={imageRef}
            onChange={fileChangeHandler}
            accept="image/*, .jpg, .png, .jpeg"
          />
          <Button onClick={() => imageRef.current.click()}>Change Photo</Button>
        </div>
        <div>
          <h1 className="font-semibold text-lg mb-2">Full name</h1>
          <Input
            onChange={inputChangeHandler}
            type="text"
            value={input.fullName}
            className="focus-visible:ring-transparent"
            name="fullName"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <h1 className="font-semibold text-lg mb-2">Password</h1>
          <div className="flex sm:flex-row flex-col gap-3">
            <Input
              onChange={inputChangeHandler}
              type="password"
              value={input.oldPassword}
              placeholder="Enter your old password"
              className="focus-visible:ring-transparent"
              name="oldPassword"
            />
            <Input
              onChange={inputChangeHandler}
              type="password"
              value={input.newPassword}
              placeholder="Enter a new password"
              className="focus-visible:ring-transparent"
              name="newPassword"
            />
          </div>
        </div>
        <div className="flex justify-center items-center mt-3">
          {saveLoading ? (
            <Button disabled className="flex gap-2 px-8">
              <span>Saving...</span>
              <Loader2 className="animate-spin h-5 w-5" />
            </Button>
          ) : (
            <Button
              disabled={
                ![
                  input.fullName,
                  input.oldPassword,
                  input.newPassword,
                  input.profileImage,
                ].some((item) => item.toString().trim() !== "")
              }
              className="flex gap-2"
              onClick={editProfileHandler}
            >
              <span>Save changes</span>
              <IoMdSave className="h-5 w-5" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
