export const Stamps = ({ stamps, stampImages }) => {
  if (!stamps || stamps.length === 0) {
    return <p></p>;
  }
  return (
    <div className="mt-4 flex flex-wrap gap-3 items-center">
      {stamps.map((stamp, index) => (
        <div
          key={index}
          className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm"
        >
          <img
            src={stampImages[stamp.stampId] || ""}
            alt="Stamp"
            className="w-6 h-6 rounded-md mr-2"
          />
          <span className="font-medium text-sm">{stamp.count}</span>
        </div>
      ))}
    </div>
  );
};
