import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { LoginForm } from "../components/auth";
import { Sidebar } from "../components/sidebar/Sidebar";
import { UserDefault } from "../components/users/UserDefault";
import { ActivityDefault } from "../components/activity/ActivityDefault";
import { ChannelDefault } from "../components/channelSearch/ChannelDefault";

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-grow overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/channels" replace />,
      },
      {
        path: "/channels",
        element: <ChannelDefault />,
      },
      {
        path: "/users",
        element: <UserDefault />,
      },
      {
        path: "/activity",
        element: <ActivityDefault />,
      },
    ],
  },
]);

export const AppRouter = ({ children }) => {
  console.log(children);
  return <RouterProvider router={router} />;
};
