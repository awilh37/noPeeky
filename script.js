// ============ CONSTANTS ============
const TILE_SIZE = 32;
const LEVEL_WIDTH = 16;
const LEVEL_HEIGHT = 9;
const ITEM_TYPES = {
    SWORD: 'sword',
    KEY: 'key',
    POTION: 'potion'
};
const ENTITY_TYPES = {
    ENEMY: 'enemy',
    NPC: 'npc',
    ITEM: 'item'
};

// ============ STATE MANAGEMENT ============
const state = {
    keys: {},
    menuPlayerX: window.innerWidth * 0.15,
    menuPlayerY: 0,
    menuPlayerVelocityY: 0,
    menuHP: 6,
    levelHP: 6,
    gameRunning: false,
    currentRoom: 'entrance',
    inventory: [],
    hasKey: false,
    attackCooldown: 0,
    gamePhase: 'room', // 'room' or 'dungeon'
};

// ============ SCREEN ELEMENTS ============
const screens = {
    bootScreen: document.getElementById('bootScreen'),
    gameScreen: document.getElementById('gameScreen'),
    levelScreen: document.getElementById('levelScreen'),
    loadingScreen: document.getElementById('loadingScreen'),
    foolsScreen: document.getElementById('foolsScreen'),
    playButton: document.getElementById('playButton'),
    restartButton: document.getElementById('restartButton'),
    continueButton: document.getElementById('continueButton'),
    loadingText: document.getElementById('loadingText'),
    menuPlayer: document.getElementById('menuPlayer'),
    menuHP: document.getElementById('menuHP'),
    canvas: document.getElementById('gameCanvas'),
};

const ctx = screens.canvas ? screens.canvas.getContext('2d') : null;

// ============ BOOT SCREEN - WAIT FOR USER INPUT ============
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && screens.bootScreen.classList.contains('active')) {
        e.preventDefault();
        transitionFromBoot();
    }
});

// Touch support for boot screen (mobile)
document.addEventListener('touchstart', (e) => {
    if (screens.bootScreen.classList.contains('active')) {
        transitionFromBoot();
    }
});

function transitionFromBoot() {
    screens.bootScreen.classList.remove('active');
    screens.bootScreen.classList.add('fade-out');
    setTimeout(() => {
        screens.gameScreen.classList.add('active');
    }, 500);
}

// ============ MENU SCREEN - PLAYER MOVEMENT ============
// ============ INPUT HANDLING ============
// Game input disabled - April Fools version only shows boot/menu/loading/prank
document.addEventListener('keydown', (e) => {
    state.keys[e.key] = true;
    
    // Boot screen input
    if ((e.key === 'Enter' || e.key === ' ') && screens.bootScreen.classList.contains('active')) {
        e.preventDefault();
        transitionFromBoot();
    }
});

document.addEventListener('keyup', (e) => {
    state.keys[e.key] = false;
});

function updateMenuPlayer() {
    const moveSpeed = 5;
    const gameViewRect = document.querySelector('.cv-game-view').getBoundingClientRect();
    const playerSize = 60;
    
    // Horizontal movement
    if (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) {
        state.menuPlayerX = Math.max(5, state.menuPlayerX - moveSpeed);
    }
    if (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) {
        state.menuPlayerX = Math.min(gameViewRect.width - playerSize - 5, state.menuPlayerX + moveSpeed);
    }
    
    // Vertical movement (simulate gravity and jumping)
    const groundY = gameViewRect.height * 0.65;
    state.menuPlayerVelocityY += 0.3; // Gravity
    state.menuPlayerY += state.menuPlayerVelocityY;
    
    // Jump
    if ((state.keys[' '] || state.keys['w'] || state.keys['W'] || state.keys['ArrowUp']) && state.menuPlayerY >= groundY - 5) {
        state.menuPlayerVelocityY = -12;
    }
    
    // Ground collision
    if (state.menuPlayerY >= groundY) {
        state.menuPlayerY = groundY;
        state.menuPlayerVelocityY = 0;
    }
    
    // Update player position
    const percentLeft = (state.menuPlayerX / gameViewRect.width) * 100;
    const percentBottom = ((gameViewRect.height - state.menuPlayerY - playerSize) / gameViewRect.height) * 100;
    screens.menuPlayer.style.left = percentLeft + '%';
    screens.menuPlayer.style.bottom = percentBottom + '%';
}

