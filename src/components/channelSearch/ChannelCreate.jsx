// import { useState } from "react";
// import { useMessages } from "../../contextProvider/useMessages";

// export const ChannelCreate = () => {
//   const [setShowModal] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [newChannelName, setNewChannelName] = useState("");
//   const [selectedParent, setSelectedParent] = useState("");

//   const { channels } = useMessages();

//   const closeModal = () => {
//     setShowModal(false);
//     setNewChannelName("");
//     setSelectedParent("");
//   };

//   const createChannel = async () => {
//     if (!newChannelName) {
//       alert("Channel name is required.");
//       return;
//     }

//     if (!/^[a-zA-Z0-9-_]{1,20}$/.test(newChannelName)) {
//       alert(
//         "Channel name must be 1-20 characters long and can only contain letters, numbers, hyphens, and underscores."
//       );
//       return;
//     }

//     setIsCreating(true);

//     try {
//       const response = await fetch("https://traq.duckdns.org/api/v3/channels", {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: newChannelName,
//           parent: selectedParent || null,
//         }),
//       });

//       if (response.status === 201) {
//         const data = await response.json();
//         console.log("Channel created:", data);
//         alert("Channel created successfully");
//         closeModal();
//       } else if (response.status === 400) {
//         alert("Bad Request: Please check the input values.");
//       } else if (response.status === 403) {
//         alert("Forbidden: You do not have permission to create a channel.");
//       } else if (response.status === 409) {
//         alert("Conflict: A channel with the specified name already exists.");
//       } else {
//         console.error("Failed to create channel:", await response.text());
//         alert("Failed to create channel. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error creating channel:", error);
//       alert("Error creating channel. Please try again.");
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg w-96">
//         <h3 className="text-lg font-bold mb-4">Create a channel</h3>

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">
//             Parent Channel
//           </label>
//           <select
//             className="w-full p-2 border border-gray-300 rounded-lg"
//             value={selectedParent}
//             onChange={(e) => setSelectedParent(e.target.value)}
//           >
//             <option value="">Root (No parent)</option>
//             {channels &&
//               Object.values(channels)
//                 .filter((channel) => channel && channel.name)
//                 .map((channel) => (
//                   <option key={channel.id} value={channel.id}>
//                     #{channel.name}
//                   </option>
//                 ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">
//             Channel name
//             <span className="text-gray-500 text-xs ml-1">
//               {newChannelName.length}/20
//             </span>
//           </label>
//           <input
//             type="text"
//             maxLength={20}
//             pattern="[a-zA-Z0-9-_]+"
//             className="w-full p-2 border border-gray-300 rounded-lg"
//             value={newChannelName}
//             onChange={(e) =>
//               setNewChannelName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))
//             }
//           />
//           <p className="text-xs text-gray-500 mt-1">
//             When executed, a new # is created. (You can't delete or move a
//             channel or change the channel name after it's created.)
//           </p>
//         </div>

//         <div className="flex justify-end space-x-2">
//           <button
//             onClick={closeModal}
//             className="px-4 py-2 border border-gray-300 rounded-lg"
//             disabled={isCreating}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={createChannel}
//             className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
//               !newChannelName || isCreating
//                 ? "opacity-50 cursor-not-allowed"
//                 : ""
//             }`}
//             disabled={!newChannelName || isCreating}
//           >
//             {isCreating ? "Creating..." : "Create"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
