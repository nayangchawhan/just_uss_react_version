import React, { useEffect, useState, useRef } from 'react';
import { db, auth, storage } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import NavChat from '../Universe/NavChat';
import { IoSend } from "react-icons/io5";
import { FaCamera } from "react-icons/fa6";
import { BsLightningCharge } from "react-icons/bs";
import { BsReply } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import './Chat.css';

function Chat() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [replyMessage, setReplyMessage] = useState(null);
    const messagesEndRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const usersRef = ref(db, 'users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setUsers(Object.values(data));
            }
        });
    }, []);

    useEffect(() => {
        if (selectedChat) {
            const senderId = auth.currentUser.uid;
            const receiverId = selectedChat.uid;
            const chatID = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
            const messagesRef = ref(db, `chats/${chatID}/messages`);

            onValue(messagesRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const messageArray = Object.entries(data)
                        .map(([id, msg]) => ({ id, ...msg }))
                        .filter(msg => msg.timestamp);

                    setMessages(messageArray);

                    // Mark as read if recipient is viewing
                    messageArray.forEach(({ id, receiver, read }) => {
                        if (receiver === senderId && !read) {
                            update(ref(db, `chats/${chatID}/messages/${id}`), { read: true });
                        }
                    });

                    // Auto-delete read messages after 24 hours
                    const currentTime = Date.now();
                    messageArray.forEach(({ id, timestamp, read }) => {
                        if (read && currentTime - timestamp >= 24 * 60 * 60 * 1000) {
                            remove(ref(db, `chats/${chatID}/messages/${id}`));
                        }
                    });
                } else {
                    setMessages([]);
                }
            });
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSendMessage = async () => {
        if (!selectedChat) return;

        const senderId = auth.currentUser.uid;
        const receiverId = selectedChat.uid;
        const chatID = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
        const senderName = users.find(user => user.uid === senderId)?.username || "Unknown";
        let imageUrl = null;

        try {
            if (image) {
                const imageRef = storageRef(storage, `chatImages/${chatID}/${Date.now()}_${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            if (message.trim() !== '' || imageUrl) {
                const messagesRef = ref(db, `chats/${chatID}/messages`);
                const newMessageRef = await push(messagesRef, {
                    text: message || "",
                    imageUrl: imageUrl || null,
                    timestamp: Date.now(),
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    sender: senderId,
                    receiver: receiverId,
                    senderName,
                    read: false,
                    replyTo: replyMessage ? {
                        text: replyMessage.text,
                        senderName: replyMessage.senderName
                    } : null
                });

                // ✅ Update chat list for both users
                const senderChatRef = ref(db, `users/${senderId}/chats/${receiverId}`);
                const receiverChatRef = ref(db, `users/${receiverId}/chats/${senderId}`);

                await update(senderChatRef, {
                    lastMessage: message || "📷 Image",
                    timestamp: Date.now()
                });
                await update(receiverChatRef, {
                    lastMessage: message || "📷 Image",
                    timestamp: Date.now()
                });

                setMessage('');
                setImage(null);
                setPreview(null);
                setReplyMessage(null);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleSummarize = async (text, msgId) => {
        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAPeYdbiwI8fnDlQQm-PjFzIvgsf0YR8QY", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: `Summarize this: ${text}` }] }] })
            });
            const data = await response.json();
            alert(`Summary: ${data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available"}`);
        } catch (error) {
            console.error("Error summarizing message:", error);
        }
    };

    const handleReply = (msg) => {
        setReplyMessage(msg);
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <NavChat onUserSelect={setSelectedChat} />
            <div className="chat-container" style={{ width: '70%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-header" style={{ padding: '10px', borderBottom: '1px solid #ccc', fontFamily: "Poppins" }}>
                    {selectedChat ? (
                        <h3 style={{ cursor: "pointer" }} onClick={() => navigate(`/profile/${selectedChat.uid}`)}>
                            Chatting with {selectedChat.username}
                        </h3>
                    ) : (
                        <h3>Select a chat to start messaging</h3>
                    )}
                </div>

                <div className="messages" style={{ flex: 1, overflowY: 'scroll', padding: '10px' }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ padding: '5px', borderBottom: '1px solid #ccc', fontFamily: "Poppins" }}>
                            <strong>{msg.senderName}</strong>:
                            {msg.replyTo && (
                                <div style={{ background: '#e0e0e0', padding: '5px', borderRadius: '5px', marginBottom: '3px', fontSize: '0.9em' }}>
                                    <strong>Replying to {msg.replyTo.senderName}:</strong> <p>{msg.replyTo.text}</p>
                                </div>
                            )}
                            {msg.text && <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
                            {msg.imageUrl && <img src={msg.imageUrl} alt="sent" style={{ maxWidth: '200px', borderRadius: '10px' }} />}
                            <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                                {msg.date || new Date(msg.timestamp).toLocaleDateString()}{" "}
                                {msg.time || new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                            {msg.read && <span style={{ color: 'green', fontSize: '0.8em', marginLeft: '5px' }}>✔ Read</span>}
                            {msg.text && <BsLightningCharge onClick={() => handleSummarize(msg.text, msg.id)} style={{ color: 'blue', marginLeft: '10px', cursor: 'pointer' }} />}
                            <BsReply onClick={() => handleReply(msg)} style={{ marginLeft: '5px', cursor: 'pointer' }} />
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {replyMessage && (
                    <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', marginBottom: '5px' }}>
                        <strong>Replying to:</strong> {replyMessage.text}
                    </div>
                )}

                {preview && (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <img src={preview} alt="Preview" style={{ maxWidth: '200px', borderRadius: '10px' }} />
                    </div>
                )}

                <div className="message-input" style={{ display: 'flex', padding: '10px', alignItems: 'center' }}>
                    <label htmlFor="imageUpload" style={{ marginRight: '10px', cursor: 'pointer' }}>
                        <FaCamera />
                    </label>
                    <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={{ flex: 1, marginRight: '10px' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <button onClick={handleSendMessage} style={{ width: '50px', height: '50px', borderRadius: '50%' }}>
                        <IoSend />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
