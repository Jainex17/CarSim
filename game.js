// Game constants
const WORLD_SIZE = 400; // Increased from 200 to 400
// Remove PARTICLE_COUNT
const BLOCK_COUNT = 20; // Number of blocks to generate

// Game variables
let scene, camera, renderer;
let car, ground;
// Remove particles array
let clock = new THREE.Clock();
let controls;
let blocker, startScreen;
// Remove particlesCollected
let clouds = [];
const CLOUD_COUNT = 10;
let blocks = []; // Array to store blocks

// FPS tracking variables
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

// Control states
const controlState = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  jump: false,
  boost: false
};

// DOM elements
const gameContainer = document.getElementById('gameContainer');
// Remove particle display elements

// Add new game state variables
let isPaused = false;
let isTabActive = true;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Setup camera initial position before creating car
    camera.position.set(0, 5, -10); // Add this line to set initial camera position
    camera.lookAt(0, 0, 0);
    
    // Setup renderer with better shadow quality
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    document.getElementById('gameContainer').appendChild(renderer.domElement);
    
    // Setup lighting
    setupLighting();
    
    // Create clouds
    for (let i = 0; i < CLOUD_COUNT; i++) {
        const x = (Math.random() - 0.5) * WORLD_SIZE;
        const y = 30 + Math.random() * 20;
        const z = (Math.random() - 0.5) * WORLD_SIZE;
        const cloud = new Cloud(scene, new THREE.Vector3(x, y, z));
        clouds.push(cloud);
    }
    
    // Create ground
    createGround();
    
    // Setup pointer lock controls
    setupControls();
    
    // Create car instead of player
    car = new Car(scene, camera, new THREE.Vector3(0, 0.5, 0));
    
    // Generate random blocks
    generateBlocks();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Handle key events
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Start the game loop
    animate();
}

// Generate random blocks
function generateBlocks() {
    const halfWorldSize = WORLD_SIZE / 2 - 10; // Keep blocks away from edges
    const minDistance = 20; // Minimum distance from origin (car starting point)
    
    for (let i = 0; i < BLOCK_COUNT; i++) {
        let x, z;
        
        // Make sure blocks aren't too close to the starting position
        do {
            x = (Math.random() * 2 - 1) * halfWorldSize;
            z = (Math.random() * 2 - 1) * halfWorldSize;
        } while (Math.sqrt(x*x + z*z) < minDistance);
        
        // Increased height range for buildings
        const width = 5 + Math.random() * 8;     // Wider base
        const height = 15 + Math.random() * 25;  // Much taller (building-like)
        const depth = 5 + Math.random() * 8;     // Deeper base
        
        // Random color variations for buildings
        const hue = Math.random() * 0.1 + 0.6; // Greyish/bluish variations
        const saturation = Math.random() * 0.3; // Low saturation for building look
        const lightness = 0.3 + Math.random() * 0.2; // Darker colors
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        
        const block = new Block(
            scene, 
            new THREE.Vector3(x, 0, z), 
            { width, height, depth }, 
            color.getHex()
        );
        
        blocks.push(block);
    }
}

// Check collisions between car and blocks
function checkBlockCollisions() {
    if (!car) return;
    
    // Update car's collision box
    const carBox = car.updateCollisionBox();
    
    // Check collision with each block
    for (const block of blocks) {
        block.updateBoundingBox();
        if (block.checkCollision(carBox)) {
            car.handleCollision(block);
        }
    }
}

// Remove old handleCollision function since it's now in Car class

