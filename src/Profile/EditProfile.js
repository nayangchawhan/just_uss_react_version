import React, { useEffect, useState } from 'react';
import { auth } from '../firebase'; // Import auth from firebase.js
import { getDatabase, ref, get, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import "./EditProfile.css";
import Footer from '../components/Footer'; // Import Footer component

function EditProfile() {
    const [userData, setUserData] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [address, setAddress] = useState('');
    const [school, setSchool] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const db = getDatabase();
        const user = auth.currentUser;

        if (user) {
            const userId = user.uid;
            const userRef = ref(db, 'users/' + userId);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setUserData(data);
                    setUsername(data.username);
                    setEmail(data.email);
                    setBio(data.bio);
                    setAddress(data.address);
                    setSchool(data.school);
                } else {
                    console.log("No user data found");
                }
            });
        }
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const db = getDatabase();
        const user = auth.currentUser;

        if (user) {
            const userId = user.uid;

            // Upload new profile picture if selected
            let profilePictureUrl = '';
            if (profilePicture) {
                const storage = getStorage();
                const imageRef = storageRef(storage, `profilePictures/${userId}`);
                await uploadBytes(imageRef, profilePicture);
                profilePictureUrl = await getDownloadURL(imageRef);
            }

            // Update user data in the database
            await update(ref(db, 'users/' + userId), {
                username,
                email,
                bio,
                address,
                school,
                profilePicture: profilePictureUrl || userData.profilePicture, // Keep old picture if not updated
            });

            // Redirect or perform other actions after successful update
        }
    };

    return (
        <div className='edit-profile'>
            <h2>Edit Profile</h2>
            <form onSubmit={handleUpdate}>
                <p>Username</p>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <p>Email</p>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <p>Bio</p>
                <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
                <p>Address</p>
                <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
                <p>College/School</p>
                <input
                    type="text"
                    placeholder="College/School"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                />
                <p>Profile_pic</p>
                <input
                    type="file"
                    accept="image/*"
                    id='file-upload-button'
                    onChange={(e) => setProfilePicture(e.target.files[0])}
                />
                <button type="submit">Update</button>
            </form>
            {error && <p>{error}</p>}
            <Footer/>
        </div>
    );
}

export default EditProfile;
