import React, { useEffect, useState, useRef } from 'react';
import { db, auth, storage } from '../firebase'; // Import Firebase Storage
import { ref, onValue, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import NavChat from '../Universe/NavChat';
import { IoSend } from "react-icons/io5";
import { FaImage } from "react-icons/fa"; // Icon for image upload
import './Chat.css';

function Chat() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null); // Image preview

    const messagesEndRef = useRef(null);

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
                setMessages(data ? Object.values(data) : []);
            });
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // Handle Sending Message (Text & Image)
    const handleSendMessage = async () => {
        if (!selectedChat) return;
        
        const senderId = auth.currentUser.uid;
        const receiverId = selectedChat.uid;
        const chatID = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
        const senderName = users.find(user => user.uid === senderId)?.username || "Unknown";
    
        let imageUrl = null;
    
        try {
            if (image) {
                console.log("Uploading image...");
                const imageRef = storageRef(storage, `chatImages/${chatID}/${Date.now()}_${image.name}`);
                await uploadBytes(imageRef, image); // Upload image
                imageUrl = await getDownloadURL(imageRef); // Get image URL
                console.log("Image uploaded! URL:", imageUrl);
            }
    
            if (message.trim() !== '' || imageUrl) {
                console.log("Sending message...");
                const messagesRef = ref(db, `chats/${chatID}/messages`);
                await push(messagesRef, {
                    text: message || "",
                    imageUrl: imageUrl || null,
                    timestamp: Date.now(),
                    sender: senderId,
                    receiver: receiverId,
                    senderName
                });
    
                console.log("Message sent successfully!");
    
                // Update recent chat preview for both users
                const chatPreview = { lastMessage: message || "📷 Image", timestamp: Date.now() };
                push(ref(db, `users/${senderId}/chats/${receiverId}`), chatPreview);
                push(ref(db, `users/${receiverId}/chats/${senderId}`), chatPreview);
    
                // Reset inputs after sending message
                setMessage('');
                setImage(null);
                setPreview(null);
            } else {
                console.warn("No message or image to send.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <NavChat onUserSelect={setSelectedChat} />
            <div className="chat-container" style={{ width: '70%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-header" style={{ padding: '10px', borderBottom: '1px solid #ccc', fontFamily: "Poppins" }}>
                    {selectedChat ? <h3>Chat with {selectedChat.username}</h3> : <h3>Select a chat to start messaging</h3>}
                </div>
                <div className="messages" style={{ flex: 1, overflowY: 'scroll', padding: '10px' }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ padding: '5px', borderBottom: '1px solid #ccc', fontFamily: "Poppins" }}>
                            <strong>{msg.senderName}</strong>: 
                            {msg.text && <p>{msg.text}</p>}
                            {msg.imageUrl && <img src={msg.imageUrl} alt="sent" style={{ maxWidth: '200px', borderRadius: '10px' }} />}
                            <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {preview && (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                        <img src={preview} alt="Preview" style={{ maxWidth: '200px', borderRadius: '10px' }} />
                    </div>
                )}
                <div className="message-input" style={{ display: 'flex', padding: '10px', alignItems: 'center' }}>
                    <label htmlFor="imageUpload" style={{ marginRight: '10px', cursor: 'pointer' }}>
                        <FaImage size={30} />
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
