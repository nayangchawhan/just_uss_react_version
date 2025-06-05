// src/Components/StoryModal.js
import React, { useEffect, useState } from 'react';

const StoryModal = ({ data, onClose }) => {
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

    const currentUser = data[currentUserIndex];
    const currentStory = currentUser.items[currentStoryIndex];

    const handleNext = () => {
        if (currentStoryIndex < currentUser.items.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
        } else if (currentUserIndex < data.length - 1) {
            setCurrentUserIndex(currentUserIndex + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose(); // Close if no more stories
        }
    };

    const handlePrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else if (currentUserIndex > 0) {
            const prevUser = data[currentUserIndex - 1];
            setCurrentUserIndex(currentUserIndex - 1);
            setCurrentStoryIndex(prevUser.items.length - 1);
        }
    };

    useEffect(() => {
        const timer = setTimeout(handleNext, 5000); // auto-next after 5 sec
        return () => clearTimeout(timer);
    }, [currentStoryIndex, currentUserIndex]);

    return (
        <div style={styles.overlay}>
            <div style={styles.storyContainer}>
                <img src={currentStory.imageUrl} alt="story" style={styles.image} />
                <div style={styles.topBar}>
                    <img src={currentUser.profileImage} alt="profile" style={styles.profilePic} />
                    <span style={styles.username}>{currentUser.username}</span>
                </div>
                <div style={styles.controls}>
                    <button onClick={handlePrev}>⟸</button>
                    <button onClick={onClose}>✕</button>
                    <button onClick={handleNext}>⟹</button>
                </div>
                <div style={styles.reactions}>
                    ❤️ 😂 😮 😢 👍
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    },
    storyContainer: {
        width: '360px',
        height: '640px',
        backgroundColor: '#000',
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    topBar: {
        position: 'absolute',
        top: 10,
        left: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#fff'
    },
    profilePic: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        border: '2px solid white'
    },
    username: {
        fontWeight: 'bold'
    },
    controls: {
        position: 'absolute',
        top: 10,
        right: 10,
        display: 'flex',
        gap: '5px'
    },
    reactions: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        textAlign: 'center',
        fontSize: '24px',
        color: '#fff'
    }
};

export default StoryModal;
