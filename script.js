// Configuration
const DISPLAY_PHRASE = "WILL YOU BE MY VALENTINE";
const UNIQUE_LETTERS = new Set(DISPLAY_PHRASE.replace(/ /g, '').split(''));
const keyboard_layout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

// State
let gameState = 'playing';
let guessedLetters = new Set();
let letterPositions = new Map();
let wrongGuesses = 0;
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let mouseParticles = [];
let backgroundParticles = [];
let carouselItems = [];
let confettiParticles = [];

// Hangman parts order
const hangmanParts = ['hm-head', 'hm-body', 'hm-larm', 'hm-rarm', 'hm-lleg', 'hm-rleg'];

// Elements
const wordDisplay = document.getElementById('word-display');
const wordDisplayContainer = document.getElementById('word-display-container');
const keyboardDiv = document.getElementById('keyboard');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const questionOverlay = document.getElementById('question-overlay');
const namePrefix = document.getElementById('name-prefix');
const celebrationScreen = document.getElementById('celebration-screen');

// Canvases
const mouseCanvas = document.getElementById('mouse-particles-canvas');
const bgCanvas = document.getElementById('background-canvas');
const spotlightCanvas = document.getElementById('spotlight-canvas');
const confettiCanvas = document.getElementById('confetti-canvas');

// Load images
const images = {
    heart: new Image(),
    lily: new Image(),
    pic1: new Image(),
    pic2: new Image(),
    pic3: new Image()
};

images.heart.src = 'pics/hrt_nobg.png';
images.lily.src = 'pics/lily_nobg.png';
images.pic1.src = 'pics/1.png';
images.pic2.src = 'pics/2.png';
images.pic3.src = 'pics/3.png';

// Setup canvases
function setupCanvases() {
    [mouseCanvas, bgCanvas, spotlightCanvas, confettiCanvas].forEach(canvas => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
}

setupCanvases();

// Initialize game
function initGame() {
    createWordDisplay();
    createKeyboard();
    setupMouseTracking();
    requestAnimationFrame(mainLoop);
}

// Create word display
function createWordDisplay() {
    const words = DISPLAY_PHRASE.split(' ');
    
    words.forEach((word, wordIndex) => {
        const wordGroup = document.createElement('div');
        wordGroup.className = 'word-group';
        
        for (let i = 0; i < word.length; i++) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            box.dataset.letter = word[i];
            
            if (!letterPositions.has(word[i])) {
                letterPositions.set(word[i], []);
            }
            letterPositions.get(word[i]).push(box);
            
            wordGroup.appendChild(box);
        }
        
        wordDisplay.appendChild(wordGroup);
        
        if (wordIndex < words.length - 1) {
            const space = document.createElement('div');
            space.className = 'letter-box space';
            wordDisplay.appendChild(space);
        }
    });
}

// Create keyboard
function createKeyboard() {
    keyboard_layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyButton = document.createElement('button');
            keyButton.className = 'key';
            keyButton.textContent = key;
            keyButton.dataset.key = key;
            
            if (key === 'ENTER' || key === 'BACK') {
                keyButton.classList.add('wide');
            }
            
            keyButton.addEventListener('click', () => handleKeyPress(key));
            rowDiv.appendChild(keyButton);
        });
        
        keyboardDiv.appendChild(rowDiv);
    });
}

// Handle key press
function handleKeyPress(key) {
    if (gameState !== 'playing') return;
    
    if (key === 'ENTER' || key === 'BACK') {
        return;
    }
    
    if (key.length === 1 && /^[A-Z]$/.test(key)) {
        checkLetter(key);
    }
}

