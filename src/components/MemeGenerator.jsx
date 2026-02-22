import { useState } from 'react'
import { generateMeme, buildMemeUrl } from '../lib/gemini'
import './MemeGenerator.css'

const SUGGESTIONS = [
  'Monday mornings', 'JavaScript bugs', 'eating healthy', 'gym motivation',
  'online meetings', 'my sleep schedule', 'adulting', 'caffeine addiction',
  'debugging at 3am', 'free Wi-Fi', 'reply all emails', 'crypto',
]

export default function MemeGenerator() {
  const [topic, setTopic] = useState('')
  const [memeUrl, setMemeUrl] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const handleGenerate = async (inputTopic) => {
    const t = (inputTopic || topic).trim()
    if (!t) return

    setLoading(true)
    setError(null)
    setMemeUrl(null)
    setExplanation('')

    try {
      const { template, texts, explanation: exp } = await generateMeme(t)
      const url = await buildMemeUrl(template, texts)

      setMemeUrl(url)
      setExplanation(exp)
      setTemplateName(template.name)
      setHistory(prev => [{ url, topic: t, template: template.name }, ...prev.slice(0, 5)])
    } catch (err) {
      console.error('MemeForge error:', err)
      setError(`Something went wrong: ${err.message || 'Try a different topic!'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (s) => {
    setTopic(s)
    handleGenerate(s)
  }

  const handleDownload = async () => {
    if (!memeUrl) return
    const a = document.createElement('a')
    a.href = memeUrl
    a.download = `memeforge-${Date.now()}.jpg`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="generator">
      {/* Input Section */}
      <div className="input-card">
        <label className="input-label">What's the meme about?</label>
        <div className="input-row">
          <input
            className="topic-input"
            type="text"
            placeholder="e.g. Monday mornings, JavaScript bugs, my diet..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            maxLength={120}
            disabled={loading}
          />
          <button
            className="generate-btn"
            onClick={() => handleGenerate()}
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Generating...
              </span>
            ) : (
              '🔥 Generate'
            )}
          </button>
        </div>

        {/* Suggestions */}
        <div className="suggestions">
          <span className="suggestions-label">Try:</span>
          <div className="suggestions-list">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                className="suggestion-chip"
                onClick={() => handleSuggestion(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-card">
          <div className="loading-animation">
            <div className="pulse-ring" />
            <span className="loading-emoji">🧠</span>
          </div>
          <p className="loading-text">AI is cooking up something hilarious...</p>
          <p className="loading-sub">Picking the perfect template + writing the caption</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-card">
          <span className="error-icon">😅</span>
          <p>{error}</p>
        </div>
      )}

      {/* Result */}
      {memeUrl && !loading && (
        <div className="result-card">
          <div className="result-header">
            <span className="result-badge">✨ Fresh Meme</span>
            <span className="result-template">Template: {templateName}</span>
          </div>

          <div className="meme-container">
            <img
              src={memeUrl}
              alt="Generated meme"
              className="meme-image"
              loading="lazy"
            />
          </div>

          {explanation && (
            <div className="explanation">
              <span className="explanation-icon">💡</span>
              <p>{explanation}</p>
            </div>
          )}

          <div className="result-actions">
            <button className="action-btn primary" onClick={() => handleGenerate()}>
              🔄 Regenerate
            </button>
            <button className="action-btn secondary" onClick={handleDownload}>
              ⬇️ Download
            </button>
            <a
              href={memeUrl}
              target="_blank"
              rel="noreferrer"
              className="action-btn secondary"
            >
              🔗 Open Full Size
            </a>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="history-section">
          <h3 className="history-title">Recent Memes</h3>
          <div className="history-grid">
            {history.slice(1).map((item, i) => (
              <div key={i} className="history-item" onClick={() => {
                setMemeUrl(item.url)
                setTemplateName(item.template)
                setTopic(item.topic)
                setExplanation('')
              }}>
                <img src={item.url} alt={item.topic} />
                <span className="history-topic">{item.topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
