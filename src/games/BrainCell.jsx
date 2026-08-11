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
  const [gameStarted, setGameStarted] =
    useState(false)

  const [gameOver, setGameOver] =
    useState(false)

  const [fallingObjects, setFallingObjects] =
    useState([])

  const [score, setScore] =
    useState(0)

  const [timeLeft, setTimeLeft] =
    useState(GAME_DURATION)

  const [highScore, setHighScore] = useState(() => {
    const savedScore =
      localStorage.getItem(
        'brainCellHighScore'
      )

    return savedScore
      ? Number(savedScore)
      : 0
  })

  /* =====================================================
     REFS
     ===================================================== */

  const playerXRef = useRef(50)

  const playerRef = useRef(null)

  const scoreRef = useRef(0)

  const highScoreRef =
    useRef(highScore)

  const objectsRef = useRef([])

  const lastTimeRef =
    useRef(null)

  const elapsedRef =
    useRef(0)

  const spawnAccumulatorRef =
    useRef(0)

  const playAreaRef =
    useRef(null)

  const draggingRef =
    useRef(false)


  /* =====================================================
     KEEP HIGH SCORE REF IN SYNC
     ===================================================== */

  useEffect(() => {
    highScoreRef.current = highScore
  }, [highScore])


  /* =====================================================
     MOVE PLAYER
     ===================================================== */

  function movePlayer(amount) {
    const next = Math.max(
      7,
      Math.min(
        93,
        playerXRef.current + amount
      )
    )

    playerXRef.current = next

    if (playerRef.current) {
      playerRef.current.style.left =
        `${next}%`
    }
  }


  /* =====================================================
     KEYBOARD CONTROLS
     ===================================================== */

  useEffect(() => {
    if (!gameStarted) return

    function handleKeyDown(event) {
      if (
        event.key === 'ArrowLeft' ||
        event.key.toLowerCase() === 'a'
      ) {
        movePlayer(-4)
      }

      if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'd'
      ) {
        movePlayer(4)
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


  /* =====================================================
     TOUCH / MOUSE DRAGGING
     ===================================================== */

  function updatePlayerFromPointer(
    clientX
  ) {
    const playArea =
      playAreaRef.current

    if (!playArea) return

    const rect =
      playArea.getBoundingClientRect()

    const relativeX =
      clientX - rect.left

    const percentage =
      (relativeX / rect.width) * 100

    const next = Math.max(
      7,
      Math.min(
        93,
        percentage
      )
    )

    playerXRef.current = next

    /*
      Move the player directly.
      This avoids a React render
      on every finger movement.
    */

    if (playerRef.current) {
      playerRef.current.style.left =
        `${next}%`
    }
  }


  function handlePointerDown(event) {
    if (!gameStarted) return

    draggingRef.current = true

    event.currentTarget
      .setPointerCapture?.(
        event.pointerId
      )

    updatePlayerFromPointer(
      event.clientX
    )
  }


  function handlePointerMove(event) {
    if (
      !gameStarted ||
      !draggingRef.current
    ) {
      return
    }

    updatePlayerFromPointer(
      event.clientX
    )
  }


  function handlePointerUp(event) {
    draggingRef.current = false

    try {
      event.currentTarget
        .releasePointerCapture?.(
          event.pointerId
        )
    } catch {
      // Nothing to do.
    }
  }


  /* =====================================================
     MAIN GAME LOOP
     ===================================================== */

  useEffect(() => {
    if (!gameStarted) return

    lastTimeRef.current =
      performance.now()

    elapsedRef.current = 0

    spawnAccumulatorRef.current = 0

    let animationFrame


    const gameLoop = (
      currentTime
    ) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current =
          currentTime
      }

      const delta =
        currentTime -
        lastTimeRef.current

      lastTimeRef.current =
        currentTime

      elapsedRef.current += delta

      const elapsedSeconds =
        elapsedRef.current / 1000


      /* ================================================
         TIMER
         ================================================ */

      const remainingTime =
        Math.max(
          0,
          Math.ceil(
            GAME_DURATION -
            elapsedSeconds
          )
        )

      setTimeLeft(
        remainingTime
      )


      /* ================================================
         END GAME
         ================================================ */

      if (
        elapsedSeconds >=
        GAME_DURATION
      ) {
        setGameStarted(false)

        setGameOver(true)

        setFallingObjects([])

        objectsRef.current = []

        return
      }


      /* ================================================
         DIFFICULTY
         ================================================ */

      let spawnRate = 1000

      let fallSpeed = 1.8


      if (elapsedSeconds >= 15) {
        spawnRate = 850
        fallSpeed = 2.1
      }


      if (elapsedSeconds >= 30) {
        spawnRate = 700
        fallSpeed = 2.5
      }


      if (elapsedSeconds >= 45) {
        spawnRate = 550
        fallSpeed = 3
      }


      /* ================================================
         SPAWN
         ================================================ */

      spawnAccumulatorRef.current +=
        delta

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

          type:
            object.type,

          points:
            object.points,

          x:
            Math.random() * 84 + 8,

          y: -6,
        })
      }


      /* ================================================
         MOVE + CATCH
         ================================================ */

      const nextObjects = []

      objectsRef.current.forEach(
        (object) => {
          const nextY =
            object.y +
            fallSpeed *
            (delta / 50)


          /* ============================================
             CATCH ZONE
             ============================================ */

          if (
            nextY >= 86 &&
            nextY <= 96
          ) {
            const horizontalDistance =
              Math.abs(
                object.x -
                playerXRef.current
              )

            if (
              horizontalDistance <= 9
            ) {
              scoreRef.current +=
                object.points

              setScore(
                scoreRef.current
              )


              /* ========================================
                 HIGH SCORE
                 ======================================== */

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


          /* ============================================
             KEEP OBJECT
             ============================================ */

          if (nextY < 106) {
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
        [...nextObjects]
      )


      animationFrame =
        requestAnimationFrame(
          gameLoop
        )
    }


    animationFrame =
      requestAnimationFrame(
        gameLoop
      )


    return () => {
      cancelAnimationFrame(
        animationFrame
      )
    }
  }, [gameStarted])


  /* =====================================================
     START / RESTART GAME
     ===================================================== */

  function startGame() {
    playerXRef.current = 50

    if (playerRef.current) {
      playerRef.current.style.left =
        '50%'
    }

    scoreRef.current = 0

    setScore(0)

    objectsRef.current = []

    setFallingObjects([])

    elapsedRef.current = 0

    spawnAccumulatorRef.current = 0

    lastTimeRef.current = null

    draggingRef.current = false

    setTimeLeft(
      GAME_DURATION
    )

    setGameOver(false)

    setGameStarted(true)
  }


  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <main className="brain-cell">

      {/* BACKGROUND DECOR */}

      <div className="brain-bg-orb brain-bg-orb-one">
        🧠
      </div>

      <div className="brain-bg-orb brain-bg-orb-two">
        ✦
      </div>

      <div className="brain-bg-orb brain-bg-orb-three">
        ☕
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
              COGNITIVE DEPARTMENT
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

      {!gameStarted &&
      !gameOver ? (

        <section className="brain-start">

          <div className="brain-start-art">

            <span className="brain-start-main">
              🧠
            </span>

            <span className="brain-floating-coffee">
              ☕
            </span>

            <span className="brain-floating-star">
              ✦
            </span>

          </div>


          <p className="brain-section-label">
            COGNITIVE EMERGENCY
          </p>


          <h2>
            Protect the brain cell!
          </h2>


          <p className="brain-start-copy">
            Catch the good stuff.
            <br />
            Avoid the questionable stuff.
          </p>


          {/* POINTS */}

          <div className="brain-points">

            <div className="brain-points-header">

              <span>
                WHAT TO CATCH
              </span>

              <strong>
                POINTS
              </strong>

            </div>


            <div className="brain-point-row positive">

              <span>
                🧠 Brain
              </span>

              <strong>
                +10
              </strong>

            </div>


            <div className="brain-point-row positive">

              <span>
                ☕ Coffee
              </span>

              <strong>
                +15
              </strong>

            </div>


            <div className="brain-point-row negative">

              <span>
                📱 Phone
              </span>

              <strong>
                -5
              </strong>

            </div>


            <div className="brain-point-row negative">

              <span>
                🧟‍♀️ Dead Brain Cell
              </span>

              <strong>
                -10
              </strong>

            </div>


            <div className="brain-point-row negative">

              <span>
                📖 Book
              </span>

              <strong>
                -15
              </strong>

            </div>

          </div>


          {/* HOW TO PLAY */}

          <div className="brain-how-to-play">

            <span>
              🖱️
            </span>

            <p>
              Desktop: use
              <b> ← → </b>
              or
              <b> A / D</b>

              <br />

              📱 Phone: drag the
              <b> 👧 </b>
              across the screen
            </p>

          </div>


          <button
            className="brain-start-button"
            onClick={startGame}
          >
            SAVE THE BRAIN
            <span>🧠</span>
          </button>

        </section>


      ) : gameOver ? (

        /* =================================================
           GAME OVER
           ================================================= */

        <section className="brain-game-over">

          <div className="game-over-icon">
            🧠💀
          </div>


          <p className="brain-section-label">
            SYSTEM FAILURE
          </p>


          <h2>
            BRAIN CELL DEPLETED!
          </h2>


          <p className="game-over-copy">
            Time's up.
            <br />
            How much brainpower survived?
          </p>


          <div className="brain-final-stats">

            <div className="final-stat main-stat">

              <span>
                FINAL SCORE
              </span>

              <strong>
                {score}
              </strong>

            </div>


            <div className="final-stat">

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

            <h3 className="new-high-score">
              🎉 NEW HIGH SCORE! 🎉
            </h3>

          )}


          <button
            className="brain-restart-button"
            onClick={startGame}
          >
            PLAY AGAIN
            <span>🧠</span>
          </button>

        </section>


      ) : (

        /* =================================================
           GAME
           ================================================= */

        <section className="brain-game">

          {/* SCOREBOARD */}

          <div className="brain-score-board">

            <div className="brain-stat">

              <span>
                SCORE
              </span>

              <strong>
                {score}
              </strong>

            </div>


            <div className="brain-stat">

              <span>
                HIGH SCORE
              </span>

              <strong>
                {highScore}
              </strong>

            </div>


            <div
              className={`brain-stat brain-timer ${
                timeLeft <= 10
                  ? 'timer-danger'
                  : ''
              }`}
            >

              <span>
                TIME
              </span>

              <strong>
                {timeLeft}s
              </strong>

            </div>

          </div>


          {/* PLAY AREA */}

          <div
            ref={playAreaRef}
            className="brain-play-area"

            onPointerDown={
              handlePointerDown
            }

            onPointerMove={
              handlePointerMove
            }

            onPointerUp={
              handlePointerUp
            }

            onPointerCancel={
              handlePointerUp
            }
          >

            <div className="brain-play-label">
              DRAG TO MOVE
            </div>


            {/* FALLING OBJECTS */}

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
                    left:
                      `${object.x}%`,

                    top:
                      `${object.y}%`,
                  }}
                >
                  {object.type}
                </span>

              )
            )}


            {/* PLAYER */}

            <div
              ref={playerRef}
              className="brain-player"

              style={{
                left: '50%',
              }}
            >
              👧
            </div>


            {/* CATCH LINE */}

            <div
              className="brain-catch-line"
            />

          </div>


          <div className="brain-mobile-hint">
            <span>☝️</span>
            Drag anywhere to move
          </div>

        </section>

      )}

    </main>
  )
}

export default BrainCell