function animateMenuPlayer() {
    updateMenuPlayer();
    if (screens.gameScreen.classList.contains('active')) {
        requestAnimationFrame(animateMenuPlayer);
    }
}

// Start menu animation
setTimeout(() => {
    if (screens.gameScreen.classList.contains('active')) {
        animateMenuPlayer();
    }
}, 600);

// ============ PLAY BUTTON - START LOADING SEQUENCE ============
screens.playButton.addEventListener('click', () => {
    screens.playButton.style.pointerEvents = 'none';
    screens.playButton.style.opacity = '0.5';
    
    screens.gameScreen.classList.add('fade-out');
    
    setTimeout(() => {
        screens.gameScreen.style.display = 'none';
        screens.loadingScreen.classList.add('active');
        startLoadingSequence();
    }, 600);
});

// ============ LOADING SEQUENCE ============
function startLoadingSequence() {
    const progressBar = document.getElementById('progressBar');
    const loadingMessage = document.getElementById('loadingMessage');
    
    // Define your loading messages with their timings (in seconds)
    const messages = [
        { time: 0.3, text: 'Initializing game engine...' },
        { time: 1.2, text: 'Loading assets...' },
        { time: 1.7, text: 'Compiling shaders...' },
        { time: 2.5, text: 'Loading level data...' },
        { time: 3.2, text: 'Initializing physics...' },
        { time: 4.0, text: 'Googling prank ideas...'},
        { time: 5.0, text: 'Starting game...' }
    ];
    
    const totalTime = messages[messages.length - 1].time + 1.0; // Total time in seconds
    const totalMs = totalTime * 1000;
    
    // Update progress bar
    progressBar.style.transition = `width ${totalMs}ms ease-out`;
    progressBar.style.width = '100%';
    
    // Update messages
    messages.forEach(msg => {
        setTimeout(() => {
            loadingMessage.textContent = msg.text;
        }, msg.time * 1000);
    });
    
    // Transition to prank when done
    setTimeout(() => {
        screens.loadingScreen.classList.remove('active');
        screens.loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            screens.loadingScreen.style.display = 'none';
            screens.loadingScreen.classList.remove('fade-out');
            screens.foolsScreen.classList.add('active');
            createConfetti();
            
            // Show restart button
            document.getElementById('restartButton').style.display = 'block';
            document.getElementById('continueButton').style.display = 'none';
            
            // Reset message
            document.querySelector('.fools-message-box').innerHTML = '<p>You fell for it!</p><p>There is no game... (yet)</p><p>Tee hee!</p>';
        }, 600);
    }, totalMs);
}
class TileHelper {
    static cartToIsometric(x, y) {
        // Convert cartesian (grid) coordinates to isometric screen coordinates
        const isoX = (x - y) * (TILE_SIZE / 2);
        const isoY = (x + y) * (TILE_SIZE / 4);
        return { x: isoX, y: isoY };
    }

    static isometricToCart(isoX, isoY) {
        // Convert isometric screen coordinates back to cartesian grid coordinates
        const x = (isoX / (TILE_SIZE / 2) + isoY / (TILE_SIZE / 4)) / 2;
        const y = (isoY / (TILE_SIZE / 4) - isoX / (TILE_SIZE / 2)) / 2;
        return { x: Math.round(x), y: Math.round(y) };
    }

    static isInBounds(x, y) {
        return x >= 0 && x < LEVEL_WIDTH && y >= 0 && y < LEVEL_HEIGHT;
    }
}

// ============ TILEMAP SYSTEM ============
class TileMap {
    constructor() {
        this.tiles = [];
        this.generateRoom();
    }

    generateRoom() {
        // Create a simple room layout
        // 0 = walkable, 1 = wall, 2 = water
        for (let y = 0; y < LEVEL_HEIGHT; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < LEVEL_WIDTH; x++) {
                // Create borders
                if (x === 0 || x === LEVEL_WIDTH - 1 || y === 0 || y === LEVEL_HEIGHT - 1) {
                    this.tiles[y][x] = 1; // Wall
                } else {
                    this.tiles[y][x] = 0; // Floor
                }
            }
        }

