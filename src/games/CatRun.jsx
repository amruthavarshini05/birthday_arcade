import { useEffect, useRef, useState } from 'react'
import './CatRun.css'

import catRun1 from '../assets/cat-run/cat_run_1.png'
import catRun2 from '../assets/cat-run/cat_run_2.png'
import catRun3 from '../assets/cat-run/cat_run_3.png'

import cactusTall from '../assets/cat-run/cactus_tall.png'
import cactusRound from '../assets/cat-run/cactus_round.png'
import cactusSide from '../assets/cat-run/cactus_side.png'

import backgroundScene from '../assets/cat-run/background_bottom.png'

import birdFly1 from '../assets/cat-run/bird_fly_1.png'
import birdFly2 from '../assets/cat-run/bird_fly_2.png'

const GAME_WIDTH = 900
const GAME_HEIGHT = 320
const GROUND_Y = 260

const CAT_RUN_FRAMES = [
  catRun1,
  catRun2,
  catRun3,
]

const CACTUS_VARIANTS = [
  cactusTall,
  cactusRound,
  cactusSide,
]

const BIRD_FRAMES = [
  birdFly1,
  birdFly2,
]

/*
 * PRELOAD IMAGES
 */

const CAT_IMAGES = CAT_RUN_FRAMES.map(
  (src) => {
    const image = new Image()
    image.src = src
    return image
  }
)

const CACTUS_IMAGES = CACTUS_VARIANTS.map(
  (src) => {
    const image = new Image()
    image.src = src
    return image
  }
)

const BIRD_IMAGES = BIRD_FRAMES.map(
  (src) => {
    const image = new Image()
    image.src = src
    return image
  }
)

const BACKGROUND_IMAGE = new Image()
BACKGROUND_IMAGE.src = backgroundScene

