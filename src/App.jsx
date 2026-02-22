import { useState } from 'react'
import MemeGenerator from './components/MemeGenerator'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🔥</span>
            <span className="logo-text">MemeForge</span>
            <span className="logo-badge">AI</span>
          </div>
          <p className="header-sub">Drop a topic. Get a meme. It's that simple.</p>
        </div>
      </header>
      <main className="main">
        <MemeGenerator />
      </main>
      <footer className="footer">
        <p>Built with ❤️ by Marcos · Powered by Gemini AI</p>
      </footer>
    </div>
  )
}

export default App
