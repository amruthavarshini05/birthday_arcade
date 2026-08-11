import {
  useEffect,
  useRef,
  useState,
} from 'react'

import './BrainCell.css'

const FALLING_OBJECTS = [
  {
    type: '🧠',
    points: 10,
    good: true,
  },
  {
    type: '☕',
    points: 15,
    good: true,
  },
  {
    type: '📱',
    points: -5,
    good: false,
  },
  {
    type: '🧟‍♀️',
    points: -10,
    good: false,
  },
  {
    type: '📖',
    points: -15,
    good: false,
  },
]

const GAME_DURATION = 60

function BrainCell({ onBack }) {
  const [
    gameStarted,
    setGameStarted,
  ] = useState(false)

  const [gameOver, setGameOver] =
    useState(false)

  const [playerX, setPlayerX] =
    useState(50)

  const [
    fallingObjects,
    setFallingObjects,
  ] = useState([])

  const [score, setScore] =
    useState(0)

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(GAME_DURATION)

  const [
    scorePopups,
    setScorePopups,
  ] = useState([])

  const [
    highScore,
    setHighScore,
  ] = useState(() => {
    const saved =
      localStorage.getItem(
        'brainCellHighScore'
      )

    return saved
      ? Number(saved)
      : 0
  })

  const playerXRef =
    useRef(50)

  const scoreRef =
    useRef(0)

  const highScoreRef =
    useRef(highScore)

  const objectsRef =
    useRef([])

  const movementRef =
    useRef(null)

  const lastTimeRef =
    useRef(null)

  const elapsedRef =
    useRef(0)

  const spawnAccumulatorRef =
    useRef(0)

  useEffect(() => {
    highScoreRef.current =
      highScore
  }, [highScore])

  /*
   * KEYBOARD
   */

  useEffect(() => {
    if (!gameStarted) return

    function handleKeyDown(event) {
      if (
        event.key ===
          'ArrowLeft' ||
        event.key.toLowerCase() ===
          'a'
      ) {
        movementRef.current =
          'left'
      }

      if (
        event.key ===
          'ArrowRight' ||
        event.key.toLowerCase() ===
          'd'
      ) {
        movementRef.current =
          'right'
      }
    }

    function handleKeyUp(event) {
      if (
        event.key ===
          'ArrowLeft' ||
        event.key.toLowerCase() ===
          'a'
      ) {
        if (
          movementRef.current ===
          'left'
        ) {
          movementRef.current =
            null
        }
      }

      if (
        event.key ===
          'ArrowRight' ||
        event.key.toLowerCase() ===
          'd'
      ) {
        if (
          movementRef.current ===
          'right'
        ) {
          movementRef.current =
            null
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
   * GAME LOOP
   */

  useEffect(() => {
    if (!gameStarted) return

    lastTimeRef.current =
      performance.now()

    elapsedRef.current = 0

    spawnAccumulatorRef.current =
      0

    const gameLoop = (
      currentTime
    ) => {
      if (
        !lastTimeRef.current
      ) {
        lastTimeRef.current =
          currentTime
      }

      const delta =
        currentTime -
        lastTimeRef.current

      lastTimeRef.current =
        currentTime

      elapsedRef.current +=
        delta

      const elapsedSeconds =
        elapsedRef.current /
        1000

      /*
       * TIMER
       */

      const remaining =
        Math.max(
          0,
          Math.ceil(
            GAME_DURATION -
              elapsedSeconds
          )
        )

      setTimeLeft(
        remaining
      )

      /*
       * GAME OVER
       */

      if (
        elapsedSeconds >=
        GAME_DURATION
      ) {
        setGameStarted(false)
        setGameOver(true)

        setFallingObjects([])

        objectsRef.current = []

        movementRef.current =
          null

        return
      }

      /*
       * DIFFICULTY
       */

      let spawnRate = 1200
      let fallSpeed = 1.5

      if (
        elapsedSeconds >= 15
      ) {
        spawnRate = 1000
        fallSpeed = 2
      }

      if (
        elapsedSeconds >= 30
      ) {
        spawnRate = 800
        fallSpeed = 2.5
      }

      if (
        elapsedSeconds >= 45
      ) {
        spawnRate = 600
        fallSpeed = 3
      }

      /*
       * MOVEMENT
       *
       * This is now part of the
       * same animation loop.
       */

      if (
        movementRef.current
      ) {
        const movementAmount =
          0.38 *
          (delta / 16.67)

        let nextX =
          playerXRef.current

        if (
          movementRef.current ===
          'left'
        ) {
          nextX = Math.max(
            8,
            nextX -
              movementAmount
          )
        }

        if (
          movementRef.current ===
          'right'
        ) {
          nextX = Math.min(
            92,
            nextX +
              movementAmount
          )
        }

        playerXRef.current =
          nextX

        setPlayerX(nextX)
      }

      /*
       * SPAWN
       */

      spawnAccumulatorRef.current +=
        delta

      if (
        spawnAccumulatorRef.current >=
        spawnRate
      ) {
        spawnAccumulatorRef.current =
          0

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

          type:
            object.type,

          points:
            object.points,

          good:
            object.good,

          x:
            Math.random() *
              84 +
            8,

          y: -5,
        })
      }

      /*
       * MOVE + CATCH
       */

      const nextObjects = []

      objectsRef.current.forEach(
        (object) => {
          const nextY =
            object.y +
            fallSpeed *
              (delta / 50)

          if (
            nextY >= 88 &&
            nextY <= 96
          ) {
            const distance =
              Math.abs(
                object.x -
                  playerXRef.current
              )

            if (
              distance <= 8
            ) {
              scoreRef.current +=
                object.points

              setScore(
                scoreRef.current
              )

              /*
               * POPUP
               */

              const popup = {
                id:
                  Date.now() +
                  Math.random(),

                x: object.x,

                y: nextY,

                points:
                  object.points,

                good:
                  object.good,
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

      movementRef.current =
        null
    }
  }, [gameStarted])

  /*
   * MOBILE CONTROLS
   */

  function startMoving(
    direction
  ) {
    movementRef.current =
      direction
  }

  function stopMoving() {
    movementRef.current =
      null
  }

  /*
   * START
   */

  function startGame() {
    playerXRef.current = 50
    setPlayerX(50)

    scoreRef.current = 0
    setScore(0)

    objectsRef.current = []
    setFallingObjects([])

    setScorePopups([])

    elapsedRef.current = 0

    spawnAccumulatorRef.current =
      0

    lastTimeRef.current =
      null

    movementRef.current =
      null

    setTimeLeft(
      GAME_DURATION
    )

    setGameOver(false)

    setGameStarted(true)
  }

  return (
    <main className="brain-cell">

      {/* DECOR */}

      <div className="brain-bg brain-bg-one">
        ✦
      </div>

      <div className="brain-bg brain-bg-two">
        ⚡
      </div>

      <div className="brain-bg brain-bg-three">
        +
      </div>

      {/* HEADER */}

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
              COGNITIVE SURVIVAL
            </p>

            <h1>
              Brain Cell
            </h1>

            <p>
              There is one left.
              Please don't lose it.
            </p>
          </div>

        </div>

      </header>

      {/* START */}

      {!gameStarted &&
        !gameOver && (

        <section className="brain-start">

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

          <p className="brain-label">
            EMERGENCY PROTOCOL
          </p>

          <h2>
            SAVE THE LAST BRAIN CELL
          </h2>

          <p className="brain-intro">
            Good things fall from the sky.
            Bad things also fall from the sky.
            Unfortunately, nobody labelled them.
          </p>

          <div className="brain-points">

            <div className="points-title">
              <span>
                WHAT TO CATCH
              </span>

              <span>
                POINTS
              </span>
            </div>

            <div className="point-row good">
              <span>
                🧠 Brain
              </span>

              <strong>
                +10
              </strong>
            </div>

            <div className="point-row good">
              <span>
                ☕ Coffee
              </span>

              <strong>
                +15
              </strong>
            </div>

            <div className="point-row bad">
              <span>
                📱 Phone
              </span>

              <strong>
                −5
              </strong>
            </div>

            <div className="point-row bad">
              <span>
                🧟‍♀️ Dead Brain Cell
              </span>

              <strong>
                −10
              </strong>
            </div>

            <div className="point-row bad">
              <span>
                📖 Book
              </span>

              <strong>
                −15
              </strong>
            </div>

          </div>

          <div className="brain-start-stats">

            <span>
              ⏱ 60 SECONDS
            </span>

            <span>
              🏆 HIGH SCORE {highScore}
            </span>

          </div>

          <button
            className="brain-start-button"
            onClick={startGame}
          >
            SAVE THE BRAIN
            <span>🧠</span>
          </button>

        </section>
      )}

      {/* GAME OVER */}

      {!gameStarted &&
        gameOver && (

        <section className="brain-game-over">

          <div className="brain-dead">
            🧠💥
          </div>

          <p className="brain-label">
            SYSTEM FAILURE
          </p>

          <h2>
            BRAIN CELL DEPLETED
          </h2>

          <p>
            Sixty seconds of questionable
            decision-making have passed.
          </p>

          <div className="final-score-card">

            <div>
              <span>
                FINAL SCORE
              </span>

              <strong>
                {score}
              </strong>
            </div>

            <div>
              <span>
                🏆 HIGH SCORE
              </span>

              <strong>
                {highScore}
              </strong>
            </div>

          </div>

          {score >= highScore &&
            score > 0 && (
              <div className="new-high-score">
                🎉 NEW HIGH SCORE 🎉
              </div>
            )}

          <button
            className="brain-start-button"
            onClick={startGame}
          >
            TRY AGAIN
            <span>🧠</span>
          </button>

        </section>
      )}

      {/* GAME */}

      {gameStarted && (

        <section className="brain-game">

          <div className="brain-hud">

            <div className="brain-hud-score">

              <span>
                SCORE
              </span>

              <strong>
                {score}
              </strong>

            </div>

            <div className="brain-hud-center">

              <span>
                TIME
              </span>

              <strong
                className={
                  timeLeft <= 10
                    ? 'time-warning'
                    : ''
                }
              >
                {timeLeft}
              </strong>

            </div>

            <div className="brain-hud-high">

              <span>
                HIGH SCORE
              </span>

              <strong>
                {highScore}
              </strong>

            </div>

          </div>

          <div className="brain-game-shell">

            <div className="brain-game-label">
              <span>
                CATCH THE GOOD STUFF
              </span>

              <span>
                AVOID THE REST
              </span>
            </div>

            <div className="brain-play-area">

              <div className="brain-grid" />

              {fallingObjects.map(
                (object) => (
                  <span
                    key={object.id}
                    className={`falling-object ${
                      object.good
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

              {scorePopups.map(
                (popup) => (
                  <span
                    key={popup.id}
                    className={`score-popup ${
                      popup.good
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
                <span>
                  👧
                </span>

                <div className="player-glow" />
              </div>

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
              ←
            </button>

            <div className="control-hint">
              HOLD TO MOVE
            </div>

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
              →
            </button>

          </div>

        </section>
      )}

    </main>
  )
}

export default BrainCell