// Fullscreen Autoplay & Infinite Looping Animation Engine
const TOTAL_FRAMES = 240;
const FRAME_PATH_PREFIX = '/ezgif-7fbbfbe2b5f04963-jpg/ezgif-frame-';
const FRAME_EXTENSION = '.jpg';
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

const frames = [];
let currentFrame = 0;
let lastTimestamp = 0;
let lastDrawnFrame = -1;

const canvas = document.getElementById('sequence-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

// Setup canvas size matching screen pixel ratio
function setupCanvasDimensions() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  renderFrame(currentFrame);
}

// Draw frame with centered cover scaling
function renderFrame(frameIdx) {
  const clampedIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIdx));
  let img = frames[clampedIdx];

  // Fallback to nearest loaded frame if current isn't ready yet
  if (!img || !img.complete || img.naturalWidth === 0) {
    if (lastDrawnFrame >= 0 && frames[lastDrawnFrame] && frames[lastDrawnFrame].complete) {
      img = frames[lastDrawnFrame];
    } else {
      return;
    }
  }

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih);
  const nw = iw * scale;
  const nh = ih * scale;
  const nx = (cw - nw) / 2;
  const ny = (ch - nh) / 2;

  ctx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
  lastDrawnFrame = clampedIdx;
}

// Preload all 240 frames
function preloadFrames() {
  // First frame paint immediately
  const firstImg = new Image();
  firstImg.src = `${FRAME_PATH_PREFIX}001${FRAME_EXTENSION}`;
  firstImg.onload = () => {
    frames[0] = firstImg;
    setupCanvasDimensions();
    renderFrame(0);
  };

  // Preload all frames sequentially/concurrently
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const padded = String(i).padStart(3, '0');
    img.src = `${FRAME_PATH_PREFIX}${padded}${FRAME_EXTENSION}`;
    frames[i - 1] = img;
  }
}

// Continuous Autoplay + Loop Animation Loop
function loop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const elapsed = timestamp - lastTimestamp;

  if (elapsed >= FRAME_INTERVAL) {
    lastTimestamp = timestamp - (elapsed % FRAME_INTERVAL);
    currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
    renderFrame(currentFrame);
  }

  requestAnimationFrame(loop);
}


window.addEventListener('resize', setupCanvasDimensions);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupCanvasDimensions();
  preloadFrames();
  requestAnimationFrame(loop);

  // Hero text and navbar scroll logic
  const heroText = document.getElementById('hero-text');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Fade out hero text completely by 30% of the window height
    if (heroText) {
      const fadeEnd = windowHeight * 0.3;
      if (scrollY <= fadeEnd) {
        const opacity = 1 - (scrollY / fadeEnd);
        heroText.style.opacity = Math.max(0, opacity).toString();
        heroText.style.visibility = 'visible';
      } else {
        heroText.style.opacity = '0';
        heroText.style.visibility = 'hidden';
      }
    }

    // Toggle navbar solid background when scrolling past the hero (e.g. past 80% height)
    if (navbar) {
      if (scrollY > windowHeight * 0.8) {
        navbar.classList.remove('bg-transparent', 'py-5');
        navbar.classList.add('bg-stone-950/90', 'backdrop-blur-md', 'py-3', 'shadow-sm');
      } else {
        navbar.classList.add('bg-transparent', 'py-5');
        navbar.classList.remove('bg-stone-950/90', 'backdrop-blur-md', 'py-3', 'shadow-sm');
      }
    }
  }, { passive: true });
});