// Check letter
function checkLetter(letter) {
    if (guessedLetters.has(letter)) return;
    
    guessedLetters.add(letter);
    const keyElement = document.querySelector(`[data-key="${letter}"]`);
    
    if (letterPositions.has(letter)) {
        keyElement.classList.add('correct');
        const boxes = letterPositions.get(letter);
        
        boxes.forEach((box, i) => {
            setTimeout(() => {
                box.textContent = letter;
                box.classList.add('filled');
            }, i * 100);
        });
        
        setTimeout(checkCompletion, boxes.length * 100 + 200);
    } else {
        keyElement.classList.add('wrong');
        wrongGuesses++;
        document.getElementById('wrong-counter').textContent = wrongGuesses;
        
        if (wrongGuesses <= 6) {
            document.getElementById(hangmanParts[wrongGuesses - 1]).classList.add('visible');
        }
    }
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    
    const key = e.key.toUpperCase();
    
    if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
    }
});

// Check completion
function checkCompletion() {
    const allFilled = Array.from(document.querySelectorAll('.letter-box:not(.space)'))
        .every(box => box.classList.contains('filled'));
    
    if (allFilled) {
        gameState = 'transitioning';
        startTransition();
    }
}

// Start transition to romantic mode
function startTransition() {
    // Immediately start color change
    document.body.classList.add('colored');
    
    // Flash effect on completion
    document.querySelectorAll('.letter-box.filled').forEach((box, i) => {
        box.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            box.classList.add('pink');
        }, i * 30);
    });
    
    // Hide website elements
    setTimeout(() => {
        document.getElementById('site-header').classList.add('hidden');
        document.getElementById('main-content').classList.add('transitioning');
    }, 300);
    
    // Move word display to center
    setTimeout(() => {
        wordDisplayContainer.classList.add('centered');
        wordDisplay.classList.add('large');
        
        // Add floating animation to each letter
        document.querySelectorAll('.letter-box:not(.space)').forEach((box, i) => {
            box.classList.add('floating');
            box.style.animationDelay = `${i * 0.1}s`;
        });
    }, 800);
    
    // Start background effects
    setTimeout(() => {
        bgCanvas.classList.add('visible');
        mouseCanvas.classList.add('visible');
        startBackgroundParticles();
        startCarousel();
    }, 1200);
    
    // Show name and buttons
    setTimeout(() => {
        questionOverlay.classList.add('visible');
        namePrefix.classList.add('visible');
        
        startSpotlight();
    }, 2000);
    
    // Show buttons
    setTimeout(() => {
        document.querySelector('.button-container').classList.add('visible');
        positionButtons();
        setupNoButtonRepel();
        gameState = 'revealed';
    }, 3000);
}

// Position buttons
function positionButtons() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 + 200;
    
    yesButton.style.position = 'fixed';
    yesButton.style.left = (centerX - 180) + 'px';
    yesButton.style.top = centerY + 'px';
    
    noButton.style.left = (centerX + 30) + 'px';
    noButton.style.top = centerY + 'px';
}

// Setup no button repel - MUCH more sensitive
function setupNoButtonRepel() {
    const repelRadius = 250; // Increased radius
    const repelStrength = 40; // Stronger repulsion
    
    document.addEventListener('mousemove', (e) => {
        if (gameState !== 'revealed') return;
        
        const noRect = noButton.getBoundingClientRect();
        const noCenterX = noRect.left + noRect.width / 2;
        const noCenterY = noRect.top + noRect.height / 2;
        
        const dx = e.clientX - noCenterX;
        const dy = e.clientY - noCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < repelRadius) {
            const angle = Math.atan2(dy, dx);
            const force = Math.pow((repelRadius - distance) / repelRadius, 0.5); // Stronger curve
            
            let currentLeft = parseFloat(noButton.style.left) || (window.innerWidth / 2 + 30);
            let currentTop = parseFloat(noButton.style.top) || (window.innerHeight / 2 + 200);
            
            let newLeft = currentLeft - Math.cos(angle) * force * repelStrength;
            let newTop = currentTop - Math.sin(angle) * force * repelStrength;
            
            // Keep within bounds with padding
            const padding = 80;
            const maxX = window.innerWidth - noButton.offsetWidth - padding;
            const maxY = window.innerHeight - noButton.offsetHeight - padding;
            
            newLeft = Math.max(padding, Math.min(maxX, newLeft));
            newTop = Math.max(padding, Math.min(maxY, newTop));
            
            noButton.style.left = newLeft + 'px';
            noButton.style.top = newTop + 'px';
        }
    });
}

