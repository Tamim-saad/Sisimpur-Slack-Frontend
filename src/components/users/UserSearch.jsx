import { useEffect, useState } from "react";
import { UserDirectMessages } from "./UserDirectMessages";

export const UserSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setallUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://traq.duckdns.org/api/v3/users?limit=100",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setallUsers(data);
        console.log(allUsers);
      } else {
        console.error("Error fetching data:");
      }
    } catch (error) {
      console.log("Error Fetching", error);
    } finally {
      setIsLoading(false);
      console.log(isLoading);
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (activeFilter === "all") {
      fetchAllUsers();
    }
  }, [activeFilter]);

  useEffect(() => {
    if (!allUsers) return;
    let result = [...allUsers];

    switch (activeFilter) {
      case "all":
        break;
      default:
        break;
    }

    if (searchTerm.trim() !== "") {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(result);
  }, [allUsers, activeFilter, searchTerm]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex flex-row w-full h-full">
      <aside className="p-4 border-r border-gray-300 overflow-y-auto w-1/3">
        <div className="w-full p-2 border border-gray-300 rounded-lg flex items-center justify-between">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex flex-row space-x-2 mt-3">
          <button
            className={`p-2 border ${
              activeFilter === "all"
                ? "bg-blue-500 text-white"
                : "border-gray-300"
            } rounded-lg`}
            onClick={() => handleFilterClick("all")}
          >
            <b>all</b>
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {isLoading ? (
            <li className="p-2 text-gray-500">Loading users...</li>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <li
                key={user.id}
                className={`p-2 rounded-lg cursor-pointer ${
                  selectedUser && selectedUser.id === user.id
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 border border-blue-400"
                }`}
                onClick={() => handleUserClick(user)}
              >
                #{user.name}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No users found</li>
          )}
        </ul>
      </aside>
      <div className="flex-1">
        {selectedUser ? (
          <UserDirectMessages user={selectedUser} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a user to start a direct message
          </div>
        )}
      </div>
    </div>
  );
};
