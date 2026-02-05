// Screen elements
const initialScreen = document.getElementById('initial-screen');
const zoomScreen = document.getElementById('zoom-screen');
const questionScreen = document.getElementById('question-screen');
const celebrationScreen = document.getElementById('celebration-screen');

// Canvas elements
const particlesCanvas = document.getElementById('particles-canvas');
const carouselCanvas = document.getElementById('carousel-canvas');
const celebrationCanvas = document.getElementById('celebration-canvas');

// Button elements
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');

// Animation state
let animationState = 'initial';
let particles = [];
let carouselImages = [];
let celebrationParticles = [];
let decorativeImages = [];

// Load images
const heartImg = new Image();
heartImg.src = 'pics/hrt_nobg.png';

const lilyImg = new Image();
lilyImg.src = 'pics/lily_nobg.png';

const img1 = new Image();
img1.src = 'pics/1.png';

const img2 = new Image();
img2.src = 'pics/2.png';

const img3 = new Image();
img3.src = 'pics/3.png';

// Animation sequence
setTimeout(() => {
    startZoomAnimation();
}, 3000);

function startZoomAnimation() {
    initialScreen.classList.remove('active');
    zoomScreen.classList.add('active');
    
    setupParticlesCanvas();
    animateZoom();
    
    setTimeout(() => {
        startQuestionScreen();
    }, 4000);
}

function startQuestionScreen() {
    zoomScreen.classList.remove('active');
    questionScreen.classList.add('active');
    
    setupCarouselCanvas();
    animateCarousel();
}

// Particles Canvas for Zoom Effect
function setupParticlesCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    
    const ctx = particlesCanvas.getContext('2d');
    particles = [];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            radius: Math.random() * 3 + 1,
            color: Math.random() > 0.5 ? '#fff' : '#000',
            velocity: {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 4
            },
            scale: 0
        });
    }
}