        // Add some obstacles
        this.tiles[4][8] = 1;
        this.tiles[5][8] = 1;
        this.tiles[4][7] = 1;
    }

    isWalkable(x, y) {
        if (!TileHelper.isInBounds(x, y)) return false;
        return this.tiles[y][x] === 0;
    }

    getTile(x, y) {
        if (!TileHelper.isInBounds(x, y)) return 1;
        return this.tiles[y][x];
    }
}

// ============ ENTITY SYSTEM ============
class Entity {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
    }
}

class Enemy extends Entity {
    constructor(x, y, name = 'Slime') {
        super(x, y, ENTITY_TYPES.ENEMY);
        this.name = name;
        this.health = 2;
        this.moveCounter = 0;
        this.direction = Math.random() > 0.5 ? 1 : -1;
    }

    update(tileMap) {
        this.moveCounter++;
        if (this.moveCounter > 40) {
            this.moveCounter = 0;
            const newX = this.x + this.direction;
            const newY = this.y;
            if (tileMap.isWalkable(newX, newY)) {
                this.x = newX;
            } else {
                this.direction *= -1;
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
        }
    }
}

class NPC extends Entity {
    constructor(x, y, name = 'NPC', dialogue = 'Hello!') {
        super(x, y, ENTITY_TYPES.NPC);
        this.name = name;
        this.dialogue = dialogue;
    }
}

class Item extends Entity {
    constructor(x, y, itemType, name = 'Item') {
        super(x, y, ENTITY_TYPES.ITEM);
        this.itemType = itemType;
        this.name = name;
    }
}

// ============ PLAYER CLASS ============
class Player {
    constructor(x, y, tileMap) {
        this.x = x;
        this.y = y;
        this.tileMap = tileMap;
        this.health = 6;
        this.maxHealth = 6;
        this.direction = 0; // 0=right, 1=down, 2=left, 3=up
        this.isAttacking = false;
        this.attackTimer = 0;
    }

    moveUp() {
        const newY = this.y - 1;
        if (this.tileMap.isWalkable(this.x, newY)) {
            this.y = newY;
            this.direction = 3;
        }
    }

    moveDown() {
        const newY = this.y + 1;
        if (this.tileMap.isWalkable(this.x, newY)) {
            this.y = newY;
            this.direction = 1;
        }
    }

    moveLeft() {
        const newX = this.x - 1;
        if (this.tileMap.isWalkable(newX, this.y)) {
            this.x = newX;
            this.direction = 2;
        }
    }

    moveRight() {
        const newX = this.x + 1;
        if (this.tileMap.isWalkable(newX, this.y)) {
            this.x = newX;
            this.direction = 0;
        }
    }

    attack() {
        this.isAttacking = true;
        this.attackTimer = 10;
    }

    getAdjacentTile() {
        const dirs = [
            { x: 1, y: 0 },   // right
            { x: 0, y: 1 },   // down
            { x: -1, y: 0 },  // left
            { x: 0, y: -1 }   // up
        ];
        const d = dirs[this.direction];
        return { x: this.x + d.x, y: this.y + d.y };
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    update() {
        if (this.attackTimer > 0) this.attackTimer--;
    }
}

// ============ ZELDA LEVEL CLASS ============
class ZeldaLevel {
    constructor(roomType = 'entrance') {
        this.roomType = roomType;
        this.tileMap = new TileMap();
        this.player = new Player(1, 1, this.tileMap);
        this.enemies = [];
        this.npcs = [];
        this.items = [];
        this.setupRoom();
    }

