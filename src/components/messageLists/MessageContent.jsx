import { useMemo } from "react";

const MessageContent = ({ content, stamps }) => {
  const renderedContent = useMemo(() => {
    if (!content) return "";

    // First handle file attachments
    let processedContent = content.replace(/!\{.*?"raw":"(.*?)".*?\}/g, "$1");

    // If no stamps data yet, just return the processed content
    if (!stamps || stamps.length === 0) {
      return processedContent;
    }

    // Split by emoji patterns
    const parts = processedContent.split(/(:([a-zA-Z0-9_+-]+):)/g);

    return parts.map((part, index) => {
      // Every third element is an emoji name
      if (index % 3 === 1) {
        const emojiName = parts[index + 1];
        const stamp = stamps.find((s) => s.name === emojiName);

        if (stamp) {
          return (
            <img
              key={`emoji-${index}-${stamp.id}`}
              src={`https://traq.duckdns.org/api/v3/stamps/${stamp.id}/image`}
              alt={emojiName}
              className="inline-block align-middle"
              style={{ height: "1.2em", width: "auto", margin: "0 0.05em" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/20?text=✨";
              }}
            />
          );
        }
        return part; // Return the original text if stamp not found
      }

      // Return regular text for non-emoji parts
      if (index % 3 === 0) {
        return part;
      }

      return null;
    });
  }, [content, stamps]);

  return <p className="whitespace-pre-wrap">{renderedContent}</p>;
};

export default MessageContent;
