// Configuration
const TARGET_PHRASE = "WILLYOUBEMYVALENTINE";
const DISPLAY_PHRASE = "WILL YOU BE MY VALENTINE";
const keyboard_layout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

// State
let gameState = 'playing'; // playing, transitioning, revealed
let guessedLetters = new Set();
let currentInput = '';
let letterPositions = new Map();
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let mouseParticles = [];
let backgroundParticles = [];
let carouselItems = [];
let celebrationParticles = [];

// Elements
const gameScreen = document.getElementById('game-screen');
const questionScreen = document.getElementById('question-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const wordDisplay = document.getElementById('word-display');
const keyboardDiv = document.getElementById('keyboard');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');

// Canvases
const mouseCanvas = document.getElementById('mouse-particles-canvas');
const bgCanvas = document.getElementById('background-canvas');
const spotlightCanvas = document.getElementById('spotlight-canvas');

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
    [mouseCanvas, bgCanvas, spotlightCanvas].forEach(canvas => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

setupCanvases();

// Initialize game
function initGame() {
    createWordDisplay();
    createKeyboard();
    setupMouseTracking();
    animateMouseParticles();
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
            
            // Store position in the original phrase (without spaces)
            const posInPhrase = DISPLAY_PHRASE.substring(0, DISPLAY_PHRASE.indexOf(word) + i).replace(/ /g, '').length;
            box.dataset.position = posInPhrase;
            
            if (!letterPositions.has(word[i])) {
                letterPositions.set(word[i], []);
            }
            letterPositions.get(word[i]).push(box);
            
            wordGroup.appendChild(box);
        }
        
        wordDisplay.appendChild(wordGroup);
        
        // Add space between words
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
    
    if (key === 'ENTER') {
        if (currentInput) {
            checkLetter(currentInput);
            currentInput = '';
        }
    } else if (key === 'BACK') {
        currentInput = '';
    } else if (key.length === 1) {
        currentInput = key;
        checkLetter(currentInput);
        currentInput = '';
    }
}

// Check letter
function checkLetter(letter) {
    if (guessedLetters.has(letter)) return;
    
    guessedLetters.add(letter);
    const keyElement = document.querySelector(`[data-key="${letter}"]`);
    
    if (letterPositions.has(letter)) {
        // Correct letter
        keyElement.classList.add('correct');
        const boxes = letterPositions.get(letter);
        
        boxes.forEach(box => {
            box.textContent = letter;
            box.classList.add('filled');
        });
        
        // Check if puzzle is complete
        checkCompletion();
    } else {
        // Wrong letter
        keyElement.classList.add('wrong');
    }
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    
    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
        handleKeyPress('ENTER');
    } else if (key === 'BACKSPACE') {
        handleKeyPress('BACK');
    } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
    }
});

// Check completion
function checkCompletion() {
    const allFilled = Array.from(document.querySelectorAll('.letter-box:not(.space)'))
        .every(box => box.classList.contains('filled'));
    
    if (allFilled) {
        setTimeout(() => transitionToQuestion(), 1000);
    }
}

// Transition to question
function transitionToQuestion() {
    gameState = 'transitioning';
    
    // Fade to pink background
    document.body.classList.add('colored');
    
    // Change all green boxes to pink
    setTimeout(() => {
        document.querySelectorAll('.letter-box.filled').forEach(box => {
            box.style.background = '#ffc9f8';
            box.style.borderColor = '#7a004b';
            box.style.color = '#7a004b';
        });
    }, 1000);
    
    // Center and animate boxes
    setTimeout(() => {
        wordDisplay.style.transition = 'all 2s ease';
        wordDisplay.style.transform = 'scale(1.2)';
        
        // Hide keyboard and title
        keyboardDiv.style.transition = 'opacity 1s ease';
        keyboardDiv.style.opacity = '0';
        document.getElementById('game-title').style.opacity = '0';
    }, 1500);
    
    // Start background animations
    setTimeout(() => {
        startBackgroundParticles();
        startCarousel();
    }, 2500);
    
    // Transition to question screen
    setTimeout(() => {
        gameScreen.classList.remove('active');
        questionScreen.classList.add('active');
        
        animateQuestionReveal();
        startSpotlight();
    }, 4000);
}

