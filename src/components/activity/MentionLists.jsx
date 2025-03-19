import { useMessages } from "../../contextProvider/useMessages";
import { MessageCard } from "../messages";
export const MentionLists = () => {
  const {
    filteredMessages,
    users,
    channels,
    stamps,
    // setActiveTab,
    isLoading,
    error,
  } = useMessages();

  // setActiveTab("Mentions");

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6">
        Messages with Mentions
      </h2>

      <div className="w-full max-w-4xl h-[calc(100vh-180px)] overflow-y-auto">
        <div className="space-y-2">
          {isLoading && (
            <p className="text-gray-500 text-lg text-center">
              Loading messages...
            </p>
          )}
          {error && <p className="text-red-500 text-lg text-center">{error}</p>}

          {!isLoading && filteredMessages.length === 0 ? (
            <p className="text-gray-500 text-lg text-center">
              No messages found.
            </p>
          ) : (
            filteredMessages.map((msg) => (
              <MessageCard
                key={msg.id}
                msg={msg}
                users={users}
                channels={channels}
                stamps={stamps}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
