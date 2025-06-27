import Player from './Player.mjs';
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d');
let roster = {};
let active;
let prize;

const socket = io();
// Connection
socket.on('firstConnection', ({ id, roster: serRoster, prize: serPrize }) => {
    active = new Player(id);
    socket.emit('registerPlayer', active);
    roster = serRoster;
    prize = serPrize;
    roster[id] = active;
    gameLoop();
});
// Receive update
socket.on('updateRoster', serRoster => roster = serRoster);

// Player left
socket.on('playerLeft', (id) => {
    delete roster[id];
});

// Prize Update & Score Update
socket.on('updatePrize', serPrize => {
    prize = serPrize;
    const rank = active.calculateRank(Object.keys(roster).filter(key => key !== active.id).map(key => roster[key]));
    document.getElementById('score').innerHTML = `Player Score: ${active.score} Player Rank: ${rank}`;
});


// Chara movement
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') active.movePlayer('up', 5);
    if (e.key === 'ArrowDown' || e.key === 's') active.movePlayer('down', 5);
    if (e.key === 'ArrowLeft' || e.key === 'a') active.movePlayer('left', 5);
    if (e.key === 'ArrowRight' || e.key === 'd') active.movePlayer('right', 5);
});

// Frames display
function gameLoop() {
    // Clear canvas 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw
    Object.values(roster).forEach(player => {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x - 5, player.y - 5, 10, 10);
    });
    ctx.fillStyle = prize.color;
    ctx.beginPath();
    ctx.arc(prize.x, prize.y, 3, 0, Math.PI * 2);
    ctx.fill();
    // Send update
    socket.emit('updatePlayer', active);

    // Catch prize
    if (active.collision(prize)) {
        socket.emit('prizeCatch', prize.id);
        active.score += prize.value;
    }
  requestAnimationFrame(gameLoop);
}