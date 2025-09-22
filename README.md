# Python 2048 AI Solver

This is a Python-based implementation of the popular game 2048 that runs in the terminal. It features a sophisticated AI solver that uses the **Expectimax algorithm** with iterative deepening depth-first search to find the best possible move.

## Features
- **Colorful Terminal Interface:** The game board is rendered with colors for different tile values, making it easy to read.
- **Advanced AI Opponent:** The AI evaluates board states based on multiple heuristics, including:
  - Smoothness and Monotonicity
  - Number of empty tiles
  - Maximizing the value of the largest tile, especially in corners
- **Dynamic Time Limit:** The AI has more time to think on complex boards with fewer empty tiles, making it more efficient.
- **Transposition Table:** Uses memoization to store previously evaluated board states, speeding up the search process.

## How to Run
1. Ensure you have Python installed.
2. Save the code as `2048.py`.
3. Run from your terminal:
   ```bash
   python 2048.py
