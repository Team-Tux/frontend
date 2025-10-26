import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { CCloseButton, CSidebar, CSidebarBrand, CSidebarHeader } from "@coreui/react";
import { AppSidebarNav } from "./AppSidebarNav";
import navigation from "../_nav";

const AppSidebar = () => {
  const dispatch = useDispatch();
  const sidebarShow = useSelector((s) => s.sidebarShow);

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      visible={sidebarShow}
      onVisibleChange={(v) => dispatch({ type: "set", sidebarShow: v })}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/" style={{ textDecoration: "none", color: "white", fontWeight: "600", fontSize: "1.1rem", justifyContent: "center" }}>
          Guardian
        </CSidebarBrand>
        <CCloseButton className="d-lg-none" dark onClick={() => dispatch({ type: "set", sidebarShow: false })} />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
