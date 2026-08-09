import { useState } from 'react'
import './App.css'
import CatRun from './games/CatRun'

function App() {
  const [currentPage, setCurrentPage] = useState('arcade')

  if (currentPage === 'cat-run') {
    return <CatRun onBack={() => setCurrentPage('arcade')} />
  }

  return (
    <main className="arcade">
      <header className="arcade-header">
        <p className="eyebrow">WELCOME TO THE</p>

        <h1>Birthday Arcade 🎮</h1>

        <p className="subtitle">
          Three stupid little games. Zero productivity.
        </p>
      </header>

      <section className="games">
        <div className="game-card">
          <div className="game-icon">🐈</div>

          <h2>Cat Run</h2>

          <p>
            How long can the cat survive?
          </p>

          <button onClick={() => setCurrentPage('cat-run')}>
            PLAY
          </button>
        </div>

        <div className="game-card locked">
          <div className="game-icon">🍰</div>

          <h2>Cake Disaster</h2>

          <p>
            Make a cake. Make questionable choices.
          </p>

          <button disabled>
            LOCKED 🔒
          </button>
        </div>

        <div className="game-card locked">
          <div className="game-icon">🧠</div>

          <h2>Brain Cell</h2>

          <p>
            Catch what little remains.
          </p>

          <button disabled>
            LOCKED 🔒
          </button>
        </div>
      </section>

      <footer>
        <p>Made with questionable amounts of effort 💌</p>
      </footer>
    </main>
  )
}

export default App