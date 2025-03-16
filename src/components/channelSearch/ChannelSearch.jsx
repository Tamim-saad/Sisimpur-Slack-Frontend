import { useState, useEffect } from "react";

export const ChannelSearch = ({
  channels,
  search,
  setSearch,
  onChannelSelect, // Add this prop for handling channel selection
  selectedChannelId, // Add this prop to track selected channel
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // States for filtering
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [starredChannels, setStarredChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Fetch starred channels when component mounts and when filter changes
  useEffect(() => {
    if (activeFilter === "favourite") {
      fetchStarredChannels();
    }
  }, [activeFilter]);

  const handleChannelClick = (channel) => {
    if (onChannelSelect) {
      onChannelSelect(channel.id, channel.name);
    }
  };

  // Fetch starred channels from API with improved logging
  const fetchStarredChannels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://traq.duckdns.org/api/v3/users/me/stars",
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Starred items response:", data);

        // The data from the API is already an array of starred channel IDs
        setStarredChannels(data);
        console.log("Starred channel IDs:", data);
      } else {
        console.error("Failed to fetch starred channels:", response.status);
        console.error("Response text:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching starred channels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update filtered channels with improved debugging
  useEffect(() => {
    if (!channels) return;

    let result = Object.values(channels);
    console.log("All channels:", result);

    // Apply search filter if search term exists
    if (search) {
      result = result.filter((channel) =>
        channel.name.toLowerCase().includes(search.toLowerCase())
      );
      console.log("After search filter:", result);
    }

    // Apply other filters based on activeFilter
    switch (activeFilter) {
      case "all":
        // No additional filtering needed
        break;
      case "favourite":
        // Only apply favorite filter if we have starred channels
        if (starredChannels.length > 0) {
          console.log("Filtering by starred channels:", starredChannels);

          result = result.filter((channel) => {
            // Check if this channel's ID is in our starred channels list
            const isStarred = starredChannels.includes(channel.id);
            console.log(
              `Channel ${channel.name} (${channel.id}): is starred = ${isStarred}`
            );
            return isStarred;
          });

          console.log("After starred filter:", result);
        } else {
          console.log("No starred channels to filter with");
          // If no starred channels, show empty list
          result = [];
        }
        break;
      case "mentions":
        // Placeholder for mentions filtering
        result = result.filter((channel) => channel.hasMentions === true);
        break;
      case "reactions":
        // Placeholder for reactions filtering
        result = result.filter((channel) => channel.hasReactions === true);
        break;
      default:
        break;
    }

    setFilteredChannels(result);
  }, [channels, search, activeFilter, starredChannels]);

  const handleNewChannelBtn = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewChannelName("");
    setSelectedParent("");
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const createChannel = async () => {
    if (!newChannelName) {
      alert("Channel name is required.");
      return;
    }

    if (!/^[a-zA-Z0-9-_]{1,20}$/.test(newChannelName)) {
      alert(
        "Channel name must be 1-20 characters long and can only contain letters, numbers, hyphens, and underscores."
      );
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("https://traq.duckdns.org/api/v3/channels", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChannelName,
          parent: selectedParent || null,
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log("Channel created:", data);
        alert("Channel created successfully");
        closeModal();
      } else if (response.status === 400) {
        alert("Bad Request: Please check the input values.");
      } else if (response.status === 403) {
        alert("Forbidden: You do not have permission to create a channel.");
      } else if (response.status === 409) {
        alert("Conflict: A channel with the specified name already exists.");
      } else {
        console.error("Failed to create channel:", await response.text());
        alert("Failed to create channel. Please try again.");
      }
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Error creating channel. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <aside className="p-4 border-r border-gray-300 overflow-y-auto">
      <div className="w-full p-2 border border-gray-300 rounded-lg flex items-center justify-between">
        <input
          type="text"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleNewChannelBtn}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <b>New</b>
        </button>
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
        <button
          className={`p-2 border ${
            activeFilter === "favourite"
              ? "bg-blue-500 text-white"
              : "border-gray-300"
          } rounded-lg`}
          onClick={() => handleFilterClick("favourite")}
        >
          <b>favourite</b>
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {isLoading ? (
          <li className="p-2 text-gray-500">Loading channels...</li>
        ) : filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => (
            <li
              key={channel.id}
              className={`p-2 rounded-lg cursor-pointer ${
                selectedChannelId === channel.id
                  ? "bg-blue-100 border border-blue-400"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleChannelClick(channel)}
            >
              #{channel.name}
            </li>
          ))
        ) : (
          <li className="p-2 text-gray-500">{/* ...existing code... */}</li>
        )}
      </ul>

      {/* Modal for creating new channel */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Create a channel</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Parent Channel
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
              >
                <option value="">Root (No parent)</option>
                {channels &&
                  Object.values(channels)
                    .filter((channel) => channel && channel.name)
                    .map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        #{channel.name}
                      </option>
                    ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Channel name
                <span className="text-gray-500 text-xs ml-1">
                  {newChannelName.length}/20
                </span>
              </label>
              <input
                type="text"
                maxLength={20}
                pattern="[a-zA-Z0-9-_]+"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={newChannelName}
                onChange={(e) =>
                  setNewChannelName(
                    e.target.value.replace(/[^a-zA-Z0-9-_]/g, "")
                  )
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                When executed, a new # is created. (You can't delete or move a
                channel or change the channel name after it's created.)
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                  !newChannelName || isCreating
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={!newChannelName || isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
