import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { IoIosArrowBack } from "react-icons/io";
import { ImFire } from "react-icons/im";
import './NavChat.css';

function NavChat({ onUserSelect }) {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]); // All users from Firebase
    const [recentChats, setRecentChats] = useState([]); // Users we've chatted with
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [streaks, setStreaks] = useState({}); // Store conversation counts

    // Fetch all users
    useEffect(() => {
        const usersRef = ref(db, 'users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userList = Object.values(data)
                    .filter(user => user.uid !== auth.currentUser.uid && user.username); // Ensure username exists
                setUsers(userList);
            }
        });
    }, []);

    useEffect(() => {
        const userId = auth.currentUser.uid;
        const chatsRef = ref(db, `users/${userId}/chats`);
        
        onValue(chatsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const chatUserIds = Object.keys(data);
                const chatUsers = users.filter(user => chatUserIds.includes(user.uid));
                setRecentChats(chatUsers);
    
                let streakData = {};
    
                chatUserIds.forEach(chatUserId => {
                    const messagesRef = ref(db, `chats/${userId}_${chatUserId}/messages`);
    
                    onValue(messagesRef, (msgSnapshot) => {
                        const messages = msgSnapshot.val();
    
                        if (messages) {
                            const messageArray = Object.values(messages);
                            
                            let streakCount = 0;
                            let lastSender = null;
                            
                            messageArray.forEach((msg) => {
                                if (msg.sender !== lastSender) {
                                    streakCount++; // Increase streak only if sender changes
                                    lastSender = msg.sender; // Update last sender
                                }
                            });
    
                            streakData[chatUserId] = streakCount;
                        } else {
                            streakData[chatUserId] = 0;
                        }
    
                        setStreaks({ ...streakData }); // Update streak state
                    });
                });
            }
        });
    }, [users]);
    

    // Filter users based on search term
    const filteredUsers = searchTerm
        ? users.filter(user => user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
        : recentChats;

    return (
        <div className="chat">
            <h1>Justuss</h1>
            <br />
            <h3 style={{fontFamily:'Poppins'}}><IoIosArrowBack onClick={() => navigate('/')}/> Chats</h3>

            {/* Search bar */}
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '5px', marginBottom: '10px', fontFamily: 'Poppins' }}
            />

            {/* User List */}
            <div className="chat-list1">
                {filteredUsers.map((user) => (
                    <div
                        key={user.uid}
                        className={`chat-user ${selectedUser?.uid === user.uid ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedUser(user);
                            onUserSelect(user);
                        }}
                        style={{ width: '100%', marginBottom: '3px',fontFamily:'Poppins',cursor:'pointer' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                        {user.username || 'Unknown User'} {/* Fallback username */}
                        {streaks[user.uid] > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', marginLeft: '5px', color: 'orange' }}>
                                <ImFire /> {streaks[user.uid]}
                            </span>
                        )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NavChat;