// Animate question reveal
function animateQuestionReveal() {
    const namePrefix = document.getElementById('name-prefix');
    const questionText = document.getElementById('question-text');
    const questionMark = document.getElementById('question-mark');
    const buttonContainer = document.querySelector('.button-container');
    
    // Set text content
    namePrefix.textContent = 'aaroushi deshpande, ';
    questionText.textContent = 'will you be my valentine';
    questionMark.textContent = '?';
    
    // Animate name sliding from bottom
    namePrefix.style.animation = 'none';
    namePrefix.style.transform = 'translateY(100px)';
    namePrefix.style.opacity = '0';
    
    setTimeout(() => {
        namePrefix.style.transition = 'all 1s ease';
        namePrefix.style.transform = 'translateY(0)';
        namePrefix.style.opacity = '1';
    }, 100);
    
    // Animate question text
    setTimeout(() => {
        questionText.style.transition = 'all 1s ease';
        questionText.style.opacity = '1';
    }, 800);
    
    // Pop in question mark
    setTimeout(() => {
        questionMark.style.animation = 'popIn 0.5s ease-out forwards';
        questionMark.style.opacity = '1';
    }, 1500);
    
    // Show buttons
    setTimeout(() => {
        buttonContainer.style.transition = 'opacity 1s ease';
        buttonContainer.style.opacity = '1';
        
        // Position buttons
        positionButtons();
        setupNoButtonRepel();
    }, 2500);
    
    gameState = 'revealed';
}

// Position buttons
function positionButtons() {
    const containerRect = document.querySelector('.question-container').getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = containerRect.bottom + 100;
    
    yesButton.style.left = (centerX - 200) + 'px';
    yesButton.style.top = centerY + 'px';
    
    noButton.style.left = (centerX + 50) + 'px';
    noButton.style.top = centerY + 'px';
}

// Setup no button repel
function setupNoButtonRepel() {
    const repelRadius = 150;
    
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
            const force = (repelRadius - distance) / repelRadius;
            
            const currentLeft = parseInt(noButton.style.left);
            const currentTop = parseInt(noButton.style.top);
            
            const newLeft = currentLeft - Math.cos(angle) * force * 20;
            const newTop = currentTop - Math.sin(angle) * force * 20;
            
            // Keep within bounds
            const maxX = window.innerWidth - noButton.offsetWidth - 50;
            const maxY = window.innerHeight - noButton.offsetHeight - 50;
            
            noButton.style.left = Math.max(50, Math.min(maxX, newLeft)) + 'px';
            noButton.style.top = Math.max(50, Math.min(maxY, newTop)) + 'px';
        }
    });
}

// Yes button handler
yesButton.addEventListener('click', () => {
    gameState = 'celebration';
    questionScreen.classList.remove('active');
    celebrationScreen.classList.add('active');
    
    tripleBackgroundParticles();
    startCelebration();
});

// Mouse tracking
function setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    });
}

