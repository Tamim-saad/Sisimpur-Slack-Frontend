import { useState, useRef, useEffect } from "react";

const ChatInput = ({ channelId, onSendMessage, users = [] }) => {
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMentionListOpen, setIsMentionListOpen] = useState(false);
  const [searchMention, setSearchMention] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [stamps, setStamps] = useState([]);
  const [stampCategories, setStampCategories] = useState({});
  const [currentCategory, setCurrentCategory] = useState("");
  const [recentlyUsedStamps, setRecentlyUsedStamps] = useState([]);
  const [isLoadingStamps, setIsLoadingStamps] = useState(true);
  // Add state for emoji search
  const [emojiSearchTerm, setEmojiSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mentionListRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiSearchRef = useRef(null);

  // Track cursor position for mention insertion
  const [cursorPosition, setCursorPosition] = useState(0);

  // Fetch stamps from the API
  useEffect(() => {
    const fetchStamps = async () => {
      setIsLoadingStamps(true);
      try {
        const response = await fetch("https://traq.duckdns.org/api/v3/stamps", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setStamps(data);

          // Create categories from stamps
          const categories = categorizeStamps(data);
          setStampCategories(categories);

          // Set initial category if available
          if (Object.keys(categories).length > 0) {
            setCurrentCategory(Object.keys(categories)[0]);
          }

          // Initialize recently used with a few common stamps if available
          const initialRecent = data.slice(0, 5).map((stamp) => ({
            id: stamp.id,
            name: stamp.name,
            fileId: stamp.fileId,
            isUnicode: stamp.isUnicode,
          }));

          setRecentlyUsedStamps(initialRecent);
        }
      } catch (error) {
        console.error("Error fetching stamps:", error);
      } finally {
        setIsLoadingStamps(false);
      }
    };

    fetchStamps();
  }, []);

  // Effect for handling emoji search
  useEffect(() => {
    if (!emojiSearchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = emojiSearchTerm.toLowerCase();
    const results = stamps.filter((stamp) =>
      stamp.name.toLowerCase().includes(term)
    );

    setSearchResults(results.slice(0, 30)); // Limit to 30 results for performance
  }, [emojiSearchTerm, stamps]);

  const categorizeStamps = (stamps) => {
    const categories = {
      "Frequently Used": [],
      Smileys: [],
      Reactions: [],
      Objects: [],
      Other: [],
    };

    stamps.forEach((stamp) => {
      const name = stamp.name.toLowerCase();

      if (
        name.includes("smile") ||
        name.includes("face") ||
        name.includes("laugh") ||
        name.includes("grin") ||
        name.includes("joy")
      ) {
        categories["Smileys"].push(stamp);
      } else if (
        name.includes("thumbs") ||
        name.includes("clap") ||
        name.includes("ok") ||
        name.includes("up") ||
        name.includes("down") ||
        name.includes("like")
      ) {
        categories["Reactions"].push(stamp);
      } else if (
        name.includes("car") ||
        name.includes("phone") ||
        name.includes("book") ||
        name.includes("food") ||
        name.includes("ball")
      ) {
        categories["Objects"].push(stamp);
      } else {
        categories["Other"].push(stamp);
      }

      if (
        name.includes("like") ||
        name.includes("ok") ||
        name.includes("smile") ||
        name.includes("lol") ||
        name.includes("heart")
      ) {
        if (categories["Frequently Used"].length < 15) {
          categories["Frequently Used"].push(stamp);
        }
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach((key) => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  };

  // Reset emoji search when opening/closing picker
  useEffect(() => {
    if (!isEmojiPickerOpen) {
      setEmojiSearchTerm("");
    } else if (isEmojiPickerOpen && emojiSearchRef.current) {
      // Focus on search when opening
      setTimeout(() => {
        emojiSearchRef.current?.focus();
      }, 100);
    }
  }, [isEmojiPickerOpen]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setIsEmojiPickerOpen(false);
      }
      if (
        mentionListRef.current &&
        !mentionListRef.current.contains(event.target) &&
        !event.target.value?.includes("@")
      ) {
        setIsMentionListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Monitor message for @ character to trigger mention list
  useEffect(() => {
    // Find the most recent @ character position
    const lastAtPos = message.lastIndexOf("@");

    if (lastAtPos !== -1 && lastAtPos <= cursorPosition) {
      // Get the text after the @ up to the cursor
      const mentionText = message.slice(lastAtPos + 1, cursorPosition);
      setSearchMention(mentionText);
      setIsMentionListOpen(true);
    } else {
      setIsMentionListOpen(false);
    }
  }, [message, cursorPosition]);

  const handleSendMessage = () => {
    if (message.trim() || selectedFiles.length > 0) {
      // Send both text message and files
      onSendMessage(message.trim(), selectedFiles);
      setMessage("");
      setSelectedFiles([]);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files && files.length > 0) {
      // Store the actual file objects
      setSelectedFiles((prev) => [...prev, ...files]);

      // Add file names to message as a preview
      const fileNames = files.map((file) => file.name).join(", ");
      setMessage((prev) => `${prev} [Files: ${fileNames}] `);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );

    // Update message text to remove the file reference
    setMessage((prev) => {
      const parts = prev.split("[Files:");
      if (parts.length > 1) {
        return parts[0].trim();
      }
      return prev;
    });
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleEmojiSearchChange = (e) => {
    setEmojiSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      setCurrentCategory("");
    } else {
      if (Object.keys(stampCategories).length > 0) {
        setCurrentCategory(Object.keys(stampCategories)[0]);
      }
    }
  };

  const insertEmoji = (stamp) => {
    // Add to recently used
    setRecentlyUsedStamps((prev) => {
      // Remove if already exists
      const filtered = prev.filter((s) => s.id !== stamp.id);
      // Add to front
      return [stamp, ...filtered].slice(0, 5);
    });

    // Use the special emoji syntax that will be rendered as an image in the chat
    const insertText = `:${stamp.name}:`;

    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newMessage =
        message.substring(0, start) + insertText + message.substring(end);
      setMessage(newMessage);

      // Focus back on textarea and set cursor position after emoji
      setTimeout(() => {
        textareaRef.current.focus();
        const newCursorPosition = start + insertText.length;
        textareaRef.current.selectionStart = newCursorPosition;
        textareaRef.current.selectionEnd = newCursorPosition;
        setCursorPosition(newCursorPosition);
      }, 10);
    } else {
      setMessage((prev) => prev + insertText);
    }
    setIsEmojiPickerOpen(false);
    setEmojiSearchTerm("");
  };

  const handleMentionClick = () => {
    setMessage((prev) => prev + "@");
    // Focus and place cursor after the @
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = textareaRef.current.value.length;
        textareaRef.current.selectionStart = newPos;
        textareaRef.current.selectionEnd = newPos;
        setCursorPosition(newPos);
      }
    }, 10);
  };

  const insertMention = (userId, username) => {
    // Find the position of the last @ before cursor
    const lastAtPos = message.lastIndexOf("@", cursorPosition - 1);

    if (lastAtPos !== -1) {
      // Replace the @search with the @username
      const before = message.substring(0, lastAtPos);
      const after = message.substring(cursorPosition);
      const newMessage = before + `@${username} ` + after;

      setMessage(newMessage);
      setIsMentionListOpen(false);

      // Set cursor after the inserted mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = lastAtPos + username.length + 2; // +2 for @ and space
          textareaRef.current.focus();
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
          setCursorPosition(newPos);
        }
      }, 10);
    }
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  // Filter users for the mention list
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        if (!user || !user.displayName) return false;
        return (
          user.displayName
            .toLowerCase()
            .includes(searchMention.toLowerCase()) ||
          user.name.toLowerCase().includes(searchMention.toLowerCase())
        );
      })
    : [];

  const renderStamp = (stamp) => {
    return (
      <img
        src={`https://traq.duckdns.org/api/v3/stamps/${stamp.id}/image`}
        alt={stamp.name}
        className="w-6 h-6 object-contain"
        onError={(e) => {
          e.target.onerror = null;
          // First fallback: try using fileId if available
          if (stamp.fileId) {
            e.target.src = `https://traq.duckdns.org/api/v3/files/${stamp.fileId}`;
          }
          // Second fallback: for Unicode emojis, render the emoji character directly
          else if (stamp.isUnicode) {
            // Replace the img with a span containing the emoji
            const parent = e.target.parentNode;
            if (parent) {
              const span = document.createElement("span");
              span.className = "text-xl";
              try {
                span.textContent = JSON.parse(`"${stamp.name}"`);
              } catch {
                span.textContent = stamp.name;
              }
              parent.replaceChild(span, e.target);
            }
          }
          // Final fallback: placeholder
          else {
            e.target.src = "https://via.placeholder.com/24?text=✨";
          }
        }}
      />
    );
  };

  // Rest of the component remains the same, including the return statement
  return (
    <div className="p-4 border-t border-gray-300">
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple
      />

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">
            Selected Files:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center bg-white px-2 py-1 rounded border border-gray-300"
              >
                <span className="text-sm mr-2">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message composition area */}
      <div className="flex items-center">
        <div className="flex-1 bg-white border border-gray-300 rounded-lg flex items-center">
          {/* Attachment button */}
          <button
            onClick={handleFileClick}
            className="p-2 text-gray-500 hover:text-gray-700 text-xl"
            title="Attach files"
          >
            📎
          </button>

          {/* Emoji button with picker */}
          <div className="relative">
            <button
              onClick={toggleEmojiPicker}
              className="p-2 text-gray-500 hover:text-gray-700 text-xl"
              title="Insert emoji"
            >
              😊
            </button>

            {/* Emoji picker from API */}
            {isEmojiPickerOpen && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-10 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                style={{
                  width: "280px",
                  maxHeight: "320px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Search bar */}
                <div className="p-2 border-b">
                  <input
                    ref={emojiSearchRef}
                    type="text"
                    value={emojiSearchTerm}
                    onChange={handleEmojiSearchChange}
                    placeholder="Search emojis by name..."
                    className="w-full px-2 py-1 border rounded text-sm"
                    autoFocus
                  />
                </div>

                {/* Category tabs - only show when not searching */}
                {!emojiSearchTerm && (
                  <div className="flex border-b overflow-x-auto p-1 bg-gray-50">
                    {isLoadingStamps ? (
                      <div className="p-2 text-gray-500 text-sm">
                        Loading stamps...
                      </div>
                    ) : (
                      Object.keys(stampCategories).map((category) => (
                        <button
                          key={category}
                          onClick={() => setCurrentCategory(category)}
                          className={`p-2 mx-1 rounded whitespace-nowrap ${
                            currentCategory === category
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                          }`}
                          title={category}
                        >
                          {category}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Emoji grid - scrollable area */}
                <div className="flex-1 overflow-y-auto p-2">
                  {isLoadingStamps ? (
                    <div className="flex items-center justify-center h-full">
                      <p>Loading emojis...</p>
                    </div>
                  ) : emojiSearchTerm ? (
                    // Show search results
                    searchResults.length > 0 ? (
                      <div className="grid grid-cols-6 gap-1">
                        {searchResults.map((stamp) => (
                          <button
                            key={stamp.id}
                            onClick={() => insertEmoji(stamp)}
                            className="hover:bg-gray-100 rounded p-1 flex items-center justify-center h-8"
                            title={stamp.name}
                          >
                            {renderStamp(stamp)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No emojis found for "{emojiSearchTerm}"
                      </div>
                    )
                  ) : currentCategory && stampCategories[currentCategory] ? (
                    // Show category stamps when not searching
                    <div className="grid grid-cols-6 gap-1">
                      {stampCategories[currentCategory].map((stamp) => (
                        <button
                          key={stamp.id}
                          onClick={() => insertEmoji(stamp)}
                          className="hover:bg-gray-100 rounded p-1 flex items-center justify-center h-8"
                          title={stamp.name}
                        >
                          {renderStamp(stamp)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No stamps available
                    </div>
                  )}
                </div>

                {/* Recently used emojis */}
                <div className="border-t p-1">
                  <p className="text-xs text-gray-500 px-2">Recently Used</p>
                  <div className="flex overflow-x-auto p-1">
                    {recentlyUsedStamps.map((stamp) => (
                      <button
                        key={stamp.id}
                        onClick={() => insertEmoji(stamp)}
                        className="hover:bg-gray-100 rounded p-1 flex items-center justify-center h-8 w-8 mx-1"
                        title={stamp.name}
                      >
                        {renderStamp(stamp)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mention button */}
          <div className="relative">
            <button
              onClick={handleMentionClick}
              className="p-2 text-gray-500 hover:text-gray-700 text-xl"
              title="Mention user"
            >
              @
            </button>
          </div>

          {/* Message input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            onClick={() =>
              setCursorPosition(textareaRef.current?.selectionStart || 0)
            }
            onSelect={() =>
              setCursorPosition(textareaRef.current?.selectionStart || 0)
            }
            placeholder={
              channelId
                ? "Message #channel-name"
                : "Select a channel to send messages"
            }
            className="flex-1 p-2 outline-none resize-none max-h-20"
            rows="1"
            disabled={!channelId}
          />

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={
              (!message.trim() && selectedFiles.length === 0) || !channelId
            }
            className={`p-2 mx-1 rounded-full ${
              (!message.trim() && selectedFiles.length === 0) || !channelId
                ? "text-gray-400"
                : "text-blue-500 hover:bg-blue-50"
            }`}
            title="Send message"
          >
            ➤
          </button>
        </div>
      </div>

      {/* Mention list that appears when typing @ */}
      {isMentionListOpen && (
        <div
          ref={mentionListRef}
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-64 max-h-64 overflow-y-auto"
          style={{ bottom: "120px", left: "50px" }}
        >
          <div className="p-2 border-b">
            <p className="text-xs text-gray-500">
              Matching users for "@{searchMention}"
            </p>
          </div>
          {filteredUsers.length > 0 ? (
            <div>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => insertMention(user.id, user.name)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex-shrink-0">
                    {user.iconFileId ? (
                      <img
                        src={`https://traq.duckdns.org/api/v3/files/${user.iconFileId}`}
                        className="w-full h-full rounded-full object-cover"
                        alt={user.displayName || user.name}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {(user.displayName || user.name)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {user.displayName || user.name}
                    </div>
                    <div className="text-xs text-gray-500">@{user.name}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No users found matching "@{searchMention}"
            </div>
          )}
        </div>
      )}

      {/* Character counter and helpful text */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>
          {message.length} characters
          {selectedFiles.length > 0
            ? ` • ${selectedFiles.length} files attached`
            : ""}
        </span>
        <span>Press Shift+Enter for a new line</span>
      </div>
    </div>
  );
};

export default ChatInput;
