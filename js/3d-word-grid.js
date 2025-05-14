// Ensure Three.js and OrbitControls are loaded
import wordLists from './3d-word-lists.js';

// Ensure Three.js and OrbitControls are loaded
if (typeof THREE === 'undefined') console.error('Three.js has not been loaded.');

(function() { // IIFE
    let scene, camera, renderer, player, orbitControls;
    let gameContainer;
    const lettersInScene = [];
    let targetWord = "";
    let previousWord = "";
    let currentWordIndex = 0;
    let collectedWordString = "";

    let UIElements = {}; 

    const gridSize = 10;
    const cellSize = 2;
    let gameActive = false; 
    let fontInstance = null;

    // Difficulty settings
    let timerDifficulty = 'none'; // 'none', 'easy', 'medium', 'hard', 'impossible'
    let wordLengthDifficulty = 'medium'; // 'easy', 'medium', 'hard', 'expert'
    
    let timerDuration = 0; // Will be set based on timerDifficulty
    let currentTimeLeft = 0;
    let timerInterval = null;
    let currentStreak = 0;

    const timerSettings = {
        'none': 0,
        'easy': 120,
        'medium': 60,
        'hard': 30,
        'impossible': 10
    };

    const wordLengthSettings = {
        'easy': "3",
        'medium': "5",
        'hard': "7",
        'expert': "10"
    };

    function selectNewWord() {
        const targetLength = wordLengthSettings[wordLengthDifficulty];
        const availableWords = wordLists[targetLength];

        if (!availableWords || availableWords.length === 0) {
            console.warn(`No words of length ${targetLength} found. Using default word.`);
            targetWord = "EMPTY";
            return;
        }

        let newWordCandidate;
        if (availableWords.length === 1) {
            newWordCandidate = availableWords[0].toUpperCase();
        } else {
            do {
                const randomIndex = Math.floor(Math.random() * availableWords.length);
                newWordCandidate = availableWords[randomIndex].toUpperCase();
            } while (newWordCandidate === previousWord && availableWords.length > 1);
        }

        targetWord = newWordCandidate;
        previousWord = targetWord;
        console.log(`New target word (Length ${targetLength}):`, targetWord);
    }

    function init() {
        gameContainer = document.getElementById('cube-container');
        if (!gameContainer) return;
        gameContainer.innerHTML = ''; 

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
        camera = new THREE.PerspectiveCamera(60, gameContainer.clientWidth / gameContainer.clientHeight, 0.1, 1000);
        camera.position.set(gridSize * cellSize * 0.7, gridSize * cellSize * 0.6, gridSize * cellSize * 0.7);
        camera.lookAt(gridSize * cellSize / 2, 0, gridSize * cellSize / 2);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
        gameContainer.appendChild(renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            orbitControls.target.set(gridSize * cellSize / 2, 0, gridSize * cellSize / 2);
        } else console.warn("OrbitControls not loaded.");

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 15, 10);
        scene.add(directionalLight);
        const gridHelper = new THREE.GridHelper(gridSize * cellSize, gridSize, 0x333333, 0x333333);
        gridHelper.position.set(gridSize * cellSize / 2 - cellSize / 2, 0, gridSize * cellSize / 2 - cellSize / 2);
        scene.add(gridHelper);
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(gridSize * cellSize, gridSize * cellSize),
            new THREE.MeshStandardMaterial({ color: 0x90ee90, side: THREE.DoubleSide })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(gridSize * cellSize / 2 - cellSize / 2, -0.01, gridSize * cellSize / 2 - cellSize / 2);
        scene.add(plane);

        player = new THREE.Mesh(
            new THREE.SphereGeometry(cellSize / 4, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        player.position.set(cellSize / 2, cellSize / 4, cellSize / 2);
        scene.add(player);
        
        createGameSetupUI();
        createArrowButtons();
        window.addEventListener('resize', onWindowResize, false);
        animate();
    }

    function createArrowButtons() {
        const buttonSize = '40px';
        const buttonColor = '#4CAF50'; // Green
        const buttonStyle = `
            position: absolute;
            width: ${buttonSize};
            height: ${buttonSize};
            background-color: ${buttonColor};
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            text-align: center;
            line-height: ${buttonSize};
            cursor: pointer;
            z-index: 101;
        `;

        // Up Arrow
        UIElements.arrowUp = document.createElement('button');
        UIElements.arrowUp.innerHTML = '&#8593;'; // Up arrow
        UIElements.arrowUp.style = buttonStyle + 'top: 10px; left: 50%; transform: translateX(-50%);';
        gameContainer.appendChild(UIElements.arrowUp);

        // Down Arrow
        UIElements.arrowDown = document.createElement('button');
        UIElements.arrowDown.innerHTML = '&#8595;'; // Down arrow
        UIElements.arrowDown.style = buttonStyle + 'bottom: 10px; left: 50%; transform: translateX(-50%);';
        gameContainer.appendChild(UIElements.arrowDown);

        // Left Arrow
        UIElements.arrowLeft = document.createElement('button');
        UIElements.arrowLeft.innerHTML = '&#8592;'; // Left arrow
        UIElements.arrowLeft.style = buttonStyle + 'top: 50%; left: 10px; transform: translateY(-50%);';
        gameContainer.appendChild(UIElements.arrowLeft);

        // Right Arrow
        UIElements.arrowRight = document.createElement('button');
        UIElements.arrowRight.innerHTML = '&#8594;'; // Right arrow
        UIElements.arrowRight.style = buttonStyle + 'top: 50%; right: 10px; transform: translateY(-50%);';
        gameContainer.appendChild(UIElements.arrowRight);

        // Add event listeners
        UIElements.arrowUp.addEventListener('click', () => { if (gameActive) handleMove('ArrowUp'); });
        UIElements.arrowDown.addEventListener('click', () => { if (gameActive) handleMove('ArrowDown'); });
        UIElements.arrowLeft.addEventListener('click', () => { if (gameActive) handleMove('ArrowLeft'); });
        UIElements.arrowRight.addEventListener('click', () => { if (gameActive) handleMove('ArrowRight'); });
    }

    function createGameSetupUI() {
        const setupContainer = document.createElement('div');
        setupContainer.id = "game-setup-container";
        Object.assign(setupContainer.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            padding: '20px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white',
            fontFamily: 'Arial, sans-serif', zIndex: '110', borderRadius: '10px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: '10px'
        });

        const title = document.createElement('h3');
        title.textContent = "Game Difficulty Setup";
        setupContainer.appendChild(title);

        // Word Length Difficulty
        let div = document.createElement('div');
        let label = document.createElement('label');
        label.textContent = "Word Length: ";
        label.htmlFor = "wordLengthSelect";
        div.appendChild(label);
        const wordLengthSelect = document.createElement('select');
        wordLengthSelect.id = "wordLengthSelect";
        wordLengthSelect.innerHTML = `
            <option value="easy">Easy (3 Letters)</option>
            <option value="medium" selected>Medium (5 Letters)</option>
            <option value="hard">Hard (7 Letters)</option>
            <option value="expert">Expert (10 Letters)</option>
        `;
        div.appendChild(wordLengthSelect);
        setupContainer.appendChild(div);

        // Timer Difficulty
        div = document.createElement('div');
        label = document.createElement('label');
        label.textContent = "Timer: ";
        label.htmlFor = "timerDifficultySelect";
        div.appendChild(label);
        const timerDifficultySelect = document.createElement('select');
        timerDifficultySelect.id = "timerDifficultySelect";
        timerDifficultySelect.innerHTML = `
            <option value="none">No Timer</option>
            <option value="easy">Easy (120s)</option>
            <option value="medium" selected>Medium (60s)</option>
            <option value="hard">Hard (30s)</option>
            <option value="impossible">Impossible (10s)</option>
        `;
        div.appendChild(timerDifficultySelect);
        setupContainer.appendChild(div);
        
        const startButton = document.createElement('button');
        startButton.textContent = "Start Game";
        startButton.style.padding = '10px 20px';
        startButton.style.fontSize = '16px';
        startButton.style.marginTop = '10px';
        startButton.onclick = () => {
            wordLengthDifficulty = wordLengthSelect.value;
            timerDifficulty = timerDifficultySelect.value;
            timerDuration = timerSettings[timerDifficulty];
            
            currentStreak = 0; 
            gameContainer.removeChild(setupContainer); 
            startGame(); 
        };
        setupContainer.appendChild(startButton);
        gameContainer.appendChild(setupContainer);
    }
    
    function startGame() {
        createInGameUI(); 
        selectNewWord();
        loadFontAndPlaceLetters();
        resetPlayerAndWordState();
        gameActive = true;
        setupControls();
        if (timerDifficulty !== 'none') {
            startTimer();
        }
        updateUI();
    }

    function createInGameUI() { 
        const uiContainer = document.createElement('div');
        uiContainer.id = "game-ui-container";
        Object.assign(uiContainer.style, {
            position: 'absolute', top: '10px', left: '10px', padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontFamily: 'Arial, sans-serif',
            zIndex: '100', borderRadius: '5px', fontSize: '14px', minWidth: '220px'
        });
        
        UIElements.targetWordDisplay = document.createElement('p');
        uiContainer.appendChild(UIElements.targetWordDisplay);
        UIElements.collectedLettersDisplay = document.createElement('p');
        uiContainer.appendChild(UIElements.collectedLettersDisplay);
        UIElements.statusDisplay = document.createElement('p');
        uiContainer.appendChild(UIElements.statusDisplay);

        if (timerDifficulty !== 'none') {
            UIElements.timerDisplay = document.createElement('p');
            uiContainer.appendChild(UIElements.timerDisplay);
            UIElements.streakDisplay = document.createElement('p');
            uiContainer.appendChild(UIElements.streakDisplay);
        }
        
        UIElements.nextWordButton = document.createElement('button');
        UIElements.nextWordButton.textContent = "Next Word";
        UIElements.nextWordButton.style.display = 'none'; 
        UIElements.nextWordButton.style.marginTop = '10px';
        UIElements.nextWordButton.onclick = prepareNextWord;
        uiContainer.appendChild(UIElements.nextWordButton);
        
        UIElements.quitButton = document.createElement('button'); // Quit to setup
        UIElements.quitButton.textContent = "Change Difficulty";
        UIElements.quitButton.style.marginLeft = '10px';
        UIElements.quitButton.style.marginTop = '10px';
        UIElements.quitButton.style.backgroundColor = '#555';
        UIElements.quitButton.onclick = () => {
            gameActive = false;
            if(timerInterval) clearInterval(timerInterval);
            const currentUI = document.getElementById('game-ui-container');
            if(currentUI) gameContainer.removeChild(currentUI);
            removeControls();
            createGameSetupUI(); // Show setup screen again
        };
        uiContainer.appendChild(UIElements.quitButton);


        gameContainer.appendChild(uiContainer);
    }
    
    function updateUI() {
        if (!UIElements.targetWordDisplay) return;
        UIElements.targetWordDisplay.textContent = `Find (${wordLengthSettings[wordLengthDifficulty]} letters): ${targetWord}`;
        UIElements.collectedLettersDisplay.textContent = `Collected: ${collectedWordString}`;

        if (timerDifficulty !== 'none' && UIElements.timerDisplay && UIElements.streakDisplay) {
            UIElements.timerDisplay.textContent = `Time: ${currentTimeLeft}s`;
            UIElements.streakDisplay.textContent = `Streak: ${currentStreak}`;
        } else if (UIElements.streakDisplay) { 
        UIElements.streakDisplay.textContent = '';
             if(UIElements.timerDisplay) UIElements.timerDisplay.textContent = 'Timer: Off';
        }
    }

    function startTimer() {
        currentTimeLeft = timerDuration;
        updateUI(); 
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            currentTimeLeft--;
            updateUI();
            if (currentTimeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimerEnd();
            }
        }, 1000);
    }

    function handleTimerEnd() {
        gameActive = false; 
        UIElements.statusDisplay.textContent = `Time's up! The word was "${targetWord}".`;
        UIElements.statusDisplay.style.color = "orange";
        if (timerDifficulty !== 'none') { // Streak only applies to timed modes
            currentStreak = 0; 
        }
        UIElements.nextWordButton.style.display = 'block';
        updateUI();
    }
    
    function resetPlayerAndWordState() {
        player.position.set(cellSize / 2, cellSize / 4, cellSize / 2);
        collectedWordString = "";
        currentWordIndex = 0;
        if (UIElements.statusDisplay) UIElements.statusDisplay.textContent = "";
        if (UIElements.definitionDisplay) UIElements.definitionDisplay.textContent = "";
        if (UIElements.nextWordButton) UIElements.nextWordButton.style.display = 'none';
        gameActive = true; 
    }

    function prepareNextWord() {
        resetPlayerAndWordState();
        selectNewWord();
        loadFontAndPlaceLetters(); 
        if (timerDifficulty !== 'none') {
            startTimer(); 
        }
        updateUI();
    }

    function loadFontAndPlaceLetters() {
        if (fontInstance) placeLetters();
        else {
            const loader = new THREE.FontLoader();
            loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
                fontInstance = font;
                placeLetters();
            });
        }
    }

    function clearLetters() {
        lettersInScene.forEach(obj => {
            if (obj.mesh && obj.mesh.parent) scene.remove(obj.mesh);
        });
        lettersInScene.length = 0;
    }

    function placeLetters() {
        clearLetters();
        if (!fontInstance || !targetWord) return;
        const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
        const height = cellSize / 2;
        const positions = new Set();
        positions.add(`${Math.floor(player.position.x / cellSize)},${Math.floor(player.position.z / cellSize)}`);

        for (let i = 0; i < targetWord.length; i++) {
            const char = targetWord[i];
            const geom = new THREE.TextGeometry(char, { font: fontInstance, size: cellSize * 0.7, height: cellSize * 0.15 });
            geom.center();
            const mesh = new THREE.Mesh(geom, material.clone()); 
            let cellX, cellZ, key;
            do {
                cellX = Math.floor(Math.random() * gridSize);
                cellZ = Math.floor(Math.random() * gridSize);
                key = `${cellX},${cellZ}`;
            } while (positions.has(key));
            positions.add(key);
            mesh.position.set(cellX * cellSize + cellSize / 2, height, cellZ * cellSize + cellSize / 2);
            mesh.userData = { char: char };
            scene.add(mesh);
            lettersInScene.push({ char: char, mesh: mesh, collected: false });
        }
    }
    
    function resetGameAttempt() { 
        collectedWordString = "";
        currentWordIndex = 0;
        UIElements.statusDisplay.textContent = "Incorrect order! Try again.";
        UIElements.statusDisplay.style.color = "pink";
        lettersInScene.forEach(obj => { 
            if(obj.mesh) obj.mesh.visible = true; 
            obj.collected = false; 
        });
        
        if (timerDifficulty !== 'none') { 
            currentStreak = 0; 
        }

        updateUI();
        setTimeout(() => { if(UIElements.statusDisplay) UIElements.statusDisplay.textContent = ""; }, 2000);
    }

    function setupControls() {  } // document.addEventListener('keydown', handleKeyDown); }
    function removeControls() {  } // document.removeEventListener('keydown', handleKeyDown); }

    function handleMove(direction) {
        if (!gameActive) return;
        const moveDist = cellSize;
        let moved = false;
        switch (direction) {
            case 'ArrowUp': player.position.z -= moveDist; moved = true; break;
            case 'ArrowDown': player.position.z += moveDist; moved = true; break;
            case 'ArrowLeft': player.position.x -= moveDist; moved = true; break;
            case 'ArrowRight': player.position.x += moveDist; moved = true; break;
        }
        if (moved) {
            const minB = cellSize / 2;
            const maxB = (gridSize - 1) * cellSize + cellSize / 2;
            player.position.x = Math.max(minB, Math.min(maxB, player.position.x));
            player.position.z = Math.max(minB, Math.min(maxB, player.position.z));
            checkLetterCollision();
        }
    }

    function checkLetterCollision() {
        if (!gameActive) return;
        for (let i = 0; i < lettersInScene.length; i++) {
            const letterObj = lettersInScene[i];
            if (letterObj.mesh && !letterObj.collected && letterObj.mesh.visible && player.position.distanceTo(letterObj.mesh.position) < cellSize * 0.75) {
                if (letterObj.char === targetWord[currentWordIndex]) {
                    letterObj.collected = true;
                    letterObj.mesh.visible = false;
                    collectedWordString += letterObj.char;
                    currentWordIndex++;
                    UIElements.statusDisplay.textContent = "Correct letter!";
                    UIElements.statusDisplay.style.color = "lightyellow";
                    updateUI();
                    if (collectedWordString.length === targetWord.length) { 
                        gameActive = false;
                        if (timerDifficulty !== 'none') {
                            clearInterval(timerInterval); 
                            currentStreak++;
                        }
                        UIElements.statusDisplay.textContent = `Correct! You found "${targetWord}"!`;
                        UIElements.statusDisplay.style.color = "lightgreen";
                        UIElements.nextWordButton.style.display = 'block';
                        updateUI();
                    }
                } else {
                    resetGameAttempt();
                    break; 
                }
            }
        }
    }

    function onWindowResize() {
        if (gameContainer && camera && renderer) {
            camera.aspect = gameContainer.clientWidth / gameContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        if (orbitControls) orbitControls.update();
        if (renderer) renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
