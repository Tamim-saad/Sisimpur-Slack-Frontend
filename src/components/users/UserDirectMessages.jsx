import { useEffect, useState, useRef } from "react";
import ChatInput from "../chatInput/ChatInput";
import MessageReactions from "../messageLists/MessageReactions";

export const UserDirectMessages = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const messagesEndRef = useRef(null);

  // Fetch functions and other logic remain the same...
  const fetchAllUsers = async () => {
    // Implementation unchanged
    try {
      const response = await fetch("https://traq.duckdns.org/api/v3/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Convert array to map for easy lookup
        const usersMap = {};
        data.forEach((user) => {
          usersMap[user.id] = user;
        });
        setAllUsers(usersMap);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAllDirectMessages = async () => {
    // Implementation unchanged
    if (!user || !user.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://traq.duckdns.org/api/v3/users/${user.id}/messages?limit=100`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const sortedData = [...data].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setAllMessages(sortedData);
      } else {
        console.error("Error fetching data:", response.status);
      }
    } catch (error) {
      console.log("Error Fetching", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handleSendMessage = async (message) => {
    // Implementation unchanged
    if (!user?.id || !message.trim()) return;

    try {
      const response = await fetch(
        `https://traq.duckdns.org/api/v3/users/${user.id}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
          }),
        }
      );

      if (response.ok) {
        fetchAllDirectMessages();
      } else {
        console.error("Failed to send message:", response.status);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllDirectMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const parseMessage = (content) => {
    if (!content) return "";
    return content.replace(/!\{.*?"raw":"(.*?)".*?\}/g, "$1");
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      if (!message.createdAt) return;
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(allMessages);

  return (
    <>
      {!user ? (
        <></>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            {/* User header section */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center">
              {/* User info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  @{user.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Direct Messages</p>
              </div>
            </div>

            {/* Messages content */}
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-pulse text-gray-500">
                    Loading messages...
                  </div>
                </div>
              ) : allMessages.length > 0 ? (
                <div className="space-y-6">
                  {/* Group messages by date */}
                  {Object.entries(messageGroups).map(([date, messages]) => (
                    <div key={date} className="mb-6">
                      {/* Date divider */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-gray-100 text-gray-500 text-sm py-1 px-3 rounded-full">
                          {date}
                        </div>
                      </div>

                      {/* Messages for this date */}
                      <ul className="space-y-4">
                        {messages.map((msg, index) => (
                          <li
                            key={msg.id || index}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-150"
                          >
                            {/* Time display */}
                            <div className="flex items-center mb-2">
                              <div className="text-sm text-gray-500">
                                {new Date(
                                  msg.createdAt || Date.now()
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            {/* Message content */}
                            <div
                              className="text-gray-800"
                              dangerouslySetInnerHTML={{
                                __html: parseMessage(msg.content),
                              }}
                            />
                            {/* Add the MessageReactions component */}
                            {msg.id && (
                              <MessageReactions
                                messageId={msg.id}
                                users={allUsers}
                              />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
                  <p>No messages found</p>
                  <p className="text-sm mt-2">
                    Start a conversation with {user.name}
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Chat input fixed at the bottom */}
          <div className="mt-auto">
            <ChatInput
              channelId={user.id}
              onSendMessage={handleSendMessage}
              placeholder={`Message @${user.name}`}
            />
          </div>
        </div>
      )}
    </>
  );
};
