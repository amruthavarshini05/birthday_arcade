import { useState } from 'react'
import './App.css'
import CatRun from './games/CatRun'
import CakeDisaster from './games/CakeDisaster'
import BrainCell from './games/BrainCell'

function App() {
  const [currentPage, setCurrentPage] = useState('arcade')

  if (currentPage === 'cat-run') {
    return (
      <CatRun
        onBack={() => setCurrentPage('arcade')}
      />
    )
  }

  if (currentPage === 'cake-disaster') {
    return (
      <CakeDisaster
        onBack={() => setCurrentPage('arcade')}
      />
    )
  }

  if (currentPage === 'brain-cell') {
    return (
      <BrainCell
        onBack={() => setCurrentPage('arcade')}
      />
    )
  }

  return (
    <main className="arcade">

      <header className="hero">
        <p className="eyebrow">
          WELCOME TO THE
        </p>

        <h1>Birthday Arcade 🎮</h1>

        <p className="subtitle">
          Three stupid little games. Zero productivity.
        </p>
      </header>

      <section className="games">

        {/* CAT RUN */}

        <div className="game-card">

          <div className="game-icon">
            🐈
          </div>

          <h2>Cat Run</h2>

          <p>
            How long can the cat survive?
          </p>

          <button
            onClick={() =>
              setCurrentPage('cat-run')
            }
          >
            PLAY
          </button>

        </div>

        {/* CAKE DISASTER */}

        <div className="game-card">

          <div className="game-icon">
            🍰
          </div>

          <h2>Cake Disaster</h2>

          <p>
            Make a cake. Make questionable choices.
          </p>

          <button
            onClick={() =>
              setCurrentPage('cake-disaster')
            }
          >
            PLAY
          </button>

        </div>

        {/* BRAIN CELL */}

        <div className="game-card">

          <div className="game-icon">
            🧠
          </div>

          <h2>Brain Cell</h2>

          <p>
            Catch what little remains.
          </p>

          <button
            onClick={() =>
              setCurrentPage('brain-cell')
            }
          >
            PLAY
          </button>

        </div>

      </section>

      <footer>
        <p>
          Made with questionable amounts of effort 💌
        </p>
      </footer>

    </main>
  )
}

export default App