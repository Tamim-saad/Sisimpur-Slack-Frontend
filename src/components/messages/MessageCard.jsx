import { MessageContent, Stamps, UserInfo } from "../messages";

export const MessageCard = ({ msg, users, channels, stamps }) => (
  <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
    <UserInfo
      userId={msg.userId}
      channelId={msg.channelId}
      users={users}
      channels={channels}
    />
    <MessageContent content={msg.content} />
    <Stamps stamps={msg.stamps} stampImages={stamps} />
  </div>
);
