import React, { createContext, useState, useEffect } from "react";

// Create the context
export const ChannelContext = createContext();

// Create the provider component
export const ChannelProvider = ({ children }) => {
  const [channels, setChannels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch channels when the provider mounts
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(
          "https://traq.duckdns.org/api/v3/channels",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("API returned channels:", data);

          // Handle both array and object formats
          if (Array.isArray(data)) {
            // Convert array to object with id as keys
            const channelsObj = {};
            data.forEach((channel) => {
              if (channel && channel.id) {
                // Include all channels regardless of archive status
                channelsObj[channel.id] = {
                  ...channel,
                  // Ensure name exists - use fallbacks if needed
                  name:
                    channel.name ||
                    channel.topic ||
                    `Channel-${channel.id.substring(0, 6)}`,
                };
              }
            });
            console.log("Processed channels object:", channelsObj);
            setChannels(channelsObj);
          } else if (typeof data === "object" && data !== null) {
            // Already in object format
            const processedData = {};
            Object.keys(data).forEach((key) => {
              processedData[key] = {
                ...data[key],
                name:
                  data[key].name ||
                  data[key].topic ||
                  `Channel-${key.substring(0, 6)}`,
              };
            });
            console.log("Processed channels object:", processedData);
            setChannels(processedData);
          } else {
            console.error("Unexpected data format:", data);
            setError("Unexpected data format from API");
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch channels:", errorText);
          setError(
            `Failed to fetch channels: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
        setError("Error connecting to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  // Function to add a new channel
  const addChannel = (newChannel) => {
    if (!newChannel || !newChannel.id) {
      console.error("Invalid channel data:", newChannel);
      return;
    }

    setChannels((prevChannels) => {
      console.log("Previous channels:", prevChannels);
      console.log("Adding new channel:", newChannel);

      // Create a new object with all previous channels plus the new one
      const updatedChannels = {
        ...prevChannels,
        [newChannel.id]: newChannel,
      };

      console.log("Updated channels:", updatedChannels);
      return updatedChannels;
    });
  };

  return (
    <ChannelContext.Provider
      value={{ channels, setChannels, addChannel, loading, error }}
    >
      {children}
    </ChannelContext.Provider>
  );
};
