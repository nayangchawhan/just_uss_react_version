import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { IoIosArrowBack } from "react-icons/io";
import { ImFire } from "react-icons/im";
import './NavChat.css';

function NavChat({ onUserSelect }) {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [streaks, setStreaks] = useState({});

    // Fetch all users
    useEffect(() => {
        const usersRef = ref(db, 'users');
        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data && auth.currentUser) {
                const currentUserId = auth.currentUser.uid;
                const userList = Object.values(data).filter(
                    user => user.uid !== currentUserId && user.username
                );
                setUsers(userList);
            }
        });
    }, []);

    // Fetch recent chats and calculate streaks
    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId || users.length === 0) return;

        const chatsRef = ref(db, `users/${userId}/chats`);
        onValue(chatsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const chatUserIds = Object.keys(data);
                const chatUsers = users.filter(user => chatUserIds.includes(user.uid));
                setRecentChats(chatUsers);

                // Fetch and calculate streaks
                let streakData = {};

                chatUserIds.forEach(chatUserId => {
                    const chatPath1 = `chats/${userId}_${chatUserId}/messages`;
                    const chatPath2 = `chats/${chatUserId}_${userId}/messages`;

                    // Try both path combinations
                    const tryBothPaths = async () => {
                        let found = false;
                        const tryPath = (path) => {
                            return new Promise((resolve) => {
                                const msgRef = ref(db, path);
                                onValue(msgRef, (msgSnapshot) => {
                                    const messages = msgSnapshot.val();
                                    if (messages && !found) {
                                        found = true;
                                        const messageArray = Object.values(messages);
                                        let streakCount = 0;
                                        let lastSender = null;

                                        messageArray.forEach((msg) => {
                                            if (msg.sender !== lastSender) {
                                                streakCount++;
                                                lastSender = msg.sender;
                                            }
                                        });

                                        streakData[chatUserId] = streakCount;
                                        setStreaks(prev => ({ ...prev, ...streakData }));
                                    }
                                    resolve();
                                }, { onlyOnce: true });
                            });
                        };

                        await tryPath(chatPath1);
                        if (!found) await tryPath(chatPath2);
                    };

                    tryBothPaths();
                });
            } else {
                setRecentChats([]);
            }
        });
    }, [users]);

    // Filter users based on search input
    const filteredUsers = searchTerm
        ? users.filter(user => user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
        : recentChats;

    return (
        <div className="chat">
            <h1>Justuss</h1>
            <br />
            <h3 style={{ fontFamily: 'Poppins' }}>
                <IoIosArrowBack onClick={() => navigate('/')} style={{ cursor: 'pointer' }} /> Chats
            </h3>

            {/* Search bar */}
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '10px',
                    fontFamily: 'Poppins',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            />

            {/* Chat List */}
            <div className="chat-list1">
                {filteredUsers.map((user) => (
                    <div
                        key={user.uid}
                        className={`chat-user ${selectedUser?.uid === user.uid ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedUser(user);
                            onUserSelect(user);
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            marginBottom: '5px',
                            fontFamily: 'Poppins',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {user.username || 'Unknown User'}
                            {streaks[user.uid] > 0 && (
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginLeft: '8px',
                                    color: 'orange',
                                    fontSize: '0.9em'
                                }}>
                                    <ImFire style={{ marginRight: '3px' }} /> {streaks[user.uid]}
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
