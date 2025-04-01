import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for navigation
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();

    return (
        <div className='Navbar'>
            <div className='Navbar__logo'>
                <h2>Justuss</h2>
            </div>
            <div className='Navbar__links'>
                <ul>
                    {/* <li><Link to="/">Home</Link></li>
                    <li><Link to="/chat">Chat</Link></li>
                    <li><Link to="/signup">Signup</Link></li>
                    <li><Link to="/login">Login</Link></li> */}
                </ul>
            </div>
            <div className='Navbar__button'>
                <button onClick={() => navigate('/login')}>Get Started</button>
            </div>
        </div>
    );
}

export default Navbar;
