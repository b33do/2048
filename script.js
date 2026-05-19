// ==========================================
// 1. DATA MODELS & UTILITIES (FAST AI LAYER)
// ==========================================

const SIZE = 4;

/**
 * Lightweight board class used for AI expectimax evaluations.
 * No DOM references or overhead for maximum lookahead speeds.
 */
class Board {
    constructor() {
        this.grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        this.score = 0;
    }

    clone() {
        const b = new Board();
        b.score = this.score;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                b.grid[r][c] = this.grid[r][c];
            }
        }
        return b;
    }

    spawnTile() {
        const empties = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (this.grid[r][c] === 0) {
                    empties.push({r, c});
                }
            }
        }
        if (empties.length === 0) return false;
        const {r, c} = empties[Math.floor(Math.random() * empties.length)];
        this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }

    canMove() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (this.grid[r][c] === 0) return true;
            }
        }
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE - 1; c++) {
                if (this.grid[r][c] === this.grid[r][c + 1]) return true;
            }
        }
        for (let c = 0; c < SIZE; c++) {
            for (let r = 0; r < SIZE - 1; r++) {
                if (this.grid[r][c] === this.grid[r + 1][c]) return true;
            }
        }
        return false;
    }

    move(direction) {
        let moved = false;
        let gained = 0;

        if (direction === 0) { // Up
            for (let c = 0; c < SIZE; c++) {
                const col = [];
                for (let r = 0; r < SIZE; r++) col.push(this.grid[r][c]);
                const [merged, g] = this._merge(col);
                gained += g;
                for (let r = 0; r < SIZE; r++) {
                    if (this.grid[r][c] !== merged[r]) moved = true;
                    this.grid[r][c] = merged[r];
                }
            }
        } else if (direction === 2) { // Down
            for (let c = 0; c < SIZE; c++) {
                const col = [];
                for (let r = SIZE - 1; r >= 0; r--) col.push(this.grid[r][c]);
                const [merged, g] = this._merge(col);
                gained += g;
                merged.reverse();
                for (let r = 0; r < SIZE; r++) {
                    if (this.grid[r][c] !== merged[r]) moved = true;
                    this.grid[r][c] = merged[r];
                }
            }
        } else if (direction === 3) { // Left
            for (let r = 0; r < SIZE; r++) {
                const row = [...this.grid[r]];
                const [merged, g] = this._merge(row);
                gained += g;
                for (let c = 0; c < SIZE; c++) {
                    if (this.grid[r][c] !== merged[c]) moved = true;
                    this.grid[r][c] = merged[c];
                }
            }
        } else if (direction === 1) { // Right
            for (let r = 0; r < SIZE; r++) {
                const row = [];
                for (let c = SIZE - 1; c >= 0; c--) row.push(this.grid[r][c]);
                const [merged, g] = this._merge(row);
                gained += g;
                merged.reverse();
                for (let c = 0; c < SIZE; c++) {
                    if (this.grid[r][c] !== merged[c]) moved = true;
                    this.grid[r][c] = merged[c];
                }
            }
        }

        this.score += gained;
        return { moved, gained };
    }

    _merge(line) {
        const newLine = line.filter(x => x !== 0);
        let gained = 0;
        const mergedLine = [];
        let i = 0;
        while (i < newLine.length) {
            if (i + 1 < newLine.length && newLine[i] === newLine[i + 1]) {
                const val = newLine[i] * 2;
                gained += val;
                mergedLine.push(val);
                i += 2;
            } else {
                mergedLine.push(newLine[i]);
                i += 1;
            }
        }
        while (mergedLine.length < SIZE) {
            mergedLine.push(0);
        }
        return [mergedLine, gained];
    }

    isWin() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (this.grid[r][c] === 2048) return true;
            }
        }
        return false;
    }

    countEmpty() {
        let count = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (this.grid[r][c] === 0) count++;
            }
        }
        return count;
    }
}

