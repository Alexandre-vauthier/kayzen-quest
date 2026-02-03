import confetti from 'canvas-confetti';

// Vibration patterns (in milliseconds)
const VIBRATION_PATTERNS = {
  questComplete: [50],
  badge: [100, 50, 100],
  levelUp: [100, 50, 100, 50, 200],
  perfectDay: [100, 50, 100, 50, 100, 50, 300],
};

// Safely trigger vibration (not all devices support it)
function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Vibration not supported or blocked
    }
  }
}

// Quest completion - small confetti burst
export function celebrateQuestComplete() {
  vibrate(VIBRATION_PATTERNS.questComplete);

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#a855f7', '#7c3aed', '#6366f1'],
    disableForReducedMotion: true,
  });
}

// Badge unlock - gold/yellow themed celebration
export function celebrateBadge() {
  vibrate(VIBRATION_PATTERNS.badge);

  const end = Date.now() + 1500;
  const colors = ['#fbbf24', '#f59e0b', '#eab308'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Level up - big celebration with stars
export function celebrateLevelUp() {
  vibrate(VIBRATION_PATTERNS.levelUp);

  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#6366f1', '#fbbf24'],
      shapes: ['star', 'circle'],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#6366f1', '#fbbf24'],
      shapes: ['star', 'circle'],
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Perfect day - full screen celebration
export function celebratePerfectDay() {
  vibrate(VIBRATION_PATTERNS.perfectDay);

  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 9999,
    disableForReducedMotion: true,
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#22c55e', '#10b981', '#34d399', '#fbbf24', '#a855f7'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#22c55e', '#10b981', '#34d399', '#fbbf24', '#a855f7'],
    });
  }, 250);
}

// Simple vibration only (for minor feedback)
export function vibrateLight() {
  vibrate(30);
}
