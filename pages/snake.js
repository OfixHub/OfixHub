/**
 * Clase principal del juego Snake
 * Versión corregida y optimizada
 */
class SnakeGame {
    constructor() {
        // Configuración del juego
        this.config = {
            boxSize: 15,
            initialSpeed: 150,
            minSpeed: 50,
            speedIncrement: 10,
            scoreMultiplier: 5
        };

        // Estado del juego
        this.state = {
            snake: [],
            food: {},
            direction: 'RIGHT',
            nextDirection: 'RIGHT',
            score: 0,
            gameSpeed: 150,
            gameInterval: null,
            touchStartX: null,
            touchStartY: null
        };

        // Elementos del DOM
        this.elements = {
            canvas: null,
            ctx: null,
            scoreElement: null,
            restartBtn: null,
            contactBtn: null,
            gameOverBtns: null,
            canvasContainer: null,
            touchInstruction: null
        };
    }

    /**
     * Inicialización principal del juego
     */
    init() {
        this.getDOMElements();
        if (!this.elements.canvas) {
            console.error("❌ No se encontró el elemento canvas con id 'game'");
            return false;
        }
        
        if (!this.elements.ctx) {
            console.error("❌ No se pudo obtener el contexto 2D del canvas");
            return false;
        }

        this.setupGame();
        this.setupControls();
        this.checkTouchDevice();
        this.startGame();
        console.log("✅ Snake Game inicializado correctamente");
        return true;
    }

    /**
     * Obtener referencias a elementos del DOM
     */
    getDOMElements() {
        this.elements.canvas = document.getElementById('game');
        
        if (this.elements.canvas) {
            this.elements.ctx = this.elements.canvas.getContext('2d');
        }
        
        this.elements.scoreElement = document.getElementById('scoreValue');
        this.elements.restartBtn = document.getElementById('restartBtn');
        this.elements.contactBtn = document.getElementById('contactBtn');
        this.elements.gameOverBtns = document.getElementById('gameOverBtns');
        this.elements.canvasContainer = document.getElementById('canvasContainer');
        this.elements.touchInstruction = document.querySelector('.touch-instruction');
        
        // Log para debugging
        if (!this.elements.canvas) {
            console.warn("⚠️ Canvas no encontrado");
        }
        if (!this.elements.restartBtn) {
            console.warn("⚠️ Botón Reiniciar no encontrado");
        }
        if (!this.elements.contactBtn) {
            console.warn("⚠️ Botón Contacto no encontrado");
        }
    }

    /**
     * Configurar estado inicial del juego
     */
    setupGame() {
        this.state.snake = [
            { x: 10 * this.config.boxSize, y: 10 * this.config.boxSize },
            { x: 9 * this.config.boxSize, y: 10 * this.config.boxSize }
        ];
        this.state.direction = 'RIGHT';
        this.state.nextDirection = 'RIGHT';
        this.state.score = 0;
        this.state.gameSpeed = this.config.initialSpeed;
        this.generateFood();
        this.updateScore();
    }

    /**
     * Configurar controladores de eventos
     */
    setupControls() {
        // Limpiar event listeners previos
        if (this.handleKeyDownBound) {
            document.removeEventListener('keydown', this.handleKeyDownBound);
        }
        if (this.handleTouchStartBound && this.elements.canvasContainer) {
            this.elements.canvasContainer.removeEventListener('touchstart', this.handleTouchStartBound);
            this.elements.canvasContainer.removeEventListener('touchmove', this.handleTouchMoveBound);
        }
        if (this.resetGameBound && this.elements.restartBtn) {
            this.elements.restartBtn.removeEventListener('click', this.resetGameBound);
        }
        if (this.handleContactClickBound && this.elements.contactBtn) {
            this.elements.contactBtn.removeEventListener('click', this.handleContactClickBound);
        }

        // Crear bindings para los métodos
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleTouchStartBound = this.handleTouchStart.bind(this);
        this.handleTouchMoveBound = this.handleTouchMove.bind(this);
        this.resetGameBound = this.resetGame.bind(this);
        this.handleContactClickBound = this.handleContactClick.bind(this);

        // Agregar nuevos event listeners
        document.addEventListener('keydown', this.handleKeyDownBound);
        
        if (this.elements.canvasContainer) {
            this.elements.canvasContainer.addEventListener('touchstart', this.handleTouchStartBound, { passive: false });
            this.elements.canvasContainer.addEventListener('touchmove', this.handleTouchMoveBound, { passive: false });
        }
        
        if (this.elements.restartBtn) {
            this.elements.restartBtn.addEventListener('click', this.resetGameBound);
        }
        
        if (this.elements.contactBtn) {
            this.elements.contactBtn.addEventListener('click', this.handleContactClickBound);
        }
    }

