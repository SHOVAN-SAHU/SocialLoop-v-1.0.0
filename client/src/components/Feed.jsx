import React from "react";
import Posts from "./Posts";

const Feed = () => {
  return (
      <div className="flex flex-1 flex-col items-center md:my-8 md:pl-[10%] text-xl">
        <Posts />
      </div>
  );
};

export default Feed;
