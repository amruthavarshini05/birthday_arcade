import { useState } from 'react'
import './CakeDisaster.css'

const DECORATIONS = [
  '🍓',
  '🫐',
  '🍫',
  '🕯️',
  '🌸',
  '🍒',
]

const TARGET_PATTERNS = [
  [
    { type: '🍓', x: 70, y: 45 },
    { type: '🌸', x: 130, y: 45 },
    { type: '🍓', x: 190, y: 45 },
  ],

  [
    { type: '🕯️', x: 80, y: 35 },
    { type: '🕯️', x: 130, y: 30 },
    { type: '🕯️', x: 180, y: 35 },
    { type: '🍓', x: 100, y: 80 },
    { type: '🍓', x: 160, y: 80 },
  ],

  [
    { type: '🍫', x: 65, y: 45 },
    { type: '🍓', x: 110, y: 70 },
    { type: '🌸', x: 150, y: 45 },
    { type: '🍓', x: 190, y: 70 },
    { type: '🍫', x: 235, y: 45 },
  ],

  [
    { type: '🍒', x: 75, y: 40 },
    { type: '🌸', x: 130, y: 70 },
    { type: '🍒', x: 185, y: 40 },
    { type: '🕯️', x: 110, y: 30 },
    { type: '🕯️', x: 160, y: 30 },
  ],
]

function CakeDisaster({ onBack }) {
  const [gameStarted, setGameStarted] = useState(false)
  const [targetCake, setTargetCake] = useState(null)

  const [decorations, setDecorations] = useState([])
  const [draggingDecoration, setDraggingDecoration] = useState(null)

  const [score, setScore] = useState(null)

  function startDragging(type) {
    setDraggingDecoration({
      type,
      x: 0,
      y: 0,
    })
  }

  function moveDragging(event) {
    if (!draggingDecoration) return

    const cake = event.currentTarget.getBoundingClientRect()

    setDraggingDecoration((current) => ({
      ...current,
      x: event.clientX - cake.left,
      y: event.clientY - cake.top,
    }))
  }

  function placeDecoration(event) {
    if (!draggingDecoration) return

    const cake = event.currentTarget.getBoundingClientRect()

    const x = event.clientX - cake.left
    const y = event.clientY - cake.top

    setDecorations((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        type: draggingDecoration.type,
        x,
        y,
      },
    ])

    setDraggingDecoration(null)
  }

  function startGame() {
    const randomPattern =
      TARGET_PATTERNS[
        Math.floor(Math.random() * TARGET_PATTERNS.length)
      ]

    setTargetCake(randomPattern)
    setDecorations([])
    setScore(null)
    setGameStarted(true)
  }

  function checkCake() {
    if (!targetCake) return

    let newScore = 0

    const targetCounts = {}
    const playerCounts = {}

    targetCake.forEach((decoration) => {
      targetCounts[decoration.type] =
        (targetCounts[decoration.type] || 0) + 1
    })

    decorations.forEach((decoration) => {
      playerCounts[decoration.type] =
        (playerCounts[decoration.type] || 0) + 1
    })

    // Correct decorations: 10 points each
    Object.entries(targetCounts).forEach(
      ([type, count]) => {
        const playerCount = playerCounts[type] || 0

        newScore += Math.min(playerCount, count) * 10
      }
    )

    // Penalty for unnecessary decorations
    const extraDecorations =
      Math.max(0, decorations.length - targetCake.length)

    newScore -= extraDecorations * 5

    newScore = Math.max(
      0,
      Math.min(100, newScore)
    )

    setScore(newScore)
  }

  return (
    <main className="cake-disaster">

      <div className="cake-disaster-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Arcade
        </button>

        <div>
          <h1>🍰 Cake Disaster</h1>

          <p>
            Let's make a cake. What could possibly go wrong?
          </p>
        </div>

      </div>

      <div className="cake-game">

        {!gameStarted ? (

          <div className="cake-start">

            <div className="cake-preview">
              🎂
            </div>

            <h2>Ready to bake?</h2>

            <p>
              Recreate the target cake as closely as you can.
            </p>

            <button onClick={startGame}>
              LET'S CAKE 🎂
            </button>

          </div>

        ) : (

          <div className="cake-board">

            {/* TARGET CAKE */}

            <h2>MAKE THIS CAKE</h2>

            <div className="target-cake">

              {targetCake?.map(
                (decoration, index) => (
                  <span
                    key={index}
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

            <h2>YOUR CAKE</h2>

            {/* DECORATION TRAY */}

            <div className="decoration-tray">

              {DECORATIONS.map(
                (decoration) => (
                  <button
                    key={decoration}
                    onPointerDown={() =>
                      startDragging(decoration)
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
              onPointerMove={moveDragging}
              onPointerUp={placeDecoration}
            >

              {draggingDecoration && (
                <span
                  className="dragging-decoration"
                  style={{
                    left: `${draggingDecoration.x}px`,
                    top: `${draggingDecoration.y}px`,
                  }}
                >
                  {draggingDecoration.type}
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
              Drag decorations onto your cake!
            </p>

            {/* CHECK BUTTON */}

            <button
              className="check-cake-button"
              onClick={checkCake}
            >
              CHECK CAKE 🎂
            </button>

            {/* SCORE */}

            {score !== null && (
              <div className="cake-score">
                <h2>
                  CAKE SCORE: {score}/100
                </h2>

                <p>
                  {score === 100
                    ? 'PERFECT CAKE. 👑'
                    : score >= 70
                    ? 'Okayyyy pastry chef. 😌'
                    : score >= 40
                    ? 'Questionable... but edible. 🤨'
                    : 'What the hell happened here? 💀'}
                </p>

                <button onClick={startGame}>
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