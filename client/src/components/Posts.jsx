import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);
  return (
    <div className="flex justify-center items-center flex-col  my-[-17%] sm:my-0">
      <h1 className="sm:hidden font-bold">Posts</h1>
      <div className="w-full">
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Posts;
