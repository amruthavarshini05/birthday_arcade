import { useEffect, useRef, useState } from 'react'
import './CatRun.css'

import catRun1 from '../assets/cat-run/cat_run_1.png'
import catRun2 from '../assets/cat-run/cat_run_2.png'
import catRun3 from '../assets/cat-run/cat_run_3.png'

import cactusTall from '../assets/cat-run/cactus_tall.png'
import cactusRound from '../assets/cat-run/cactus_round.png'
import cactusSide from '../assets/cat-run/cactus_side.png'

import backgroundScene from '../assets/cat-run/background_bottom.png'

const CACTUS_IMAGES = [
    new Image(),
    new Image(),
    new Image(),
  ]

CACTUS_IMAGES[0].src = cactusTall
CACTUS_IMAGES[1].src = cactusRound
CACTUS_IMAGES[2].src = cactusSide

import birdFly1 from '../assets/cat-run/bird_fly_1.png'
import birdFly2 from '../assets/cat-run/bird_fly_2.png'


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

  const BIRD_IMAGES = [
    new Image(),
    new Image(),
  ]
  
  BIRD_IMAGES[0].src = birdFly1
  BIRD_IMAGES[1].src = birdFly2

const BACKGROUND_IMAGE = new Image()
BACKGROUND_IMAGE.src = backgroundScene

const GAME_WIDTH = 900
const GAME_HEIGHT = 320
const GROUND_Y = 260