function animateZoom() {
    const ctx = particlesCanvas.getContext('2d');
    let frame = 0;
    const maxFrames = 240;
    
    function draw() {
        if (frame >= maxFrames) return;
        
        // Dynamic background color change
        const progress = frame / maxFrames;
        const r = Math.floor(0 + (255 * progress));
        const g = Math.floor(0 + (201 * progress));
        const b = Math.floor(0 + (248 * progress));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        
        // Draw and update particles
        particles.forEach(particle => {
            // Scale up particles
            if (particle.scale < 1) {
                particle.scale += 0.02;
            }
            
            // Zoom effect
            const zoom = 1 + (frame / maxFrames) * 5;
            const centerX = particlesCanvas.width / 2;
            const centerY = particlesCanvas.height / 2;
            
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            
            const x = centerX + dx * zoom + particle.velocity.x * frame * 0.1;
            const y = centerY + dy * zoom + particle.velocity.y * frame * 0.1;
            
            ctx.globalAlpha = particle.scale * (1 - progress);
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(x, y, particle.radius * particle.scale, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        frame++;
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Carousel Canvas
function setupCarouselCanvas() {
    carouselCanvas.width = window.innerWidth;
    carouselCanvas.height = window.innerHeight;
    
    // Setup carousel items with decorative hearts and lilies
    carouselImages = [
        { img: img1, angle: 0, radius: 400, decorative: null },
        { img: heartImg, angle: Math.PI / 3, radius: 400, decorative: true },
        { img: img2, angle: Math.PI * 2 / 3, radius: 400, decorative: null },
        { img: lilyImg, angle: Math.PI, radius: 400, decorative: true },
        { img: img3, angle: Math.PI * 4 / 3, radius: 400, decorative: null },
        { img: heartImg, angle: Math.PI * 5 / 3, radius: 400, decorative: true }
    ];
}

function animateCarousel() {
    const ctx = carouselCanvas.getContext('2d');
    const centerX = carouselCanvas.width / 2;
    const centerY = carouselCanvas.height / 2;
    let rotation = 0;
    
    function draw() {
        if (animationState !== 'question' && animationState !== 'initial') return;
        
        ctx.clearRect(0, 0, carouselCanvas.width, carouselCanvas.height);
        
        rotation += 0.003;
        
        carouselImages.forEach((item, index) => {
            const angle = item.angle + rotation;
            const radius = item.radius + Math.sin(rotation * 2 + index) * 50;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Scale and rotation based on position
            const scale = 0.8 + Math.sin(angle) * 0.3;
            const size = item.decorative ? 80 : 150;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.globalAlpha = 0.7 + Math.sin(rotation + index) * 0.3;
            
            // Add glow effect
            ctx.shadowColor = item.decorative ? '#ffc9f8' : 'rgba(255, 255, 255, 0.5)';
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
        
        requestAnimationFrame(draw);
    }
    
    animationState = 'question';
    draw();
}

// No Button Escape Logic
let noButtonMoveCount = 0;

noButton.addEventListener('mouseenter', (e) => {
    moveNoButton();
});

noButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
});

function moveNoButton() {
    noButtonMoveCount++;
    
    const maxX = window.innerWidth - noButton.offsetWidth - 50;
    const maxY = window.innerHeight - noButton.offsetHeight - 50;
    
    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY;
    
    // Make sure it's far from the mouse
    const buttonRect = noButton.getBoundingClientRect();
    const distance = 150;
    
    noButton.style.position = 'fixed';
    noButton.style.left = newX + 'px';
    noButton.style.top = newY + 'px';
    noButton.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`;
    
    // Make button smaller and sadder each time
    if (noButtonMoveCount > 3) {
        noButton.textContent = '😢';
    }
    if (noButtonMoveCount > 5) {
        noButton.textContent = '🥺';
        noButton.style.fontSize = '1.5rem';
    }
}

// Yes Button Click
yesButton.addEventListener('click', () => {
    animationState = 'celebration';
    questionScreen.classList.remove('active');
    celebrationScreen.classList.add('active');
    
    setupCelebrationCanvas();
    animateCelebration();
});

// Celebration Animation
function setupCelebrationCanvas() {
    celebrationCanvas.width = window.innerWidth;
    celebrationCanvas.height = window.innerHeight;
    
    celebrationParticles = [];
    
    // Create raining hearts and lilies
    for (let i = 0; i < 50; i++) {
        celebrationParticles.push(createCelebrationParticle());
    }
}

function createCelebrationParticle() {
    return {
        x: Math.random() * celebrationCanvas.width,
        y: -50 - Math.random() * 500,
        img: Math.random() > 0.5 ? heartImg : lilyImg,
        velocity: {
            x: (Math.random() - 0.5) * 3,
            y: Math.random() * 3 + 2
        },
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        scale: Math.random() * 0.5 + 0.5,
        orbitRadius: Math.random() * 100 + 50,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.05
    };
}

function animateCelebration() {
    const ctx = celebrationCanvas.getContext('2d');
    let frame = 0;
    
    function draw() {
        if (animationState !== 'celebration') return;
        
        ctx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
        
        celebrationParticles.forEach((particle, index) => {
            // Update position
            particle.y += particle.velocity.y;
            particle.rotation += particle.rotationSpeed;
            particle.orbitAngle += particle.orbitSpeed;
            
            // Calculate orbital position
            const orbitX = Math.cos(particle.orbitAngle) * particle.orbitRadius;
            const orbitY = Math.sin(particle.orbitAngle) * particle.orbitRadius;
            
            const x = particle.x + orbitX + particle.velocity.x * Math.sin(frame * 0.1);
            const y = particle.y + orbitY;
            
            // Reset if off screen
            if (y > celebrationCanvas.height + 100) {
                celebrationParticles[index] = createCelebrationParticle();
            }
            
            // Draw particle
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(particle.rotation);
            ctx.globalAlpha = 0.8;
            
            const size = 60 * particle.scale;
            ctx.drawImage(
                particle.img,
                -size / 2,
                -size / 2,
                size,
                size
            );
            
            ctx.restore();
        });
        
        frame++;
        
        // Add more particles over time
        if (frame % 30 === 0 && celebrationParticles.length < 100) {
            celebrationParticles.push(createCelebrationParticle());
        }
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Responsive canvas resizing
window.addEventListener('resize', () => {
    if (particlesCanvas) {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }
    if (carouselCanvas) {
        carouselCanvas.width = window.innerWidth;
        carouselCanvas.height = window.innerHeight;
    }
    if (celebrationCanvas) {
        celebrationCanvas.width = window.innerWidth;
        celebrationCanvas.height = window.innerHeight;
    }
});

// Prevent accidental navigation
window.addEventListener('beforeunload', (e) => {
    if (animationState === 'celebration') {
        e.preventDefault();
        e.returnValue = '';
    }
});
