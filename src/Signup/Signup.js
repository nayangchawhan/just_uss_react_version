import React, { useState } from 'react';
import { auth } from '../firebase'; // Import auth from firebase.js
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import "./Signup.css";

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [bio, setBio] = useState('');
    const [school, setSchool] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        const db = getDatabase();
        const storage = getStorage();

        // Check for duplicate username
        const usernameRef = ref(db, 'users/' + username);
        const snapshot = await get(usernameRef);
        if (snapshot.exists()) {
            setError('Username already taken. Please choose another.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Upload profile picture if selected
            let profilePictureUrl = '';
            if (profilePicture) {
                const imageRef = storageRef(storage, `profilePictures/${user.uid}`);
                await uploadBytes(imageRef, profilePicture);
                profilePictureUrl = await getDownloadURL(imageRef);
            }

            // Store user data in the database under user ID
            await set(ref(db, 'users/' + user.uid), {
                uid: user.uid,
                username,
                email,
                dob,
                address,
                bio,
                school,
                profilePicture: profilePictureUrl,
            });

            // Start tracking location
            startTrackingLocation(user.uid);

            // Redirect or perform other actions after successful signup
        } catch (err) {
            setError(err.message);
        }
    };

    const startTrackingLocation = (userId) => {
        if (navigator.geolocation) {
            setInterval(() => {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationRef = ref(getDatabase(), 'users/' + userId + '/location');
                    await set(locationRef, {
                        latitude,
                        longitude,
                        timestamp: new Date().toISOString(),
                    });
                });
            }, 60000); // Update every minute
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    return (
        <div className='signup'>
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="date"
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="College/School"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicture(e.target.files[0])}
                />
                <button type="submit">Signup</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}

export default Signup;
