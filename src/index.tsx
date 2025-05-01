import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import NavigationBarBottom from './navigation-bar-bottom.tsx'
import Profile from './profile'
import VerticalFlashcardGallery from './VerticalFlashcardGallery.tsx'

const App = () => {
  // state theo dõi tab đang active: 'home' | 'profile' | 'flashcards'
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'flashcards'>('home')

  return (
    <>
      {/* vùng content tùy tab */}
      {activeTab === 'home' && <Profile />}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'flashcards' && <VerticalFlashcardGallery />}

      {/* navigation bar dưới cùng */}
      <NavigationBarBottom
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
      />
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
