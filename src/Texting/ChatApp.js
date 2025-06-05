import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, push, onValue, remove } from "firebase/database";
import Nav_bar from "../Universe/Nav_bar";
import axios from "axios";
import { FaWandMagicSparkles } from "react-icons/fa6";
import "./ChatApp.css";

const ChatApp = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchChatHistory(user.uid);
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChatHistory = (userId) => {
    const chatRef = ref(db, `chats/${userId}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      } else {
        setMessages([]);
      }
    });
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
    const userId = user.uid;
    const newMessage = { sender: "user", text: input };

    push(ref(db, `chats/${userId}`), newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const aiResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAPeYdbiwI8fnDlQQm-PjFzIvgsf0YR8QY",
        {
          contents: [{ role: "user", parts: [{ text: input }] }],
        }
      );
      const aiText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI Response Unavailable";

      const aiMessage = { sender: "AI", text: aiText };
      push(ref(db, `chats/${userId}`), aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response", error);
    }
  };

  const deleteConversations = () => {
    if (user) {
      const userChatsRef = ref(db, `chats/${user.uid}`);
      remove(userChatsRef)
        .then(() => {
          setMessages([]);
          alert("All conversations deleted.");
        })
        .catch((error) => {
          console.error("Error deleting conversations:", error);
        });
    }
  };

  return (
    <div className="chat-container1">
      <Nav_bar />
      <h2>Welcome to JustMind</h2>

      <div className="messages-container">
        <div className="messages1">
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === "user" ? "user-message" : "ai-message"}>
              <strong>{msg.sender}: </strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
        />
        <button onClick={sendMessage}><FaWandMagicSparkles /></button>
        <button onClick={deleteConversations} style={{ marginLeft: "10px", backgroundColor: "#ff4d4f", color: "white" }}>
          Delete Chat
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
