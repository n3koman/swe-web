import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Send,
  User,
  UserPlus,
  MessageCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]); // List of users for creating new chats
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userType, setUserType] = useState("");

  const navigate = useNavigate();
  const { userId } = useParams();
  const token = localStorage.getItem("token");
  const baseUrl = "https://swe-backend-livid.vercel.app";

  console.log("Current userId:", userId);

  const fetchUserType = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/user/${userId}/role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalizedRole = response.data.role.toLowerCase(); // Normalize to lowercase
      setUserType(normalizedRole);
      console.log("Fetched and normalized user type:", normalizedRole);
    } catch (error) {
      console.error("Error fetching user type:", error);
      setError("Failed to fetch user type");
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId) {
      fetchUserType();
    }
  }, [fetchUserType, userId]);

  // Fetch chats for the user
  const fetchChats = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/${userType}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(response.data.chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, [userType, token]);

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/${userType}/chats/${chatId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data.messages);
      setSelectedChat(chatId);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post(
        `${baseUrl}/${userType}/chats/${selectedChat}/message`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  // Start a new chat
  const startNewChat = async (otherUserId) => {
    const endpoint =
      userType === "buyer" ? "buyer/chats/start" : "farmer/chats/start";

    const payload =
      userType === "buyer"
        ? { farmer_id: otherUserId }
        : { buyer_id: otherUserId };

    console.log("Starting chat payload:", payload); // Debugging payload
    console.log("Endpoint:", `${baseUrl}/${endpoint}`);

    try {
      const response = await axios.post(`${baseUrl}/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsNewChatModalOpen(false);
      await fetchChats();
      setSelectedChat(response.data.chat_id);
      fetchMessages(response.data.chat_id);
    } catch (error) {
      console.error("Error starting chat:", error.response || error);
      setError(error.response?.data?.error || "Failed to start new chat");
    }
  };

  // Fetch users (farmers or buyers) for creating new chats
  const fetchUsers = useCallback(async () => {
    console.log("Fetching users with userType:", userType);

    const endpoint = userType === "buyer" ? "buyer/farmers" : "farmer/buyers";

    // Debugging log for endpoint
    console.log("Endpoint determined for fetching users:", endpoint);

    try {
      const response = await axios.get(`${baseUrl}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.users && Array.isArray(response.data.users)) {
        console.log("Fetched users:", response.data.users); // Debug
        setUsers(response.data.users);
      } else {
        throw new Error("Invalid users data format");
      }
    } catch (error) {
      console.error("Error fetching users:", error.response || error);
      setError("Failed to load users for new chat");
    }
  }, [userType, token]);

  useEffect(() => {
    fetchChats();
    fetchUsers();
  }, [fetchChats, fetchUsers]);

  // Handle sending message on Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <MessageCircle className="mr-2" />
            {userType === "buyer" ? "Chat" : "Chat"}
          </h2>
          <UserPlus
            className="text-blue-500 cursor-pointer hover:text-blue-700"
            onClick={() => setIsNewChatModalOpen(true)}
          />
        </div>

        <div className="p-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <ArrowLeft className="mr-2" />
            Return to Dashboard
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <Clock className="animate-spin mx-auto" />
            <p>Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No chats yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                selectedChat === chat.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => fetchMessages(chat.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {userType === "buyer" ? chat.farmer_name : chat.buyer_name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.last_message || "No messages yet"}
                  </p>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-md mx-2 p-3 rounded-lg ${
                    message.sender_id === parseInt(userId)
                      ? "self-end bg-blue-500 text-white"
                      : "self-start bg-gray-200 text-black"
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-75 block text-right mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a chat or start a new conversation</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsNewChatModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Start a New Chat</h2>
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => startNewChat(user.id)}
              >
                <User className="mr-3 text-gray-500" />
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
