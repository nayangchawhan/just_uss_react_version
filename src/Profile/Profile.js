import React, { useEffect, useState } from 'react';
import { auth } from '../firebase'; // Import auth from firebase.js
import { getDatabase, ref, get } from 'firebase/database';
import Nav_bar from '../Universe/Nav_bar';
import { useNavigate } from 'react-router-dom';
import { BiEditAlt } from "react-icons/bi";
import { CiSettings } from "react-icons/ci";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const db = getDatabase();
        const user = auth.currentUser; // Get the current user

        //console.log("Current user:", user); // Log current user

        if (user) {
            const userId = user.uid; // Get the current user's ID

            // Fetch user data
            const userRef = ref(db, 'users/' + userId);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    setUserData(snapshot.val());
                    //console.log("User data fetched:", snapshot.val()); // Log user data
                } else {
                    //console.log("No user data found");
                }
            });

            // Fetch user posts
            const postsRef = ref(db, 'posts/' + userId); // Adjusted to match the schema
            get(postsRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const fetchedPosts = snapshot.val();
                    const formattedPosts = Object.keys(fetchedPosts).map(postName => ({
                        postName,
                        ...fetchedPosts[postName]
                    }));
                    setPosts(formattedPosts);
                    //console.log("User posts fetched:", formattedPosts); // Log user posts
                } else {
                    //console.log("No posts found");
                }
            });
        } else {
            //console.log("User is not authenticated");
        }
    }, []);

    return (
        <div className="profile">
            <Nav_bar />
            {userData ? (
                <div className="profile-info">
                    <div className='profile-picture'>
                        <img src={userData.profilePicture} alt="Profile" />
                    </div>
                    <div className='profile-details'>
                        <div className='profile-edit'>
                            <h2>{userData.username} <TbRosetteDiscountCheckFilled style={{color:"#209fff"}}/></h2>
                            <button onClick={() => navigate('/edit-profile')}>Edit Profile <BiEditAlt /></button>
                            <button>Settings <CiSettings  style={{justifyContent:"baseline"}}/></button>
                        </div>
                        <div className='profile-followers'>
                            <p>{userData.followers} Followers</p>
                            <p>{userData.following} Following</p>
                        </div>
                        <br></br>
                        <p>@{userData.username}</p>
                        <p style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>{userData.bio}</p>
                        <p>{userData.school}</p>
                    </div>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
            <br></br>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <h2>Posts</h2>
                <button onClick={() => navigate('/add-post')} style={{borderRadius:"50%",marginLeft:"10px",scale:".7",backgroundColor:"#414141"}}>+</button>
            </div>
            <div className="profile-posts">
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={index} className="post">
                            <img src={post.imageUrl} alt="Post" />
                            <p style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>{post.description}</p> {/* Display description */}
                        </div>
                    ))
                ) : (
                    <div className="no-posts">
                        <p>No posts available</p>
                        <button onClick={() => navigate('/add-post')}>Create a Post</button>
                        <p>Share your thoughts with the world!</p>
                        <p>Click the button above to create your first post.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
