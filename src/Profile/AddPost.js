import React, { useState } from 'react';
import { auth } from '../firebase'; // Import auth from firebase.js
import { getDatabase, ref, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

function AddPost() {
    const [file, setFile] = useState(null);
    const [postName, setPostName] = useState(''); // New state for post name
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const user = auth.currentUser;

        if (user) {
            const userId = user.uid;
            const storage = getStorage();
            const postRef = storageRef(storage, `posts/${userId}/${postName}`); // Use postName for storage path

            try {
                await uploadBytes(postRef, file);
                const fileUrl = await getDownloadURL(postRef);

                // Save post data to the database
                const db = getDatabase();
                await set(ref(db, 'posts/' + userId + '/' + postName), {
                    imageUrl: fileUrl,
                    description,
                    timestamp: new Date().toISOString(),
                });

                // Redirect or perform other actions after successful upload
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="add-post">
            <h2>Add Post</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Post Name" value={postName} onChange={(e) => setPostName(e.target.value)} required /> {/* Post Name Input */}
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} required />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <button type="submit">Upload Post</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}

export default AddPost;
