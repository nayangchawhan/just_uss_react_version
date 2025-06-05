import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import Stories from 'react-insta-stories';
import Nav_bar from '../Universe/Nav_bar';

function Home() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    const storiesRef = dbRef(db, 'stories/');
    onValue(storiesRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allStories = [];

        for (const userId of Object.keys(data)) {
          const userStories = data[userId];
          for (const storyId of Object.keys(userStories)) {
            const story = userStories[storyId];
            const imageUrl = await getDownloadURL(storageRef(storage, story.imageUrl));
            allStories.push({
              id: storyId,
              userId,
              url: imageUrl,
              header: {
                heading: story.username || 'Unknown',
                subheading: new Date(story.timestamp).toLocaleString(),
                profileImage: story.profileImage || 'default-profile.png',
              },
              expiresAt: story.expiresAt,
            });
          }
        }

        const currentTime = Date.now();
        const activeStories = allStories.filter((story) => story.expiresAt > currentTime);
        setStories(activeStories);
      } else {
        setStories([]);
      }
    });
  }, []);

  const handleStoryClick = (index) => {
    setCurrentStoryIndex(index);
    setShowStoryViewer(true);
  };

  const handleAllStoriesEnd = () => {
    setShowStoryViewer(false);
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <div style={{ display: 'flex' }}>
      <Nav_bar />
      <div className="main-content" style={{ width: '60%', padding: '10px', marginLeft: '20%' }}>
        {/* Stories Section */}
        <div className="stories" style={{ marginBottom: '20px' }}>
          <h3>Stories</h3>
          {showStoryViewer ? (
            <Stories
              stories={stories.map((story) => ({
                url: story.url,
                header: story.header,
              }))}
              currentIndex={currentStoryIndex}
              defaultInterval={5000}
              width={432}
              height={768}
              onAllStoriesEnd={handleAllStoriesEnd}
            />
          ) : (
            <div className="story" style={{ display: 'flex', overflowX: 'scroll' }}>
              {stories.map((story, index) => (
                <div
                  key={story.id}
                  onClick={() => handleStoryClick(index)}
                  style={{
                    width: '100px',
                    height: '100px',
                    marginRight: '10px',
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    backgroundImage: `
                      linear-gradient(white, white),
                      radial-gradient(circle at top left, #f58529, #dd2a7b, #8134af, #515bd4)
                    `,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'content-box, border-box',
                    padding: '3px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundImage: `url(${story.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
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