function setupControls() {
    // Setup controls
    controls = new THREE.PointerLockControls(camera, document.body);
    
    // Setup blocker and instructions
    blocker = document.createElement('div');
    blocker.id = 'blocker';
    
    startScreen = document.createElement('div');
    startScreen.id = 'startScreen';
    
    const title = document.createElement('h2');
    title.textContent = 'Particle Collection Game';
    
    const instructions = document.createElement('p');
    instructions.innerHTML = 
        'Click to play<br><br>' +
        'Move: WASD or Arrow Keys<br>' +
        'Jump: SPACE<br>' +
        'Look: MOUSE';
    
    startScreen.appendChild(title);
    startScreen.appendChild(instructions);
    blocker.appendChild(startScreen);
    document.body.appendChild(blocker);
    
    // Add pause menu to blocker
    const pauseMenu = document.createElement('div');
    pauseMenu.id = 'pauseMenu';
    pauseMenu.classList.add('hidden');
    
    const pauseTitle = document.createElement('h2');
    pauseTitle.textContent = 'Game Paused';
    
    const resumeButton = document.createElement('button');
    resumeButton.textContent = 'Resume Game';
    resumeButton.onclick = () => {
        controls.lock();
        unpauseGame();
    };
    
    pauseMenu.appendChild(pauseTitle);
    pauseMenu.appendChild(resumeButton);
    blocker.appendChild(pauseMenu);

    // Handle pointer lock change
    const onPointerLockChange = () => {
        if (document.pointerLockElement === document.body) {
            controls.enabled = true;
            blocker.classList.add('hidden');
            startScreen.classList.add('hidden');
            pauseMenu.classList.add('hidden');
            unpauseGame();
        } else {
            controls.enabled = false;
            blocker.classList.remove('hidden');
            if (!isPaused) {
                pauseGame();
            }
            pauseMenu.classList.remove('hidden');
        }
    };
    
    const onPointerLockError = () => {
        console.error('Pointer lock error');
    };
    
    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    document.addEventListener('pointerlockerror', onPointerLockError, false);
    
    startScreen.addEventListener('click', () => {
        controls.lock();
    });
    
    controls.addEventListener('lock', () => {
        startScreen.classList.add('hidden');
        blocker.classList.add('hidden');
    });
    
    controls.addEventListener('unlock', () => {
        blocker.classList.remove('hidden');
    });
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(100, 200, 100); // Increased height for larger world
    directionalLight.castShadow = true;
    
    // Improve shadow quality for larger world
    directionalLight.shadow.mapSize.width = 8192;  // Increased resolution
    directionalLight.shadow.mapSize.height = 8192; // Increased resolution
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 1000;     // Increased far plane
    directionalLight.shadow.camera.left = -200;    // Increased shadow camera bounds
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.bias = -0.0003;       // Adjusted bias for larger scale
    
    scene.add(directionalLight);
}

function createGround() {
    // Create texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Create grid texture
    const gridSize = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#2a5e1e';  // Darker grass green
    ctx.fillRect(0, 0, gridSize, gridSize);
    
    // Draw grid
    ctx.strokeStyle = '#245119';  // Slightly darker line color
    ctx.lineWidth = 2;
    const cellSize = 32;  // Size of each grid cell
    
    for (let i = 0; i <= gridSize; i += cellSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, gridSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);  
        ctx.lineTo(gridSize, i);
        ctx.stroke();
    }
    
    // Create texture from canvas
    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(WORLD_SIZE/50, WORLD_SIZE/50);
    
    // Create ground geometry
    const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE);
    groundGeometry.computeBoundingBox();
    
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: groundTexture,
        roughness: 0.9,
        metalness: 0.1
    });
    
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    
    scene.add(ground);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Don't update game logic if paused
    if (isPaused) {
        renderer.render(scene, camera);
        return;
    }

    // Calculate FPS
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime > lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        document.getElementById('fpsCounter').textContent = fps;
    }
    
    const deltaTime = clock.getDelta();
    
    if (controls.enabled) {
        car.update(deltaTime);
        
        // Check for collisions with blocks
        checkBlockCollisions();
    }
    
    // Update clouds
    clouds.forEach(cloud => cloud.update(deltaTime));
    
    if (car) {
        // Update nitro gauge
        const nitroPercent = Math.round((car.nitroFuel / car.maxNitroFuel) * 100);
        document.getElementById('nitroGauge').textContent = `Nitro: ${nitroPercent}%`;
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle key down events
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            controlState.moveForward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            controlState.moveBackward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            controlState.moveLeft = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            controlState.moveRight = true;
            break;
        case 'KeyV':
            if (car) car.toggleView();
            break;
        case 'Escape':
            if (!isPaused) {
                pauseGame();
                controls.unlock();
            }
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            controlState.boost = true;
            break;
    }
}

// Handle key up events
function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            controlState.moveForward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            controlState.moveBackward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            controlState.moveLeft = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            controlState.moveRight = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            controlState.boost = false;
            break;
    }
}

// Add pause/unpause functions
function pauseGame() {
    isPaused = true;
    controls.enabled = false;
}

function unpauseGame() {
    isPaused = false;
    controls.enabled = true;
}

// Add tab visibility handler
document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (!isTabActive) {
        pauseGame();
        controls.unlock();
    }
});


// Start the game when the window loads
window.onload = init;
