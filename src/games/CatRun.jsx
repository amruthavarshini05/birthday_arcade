import { useEffect, useRef, useState } from 'react'
import './CatRun.css'

const GAME_WIDTH = 900
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
      
        game.obstacles.push({
          type: 'cactus',
          x: GAME_WIDTH,
          y: GROUND_Y - 45,
          width: 30,
          height: 45,
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
        ctx.save()
      
        ctx.translate(game.cat.x + game.cat.width, 0)
        ctx.scale(-1, 1)
      
        ctx.font = '42px Arial'
        ctx.fillText('🐈', 0, game.cat.y + 42)
      
        ctx.restore()
      }

      function drawObstacle(obstacle) {
        ctx.font = '42px Arial'
      
        if (obstacle.type === 'bird') {
          ctx.fillText('🐦', obstacle.x, obstacle.y + 35)
        } else {
          ctx.fillText('🌵', obstacle.x, obstacle.y + 42)
        }
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
  const obstacleType = Math.random() < 0.25
    ? 'bird'
    : 'cactus'

  createObstacle(obstacleType)

  const minimumGap = 70
  const maximumGap = 200

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
        12,
        6 + Math.floor(game.score / 100)
        )
    }

    function draw() {
      ctx.clearRect(0, 0, GAME_WIDTH, 320)

      drawGround()
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