import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import EditProfile from './Profile/EditProfile'; // Import EditProfile component
import { useEffect, useState } from 'react';
import { auth } from './firebase'; // Import auth from firebase.js
import Login from './login/Login'; // Updated import path
import Signup from './Signup/Signup';
import Home from './Home/Home'; // Updated import path
import Chat from './Texting/Chat'; // Updated import path
import Navbar from "./components/Navbar";
import Landing_page from './components/Landing_page';
import Content from "./components/Content";
import Profile from './Profile/Profile'; // Updated import path
import AddPost from './Profile/AddPost';
import ChatApp from './Texting/ChatApp';
import DropChat from './Texting/DropChat'; // Updated import path
import AddStory from './Profile/AddStory';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
                <Route path="/" element={user ? <Home /> : <Navigate to="/Landing_page" />} />
                <Route path="/content" element={user ? <Content /> : <Navigate to="/login" />} />
                <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
                <Route path="/Landing_page" element={<Landing_page />} />
                <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/login" />} /> // Add route for EditProfile
                <Route path="/Profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/add-post" element={user ? <AddPost /> : <Navigate to="/login" />} />
                <Route path="/AI" element={user ? <ChatApp/> : <Navigate to="/login" />} />
                <Route path='/dropchat' element={user ? <DropChat /> : <Navigate to="/login" />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/add-story" element={<AddStory />} />
            </Routes>
        </Router>
    );
}

export default App;
