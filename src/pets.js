
export class PetEngine {
  constructor(canvasId = 'pets-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.soundEnabled = true;
    this.audioCtx = null;
    this.pets = [];
    this.hearts = [];
    this.lastTime = performance.now();
    this.isMuted = false;


    this.breeds = [
      {
        name: 'Orange Tabby',
        body: '#e6983b',
        stripes: '#af5410',
        belly: '#fdf1d6',
        eyes: '#73c991',
        nose: '#e06c75',
        collar: '#83a598'
      },
      {
        name: 'Tuxedo Cat',
        body: '#2d333b',
        stripes: '#1c2128',
        belly: '#f0f6fc',
        eyes: '#fabd2f',
        nose: '#d3869b',
        collar: '#fb4934'
      },
      {
        name: 'Calico Cat',
        body: '#ebdbb2',
        stripes: '#d65d0e',
        belly: '#3c3836',
        eyes: '#b8bb26',
        nose: '#fb4934',
        collar: '#d3869b'
      },
      {
        name: 'Midnight Panther',
        body: '#1d2021',
        stripes: '#141617',
        belly: '#282828',
        eyes: '#fabd2f',
        nose: '#d3869b',
        collar: '#b8bb26'
      },
      {
        name: 'Siamese Cat',
        body: '#fbf1c7',
        stripes: '#7c6f64',
        belly: '#ebdbb2',
        eyes: '#83a598',
        nose: '#3c3836',
        collar: '#fe8019'
      }
    ];

    this.initCanvas();
    this.spawnInitialPets();
    this.setupEvents();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initCanvas() {
    const resize = () => {
      if (!this.canvas || !this.canvas.parentElement) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.width = rect.width;
      this.height = rect.height || 34;
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      if (this.ctx && this.ctx.resetTransform) {
        this.ctx.resetTransform();
      }
      if (this.ctx) {
        this.ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', resize);
    resize();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playMeow(pitch = 1.0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      const baseFreq = 480 * pitch;

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {

    }
  }

  playPurr() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.15);
      osc.frequency.linearRampToValueAtTime(60, now + 0.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  toggleSound() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playPurr();
    }
    return this.isMuted;
  }

  spawnInitialPets() {
    this.addPet(this.breeds[0], 55);
    this.addPet(this.breeds[1], 150);
  }

  addPet(breed = null, startX = null) {
    if (this.pets.length >= 4) return;
    if (!breed) {
      breed = this.breeds[Math.floor(Math.random() * this.breeds.length)];
    }
    const x = startX !== null ? startX : Math.random() * Math.max(60, this.width - 70) + 35;
    const pet = {
      id: Math.random().toString(36).substring(2, 9),
      breed,
      x: x,
      y: Math.max(22, (this.height || 34) - 9),
      speed: 0.5 + Math.random() * 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
      state: 'WALKING',
      stateTimer: 2500 + Math.random() * 3000,
      animFrame: 0,
      animTimer: 0,
      scale: 0.95,
      purrCount: 0,
      speechBubble: null,
      bubbleTimer: 0,
      zzTimer: 0
    };
    this.pets.push(pet);
    this.addFloatingHeart(pet.x, pet.y - 12, '✨');
  }

  removePet() {
    if (this.pets.length > 1) {
      const removed = this.pets.pop();
      this.addFloatingHeart(removed.x, removed.y - 5, '💨');
    }
  }

  setupEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let hitPet = false;
      for (const pet of this.pets) {
        const dx = clickX - pet.x;
        const dy = clickY - (pet.y - 8);
        if (Math.abs(dx) < 20 && Math.abs(dy) < 18) {
          this.petTheCat(pet);
          hitPet = true;
          break;
        }
      }

      if (!hitPet && this.pets.length > 0) {
        const nearest = this.pets.reduce((prev, curr) =>
          Math.abs(curr.x - clickX) < Math.abs(prev.x - clickX) ? curr : prev
        );
        nearest.direction = clickX > nearest.x ? 1 : -1;
        nearest.state = 'WALKING';
        nearest.stateTimer = 3000;
        this.addFloatingHeart(clickX, clickY, '🐾');
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let isHovering = false;
      for (const pet of this.pets) {
        const dx = mouseX - pet.x;
        const dy = mouseY - (pet.y - 8);
        if (Math.abs(dx) < 20 && Math.abs(dy) < 18) {
          isHovering = true;
          break;
        }
      }
      this.canvas.style.cursor = isHovering ? 'pointer' : 'default';
    });
  }

