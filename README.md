# 2048 AI Solver

A web-based version of 2048 featuring a real-time Expectimax AI solver, styled with a modern dark glassmorphic interface. The original Python terminal-based game is also preserved in `2048.py`.

## Features

- **Player & AI Modes**: Play manually using Arrow keys or `WASD`, or toggle the AI solver mode to watch the algorithm play autonomously.
- **Expectimax Solver**: A JavaScript port of the Expectimax search algorithm. It evaluates grid states using multiple heuristics (empty tile count, monotonicity, smoothness, corner positioning, and holes) and utilizes a transposition table (caching) for fast lookups.
- **Glassmorphic UI**: Symmetrical dark interface with Outfit and JetBrains Mono typography, hardware-accelerated tile sliding transitions, and responsive scaling.
- **AI Diagnostic Panel**: Real-time monitor displaying active solver statistics including search depth, static board evaluation score, nodes evaluated, and cache hits.
- **Solve Speed Control**: Adjustable slide control to tweak the delay between moves, up to running calculations instantly using `requestAnimationFrame`.

## How to Run

### Web Application (Recommended)
Simply open the `index.html` file in any modern web browser. 

If you want to run it via a local development server:
```bash
npx serve .
```

### Python Terminal Game
To run the original terminal-based implementation:
```bash
python 2048.py
```