// Evaluation Metrics Functions
function smoothness(grid) {
    let s = 0;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE - 1; c++) {
            if (grid[r][c] && grid[r][c + 1]) {
                s += Math.abs(grid[r][c] - grid[r][c + 1]);
            }
        }
    }
    for (let c = 0; c < SIZE; c++) {
        for (let r = 0; r < SIZE - 1; r++) {
            if (grid[r][c] && grid[r + 1][c]) {
                s += Math.abs(grid[r][c] - grid[r + 1][c]);
            }
        }
    }
    return s;
}

function monotonicity(grid) {
    const totals = [0, 0, 0, 0];
    for (let r = 0; r < SIZE; r++) {
        let inc = 0;
        let dec = 0;
        for (let c = 0; c < SIZE - 1; c++) {
            if (grid[r][c] > grid[r][c + 1]) {
                inc += grid[r][c] - grid[r][c + 1];
            } else {
                dec += grid[r][c + 1] - grid[r][c];
            }
        }
        totals[2] += inc;
        totals[3] += dec;
    }
    for (let c = 0; c < SIZE; c++) {
        let inc = 0;
        let dec = 0;
        for (let r = 0; r < SIZE - 1; r++) {
            if (grid[r][c] > grid[r + 1][c]) {
                inc += grid[r][c] - grid[r + 1][c];
            } else {
                dec += grid[r + 1][c] - grid[r][c];
            }
        }
        totals[0] += inc;
        totals[1] += dec;
    }
    return -Math.min(totals[0], totals[1]) - Math.min(totals[2], totals[3]);
}

function maxTileInCorner(grid) {
    let maxVal = 0;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] > maxVal) maxVal = grid[r][c];
        }
    }
    const corners = [grid[0][0], grid[0][SIZE - 1], grid[SIZE - 1][0], grid[SIZE - 1][SIZE - 1]];
    return corners.includes(maxVal) ? 1 : 0;
}

function countHoles(grid) {
    let holes = 0;
    for (let c = 0; c < SIZE; c++) {
        let blockFound = false;
        for (let r = 0; r < SIZE; r++) {
            if (grid[r][c] !== 0) {
                blockFound = true;
            } else if (blockFound && grid[r][c] === 0) {
                holes++;
            }
        }
    }
    return holes;
}

function getCornerGradientScore(grid) {
    let maxVal = 0;
    let maxR = 0, maxC = 0;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] > maxVal) {
                maxVal = grid[r][c];
                maxR = r;
                maxC = c;
            }
        }
    }

    if (maxVal === 0) return 0;

    // Lock the corner to one of the 4 absolute grid boundaries
    const targetR = maxR < 2 ? 0 : SIZE - 1;
    const targetC = maxC < 2 ? 0 : SIZE - 1;

    let score = 0;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) continue;

            const distR = Math.abs(r - targetR);
            const distC = Math.abs(c - targetC);

            // Spatial exponential weight radiating from the locked corner
            const weight = Math.pow(2.2, 6 - (distR + distC));
            score += grid[r][c] * weight;
        }
    }
    return score;
}

function evaluateBoard(board) {
    const grid = board.grid;
    let emptyTiles = 0;
    let maxVal = 0;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) emptyTiles++;
            if (grid[r][c] > maxVal) maxVal = grid[r][c];
        }
    }
    const smooth = smoothness(grid);
    const mono = monotonicity(grid);
    const corner = maxTileInCorner(grid);
    const holes = countHoles(grid);
    const gradient = getCornerGradientScore(grid);

    return (emptyTiles * 1000
            + maxVal * 5
            - smooth * 150
            + mono * 1000
            + corner * 2000
            - holes * 500
            + gradient * 2);
}

// ==========================================
// 2. EXPECTIMAX AI SOLVER (JS PORT)
// ==========================================

const MIN_TIME_LIMIT = 40;  // ms per move when empty board
const MAX_TIME_LIMIT = 250; // ms per move when board is nearly full

class AI {
    constructor() {
        this.startTime = 0;
        this.transpositionTable = new Map();
        this.nodesEvaluated = 0;
        this.cacheHits = 0;
    }

