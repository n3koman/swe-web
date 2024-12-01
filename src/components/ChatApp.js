import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

interface Chat {
  id: number;
  farmer_name?: string;
  buyer_name?: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch current user ID from token
    const fetchUserData = async () => {
      try {
        const response = await axios.get("https://swe-backend-livid.vercel.app/user", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error("Error fetching user data", error);
        navigate("/login");
      }
    };

    const fetchChats = async () => {
      try {
        const response = await axios.get("https://swe-backend-livid.vercel.app/chats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching chats", error);
      }
    };

    fetchUserData();
    fetchChats();
  }, [navigate]);

  const fetchChatMessages = async (chatId: number) => {
    try {
      const response = await axios.get(`https://swe-backend-livid.vercel.app/chat/${chatId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    fetchChatMessages(chat.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post(
        `https://swe-backend-livid.vercel.app/chat/${selectedChat.id}/message`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Add the new message to the messages list
      setMessages([...messages, response.data]); 
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chats List */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Your Chats</h2>
        <ul>
          {chats.map((chat) => (
            <li 
              key={chat.id} 
              onClick={() => handleChatSelect(chat)}
              className={`p-2 cursor-pointer hover:bg-gray-200 ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''}`}
            >
              {chat.farmer_name || chat.buyer_name || "Unknown Chat"}
            </li>
          ))}
        </ul>
      </div>

      {/* Messages Area */}
      <div className="w-3/4 flex flex-col">
        {selectedChat ? (
          <>
            <div className="bg-gray-200 p-4">
              <h2 className="text-xl font-bold">
                Chat with {selectedChat.farmer_name || selectedChat.buyer_name}
              </h2>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`mb-2 p-2 rounded-lg max-w-md ${
                    msg.sender_id === currentUserId 
                      ? 'self-end bg-blue-500 text-white ml-auto' 
                      : 'self-start bg-gray-300'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="flex p-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-grow p-2 border rounded-l-lg"
              />
              <button 
                onClick={sendMessage}
                className="bg-blue-500 text-white p-2 rounded-r-lg"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;