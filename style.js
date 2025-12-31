/* ===== COUNTDOWN TIME ===== */
// For demo, 10 seconds. Replace with your target date for production
const targetTime = new Date("2026-01-01T00:00:00").getTime();
// const targetTime = Date.now() + 10000;

const dEl = document.getElementById("days");
const hEl = document.getElementById("hours");
const mEl = document.getElementById("minutes");
const sEl = document.getElementById("seconds");

const countdownBox = document.getElementById("countdownBox");
const celebration = document.getElementById("celebration");

const fwCanvas = document.getElementById("fireworks");
const fwCtx = fwCanvas.getContext("2d");
const starCanvas = document.getElementById("stars");
const sCtx = starCanvas.getContext("2d");
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');

/* ===== RESIZE CANVASES ===== */
function resize() {
    fwCanvas.width = starCanvas.width = confettiCanvas.width = window.innerWidth;
    fwCanvas.height = starCanvas.height = confettiCanvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ===== COUNTDOWN FUNCTION ===== */
const timer = setInterval(() => {
    let diff = targetTime - Date.now();
    if (diff <= 0) {
        clearInterval(timer);
        startCelebration();
        return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff %= 1000 * 60 * 60 * 24;
    const h = Math.floor(diff / (1000 * 60 * 60));
    diff %= 1000 * 60 * 60;
    const m = Math.floor(diff / (1000 * 60));
    const s = Math.floor(diff / 1000);

    dEl.textContent = String(d).padStart(2, "0");
    hEl.textContent = String(h).padStart(2, "0");
    mEl.textContent = String(m).padStart(2, "0");
    sEl.textContent = String(s).padStart(2, "0");
}, 1000);

/* ===== STARFIELD ===== */
let stars = [];
const starCount = window.innerWidth < 480 ? 150 : 300;
for (let i = 0; i < starCount; i++) {
    stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5,
        v: Math.random() * 0.4 + 0.1
    });
}

function drawStars() {
    sCtx.fillStyle = "black";
    sCtx.fillRect(0, 0, starCanvas.width, starCanvas.height);
    sCtx.fillStyle = "white";
    stars.forEach(star => {
        star.y += star.v;
        if (star.y > window.innerHeight) star.y = 0;
        sCtx.beginPath();
        sCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        sCtx.fill();
    });
    requestAnimationFrame(drawStars);
}

/* ===== SOUND EFFECT ===== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function boom() {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = 60;
    g.gain.setValueAtTime(0.8, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 1.2);
}

/* ===== HELPER ===== */
function random(min, max) { return Math.random() * (max - min) + min; }
const colors = ["#ffcc88", "#ffd700", "#ff99cc", "#99ddff", "#ffffff"];

/* ===== PARTICLE CLASS ===== */
class Particle {
    constructor(x, y, color, type = "normal") {
        const a = random(0, Math.PI * 2);
        const sp = type === "long" ? random(3, 6) : random(1.5, 4);
        this.x = x; this.y = y;
        this.vx = Math.cos(a) * sp;
        this.vy = Math.sin(a) * sp;
        this.life = type === "long" ? random(60, 140) : random(120, 200);
        this.maxLife = this.life;
        this.size = type === "long" ? random(1, 1.8) : random(1.2, 2.2);
        this.color = color;
        this.alpha = 1;
    }
    update() {
        this.vy += 0.015;
        this.vx *= 0.985;
        this.vy *= 0.985;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = this.life / this.maxLife;
    }
    draw() {
        fwCtx.save();
        fwCtx.globalAlpha = this.alpha;
        fwCtx.shadowBlur = 15;
        fwCtx.shadowColor = this.color;
        fwCtx.fillStyle = this.color;
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        fwCtx.fill();
        fwCtx.restore();
    }
}

/* ===== FIREWORK CLASS ===== */
class Firework {
    constructor() {
        this.x = random(100, window.innerWidth - 100);
        this.y = window.innerHeight;
        this.target = random(120, window.innerHeight / 2);
        this.speed = random(6, 9);
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.exploded = false;
        this.particles = [];
    }
    update() {
        if (!this.exploded) {
            this.y -= this.speed;
            fwCtx.strokeStyle = this.color;
            fwCtx.lineWidth = 2;
            fwCtx.beginPath();
            fwCtx.moveTo(this.x, this.y + this.speed);
            fwCtx.lineTo(this.x, this.y);
            fwCtx.stroke();
            if (this.y <= this.target) {
                this.exploded = true;
                boom();
                const pCount = window.innerWidth < 480 ? 50 : 100;
                for (let i = 0; i < pCount; i++) this.particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }
    draw() {
        this.particles.forEach(p => { p.update(); p.draw(); });
        this.particles = this.particles.filter(p => p.life > 0);
    }
}

let fireworks = [];
function animate() {
    fwCtx.fillStyle = "rgba(0,0,0,0.08)";
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    fireworks.forEach(f => { f.update(); f.draw(); });
    fireworks = fireworks.filter(f => !f.exploded || f.particles.length);
    requestAnimationFrame(animate);
}

/* ===== CONFETTI ===== */
const confettiCount = window.innerWidth < 480 ? 80 : 150;
const confettis = [];
for (let i = 0; i < confettiCount; i++) {
    confettis.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 10 + 5,
        color: `hsl(${Math.random() * 360},100%,50%)`,
        tilt: Math.random() * 10 - 10
    });
}
function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettis.forEach(f => {
        ctx.beginPath();
        ctx.fillStyle = f.color;
        ctx.moveTo(f.x + f.tilt, f.y);
        ctx.lineTo(f.x + f.tilt + f.r / 2, f.y + f.r);
        ctx.lineTo(f.x + f.tilt - f.r / 2, f.y + f.r);
        ctx.closePath();
        ctx.fill();

        f.y += 2;
        f.x += Math.sin(f.y / 10);
        if (f.y > confettiCanvas.height) f.y = -10;
    });
    requestAnimationFrame(drawConfetti);
}
drawConfetti();

/* ===== START CELEBRATION ===== */
function startCelebration() {
    const name = document.getElementById("nameInput").value.trim();
    const wishEl = document.querySelector(".wish");
    if (name) {
        wishEl.textContent = `${name}, Wishing you a year full of joy, success, love, laughter, adventure, good health, and unforgettable moments!`;
    }

    countdownBox.style.display = "none";
    celebration.style.display = "block";
    document.documentElement.requestFullscreen?.();

    drawStars();

    setInterval(() => {
        if (window.innerWidth < 480 && fireworks.length > 5) return; // limit on small screens
        fireworks.push(new Firework());
    }, 500);

    animate();
}

/* ===== RESIZE HANDLER ===== */
window.addEventListener('resize', () => {
    resize();
});
