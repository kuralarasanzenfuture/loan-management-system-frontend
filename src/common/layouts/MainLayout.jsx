// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { Outlet } from "react-router-dom";
// import { fetchCurrentUser } from "../../redux/auth/authSlice.js";
// import Sidebar from "../components/layout/Sidebar/Sidebar";
// import Header from "../components/layout/Header/Header";
// import Footer from "../components/footer/Footer.jsx";

// /**
//  * MainLayout Component
//  * Wraps all dashboard-level routes with standard responsive sidebar and header layouts.
//  * Persists desktop collapse preference in localStorage for seamless sessions.
//  */
// export default function MainLayout() {
//   const dispatch = useDispatch();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     dispatch(fetchCurrentUser());
//   }, [dispatch]);

//   // Persistent sidebar collapse state
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     const saved = localStorage.getItem("sidebar_collapsed");
//     return saved ? JSON.parse(saved) : false;
//   });

//   useEffect(() => {
//     localStorage.setItem("sidebar_collapsed", JSON.stringify(sidebarCollapsed));
//   }, [sidebarCollapsed]);

//   return (
//     <div className="flex min-h-screen bg-base-200 text-base-content antialiased">
//       {/* Sidebar Navigation */}
//       <Sidebar
//         open={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//         collapsed={sidebarCollapsed}
//       />

//       {/* Main Content Wrapper */}
//       <div className="flex-1 flex flex-col min-w-0 min-h-screen">
//         {/* Top Header/Navbar */}
//         <Header
//           onMenuClick={() => setSidebarOpen(true)}
//           collapsed={sidebarCollapsed}
//           onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
//         />

//         {/* Page Content Body */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
//           <div className="max-w-7xl mx-auto w-full animate-fade-in">
//             <Outlet />
//           </div>
//         </main>
//         <Footer />
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";

import { fetchCurrentUser } from "../../redux/auth/authSlice.js";

import Sidebar from "../components/layout/Sidebar/Sidebar";
import Header from "../components/layout/Header/Header";
import Footer from "../components/footer/Footer.jsx";

export default function MainLayout() {
  const dispatch = useDispatch();

  // ---------------------------------------------------------
  // Mobile sidebar
  // ---------------------------------------------------------
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------------------------------------------------------
  // Desktop sidebar collapsed state
  // ---------------------------------------------------------
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // ---------------------------------------------------------
  // Fetch logged-in user
  // ---------------------------------------------------------
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // ---------------------------------------------------------
  // Persist sidebar state
  // ---------------------------------------------------------
  useEffect(() => {
    localStorage.setItem(
      "sidebar_collapsed",
      JSON.stringify(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  // ---------------------------------------------------------
  // Close mobile sidebar
  // ---------------------------------------------------------
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // ---------------------------------------------------------
  // Open mobile sidebar
  // ---------------------------------------------------------
  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  // ---------------------------------------------------------
  // Toggle desktop sidebar
  // ---------------------------------------------------------
  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content antialiased">
      {/* =====================================================
          APPLICATION SHELL
      ====================================================== */}
      <div className="flex min-h-screen w-full">
        {/* ===================================================
            SIDEBAR
        ==================================================== */}
        <Sidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          collapsed={sidebarCollapsed}
        />

        {/* ===================================================
            RIGHT SIDE APPLICATION AREA
        ==================================================== */}
        <div className="flex min-w-0 flex-1 flex-col min-h-screen">
          {/* =================================================
              HEADER
          ================================================== */}
          <Header
            onMenuClick={handleOpenSidebar}
            collapsed={sidebarCollapsed}
            onCollapseToggle={handleSidebarToggle}
          />

          {/* =================================================
              MAIN CONTENT
          ================================================== */}
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-7">
              <div className="animate-fade-in">
                <Outlet />
              </div>
            </div>
          </main>

          {/* =================================================
              FOOTER
          ================================================== */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
