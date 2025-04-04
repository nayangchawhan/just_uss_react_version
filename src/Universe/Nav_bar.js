import React from 'react'
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { auth } from '../firebase'; // Ensure auth is imported
import { MdExitToApp } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { GiFairyWand } from "react-icons/gi";
import { LiaShoppingBasketSolid } from "react-icons/lia";
import { PiChats } from "react-icons/pi";
import { IoHomeOutline } from "react-icons/io5";
import { PiChatTeardropDots } from "react-icons/pi";
import "./Navbar.css"

const Nav_bar = () => {
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
    <div>
        <div className="sidebar">
                {/* Navigation bar on the left */}
                <h1>Justuss</h1>
                <br></br>
                <ul>
                    <li onClick={() => navigate('/')}><IoHomeOutline /> Home</li><br></br>
                    <li onClick={() => navigate('/chat')}><PiChats /> Chat</li><br></br> {/* Navigate to Chat */}
                    <li onClick={() => navigate('/dropchat')}><PiChatTeardropDots /> DropChat</li><br></br> {/* Navigate to DropChat */}
                    <li onClick={() => navigate('/AI')} >
                        <GiFairyWand style={{ color: 'gold' }} /> JustMind
                    </li><br></br>
                    <li onClick={() => navigate('/Profile')}><CgProfile /> Profile</li><br></br>
                    <li onClick={handleLogout} style={{color:"red",alignItems:"center"}}><MdExitToApp /> Logout</li><br></br>
                </ul>
            </div>
    </div>
  )
}

export default Nav_bar