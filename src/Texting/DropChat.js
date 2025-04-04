import React, { useEffect, useState, useRef } from 'react';
import { db, auth, storage } from '../firebase';
import { ref, onValue, get, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Nav_bar from '../Universe/Nav_bar';
import { IoSend } from "react-icons/io5";
import { FaCamera } from "react-icons/fa6";
import { BsLightningCharge, BsReply } from "react-icons/bs";
import './Chat.css';

function DropChat() {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [replyMessage, setReplyMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const [users, setUsers] = useState([]); // All users from Firebase

    useEffect(() => {
            const usersRef = ref(db, 'users');
            onValue(usersRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setUsers(Object.values(data));
                }
            });
        }, []);
    const senderId = auth.currentUser.uid;
    const senderName = users.find(user => user.uid === senderId)?.username || "Anonymous";

    //Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error("Location access denied:", error);
                    alert("Please allow location access to use location-based chat.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }, []);

    //Haversine Formula to Calculate Distance (in KM)
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    //Fetch Nearby Messages (within 1KM)
    useEffect(() => {
        if (latitude && longitude) {
            const messagesRef = ref(db, `chats/messages`);

            onValue(messagesRef, async (snapshot) => {
                if (!snapshot.exists()) {
                    setMessages([]);
                    return;
                }

                const allMessages = snapshot.val();
                const filteredMessages = [];

                for (const [messageId, msg] of Object.entries(allMessages)) {
                    const senderRef = ref(db, `users/${msg.sender}/location`);
                    const senderSnap = await get(senderRef);

                    if (!senderSnap.exists()) continue;
                    
                    const senderLoc = senderSnap.val();
                    const distance = getDistanceFromLatLonInKm(latitude, longitude, senderLoc.latitude, senderLoc.longitude);
                    
                    if (distance <= 1) {
                        filteredMessages.push({ id: messageId, ...msg });
                    }
                }

                setMessages(filteredMessages);
            });
        }
    }, [latitude, longitude]);

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
        if (!latitude || !longitude) {
            alert("Location not detected. Please allow location access.");
            return;
        }

        const senderId = auth.currentUser?.uid;
        if (!senderId) {
            alert("User not authenticated.");
            return;
        }

        let imageUrl = null;
        try {
            if (image) {
                const imageRef = storageRef(storage, `chatImages/${Date.now()}_${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            if (message.trim() !== '' || imageUrl) {
                const messagesRef = ref(db, `chats/messages`);
                await push(messagesRef, {
                    text: message || "",
                    imageUrl: imageUrl || null,
                    timestamp: Date.now(),
                    sender: senderId,
                    senderName,
                    latitude,
                    longitude,
                    replyTo: replyMessage ? {
                        text: replyMessage.text,
                        senderName: replyMessage.senderName
                    } : null
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

    const handleSummarize = async (text) => {
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
        <div style={{ display: 'flex', height: '100vh', marginLeft: '20%' }}>
            <Nav_bar />
            <div className="chat-container" style={{ width: '70%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <div className="chat-header">
                    <h3>Location-Based Chat</h3>
                </div>

                <div className="messages" style={{ flex: 1, overflowY: 'scroll', padding: '10px' }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ padding: '5px', borderBottom: '1px solid #ccc', fontFamily: "Poppins" }}>
                            <strong>{msg.senderName}</strong>: 
                            {msg.replyTo && (
                                <div style={{ background: '#e0e0e0', padding: '5px', borderRadius: '5px', marginBottom: '3px', fontSize: '0.9em' }}>
                                    <strong>Replying to {msg.replyTo.senderName}:</strong> {msg.replyTo.text}
                                </div>
                            )}
                            {msg.text && <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>}
                            {msg.imageUrl && <img src={msg.imageUrl} alt="sent" style={{ maxWidth: '200px', borderRadius: '10px' }} />}
                            <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                            </span>
                            {msg.read && <span style={{ color: 'green', fontSize: '0.8em', marginLeft: '5px' ,marginRight:'5px'}}>✔ Read</span>}
                            {msg.text && <BsLightningCharge onClick={() => handleSummarize(msg.text, msg.id)} style={{color:'blue',marginRight:'5px',marginLeft:'5px'}}/>}
                            <BsReply onClick={() => handleReply(msg)}/>
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
                    />
                    <button onClick={handleSendMessage} style={{ width: '50px', height: '50px', borderRadius: '50%' }}>
                        <IoSend />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DropChat;
