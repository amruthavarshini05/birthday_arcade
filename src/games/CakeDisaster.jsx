import { useEffect, useState } from 'react'
import './CakeDisaster.css'

const DECORATIONS = [
  '🍓',
  '🫐',
  '🍫',
  '🕯️',
  '🌸',
  '🍒',
]

const DECORATION_POSITIONS = [
  // Top row
  { x: 55, y: 30 },
  { x: 90, y: 30 },
  { x: 130, y: 30 },
  { x: 170, y: 30 },
  { x: 205, y: 30 },

  // Middle row
  { x: 45, y: 55 },
  { x: 80, y: 55 },
  { x: 115, y: 55 },
  { x: 150, y: 55 },
  { x: 185, y: 55 },
  { x: 220, y: 55 },

  // Lower row
  { x: 55, y: 80 },
  { x: 90, y: 80 },
  { x: 130, y: 80 },
  { x: 170, y: 80 },
  { x: 205, y: 80 },

  // Bottom row
  { x: 80, y: 105 },
  { x: 130, y: 105 },
  { x: 180, y: 105 },
]

function generateTarget(round = 1) {
  const positions = [...DECORATION_POSITIONS]

  const decorationCount = Math.min(
    3 + Math.floor((round - 1) / 2),
    positions.length
  )

  const target = []

  for (let i = 0; i < decorationCount; i++) {
    const positionIndex = Math.floor(
      Math.random() * positions.length
    )

    const position = positions.splice(
      positionIndex,
      1
    )[0]

    const type =
      DECORATIONS[
        Math.floor(
          Math.random() * DECORATIONS.length
        )
      ]

    target.push({
      type,
      x: position.x,
      y: position.y,
    })
  }

  return target
}

