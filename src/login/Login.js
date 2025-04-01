import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import auth from firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth'; // Only import once
import { getDatabase, ref, get, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import "./Login.css"
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect to home or perform other actions
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const db = getDatabase(); // Ensure db is initialized
        const storage = getStorage(); // Ensure storage is initialized

        // Upload file
        document.getElementById("uploadBtn").addEventListener("click", async () => {
            const fileInput = document.getElementById("fileInput");
            const fileName = document.getElementById("fileName").value.trim();

            if (!fileName) {
                document.getElementById("uploadStatus").innerText = "Please enter a file name.";
                return;
            }

            if (!fileInput.files.length) {
                document.getElementById("uploadStatus").innerText = "Please select a file.";
                return;
            }

            const file = fileInput.files[0];

            try {
                const fileRef = ref(db, "files/" + fileName);
                const snapshot = await get(fileRef);

                if (snapshot.exists()) {
                    document.getElementById("uploadStatus").innerText = "File name already exists. Choose a different name.";
                    return;
                }

                const fileStorageRef = storageRef(storage, "uploads/" + fileName);
                await uploadBytes(fileStorageRef, file);
                const fileURL = await getDownloadURL(fileStorageRef);

                await set(fileRef, { fileName, fileURL });

                document.getElementById("uploadStatus").innerText = "File uploaded successfully!";
                fileInput.value = "";
                document.getElementById("fileName").value = "";
            } catch (error) {
                console.error("File upload error:", error);
                document.getElementById("uploadStatus").innerText = "Error uploading file.";
            }
        });

        // Search file
        document.getElementById("searchBtn").addEventListener("click", async () => {
            const searchName = document.getElementById("searchName").value.trim();

            if (!searchName) {
                document.getElementById("searchResult").innerText = "Please enter a file name.";
                return;
            }

            try {
                const fileRef = ref(db, "files/" + searchName);
                const snapshot = await get(fileRef);

                if (snapshot.exists()) {
                    const fileData = snapshot.val();
                    document.getElementById("searchResult").innerHTML = `
                        <a href="${fileData.fileURL}" target="_blank">Open File</a>
                    `;
                } else {
                    document.getElementById("searchResult").innerText = "File not found.";
                }
            } catch (error) {
                console.error("File search error:", error);
                document.getElementById("searchResult").innerText = "Error searching for file.";
            }
        });
    }, []); // Empty dependency array to run once on mount

    return (
        <div className='login'>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
                <button id='signupBtn' onClick={() => window.location.href = '/signup'}>Signup</button>
            </form>
            {error && <p>{error}</p>}
            <br></br>
            <h3>Upload File</h3>
            <input type="text" id="fileName" placeholder="Enter file name"/>
            <input type="file" id="fileInput"/>
            <button id="uploadBtn">Upload</button>
            <p id="uploadStatus"></p>
            <br></br>
            <hr/>
            <br></br>
            <h3>Search File</h3>
            <input type="text" id="searchName" placeholder="Enter file name to search"/>
            <button id="searchBtn">Search</button>
            <p id="searchResult"></p>
        </div>
    );
}

export default Login;
