import React from 'react';
import ReactDOM from 'react-dom/client';
import VerticalFlashcardGallery from './VerticalFlashcardGallery.tsx';
import NavigationBarBottom from './navigation-bar-bottom.tsx';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <VerticalFlashcardGallery />
      </div>
      <NavigationBarBottom />
    </div>
  </React.StrictMode>
);
