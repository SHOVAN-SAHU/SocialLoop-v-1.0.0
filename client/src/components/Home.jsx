import React from "react";
import Feed from "./Feed";
import { Outlet } from "react-router-dom";
import RightSidebar from "./RightSidebar";
import HorizontalScroll from "./Suggested";
import useGetRandomPosts from "@/hooks/useGetRandomPosts";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

const Home = () => {
  useGetRandomPosts();
  useGetSuggestedUsers();
  return (
    <div className="flex flex-col">
      <HorizontalScroll />
      <div className="flex flex-row">
        <div className="flex-grow">
          <Feed />
          <Outlet />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
