const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const welcomeScreen = document.getElementById('welcomeScreen');
const startButton = document.getElementById('startButton');
const backgroundCanvas = document.getElementById('backgroundCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const mainMenuButton = document.getElementById('mainMenuButton');
const restartButton = document.getElementById('restartButton');

let bird = { x: 50, y: 300, radius: 10, dy: 0 };
let gravity = 0.5;
let lift = -10;
let isGameOver = false;
let obstacles = [];
let clouds = [];
let mountains = [];
let trees = [];
let frameCount = 0;
let score = 0;
let isGameStarted = false;
let animationFrameId;

startButton.addEventListener('click', startGame);
mainMenuButton.addEventListener('click', backToMainMenu);
restartButton.addEventListener('click', restartGame);

function startGame() {
    welcomeScreen.classList.add('hidden');
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    isGameStarted = true;
    document.addEventListener('keydown', handleKeyDown);
    resetGame();
    gameLoop();
}

function handleKeyDown(e) {
    if (e.code === 'Space' && !isGameOver) {
        bird.dy = lift;
    } else if (isGameOver && e.code === 'Space') {
        restartGame();
    }
}

function resetGame() {
    bird = { x: 50, y: 300, radius: 10, dy: 0 };
    isGameOver = false;
    obstacles = [];
    clouds = [];
    mountains = [];
    trees = [];
    frameCount = 0;
    score = 0;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function drawSky(ctx) {
    ctx.fillStyle = '#87CEEB'; // Deeper blue sky
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMountains(ctx) {
    ctx.fillStyle = '#8B4513'; // Brown color for mountains
    mountains.forEach(mountain => {
        ctx.beginPath();
        ctx.moveTo(mountain.x, canvas.height);
        ctx.lineTo(mountain.x + 50, canvas.height - mountain.height);
        ctx.lineTo(mountain.x + 100, canvas.height);
        ctx.fill();
    });
}

function drawTrees(ctx) {
    ctx.fillStyle = '#32CD32'; // Lighter green for trees
    trees.forEach(tree => {
        drawTree(ctx, tree.x, canvas.height - tree.height);
    });
}

function drawTree(ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 20, y + 50);
    ctx.lineTo(x + 20, y + 50);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8B4513'; // Brown color for the tree trunk
    ctx.fillRect(x - 5, y + 50, 10, 20); // Draw the tree trunk
}

function updateBackground() {
    if (frameCount % 200 === 0) {
        let mountainHeight = 50 + Math.random() * 100;
        mountains.push({ x: canvas.width, height: mountainHeight });
    }

    if (frameCount % 150 === 0) {
        let treeHeight = 20 + Math.random() * 40;
        trees.push({ x: canvas.width, height: treeHeight });
    }

    mountains.forEach(mountain => {
        mountain.x -= 2; // Move mountains at the same rate as clouds
    });

    trees.forEach(tree => {
        tree.x -= 2; // Move trees at the same rate as clouds
    });

    mountains = mountains.filter(mountain => mountain.x + 100 > 0);
    trees = trees.filter(tree => tree.x + 40 > 0);
}

function updateClouds() {
    if (frameCount % 100 === 0) {
        let cloud = { x: canvas.width, y: Math.random() * canvas.height / 2, radius: 20 + Math.random() * 30 };
        clouds.push(cloud);
    }

    clouds.forEach(cloud => {
        cloud.x -= 2; // Move clouds faster
    });

    clouds = clouds.filter(cloud => cloud.x + cloud.radius > 0);
}

function drawClouds(ctx) {
    ctx.fillStyle = 'white';
    clouds.forEach(cloud => {
        drawCartoonCloud(ctx, cloud.x, cloud.y, cloud.radius);
    });
}

function drawCartoonCloud(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.7, y - radius * 0.6, radius * 0.8, 0, Math.PI * 2);
    ctx.arc(x + radius * 1.4, y, radius, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.7, y + radius * 0.6, radius * 0.8, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawBird(ctx) {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawObstacles(ctx) {
    ctx.fillStyle = 'green';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateBird() {
    bird.dy += gravity;
    bird.y += bird.dy;

    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        isGameOver = true;
        showGameOverScreen();
    }
}

function updateObstacles() {
    if (frameCount % 90 === 0) {
        let gap = 150;
        let obstacleHeight = Math.floor(Math.random() * (canvas.height - gap));
        obstacles.push({ x: canvas.width, y: 0, width: 40, height: obstacleHeight });
        obstacles.push({ x: canvas.width, y: obstacleHeight + gap, width: 40, height: canvas.height - obstacleHeight - gap });
        score++;
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= 3;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    obstacles.forEach(obstacle => {
        if (bird.x - bird.radius < obstacle.x + obstacle.width &&
            bird.x + bird.radius > obstacle.x &&
            bird.y - bird.radius < obstacle.y + obstacle.height &&
            bird.y + bird.radius > obstacle.y) {
            isGameOver = true;
            showGameOverScreen();
        }
    });
}

function drawScore(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawInitialBackground() {
    drawSky(backgroundCtx);
    drawClouds(backgroundCtx);
    drawBird(backgroundCtx);
    drawObstacles(backgroundCtx);
}

function showGameOverScreen() {
    canvas.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    welcomeScreen.classList.add('hidden');
    finalScore.textContent = `Your Score: ${score}`;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function backToMainMenu() {
    gameOverScreen.style.display = 'none';
    welcomeScreen.classList.remove('hidden');
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    gameLoop();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawSky(ctx);
    drawMountains(ctx);
    drawTrees(ctx);
    drawClouds(ctx);
    drawBird(ctx);
    drawObstacles(ctx);

    if (!isGameOver) {
        updateClouds();
        updateBackground();
        updateBird();
        updateObstacles();
        checkCollision();
        if (isGameStarted) {
            drawScore(ctx);
            frameCount++;
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Draw the initial background for the welcome screen
drawInitialBackground();
