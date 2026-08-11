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
  { x: 55, y: 30 },
  { x: 90, y: 30 },
  { x: 130, y: 30 },
  { x: 170, y: 30 },
  { x: 205, y: 30 },

  { x: 45, y: 55 },
  { x: 80, y: 55 },
  { x: 115, y: 55 },
  { x: 150, y: 55 },
  { x: 185, y: 55 },
  { x: 220, y: 55 },

  { x: 55, y: 80 },
  { x: 90, y: 80 },
  { x: 130, y: 80 },
  { x: 170, y: 80 },
  { x: 205, y: 80 },

  { x: 80, y: 105 },
  { x: 130, y: 105 },
  { x: 180, y: 105 },
]

function generateTarget(round = 1) {
  const positions = [
    ...DECORATION_POSITIONS,
  ]

  const decorationCount = Math.min(
    3 + Math.floor((round - 1) / 2),
    positions.length
  )

  const target = []

  for (
    let i = 0;
    i < decorationCount;
    i++
  ) {
    const positionIndex =
      Math.floor(
        Math.random() *
          positions.length
      )

    const position =
      positions.splice(
        positionIndex,
        1
      )[0]

    const type =
      DECORATIONS[
        Math.floor(
          Math.random() *
            DECORATIONS.length
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

  const [
    draggingDecoration,
    setDraggingDecoration,
  ] = useState(null)

  const [score, setScore] =
    useState(null)

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

  const [round, setRound] =
    useState(1)

  const [timeLeft, setTimeLeft] =
    useState(30)

  const [hasChecked, setHasChecked] =
    useState(false)

  /*
   * TIMER
   */

  useEffect(() => {
    if (
      !gameStarted ||
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
        (current) =>
          current - 1
      )
    }, 1000)

    return () =>
      clearTimeout(timer)
  }, [
    gameStarted,
    timeLeft,
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
      event.clientX -
      cake.left

    const y =
      event.clientY -
      cake.top

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
   * START
   */

  function startGame() {
    setRound(1)

    setTargetCake(
      generateTarget(1)
    )

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

    setRound(nextRound)

    setTargetCake(
      generateTarget(
        nextRound
      )
    )

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
   * CHECK
   */

  function checkCake() {
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
          (
            decoration,
            index
          ) => {
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

        decorationPoints +=
          50 /
          targetCake.length

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

    setHasChecked(true)

    setDraggingDecoration(null)

    setScore(
      finalCakeScore
    )

    setTotalScore(
      (currentTotal) => {
        const newTotal =
          currentTotal +
          finalCakeScore

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

      {/* BACKGROUND DECOR */}

      <div className="cake-confetti cake-confetti-one">
        ✦
      </div>

      <div className="cake-confetti cake-confetti-two">
        🍓
      </div>

      <div className="cake-confetti cake-confetti-three">
        ✿
      </div>

      {/* HEADER */}

      <header className="cake-disaster-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Arcade
        </button>

        <div className="cake-title">

          <span className="cake-title-icon">
            🍰
          </span>

          <div>
            <p className="cake-eyebrow">
              BIRTHDAY BAKERY
            </p>

            <h1>
              Cake Disaster
            </h1>

            <p>
              Make it pretty. Or don't.
              I'm not your mother.
            </p>
          </div>

        </div>

      </header>

      <div className="cake-game">

        {/* START */}

        {!gameStarted ? (

          <section className="cake-start">

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

            <p className="section-label">
              CAKE ORDER #001
            </p>

            <h2>
              Ready to bake?
            </h2>

            <p className="start-copy">
              A mysterious customer has
              requested a very specific cake.
              Recreate it before the timer
              runs out.
            </p>

            <div className="cake-rules">

              <div>
                <span>01</span>
                <p>
                  Copy the decorations
                </p>
              </div>

              <div>
                <span>02</span>
                <p>
                  Get their positions right
                </p>
              </div>

              <div>
                <span>03</span>
                <p>
                  Don't overdecorate
                </p>
              </div>

            </div>

            <button
              className="primary-cake-button"
              onClick={startGame}
            >
              LET'S CAKE
              <span>🍰</span>
            </button>

          </section>

        ) : (

          <section className="cake-board">

            {/* HUD */}

            <div className="cake-hud">

              <div className="cake-hud-item">

                <span>
                  ROUND
                </span>

                <strong>
                  {String(round).padStart(
                    2,
                    '0'
                  )}
                </strong>

              </div>

              <div className="cake-hud-item">

                <span>
                  RUN SCORE
                </span>

                <strong>
                  {totalScore}
                </strong>

              </div>

              <div
                className={`cake-hud-item ${
                  timeLeft <= 5
                    ? 'timer-danger'
                    : ''
                }`}
              >

                <span>
                  TIME
                </span>

                <strong>
                  ⏱ {timeLeft}s
                </strong>

              </div>

            </div>

            {/* TARGET + PLAYER */}

            <div className="cake-workspace">

              <div className="target-panel">

                <div className="panel-heading">

                  <div>
                    <span className="panel-kicker">
                      CUSTOMER ORDER
                    </span>

                    <h2>
                      MAKE THIS CAKE
                    </h2>
                  </div>

                  <span className="order-stamp">
                    COPY
                  </span>

                </div>

                <div className="target-cake">

                  <div className="target-cake-top" />

                  <div className="target-cake-body" />

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
                        {
                          decoration.type
                        }
                      </span>
                    )
                  )}

                </div>

                <p className="target-hint">
                  Match the decorations
                  and their positions.
                </p>

              </div>

              <div className="player-panel">

                <div className="panel-heading">

                  <div>
                    <span className="panel-kicker">
                      YOUR MASTERPIECE
                    </span>

                    <h2>
                      YOUR CAKE
                    </h2>
                  </div>

                  <span className="decor-count">
                    {decorations.length}
                    {' '}
                    DECOR
                  </span>

                </div>

                {/* TRAY */}

                <div className="decoration-station">

                  <div className="station-label">
                    DRAG TO DECORATE
                  </div>

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

                </div>

                {/* CAKE */}

                <div
                  className={`cake ${
                    hasChecked
                      ? 'cake-locked'
                      : ''
                  }`}
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
                        key={
                          decoration.id
                        }
                        className="placed-decoration"
                        style={{
                          left: `${decoration.x}px`,
                          top: `${decoration.y}px`,
                        }}
                      >
                        {
                          decoration.type
                        }
                      </span>
                    )
                  )}

                  <div className="cake-top">

                    <div className="frosting">
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>

                  <div className="cake-body">

                    <div className="cake-layer" />
                    <div className="cake-layer" />

                  </div>

                </div>

                <p className="drag-hint">
                  {hasChecked
                    ? 'Cake locked! 🍰'
                    : 'Drag your ingredients onto the cake'}
                </p>

                <button
                  className="check-cake-button"
                  onClick={checkCake}
                  disabled={hasChecked}
                >
                  {hasChecked
                    ? 'CAKE CHECKED ✓'
                    : 'CHECK MY CAKE'}
                </button>

              </div>

            </div>

            {/* RESULT */}

            {score !== null && (

              <div className="cake-result">

                <div className="result-left">

                  <span className="result-label">
                    INSPECTION COMPLETE
                  </span>

                  <h2>
                    CAKE SCORE
                  </h2>

                  <div className="big-cake-score">
                    {score}
                    <span>/100</span>
                  </div>

                </div>

                <div className="result-middle">

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
                      ? 'I mean, it looks like a cake. Barely.'
                      : score >= 20
                      ? 'GET A GRIP BRO!!'
                      : score >= 10
                      ? "You're doing this on purpose aren't you? 😬"
                      : score === 0
                      ? 'What the hell happened here? 💀'
                      : "It's like you won't even try. 😭"}
                  </p>

                  <div className="result-stats">

                    <span>
                      🏆 HIGH SCORE
                      <strong>
                        {highScore}
                      </strong>
                    </span>

                    <span>
                      ⭐ RUN SCORE
                      <strong>
                        {totalScore}
                      </strong>
                    </span>

                  </div>

                </div>

                <button
                  className="next-cake-button"
                  onClick={nextCake}
                >
                  NEXT CAKE
                  <span>→</span>
                </button>

              </div>

            )}

          </section>

        )}

      </div>

    </main>
  )
}

export default CakeDisaster