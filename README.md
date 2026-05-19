# 2048 Expectimax AI — Premium Edition

Welcome to **2048 Expectimax AI**, a modern, state-of-the-art web application featuring a stunning **Neon Glassmorphic UI** and a real-time, highly-optimized **Expectimax AI Solver** compiled in vanilla JavaScript. 

Originally written in Python as a terminal game, this project has been fully upgraded to a high-fidelity browser experience.

---

## 🌟 Live Features

### 💎 Neon Glassmorphism UI
- **Futuristic Aesthetics**: A frosted glass play container set against an animated glowing background.
- **Dynamic Neon Tile Colors**: Custom harmonic gradient themes for all tile levels, complete with glowing borders and hardware-accelerated sliding animations (`transform: translate3d`).
- **Interactive Overlay System**: Modern frosted menu and status overlays for game starts, wins, and game overs.

### 🧠 High-Performance Expectimax Solver
- **JS Compiled Solver**: An exact port of the sophisticated Python `expectimax` search engine to optimized ES6 JavaScript.
- **Multi-Heuristic Evaluation**: The AI evaluates grid states in real-time based on empty space availability, smoothness, monotonicity, corner positioning, and hole penalties.
- **Transposition Cache Map**: Stores previously computed branches to enable ultra-fast, sub-millisecond computations for thousands of tree nodes.
- **Dynamic Diagnostics Dashboard**: Real-time stats monitor showing depth, evaluation score, best calculated move, and search nodes.
- **Solve Speed Slider**: Tweak moves timing from a slow, educational study pace up to a blazing fast max speed (0ms calculations using `requestAnimationFrame`).

---

## 🕹️ Game Modes

1. **Player Mode**: Play standard 2048 using `Arrow Keys` or `WASD`.
2. **Watch AI Solve**: Enable the solver toggle and watch the expectimax AI play autonomously, pushing past the 2048 tile to achieve high-score benchmarks!

---

## 🚀 How to Run

### 🌐 Option A: Browser Web App (Recommended)
Simply open the `index.html` file in any modern web browser to play!
```bash
# Double click index.html or run a local server:
npx serve .
```

### 🐍 Option B: Legacy Python Terminal Game
If you prefer running the original, simple terminal-based implementation, it is still fully supported:
```bash
python 2048.py
```
