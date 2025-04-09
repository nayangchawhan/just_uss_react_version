import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { getDatabase, ref, get } from 'firebase/database';
import Nav_bar from '../Universe/Nav_bar';
import { BiEditAlt } from "react-icons/bi";
import { CiSettings } from "react-icons/ci";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import "./Profile.css";

function Profile() {
    const { userId } = useParams(); // Get userId from URL (if available)
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [finalUserId, setFinalUserId] = useState(null); // Store the actual user ID to fetch

    useEffect(() => {
        const user = auth.currentUser; // Get the current logged-in user
        setCurrentUser(user);

        if (user) {
            const selectedUserId = userId || user.uid; // If no userId in URL, use the logged-in user
            setFinalUserId(selectedUserId);

            const db = getDatabase();

            // Fetch user data
            const userRef = ref(db, 'users/' + selectedUserId);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    setUserData(snapshot.val());
                }
            });

            // Fetch user posts
            const postsRef = ref(db, 'posts/' + selectedUserId);
            get(postsRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const fetchedPosts = snapshot.val();
                    const formattedPosts = Object.keys(fetchedPosts).map(postName => ({
                        postName,
                        ...fetchedPosts[postName]
                    }));
                    setPosts(formattedPosts);
                }
            });
        }
    }, [userId]); // Runs when userId changes

    const isOwnProfile = currentUser && finalUserId === currentUser.uid; // Check if it's the logged-in user's profile

    return (
        <div className="profile" style={{ display: 'flex', height: '100vh' }}>
            <Nav_bar />
            {userData ? (
                <div className="profile-info">
                    <div className='profile-picture'>
                        <img src={userData.profilePicture} alt="Profile" />
                    </div>
                    <div className='profile-details'>
                        <div className='profile-edit'>
                            <h2>{userData.username} <TbRosetteDiscountCheckFilled style={{color:"#209fff"}}/></h2>
                            {isOwnProfile && (
                                <>
                                    <button onClick={() => navigate('/edit-profile')}>Edit Profile <BiEditAlt /></button>
                                    <button>Settings <CiSettings /></button>
                                </>
                            )}
                        </div>
                        <div className='profile-followers'>
                            <p>{userData.followers} Followers</p>
                            <p>{userData.following} Following</p>
                        </div>
                        <br />
                        <p>@{userData.username}</p>
                        <p style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word',textAlign:'left'}}>{userData.bio}</p>
                        <p>{userData.school}</p>
                    </div>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
            <br />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2>Posts</h2>
                {isOwnProfile && (
                    <button onClick={() => navigate('/add-post')} style={{borderRadius:"50%", marginLeft:"10px", scale:".7", backgroundColor:"#414141"}}>+</button>
                )}
            </div>
            <div className="profile-posts">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={index} className="post">
                            <img src={post.imageUrl} alt="Post" />
                            {/* <p style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>{post.description}</p> */}
                        </div>
                    ))
                ) : (
                    <div className="no-posts">
                        <p>No posts available</p>
                        {isOwnProfile && (
                            <>
                                <button onClick={() => navigate('/add-post')}>Create a Post</button>
                                <p>Share your thoughts with the world!</p>
                                <p>Click the button above to create your first post.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
