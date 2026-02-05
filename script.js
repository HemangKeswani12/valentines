// Configuration
const DISPLAY_PHRASE = "WILL YOU BE MY VALENTINE";
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
let physicsObjects = [];

// Hangman parts
const hangmanParts = ['hm-head', 'hm-body', 'hm-larm', 'hm-rarm', 'hm-lleg', 'hm-rleg'];

// Elements
const wordDisplay = document.getElementById('word-display');
const wordDisplayWrapper = document.getElementById('word-display-wrapper');
const keyboardDiv = document.getElementById('keyboard');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const buttonContainer = document.getElementById('button-container');
const namePrefix = document.getElementById('name-prefix');
const gameScreen = document.getElementById('game-screen');

// Canvases
const mouseCanvas = document.getElementById('mouse-particles-canvas');
const bgCanvas = document.getElementById('background-canvas');
const spotlightCanvas = document.getElementById('spotlight-canvas');
const physicsCanvas = document.getElementById('physics-canvas');

// Load images
const images = {
    heart: new Image(),
    lily: new Image(),
    pic1: new Image(),
    pic2: new Image(),
    pic3: new Image()
};

// Use paths without ./
images.heart.src = 'pics/hrt_nobg.png';
images.lily.src = 'pics/lily_nobg.png';
images.pic1.src = 'pics/1.png';
images.pic2.src = 'pics/2.png';
images.pic3.src = 'pics/3.png';

// Log when images load
let imagesLoaded = 0;
const totalImages = 5;
Object.values(images).forEach((img, i) => {
    img.onload = () => {
        imagesLoaded++;
        console.log(`Image ${i + 1} loaded, total: ${imagesLoaded}/${totalImages}`);
    };
    img.onerror = () => {
        console.error(`Failed to load image: ${img.src}`);
    };
});

