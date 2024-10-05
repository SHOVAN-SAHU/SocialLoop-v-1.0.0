import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { setCreatePost } from "@/redux/createPostSlice";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "@/redux/authSlice";

const CreatePost = () => {
  const { user } = useSelector((store) => store.auth);
  const { isOpen } = useSelector((store) => store.createPost);
  const dispatch = useDispatch();
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { posts } = useSelector((store) => store.post);
  const navigate = useNavigate();

  const createPostHandler = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    try {
      const res = await axios.post(
        "https://socialloop.onrender.com/api/v1/posts/add-post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        dispatch(setCreatePost(false));
        setCaption("");
        setFile("");
        setImagePreview("");
      }
    } catch (error) {
      toast.error(error.response.data.message);
      if (error.response.data.unauthorized) {
        dispatch(setAuthUser(null));
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataUrl(file);
      setImagePreview(dataUrl);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        onInteractOutside={() => dispatch(setCreatePost(false))}
        className="rounded-md"
      >
        <DialogHeader>
          <DialogTitle>Create new post</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 items-center">
          <Avatar>
            <AvatarImage
              src={user?.userProfile.profileImage}
              alt="profile image"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-sm">
              {user?.userProfile.username}
            </h1>
          </div>
        </div>
        <Textarea
          className="focus-visible:ring-transparent border"
          placeholder="Write a caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {imagePreview && (
          <div className="flex justify-center items-center">
            <img
              src={imagePreview}
              alt="selected image"
              className="rounded-md w-64 aspect-square object-cover"
            />
          </div>
        )}
        <div className="flex flex-col items-center justify-center">
          <input
            type="file"
            className="hidden"
            ref={imageRef}
            accept="image/*, .jpg, .png, .jpeg"
            onChange={fileChangeHandler}
          />
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
            <Button onClick={() => imageRef.current.click()}>
              Select a image
            </Button>
            {imagePreview &&
              (loading ? (
                <Button disabled>
                  Uploading... <Loader2 className="animate-spin w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={createPostHandler}>Post</Button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