    /**
     * Verificar si es un dispositivo táctil
     */
    checkTouchDevice() {
        if (this.elements.touchInstruction && ('ontouchstart' in window || navigator.maxTouchPoints)) {
            this.elements.touchInstruction.style.display = 'block';
        }
    }

    /**
     * Iniciar el bucle principal del juego
     */
    startGame() {
        if (this.state.gameInterval) {
            clearInterval(this.state.gameInterval);
        }
        
        this.state.gameInterval = setInterval(() => {
            this.gameLoop();
        }, this.state.gameSpeed);
        
        if (this.elements.gameOverBtns) {
            this.elements.gameOverBtns.style.display = 'none';
        }
    }

    /**
     * Reiniciar el juego
     */
    resetGame() {
        this.setupGame();
        this.startGame();
    }

    /**
     * Bucle principal del juego
     */
    gameLoop() {
        this.updateGameState();
        this.drawGame();
    }

    /**
     * Actualizar el estado del juego
     */
    updateGameState() {
        this.state.direction = this.state.nextDirection;
        const head = {...this.state.snake[0]};
        
        // Mover cabeza según dirección
        switch(this.state.direction) {
            case 'LEFT': head.x -= this.config.boxSize; break;
            case 'RIGHT': head.x += this.config.boxSize; break;
            case 'UP': head.y -= this.config.boxSize; break;
            case 'DOWN': head.y += this.config.boxSize; break;
        }
        
        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }
        
        this.state.snake.unshift(head);
        
