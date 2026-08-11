import { useEffect, useRef, useState } from 'react'
import './BrainCell.css'

const FALLING_OBJECTS = [
  { type: '🧠', points: 10 },
  { type: '☕', points: 15 },
  { type: '📱', points: -5 },
  { type: '🧟‍♀️', points: -10 },
  { type: '📖', points: -15 },
]

const GAME_DURATION = 60

function BrainCell({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const [playerX, setPlayerX] = useState(50)
  const [fallingObjects, setFallingObjects] = useState([])

  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)

  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem(
      'brainCellHighScore'
    )

    return savedScore ? Number(savedScore) : 0
  })

  const [scorePopups, setScorePopups] = useState([])

  const playerXRef = useRef(50)
  const scoreRef = useRef(0)
  const highScoreRef = useRef(highScore)

  const objectsRef = useRef([])

  const lastTimeRef = useRef(null)
  const elapsedRef = useRef(0)
  const spawnAccumulatorRef = useRef(0)

  const movementRef = useRef(null)

  useEffect(() => {
    highScoreRef.current = highScore
  }, [highScore])

  /*
   * KEYBOARD CONTROLS
   */

  useEffect(() => {
    if (!gameStarted) return

    function handleKeyDown(event) {
      if (
        event.key === 'ArrowLeft' ||
        event.key.toLowerCase() === 'a'
      ) {
        movementRef.current = 'left'
      }

      if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'd'
      ) {
        movementRef.current = 'right'
      }
    }

    function handleKeyUp(event) {
      if (
        event.key === 'ArrowLeft' ||
        event.key.toLowerCase() === 'a'
      ) {
        if (movementRef.current === 'left') {
          movementRef.current = null
        }
      }

      if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'd'
      ) {
        if (movementRef.current === 'right') {
          movementRef.current = null
        }
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    window.addEventListener(
      'keyup',
      handleKeyUp
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

      window.removeEventListener(
        'keyup',
        handleKeyUp
      )
    }
  }, [gameStarted])

  /*
   * MAIN GAME LOOP
   */

  useEffect(() => {
    if (!gameStarted) return

    lastTimeRef.current = performance.now()
    elapsedRef.current = 0
    spawnAccumulatorRef.current = 0

    const gameLoop = (currentTime) => {
      const delta =
        currentTime - lastTimeRef.current

      lastTimeRef.current = currentTime

      elapsedRef.current += delta

      const elapsedSeconds =
        elapsedRef.current / 1000

      /*
       * TIMER
       */

      const remainingTime = Math.max(
        0,
        Math.ceil(
          GAME_DURATION -
            elapsedSeconds
        )
      )

      setTimeLeft(remainingTime)

      /*
       * GAME OVER
       */

      if (
        elapsedSeconds >= GAME_DURATION
      ) {
        setGameStarted(false)
        setGameOver(true)

        setFallingObjects([])

        objectsRef.current = []
        movementRef.current = null

        return
      }

      /*
       * DIFFICULTY
       */

      let spawnRate = 1200
      let fallSpeed = 1.5

      if (elapsedSeconds >= 15) {
        spawnRate = 1000
        fallSpeed = 2
      }

      if (elapsedSeconds >= 30) {
        spawnRate = 800
        fallSpeed = 2.5
      }

      if (elapsedSeconds >= 45) {
        spawnRate = 600
        fallSpeed = 3
      }

      /*
       * PLAYER MOVEMENT
       */

      if (movementRef.current) {
        setPlayerX((current) => {
          let next = current

          if (
            movementRef.current === 'left'
          ) {
            next = Math.max(
              8,
              current -
                0.35 *
                  (delta / 16.67)
            )
          }

          if (
            movementRef.current === 'right'
          ) {
            next = Math.min(
              92,
              current +
                0.35 *
                  (delta / 16.67)
            )
          }

          playerXRef.current = next

          return next
        })
      }

      /*
       * SPAWN OBJECTS
       */

      spawnAccumulatorRef.current += delta

      if (
        spawnAccumulatorRef.current >=
        spawnRate
      ) {
        spawnAccumulatorRef.current = 0

        const object =
          FALLING_OBJECTS[
            Math.floor(
              Math.random() *
                FALLING_OBJECTS.length
            )
          ]

        objectsRef.current.push({
          id:
            Date.now() +
            Math.random(),

          type: object.type,

          points: object.points,

          x:
            Math.random() * 84 +
            8,

          y: -5,
        })
      }

      /*
       * MOVE + CATCH OBJECTS
       */

      const nextObjects = []

      objectsRef.current.forEach(
        (object) => {
          const nextY =
            object.y +
            fallSpeed *
              (delta / 50)

          /*
           * CATCH
           */

          if (
            nextY >= 88 &&
            nextY <= 96
          ) {
            const horizontalDistance =
              Math.abs(
                object.x -
                  playerXRef.current
              )

            if (
              horizontalDistance <= 8
            ) {
              scoreRef.current +=
                object.points

              setScore(
                scoreRef.current
              )

              /*
               * SCORE POPUP
               */

              const popup = {
                id:
                  Date.now() +
                  Math.random(),

                x: object.x,

                y: nextY,

                points:
                  object.points,
              }

              setScorePopups(
                (current) => [
                  ...current,
                  popup,
                ]
              )

              setTimeout(() => {
                setScorePopups(
                  (current) =>
                    current.filter(
                      (item) =>
                        item.id !==
                        popup.id
                    )
                )
              }, 700)

              /*
               * HIGH SCORE
               */

              if (
                scoreRef.current >
                highScoreRef.current
              ) {
                highScoreRef.current =
                  scoreRef.current

                setHighScore(
                  scoreRef.current
                )

                localStorage.setItem(
                  'brainCellHighScore',
                  scoreRef.current.toString()
                )
              }

              return
            }
          }

          /*
           * KEEP OBJECT
           */

          if (nextY < 105) {
            nextObjects.push({
              ...object,
              y: nextY,
            })
          }
        }
      )

      objectsRef.current =
        nextObjects

      setFallingObjects(
        nextObjects
      )

      animationFrame =
        requestAnimationFrame(
          gameLoop
        )
    }

    let animationFrame =
      requestAnimationFrame(
        gameLoop
      )

    return () => {
      cancelAnimationFrame(
        animationFrame
      )

      movementRef.current = null
    }
  }, [gameStarted])

  /*
   * MOBILE CONTROLS
   */

  function startMoving(direction) {
    movementRef.current =
      direction
  }

  function stopMoving() {
    movementRef.current = null
  }

  /*
   * START GAME
   */

  function startGame() {
    playerXRef.current = 50
    setPlayerX(50)

    scoreRef.current = 0
    setScore(0)

    objectsRef.current = []
    setFallingObjects([])

    setScorePopups([])

    lastTimeRef.current = null
    elapsedRef.current = 0
    spawnAccumulatorRef.current = 0

    movementRef.current = null

    setTimeLeft(
      GAME_DURATION
    )

    setGameOver(false)
    setGameStarted(true)
  }

  return (
    <main className="brain-cell">

      {/* HEADER */}

      <div className="brain-cell-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Arcade
        </button>

        <div>
          <h1>🧠 Brain Cell</h1>

          <p>
            Catch what little remains.
          </p>
        </div>

      </div>

      {/* START SCREEN */}

      {!gameStarted &&
        !gameOver && (

          <div className="brain-start">

            <div className="brain-preview">
              🧠
            </div>

            <h2>
              Protect the brain cell!
            </h2>

            <p>
              Catch the good stuff.
              Avoid the questionable stuff.
            </p>

            <div className="brain-points">

              <h3>POINTS</h3>

              <div>
                <span>🧠 Brain</span>
                <strong>+10</strong>
              </div>

              <div>
                <span>☕ Coffee</span>
                <strong>+15</strong>
              </div>

              <div>
                <span>📱 Phone</span>
                <strong>-5</strong>
              </div>

              <div>
                <span>
                  🧟‍♀️ Dead Brain Cell
                </span>

                <strong>-10</strong>
              </div>

              <div>
                <span>📖 Book</span>
                <strong>-15</strong>
              </div>

            </div>

            <button
              onClick={startGame}
            >
              SAVE THE BRAIN 🧠
            </button>

          </div>
        )}

      {/* GAME OVER */}

      {!gameStarted &&
        gameOver && (

          <div className="brain-game-over">

            <div className="game-over-icon">
              🧠💀
            </div>

            <h2>
              BRAIN CELL DEPLETED!
            </h2>

            <p>
              Time's up.
            </p>

            <div className="final-score">

              <span>
                FINAL SCORE
              </span>

              <strong>
                {score}
              </strong>

            </div>

            <div className="final-high-score">

              <span>
                🏆 HIGH SCORE
              </span>

              <strong>
                {highScore}
              </strong>

            </div>

            {score >= highScore &&
              score > 0 && (
                <h3 className="new-high-score">
                  🎉 NEW HIGH SCORE! 🎉
                </h3>
              )}

            <button
              onClick={startGame}
            >
              PLAY AGAIN 🧠
            </button>

          </div>
        )}

      {/* GAME */}

      {gameStarted && (

        <div className="brain-game">

          <div className="brain-score-board">

            <span>
              🧠 SCORE: {score}
            </span>

            <span>
              🏆 HIGH SCORE: {highScore}
            </span>

            <span>
              ⏱️ {timeLeft}s
            </span>

          </div>

          <div className="brain-play-area">

            {fallingObjects.map(
              (object) => (
                <span
                  key={object.id}
                  className="falling-object"
                  style={{
                    left: `${object.x}%`,
                    top: `${object.y}%`,
                  }}
                >
                  {object.type}
                </span>
              )
            )}

            {/* SCORE POPUPS */}

            {scorePopups.map(
              (popup) => (
                <span
                  key={popup.id}
                  className={`score-popup ${
                    popup.points > 0
                      ? 'positive'
                      : 'negative'
                  }`}
                  style={{
                    left: `${popup.x}%`,
                    top: `${popup.y}%`,
                  }}
                >
                  {popup.points > 0
                    ? `+${popup.points}`
                    : popup.points}
                </span>
              )
            )}

            <div
              className="brain-player"
              style={{
                left: `${playerX}%`,
              }}
            >
              👧
            </div>

          </div>

          <div className="brain-controls">

            <button
              onPointerDown={() =>
                startMoving('left')
              }
              onPointerUp={
                stopMoving
              }
              onPointerCancel={
                stopMoving
              }
              onPointerLeave={
                stopMoving
              }
            >
              ◀
            </button>

            <button
              onPointerDown={() =>
                startMoving('right')
              }
              onPointerUp={
                stopMoving
              }
              onPointerCancel={
                stopMoving
              }
              onPointerLeave={
                stopMoving
              }
            >
              ▶
            </button>

          </div>

        </div>
      )}

    </main>
  )
}

export default BrainCell