    dynamicTimeLimit(board) {
        const empty = board.countEmpty();
        return MIN_TIME_LIMIT + (MAX_TIME_LIMIT - MIN_TIME_LIMIT) * (1 - empty / (SIZE * SIZE));
    }

    hashBoard(board) {
        let hash = "";
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                hash += board.grid[r][c] + ",";
            }
        }
        return hash;
    }

    findBestMove(board) {
        this.startTime = performance.now();
        const timeLimit = this.dynamicTimeLimit(board);
        this.transpositionTable.clear();
        this.nodesEvaluated = 0;
        this.cacheHits = 0;

        let bestMove = null;
        let depth = 1;
        let currentBestMove = null;

        while (true) {
            let bestScore = -Infinity;
            currentBestMove = null;

            const orderedMoves = this.moveOrder(board);
            for (const move of orderedMoves) {
                const bCopy = board.clone();
                if (!bCopy.move(move).moved) continue;

                const score = this.expectimax(bCopy, depth - 1, false, timeLimit);
                if (score > bestScore) {
                    bestScore = score;
                    currentBestMove = move;
                }
                if (performance.now() - this.startTime > timeLimit) break;
            }

            if (performance.now() - this.startTime > timeLimit) break;
            if (currentBestMove !== null) {
                bestMove = currentBestMove;
            }
            depth++;
            if (depth > 12) break; // Depth limit safety
        }

        // Fallback: if search broke early or returned null, try any valid move
        if (bestMove === null) {
            if (currentBestMove !== null) {
                bestMove = currentBestMove;
            } else {
                for (let m of [0, 3, 1, 2]) { // UP, LEFT, RIGHT, DOWN order
                    if (board.clone().move(m).moved) {
                        bestMove = m;
                        break;
                    }
                }
            }
        }

        return {
            move: bestMove,
            depth: depth - 1,
            evalScore: evaluateBoard(board),
            nodes: this.nodesEvaluated,
            cacheHits: this.cacheHits
        };
    }

    expectimax(board, depth, isPlayerTurn, timeLimit) {
        this.nodesEvaluated++;
        if (performance.now() - this.startTime > timeLimit) {
            return evaluateBoard(board);
        }
        if (depth === 0 || board.isWin() || !board.canMove()) {
            return evaluateBoard(board);
        }

        const hash = this.hashBoard(board);
        const cacheKey = `${hash}_${depth}_${isPlayerTurn}`;
        if (this.transpositionTable.has(cacheKey)) {
            this.cacheHits++;
            return this.transpositionTable.get(cacheKey);
        }

        if (isPlayerTurn) {
            let bestScore = -Infinity;
            const orderedMoves = this.moveOrder(board);
            for (const move of orderedMoves) {
                const bCopy = board.clone();
                if (!bCopy.move(move).moved) continue;

                const score = this.expectimax(bCopy, depth - 1, false, timeLimit);
                if (score > bestScore) {
                    bestScore = score;
                }
            }
            this.transpositionTable.set(cacheKey, bestScore);
            return bestScore;
        } else {
            const empties = [];
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (board.grid[r][c] === 0) {
                        empties.push({r, c});
                    }
                }
            }
            if (empties.length === 0) {
                const val = evaluateBoard(board);
                this.transpositionTable.set(cacheKey, val);
                return val;
            }

            let scores = 0;
            for (const {r, c} of empties) {
                // 90% chance of tile 2
                const bCopy2 = board.clone();
                bCopy2.grid[r][c] = 2;
                const score2 = this.expectimax(bCopy2, depth - 1, true, timeLimit);
                scores += 0.9 * score2 / empties.length;

                // 10% chance of tile 4
                const bCopy4 = board.clone();
                bCopy4.grid[r][c] = 4;
                const score4 = this.expectimax(bCopy4, depth - 1, true, timeLimit);
                scores += 0.1 * score4 / empties.length;
            }
            this.transpositionTable.set(cacheKey, scores);
            return scores;
        }
    }

    moveOrder(board) {
        let maxTile = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board.grid[r][c] > maxTile) maxTile = board.grid[r][c];
            }
        }

        let corner = null;
        if (board.grid[SIZE - 1][0] === maxTile) corner = "bottom-left";
        else if (board.grid[SIZE - 1][SIZE - 1] === maxTile) corner = "bottom-right";
        else if (board.grid[0][0] === maxTile) corner = "top-left";
        else if (board.grid[0][SIZE - 1] === maxTile) corner = "top-right";

        if (corner === "bottom-left") return [0, 3, 1, 2];      // UP, LEFT, RIGHT, DOWN
        else if (corner === "bottom-right") return [0, 1, 3, 2]; // UP, RIGHT, LEFT, DOWN
        else if (corner === "top-left") return [2, 3, 1, 0];     // DOWN, LEFT, RIGHT, UP
        else if (corner === "top-right") return [2, 1, 3, 0];    // DOWN, RIGHT, LEFT, UP
        else return [0, 1, 2, 3];
    }
}