// Setup canvases
function setupCanvases() {
    [mouseCanvas, bgCanvas, spotlightCanvas, physicsCanvas].forEach(canvas => {
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

// Create word display with question mark box at the end
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
        
        // Add question mark box after "VALENTINE"
        if (wordIndex === words.length - 1) {
            const qBox = document.createElement('div');
            qBox.className = 'letter-box question-mark';
            qBox.id = 'question-mark-box';
            qBox.textContent = '?';
            wordGroup.appendChild(qBox);
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
    
    if (key === 'ENTER' || key === 'BACK') return;
    
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
    const allFilled = Array.from(document.querySelectorAll('.letter-box:not(.space):not(.question-mark)'))
        .every(box => box.classList.contains('filled'));
    
    if (allFilled) {
        gameState = 'transitioning';
        startTransition();
    }
}

// Start transition
function startTransition() {
    // Change background immediately
    document.body.classList.add('colored');
    
    // Transform letters to pink
    document.querySelectorAll('.letter-box.filled').forEach((box, i) => {
        setTimeout(() => {
            box.classList.add('pink');
        }, i * 20);
    });
    
    // Hide website clutter
    setTimeout(() => {
        document.getElementById('site-header').classList.add('hidden');
        document.getElementById('main-content').classList.add('hidden');
    }, 200);
    
    // Center the game area and show name
    setTimeout(() => {
        gameScreen.classList.add('centered');
        wordDisplayWrapper.classList.add('centered');
        wordDisplay.classList.add('large');
        
        // Show name ABOVE the question
        namePrefix.classList.add('visible');
        
        // Add floating to letters
        document.querySelectorAll('.letter-box:not(.space)').forEach((box, i) => {
            box.classList.add('floating');
            box.style.animationDelay = `${i * 0.08}s`;
        });
    }, 600);
    
    // Start visual effects
    setTimeout(() => {
        console.log('Starting visual effects...');
        bgCanvas.classList.add('visible');
        bgCanvas.style.opacity = '1';
        mouseCanvas.classList.add('visible');
        mouseCanvas.style.opacity = '1';
        startBackgroundParticles();
        startCarousel();
        startSpotlight();
    }, 1000);
    
    // Show question mark (pops in to the RIGHT of valentine)
    setTimeout(() => {
        const qBox = document.getElementById('question-mark-box');
        qBox.classList.add('pink');
        qBox.classList.add('visible');
    }, 1500);
    
    // Show buttons
    setTimeout(() => {
        positionButtons();
        buttonContainer.classList.add('visible');
        setupNoButtonRepel();
        gameState = 'revealed';
    }, 2200);
}

// Position buttons below the question
function positionButtons() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 + 180;
    
    buttonContainer.style.left = (centerX - 150) + 'px';
    buttonContainer.style.top = centerY + 'px';
    
    noButton.style.left = (centerX + 50) + 'px';
    noButton.style.top = centerY + 'px';
}

// No button repulsion
function setupNoButtonRepel() {
    const repelRadius = 250;
    const repelStrength = 50;
    
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
            const force = Math.pow((repelRadius - distance) / repelRadius, 0.5);
            
            let currentLeft = parseFloat(noButton.style.left) || (window.innerWidth / 2 + 50);
            let currentTop = parseFloat(noButton.style.top) || (window.innerHeight / 2 + 180);
            
            let newLeft = currentLeft - Math.cos(angle) * force * repelStrength;
            let newTop = currentTop - Math.sin(angle) * force * repelStrength;
            
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

// YES button click - trigger physics flood over existing page
yesButton.addEventListener('click', function() {
    console.log('YES clicked!');
    gameState = 'celebration';
    
    // Hide only the buttons
    buttonContainer.style.display = 'none';
    
    // Show physics canvas (transparent background - overlays existing page)
    physicsCanvas.classList.add('visible');
    physicsCanvas.style.opacity = '1';
    startPhysicsFlood();
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
    drawBackgroundAndCarousel();
    drawSpotlight();
    updatePhysics();
    
    requestAnimationFrame(mainLoop);
}

// Mouse particles - DARK PINK
function drawMouseParticles() {
    const ctx = mouseCanvas.getContext('2d');
    ctx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
    
    if (gameState === 'revealed' || gameState === 'celebration') {
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
        
        mouseParticles = mouseParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            
            if (p.life <= 0) return false;
            
            ctx.globalAlpha = p.life * 0.8;
            ctx.strokeStyle = '#c71585';
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

// Background and carousel
let bgStarted = false;
let carouselStarted = false;
let carouselRotation = 0;

function startBackgroundParticles() {
    if (bgStarted) return;
    bgStarted = true;
    
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

function startCarousel() {
    if (carouselStarted) return;
    carouselStarted = true;
    console.log('Starting carousel with images loaded:', imagesLoaded);
    
    const rings = [
        { radius: 300, count: 8, speed: 1 },
        { radius: 450, count: 10, speed: 0.7 },
        { radius: 600, count: 12, speed: 0.5 }
    ];
    
    rings.forEach((ring) => {
        for (let i = 0; i < ring.count; i++) {
            let img;
            // Alternate between pics and decorative
            if (i % 3 === 0) {
                img = images.pic1;
            } else if (i % 3 === 1) {
                img = Math.random() > 0.5 ? images.heart : images.lily;
            } else {
                img = i % 2 === 0 ? images.pic2 : images.pic3;
            }
            
            carouselItems.push({
                img: img,
                angle: (i / ring.count) * Math.PI * 2,
                radius: ring.radius,
                speed: ring.speed,
                decorative: img === images.heart || img === images.lily,
                offset: Math.random() * Math.PI * 2
            });
        }
    });
    console.log('Carousel items created:', carouselItems.length);
}

function drawBackgroundAndCarousel() {
    if (gameState === 'playing') return;
    
    const ctx = bgCanvas.getContext('2d');
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Background particles
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
    
    // Carousel
    if (carouselStarted && carouselItems.length > 0) {
        const centerX = bgCanvas.width / 2;
        const centerY = bgCanvas.height / 2;
        
        carouselRotation += 0.002;
        
        carouselItems.forEach((item, index) => {
            // Skip if image not loaded
            if (!item.img || !item.img.complete || item.img.naturalWidth === 0) return;
            
            const angle = item.angle + carouselRotation * item.speed;
            const wobble = Math.sin(carouselRotation * 3 + item.offset) * 30;
            const radius = item.radius + wobble;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const scale = 0.7 + Math.sin(angle) * 0.2;
            const size = item.decorative ? 100 : 180;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle * 0.2);
            ctx.globalAlpha = 0.6 + Math.sin(carouselRotation + index) * 0.2;
            ctx.shadowColor = '#ffc9f8';
            ctx.shadowBlur = 15;
            
            try {
                ctx.drawImage(item.img, -size * scale / 2, -size * scale / 2, size * scale, size * scale);
            } catch (e) {
                // Image not ready yet
            }
            
            ctx.restore();
        });
    }
    
    ctx.globalAlpha = 1;
}

// Spotlight
let spotlightStarted = false;
let spotlightIntensity = 0;

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

// ========== PHYSICS ENGINE ==========
let physicsStarted = false;
const GRAVITY = 0.3;
const BOUNCE = 0.15;
const FRICTION = 0.98;
const DAMPING = 0.95;

function startPhysicsFlood() {
    console.log('Starting physics flood!');
    physicsStarted = true;
    
    // Spawn objects 1.5x rate
    let spawnCount = 0;
    const spawnInterval = setInterval(() => {
        for (let i = 0; i < 8; i++) {  // 1.5x more per tick
            spawnPhysicsObject();
        }
        spawnCount++;
        if (spawnCount > 120) {
            clearInterval(spawnInterval);
        }
    }, 70);  // 1.5x faster
}

function spawnPhysicsObject() {
    const size = Math.random() * 50 + 40;
    
    physicsObjects.push({
        x: Math.random() * (physicsCanvas.width - size * 2) + size,
        y: -size - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 1,
        width: size,
        height: size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        img: Math.random() > 0.5 ? images.heart : images.lily,
        settled: false
    });
}

function updatePhysics() {
    if (!physicsStarted) return;
    
    const ctx = physicsCanvas.getContext('2d');
    
    // TRANSPARENT background - just clear, don't fill
    ctx.clearRect(0, 0, physicsCanvas.width, physicsCanvas.height);
    
    // Update physics
    physicsObjects.forEach((obj, i) => {
        // Gravity
        obj.vy += GRAVITY;
        
        // Apply velocity with damping
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.rotation += obj.rotationSpeed;
        
        // Friction on horizontal movement
        obj.vx *= FRICTION;
        
        // Floor collision with heavy damping
        const floor = physicsCanvas.height - obj.height / 2;
        if (obj.y > floor) {
            obj.y = floor;
            obj.vy *= -BOUNCE;
            obj.vx *= 0.8;  // Extra friction on ground
            obj.rotationSpeed *= 0.5;
            
            // Settle if moving slowly
            if (Math.abs(obj.vy) < 1) {
                obj.vy = 0;
                obj.settled = true;
            }
        }
        
        // Walls
        if (obj.x < obj.width / 2) {
            obj.x = obj.width / 2;
            obj.vx *= -BOUNCE;
        }
        if (obj.x > physicsCanvas.width - obj.width / 2) {
            obj.x = physicsCanvas.width - obj.width / 2;
            obj.vx *= -BOUNCE;
        }
        
        // Collision with other objects - improved
        for (let j = i + 1; j < physicsObjects.length; j++) {
            const other = physicsObjects[j];
            const dx = other.x - obj.x;
            const dy = other.y - obj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (obj.width + other.width) / 2 * 0.65;
            
            if (dist < minDist && dist > 0) {
                const overlap = minDist - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                
                // Separate objects
                const separationForce = overlap / 2;
                obj.x -= nx * separationForce;
                obj.y -= ny * separationForce;
                other.x += nx * separationForce;
                other.y += ny * separationForce;
                
                // Velocity exchange with damping
                const dvx = obj.vx - other.vx;
                const dvy = obj.vy - other.vy;
                const dvn = dvx * nx + dvy * ny;
                
                if (dvn > 0) {
                    const impulse = dvn * 0.3;  // Reduced impulse
                    obj.vx -= impulse * nx * DAMPING;
                    obj.vy -= impulse * ny * DAMPING;
                    other.vx += impulse * nx * DAMPING;
                    other.vy += impulse * ny * DAMPING;
                }
                
                // If stacking vertically, settle faster
                if (Math.abs(ny) > 0.7) {
                    obj.vy *= 0.7;
                    other.vy *= 0.7;
                    obj.rotationSpeed *= 0.8;
                    other.rotationSpeed *= 0.8;
                }
            }
        }
        
        // Extra damping for settled objects
        if (obj.settled) {
            obj.vx *= 0.9;
            obj.rotationSpeed *= 0.9;
        }
        
        // Draw
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        ctx.drawImage(obj.img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx.restore();
    });
}

// Resize handler
window.addEventListener('resize', () => {
    setupCanvases();
    if (gameState === 'revealed') {
        positionButtons();
    }
});

// Initialize
initGame();
