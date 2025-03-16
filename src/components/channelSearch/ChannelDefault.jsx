import { useEffect, useState } from "react";
import { ChannelSearch } from "../channelSearch/ChannelSearch";
import { ChannelMessages } from "../channelSearch/ChannelMessages";

export const ChannelDefault = () => {
  const [users, setUsers] = useState({}); // Object map for efficient lookups
  const [usersArray, setUsersArray] = useState([]); // Array for components that need to iterate
  const [channels, setChannels] = useState({});
  const [search, setSearch] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [setSelectedChannelName] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, channelsRes] = await Promise.all([
          fetch("https://traq.duckdns.org/api/v3/users", {
            credentials: "include",
          }).then((res) => res.json()),
          fetch("https://traq.duckdns.org/api/v3/channels", {
            credentials: "include",
          }).then((res) => res.json()),
        ]);

        console.log("Users API response:", usersRes);

        if (usersRes.message === "You are not logged in") {
          console.error("Authentication failed. Please log in again.");
          return;
        }

        // Save the original array
        if (Array.isArray(usersRes)) {
          setUsersArray(usersRes);

          // Also create the map for efficient lookups
          const userMap = usersRes.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});
          setUsers(userMap);
        }

        const channelMap = Array.isArray(channelsRes.public)
          ? channelsRes.public.reduce((acc, channel) => {
              acc[channel.id] = channel;
              return acc;
            }, {})
          : {};

        setChannels(channelMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const handleChannelSelect = (channelId, channelName) => {
    setSelectedChannelId(channelId);
    setSelectedChannelName(channelName);
  };

  return (
    <div className="flex h-screen">
      <ChannelSearch
        channels={channels}
        search={search}
        setSearch={setSearch}
        onChannelSelect={handleChannelSelect}
        selectedChannelId={selectedChannelId}
      />
      <ChannelMessages
        channelId={selectedChannelId}
        // channelName={selectedChannelName}
        users={users}
        usersArray={usersArray} // Pass both formats
      />
    </div>
  );
};