// ==========================================
// 3. VISUAL TILE COMPONENT (DOM WRAPPER)
// ==========================================

class VisualTile {
    constructor(id, value, r, c, container) {
        this.id = id;
        this.value = value;
        this.r = r;
        this.c = c;
        this.merged = false;

        this.element = document.createElement('div');
        this.element.className = `tile tile-${value} tile-new`;
        this.updatePosition();
        this.updateValue();

        container.appendChild(this.element);

        // Remove spawn pop class to reset styling transitions
        setTimeout(() => {
            this.element.classList.remove('tile-new');
        }, 180);
    }

    updatePosition() {
        this.element.style.setProperty('--row', this.r);
        this.element.style.setProperty('--col', this.c);
    }

    updateValue() {
        this.element.textContent = this.value;
        this.element.className = 'tile';

        if (this.value <= 2048) {
            this.element.classList.add(`tile-${this.value}`);
        } else {
            this.element.classList.add('tile-super');
        }

        const digits = String(this.value).length;
        if (digits >= 3) {
            this.element.classList.add(`tile-digits-${digits}`);
        }
    }

    playMergeAnimation() {
        this.element.classList.add('tile-merged');
        setTimeout(() => {
            this.element.classList.remove('tile-merged');
        }, 200);
    }
}

// ==========================================
// 4. FRONTEND GAME CONTROLLER
// ==========================================

const MOVES_DELAY_MAP = {
    0: 800,
    1: 600,
    2: 450,
    3: 300,
    4: 200,
    5: 120,
    6: 70,
    7: 40,
    8: 15,
    9: 0 // Blazing fast
};

class GameManager {
    constructor() {
        this.grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('best2048Score') || '0', 10);
        this.tileContainer = document.getElementById('tilesContainer');
        this.tileId = 0;
        this.keepPlaying = false;
        
        // AI Instance
        this.ai = new AI();
        this.isAiMode = false;
        this.aiTimer = null;
        this.isPaused = false;

        // Cache elements
        this.scoreValEl = document.getElementById('currentScore');
        this.bestScoreValEl = document.getElementById('bestScore');
        this.overlayMenu = document.getElementById('overlayMenu');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlaySubtitle = document.getElementById('overlaySubtitle');
        
        // Sidebar elements
        this.aiModeToggle = document.getElementById('aiModeToggle');
        this.btnPause = document.getElementById('btnPause');
        this.btnRestart = document.getElementById('btnRestart');
        this.speedSlider = document.getElementById('speedSlider');
        
        // AI HUD Elements
        this.hudStatus = document.getElementById('solverStatus');
        this.hudDepth = document.getElementById('aiDepth');
        this.hudBestMove = document.getElementById('aiBestMove');
        this.hudEvaluation = document.getElementById('aiEvaluation');
        this.hudNodes = document.getElementById('aiNodes');
        this.hudCache = document.getElementById('aiCache');

        this.bestScoreValEl.textContent = this.bestScore;

