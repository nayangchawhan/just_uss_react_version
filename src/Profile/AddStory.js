import React, { useRef, useState } from 'react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, push } from 'firebase/database';
import { auth } from '../firebase';
import Draggable from 'react-draggable';
import './AddStory.css';

const AddStory = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [text, setText] = useState('');
  const [stickers, setStickers] = useState([]);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(30);
  const [filter, setFilter] = useState('none');

  const fileInputRef = useRef();
  const textRef = useRef(null);
  const stickerRefs = useRef({});

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddSticker = (emoji) => {
    const id = Date.now();
    setStickers((prev) => [...prev, { id, emoji, x: 100, y: 100 }]);
    stickerRefs.current[id] = React.createRef();
  };

  const handleStop = (id, data) => {
    setStickers((prevStickers) =>
      prevStickers.map((sticker) =>
        sticker.id === id ? { ...sticker, x: data.x, y: data.y } : sticker
      )
    );
  };

  const renderToCanvas = () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewUrl;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.filter = filter;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // Draw text
        if (text && textRef.current) {
          const { offsetLeft, offsetTop } = textRef.current;
          ctx.fillStyle = textColor;
          ctx.font = `${fontSize}px Arial`;
          ctx.fillText(text, offsetLeft, offsetTop);
        }

        // Draw stickers
        stickers.forEach((sticker) => {
          const stickerEl = stickerRefs.current[sticker.id]?.current;
          if (stickerEl) {
            const { offsetLeft, offsetTop } = stickerEl;
            ctx.font = '40px Arial';
            ctx.fillText(sticker.emoji, offsetLeft, offsetTop + 30);
          }
        });

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob.'));
        }, 'image/jpeg');
      };

      img.onerror = () => reject(new Error('Image failed to load.'));
    });
  };

  const handleUploadStory = async () => {
    if (!image) {
      alert('Please select an image');
      return;
    }

    try {
      const blob = await renderToCanvas();
      const storage = getStorage();
      const filename = `story_${Date.now()}.jpg`;
      const storageReference = storageRef(storage, 'stories/' + filename);
      await uploadBytes(storageReference, blob);
      const downloadUrl = await getDownloadURL(storageReference);

      const db = getDatabase();
      const storyRef = dbRef(db, `stories/${auth.currentUser.uid}`);
      await push(storyRef, {
        imageUrl: downloadUrl,
        text,
        textColor,
        fontSize,
        textPosition: {
          x: textRef.current?.offsetLeft || 0,
          y: textRef.current?.offsetTop || 0,
        },
        stickers,
        filter,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      alert('Story uploaded successfully!');
      setImage(null);
      setPreviewUrl('');
      setText('');
      setStickers([]);
    } catch (err) {
      console.error('Error uploading story:', err);
      alert('Error uploading story.');
    }
  };

  return (
    <div className="add-story-container">
      <h2>Create Story</h2>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <button onClick={() => fileInputRef.current.click()}>Select Image</button>

      {previewUrl && (
        <div className="story-preview-box" style={{ position: 'relative', filter }}>
          <img src={previewUrl} alt="preview" className="story-preview-img" />

          {/* Draggable Text */}
          {text && (
            <Draggable
              nodeRef={textRef}
              defaultPosition={{ x: 100, y: 100 }}
              onStop={(e, data) => handleStop('text', data)}
            >
              <div
                ref={textRef}
                style={{
                  position: 'absolute',
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px black',
                  cursor: 'move',
                  touchAction: 'none',
                }}
              >
                {text}
              </div>
            </Draggable>
          )}

          {/* Draggable Stickers */}
          {stickers.map((sticker) => (
            <Draggable
              key={sticker.id}
              nodeRef={stickerRefs.current[sticker.id]}
              position={{ x: sticker.x, y: sticker.y }}
              onStop={(e, data) => handleStop(sticker.id, data)}
            >
              <div
                ref={stickerRefs.current[sticker.id]}
                style={{
                  position: 'absolute',
                  fontSize: '40px',
                  cursor: 'move',
                  touchAction: 'none',
                }}
              >
                {sticker.emoji}
              </div>
            </Draggable>
          ))}
        </div>
      )}

      {previewUrl && (
        <div className="story-controls">
          <input
            type="text"
            placeholder="Enter text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
          <input
            type="range"
            min="10"
            max="100"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="none">None</option>
            <option value="grayscale(100%)">Grayscale</option>
            <option value="sepia(100%)">Sepia</option>
            <option value="blur(3px)">Blur</option>
            <option value="contrast(150%)">High Contrast</option>
            <option value="brightness(120%)">Bright</option>
          </select>

          <div className="emoji-palette">
            {['😂', '🔥', '❤️', '🎉', '🌟', '😎'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddSticker(emoji)}
                style={{ fontSize: '24px', margin: '4px' }}
              >
                {emoji}
              </button>
            ))}
          </div>

          <button onClick={handleUploadStory}>Upload Story</button>
        </div>
      )}
    </div>
  );
};

export default AddStory;