    setupRoom() {
        if (this.roomType === 'entrance') {
            // Add entrance room entities
            this.enemies.push(new Enemy(5, 5, 'Slime'));
            this.enemies.push(new Enemy(10, 6, 'Slime'));
            this.npcs.push(new NPC(3, 3, 'Old Man', 'Welcome to the dungeon!'));
            this.items.push(new Item(12, 3, ITEM_TYPES.SWORD, 'Wooden Sword'));
            this.items.push(new Item(7, 7, ITEM_TYPES.POTION, 'Red Potion'));
        } else if (this.roomType === 'dungeon') {
            // Dungeon room
            this.enemies.push(new Enemy(5, 4, 'Slime'));
            this.enemies.push(new Enemy(10, 5, 'Slime'));
            this.enemies.push(new Enemy(8, 7, 'Slime'));
            this.npcs.push(new NPC(13, 2, 'Treasure', 'Found treasure!'));
        }
    }

    update() {
        this.player.update();

        // Update enemies
        for (let enemy of this.enemies) {
            if (enemy.alive) {
                enemy.update(this.tileMap);
            }
        }

        // Check player-enemy collisions
        for (let enemy of this.enemies) {
            if (!enemy.alive) continue;
            if (enemy.x === this.player.x && enemy.y === this.player.y) {
                this.player.takeDamage(1);
            }
        }

        // Check attacks hitting enemies
        if (this.player.isAttacking && this.player.attackTimer === 10) {
            const adj = this.player.getAdjacentTile();
            for (let enemy of this.enemies) {
                if (enemy.x === adj.x && enemy.y === adj.y) {
                    enemy.takeDamage(1);
                }
            }
        }

        // Check item pickups
        for (let item of this.items) {
            if (item.alive && item.x === this.player.x && item.y === this.player.y) {
                if (item.itemType === ITEM_TYPES.SWORD && !state.inventory.includes(ITEM_TYPES.SWORD)) {
                    state.inventory.push(ITEM_TYPES.SWORD);
                } else if (item.itemType === ITEM_TYPES.KEY) {
                    state.hasKey = true;
                } else if (item.itemType === ITEM_TYPES.POTION) {
                    this.player.heal(3);
                }
                item.alive = false;
            }
        }

        // Update state
        state.levelHP = this.player.health;
    }

