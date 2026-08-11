import {
  useEffect,
  useState,
} from 'react'

import './BrainCell.css'

const FALLING_OBJECTS = [
  {
    type: '🧠',
    points: 10,
  },
  {
    type: '☕',
    points: 15,
  },
  {
    type: '📱',
    points: -5,
  },
  {
    type: '🧟‍♀️',
    points: -10,
  },
  {
    type: '📖',
    points: -15,
  },
]

function BrainCell({ onBack }) {
  const [gameStarted, setGameStarted] =
    useState(false)

  const [playerX, setPlayerX] =
    useState(50)

  const [fallingObjects, setFallingObjects] =
    useState([])

  const [score, setScore] =
    useState(0)

  const [highScore, setHighScore] =
    useState(() => {
      const savedScore =
        localStorage.getItem(
          'brainCellHighScore'
        )

      return savedScore
        ? Number(savedScore)
        : 0
    })

  /*
   * =====================================================
   * KEYBOARD CONTROLS
   * =====================================================
   */

  useEffect(() => {
    if (!gameStarted) return

    function handleKeyDown(event) {
      if (
        event.key === 'ArrowLeft' ||
        event.key.toLowerCase() === 'a'
      ) {
        setPlayerX(
          (current) =>
            Math.max(
              8,
              current - 5
            )
        )
      }

      if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'd'
      ) {
        setPlayerX(
          (current) =>
            Math.min(
              92,
              current + 5
            )
        )
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [gameStarted])

  /*
   * =====================================================
   * SPAWN OBJECTS
   * =====================================================
   */

  useEffect(() => {
    if (!gameStarted) return

    const spawnTimer =
      setInterval(() => {
        const object =
          FALLING_OBJECTS[
            Math.floor(
              Math.random() *
                FALLING_OBJECTS.length
            )
          ]

        setFallingObjects(
          (current) => [
            ...current,
            {
              id:
                Date.now() +
                Math.random(),

              type:
                object.type,

              points:
                object.points,

              x:
                Math.random() *
                  84 +
                8,

              y: -5,
            },
          ]
        )
      }, 1000)

    return () =>
      clearInterval(
        spawnTimer
      )
  }, [gameStarted])

  /*
   * =====================================================
   * MOVE + CATCH OBJECTS
   * =====================================================
   */

  useEffect(() => {
    if (!gameStarted) return

    const fallTimer =
      setInterval(() => {
        setFallingObjects(
          (current) => {
            const nextObjects = []

            current.forEach(
              (object) => {
                const nextY =
                  object.y + 2

                /*
                 * CATCH ZONE
                 */

                if (
                  nextY >= 88 &&
                  nextY <= 96
                ) {
                  const horizontalDistance =
                    Math.abs(
                      object.x -
                        playerX
                    )

                  if (
                    horizontalDistance <=
                    8
                  ) {
                    setScore(
                      (currentScore) => {
                        const newScore =
                          currentScore +
                          object.points

                        if (
                          newScore >
                          highScore
                        ) {
                          setHighScore(
                            newScore
                          )

                          localStorage.setItem(
                            'brainCellHighScore',
                            newScore.toString()
                          )
                        }

                        return newScore
                      }
                    )

                    return
                  }
                }

                /*
                 * KEEP FALLING
                 */

                if (
                  nextY < 105
                ) {
                  nextObjects.push({
                    ...object,
                    y: nextY,
                  })
                }
              }
            )

            return nextObjects
          }
        )
      }, 50)

    return () =>
      clearInterval(
        fallTimer
      )
  }, [
    gameStarted,
    playerX,
    highScore,
  ])

  /*
   * =====================================================
   * TOUCH / MOUSE DRAGGING
   * =====================================================
   *
   * The entire game area is draggable.
   *
   * On mobile:
   * Put your finger anywhere in the game,
   * drag left/right, and the face follows.
   */

  function updatePlayerFromPointer(
    event
  ) {
    if (!gameStarted) return

    const area =
      event.currentTarget.getBoundingClientRect()

    const percentage =
      ((event.clientX -
        area.left) /
        area.width) *
      100

    setPlayerX(
      Math.max(
        8,
        Math.min(
          92,
          percentage
        )
      )
    )
  }

  function handlePointerDown(
    event
  ) {
    if (!gameStarted) return

    event.preventDefault()

    event.currentTarget.setPointerCapture(
      event.pointerId
    )

    updatePlayerFromPointer(
      event
    )
  }

  function handlePointerMove(
    event
  ) {
    if (!gameStarted) return

    /*
     * Only move while the user is
     * actively holding a pointer.
     */

    if (
      event.buttons === 0 &&
      event.pointerType !==
        'touch'
    ) {
      return
    }

    event.preventDefault()

    updatePlayerFromPointer(
      event
    )
  }

  /*
   * =====================================================
   * ARROW BUTTON CONTROLS
   * =====================================================
   */

  function movePlayer(
    direction
  ) {
    setPlayerX(
      (current) => {
        if (
          direction ===
          'left'
        ) {
          return Math.max(
            8,
            current - 5
          )
        }

        return Math.min(
          92,
          current + 5
        )
      }
    )
  }

  /*
   * =====================================================
   * START
   * =====================================================
   */

  function startGame() {
    setPlayerX(50)

    setFallingObjects([])

    setScore(0)

    setGameStarted(true)
  }

  return (
    <main className="brain-cell">

      {/* =================================================
          BACKGROUND DECOR
      ================================================= */}

      <div className="brain-confetti brain-confetti-one">
        ✦
      </div>

      <div className="brain-confetti brain-confetti-two">
        ⚡
      </div>

      <div className="brain-confetti brain-confetti-three">
        • • •
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="brain-cell-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Arcade
        </button>

        <div className="brain-title">

          <span className="brain-title-icon">
            🧠
          </span>

          <div>

            <p className="brain-eyebrow">
              MENTAL CAPACITY: QUESTIONABLE
            </p>

            <h1>
              Brain Cell
            </h1>

            <p>
              Catch what little remains.
            </p>

          </div>

        </div>

      </header>

      {/* =================================================
          START SCREEN
      ================================================= */}

      {!gameStarted ? (

        <section className="brain-start">

          <div className="brain-start-art">

            <span className="brain-main">
              🧠
            </span>

            <span className="brain-spark brain-spark-one">
              ⚡
            </span>

            <span className="brain-spark brain-spark-two">
              ✦
            </span>

          </div>

          <p className="brain-section-label">
            BRAIN STATUS: BARELY FUNCTIONAL
          </p>

          <h2>
            Protect the brain cell!
          </h2>

          <p className="brain-start-copy">
            Catch the good stuff.
            Avoid the questionable stuff.
            Try to keep at least one
            brain cell operational.
          </p>

          {/* =================================================
              POINTS
          ================================================= */}

          <div className="brain-points">

            <div className="brain-points-heading">
              <span>
                POINTS SYSTEM
              </span>

              <span>
                CATCH IT
              </span>
            </div>

            <div className="brain-point-row">

              <span>
                🧠 Brain
              </span>

              <strong className="positive">
                +10
              </strong>

            </div>

            <div className="brain-point-row">

              <span>
                ☕ Coffee
              </span>

              <strong className="positive">
                +15
              </strong>

            </div>

            <div className="brain-point-row">

              <span>
                📱 Phone
              </span>

              <strong className="negative">
                -5
              </strong>

            </div>

            <div className="brain-point-row">

              <span>
                🧟‍♀️ Dead Brain Cell
              </span>

              <strong className="negative">
                -10
              </strong>

            </div>

            <div className="brain-point-row">

              <span>
                📖 Book
              </span>

              <strong className="negative">
                -15
              </strong>

            </div>

          </div>

          {/* =================================================
              CONTROLS INFO
          ================================================= */}

          <div className="brain-controls-hint">

            <span>
              🖱️ DRAG
            </span>

            <span>
              ⌨️ ← →
            </span>

            <span>
              📱 TOUCH
            </span>

          </div>

          <button
            className="brain-start-button"
            onClick={startGame}
          >
            SAVE THE BRAIN
            <span>
              🧠
            </span>
          </button>

        </section>

      ) : (

        /* =================================================
           GAME
        ================================================= */

        <section className="brain-game">

          {/* =================================================
              SCORE BOARD
          ================================================= */}

          <div className="brain-score-board">

            <div className="brain-score-card">

              <span>
                🧠 SCORE
              </span>

              <strong>
                {score}
              </strong>

            </div>

            <div className="brain-score-card high-score">

              <span>
                🏆 HIGH SCORE
              </span>

              <strong>
                {highScore}
              </strong>

            </div>

          </div>

          {/* =================================================
              PLAY AREA
          ================================================= */}

          <div
            className="brain-play-area"
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
          >

            {/* Falling objects */}

            {fallingObjects.map(
              (object) => (
                <span
                  key={object.id}
                  className={`falling-object ${
                    object.points > 0
                      ? 'good-object'
                      : 'bad-object'
                  }`}
                  style={{
                    left: `${object.x}%`,
                    top: `${object.y}%`,
                  }}
                >
                  {object.type}
                </span>
              )
            )}

            {/* Player */}

            <div
              className="brain-player"
              style={{
                left: `${playerX}%`,
              }}
            >
              👧
            </div>

            {/* Touch hint */}

            <div className="brain-touch-hint">
              DRAG TO MOVE
            </div>

          </div>

          {/* =================================================
              DESKTOP CONTROLS
          ================================================= */}

          <div className="brain-controls">

            <button
              type="button"
              onPointerDown={() =>
                movePlayer(
                  'left'
                )
              }
            >
              ◀
            </button>

            <span>
              MOVE
            </span>

            <button
              type="button"
              onPointerDown={() =>
                movePlayer(
                  'right'
                )
              }
            >
              ▶
            </button>

          </div>

          {/* =================================================
              MOBILE INSTRUCTION
          ================================================= */}

          <p className="brain-mobile-hint">
            Touch and drag anywhere
            to move the brain catcher.
          </p>

        </section>

      )}

    </main>
  )
}

export default BrainCell