const parseMessage = (content) => {
  if (!content) return "";
  return content.replace(/!\{.*?"raw":"(.*?)".*?\}/g, "$1");
};
export const MessageContent = ({ content }) => (
  <p
    className="mt-4 text-gray-700 text-base leading-relaxed bg-gray-50 p-4 rounded-lg"
    dangerouslySetInnerHTML={{ __html: parseMessage(content) }}
  ></p>
);
