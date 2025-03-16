import { Sidebar } from "../sidebar/Sidebar";
import { UserDirectMessages } from "./UserDirectMessages";
import { UserSearch } from "./UserSearch";

export const UserDefault = () => {
  return (
    <div className="flex">
      <UserSearch />
      <UserDirectMessages />
    </div>
  );
};
