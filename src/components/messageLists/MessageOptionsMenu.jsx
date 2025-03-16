import { useState, useRef, useEffect } from "react";

const MessageOptionsMenu = ({
  messageId,
  messageUserId,
  currentUserId,
  onEdit,
  onDelete,
  onPin,
  isPinned = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Check if the current user is the message sender
  const isOwnMessage = messageUserId === currentUserId;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle menu item clicks
  const handleEditClick = () => {
    onEdit && onEdit(messageId);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = () => {
    onDelete && onDelete(messageId);
    setIsMenuOpen(false);
  };

  const handlePinClick = () => {
    onPin && onPin(messageId);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      {/* Three dots menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-100"
        aria-label="Message options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-50 py-1"
        >
          {/* Only show Edit option for the message owner */}
          {isOwnMessage && (
            <button
              onClick={handleEditClick}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              Edit
            </button>
          )}

          {/* Only show Delete option for the message owner */}
          {isOwnMessage && (
            <button
              onClick={handleDeleteClick}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
            >
              Delete
            </button>
          )}

          {/* Pin option is available to all users */}
          <button
            onClick={handlePinClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            {isPinned ? "Unpin" : "Pin"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageOptionsMenu;
