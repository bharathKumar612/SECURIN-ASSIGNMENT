import { Outlet } from "react-router";
import React from "react";
import { Toaster } from "../ui/sonner";

const Layout = () => {
  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
};

export default Layout;