        if (head.x === this.state.food.x && head.y === this.state.food.y) {
            this.state.score++;
            this.updateScore();
            this.generateFood();
            
            if (this.state.score % this.config.scoreMultiplier === 0 && 
                this.state.gameSpeed > this.config.minSpeed) {
                this.state.gameSpeed -= this.config.speedIncrement;
                this.startGame();
            }
        } else {
            this.state.snake.pop();
        }
    }

    /**
     * Dibujar el estado actual del juego
     */
    drawGame() {
        // Limpiar canvas
        this.elements.ctx.fillStyle = '#c8e6c9';
        this.elements.ctx.fillRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
        
        // Dibujar serpiente
        this.state.snake.forEach((segment, index) => {
            this.elements.ctx.fillStyle = index === 0 ? '#1b5e20' : '#66bb6a';
            this.elements.ctx.fillRect(segment.x, segment.y, this.config.boxSize-1, this.config.boxSize-1);
        });
        
        // Dibujar comida
        this.elements.ctx.fillStyle = '#d32f2f';
        this.elements.ctx.fillRect(this.state.food.x, this.state.food.y, this.config.boxSize, this.config.boxSize);
    }

    /**
     * Generar nueva posición para la comida
     */
    generateFood() {
        const maxPos = Math.floor(this.elements.canvas.width / this.config.boxSize) - 1;
        this.state.food = {
            x: Math.floor(Math.random() * maxPos) * this.config.boxSize,
            y: Math.floor(Math.random() * maxPos) * this.config.boxSize
        };
        
        // Asegurar que no aparezca en la serpiente
        while (this.state.snake.some(segment => 
            segment.x === this.state.food.x && segment.y === this.state.food.y)) {
            this.state.food.x = Math.floor(Math.random() * maxPos) * this.config.boxSize;
            this.state.food.y = Math.floor(Math.random() * maxPos) * this.config.boxSize;
        }
    }

    /**
     * Verificar colisiones
     */
    checkCollision(head) {
        // Paredes
        if (head.x < 0 || head.x >= this.elements.canvas.width || 
            head.y < 0 || head.y >= this.elements.canvas.height) {
            return true;
        }
        
        // Auto-colisión
        for (let i = 1; i < this.state.snake.length; i++) {
            if (head.x === this.state.snake[i].x && head.y === this.state.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Actualizar la visualización del puntaje
     */
    updateScore() {
        if (this.elements.scoreElement) {
            this.elements.scoreElement.textContent = this.state.score;
        }
    }

    /**
     * Finalizar el juego
     */
    endGame() {
        clearInterval(this.state.gameInterval);
        this.state.gameInterval = null;
        
        if (this.elements.gameOverBtns) {
            this.elements.gameOverBtns.style.display = 'flex';
        }
    }

    /**
     * Manejador de eventos de teclado
     */
    handleKeyDown(e) {
        if (!['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) return;
        
        e.preventDefault();
        
        switch(e.key) {
            case 'ArrowLeft':
                if (this.state.direction !== 'RIGHT') this.state.nextDirection = 'LEFT';
                break;
            case 'ArrowUp':
                if (this.state.direction !== 'DOWN') this.state.nextDirection = 'UP';
                break;
            case 'ArrowRight':
                if (this.state.direction !== 'LEFT') this.state.nextDirection = 'RIGHT';
                break;
            case 'ArrowDown':
                if (this.state.direction !== 'UP') this.state.nextDirection = 'DOWN';
                break;
        }
        
        if (!this.state.gameInterval) {
            this.resetGame();
        }
    }

    /**
     * Manejador de inicio de toque
     */
    handleTouchStart(e) {
        e.preventDefault();
        this.state.touchStartX = e.touches[0].clientX;
        this.state.touchStartY = e.touches[0].clientY;
    }

    /**
     * Manejador de movimiento táctil
     */
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.state.touchStartX || !this.state.touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - this.state.touchStartX;
        const dy = touchEndY - this.state.touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && this.state.direction !== 'LEFT') this.state.nextDirection = 'RIGHT';
            else if (dx < 0 && this.state.direction !== 'RIGHT') this.state.nextDirection = 'LEFT';
        } else {
            if (dy > 0 && this.state.direction !== 'UP') this.state.nextDirection = 'DOWN';
            else if (dy < 0 && this.state.direction !== 'DOWN') this.state.nextDirection = 'UP';
        }
        
        this.state.touchStartX = touchEndX;
        this.state.touchStartY = touchEndY;
        
        if (!this.state.gameInterval) {
            this.resetGame();
        }
    }

    /**
     * Manejador del botón de contacto
     */
    handleContactClick() {
        // Volver a la página de inicio
        if (window.cargarContenido) {
            window.cargarContenido('pages/inicio.html');
        } else {
            window.location.href = '/';
        }
    }
}

// Función para inicializar el juego
function initializeSnakeGame() {
    console.log("🎮 Intentando inicializar Snake Game...");
    
    // Limpiar instancia anterior si existe
    if (window.snakeGameInstance) {
        console.log("🧹 Limpiando instancia anterior");
        clearInterval(window.snakeGameInstance.state.gameInterval);
    }
    
    // Crear nueva instancia del juego
    window.snakeGameInstance = new SnakeGame();
    const initialized = window.snakeGameInstance.init();
    
    if (initialized) {
        console.log("✅ Snake Game inicializado correctamente");
    } else {
        console.error("❌ Error: No se pudo inicializar Snake Game");
    }
}

// Inicializar en DOMContentLoaded (para carga inicial)
if (document.readyState === 'loading') {
    console.log("📄 Documento aún se está cargando, esperando DOMContentLoaded...");
    document.addEventListener('DOMContentLoaded', () => {
        console.log("📄 DOMContentLoaded dispuesto");
        initializeSnakeGame();
    });
} else {
    // Si el documento ya está listo, inicializar directamente
    console.log("📄 Documento ya está listo, inicializando directamente");
    initializeSnakeGame();
}

// Re-inicializar cuando se cargue la página dinamicamente
document.addEventListener('paginaCargada', (event) => {
    console.log("📄 Evento paginaCargada disparado:", event.detail.pagina);
    if (event.detail.pagina && event.detail.pagina.includes('tecnologia')) {
        console.log("🎮 Página de tecnología cargada, inicializando juego...");
        // Esperar a que el contenido se renderice
        setTimeout(initializeSnakeGame, 100);
    }
});