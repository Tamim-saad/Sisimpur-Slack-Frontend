import React from "react";
import { MentionLists } from "./MentionLists";
import { MessageListsChannels } from "./MessageListsChannels";
import { ReactionLists } from "./ReactionLists";
import { useMessages } from "../../contextProvider/useMessages";

export const ActivityDefault = () => {
  const { activeTab, setActiveTab } = useMessages();

  // Set a default tab if none is active
  React.useEffect(() => {
    if (!activeTab) {
      setActiveTab("Mentions");
    }
  }, [activeTab, setActiveTab]);

  const handleMention = () => {
    setActiveTab("Mentions");
  };
  const handleReaction = () => {
    setActiveTab("Reactions");
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-gray-50">
      {/* Messages panel - takes full width on mobile, set width on larger screens */}
      <div className="w-full md:w-7/12 lg:w-8/12 p-4">
        <div className="bg-white rounded-lg shadow-md h-full overflow-auto">
          <MessageListsChannels />
        </div>
      </div>

      {/* Activity panel with tabs */}
      <div className="w-full md:w-5/12 lg:w-4/12 border-l border-gray-200 flex flex-col">
        {/* Tab buttons */}
        <div className="flex flex-row md:space-x-2 p-3 bg-white border-b border-gray-200">
          <button
            onClick={handleMention}
            className={`px-4 py-2 rounded-lg flex-1 md:flex-none md:w-32 font-medium transition-all duration-200 ${
              activeTab === "Mentions"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mentions
          </button>
          <button
            onClick={handleReaction}
            className={`px-4 py-2 rounded-lg flex-1 md:flex-none md:w-32 font-medium transition-all duration-200 ${
              activeTab === "Reactions"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Reactions
          </button>
        </div>

        {/* Tab content */}
        <div className="p-4 flex-grow overflow-auto">
          {activeTab === "Mentions" && (
            <div className="bg-white rounded-lg shadow-md h-full">
              <MentionLists />
            </div>
          )}
          {activeTab === "Reactions" && (
            <div className="bg-white rounded-lg shadow-md h-full">
              <ReactionLists />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
