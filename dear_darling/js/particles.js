/**
 * Dear Darling — Ambient Particles & Keepsake Confetti Engine
 * Renders floating pastel bokeh, sparkling stars, and heart bursts
 */

export class AmbientBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.bursts = [];
    this.numParticles = 35;
    this.isRunning = false;
    this.animationFrameId = null;

    // Check prefers-reduced-motion
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    if (!this.reducedMotion) {
      this.createParticles();
      this.start();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    this.particles = [];
    const colors = [
      "rgba(248, 200, 220, ", // Soft Pink
      "rgba(244, 114, 182, ", // Warm Pink
      "rgba(125, 211, 252, ", // Sky Blue
      "rgba(2, 132, 199, ",   // Ocean Blue
      "rgba(251, 191, 36, "   // Soft Gold
    ];

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3.5 + 1.2,
        baseAlpha: Math.random() * 0.45 + 0.15,
        alpha: 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.15, // Gentle drift upwards
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        isStar: Math.random() > 0.65
      });
    }
  }

  start() {
    if (this.isRunning || this.reducedMotion) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  triggerHeartBurst(originX, originY) {
    const burstCount = 28;
    const colors = ["#f472b6", "#ec4899", "#38bdf8", "#0284c7", "#fbbf24"];

    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.bursts.push({
        x: originX || this.width / 2,
        y: originY || this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward trajectory
        size: Math.random() * 12 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.012,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        isHeart: Math.random() > 0.4
      });
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  loop() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.pulseAngle += p.pulseSpeed;
      p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.15;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      this.ctx.fillStyle = `${p.colorBase}${Math.max(0, p.alpha)})`;

      if (p.isStar) {
        // Draw 4-point twinkling star
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          this.ctx.rotate(Math.PI / 2);
          this.ctx.lineTo(p.radius * 2, 0);
          this.ctx.lineTo(p.radius * 0.5, p.radius * 0.5);
        }
        this.ctx.fill();
        this.ctx.restore();
      } else {
        // Draw soft bokeh circle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Draw bursts / confetti
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.12; // Gravity
      b.alpha -= b.decay;
      b.rotation += b.vRot;

      if (b.alpha <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(b.x, b.y);
      this.ctx.rotate(b.rotation);
      this.ctx.globalAlpha = Math.max(0, b.alpha);

      if (b.isHeart) {
        // Draw heart shape
        this.ctx.fillStyle = b.color;
        const d = b.size;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(-d / 2, -d / 2, -d, d / 3, 0, d);
        this.ctx.bezierCurveTo(d, d / 3, d / 2, -d / 2, 0, 0);
        this.ctx.fill();
      } else {
        // Confetti petal
        this.ctx.fillStyle = b.color;
        this.ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size * 0.6);
      }

      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }
}
