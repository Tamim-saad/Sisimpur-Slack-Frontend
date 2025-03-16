export const UserInfo = ({ userId, channelId, users, channels }) => {
  const user = users[userId];
  const channel = channels.find((channel) => channel.id === channelId);
  return (
    <div className="flex items-center space-x-4">
      <img
        className="w-10 h-10 rounded-full border-2 border-gray-300"
        src={`https://traq.duckdns.org/api/v3/files/${user?.iconFileId}`}
        alt={user?.displayName || "Unknown"}
      />
      <div>
        <p className="font-semibold text-gray-900 text-lg">
          {user?.displayName || "Unknown"}
        </p>
        <p className="text-sm text-gray-500">#{channel?.name || "Unknown"}</p>
      </div>
    </div>
  );
};
