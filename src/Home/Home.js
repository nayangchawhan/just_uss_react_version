import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { auth } from '../firebase'; // Ensure auth is imported
import Nav_bar from '../Universe/Nav_bar';

function Home() {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                navigate('/login'); // Redirect to login page after logout
            })
            .catch((error) => {
                console.error('Error logging out:', error);
                // Handle logout errors (e.g., display an error message)
            });
    };

    return (
        <div style={{ display: 'flex' }}>
            <Nav_bar/>
            <div className="main-content" style={{ width: '60%', padding: '10px',marginLeft:'20%' }}>
                {/* Stories Section */}
                <div className="stories" style={{ marginBottom: '20px' }}>
                    <h3>Stories</h3>
                    <div className="story" style={{ display: 'flex', overflowX: 'scroll' }}>
                        {/* Placeholder for stories */}
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#ccc', marginRight: '10px' }}></div>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#ccc', marginRight: '10px' }}></div>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#ccc', marginRight: '10px' }}></div>
                    </div>
                </div>
                {/* Reels Section */}
                <div className="reels">
                    <h3>Reels</h3>
                    <div className="reel" style={{ height: '200px', backgroundColor: '#eee', marginBottom: '10px' }}></div>
                    <div className="reel" style={{ height: '200px', backgroundColor: '#eee', marginBottom: '10px' }}></div>
                </div>
            </div>
        </div>
    );
}

export default Home;