function CatRun({ onBack }) {
  const canvasRef = useRef(null)

  const [gameState, setGameState] =
    useState('ready')

  const [score, setScore] =
    useState(0)

  const [highScore, setHighScore] =
    useState(() => {
      return (
        Number(
          localStorage.getItem(
            'catRunHighScore'
          )
        ) || 0
      )
    })

  const gameRef = useRef({
    cat: {
      x: 100,
      y: GROUND_Y - 50,
      width: 45,
      height: 50,
      velocityY: 0,
      jumping: false,
    },

    obstacles: [],

    speed: 6,

    score: 0,

    frame: 0,

    nextObstacleFrame: 100,

    gameOver: false,
  })

  const gameStateRef =
    useRef('ready')

  useEffect(() => {
    gameStateRef.current =
      gameState
  }, [gameState])

  useEffect(() => {
    const canvas =
      canvasRef.current

    if (!canvas) return

    const ctx =
      canvas.getContext('2d')

    let animationId

    const game =
      gameRef.current

    /*
     * RESET
     */

    function resetGame() {
      game.cat = {
        x: 100,
        y: GROUND_Y - 50,
        width: 45,
        height: 50,
        velocityY: 0,
        jumping: false,
      }

      game.obstacles = []

      game.speed = 6

      game.score = 0

      game.frame = 0

      game.nextObstacleFrame = 100

      game.gameOver = false

      setScore(0)
    }

    /*
     * JUMP
     */

    function jump() {
      if (
        !game.cat.jumping &&
        !game.gameOver
      ) {
        game.cat.velocityY = -15

        game.cat.jumping = true
      }
    }

    /*
     * CREATE OBSTACLE
     */

    function createObstacle(
      type = 'cactus'
    ) {
      if (type === 'bird') {
        game.obstacles.push({
          type: 'bird',
          x: GAME_WIDTH,
          y: GROUND_Y - 105,
          width: 45,
          height: 35,
        })

        return
      }

      const cactusVariant =
        Math.floor(
          Math.random() *
            CACTUS_VARIANTS.length
        )

      game.obstacles.push({
        type: 'cactus',
        x: GAME_WIDTH,
        y: GROUND_Y - 60,
        width: 45,
        height: 60,
        variant: cactusVariant,
      })
    }

    /*
     * COLLISION
     */

    function checkCollision(
      cat,
      obstacle
    ) {
      const catPaddingX = 10
      const catPaddingY = 8

      const obstaclePaddingX = 6

      return (
        cat.x + catPaddingX <
          obstacle.x +
            obstacle.width -
            obstaclePaddingX &&
        cat.x +
          cat.width -
          catPaddingX >
          obstacle.x +
            obstaclePaddingX &&
        cat.y + catPaddingY <
          obstacle.y +
            obstacle.height &&
        cat.y +
          cat.height -
          catPaddingY >
          obstacle.y
      )
    }

    /*
     * DRAW CAT
     */

    function drawCat() {
      const frameIndex =
        Math.floor(
          game.frame / 8
        ) %
        CAT_IMAGES.length

      const catImage =
        CAT_IMAGES[frameIndex]

      if (!catImage.complete) {
        return
      }

      ctx.drawImage(
        catImage,
        game.cat.x - 8,
        game.cat.y,
        65,
        50
      )
    }

    /*
     * DRAW OBSTACLE
     */

    function drawObstacle(
      obstacle
    ) {
      if (
        obstacle.type ===
        'bird'
      ) {
        const birdFrame =
          Math.floor(
            game.frame / 8
          ) %
          BIRD_IMAGES.length

        const birdImage =
          BIRD_IMAGES[birdFrame]

        if (!birdImage.complete) {
          return
        }

        ctx.drawImage(
          birdImage,
          obstacle.x - 8,
          obstacle.y - 5,
          58,
          45
        )

        return
      }

      const cactusImage =
        CACTUS_IMAGES[
          obstacle.variant ?? 0
        ]

      if (!cactusImage.complete) {
        return
      }

      ctx.drawImage(
        cactusImage,
        obstacle.x - 5,
        obstacle.y,
        55,
        70
      )
    }

    /*
     * BACKGROUND
     */

    function drawBackground() {
      if (
        !BACKGROUND_IMAGE.complete
      ) {
        return
      }

      ctx.imageSmoothingEnabled =
        false

      ctx.drawImage(
        BACKGROUND_IMAGE,
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
      )
    }

    /*
     * GROUND LINE
     */

    function drawGround() {
      ctx.beginPath()

      ctx.moveTo(
        0,
        GROUND_Y
      )

      ctx.lineTo(
        GAME_WIDTH,
        GROUND_Y
      )

      ctx.strokeStyle =
        '#252525'

      ctx.lineWidth = 3

      ctx.stroke()
    }

    /*
     * GAME UPDATE
     */

    function update() {
      if (game.gameOver) {
        return
      }

      game.frame++

      /*
       * GRAVITY
       */

      game.cat.velocityY +=
        0.8

      game.cat.y +=
        game.cat.velocityY

      if (
        game.cat.y >=
        GROUND_Y -
          game.cat.height
      ) {
        game.cat.y =
          GROUND_Y -
          game.cat.height

        game.cat.velocityY = 0

        game.cat.jumping =
          false
      }

      /*
       * OBSTACLE GENERATION
       */

      if (
        game.frame >=
        game.nextObstacleFrame
      ) {
        const random =
          Math.random()

        /*
         * NORMAL CACTUS
         */

        if (random < 0.65) {
          createObstacle(
            'cactus'
          )
        }

        /*
         * BIRD
         */

        else if (
          random < 0.9
        ) {
          createObstacle(
            'bird'
          )
        }

        /*
         * DOUBLE CACTUS
         */

        else {
          createObstacle(
            'cactus'
          )

          const secondVariant =
            Math.floor(
              Math.random() *
                CACTUS_VARIANTS.length
            )

          game.obstacles.push({
            type: 'cactus',
            x:
              GAME_WIDTH + 42,
            y:
              GROUND_Y - 60,
            width: 45,
            height: 60,
            variant:
              secondVariant,
          })
        }

        /*
         * GAP BETWEEN OBSTACLES
         */

        const minimumGap =
          Math.max(
            70,
            100 -
              game.speed * 3
          )

        const maximumGap =
          Math.max(
            150,
            230 -
              game.speed * 4
          )

        const randomGap =
          Math.floor(
            Math.random() *
              (maximumGap -
                minimumGap +
                1)
          ) +
          minimumGap

        game.nextObstacleFrame =
          game.frame +
          randomGap
      }

      /*
       * MOVE OBSTACLES
       */

      game.obstacles.forEach(
        (obstacle) => {
          obstacle.x -=
            game.speed
        }
      )

      /*
       * REMOVE OFF-SCREEN
       */

      game.obstacles =
        game.obstacles.filter(
          (obstacle) =>
            obstacle.x +
              obstacle.width >
            0
        )

      /*
       * COLLISION
       */

      for (
        const obstacle of
        game.obstacles
      ) {
        if (
          checkCollision(
            game.cat,
            obstacle
          )
        ) {
          game.gameOver = true

          setGameState(
            'gameover'
          )

          const finalScore =
            Math.floor(
              game.score
            )

          if (
            finalScore >
            highScore
          ) {
            localStorage.setItem(
              'catRunHighScore',
              finalScore
            )

            setHighScore(
              finalScore
            )
          }

          return
        }
      }

      /*
       * SCORE
       */

      game.score +=
        0.1

      setScore(
        Math.floor(
          game.score
        )
      )

      /*
       * SPEED
       */

      game.speed =
        Math.min(
          14,
          6 +
            game.score /
              120
        )
    }

    /*
     * DRAW
     */

    function draw() {
      ctx.clearRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
      )

      drawBackground()

      drawCat()

      game.obstacles.forEach(
        drawObstacle
      )

      /*
       * START MESSAGE
       */

      if (
        gameStateRef.current ===
        'ready'
      ) {
        ctx.font =
          'bold 24px Arial'

        ctx.textAlign =
          'center'

        ctx.fillStyle =
          '#252525'

        ctx.fillText(
          'PRESS SPACE OR TAP TO JUMP',
          GAME_WIDTH / 2,
          100
        )

        ctx.textAlign =
          'left'
      }
    }

    /*
     * LOOP
     */

    function loop() {
      update()

      draw()

      animationId =
        requestAnimationFrame(
          loop
        )
    }

    /*
     * INPUT
     */

    function startPlaying() {
      if (
        gameStateRef.current ===
        'ready'
      ) {
        resetGame()

        setGameState(
          'playing'
        )

        gameStateRef.current =
          'playing'
      }

      jump()
    }

    function handleKeyDown(
      event
    ) {
      if (
        event.code ===
        'Space'
      ) {
        event.preventDefault()

        if (
          gameStateRef.current ===
          'gameover'
        ) {
          setGameState(
            'ready'
          )

          gameStateRef.current =
            'ready'

          return
        }

        startPlaying()
      }

      if (
        event.code ===
        'ArrowUp'
      ) {
        event.preventDefault()

        startPlaying()
      }
    }

    function handlePointerDown(
      event
    ) {
      event.preventDefault()

      if (
        gameStateRef.current ===
        'gameover'
      ) {
        return
      }

      startPlaying()
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    canvas.addEventListener(
      'pointerdown',
      handlePointerDown
    )

    loop()

    return () => {
      cancelAnimationFrame(
        animationId
      )

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )

      canvas.removeEventListener(
        'pointerdown',
        handlePointerDown
      )
    }
  }, [gameState, highScore])

  /*
   * RESTART
   */

  function restart() {
    setGameState(
      'ready'
    )
  }

  return (
    <main className="cat-run">

      {/* MOBILE LANDSCAPE WARNING */}

      <div className="landscape-warning">

        <div className="landscape-warning-card">

          <div className="rotate-icon">
            📱↪️
          </div>

          <h2>
            TURN YOUR PHONE SIDEWAYS
          </h2>

          <p>
            Cat Run is best played in
            landscape mode.
          </p>

          <span>
            🔄 Rotate your phone
          </span>

        </div>

      </div>

      {/* HEADER */}

      <div className="cat-run-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Arcade
        </button>

        <div className="cat-title">

          <div className="cat-title-icon">
            🐈
          </div>

          <div>
            <p className="eyebrow">
              BIRTHDAY ARCADE
            </p>

            <h1>
              CAT RUN
            </h1>

            <p>
              Don't let the cat hit
              the cactus.
            </p>
          </div>

        </div>

      </div>

      {/* GAME INFO */}

      <div className="game-info">

        <div className="info-card">

          <span>
            SCORE
          </span>

          <strong>
            {score}
          </strong>

        </div>

        <div className="info-card">

          <span>
            HIGH SCORE
          </span>

          <strong>
            🏆 {highScore}
          </strong>

        </div>

        <div className="info-card controls-card">

          <span>
            CONTROLS
          </span>

          <strong>
            SPACE / TAP
          </strong>

        </div>

      </div>

      {/* GAME */}

      <div className="game-container">

        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
        />

        {/* GAME OVER */}

        {gameState ===
          'gameover' && (

          <div className="game-over">

            <div className="game-over-emoji">
              💥🐈
            </div>

            <p className="game-over-label">
              GAME OVER
            </p>

            <h2>
              BONK.
            </h2>

            <p>
              The cat has met the cactus.
            </p>

            <div className="game-over-stats">

              <div>
                <span>
                  SCORE
                </span>

                <strong>
                  {score}
                </strong>
              </div>

              <div>
                <span>
                  HIGH SCORE
                </span>

                <strong>
                  {highScore}
                </strong>
              </div>

            </div>

            <button
              onClick={restart}
            >
              TRY AGAIN 🐈
            </button>

          </div>
        )}

      </div>

      {/* INSTRUCTIONS */}

      <div className="cat-instructions">

        <div>
          <span>
            🐈
          </span>

          <p>
            <strong>
              TAP / SPACE
            </strong>
            <br />
            Jump over obstacles
          </p>
        </div>

        <div>
          <span>
            🌵
          </span>

          <p>
            <strong>
              CACTUS
            </strong>
            <br />
            Don't touch it
          </p>
        </div>

        <div>
          <span>
            🐦
          </span>

          <p>
            <strong>
              BIRD
            </strong>
            <br />
            Yep. That's also bad.
          </p>
        </div>

      </div>

    </main>
  )
}

export default CatRun