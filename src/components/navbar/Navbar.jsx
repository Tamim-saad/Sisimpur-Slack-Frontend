import { useNavigate, Outlet } from "react-router-dom";
import React from "react";

export const Navbar = React.memo(() => {
  const navigate = useNavigate();

  const tabs = ["All", "Mentions", "Threads", "Reactions"];

  return (
    <div>
      {/* Navbar */}
      <button onClick={() => navigate("/logout")}>Logout</button>
      <div className="flex items-center space-x-4 p-3 border-b">
        <h2 className="text-lg font-semibold">Activity</h2>
        {/* Tabs */}
        <div className="flex space-x-4 ml-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`relative px-2 pb-1 text-gray-600 hover:text-black ${"font-semibold"}`}
            >
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-500 rounded"></div>
            </button>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
});