function CatRun({ onBack }) {
  const canvasRef = useRef(null)

  const [gameState, setGameState] = useState('ready')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('catRunHighScore')) || 0
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

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    let animationId

    const game = gameRef.current

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

    function jump() {
      if (!game.cat.jumping && !game.gameOver) {
        game.cat.velocityY = -15
        game.cat.jumping = true
      }
    }

    function createObstacle(type = 'cactus') {
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
        Math.floor(Math.random() * CACTUS_VARIANTS.length)

        game.obstacles.push({
        type: 'cactus',
        x: GAME_WIDTH,
        y: GROUND_Y - 60,
        width: 45,
        height: 60,
        variant: cactusVariant,
        })
      }

    function checkCollision(cat, obstacle) {
        const catPaddingX = 10
        const catPaddingY = 8
      
        const obstaclePaddingX = 6
      
        return (
          cat.x + catPaddingX <
            obstacle.x + obstacle.width - obstaclePaddingX &&
          cat.x + cat.width - catPaddingX >
            obstacle.x + obstaclePaddingX &&
          cat.y + catPaddingY <
            obstacle.y + obstacle.height &&
          cat.y + cat.height - catPaddingY >
            obstacle.y
        )
      }

      function drawCat() {
        const frameIndex =
          Math.floor(game.frame / 8) % CAT_RUN_FRAMES.length
      
        const catImage = new Image()
        catImage.src = CAT_RUN_FRAMES[frameIndex]
      
        ctx.drawImage(
          catImage,
          game.cat.x - 8,
          game.cat.y,
          65,
          50
        )
      }

      function drawObstacle(obstacle) {
        if (obstacle.type === 'bird') {
  const birdFrame =
    Math.floor(game.frame / 8) % BIRD_IMAGES.length

  const birdImage = BIRD_IMAGES[birdFrame]

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
          CACTUS_IMAGES[obstacle.variant ?? 0]
      
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

    function drawGround() {
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y)
      ctx.lineTo(GAME_WIDTH, GROUND_Y)
      ctx.strokeStyle = '#252525'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    function update() {
      if (game.gameOver) return

      game.frame++

      // Gravity
      game.cat.velocityY += 0.8
      game.cat.y += game.cat.velocityY

      if (game.cat.y >= GROUND_Y - game.cat.height) {
        game.cat.y = GROUND_Y - game.cat.height
        game.cat.velocityY = 0
        game.cat.jumping = false
      }

      // Create obstacles at random intervals
if (game.frame >= game.nextObstacleFrame) {
  const random = Math.random()

  // Most of the time: a normal cactus
  if (random < 0.65) {
    createObstacle('cactus')
  }

  // Sometimes: a bird
  else if (random < 0.9) {
    createObstacle('bird')
  }

  // Rarely: a double cactus
  else {
    createObstacle('cactus')

    const secondCactusVariant =
    Math.floor(Math.random() * CACTUS_VARIANTS.length)

    game.obstacles.push({
    type: 'cactus',
    x: GAME_WIDTH + 42,
    y: GROUND_Y - 60,
    width: 45,
    height: 60,
    variant: secondCactusVariant,
    })
  }

  // The faster the game gets, the more space we give
  // the player between obstacle groups.
  const minimumGap = Math.max(70, 100 - game.speed * 3)
  const maximumGap = Math.max(150, 230 - game.speed * 4)

  const randomGap =
    Math.floor(
      Math.random() * (maximumGap - minimumGap + 1)
    ) + minimumGap

  game.nextObstacleFrame = game.frame + randomGap
}

      // Move obstacles
      game.obstacles.forEach((obstacle) => {
        obstacle.x -= game.speed
      })

      // Remove obstacles that left screen
      game.obstacles = game.obstacles.filter(
        (obstacle) => obstacle.x + obstacle.width > 0
      )

      // Collision
      for (const obstacle of game.obstacles) {
        if (checkCollision(game.cat, obstacle)) {
          game.gameOver = true
          setGameState('gameover')

          const finalScore = Math.floor(game.score)

          if (finalScore > highScore) {
            localStorage.setItem('catRunHighScore', finalScore)
            setHighScore(finalScore)
          }

          return
        }
      }

      // Score
      game.score += 0.1
      setScore(Math.floor(game.score))

      // Gradually increase speed
      game.speed = Math.min(
        14,
        6 + game.score / 120
      )
    }

    function drawBackground() {
        if (!BACKGROUND_IMAGE.complete) {
          return
        }
      
        ctx.imageSmoothingEnabled = false
      
        ctx.drawImage(
          BACKGROUND_IMAGE,
          0,
          0,
          GAME_WIDTH,
          GAME_HEIGHT
        )
      }

    function draw() {
      ctx.clearRect(0, 0, GAME_WIDTH, 320)

      drawBackground()
      drawCat()

      game.obstacles.forEach(drawObstacle)

      // Start message
      if (gameState === 'ready') {
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(
          'Press SPACE or click to jump',
          GAME_WIDTH / 2,
          100
        )
        ctx.textAlign = 'left'
      }

      animationId = requestAnimationFrame(loop)
    }

    function loop() {
      update()
      draw()
    }

    function handleKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault()
          
            if (gameState === 'gameover') {
              setGameState('ready')
              return
            }
          
            if (gameState === 'ready') {
              resetGame()
              setGameState('playing')
            }
          
            jump()
          }

      if (event.code === 'ArrowUp') {
        if (gameState === 'ready') {
          resetGame()
          setGameState('playing')
        }

        jump()
      }
    }

    function handleClick() {
      if (gameState === 'ready') {
        resetGame()
        setGameState('playing')
      }

      jump()
    }

    window.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('click', handleClick)

    loop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('click', handleClick)
    }
  }, [gameState, highScore])

  function restart() {
    setGameState('ready')
  }

  return (
    <main className="cat-run">
      <div className="cat-run-header">
        <button className="back-button" onClick={onBack}>
          ← Arcade
        </button>

        <div>
          <h1>🐈 Cat Run</h1>
          <p>Don't let the cat hit the cactus.</p>
        </div>
      </div>

      <div className="scoreboard">
        <div>
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div>
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>
      </div>

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={320}
        />

        {gameState === 'gameover' && (
          <div className="game-over">
            <h2>💀 BONK.</h2>
            <p>The cat has met the cactus.</p>

            <button onClick={restart}>
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default CatRun