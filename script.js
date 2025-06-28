const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const grid = 15;
const paddleHeight = grid * 5;
const maxPaddleY = canvas.height - grid - paddleHeight;
const paddleSpeed = 6;
let ballSpeed;
let leftScore = 0;
let rightScore = 0;
const winningScore = 11;
let gameOver = false;
let startTime;
let mode = "ai"; // default

const startScreen = document.getElementById("startScreen");
const winnerScreen = document.getElementById("winnerScreen");
const winnerText = document.getElementById("winnerText");

const leftPaddle = { x: grid * 2, y: canvas.height / 2 - paddleHeight / 2, width: grid, height: paddleHeight, dy: 0 };
const rightPaddle = { x: canvas.width - grid * 3, y: canvas.height / 2 - paddleHeight / 2, width: grid, height: paddleHeight, dy: 0 };

let ball;

function selectMode(selected) {
  mode = selected;
}

startScreen.style.display = "flex";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function drawTimer() {
  const elapsed = Date.now() - startTime;
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText(formatTime(elapsed), canvas.width / 2 - 30, 30);
}

function startGame(speed) {
  ballSpeed = speed;
  leftScore = 0;
  rightScore = 0;
  gameOver = false;
  resetBall();
  startScreen.style.display = "none";
  startTime = Date.now();
  requestAnimationFrame(loop);
}

function resetBall() {
  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: grid,
    height: grid,
    dx: ballSpeed * (Math.random() > 0.5 ? 1 : -1),
    dy: ballSpeed * (Math.random() > 0.5 ? 1 : -1)
  };
}

function showWinner(text) {
  gameOver = true;
  winnerText.textContent = text;
  winnerScreen.style.display = "flex";
}

function restartGame() {
  winnerScreen.style.display = "none";
  startScreen.style.display = "flex";
}

function collides(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function drawNet() {
  ctx.fillStyle = "white";
  for (let i = 0; i < canvas.height; i += grid * 2) {
    ctx.fillRect(canvas.width / 2 - 1, i, 2, grid);
  }
}

function loop() {
  if (gameOver) return;

  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTimer();
  drawNet();

  // Move paddles
  leftPaddle.y += leftPaddle.dy;
  leftPaddle.y = Math.max(grid, Math.min(leftPaddle.y, maxPaddleY));

  if (mode === "ai") {
    // AI for right paddle
    const targetY = ball.y - rightPaddle.height / 2 + ball.height / 2;
    if (ball.dx > 0) {
      if (rightPaddle.y < targetY) rightPaddle.y += paddleSpeed * 0.7;
      else if (rightPaddle.y > targetY) rightPaddle.y -= paddleSpeed * 0.7;
    }
    rightPaddle.y = Math.max(grid, Math.min(rightPaddle.y, maxPaddleY));
  } else {
    // PvP mode: apply manual movement
    rightPaddle.y += rightPaddle.dy;
    rightPaddle.y = Math.max(grid, Math.min(rightPaddle.y, maxPaddleY));
  }

  // Draw paddles
  ctx.fillStyle = "#00ffcc";
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  ctx.fillStyle = "#ff5050";
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y < grid || ball.y + grid > canvas.height - grid) {
    ball.dy *= -1;
  }

  let paddle = ball.dx < 0 ? leftPaddle : rightPaddle;
  if (collides(ball, paddle)) {
    let collidePoint = ball.y - (paddle.y + paddle.height / 2);
    collidePoint = collidePoint / (paddle.height / 2);
    let angle = collidePoint * (Math.PI / 4);
    let direction = ball.dx < 0 ? 1 : -1;
    ball.dx = direction * ballSpeed * Math.cos(angle);
    ball.dy = ballSpeed * Math.sin(angle);
  }

  if (ball.x < 0) {
    rightScore++;
    checkWinner();
    resetBall();
  } else if (ball.x > canvas.width) {
    leftScore++;
    checkWinner();
    resetBall();
  }

  ctx.fillStyle = "white";
  ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(leftScore, canvas.width / 4, 60);
  ctx.fillText(rightScore, canvas.width * 3 / 4, 60);
}

function checkWinner() {
  if (leftScore >= winningScore) {
    showWinner("Left Player Wins!");
  } else if (rightScore >= winningScore) {
    showWinner(mode === "ai" ? "AI Wins!" : "Right Player Wins!");
  }
}

// Controls for left player
document.addEventListener("keydown", e => {
  if (e.key === "w") leftPaddle.dy = -paddleSpeed;
  if (e.key === "s") leftPaddle.dy = paddleSpeed;
  if (mode === "pvp") {
    if (e.key === "ArrowUp") rightPaddle.dy = -paddleSpeed;
    if (e.key === "ArrowDown") rightPaddle.dy = paddleSpeed;
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "w" || e.key === "s") leftPaddle.dy = 0;
  if (mode === "pvp" && (e.key === "ArrowUp" || e.key === "ArrowDown")) rightPaddle.dy = 0;
});