// Yes button handler
yesButton.addEventListener('click', () => {
    gameState = 'celebration';
    questionOverlay.style.opacity = '0';
    wordDisplayContainer.style.opacity = '0';
    
    setTimeout(() => {
        celebrationScreen.classList.add('active');
        startCelebration();
    }, 500);
});

// Mouse tracking
function setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    });
}

// Main animation loop
function mainLoop() {
    drawMouseParticles();
    drawBackgroundParticles();
    drawCarousel();
    drawSpotlight();
    drawConfetti();
    
    requestAnimationFrame(mainLoop);
}

// Mouse particles
function drawMouseParticles() {
    const ctx = mouseCanvas.getContext('2d');
    ctx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
    
    if (gameState === 'revealed' || gameState === 'celebration') {
        // Create new particles
        for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            
            mouseParticles.push({
                x: mousePos.x,
                y: mousePos.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: Math.random() * 2 + 1
            });
        }
        
        // Update and draw
        mouseParticles = mouseParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            
            if (p.life <= 0) return false;
            
            ctx.globalAlpha = p.life * 0.8;
            ctx.strokeStyle = '#ffc9f8';
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 8, p.y + p.vy * 8);
            ctx.stroke();
            
            return true;
        });
        
        ctx.globalAlpha = 1;
    }
}

