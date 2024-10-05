import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  return (
    <div >
      <Navbar/>
      <LeftSidebar />
      <div >
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
