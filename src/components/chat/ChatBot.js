import { useState, useRef, useEffect } from "react";
import { TextField, Button, IconButton, Box } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const ChatBot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const chatContainerRef = useRef(null);

  const toggleChat = () => setChatOpen(!chatOpen);

  const sendMessage = async (message) => {
    const newMessage = { sender: "user", text: message };
    setMessages([...messages, newMessage]);

    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/intents?message=${message}`
      );

      const botResponse = {
        sender: "bot",
        text: response.status === 200 ? response.data.message : "Invalid data",
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error("Error fetching intent response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Sorry, I could not retrieve intent information." },
      ]);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      sendMessage(chatMessage);
      setChatMessage("");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Floating Chat Icon */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000, // Ensure it floats above other elements
        }}
      >
        <IconButton
          color="primary"
          onClick={toggleChat}
          sx={{
            backgroundColor: "#007bff",
            color: "#fff",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            '&:hover': { backgroundColor: "#0056b3" },
          }}
        >
          <ChatIcon />
        </IconButton>
      </Box>

      {/* Chat Box */}
      {chatOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: { xs: "90vw", sm: 350, md: 400 },
            padding: 2,
            backgroundColor: "#fff",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            borderRadius: "10px",
          }}
        >
          {/* Chat Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ padding: "10px" }}
          >
            <h4 style={{ margin: 0, marginLeft: '50px' }}>
             Live Chat with <span className="text-warning">KALIZA</span>
            </h4>
            <IconButton onClick={toggleChat}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chat Message List */}
          <div
            ref={chatContainerRef}
            style={{
              height: "200px",
              overflowY: "auto",
              padding: "10px",
              border: "1px solid #ddd",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  margin: "5px 0",
                }}
              >
                <p
                  style={{
                    backgroundColor: msg.sender === "user" ? "#f1f1f1" : "#d1e7dd",
                    padding: "5px",
                  }}
                >
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Send
            </Button>
          </form>
        </Box>
      )}
    </>
  );
};

export default ChatBot;