// Mouse particles animation
function animateMouseParticles() {
    const ctx = mouseCanvas.getContext('2d');
    
    function draw() {
        ctx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
        
        if (gameState === 'revealed' || gameState === 'celebration') {
            // Create new particle
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 2;
                
                mouseParticles.push({
                    x: mousePos.x,
                    y: mousePos.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    size: Math.random() * 2 + 1
                });
            }
            
            // Update and draw particles
            mouseParticles = mouseParticles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                
                if (p.life <= 0) return false;
                
                ctx.globalAlpha = p.life;
                ctx.strokeStyle = '#ffc9f8';
                ctx.lineWidth = p.size;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx * 5, p.y + p.vy * 5);
                ctx.stroke();
                
                return true;
            });
        }
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Background particles
function startBackgroundParticles() {
    const ctx = bgCanvas.getContext('2d');
    
    // Create particles
    for (let i = 0; i < 150; i++) {
        backgroundParticles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    function draw() {
        if (gameState === 'playing') return;
        
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        backgroundParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;
            
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Triple particles
function tripleBackgroundParticles() {
    for (let i = 0; i < 300; i++) {
        backgroundParticles.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

// Carousel
function startCarousel() {
    const ctx = bgCanvas.getContext('2d');
    
    // Create 3 carousels with different radii
    const carousels = [
        { radius: 300, items: [] },
        { radius: 450, items: [] },
        { radius: 600, items: [] }
    ];
    
    carousels.forEach((carousel, carouselIndex) => {
        const itemCount = 9;
        for (let i = 0; i < itemCount; i++) {
            let img;
            if (i % 3 === 0) img = images.pic1;
            else if (i % 3 === 1) img = images.heart;
            else img = images.lily;
            
            if (i === 1 || i === 4 || i === 7) {
                img = Math.random() > 0.5 ? images.heart : images.lily;
            }
            
            carousel.items.push({
                img: img,
                angle: (i / itemCount) * Math.PI * 2,
                decorative: img === images.heart || img === images.lily,
                offset: Math.random() * Math.PI * 2
            });
        }
    });
    
    let rotation = 0;
    
    function draw() {
        if (gameState === 'playing') return;
        
        const centerX = bgCanvas.width / 2;
        const centerY = bgCanvas.height / 2;
        
        rotation += 0.002;
        
        carousels.forEach((carousel, index) => {
            const speed = 1 + index * 0.3;
            
            carousel.items.forEach((item, itemIndex) => {
                const angle = item.angle + rotation * speed;
                const wobble = Math.sin(rotation * 3 + item.offset) * 30;
                const radius = carousel.radius + wobble;
                
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                const scale = 0.7 + Math.sin(angle) * 0.2;
                const size = item.decorative ? 60 : 120;
                
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                ctx.globalAlpha = 0.6 + Math.sin(rotation + itemIndex) * 0.2;
                
                ctx.shadowColor = '#ffc9f8';
                ctx.shadowBlur = 15;
                
                ctx.drawImage(
                    item.img,
                    -size * scale / 2,
                    -size * scale / 2,
                    size * scale,
                    size * scale
                );
                
                ctx.restore();
            });
        });
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Spotlight effect
function startSpotlight() {
    const ctx = spotlightCanvas.getContext('2d');
    let intensity = 0;
    
    function draw() {
        if (gameState === 'playing' || gameState === 'transitioning') return;
        
        ctx.clearRect(0, 0, spotlightCanvas.width, spotlightCanvas.height);
        
        if (intensity < 1) intensity += 0.02;
        
        const centerX = spotlightCanvas.width / 2;
        const centerY = spotlightCanvas.height / 2 - 100;
        
        // Create spotlight
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 * intensity})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * intensity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, spotlightCanvas.width, spotlightCanvas.height);
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Celebration
function startCelebration() {
    const ctx = bgCanvas.getContext('2d');
    
    // Create raining hearts and lilies
    for (let i = 0; i < 100; i++) {
        celebrationParticles.push(createCelebrationParticle());
    }
    
    function draw() {
        if (gameState !== 'celebration') return;
        
        celebrationParticles.forEach((p, index) => {
            p.y += p.vy;
            p.x += p.vx;
            p.rotation += p.rotationSpeed;
            p.orbitAngle += p.orbitSpeed;
            
            const orbitX = Math.cos(p.orbitAngle) * p.orbitRadius;
            const orbitY = Math.sin(p.orbitAngle) * p.orbitRadius;
            
            const x = p.x + orbitX;
            const y = p.y + orbitY;
            
            if (y > bgCanvas.height + 100) {
                celebrationParticles[index] = createCelebrationParticle();
            }
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = 0.8;
            
            const size = 60 * p.scale;
            ctx.drawImage(p.img, -size / 2, -size / 2, size, size);
            
            ctx.restore();
        });
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

function createCelebrationParticle() {
    return {
        x: Math.random() * bgCanvas.width,
        y: -50 - Math.random() * 500,
        img: Math.random() > 0.5 ? images.heart : images.lily,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        scale: Math.random() * 0.5 + 0.5,
        orbitRadius: Math.random() * 80 + 40,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.04
    };
}

// Handle resize
window.addEventListener('resize', () => {
    setupCanvases();
    if (gameState === 'revealed') {
        positionButtons();
    }
});

// Add pop-in animation
const style = document.createElement('style');
style.textContent = `
@keyframes popIn {
    0% {
        transform: scale(0);
    }
    70% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}
`;
document.head.appendChild(style);

// Initialize
initGame();
