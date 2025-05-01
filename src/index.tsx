import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import NavigationBarBottom from './navigation-bar-bottom.tsx'
import Profile from './profile.tsx'
import VerticalFlashcardGallery from './VerticalFlashcardGallery.tsx'

const App = () => {
  // state theo dõi tab đang active
  const [activeTab, setActiveTab] = useState('home')
  
  // Xác định nội dung hiển thị dựa trên tab active
  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <VerticalFlashcardGallery />
      case 'quiz':
        return <div className="p-4 text-center text-white">Nội dung trắc nghiệm</div>
      case 'story':
        return <div className="p-4 text-center text-white">Nội dung truyện</div>
      case 'game':
        return <div className="p-4 text-center text-white">Nội dung mini game</div>
      case 'profile':
        return <Profile />
      default:
        return <VerticalFlashcardGallery />
    }
  }

  return (
    <div className="app-container">
      {/* vùng content tùy tab */}
      <div className="main-content pb-24">
        {renderContent()}
      </div>
      
      {/* navigation bar dưới cùng */}
      <NavigationBarBottom 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
