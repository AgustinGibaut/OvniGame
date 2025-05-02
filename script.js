const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let tick = 0;
let player = { x: canvas.width / 2, y: canvas.height - 100, size: 30, vy: -1.5, glow: 20 };
let particles = [];
const stars = [];
const obstacles = [];
let score = 0;
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  player.glow = 10 + 5 * Math.sin(tick * 0.15);
  ctx.shadowColor = 'cyan';
  ctx.shadowBlur = player.glow;
  const w = player.size * 2;
  const h = player.size;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,255,255,0.5)';
  ctx.fill();
  ctx.strokeStyle = 'cyan';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -h / 4, h / 2, Math.PI, 0);
  ctx.fillStyle = 'rgba(0,255,255,0.7)';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
function createParticles() {
  particles.push({
    x: player.x,
    y: player.y + player.size / 2,
    radius: Math.random() * 3 + 2,
    color: `hsl(${Math.random() * 360},100%,50%)`,
    alpha: 1,
    speedY: 1 + Math.random(),
    speedX: (Math.random() - 0.5) * 2,
    spin: Math.random() * 0.2 - 0.1,
    angle: 0
  });
}
function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
    p.x += p.speedX;
    p.y += p.speedY;
    p.alpha -= 0.02;
    p.angle += p.spin;
    if (p.alpha <= 0) particles.splice(i, 1);
  }
}
for (let i = 0; i < 100; i++) {
  stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2 + 1, alpha: Math.random(), alphaSpeed: Math.random() * 0.02 + 0.005 });
}
function drawStars() {
  stars.forEach(s => {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
    s.alpha += s.alphaSpeed;
    if (s.alpha > 1 || s.alpha < 0) s.alphaSpeed *= -1;
  });
}
function generateObstacle() {
  const x = Math.random() * (canvas.width - 40) + 20;
  const speedY = Math.random() * 1.5 + 1;
  const types = ['triangle', 'circle', 'square', 'star'];
  obstacles.push({ x, y: -20, size: 20, speedY, angle: 0, rotationSpeed: Math.random() * 0.1 - 0.05, pulseOffset: Math.random() * Math.PI * 2, shape: types[Math.floor(Math.random() * types.length)] });
}
function drawObstacle(ob) {
  ctx.save();
  ctx.translate(ob.x, ob.y);
  ob.angle += ob.rotationSpeed;
  ctx.rotate(ob.angle);
  const pulse = 1 + 0.3 * Math.sin(tick * 0.1 + ob.pulseOffset);
  const color = `hsl(${(tick * 2) % 360},100%,50%)`;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  switch (ob.shape) {
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -ob.size * pulse);
      ctx.lineTo(ob.size * pulse, ob.size * pulse);
      ctx.lineTo(-ob.size * pulse, ob.size * pulse);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, ob.size * pulse, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'square':
      const s2 = ob.size * pulse;
      ctx.strokeRect(-s2, -s2, s2 * 2, s2 * 2);
      break;
    case 'star':
      const r = ob.size * pulse;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + 72 * i) * Math.PI / 180) * r,
                   -Math.sin((18 + 72 * i) * Math.PI / 180) * r);
        ctx.lineTo(Math.cos((54 + 72 * i) * Math.PI / 180) * (r / 2),
                   -Math.sin((54 + 72 * i) * Math.PI / 180) * (r / 2));
      }
      ctx.closePath();
      ctx.stroke();
      break;
  }
  const eye = ob.size * 0.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-ob.size * 0.3, -ob.size * 0.3, eye, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(ob.size * 0.3, -ob.size * 0.3, eye, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-ob.size * 0.3, -ob.size * 0.3, eye / 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(ob.size * 0.3, -ob.size * 0.3, eye / 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, ob.size * 0.1, eye, 0, Math.PI); ctx.stroke();
  ctx.restore();
}
function drawObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    drawObstacle(ob);
    ob.y += ob.speedY + Math.abs(player.vy);
    if (Math.hypot(player.x - ob.x, player.y - ob.y) < player.size + ob.size * 0.5) {
      alert(`💥 ¡Has chocado! Puntaje: ${score}`);
      document.location.reload();
    }
    if (ob.y > canvas.height + 50) obstacles.splice(i, 1);
  }
}
function drawScore() {
  document.getElementById('score').textContent = score;
}
function gameLoop() {
  tick++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars();
  player.y += player.vy;
  if (player.y < canvas.height / 2) {
    player.y = canvas.height / 2;
    obstacles.forEach(o => o.y += Math.abs(player.vy));
  }
  drawPlayer();
  createParticles();
  drawParticles();
  drawObstacles();
  drawScore();
  score++;
  requestAnimationFrame(gameLoop);
}
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.x = Math.max(player.size, player.x - 20);
  if (e.key === 'ArrowRight') player.x = Math.min(canvas.width - player.size, player.x + 20);
});
canvas.addEventListener('touchstart', e => {
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (touchX < canvas.width / 2) player.x = Math.max(player.size, player.x - 20);
  else player.x = Math.min(canvas.width - player.size, player.x + 20);
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  player.x = Math.min(Math.max(player.size, touchX), canvas.width - player.size);
});
setInterval(generateObstacle, 800);
gameLoop();