// Background particles
let bgParticlesStarted = false;
function startBackgroundParticles() {
    if (bgParticlesStarted) return;
    bgParticlesStarted = true;
    
    for (let i = 0; i < 200; i++) {
        backgroundParticles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function drawBackgroundParticles() {
    if (gameState === 'playing') return;
    
    const ctx = bgCanvas.getContext('2d');
    
    backgroundParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = bgCanvas.width;
        if (p.x > bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = bgCanvas.height;
        if (p.y > bgCanvas.height) p.y = 0;
        
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
}

// Carousel - much bigger images, more hearts/lilies
let carouselStarted = false;
let carouselRotation = 0;

function startCarousel() {
    if (carouselStarted) return;
    carouselStarted = true;
    
    // Create 3 carousel rings with more items
    const rings = [
        { radius: 350, count: 12, speed: 1 },
        { radius: 500, count: 15, speed: 0.7 },
        { radius: 650, count: 18, speed: 0.5 }
    ];
    
    rings.forEach((ring, ringIndex) => {
        for (let i = 0; i < ring.count; i++) {
            let img;
            // More hearts and lilies - every other item
            if (i % 2 === 0) {
                img = Math.random() > 0.5 ? images.heart : images.lily;
            } else {
                const pics = [images.pic1, images.pic2, images.pic3];
                img = pics[i % 3];
            }
            
            carouselItems.push({
                img: img,
                angle: (i / ring.count) * Math.PI * 2,
                radius: ring.radius,
                speed: ring.speed,
                decorative: img === images.heart || img === images.lily,
                offset: Math.random() * Math.PI * 2,
                ringIndex: ringIndex
            });
        }
    });
}

function drawCarousel() {
    if (gameState === 'playing' || !carouselStarted) return;
    
    const ctx = bgCanvas.getContext('2d');
    const centerX = bgCanvas.width / 2;
    const centerY = bgCanvas.height / 2;
    
    carouselRotation += 0.003;
    
    carouselItems.forEach((item, index) => {
        const angle = item.angle + carouselRotation * item.speed;
        const wobble = Math.sin(carouselRotation * 3 + item.offset) * 40;
        const radius = item.radius + wobble;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const scale = 0.8 + Math.sin(angle) * 0.2;
        // 2x bigger images
        const size = item.decorative ? 120 : 240;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle * 0.3);
        ctx.globalAlpha = 0.5 + Math.sin(carouselRotation + index) * 0.2;
        
        ctx.shadowColor = '#ffc9f8';
        ctx.shadowBlur = 20;
        
        ctx.drawImage(
            item.img,
            -size * scale / 2,
            -size * scale / 2,
            size * scale,
            size * scale
        );
        
        ctx.restore();
    });
}

// Spotlight effect
let spotlightIntensity = 0;
let spotlightStarted = false;

function startSpotlight() {
    spotlightStarted = true;
    spotlightCanvas.classList.add('visible');
}

function drawSpotlight() {
    if (!spotlightStarted || gameState === 'playing') return;
    
    const ctx = spotlightCanvas.getContext('2d');
    ctx.clearRect(0, 0, spotlightCanvas.width, spotlightCanvas.height);
    
    if (spotlightIntensity < 1) spotlightIntensity += 0.015;
    
    const centerX = spotlightCanvas.width / 2;
    const centerY = spotlightCanvas.height / 2 - 50;
    
    // Cone spotlight effect
    const gradient = ctx.createRadialGradient(centerX, centerY - 200, 0, centerX, centerY, 500);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * spotlightIntensity})`);
    gradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.3 * spotlightIntensity})`);
    gradient.addColorStop(0.6, `rgba(255, 255, 255, ${0.1 * spotlightIntensity})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 300);
    ctx.lineTo(centerX - 400, centerY + 300);
    ctx.lineTo(centerX + 400, centerY + 300);
    ctx.closePath();
    ctx.fill();
}

// Confetti celebration - hearts and lilies with zooming background
let celebrationStarted = false;
let bgZoom = 1;
let bgHue = 0;

function startCelebration() {
    celebrationStarted = true;
    
    // Create lots of confetti particles
    for (let i = 0; i < 150; i++) {
        confettiParticles.push(createConfetti());
    }
}

function createConfetti() {
    return {
        x: Math.random() * confettiCanvas.width,
        y: -100 - Math.random() * 500,
        img: Math.random() > 0.5 ? images.heart : images.lily,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 6 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        scale: Math.random() * 0.6 + 0.4,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.1 + 0.05
    };
}

function drawConfetti() {
    if (!celebrationStarted) return;
    
    const ctx = confettiCanvas.getContext('2d');
    
    // Zooming color-changing background
    bgZoom += 0.001;
    bgHue = (bgHue + 0.5) % 360;
    
    // Draw animated background
    const gradient = ctx.createRadialGradient(
        confettiCanvas.width / 2, confettiCanvas.height / 2, 0,
        confettiCanvas.width / 2, confettiCanvas.height / 2, confettiCanvas.width * bgZoom
    );
    
    const h1 = bgHue;
    const h2 = (bgHue + 30) % 360;
    const h3 = (bgHue + 60) % 360;
    
    gradient.addColorStop(0, `hsl(${h1}, 100%, 90%)`);
    gradient.addColorStop(0.5, `hsl(${h2}, 80%, 80%)`);
    gradient.addColorStop(1, `hsl(${h3}, 70%, 70%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    // Draw confetti
    confettiParticles.forEach((p, index) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobblePhase) * 3;
        p.wobblePhase += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99; // Slow down horizontal
        
        // Reset if off screen
        if (p.y > confettiCanvas.height + 100) {
            confettiParticles[index] = createConfetti();
            confettiParticles[index].y = -50;
        }
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = 0.9;
        
        const size = 80 * p.scale;
        ctx.drawImage(p.img, -size / 2, -size / 2, size, size);
        
        ctx.restore();
    });
    
    // Add more confetti over time
    if (confettiParticles.length < 250 && Math.random() < 0.1) {
        confettiParticles.push(createConfetti());
    }
}

// Handle resize
window.addEventListener('resize', () => {
    setupCanvases();
    if (gameState === 'revealed') {
        positionButtons();
    }
});

// Initialize
initGame();