        this.initEventListeners();
    }

    initEventListeners() {
        // Overlay Buttons
        document.getElementById('btnPlayerMode').addEventListener('click', () => {
            this.setAiMode(false);
            this.startNewGame();
        });
        document.getElementById('btnAiMode').addEventListener('click', () => {
            this.setAiMode(true);
            this.startNewGame();
        });

        // Switch controller
        this.aiModeToggle.addEventListener('change', (e) => {
            this.setAiMode(e.target.checked);
        });

        // Sidebar Control Buttons
        this.btnPause.addEventListener('click', () => this.toggleAiPause());
        this.btnRestart.addEventListener('click', () => {
            this.startNewGame();
        });

        // Slider
        this.speedSlider.addEventListener('input', () => {
            if (this.isAiMode && !this.isPaused) {
                this.restartAiLoop();
            }
        });

        // Keyboard navigation
        window.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }

    setAiMode(enable) {
        this.isAiMode = enable;
        this.aiModeToggle.checked = enable;
        this.btnPause.disabled = !enable;
        
        if (enable) {
            this.hudStatus.textContent = 'Active';
            this.hudStatus.className = 'stat-val status-indicator running';
            this.btnPause.textContent = this.isPaused ? 'Resume AI' : 'Pause AI';
        } else {
            this.stopAiLoop();
            this.hudStatus.textContent = 'Idle';
            this.hudStatus.className = 'stat-val status-indicator';
            this.clearAiHUD();
        }
    }

    startNewGame() {
        // Clear variables
        this.stopAiLoop();
        this.isPaused = false;
        this.keepPlaying = false;
        this.score = 0;
        this.updateScore(0);

        // Clear layout
        this.tileContainer.innerHTML = '';
        this.grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));

        // Hide overlay
        this.overlayMenu.classList.remove('active');
        this.overlayMenu.className = 'overlay';

        // Spawn first tiles
        this.spawnTile();
        this.spawnTile();

        // Start AI if active
        if (this.isAiMode) {
            this.setAiMode(true);
            this.startAiLoop();
        }
    }

    spawnTile() {
        const empties = [];
        this.eachTile((tile, r, c) => {
            if (!tile) empties.push({r, c});
        });
        if (empties.length === 0) return false;

        const {r, c} = empties[Math.floor(Math.random() * empties.length)];
        const val = Math.random() < 0.9 ? 2 : 4;
        
        this.grid[r][c] = new VisualTile(this.tileId++, val, r, c, this.tileContainer);
        return true;
    }

    eachTile(callback) {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                callback(this.grid[r][c], r, c);
            }
        }
    }

    findFarthestCell(cell, vector) {
        let previous;
        let current = cell;
        do {
            previous = current;
            current = { r: previous.r + vector.y, c: previous.c + vector.x };
        } while (this.withinBounds(current) && !this.grid[current.r][current.c]);

        return {
            farthest: previous,
            next: current
        };
    }

    withinBounds(cell) {
        return cell.r >= 0 && cell.r < SIZE && cell.c >= 0 && cell.c < SIZE;
    }

    // Handles standard transitions and math merging
    move(direction) {
        if (this.isGameOver()) return false;

        const vector = this.getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;
        let gained = 0;

        // Clear merged state on current tiles
        this.eachTile(tile => {
            if (tile) tile.merged = false;
        });

        traversals.y.forEach(r => {
            traversals.x.forEach(c => {
                const tile = this.grid[r][c];
                if (tile) {
                    const cell = this.findFarthestCell({r, c}, vector);
                    const nextCell = cell.next;

                    let isMerged = false;
                    if (this.withinBounds(nextCell)) {
                        const nextTile = this.grid[nextCell.r][nextCell.c];
                        if (nextTile && nextTile.value === tile.value && !nextTile.merged) {
                            // Merge triggers
                            isMerged = true;
                            const newVal = tile.value * 2;
                            gained += newVal;

                            // Clean references
                            this.grid[r][c] = null;
                            this.grid[nextCell.r][nextCell.c] = nextTile; // Target stays in list

                            // Slide moving tile overlay to destination
                            tile.r = nextCell.r;
                            tile.c = nextCell.c;
                            tile.updatePosition();

                            // Delete merged visual and trigger upgrade after slide transition ends (120ms)
                            const elementToDelete = tile.element;
                            setTimeout(() => {
                                elementToDelete.remove();
                                // Upgrade target tile variables and trigger pulse precisely when the moving tile arrives!
                                nextTile.value = newVal;
                                nextTile.updateValue();
                                nextTile.playMergeAnimation();
                            }, 120);

                            nextTile.merged = true; // Mark target as merged immediately to prevent double merges in same turn

                            moved = true;
                        }
                    }

                    if (!isMerged) {
                        if (cell.farthest.r !== r || cell.farthest.c !== c) {
                            // Slide to farthest empty cell
                            this.grid[r][c] = null;
                            this.grid[cell.farthest.r][cell.farthest.c] = tile;

                            tile.r = cell.farthest.r;
                            tile.c = cell.farthest.c;
                            tile.updatePosition();

                            moved = true;
                        }
                    }
                }
            });
        });

        if (moved) {
            this.score += gained;
            this.updateScore(gained);
            this.spawnTile();
            this.checkGameState();
        }
        return moved;
    }

    getVector(direction) {
        const vectors = {
            0: { x: 0, y: -1 }, // Up
            1: { x: 1, y: 0 },  // Right
            2: { x: 0, y: 1 },  // Down
            3: { x: -1, y: 0 }  // Left
        };
        return vectors[direction];
    }

    buildTraversals(vector) {
        const traversals = { x: [], y: [] };
        for (let pos = 0; pos < SIZE; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        if (vector.x === 1) traversals.x.reverse();
        if (vector.y === 1) traversals.y.reverse();
        return traversals;
    }

    updateScore(gained) {
        this.scoreValEl.textContent = this.score;

        // Gained floating addition popup animation
        if (gained > 0) {
            const addEl = document.createElement('div');
            addEl.className = 'score-addition';
            addEl.textContent = `+${gained}`;
            
            const card = this.scoreValEl.parentElement;
            card.appendChild(addEl);
            setTimeout(() => addEl.remove(), 800);
        }

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreValEl.textContent = this.bestScore;
            localStorage.setItem('best2048Score', this.bestScore);
        }
    }

    getRawBoard() {
        const b = new Board();
        b.score = this.score;
        this.eachTile((tile, r, c) => {
            b.grid[r][c] = tile ? tile.value : 0;
        });
        return b;
    }

    isGameOver() {
        // Checks move eligibility
        let empty = 0;
        this.eachTile(tile => {
            if (!tile) empty++;
        });
        if (empty > 0) return false;

        // Check adjacent matching values
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const val = this.grid[r][c] ? this.grid[r][c].value : 0;
                
                // Right
                if (c < SIZE - 1) {
                    const rightVal = this.grid[r][c + 1] ? this.grid[r][c + 1].value : 0;
                    if (val === rightVal) return false;
                }
                // Down
                if (r < SIZE - 1) {
                    const downVal = this.grid[r + 1][c] ? this.grid[r + 1][c].value : 0;
                    if (val === downVal) return false;
                }
            }
        }
        return true;
    }

    checkGameState() {
        // Game Win Checker (2048 threshold)
        let win = false;
        this.eachTile(tile => {
            if (tile && tile.value === 2048) win = true;
        });

        if (win) {
            this.showWinOverlay();
            this.stopAiLoop();
            return;
        }

        // Game Over Checker
        if (this.isGameOver()) {
            this.showGameOverOverlay();
            this.stopAiLoop();
        }
    }

    showWinOverlay() {
        this.overlayTitle.textContent = "2048!";
        this.overlaySubtitle.textContent = "Incredible! You reached the 2048 tile!";
        this.overlayMenu.className = "overlay active game-win";
        
        const buttonsContainer = this.overlayMenu.querySelector('.overlay-buttons');
        buttonsContainer.innerHTML = `
            <button id="btnNewGameWin" class="menu-btn hover-glow">New Game</button>
        `;

        document.getElementById('btnNewGameWin').addEventListener('click', () => {
            this.startNewGame();
        });
    }

    showGameOverOverlay() {
        this.overlayTitle.textContent = "Game Over";
        this.overlaySubtitle.textContent = `No moves left! Final Score: ${this.score}`;
        this.overlayMenu.className = "overlay active game-over";

        const buttonsContainer = this.overlayMenu.querySelector('.overlay-buttons');
        buttonsContainer.innerHTML = `
            <button id="btnTryAgain" class="menu-btn hover-glow">Try Again</button>
        `;

        document.getElementById('btnTryAgain').addEventListener('click', () => {
            this.startNewGame();
        });
    }

    handleKeyboardInput(e) {
        if (this.isAiMode || this.overlayMenu.classList.contains('active')) return;

        let moved = false;
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                moved = this.move(0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                moved = this.move(1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                moved = this.move(2);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                moved = this.move(3);
                break;
            default:
                return;
        }

        if (moved) {
            e.preventDefault();
        }
    }

    // ==========================================
    // AI LOOP CONTROLS
    // ==========================================

    startAiLoop() {
        this.stopAiLoop();
        this.hudStatus.textContent = 'Running';
        this.hudStatus.className = 'stat-val status-indicator running';

        const runSolverTick = () => {
            if (this.isPaused || !this.isAiMode) return;

            const rawBoard = this.getRawBoard();
            if (!rawBoard.canMove()) {
                this.checkGameState();
                return;
            }

            const result = this.ai.findBestMove(rawBoard);
            
            // Update AI HUD
            this.hudDepth.textContent = result.depth;
            this.hudBestMove.textContent = ["UP", "RIGHT", "DOWN", "LEFT"][result.move];
            this.hudEvaluation.textContent = result.evalScore.toFixed(0);
            this.hudNodes.textContent = result.nodes.toLocaleString();
            this.hudCache.textContent = result.cacheHits.toLocaleString();

            if (result.move !== null) {
                this.move(result.move);
            }

            // Halts scheduling immediately if game finished during the move
            if (this.overlayMenu.classList.contains('active')) {
                return;
            }

            // Schedule next move based on slider speed
            const speedVal = parseInt(this.speedSlider.value, 10);
            const delay = MOVES_DELAY_MAP[speedVal];

            if (delay === 0) {
                // Maximum performance mode using animation frames
                this.aiTimer = requestAnimationFrame(runSolverTick);
            } else {
                this.aiTimer = setTimeout(runSolverTick, delay);
            }
        };

        const speedVal = parseInt(this.speedSlider.value, 10);
        const delay = MOVES_DELAY_MAP[speedVal];
        if (delay === 0) {
            this.aiTimer = requestAnimationFrame(runSolverTick);
        } else {
            this.aiTimer = setTimeout(runSolverTick, delay);
        }
    }

    stopAiLoop() {
        if (this.aiTimer !== null) {
            clearTimeout(this.aiTimer);
            cancelAnimationFrame(this.aiTimer);
            this.aiTimer = null;
        }
    }

    restartAiLoop() {
        this.stopAiLoop();
        if (this.isAiMode && !this.isPaused) {
            this.startAiLoop();
        }
    }

    toggleAiPause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.stopAiLoop();
            this.btnPause.textContent = 'Resume AI';
            this.hudStatus.textContent = 'Paused';
            this.hudStatus.className = 'stat-val status-indicator paused';
        } else {
            this.btnPause.textContent = 'Pause AI';
            this.hudStatus.textContent = 'Running';
            this.hudStatus.className = 'stat-val status-indicator running';
            this.startAiLoop();
        }
    }

    clearAiHUD() {
        this.hudDepth.textContent = '-';
        this.hudBestMove.textContent = '-';
        this.hudEvaluation.textContent = '-';
        this.hudNodes.textContent = '-';
        this.hudCache.textContent = '-';
    }
}

// Initializer
window.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});
