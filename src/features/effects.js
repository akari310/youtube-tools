import { $cl, $id, $e, $m } from '../utils/dom.js';
import { setHTML } from '../utils/trusted-types.js';
import { __ytToolsRuntime } from '../utils/runtime.js';

let health = 100;
let gameActive = false;
let gameInterval = null;
let bombs = [];
let basket = null;
let score = 0;

/**
 * Initializes the interactive effects feature (health bar, falling bombs).
 * @param {Object} settings - User settings.
 */
export function initEffectsFeature(settings) {
  if (!settings.enableEffects) {
    cleanupEffects();
    return;
  }

  // Only activate on watch pages or shorts to avoid cluttering browse pages
  const isWatch =
    window.location.pathname.startsWith('/watch') || window.location.pathname.startsWith('/shorts');
  if (isWatch) {
    setupGame();
  } else {
    cleanupEffects();
  }
}

function setupGame() {
  if (gameActive) return;
  gameActive = true;
  health = 100;
  score = 0;

  createHealthBar();
  createBasket();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 16); // ~60fps

  document.addEventListener('mousemove', moveBasket);

  console.log('[YT Tools] Interactive Effects Activated');
}

function createHealthBar() {
  if ($id('yt-health-bar-container')) return;

  const container = $cl('div');
  container.id = 'yt-health-bar-container';
  container.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    width: 250px;
    height: 12px;
    background: rgba(15, 15, 15, 0.8);
    border-radius: 6px;
    overflow: hidden;
    z-index: 11000;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  `;

  const bar = $cl('div');
  bar.id = 'yt-health-bar';
  bar.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #ff3b3b, #ff0000);
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  const label = $cl('div');
  label.id = 'yt-health-label';
  label.textContent = 'HEALTH';
  label.style.cssText = `
    position: absolute;
    top: -18px;
    left: 0;
    font-size: 10px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    letter-spacing: 1px;
  `;

  container.appendChild(label);
  container.appendChild(bar);
  document.body.appendChild(container);
}

function createBasket() {
  if ($id('yt-basket')) {
    basket = $id('yt-basket');
    return;
  }

  basket = $cl('div');
  basket.id = 'yt-basket';
  basket.textContent = '🧺';
  basket.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    width: 90px;
    height: 90px;
    pointer-events: none;
    z-index: 11000;
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.6));
    transform: translateX(-50%);
  `;

  document.body.appendChild(basket);
}

function moveBasket(e) {
  if (!basket) return;
  // Smoothly follow mouse on X axis
  basket.style.left = `${e.clientX}px`;
}

let lastSpawnTime = 0;
const spawnRate = 1500; // ms

function gameLoop() {
  if (!gameActive) return;

  const now = Date.now();
  if (now - lastSpawnTime > spawnRate) {
    spawnBomb();
    lastSpawnTime = now;
  }

  updateBombs();
}

function spawnBomb() {
  const bomb = $cl('div');
  bomb.className = 'yt-bomb';

  // Randomly choose between bomb 💣 or item 💎
  const isGood = Math.random() > 0.8;
  setHTML(bomb, isGood ? '💎' : '💣');
  bomb.dataset.type = isGood ? 'good' : 'bad';

  const startX = Math.random() * (window.innerWidth - 40);

  bomb.style.cssText = `
    position: fixed;
    top: -60px;
    left: ${startX}px;
    font-size: 35px;
    z-index: 10500;
    user-select: none;
    filter: drop-shadow(0 5px 10px rgba(0,0,0,0.4));
    transition: transform 0.1s linear;
  `;

  document.body.appendChild(bomb);
  bombs.push({
    el: bomb,
    y: -60,
    x: startX,
    speed: 3 + Math.random() * 4,
    type: isGood ? 'good' : 'bad',
  });
}

function updateBombs() {
  if (!basket) return;
  const basketRect = basket.getBoundingClientRect();

  // Use a smaller hit area for the basket top
  const hitArea = {
    top: basketRect.top,
    bottom: basketRect.top + 30,
    left: basketRect.left + 10,
    right: basketRect.right - 10,
  };

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    bomb.y += bomb.speed;
    bomb.el.style.top = `${bomb.y}px`;

    // Check collision
    const bombRect = bomb.el.getBoundingClientRect();

    const isColliding =
      bombRect.bottom >= hitArea.top &&
      bombRect.top <= hitArea.bottom &&
      bombRect.right >= hitArea.left &&
      bombRect.left <= hitArea.right;

    if (isColliding) {
      if (bomb.type === 'bad') {
        damage(15);
        createFlashEffect('#ff0000');
      } else {
        heal(10);
        score += 100;
        createFlashEffect('#00ff00');
      }
      bomb.el.remove();
      bombs.splice(i, 1);
      continue;
    }

    // Missed
    if (bomb.y > window.innerHeight) {
      bomb.el.remove();
      bombs.splice(i, 1);
      // No damage for missing, but maybe for letting bombs hit the ground?
      // For now, let's say missing a bomb is fine, catching it is bad.
    }
  }
}

function createFlashEffect(color) {
  const flash = $cl('div');
  flash.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: ${color};
    opacity: 0.15;
    z-index: 20000;
    pointer-events: none;
  `;
  document.body.appendChild(flash);
  setTimeout(() => {
    flash.style.transition = 'opacity 0.4s ease';
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 500);
  }, 50);
}

function damage(amount) {
  health -= amount;
  if (health < 0) health = 0;
  updateHealthBar();
  if (health <= 0) gameOver();
}

function heal(amount) {
  health += amount;
  if (health > 100) health = 100;
  updateHealthBar();
}

function updateHealthBar() {
  const bar = $id('yt-health-bar');
  if (bar) {
    bar.style.width = `${health}%`;
    // Change color based on health
    if (health < 30) {
      bar.style.background = 'linear-gradient(90deg, #ff0000, #990000)';
    } else if (health < 60) {
      bar.style.background = 'linear-gradient(90deg, #ffcc00, #ffaa00)';
    } else {
      bar.style.background = 'linear-gradient(90deg, #ff3b3b, #ff0000)';
    }
  }
}

function gameOver() {
  gameActive = false;
  if (gameInterval) clearInterval(gameInterval);

  const msg = $cl('div');
  msg.id = 'yt-game-over';
  setHTML(
    msg,
    `
    <div style="background:rgba(0,0,0,0.9); padding:40px; border-radius:20px; text-align:center; border:2px solid #ff0000; backdrop-filter:blur(10px);">
      <h1 style="color:#ff0000; margin-bottom:10px;">GAME OVER</h1>
      <p style="color:#fff; margin-bottom:20px;">Score: ${score}</p>
      <button id="restartGame" style="background:#ff0000; color:#fff; border:none; padding:10px 30px; border-radius:5px; cursor:pointer; font-weight:bold;">RETRY</button>
    </div>
  `
  );
  msg.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    z-index: 21000;
  `;
  document.body.appendChild(msg);

  $id('restartGame').onclick = () => {
    msg.remove();
    cleanupEffects();
    setupGame();
  };
}

export function cleanupEffects() {
  gameActive = false;
  if (gameInterval) clearInterval(gameInterval);
  document.removeEventListener('mousemove', moveBasket);

  $id('yt-health-bar-container')?.remove();
  $id('yt-basket')?.remove();
  $id('yt-game-over')?.remove();
  $m('.yt-bomb').forEach(b => b.remove());

  bombs = [];
}
