import { createContext, useState, useEffect } from "react";

export const MessageContext = createContext();

const extractMentions = (content) => {
  if (!content) return [];
  const plainMentions = content.match(/@\S+/g) || [];
  const jsonMentions = [];
  const jsonMentionRegex = /!\{"type":"user","raw":"@(.*?)","id":".*?"\}/g;
  let match;

  while ((match = jsonMentionRegex.exec(content)) !== null) {
    jsonMentions.push(`@${match[1]}`); // Extract "@username" from JSON
  }

  return [...plainMentions, ...jsonMentions]; // Combine both plain and JSON mentions
};

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [channels, setChannels] = useState({});
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [stamps, setStamps] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userRes = await fetch(
          "https://traq.duckdns.org/api/v3/users/me",
          {
            credentials: "include",
          }
        ).then((res) => res.json());

        if (!userRes.id) {
          console.error("Failed to fetch logged-in user.");
          return;
        }
        setCurrentUser(userRes);

        const channelsRes = await fetch(
          "https://traq.duckdns.org/api/v3/channels",
          {
            credentials: "include",
          }
        ).then((res) => res.json());

        setChannels(channelsRes.public || []);

        const usersRes = await fetch("https://traq.duckdns.org/api/v3/users", {
          credentials: "include",
        }).then((res) => res.json());

        setUsers(
          usersRes.reduce((acc, user) => ({ ...acc, [user.id]: user }), {})
        );

        const messagesPromises = channelsRes.public.map(async (channel) => {
          const res = await fetch(
            `https://traq.duckdns.org/api/v3/channels/${channel.id}/messages?limit=100`,
            {
              credentials: "include",
              headers: {
                Accept: "application/json",
              },
            }
          );
          return res.json();
        });

        const messagesArray = await Promise.all(messagesPromises);
        const combinedMessages = messagesArray
          .flat()
          .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        setMessages(combinedMessages);

        const stampRes = await fetch("https://traq.duckdns.org/api/v3/stamps", {
          credentials: "include",
        }).then((res) => res.json());

        setStamps(
          stampRes.reduce(
            (acc, stamp) => ({
              ...acc,
              [stamp.id]: `https://traq.duckdns.org/api/v3/files/${stamp.fileId}`,
            }),
            {}
          )
        );

        filterMessages("All", combinedMessages, userRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false once fetching is complete
      }
    };

    fetchAllData();
  }, []);

  const filterMessages = (tab, allMessages = messages, user = currentUser) => {
    if (!user) return;
    let newFilteredMessages = [];

    switch (tab) {
      case "All":
        newFilteredMessages = allMessages;
        break;
      case "Mentions":
        newFilteredMessages = allMessages.filter((msg) => {
          const mentions = extractMentions(msg.content);
          return mentions.some((mention) => mention === `@${user.name}`);
        });
        break;
      case "Reactions":
        newFilteredMessages = allMessages.filter(
          (msg) => msg?.stamps?.length > 0 && msg.userId === user.id
        );
        break;
      default:
        newFilteredMessages = allMessages;
        break;
    }
    setFilteredMessages(newFilteredMessages);
  };

  const setActiveTabAndFilter = (tab) => {
    setActiveTab(tab);
    filterMessages(tab);
  };

  return (
    <MessageContext.Provider
      value={{
        filteredMessages,
        users,
        channels,
        stamps,
        activeTab,
        setActiveTab: setActiveTabAndFilter,
        loading,
      }}
    >
      {loading ? <p>Loading...</p> : children}
    </MessageContext.Provider>
  );
};