function CakeDisaster({ onBack }) {
  const [gameStarted, setGameStarted] =
    useState(false)

  const [targetCake, setTargetCake] =
    useState(null)

  const [decorations, setDecorations] =
    useState([])

  const [draggingDecoration, setDraggingDecoration] =
    useState(null)

  const [score, setScore] = useState(null)

  const [totalScore, setTotalScore] =
    useState(0)

  const [highScore, setHighScore] =
    useState(() => {
      const savedScore =
        localStorage.getItem(
          'cakeDisasterHighScore'
        )

      return savedScore
        ? Number(savedScore)
        : 0
    })

  const [round, setRound] = useState(1)

  const [timeLeft, setTimeLeft] =
    useState(30)

  // NEW:
  // Prevent checking the same cake twice.
  const [hasChecked, setHasChecked] =
    useState(false)

  /*
   * TIMER
   */

  useEffect(() => {
    if (
      !gameStarted ||
      score !== null ||
      hasChecked
    ) {
      return
    }

    if (timeLeft <= 0) {
      checkCake()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(
        (current) => current - 1
      )
    }, 1000)

    return () =>
      clearTimeout(timer)
  }, [
    gameStarted,
    timeLeft,
    score,
    hasChecked,
  ])

  /*
   * DRAGGING
   */

  function startDragging(type) {
    if (hasChecked) return

    setDraggingDecoration({
      type,
      x: 0,
      y: 0,
    })
  }

  function moveDragging(event) {
    if (
      !draggingDecoration ||
      hasChecked
    ) {
      return
    }

    const cake =
      event.currentTarget.getBoundingClientRect()

    setDraggingDecoration(
      (current) => ({
        ...current,
        x:
          event.clientX -
          cake.left,
        y:
          event.clientY -
          cake.top,
      })
    )
  }

  function placeDecoration(event) {
    if (
      !draggingDecoration ||
      hasChecked
    ) {
      return
    }

    const cake =
      event.currentTarget.getBoundingClientRect()

    const x =
      event.clientX - cake.left

    const y =
      event.clientY - cake.top

    setDecorations(
      (current) => [
        ...current,
        {
          id:
            Date.now() +
            Math.random(),
          type:
            draggingDecoration.type,
          x,
          y,
        },
      ]
    )

    setDraggingDecoration(null)
  }

  /*
   * START GAME
   */

  function startGame() {
    const newTarget =
      generateTarget(1)

    setRound(1)
    setTargetCake(newTarget)
    setDecorations([])
    setScore(null)
    setTotalScore(0)
    setTimeLeft(30)
    setHasChecked(false)
    setDraggingDecoration(null)
    setGameStarted(true)
  }

  /*
   * NEXT CAKE
   */

  function nextCake() {
    const nextRound =
      round + 1

    const newTarget =
      generateTarget(nextRound)

    setRound(nextRound)
    setTargetCake(newTarget)
    setDecorations([])
    setScore(null)

    setTimeLeft(
      Math.max(
        10,
        30 - nextRound * 2
      )
    )

    setHasChecked(false)
    setDraggingDecoration(null)
  }

  /*
   * CHECK CAKE
   */

  function checkCake() {
    // IMPORTANT:
    // Don't allow the same cake to be
    // scored more than once.
    if (
      !targetCake ||
      hasChecked
    ) {
      return
    }

    let decorationPoints = 0
    let positionPoints = 0

    const usedDecorations =
      new Set()

    targetCake.forEach(
      (target) => {
        let closestDistance =
          Infinity

        let closestIndex = -1

        decorations.forEach(
          (decoration, index) => {
            if (
              usedDecorations.has(
                index
              )
            ) {
              return
            }

            if (
              decoration.type !==
              target.type
            ) {
              return
            }

            const dx =
              decoration.x -
              target.x

            const dy =
              decoration.y -
              target.y

            const distance =
              Math.sqrt(
                dx * dx +
                  dy * dy
              )

            if (
              distance <
              closestDistance
            ) {
              closestDistance =
                distance

              closestIndex =
                index
            }
          }
        )

        if (
          closestIndex === -1
        ) {
          return
        }

        usedDecorations.add(
          closestIndex
        )

        // Correct decoration
        decorationPoints +=
          50 /
          targetCake.length

        // Position accuracy
        if (
          closestDistance <= 15
        ) {
          positionPoints +=
            50 /
            targetCake.length
        } else if (
          closestDistance <= 30
        ) {
          positionPoints +=
            (50 /
              targetCake.length) *
            0.7
        } else if (
          closestDistance <= 50
        ) {
          positionPoints +=
            (50 /
              targetCake.length) *
            0.4
        }
      }
    )

    /*
     * EXTRA DECORATIONS
     */

    const extraDecorations =
      decorations.length -
      usedDecorations.size

    const penalty =
      Math.max(
        0,
        extraDecorations
      ) * 5

    const finalScore =
      Math.max(
        0,
        Math.round(
          decorationPoints +
            positionPoints -
            penalty
        )
      )

    const finalCakeScore =
      Math.min(
        100,
        finalScore
      )

    /*
     * MARK THIS CAKE AS CHECKED
     */

    setHasChecked(true)

    setDraggingDecoration(null)

    setScore(
      finalCakeScore
    )

    /*
     * UPDATE RUN SCORE
     */

    setTotalScore(
      (currentTotal) => {
        const newTotal =
          currentTotal +
          finalCakeScore

        /*
         * UPDATE HIGH SCORE
         */

        if (
          newTotal >
          highScore
        ) {
          setHighScore(
            newTotal
          )

          localStorage.setItem(
            'cakeDisasterHighScore',
            newTotal.toString()
          )
        }

        return newTotal
      }
    )
  }

  return (
    <main className="cake-disaster">

      {/* HEADER */}

      <div className="cake-disaster-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Arcade
        </button>

        <div>
          <h1>
            🍰 Cake Disaster
          </h1>

          <p>
            Let's make a cake. What could
            possibly go wrong?
          </p>
        </div>

      </div>

      <div className="cake-game">

        {/* START SCREEN */}

        {!gameStarted ? (

          <div className="cake-start">

            <div className="cake-preview">
              🎂
            </div>

            <h2>
              Ready to bake?
            </h2>

            <p>
              Recreate the target cake as
              closely as you can.
            </p>

            <button
              onClick={startGame}
            >
              LET'S CAKE 🎂
            </button>

          </div>

        ) : (

          <div className="cake-board">

            {/* ROUND */}

            <div className="cake-status">

              <span>
                ROUND {round}
              </span>

              <span
                className={
                  timeLeft <= 5
                    ? 'timer danger'
                    : 'timer'
                }
              >
                ⏱️ {timeLeft}s
              </span>

            </div>

            {/* TARGET */}

            <h2>
              MAKE THIS CAKE
            </h2>

            <div className="target-cake">

              <div className="target-cake-top"></div>

              <div className="target-cake-body"></div>

              {targetCake?.map(
                (
                  decoration,
                  index
                ) => (
                  <span
                    key={index}
                    className="target-decoration"
                    style={{
                      left: `${decoration.x}px`,
                      top: `${decoration.y}px`,
                    }}
                  >
                    {decoration.type}
                  </span>
                )
              )}

            </div>

            {/* PLAYER CAKE */}

            <h2>
              YOUR CAKE
            </h2>

            {/* DECORATION TRAY */}

            <div className="decoration-tray">

              {DECORATIONS.map(
                (decoration) => (
                  <button
                    key={decoration}
                    disabled={
                      hasChecked
                    }
                    onPointerDown={() =>
                      startDragging(
                        decoration
                      )
                    }
                  >
                    {decoration}
                  </button>
                )
              )}

            </div>

            {/* CAKE */}

            <div
              className="cake"
              onPointerMove={
                moveDragging
              }
              onPointerUp={
                placeDecoration
              }
            >

              {draggingDecoration && (
                <span
                  className="dragging-decoration"
                  style={{
                    left: `${draggingDecoration.x}px`,
                    top: `${draggingDecoration.y}px`,
                  }}
                >
                  {
                    draggingDecoration.type
                  }
                </span>
              )}

              {decorations.map(
                (decoration) => (
                  <span
                    key={decoration.id}
                    className="placed-decoration"
                    style={{
                      left: `${decoration.x}px`,
                      top: `${decoration.y}px`,
                    }}
                  >
                    {decoration.type}
                  </span>
                )
              )}

              <div className="cake-top">

                <div className="frosting">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

              <div className="cake-body">

                <div className="cake-layer"></div>

                <div className="cake-layer"></div>

              </div>

            </div>

            <p>
              {hasChecked
                ? 'Cake checked! Time for the next one. 🍰'
                : 'Drag decorations onto your cake!'}
            </p>

            {/* CHECK */}

            <button
              className="check-cake-button"
              onClick={checkCake}
              disabled={hasChecked}
            >
              {hasChecked
                ? 'CAKE CHECKED ✓'
                : 'CHECK CAKE 🎂'}
            </button>

            {/* SCORE */}

            {score !== null && (

              <div className="cake-score">

                <div className="score-board">

                  <span>
                    🏆 HIGH SCORE:{' '}
                    {highScore}
                  </span>

                  <span>
                    ⭐ RUN SCORE:{' '}
                    {totalScore}
                  </span>

                </div>

                <h2>
                  CAKE SCORE:{' '}
                  {score}/100
                </h2>

                <p>
                  {score === 100
                    ? 'PERFECT CAKE. 👑'
                    : score >= 90
                    ? 'Okayyyy pastry chef. 😌'
                    : score >= 80
                    ? 'Just Do It (Nike) 😎'
                    : score >= 70
                    ? 'Do you hate me?!'
                    : score >= 60
                    ? 'Uhhhh.... Ok?'
                    : score >= 50
                    ? 'Does my disappointment amuse you?'
                    : score >= 40
                    ? 'Questionable... but edible. 🤨'
                    : score >= 30
                    ? 'Okayyyy pastry chef. 😌'
                    : score >= 20
                    ? 'GET A GRIP BRO!!'
                    : score >= 10
                    ? "You're doing this on purpose aren't you? 😬"
                    : score === 0
                    ? 'What the hell happened here? 💀'
                    : "It's like you won't even try. 😭"}
                </p>

                <button
                  onClick={nextCake}
                >
                  NEXT CAKE 🍰
                </button>

              </div>

            )}

          </div>

        )}

      </div>

    </main>
  )
}

export default CakeDisaster