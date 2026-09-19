/* ==========================================================================
   CUTE LOVE BUTTON PRANK — INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

(function () {
    'use strict';

    // --- State Variables ---
    let noCount = 0;
    let isSoundEnabled = false;
    let audioCtx = null;
    let lastMoveTime = 0;
    const MOVE_COOLDOWN = 220; // ms between evasive moves
    let currentCursorPos = { x: -1000, y: -1000 };

    // --- Reactions Configuration Array ---
    const reactions = [
        {
            count: 0,
            text: "Do you love me? 💕",
            sub: "Please answer honestly! 🥰",
            gif: "assets/cute-1.gif",
            noText: "💔 NO",
            emoji: "🥺💕"
        },
        {
            count: 1,
            text: "Wait... what? 😳",
            sub: "Did you just try to click no?",
            gif: "assets/surprised.gif",
            noText: "😳 NO",
            emoji: "😳❓"
        },
        {
            count: 2,
            text: "Are you sure? 🥺",
            sub: "Think about it again...",
            gif: "assets/confused.gif",
            noText: "🥺 NO",
            emoji: "🥺💔"
        },
        {
            count: 3,
            text: "Please don't say no... 🥹",
            sub: "My heart can't take this!",
            gif: "assets/sad-1.gif",
            noText: "😭 PLEASE DON'T",
            emoji: "🥹💔"
        },
        {
            count: 4,
            text: "You're breaking my heart 💔🥺",
            sub: "Why are you doing this to me?",
            gif: "assets/sad-2.gif",
            noText: "💔 WAIT",
            emoji: "💔😭"
        },
        {
            count: 5,
            text: "Seriously?! 😭",
            sub: "Look how sad I am now...",
            gif: "assets/crying-1.gif",
            noText: "🥺 REALLY?",
            emoji: "😭💧"
        },
        {
            count: 6,
            text: "Okay... I'm getting sad now. 🥲",
            sub: "Just click YES already!",
            gif: "assets/crying-2.gif",
            noText: "🥲 WHY ME",
            emoji: "🥲💔"
        },
        {
            count: 7,
            text: "How many times do I have to ask? 😭💔",
            sub: "Stop running away from love!",
            gif: "assets/dramatic-1.gif",
            noText: "💔 WHY?!",
            emoji: "😭⚡"
        },
        {
            count: 8,
            text: "Fine... I'll just sit here and suffer. 🥺",
            sub: "Look how big the YES button is!",
            gif: "assets/dramatic-2.gif",
            noText: "🥺 PLEASE",
            emoji: "🥺💧"
        },
        {
            count: 9,
            text: "Okay okay... I get it... 😭💔",
            sub: "You HAVE to click YES now!",
            gif: "assets/dramatic-3.gif",
            noText: "😭 STOP HURTING ME",
            emoji: "😭😭"
        }
    ];

    // --- DOM Elements ---
    const loveCard = document.getElementById('loveCard');
    const successCard = document.getElementById('successCard');
    const mainTitle = document.getElementById('mainTitle');
    const subTitle = document.getElementById('subTitle');
    const cuteGif = document.getElementById('cuteGif');
    const gifSpinner = document.getElementById('gifSpinner');
    const fallbackEmoji = document.getElementById('fallbackEmoji');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const noBtnText = document.getElementById('noBtnText');
    const replayBtn = document.getElementById('replayBtn');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const heartCanvas = document.getElementById('heartCanvas');

    // --- Image Handling & Error Fallback ---
    cuteGif.addEventListener('load', () => {
        gifSpinner.style.display = 'none';
        cuteGif.style.opacity = '1';
        fallbackEmoji.style.display = 'none';
    });

    cuteGif.addEventListener('error', () => {
        gifSpinner.style.display = 'none';
        cuteGif.style.display = 'none';
        fallbackEmoji.style.display = 'block';
    });

    function setGifSource(src, fallbackText) {
        gifSpinner.style.display = 'block';
        cuteGif.style.opacity = '0';
        fallbackEmoji.textContent = fallbackText || '🥺💕';
        cuteGif.src = src;
    }

    // --- Web Audio API Synthesizer (No external audio files required!) ---
    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playPopSound() {
        if (!isSoundEnabled || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            const now = audioCtx.currentTime;
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.error('Audio play error:', e);
        }
    }

    function playVictorySound() {
        if (!isSoundEnabled || !audioCtx) return;
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const now = audioCtx.currentTime;
            notes.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                const noteTime = now + index * 0.12;
                osc.frequency.setValueAtTime(freq, noteTime);
                gain.gain.setValueAtTime(0.2, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.35);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + 0.35);
            });
        } catch (e) {
            console.error('Victory audio error:', e);
        }
    }

    // --- Sound Toggle ---
    soundToggleBtn.addEventListener('click', () => {
        initAudio();
        isSoundEnabled = !isSoundEnabled;
        const icon = soundToggleBtn.querySelector('.sound-icon');
        const label = soundToggleBtn.querySelector('.sound-label');
        if (isSoundEnabled) {
            icon.textContent = '🔊';
            label.textContent = 'Sound ON';
            playPopSound();
        } else {
            icon.textContent = '🔇';
            label.textContent = 'Sound OFF';
        }
    });

    // --- NO Button Evasion Movement Algorithm ---
    function moveNoButton() {
        const now = Date.now();
        if (now - lastMoveTime < MOVE_COOLDOWN) return;
        lastMoveTime = now;

        initAudio();
        playPopSound();

        // 1. Increment attempt counter & update reaction text FIRST so button width is accurate
        noCount++;
        updateReaction();

        // 2. Ensure escaped class is applied for measurement
        if (!noBtn.classList.contains('escaped')) {
            noBtn.classList.add('escaped');
        }

        // 3. Measure accurate rendered button size (including padding, border, text)
        const rect = noBtn.getBoundingClientRect();
        const btnWidth = rect.width || 120;
        const btnHeight = rect.height || 48;
        const margin = 16; // Safe padding from screen edge

        // 4. Calculate strict viewport boundaries
        const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
        const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);

        const minX = margin;
        const maxX = Math.max(margin, viewportWidth - btnWidth - margin);
        const minY = margin;
        const maxY = Math.max(margin, viewportHeight - btnHeight - margin);

        let newX = minX + Math.random() * (maxX - minX);
        let newY = minY + Math.random() * (maxY - minY);

        // 5. Avoid placing too close to current cursor position
        if (currentCursorPos.x > 0 && currentCursorPos.y > 0) {
            for (let i = 0; i < 10; i++) {
                const dist = Math.hypot(newX - currentCursorPos.x, newY - currentCursorPos.y);
                if (dist > 120) break; // Safe distance from cursor
                newX = minX + Math.random() * (maxX - minX);
                newY = minY + Math.random() * (maxY - minY);
            }
        }

        // 6. Strictly clamp to safe screen boundaries
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        // 7. Apply absolute pixel coordinates
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
    }

    // --- Update Reaction & YES Button Scale ---
    function updateReaction() {
        // Select reaction state matching noCount
        const index = Math.min(noCount, reactions.length - 1);
        const state = reactions[index];

        // Animate text change
        mainTitle.textContent = state.text;
        subTitle.textContent = state.sub;
        noBtnText.textContent = state.noText.replace(/^[^\s]+\s*/, ''); // Keep clean text

        // Update GIF
        setGifSource(state.gif, state.emoji);

        // Dynamically Scale Up YES Button
        const baseScale = 1;
        const scaleStep = 0.16;
        const currentScale = Math.min(1 + noCount * scaleStep, 2.5); // Cap at 2.5x
        
        yesBtn.style.transform = `scale(${currentScale})`;
        
        if (noCount >= 4) {
            yesBtn.classList.add('super-pulse');
        } else {
            yesBtn.classList.remove('super-pulse');
        }
    }

    // --- Cursor Proximity Detection for Desktop ---
    document.addEventListener('mousemove', (e) => {
        currentCursorPos.x = e.clientX;
        currentCursorPos.y = e.clientY;

        const rect = noBtn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

        // Trigger evasion if cursor gets closer than 85px
        if (dist < 85) {
            moveNoButton();
        }
    });

    // --- NO Button Interactive Triggers ---
    noBtn.addEventListener('mouseenter', moveNoButton);
    noBtn.addEventListener('mouseover', moveNoButton);
    
    // Mobile Touch & Click handlers
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveNoButton();
    }, { passive: false });

    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        moveNoButton();
    });

    // --- YES Button Click Handler ---
    yesBtn.addEventListener('click', handleYesClick);

    function handleYesClick() {
        initAudio();
        playVictorySound();

        // Switch to Celebration Screen
        loveCard.style.animation = 'cardDisappear 0.4s ease forwards';
        
        setTimeout(() => {
            loveCard.style.display = 'none';
            successCard.classList.remove('hidden');
            successCard.style.animation = 'cardAppear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
            
            // Trigger Confetti Celebration
            launchConfetti();
        }, 400);
    }

    // --- Replay Handler ---
    replayBtn.addEventListener('click', resetGame);

    function resetGame() {
        noCount = 0;

        // Reset NO button
        noBtn.classList.remove('escaped');
        noBtn.style.left = '';
        noBtn.style.top = '';

        // Reset YES button scale
        yesBtn.style.transform = 'scale(1)';
        yesBtn.classList.remove('super-pulse');

        // Reset Card Display
        successCard.classList.add('hidden');
        loveCard.style.display = 'flex';
        loveCard.style.animation = 'cardAppear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

        // Reset initial state
        updateReaction();
    }

    // --- Floating Hearts Background Canvas ---
    let ctx = heartCanvas.getContext('2d');
    let hearts = [];

    function resizeCanvas() {
        heartCanvas.width = window.innerWidth;
        heartCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        // If NO button is escaped, keep it safe on resize
        if (noBtn.classList.contains('escaped')) {
            const rect = noBtn.getBoundingClientRect();
            const btnWidth = rect.width || 120;
            const btnHeight = rect.height || 48;
            const margin = 16;
            const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
            const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
            const maxX = Math.max(margin, viewportWidth - btnWidth - margin);
            const maxY = Math.max(margin, viewportHeight - btnHeight - margin);
            let currentX = parseFloat(noBtn.style.left) || margin;
            let currentY = parseFloat(noBtn.style.top) || margin;
            currentX = Math.max(margin, Math.min(currentX, maxX));
            currentY = Math.max(margin, Math.min(currentY, maxY));
            noBtn.style.left = `${currentX}px`;
            noBtn.style.top = `${currentY}px`;
        }
    });

    resizeCanvas();

    class HeartParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * heartCanvas.width;
            this.y = heartCanvas.height + 20 + Math.random() * 50;
            this.size = 12 + Math.random() * 16;
            this.speedY = 0.8 + Math.random() * 1.5;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.opacity = 0.2 + Math.random() * 0.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.02;
        }

        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.y * 0.02) * 0.6;
            this.rotation += this.rotSpeed;
            if (this.y < -30) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ff477e';
            ctx.font = `${this.size}px sans-serif`;
            ctx.fillText('❤️', -this.size / 2, this.size / 2);
            ctx.restore();
        }
    }

    // Initialize 25 floating background hearts
    for (let i = 0; i < 25; i++) {
        const heart = new HeartParticle();
        heart.y = Math.random() * heartCanvas.height;
        hearts.push(heart);
    }

    function animateHearts() {
        ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
        hearts.forEach(h => {
            h.update();
            h.draw();
        });
        requestAnimationFrame(animateHearts);
    }

    animateHearts();

    // --- Pure JS Canvas Confetti System ---
    let confettiParticles = [];
    let confettiAnimationId = null;

    function launchConfetti() {
        confettiParticles = [];
        const colors = ['#ff477e', '#ff7eb3', '#a1c4fd', '#ffd166', '#06d6a0', '#ffffff'];

        for (let i = 0; i < 120; i++) {
            confettiParticles.push({
                x: heartCanvas.width / 2,
                y: heartCanvas.height / 2 - 50,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.8) * 18,
                size: 6 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                gravity: 0.35,
                shape: Math.random() > 0.4 ? 'circle' : 'heart'
            });
        }

        function drawConfetti() {
            let active = false;
            confettiParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.rotSpeed;
                p.opacity -= 0.008;

                if (p.opacity > 0) {
                    active = true;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = Math.max(0, p.opacity);

                    if (p.shape === 'heart') {
                        ctx.fillStyle = p.color;
                        ctx.font = `${p.size * 1.5}px sans-serif`;
                        ctx.fillText('💕', -p.size, p.size);
                    } else {
                        ctx.fillStyle = p.color;
                        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    }
                    ctx.restore();
                }
            });

            if (active) {
                confettiAnimationId = requestAnimationFrame(drawConfetti);
            }
        }

        if (confettiAnimationId) {
            cancelAnimationFrame(confettiAnimationId);
        }
        drawConfetti();
    }

    // --- Keyframe Animation Helper ---
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes cardDisappear {
            to {
                opacity: 0;
                transform: scale(0.85) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(styleSheet);

})();
