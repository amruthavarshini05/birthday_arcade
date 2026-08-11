import { useState } from 'react'
import './App.css'
import CatRun from './games/CatRun'
import CakeDisaster from './games/CakeDisaster'
import BrainCell from './games/BrainCell'
import catRunIcon from './assets/cat-run/cat_run_1.png'

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

      {/* BACKGROUND DECORATIONS */}

      <div className="arcade-decoration decoration-star star-one">
        ✦
      </div>

      <div className="arcade-decoration decoration-star star-two">
        ✧
      </div>

      <div className="arcade-decoration decoration-star star-three">
        ★
      </div>

      <div className="arcade-decoration decoration-dot dot-one" />
      <div className="arcade-decoration decoration-dot dot-two" />
      <div className="arcade-decoration decoration-dot dot-three" />

      {/* HERO */}

      <header className="arcade-header">

        <div className="birthday-badge">
          🎉 THE BIRTHDAY ARCADE 🎉
        </div>

        <p className="eyebrow">
          WELCOME TO THE
        </p>

        <h1>
          Birthday
          <span> Arcade 🎮</span>
        </h1>

        <p className="subtitle">
          Three stupid little games.
          <br />
          Zero productivity.
          <br />
          <strong>Maximum birthday nonsense.</strong>
        </p>

        <div className="coin-message">
          <span>✦</span>
          INSERT COIN TO PROCRASTINATE
          <span>✦</span>
        </div>

      </header>

      {/* GAMES */}

      <section className="games">

        {/* CAT RUN */}

        <article className="game-card cat-card">

          <div className="card-number">
            01
          </div>

          <div className="game-icon cat-icon">
  <img
    src={catRunIcon}
    alt="Cat Run"
  />
</div>

          <div className="game-card-content">

            <p className="game-label">
              ENDLESS RUNNER
            </p>

            <h2>
              Cat Run
            </h2>

            <p className="game-description">
              How long can the cat survive
              before the universe decides
              it has suffered enough?
            </p>

          </div>

          <button
            className="game-button"
            onClick={() =>
              setCurrentPage('cat-run')
            }
          >
            PLAY
            <span>→</span>
          </button>

        </article>

        {/* CAKE DISASTER */}

        <article className="game-card cake-card">

          <div className="card-number">
            02
          </div>

{/* CAKE DISASTER */}

<div className="game-icon cake-icon">

  <div className="cake-start-art">

    <span className="start-cake">
      🎂
    </span>

    <span className="floating-berry">
      🍓
    </span>

    <span className="floating-star">
      ✦
    </span>

  </div>

</div>

          <div className="game-card-content">

            <p className="game-label">
              BAKING SIMULATOR
            </p>

            <h2>
              Cake Disaster
            </h2>

            <p className="game-description">
              Make a cake.
              <br />
              Make questionable choices.
              <br />
              Pretend it was intentional.
            </p>

          </div>

          <button
            className="game-button"
            onClick={() =>
              setCurrentPage('cake-disaster')
            }
          >
            PLAY
            <span>→</span>
          </button>

        </article>

        {/* BRAIN CELL */}

        <article className="game-card brain-card">

          <div className="card-number">
            03
          </div>

{/* BRAIN CELL */}

<div className="game-icon brain-icon">

  <div className="brain-hero">

    <div className="brain-big">
      🧠
    </div>

    <div className="brain-spark spark-one">
      ⚡
    </div>

    <div className="brain-spark spark-two">
      ✦
    </div>

  </div>

</div>

          <div className="game-card-content">

            <p className="game-label">
              SURVIVAL SIMULATOR
            </p>

            <h2>
              Brain Cell
            </h2>

            <p className="game-description">
              Catch what little remains.
              <br />
              Protect the last two neurons
              fighting for their lives.
            </p>

          </div>

          <button
            className="game-button"
            onClick={() =>
              setCurrentPage('brain-cell')
            }
          >
            PLAY
            <span>→</span>
          </button>

        </article>

      </section>

      {/* FOOTER */}

      <footer>

        <div className="footer-line">
          <span />
          <span>✦</span>
          <span />
        </div>

        <p>
          Made with questionable amounts of effort 💌
        </p>

        <small>
          No cats, cakes, or brain cells were permanently harmed.
        </small>

      </footer>

    </main>
  )
}

export default App