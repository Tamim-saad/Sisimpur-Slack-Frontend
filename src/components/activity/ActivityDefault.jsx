import { MentionLists } from "./MentionLists";
import { MessageListsChannels } from "./MessageListsChannels";
import { ReactionLists } from "./ReactionLists";

export const ActivityDefault = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-white rounded-lg shadow">
          <MessageListsChannels />
        </div>
        <div className="bg-white rounded-lg shadow">
          <MentionLists />
        </div>
        <div className="bg-white rounded-lg shadow">
          <ReactionLists />
        </div>
      </div>
    </div>
  );
};
