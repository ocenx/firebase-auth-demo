// src/components/ChatMessage.tsx

type Msg = {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  createdAt?: any;
};

export default function ChatMessage({ message, currentUserId }: { message: Msg; currentUserId?: string | null }) {
  const mine = message.uid === currentUserId;
  return (
    <div className={`flex items-start ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && (
        <img
          src={message.photoURL || "https://via.placeholder.com/40"}
          alt={message.displayName}
          className="w-9 h-9 rounded-full mr-3"
        />
      )}

      <div className={`max-w-[70%] ${mine ? "text-right" : ""}`}>
        {!mine && <div className="text-xs text-gray-500 mb-1">{message.displayName}</div>}
        <div className={`px-3 py-2 rounded-lg ${mine ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
          {message.text}
        </div>
        <div className="text-xs text-gray-400 mt-1">{/* optional timestamp formatting */}</div>
      </div>

      {mine && (
        <img
          src={message.photoURL || "https://via.placeholder.com/40"}
          alt={message.displayName}
          className="w-9 h-9 rounded-full ml-3"
        />
      )}
    </div>
  );
}
