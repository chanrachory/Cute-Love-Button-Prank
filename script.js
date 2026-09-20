/* ==========================================================================
   CUTE LOVE BUTTON PRANK — INTERACTIVE LOGIC & ANIMATIONS
   ========================================================================== */

(function () {
    'use strict';

    // --- State Variables ---
    let noCount = 0;
    let lastNoClick = 0;
    let isSoundEnabled = false;
    let audioCtx = null;

    // --- Reactions Configuration Array ---
    const reactions = [
        {
            count: 0,
            text: "Do you love me? 🥺💕",
            gif: "assets/cute-1.gif",
            noText: "💔 NO"
        },
        {
            count: 1,
            text: "Wait... what? 😳",
            gif: "assets/surprised.gif",
            noText: "😳 NO"
        },
        {
            count: 2,
            text: "Are you sure? 🥺",
            gif: "assets/confused.gif",
            noText: "🥺 REALLY?"
        },
        {
            count: 3,
            text: "Please don't say no... 🥹",
            gif: "assets/sad-1.gif",
            noText: "😭 PLEASE"
        },
        {
            count: 4,
            text: "You're breaking my heart 💔🥺",
            gif: "assets/sad-2.gif",
            noText: "💔 WHY?"
        },
        {
            count: 5,
            text: "Seriously?! 😭",
            gif: "assets/crying-1.gif",
            noText: "😭 REALLY?"
        },
        {
            count: 6,
            text: "Okay... I'm getting sad now. 🥲",
            gif: "assets/crying-2.gif",
            noText: "🥲 NO"
        },
        {
            count: 7,
            text: "How many times do I have to ask? 😭💔",
            gif: "assets/dramatic-1.gif",
            noText: "💔 WHY?!"
        },
        {
            count: 8,
            text: "Fine... I'll just sit here and suffer. 🥺",
            gif: "assets/dramatic-2.gif",
            noText: "🥺 PLEASE"
        },
        {
            count: 9,
            text: "Okay okay... I get it... 😭💔",
            gif: "assets/dramatic-3.gif",
            noText: "😭 STOP"
        }
    ];

    // --- DOM Elements ---
    const loveCard = document.getElementById('loveCard');
    const successCard = document.getElementById('successCard');
    const mainTitle = document.getElementById('mainTitle');
    const cuteGif = document.getElementById('cuteGif');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const replayBtn = document.getElementById('replayBtn');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const heartCanvas = document.getElementById('heartCanvas');
    const buttonsContainer = document.getElementById('buttonsContainer');

    // --- Web Audio API Synthesizer ---
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
            const notes = [523.25, 659.25, 783.99, 1046.50];
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

    // --- Reaction Logic & Helper Functions ---
    function getCurrentReaction() {
        let current = reactions[0];

        for (const reaction of reactions) {
            if (noCount >= reaction.count) {
                current = reaction;
            }
        }

        return current;
    }

    function updateYesButton() {
        const scale = Math.min(1 + noCount * 0.04, 1.35);

        yesBtn.style.transform = `scale(${scale})`;
    }

    function animateReactionChange() {
        mainTitle.classList.remove("reaction-change");
        cuteGif.classList.remove("reaction-change");

        void mainTitle.offsetWidth;
        void cuteGif.offsetWidth;

        mainTitle.classList.add("reaction-change");
        cuteGif.classList.add("reaction-change");
    }

    function updateReaction() {
        const reaction = getCurrentReaction();

        mainTitle.textContent = reaction.text;

        noBtn.textContent = reaction.noText;

        cuteGif.src = reaction.gif;

        updateYesButton();

        animateReactionChange();
    }

    function moveNoButton() {
        const rect = noBtn.getBoundingClientRect();

        const currentX = rect.left;
        const currentY = rect.top;

        const buttonWidth = rect.width;
        const buttonHeight = rect.height;

        const margin = 16;

        const minX = margin;
        const minY = margin;

        const maxX = window.innerWidth - buttonWidth - margin;
        const maxY = window.innerHeight - buttonHeight - margin;

        const cardRect = loveCard.getBoundingClientRect();
        const CARD_MIN_DISTANCE = 100; // Keep at least 100px away from loveCard

        const MIN_DISTANCE = 100;
        const MAX_DISTANCE = 200;

        let targetX = currentX;
        let targetY = currentY;
        let foundValid = false;

        for (let attempt = 0; attempt < 30; attempt++) {
            const angle = Math.random() * Math.PI * 2;

            const distance =
                MIN_DISTANCE +
                Math.random() *
                (MAX_DISTANCE - MIN_DISTANCE);

            const candidateX =
                currentX + Math.cos(angle) * distance;

            const candidateY =
                currentY + Math.sin(angle) * distance;

            if (
                candidateX >= minX &&
                candidateX <= maxX &&
                candidateY >= minY &&
                candidateY <= maxY
            ) {
                const candidateRect = {
                    left: candidateX,
                    top: candidateY,
                    right: candidateX + buttonWidth,
                    bottom: candidateY + buttonHeight
                };

                const overlapsCardWithMargin = !(
                    candidateRect.right < cardRect.left - CARD_MIN_DISTANCE ||
                    candidateRect.left > cardRect.right + CARD_MIN_DISTANCE ||
                    candidateRect.bottom < cardRect.top - CARD_MIN_DISTANCE ||
                    candidateRect.top > cardRect.bottom + CARD_MIN_DISTANCE
                );

                if (overlapsCardWithMargin) continue;

                targetX = candidateX;
                targetY = candidateY;
                foundValid = true;
                break;
            }
        }

        if (!foundValid) {
            for (let attempt = 0; attempt < 30; attempt++) {
                const candidateX = minX + Math.random() * Math.max(0, maxX - minX);
                const candidateY = minY + Math.random() * Math.max(0, maxY - minY);

                const candidateRect = {
                    left: candidateX,
                    top: candidateY,
                    right: candidateX + buttonWidth,
                    bottom: candidateY + buttonHeight
                };

                const overlapsCardWithMargin = !(
                    candidateRect.right < cardRect.left - CARD_MIN_DISTANCE ||
                    candidateRect.left > cardRect.right + CARD_MIN_DISTANCE ||
                    candidateRect.bottom < cardRect.top - CARD_MIN_DISTANCE ||
                    candidateRect.top > cardRect.bottom + CARD_MIN_DISTANCE
                );

                if (!overlapsCardWithMargin) {
                    targetX = candidateX;
                    targetY = candidateY;
                    foundValid = true;
                    break;
                }
            }
        }

        if (!foundValid) {
            for (let attempt = 0; attempt < 20; attempt++) {
                const candidateX = minX + Math.random() * Math.max(0, maxX - minX);
                const candidateY = minY + Math.random() * Math.max(0, maxY - minY);

                const candidateRect = {
                    left: candidateX,
                    top: candidateY,
                    right: candidateX + buttonWidth,
                    bottom: candidateY + buttonHeight
                };

                const overlapsCardDirectly = !(
                    candidateRect.right < cardRect.left ||
                    candidateRect.left > cardRect.right ||
                    candidateRect.bottom < cardRect.top ||
                    candidateRect.top > cardRect.bottom
                );

                if (!overlapsCardDirectly) {
                    targetX = candidateX;
                    targetY = candidateY;
                    foundValid = true;
                    break;
                }
            }
        }

        if (!foundValid) {
            targetX = Math.min(Math.max(currentX, minX), maxX);
            targetY = Math.min(Math.max(currentY, minY), maxY);
        }

        noBtn.style.position = "fixed";
        noBtn.style.left = `${targetX}px`;
        noBtn.style.top = `${targetY}px`;
    }

    function handleNoClick(event) {
        const now = Date.now();

        if (now - lastNoClick < 100) {
            return;
        }

        lastNoClick = now;

        initAudio();
        playPopSound();

        noCount++;

        updateReaction();

        if (noCount >= 9) {
            moveNoButton();
        }
    }

    function keepNoButtonInsideViewport() {
        if (noCount < 9) return;

        const rect = noBtn.getBoundingClientRect();

        const margin = 16;

        const maxX = Math.max(
            margin,
            window.innerWidth - rect.width - margin
        );

        const maxY = Math.max(
            margin,
            window.innerHeight - rect.height - margin
        );

        const x = Math.min(
            Math.max(rect.left, margin),
            maxX
        );

        const y = Math.min(
            Math.max(rect.top, margin),
            maxY
        );

        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
    }

    function handleNoEvasion() {
        if (noCount >= 9) {
            initAudio();
            playPopSound();
            moveNoButton();
        }
    }

    // --- Cursor Proximity Detection (Active only when noCount >= 9) ---
    document.addEventListener("mousemove", (e) => {
        if (noCount >= 9) {
            const rect = noBtn.getBoundingClientRect();
            const btnCenterX = rect.left + rect.width / 2;
            const btnCenterY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
            if (dist < 85) {
                handleNoEvasion();
            }
        }
    });

    // --- NO Button Event Listeners ---
    noBtn.addEventListener("click", handleNoClick);
    noBtn.addEventListener("pointerenter", handleNoEvasion);
    noBtn.addEventListener("pointerdown", (event) => {
        if (noCount >= 9) {
            event.preventDefault();
            handleNoEvasion();
        }
    });

    window.addEventListener("resize", keepNoButtonInsideViewport);

    // --- YES Button Click Handler ---
    yesBtn.addEventListener('click', handleYesClick);

    function handleYesClick() {
        initAudio();
        playVictorySound();

        loveCard.style.animation = 'cardDisappear 0.4s ease forwards';
        
        setTimeout(() => {
            loveCard.style.display = 'none';
            successCard.classList.remove('hidden');
            successCard.style.animation = 'cardAppear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
            
            launchConfetti();
        }, 400);
    }

    // --- Replay Handler ---
    replayBtn.addEventListener('click', resetGame);

    function resetGame() {
        noCount = 0;
        lastNoClick = 0;

        if (noBtn.parentElement !== buttonsContainer) {
            buttonsContainer.appendChild(noBtn);
        }
        noBtn.style.position = "";
        noBtn.style.left = "";
        noBtn.style.top = "";

        yesBtn.style.transform = 'scale(1)';

        successCard.classList.add('hidden');
        loveCard.style.display = 'flex';
        loveCard.style.animation = 'cardAppear 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

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
        keepNoButtonInsideViewport();
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
