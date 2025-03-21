import { useMessages } from "../../contextProvider/useMessages";

export const MessageListsChannels = () => {
  const { users, channels, timeline } = useMessages();

  // Helper function to safely get user name
  const getUserName = (userId) => {
    // Check if users is an array
    if (Array.isArray(users)) {
      const user = users.find((u) => u.id === userId);
      return user ? user.name : userId;
    }
    // Check if users is an object with keys as user IDs
    else if (users && typeof users === "object") {
      return users[userId]?.name || userId;
    }
    return userId;
  };

  // Helper function to safely get channel name
  const getChannelName = (channelId) => {
    // Check if channels is an array
    if (Array.isArray(channels)) {
      const channel = channels.find((c) => c.id === channelId);
      return channel ? channel.name : channelId;
    }
    // Check if channels is an object with keys as channel IDs
    else if (channels && typeof channels === "object") {
      return channels[channelId]?.name || channelId;
    }
    return channelId;
  };

  // setActiveTab("All");

  return (
    <div className="flex flex-col p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        All Channel Messages
      </h2>
      {/* Timeline Section */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-semibold text-indigo-700 mb-4 border-b pb-2">
          Timeline Activity
        </h3>

        {/* {timelineLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-indigo-500 text-lg">
              Loading timeline...
            </div>
          </div>
        )}

        {timelineError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700 font-medium">Error: {timelineError}</p>
          </div>
        )}

        {!timelineLoading && timeline.length === 0 && !timelineError && (
          <div className="text-gray-500 text-center py-6 italic">
            No timeline activities found.
          </div>
        )} */}

        {/* {!timelineLoading && timeline.length > 0 && ( */}
        {timeline.length > 0 && (
          <div className="rounded-lg ">
            <ul className="divide-y divide-gray-200 overflow-y-auto max-h-[500px]">
              {timeline.map((activity) => (
                <li
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-indigo-600">
                        {getUserName(activity.userId)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 mb-2">
                      in{" "}
                      <span className="font-medium">
                        {getChannelName(activity.channelId)}
                      </span>
                    </span>
                    <p className="mt-1 text-gray-800">{activity.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