    draw(ctx, canvas) {
        // Clear canvas
        ctx.fillStyle = '#2d1b4e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate camera offset to center on player
        const playerIso = TileHelper.cartToIsometric(this.player.x, this.player.y);
        const offsetX = canvas.width / 2 - playerIso.x;
        const offsetY = canvas.height / 2 - playerIso.y;

        ctx.save();
        ctx.translate(offsetX, offsetY);

        // Draw tiles
        for (let y = 0; y < LEVEL_HEIGHT; y++) {
            for (let x = 0; x < LEVEL_WIDTH; x++) {
                const iso = TileHelper.cartToIsometric(x, y);
                const tile = this.tileMap.getTile(x, y);

                if (tile === 0) {
                    // Floor
                    ctx.fillStyle = '#4a6b5e';
                    this.drawIsometricTile(ctx, iso.x, iso.y, '#3a5b4e');
                } else if (tile === 1) {
                    // Wall
                    ctx.fillStyle = '#6a5a7e';
                    this.drawIsometricTile(ctx, iso.x, iso.y, '#4a3a5e');
                }
            }
        }

        // Draw items
        for (let item of this.items) {
            if (item.alive) {
                const iso = TileHelper.cartToIsometric(item.x, item.y);
                ctx.fillStyle = '#ffed4e';
                ctx.beginPath();
                ctx.arc(iso.x, iso.y - 4, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw NPCs
        for (let npc of this.npcs) {
            const iso = TileHelper.cartToIsometric(npc.x, npc.y);
            ctx.fillStyle = '#ff6b9d';
            ctx.fillRect(iso.x - 6, iso.y - 8, 12, 12);
            ctx.fillStyle = '#fff';
            ctx.fillRect(iso.x - 2, iso.y - 4, 4, 4);
        }

        // Draw enemies
        for (let enemy of this.enemies) {
            if (enemy.alive) {
                const iso = TileHelper.cartToIsometric(enemy.x, enemy.y);
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.arc(iso.x, iso.y - 4, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.fillRect(iso.x - 3, iso.y - 6, 2, 2);
                ctx.fillRect(iso.x + 1, iso.y - 6, 2, 2);
            }
        }

        // Draw player
        const playerScreenPos = TileHelper.cartToIsometric(this.player.x, this.player.y);
        ctx.fillStyle = '#ff8c42';
        ctx.beginPath();
        ctx.arc(playerScreenPos.x, playerScreenPos.y - 4, 7, 0, Math.PI * 2);
        ctx.fill();

        // Draw sword if attacking
        if (this.player.isAttacking) {
            ctx.strokeStyle = '#ffed4e';
            ctx.lineWidth = 3;
            const dirs = [
                { x: 12, y: 0 },
                { x: 0, y: 12 },
                { x: -12, y: 0 },
                { x: 0, y: -12 }
            ];
            const d = dirs[this.player.direction];
            ctx.beginPath();
            ctx.moveTo(playerScreenPos.x, playerScreenPos.y - 4);
            ctx.lineTo(playerScreenPos.x + d.x, playerScreenPos.y - 4 + d.y);
            ctx.stroke();
        }

        // Draw player eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(playerScreenPos.x - 2, playerScreenPos.y - 6, 1, 1);
        ctx.fillRect(playerScreenPos.x + 1, playerScreenPos.y - 6, 1, 1);

        ctx.restore();

        // Draw UI info
        if (this.npcs.length > 0) {
            const dist = Math.abs(this.npcs[0].x - this.player.x) + Math.abs(this.npcs[0].y - this.player.y);
            if (dist <= 2) {
                document.getElementById('levelInfo').textContent = 'Press Z to talk';
            } else {
                document.getElementById('levelInfo').textContent = '';
            }
        }
    }

    drawIsometricTile(ctx, isoX, isoY, shadowColor) {
        const w = TILE_SIZE / 2;
        const h = TILE_SIZE / 4;

        // Draw tile diamond
        ctx.beginPath();
        ctx.moveTo(isoX, isoY - h);
        ctx.lineTo(isoX + w, isoY);
        ctx.lineTo(isoX, isoY + h);
        ctx.lineTo(isoX - w, isoY);
        ctx.closePath();
        ctx.fill();

        // Draw shadow
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.moveTo(isoX, isoY);
        ctx.lineTo(isoX + w, isoY);
        ctx.lineTo(isoX, isoY + h);
        ctx.lineTo(isoX - w, isoY);
        ctx.closePath();
        ctx.fill();
    }

    isComplete() {
        // Win condition: collect sword and defeat enemies
        return state.inventory.includes(ITEM_TYPES.SWORD) && this.enemies.filter(e => e.alive).length === 0;
    }
}

let currentLevel = null;

function initializeLevel() {
    // Set canvas size
    const container = document.querySelector('.game-world');
    screens.canvas.width = container.clientWidth;
    screens.canvas.height = container.clientHeight;
    
    currentLevel = new ZeldaLevel(state.currentRoom);
    state.gameRunning = true;
    updateInventoryDisplay();
    document.getElementById('roomTitle').textContent = state.currentRoom === 'entrance' ? 'Entrance Hall' : 'Dungeon Chamber';
    
    gameLoop();
}

function gameLoop() {
    if (!state.gameRunning) return;
    
    currentLevel.update();
    currentLevel.draw(ctx, screens.canvas);
    
    if (currentLevel.isComplete()) {
        state.gameRunning = false;
        triggerPrank();
    } else if (currentLevel.player.health <= 0) {
        state.gameRunning = false;
        triggerGameOver();
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function updateInventoryDisplay() {
    if (state.inventory.length === 0) {
        document.getElementById('itemDisplay').textContent = '-';
    } else {
        const items = state.inventory.map(item => item === 'sword' ? '⚔️' : item).join(', ');
        document.getElementById('itemDisplay').textContent = items;
    }
}

// ============ GAME TRANSITIONS ============
function triggerPrank() {
    setTimeout(() => {
        screens.levelScreen.classList.remove('active');
        screens.levelScreen.style.display = 'none';
        screens.levelScreen.classList.add('fade-out');
        
        setTimeout(() => {
            screens.levelScreen.style.display = 'flex';
            screens.levelScreen.classList.remove('fade-out');
            screens.foolsScreen.classList.add('active');
            createConfetti();
            
            // Show continue button instead of restart
            document.getElementById('continueButton').style.display = 'block';
            document.getElementById('restartButton').style.display = 'none';
        }, 600);
    }, 500);
}

function triggerGameOver() {
    setTimeout(() => {
        screens.levelScreen.classList.remove('active');
        screens.levelScreen.style.display = 'none';
        screens.levelScreen.classList.add('fade-out');
        
        setTimeout(() => {
            screens.levelScreen.style.display = 'flex';
            screens.levelScreen.classList.remove('fade-out');
            screens.foolsScreen.classList.add('active');
            
            document.querySelector('.fools-message-box').innerHTML = '<p>You died!</p><p>Game Over...</p>';
            document.getElementById('restartButton').style.display = 'block';
            document.getElementById('continueButton').style.display = 'none';
        }, 600);
    }, 500);
}
screens.restartButton.addEventListener('click', () => {
    screens.bootScreen.classList.add('active');
    screens.bootScreen.classList.remove('fade-out');
    screens.gameScreen.classList.remove('active', 'fade-out');
    screens.gameScreen.style.display = 'flex';
    screens.levelScreen.classList.remove('active', 'fade-out');
    screens.levelScreen.style.display = 'flex';
    screens.loadingScreen.classList.remove('active');
    screens.foolsScreen.classList.remove('active');
    screens.playButton.style.pointerEvents = 'auto';
    screens.playButton.style.opacity = '1';
    
    state.gameRunning = false;
    
    // Clear confetti
    document.querySelectorAll('.floating-confetti').forEach(conf => conf.remove());
    
    // Restore loading dots
    document.querySelectorAll('.loading-dots .dot').forEach(dot => {
        dot.style.display = 'inline-block';
    });
});

// ============ RESTART AND CONTINUE BUTTONS ============
screens.restartButton.addEventListener('click', () => {
    screens.bootScreen.classList.add('active');
    screens.bootScreen.classList.remove('fade-out');
    screens.gameScreen.classList.remove('active', 'fade-out');
    screens.gameScreen.style.display = 'flex';
    screens.levelScreen.classList.remove('active', 'fade-out');
    screens.levelScreen.style.display = 'flex';
    screens.loadingScreen.classList.remove('active');
    screens.foolsScreen.classList.remove('active');
    screens.playButton.style.pointerEvents = 'auto';
    screens.playButton.style.opacity = '1';
    
    state.gameRunning = false;
    state.inventory = [];
    state.hasKey = false;
    state.currentRoom = 'entrance';
    state.gamePhase = 'room';
    
    // Clear confetti
    document.querySelectorAll('.floating-confetti').forEach(conf => conf.remove());
    
    // Reset progress bar
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('loadingText').textContent = 'Initializing game engine...';
});

// Placeholder continue button handler (not used in simplified version)
screens.continueButton.addEventListener('click', () => {
    screens.bootScreen.classList.add('active');
    screens.bootScreen.classList.remove('fade-out');
    screens.gameScreen.classList.remove('active', 'fade-out');
    screens.gameScreen.style.display = 'flex';
    screens.foolsScreen.classList.remove('active');
    screens.playButton.style.pointerEvents = 'auto';
    screens.playButton.style.opacity = '1';
});

// ============ CONFETTI ANIMATION ============
function createConfetti() {
    const confettiCount = 50;
    const colors = ['#ff6b9d', '#ff9e64', '#ffd700', '#4ecdc4', '#44a5c2', '#f38181'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('floating-confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.borderRadius = '50%';
        confetti.style.position = 'fixed';
        confetti.style.opacity = Math.random() * 0.7 + 0.3;
        confetti.style.top = '-10px';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '1000';
        
        const duration = Math.random() * 2 + 2;
        const delay = Math.random() * 0.5;
        const rotation = Math.random() * 360;
        
        confetti.style.animation = `confettiFall ${duration}s linear ${delay}s forwards`;
        confetti.style.transform = `rotateZ(${rotation}deg)`;
        
        document.body.appendChild(confetti);
    }
}

// ============ DYNAMIC CONFETTI KEYFRAMES ============
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
