import { useState, useEffect, useRef, useCallback } from "react";
import ChatInput from "../chatInput/ChatInput";
import MessageReactions from "../messageLists/MessageReactions";
import MessageContent from "../messageLists/MessageContent";
import MessageOptionsMenu from "../messageLists/MessageOptionsMenu";

export const ChannelMessages = ({
  channelName,
  channelId,
  users,
  usersArray,
}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [stamps, setStamps] = useState([]);
  const messagesEndRef = useRef(null);

  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");

  const [currentUserId, setCurrentUserId] = useState(null);

  const handleEditMessage = (messageId) => {
    const messageToEdit = messages.find((msg) => msg.id === messageId);
    if (messageToEdit) {
      setEditingMessageId(messageId);
      setEditingMessageContent(messageToEdit.content);
    }
  };

  const messageReactionsRefs = useRef({});

  const submitEditedMessage = async (messageId) => {
    try {
      const response = await fetch(
        `https://traq.duckdns.org/api/v3/messages/${messageId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editingMessageContent }),
        }
      );

      if (response.ok) {
        // Update the message locally
        setMessages(
          messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: editingMessageContent }
              : msg
          )
        );
        // Clear editing state
        setEditingMessageId(null);
        setEditingMessageContent("");
      } else {
        console.error("Failed to edit message:", await response.text());
      }
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  // Add this useEffect to fetch the current user info when component loads
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          "https://traq.duckdns.org/api/v3/users/me",
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
          console.log("Current user ID:", userData.id);
        } else {
          console.error("Failed to fetch current user:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(
          `https://traq.duckdns.org/api/v3/messages/${messageId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          // Remove message from local state
          setMessages(messages.filter((msg) => msg.id !== messageId));
        } else {
          console.error("Failed to delete message:", await response.text());
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const handlePinMessage = async (messageId) => {
    const isCurrentlyPinned = pinnedMessages.some((id) => id === messageId);

    try {
      // For pinning, we need to use the message's pin endpoint directly
      const endpoint = isCurrentlyPinned
        ? `https://traq.duckdns.org/api/v3/messages/${messageId}/pin`
        : `https://traq.duckdns.org/api/v3/messages/${messageId}/pin`;

      const response = await fetch(endpoint, {
        method: isCurrentlyPinned ? "DELETE" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update pinned messages list
        fetchPinnedMessages();

        // Provide user feedback
        console.log(
          `Message ${isCurrentlyPinned ? "unpinned" : "pinned"} successfully`
        );
      } else {
        console.error(
          `Failed to ${isCurrentlyPinned ? "unpin" : "pin"} message:`,
          await response.text()
        );
      }
    } catch (error) {
      console.error(
        `Error ${isCurrentlyPinned ? "unpinning" : "pinning"} message:`,
        error
      );
    }
  };
  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    const fetchStamps = async () => {
      try {
        const response = await fetch("https://traq.duckdns.org/api/v3/stamps", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setStamps(data);
          console.log(`Fetched ${data.length} stamps`);
        }
      } catch (error) {
        console.error("Error fetching stamps:", error);
      }
    };

    fetchStamps();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract fetchMessages as a callback so it can be reused
  const fetchMessages = useCallback(async () => {
    if (!channelId) return;

    setIsLoading(true);
    try {
      console.log(`Fetching messages for channel ${channelId}...`);

      const response = await fetch(
        `https://traq.duckdns.org/api/v3/channels/${channelId}/messages?limit=100`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array before proceeding
      if (!Array.isArray(data)) {
        console.error("Unexpected API response format:", data);
        setError("Unexpected API response format");
        return;
      }

      // Sort by creation date to ensure chronological order
      const sortedData = [...data].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      const uniqueUserIds = [...new Set(sortedData.map((m) => m.userId))];
      console.log(
        `Fetched ${sortedData.length} messages from ${uniqueUserIds.length} users in channel ${channelId}`
      );

      // Check for missing user info
      const missingUserIds = uniqueUserIds.filter((userId) => !users[userId]);
      if (missingUserIds.length > 0) {
        console.warn(
          `Missing user data for ${missingUserIds.length} users:`,
          missingUserIds
        );
      }

      setMessages(sortedData);
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, users]);

  // Fetch pinned messages function
  const fetchPinnedMessages = useCallback(async () => {
    if (!channelId) return;

    try {
      const response = await fetch(
        `https://traq.duckdns.org/api/v3/channels/${channelId}/pins`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPinnedCount(data.length);

        // Extract message IDs from pinned messages
        const pinnedIds = data.map((pin) => pin.messageId);
        setPinnedMessages(pinnedIds);
        console.log(`Channel has ${data.length} pinned messages:`, pinnedIds);
      }
    } catch (error) {
      console.error("Error fetching pinned messages:", error);
    }
  }, [channelId]);

  useEffect(() => {
    // Reset states when channel changes
    setMessages([]);
    setError(null);
    setIsLoading(true);

    // Only fetch if we have a channelId
    if (!channelId) {
      setIsLoading(false);
      return;
    }

    fetchMessages();
    fetchPinnedMessages();
  }, [channelId, fetchMessages, fetchPinnedMessages]);

  // Add a function to debug display received messages
  const debugMessages = () => {
    if (messages.length > 0) {
      console.log("Messages being displayed:", messages);
      console.log("Users available:", users);
      console.log(
        "Message user IDs:",
        messages.map((m) => m.userId)
      );

      // Check if user details are properly mapped
      const missingUsers = messages
        .filter((m) => !users[m.userId])
        .map((m) => m.userId);
      if (missingUsers.length > 0) {
        console.warn(`Missing user details for users:`, missingUsers);
      }
    }
  };

  useEffect(() => {
    debugMessages();
  }, [messages, users]);

  if (!channelId) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-gray-500">
        Select a channel to view messages
      </div>
    );
  }

  // const parseMessage = (content) => {
  //   if (!content) return "";
  //   return content.replace(/!\{.*?"raw":"(.*?)".*?\}/g, "$1");
  // };

  const handleSendMessage = async (message, files) => {
    if (!channelId) return;

    try {
      // First, handle file uploads if there are any files
      let fileIds = [];

      if (files && files.length > 0) {
        // Upload each file and collect their IDs
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);

          const fileResponse = await fetch(
            "https://traq.duckdns.org/api/v3/files",
            {
              method: "POST",
              credentials: "include",
              body: formData,
            }
          );

          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            fileIds.push(fileData.id);
            console.log(
              `Uploaded file: ${file.name}, received ID: ${fileData.id}`
            );
          } else {
            console.error(
              `Failed to upload file ${file.name}:`,
              await fileResponse.text()
            );
          }
        }
      }

      // After uploading files, send the message with file references
      let finalMessage = message;

      // If we have uploaded files, append their IDs to the message content
      if (fileIds.length > 0) {
        fileIds.forEach((fileId) => {
          finalMessage += `\n!{${fileId}}`;
        });
      }

      // Send the message with any file references
      const messageResponse = await fetch(
        `https://traq.duckdns.org/api/v3/channels/${channelId}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: finalMessage }),
        }
      );

      if (messageResponse.ok) {
        // After successful send, refresh all messages
        fetchMessages();
      } else {
        console.error("Failed to send message:", await messageResponse.text());
      }
    } catch (error) {
      console.error("Error sending message with files:", error);
    }
  };

  // Add this function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">#{channelName}</h2>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <span className="flex items-center">{pinnedCount} pinned</span>
            <span className="ml-4">{messages.length} messages</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Error: {error}
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex justify-center my-4">
                  <div className="bg-gray-100 text-gray-500 text-sm py-1 px-3 rounded-full">
                    {date}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-4">
                  {dateMessages.map((message) => {
                    // Make the user lookup more robust
                    const user =
                      users && message.userId && users[message.userId]
                        ? users[message.userId]
                        : {
                            displayName: message.userId
                              ? `Unknown (${message.userId.slice(0, 8)})`
                              : "Unknown User",
                            name: message.userId || "unknown",
                          };

                    const isPinned = pinnedMessages.includes(message.id);

                    return (
                      <div
                        key={message.id}
                        className="p-4 bg-white shadow rounded-lg relative"
                      >
                        {/* Message options menu button - top right */}
                        <div className="absolute top-2 right-2 flex items-center">
                          {/* Add reaction button */}
                          <button
                            onClick={() =>
                              messageReactionsRefs.current[
                                message.id
                              ]?.setIsEmojiPickerOpen(true)
                            }
                            className="text-gray-400 hover:text-gray-600 mr-2 p-1 rounded hover:bg-gray-100"
                            title="Add reaction"
                          >
                            <span className="text-sm">+</span>
                          </button>
                          <MessageOptionsMenu
                            messageId={message.id}
                            messageUserId={message.userId}
                            currentUserId={currentUserId}
                            onEdit={handleEditMessage}
                            onDelete={handleDeleteMessage}
                            onPin={handlePinMessage}
                            isPinned={isPinned}
                          />
                        </div>

                        {/* Pin indicator if message is pinned */}
                        {isPinned && (
                          <div
                            className="absolute top-2 right-10 text-blue-500"
                            title="Pinned message"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </div>
                        )}

                        <div className="flex items-center space-x-3">
                          <img
                            className="w-10 h-10 rounded-full border border-gray-300"
                            src={`https://traq.duckdns.org/api/v3/files/${
                              user.iconFileId || "default"
                            }`}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/40";
                            }}
                            alt={user.displayName || user.name || "User"}
                          />
                          <div>
                            <span className="font-semibold text-gray-800">
                              {user.displayName || user.name || "Unknown User"}
                            </span>
                            <p className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        {editingMessageId === message.id ? (
                          // Editing mode
                          <div className="mt-2">
                            <textarea
                              className="w-full p-2 border rounded-md"
                              value={editingMessageContent}
                              onChange={(e) =>
                                setEditingMessageContent(e.target.value)
                              }
                              rows={3}
                              autoFocus
                            />
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => submitEditedMessage(message.id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditingMessageContent("");
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Normal display mode
                          <div className="mt-2 text-gray-700 whitespace-pre-wrap">
                            <MessageContent
                              content={message.content}
                              stamps={stamps}
                            />
                          </div>
                        )}

                        <MessageReactions
                          ref={(el) => {
                            // Store a ref for each message
                            if (el) {
                              messageReactionsRefs.current[message.id] = el;
                            }
                          }}
                          messageId={message.id}
                          users={users}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No messages in this channel
          </div>
        )}
      </div>

      {/* Chat input fixed at the bottom */}
      <div className="mt-auto">
        <ChatInput
          channelId={channelId}
          onSendMessage={(message, files) => handleSendMessage(message, files)}
          users={usersArray || []}
        />
      </div>
    </div>
  );
};