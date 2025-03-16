import React from "react";
import { NavLink } from "react-router-dom";

export const Sidebar = () => {
  return (
    <aside className="bg-gray-800 text-white p-4 w-25 h-full">
      <h1 className="text-xl font-bold mb-4">Sidebar</h1>
      <nav>
        <NavLink
          to="/channels"
          className="block py-2 hover:bg-gray-700 rounded"
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Channel
        </NavLink>
        <NavLink
          to="/activity"
          className="block py-2 hover:bg-gray-700 rounded"
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          Activity
        </NavLink>
        <NavLink
          to="/users"
          className="block py-2 hover:bg-gray-700 rounded"
          aria-current={({ isActive }) => (isActive ? "page" : undefined)}
        >
          User
        </NavLink>
      </nav>
    </aside>
  );
};
