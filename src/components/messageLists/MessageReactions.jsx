import { useState, useEffect } from "react";

const MessageReactions = ({ messageId, users }) => {
  const [reactions, setReactions] = useState([]);
  const [stamps, setStamps] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all available stamps once
  useEffect(() => {
    const fetchStamps = async () => {
      try {
        const response = await fetch("https://traq.duckdns.org/api/v3/stamps", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // Create a map for easy lookup
          const stampMap = {};
          data.forEach((stamp) => {
            stampMap[stamp.id] = stamp;
          });
          setStamps(stampMap);
        }
      } catch (error) {
        console.error("Error fetching stamps:", error);
      }
    };

    fetchStamps();
  }, []);

  // Fetch reactions for this specific message
  useEffect(() => {
    const fetchReactions = async () => {
      if (!messageId) return;

      try {
        const response = await fetch(
          `https://traq.duckdns.org/api/v3/messages/${messageId}/stamps`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setReactions(data);
        }
      } catch (error) {
        console.error(
          `Error fetching reactions for message ${messageId}:`,
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [messageId]);

  // Group reactions by stampId and count them
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.stampId]) {
      acc[reaction.stampId] = {
        count: 0,
        users: [],
        stampId: reaction.stampId,
      };
    }

    acc[reaction.stampId].count += 1;
    acc[reaction.stampId].users.push(reaction.userId);

    return acc;
  }, {});

  const getEmojiForStamp = (stampId) => {
    const stamp = stamps[stampId];

    if (!stamp) return "⭐"; // Default fallback

    return "⭐"; // Default fallback if no match
  };

  if (isLoading) {
    return (
      <div className="mt-2 text-xs text-gray-400">Loading reactions...</div>
    );
  }

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {Object.values(groupedReactions).map((reaction) => {
        const stamp = stamps[reaction.stampId];
        const tooltipText = reaction.users
          .map((userId) => {
            const user = users[userId];
            return user ? user.displayName || user.name : "Unknown User";
          })
          .join(", ");

        return (
          <div
            key={reaction.stampId}
            className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 cursor-pointer"
            title={tooltipText}
          >
            {stamp && stamp.fileId ? (
              // Use the stamp image if available
              <img
                src={`https://traq.duckdns.org/api/v3/files/${stamp.fileId}`}
                className="w-5 h-5 mr-1"
                alt={stamp.name || "reaction"}
                onError={(e) => {
                  // If image fails to load, fallback to emoji
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "inline";
                }}
              />
            ) : null}
            {/* Always include the emoji (hidden if image loads correctly) */}
            <span
              className="text-sm mr-1"
              style={{ display: stamp && stamp.fileId ? "none" : "inline" }}
            >
              {getEmojiForStamp(reaction.stampId)}
            </span>
            <span className="text-xs font-medium">{reaction.count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MessageReactions;