  petTheCat(pet) {
    pet.state = 'PURRING';
    pet.stateTimer = 2500;
    pet.purrCount++;

    const meows = ['Meow! 🐾', 'Purr~ ❤️', 'Gruber! ✨', 'ฅ^•ﻌ•^ฅ', 'Nya~ ✨'];
    pet.speechBubble = meows[Math.floor(Math.random() * meows.length)];
    pet.bubbleTimer = 2000;

    for (let i = 0; i < 3; i++) {
      this.addFloatingHeart(
        pet.x + (Math.random() * 20 - 10),
        pet.y - 14 - Math.random() * 8,
        Math.random() > 0.4 ? '❤️' : '🐾'
      );
    }

    this.playMeow(1.0 + Math.random() * 0.3);
    setTimeout(() => this.playPurr(), 200);
  }

  addFloatingHeart(x, y, emoji = '❤️') {
    this.hearts.push({
      x,
      y,
      vy: -0.7 - Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.6,
      opacity: 1.0,
      scale: 0.8 + Math.random() * 0.4,
      emoji
    });
  }

  update(dt) {
    const maxX = Math.max(50, this.width - 24);
    const minX = 20;

    for (const pet of this.pets) {
      pet.y = Math.max(20, (this.height || 34) - 9);
      pet.stateTimer -= dt;
      pet.animTimer += dt;

      if (pet.bubbleTimer > 0) {
        pet.bubbleTimer -= dt;
        if (pet.bubbleTimer <= 0) pet.speechBubble = null;
      }

      if (pet.stateTimer <= 0) {
        const rand = Math.random();
        if (rand < 0.5) {
          pet.state = 'WALKING';
          pet.stateTimer = 3000 + Math.random() * 4000;
          pet.direction = Math.random() > 0.5 ? 1 : -1;
        } else if (rand < 0.75) {
          pet.state = 'SITTING';
          pet.stateTimer = 2500 + Math.random() * 3500;
        } else if (rand < 0.90) {
          pet.state = 'SLEEPING';
          pet.stateTimer = 3500 + Math.random() * 5000;
        } else {
          pet.state = 'STRETCHING';
          pet.stateTimer = 1800 + Math.random() * 1800;
        }
      }

      if (pet.state === 'WALKING') {
        pet.x += pet.speed * pet.direction * (dt / 16);

        if (pet.x > maxX) {
          pet.x = maxX;
          pet.direction = -1;
        } else if (pet.x < minX) {
          pet.x = minX;
          pet.direction = 1;
        }

        if (pet.animTimer > 120) {
          pet.animFrame = (pet.animFrame + 1) % 4;
          pet.animTimer = 0;
        }
      } else if (pet.state === 'SLEEPING') {
        pet.zzTimer = (pet.zzTimer || 0) + dt;
        if (pet.zzTimer > 1400) {
          pet.zzTimer = 0;
          this.addFloatingHeart(pet.x + 6 * pet.direction, pet.y - 10, 'z');
        }
      } else if (pet.state === 'SITTING' || pet.state === 'PURRING') {
        if (pet.animTimer > 250) {
          pet.animFrame = (pet.animFrame + 1) % 2;
          pet.animTimer = 0;
        }
      }
    }

    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.y += h.vy;
      h.x += h.vx;
      h.opacity -= 0.018;
      if (h.opacity <= 0) {
        this.hearts.splice(i, 1);
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Subtle track dots
    this.ctx.fillStyle = 'rgba(235, 219, 178, 0.04)';
    for (let x = 12; x < this.width - 12; x += 24) {
      this.ctx.fillRect(x, this.height - 2, 2, 1);
    }

    for (const pet of this.pets) {
      this.drawPet(pet);
    }

    for (const h of this.hearts) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, h.opacity);
      this.ctx.font = `${Math.round(11 * h.scale)}px sans-serif`;
      this.ctx.textAlign = 'center';
      if (h.emoji === 'z') {
        this.ctx.fillStyle = '#fabd2f';
        this.ctx.font = 'bold 9px monospace';
        this.ctx.fillText('z', h.x, h.y);
      } else {
        this.ctx.fillText(h.emoji, h.x, h.y);
      }
      this.ctx.restore();
    }
  }

  drawPet(pet) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(Math.round(pet.x), Math.round(pet.y));
    ctx.scale(pet.direction * pet.scale, pet.scale);

    const b = pet.breed;
    const px = 1.5;

    if (pet.state === 'SLEEPING') {
      ctx.fillStyle = b.body;
      ctx.fillRect(-7 * px, -5 * px, 14 * px, 5 * px);
      ctx.fillStyle = b.stripes;
      ctx.fillRect(-3 * px, -5 * px, 2 * px, 3 * px);
      ctx.fillRect(2 * px, -5 * px, 2 * px, 3 * px);
      ctx.fillStyle = b.body;
      ctx.fillRect(4 * px, -4 * px, 4 * px, 4 * px);
      ctx.fillStyle = b.stripes;
      ctx.fillRect(5 * px, -6 * px, 2 * px, 2 * px);
      ctx.fillStyle = '#1d2021';
      ctx.fillRect(6 * px, -2 * px, 2 * px, 1 * px);
      ctx.fillStyle = b.stripes;
      ctx.fillRect(-9 * px, -3 * px, 3 * px, 2 * px);
    } else if (pet.state === 'SITTING' || pet.state === 'PURRING') {
      const tailWag = pet.animFrame === 1 ? -1 : 1;
      ctx.fillStyle = b.stripes;
      ctx.fillRect((-8 + tailWag) * px, -7 * px, 2 * px, 5 * px);
      ctx.fillRect((-7 + tailWag) * px, -9 * px, 2 * px, 3 * px);

      ctx.fillStyle = b.body;
      ctx.fillRect(-5 * px, -8 * px, 10 * px, 8 * px);

      ctx.fillStyle = b.belly;
      ctx.fillRect(0 * px, -6 * px, 4 * px, 6 * px);

      ctx.fillStyle = b.stripes;
      ctx.fillRect(-3 * px, -8 * px, 2 * px, 5 * px);

      ctx.fillStyle = b.body;
      ctx.fillRect(1 * px, -13 * px, 7 * px, 6 * px);

      ctx.fillStyle = b.stripes;
      ctx.fillRect(2 * px, -15 * px, 2 * px, 2 * px);
      ctx.fillRect(5 * px, -15 * px, 2 * px, 2 * px);
      ctx.fillStyle = b.nose;
      ctx.fillRect(3 * px, -14 * px, 1 * px, 1 * px);
      ctx.fillRect(5 * px, -14 * px, 1 * px, 1 * px);

      ctx.fillStyle = b.collar;
      ctx.fillRect(1 * px, -7 * px, 6 * px, 1.5 * px);

      ctx.fillStyle = b.eyes;
      ctx.fillRect(5 * px, -11 * px, 2 * px, 2 * px);
      ctx.fillStyle = '#1d2021';
      ctx.fillRect(6 * px, -11 * px, 1 * px, 2 * px);

      ctx.fillStyle = b.nose;
      ctx.fillRect(7 * px, -9 * px, 1 * px, 1 * px);

      ctx.fillStyle = b.belly;
      ctx.fillRect(-3 * px, -2 * px, 3 * px, 2 * px);
      ctx.fillRect(1 * px, -2 * px, 3 * px, 2 * px);
    } else {
      const f = pet.animFrame;
      const legOffset1 = f === 0 ? 1 : f === 2 ? -1 : 0;
      const legOffset2 = f === 1 ? 1 : f === 3 ? -1 : 0;
      const bob = (f % 2 === 0) ? 0 : -1;

      ctx.fillStyle = b.stripes;
      ctx.fillRect(-9 * px, (-8 + legOffset1) * px, 2 * px, 4 * px);
      ctx.fillRect(-8 * px, (-10 + legOffset1) * px, 2 * px, 3 * px);

      ctx.fillStyle = b.body;
      ctx.fillRect(-6 * px, (-7 + bob) * px, 12 * px, 6 * px);

      ctx.fillStyle = b.stripes;
      ctx.fillRect(-3 * px, (-7 + bob) * px, 2 * px, 4 * px);
      ctx.fillRect(1 * px, (-7 + bob) * px, 2 * px, 4 * px);

      ctx.fillStyle = b.belly;
      ctx.fillRect(-1 * px, (-3 + bob) * px, 5 * px, 2 * px);

      ctx.fillStyle = b.body;
      ctx.fillRect(4 * px, (-11 + bob) * px, 6 * px, 6 * px);

      ctx.fillStyle = b.stripes;
      ctx.fillRect(5 * px, (-13 + bob) * px, 2 * px, 2 * px);
      ctx.fillRect(8 * px, (-13 + bob) * px, 2 * px, 2 * px);
      ctx.fillStyle = b.nose;
      ctx.fillRect(6 * px, (-12 + bob) * px, 1 * px, 1 * px);

      ctx.fillStyle = b.collar;
      ctx.fillRect(4 * px, (-6 + bob) * px, 5 * px, 1.5 * px);

      ctx.fillStyle = b.eyes;
      ctx.fillRect(8 * px, (-9 + bob) * px, 1.5 * px, 1.5 * px);
      ctx.fillStyle = '#1d2021';
      ctx.fillRect(9 * px, (-9 + bob) * px, 1 * px, 1.5 * px);

      ctx.fillStyle = b.nose;
      ctx.fillRect(9.5 * px, (-7 + bob) * px, 1 * px, 1 * px);

      ctx.fillStyle = b.body;
      ctx.fillRect((-4 + legOffset1) * px, -2 * px, 2 * px, 2 * px);
      ctx.fillRect((-1 - legOffset1) * px, -2 * px, 2 * px, 2 * px);
      ctx.fillRect((2 + legOffset2) * px, -2 * px, 2 * px, 2 * px);
      ctx.fillRect((4 - legOffset2) * px, -2 * px, 2 * px, 2 * px);

      ctx.fillStyle = b.belly;
      ctx.fillRect((-4 + legOffset1) * px, -1 * px, 2 * px, 1 * px);
      ctx.fillRect((4 - legOffset2) * px, -1 * px, 2 * px, 1 * px);
    }

    ctx.restore();

    if (pet.speechBubble) {
      this.drawSpeechBubble(pet.x, pet.y - 22, pet.speechBubble);
    }
  }

  drawSpeechBubble(x, y, text) {
    const { ctx } = this;
    ctx.save();
    ctx.font = '9px "Fira Code", monospace';
    const textWidth = ctx.measureText(text).width;
    const pad = 5;
    const w = textWidth + pad * 2;
    const h = 15;
    const rx = Math.max(6, Math.min(this.width - w - 6, x - w / 2));
    const ry = Math.max(2, y - h);

    ctx.fillStyle = '#1d2021';
    ctx.strokeStyle = '#fabd2f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(rx, ry, w, h, 3);
    } else {
      ctx.rect(rx, ry, w, h);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ebdbb2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rx + w / 2, ry + h / 2);

    ctx.restore();
  }

  loop(timestamp) {
    const dt = Math.min(50, timestamp - this.lastTime);
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  }
}
