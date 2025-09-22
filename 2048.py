import random
import copy
import time
import os

SIZE = 4
MIN_TIME_LIMIT = 0.1  # seconds per move when many empty tiles
MAX_TIME_LIMIT = 0.8   # increased max seconds per move when board nearly full

COLOR_MAP = {
    0: "\033[0;37m",
    2: "\033[1;30m",
    4: "\033[1;34m",
    8: "\033[1;36m",
    16: "\033[1;32m",
    32: "\033[1;33m",
    64: "\033[1;31m",
    128: "\033[1;35m",
    256: "\033[1;37m",
    512: "\033[0;31m",
    1024: "\033[0;32m",
    2048: "\033[0;33m",
}

RESET_COLOR = "\033[0m"

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

class Board:
    def __init__(self):
        self.grid = [[0]*SIZE for _ in range(SIZE)]
        self.score = 0
        self.spawn_tile()
        self.spawn_tile()

    def clone(self):
        new_board = Board()
        new_board.grid = copy.deepcopy(self.grid)
        new_board.score = self.score
        return new_board

    def spawn_tile(self):
        empties = [(r, c) for r in range(SIZE) for c in range(SIZE) if self.grid[r][c] == 0]
        if not empties:
            return False
        r, c = random.choice(empties)
        self.grid[r][c] = 2 if random.random() < 0.9 else 4
        return True

    def can_move(self):
        if any(0 in row for row in self.grid):
            return True
        for r in range(SIZE):
            for c in range(SIZE - 1):
                if self.grid[r][c] == self.grid[r][c + 1]:
                    return True
        for c in range(SIZE):
            for r in range(SIZE - 1):
                if self.grid[r][c] == self.grid[r + 1][c]:
                    return True
        return False

    def move(self, direction):
        moved = False
        if direction == 0:  # Up
            for c in range(SIZE):
                col = [self.grid[r][c] for r in range(SIZE)]
                merged_col, gained = self._merge(col)
                for r in range(SIZE):
                    if self.grid[r][c] != merged_col[r]:
                        moved = True
                    self.grid[r][c] = merged_col[r]
                self.score += gained
        elif direction == 2:  # Down
            for c in range(SIZE):
                col = [self.grid[r][c] for r in reversed(range(SIZE))]
                merged_col, gained = self._merge(col)
                merged_col.reverse()
                for r in range(SIZE):
                    if self.grid[r][c] != merged_col[r]:
                        moved = True
                    self.grid[r][c] = merged_col[r]
                self.score += gained
        elif direction == 3:  # Left
            for r in range(SIZE):
                row = self.grid[r][:]
                merged_row, gained = self._merge(row)
                for c in range(SIZE):
                    if self.grid[r][c] != merged_row[c]:
                        moved = True
                    self.grid[r][c] = merged_row[c]
                self.score += gained
        elif direction == 1:  # Right
            for r in range(SIZE):
                row = list(reversed(self.grid[r]))
                merged_row, gained = self._merge(row)
                merged_row.reverse()
                for c in range(SIZE):
                    if self.grid[r][c] != merged_row[c]:
                        moved = True
                    self.grid[r][c] = merged_row[c]
                self.score += gained
        return moved

    def _merge(self, line):
        new_line = [i for i in line if i != 0]
        gained = 0
        merged_line = []
        i = 0
        while i < len(new_line):
            if i + 1 < len(new_line) and new_line[i] == new_line[i + 1]:
                merged_val = new_line[i] * 2
                gained += merged_val
                merged_line.append(merged_val)
                i += 2
            else:
                merged_line.append(new_line[i])
                i += 1
        merged_line.extend([0] * (SIZE - len(merged_line)))
        return merged_line, gained

    def is_win(self):
        for row in self.grid:
            if 2048 in row:
                return True
        return False

    def print_board(self):
        clear_screen()
        print(f"Score: {self.score}\n")
        horizontal_line = "+" + ("------+" * SIZE)
        print(horizontal_line)
        for row in self.grid:
            row_line = "|"
            for num in row:
                color = COLOR_MAP.get(num, RESET_COLOR)
                if num == 0:
                    cell = "      "
                else:
                    cell = f"{num}".center(6)
                row_line += f"{color}{cell}{RESET_COLOR}|"
            print(row_line)
            print(horizontal_line)

    def count_empty(self):
        return sum(row.count(0) for row in self.grid)

class AI:
    def __init__(self):
        self.start_time = 0
        self.transposition_table = {}

    def dynamic_time_limit(self, board):
        empty = board.count_empty()
        # Linear interpolation: more empty tiles → less time, fewer empty → more time
        return MIN_TIME_LIMIT + (MAX_TIME_LIMIT - MIN_TIME_LIMIT) * (1 - empty / (SIZE*SIZE))

    def find_best_move(self, board):
        self.start_time = time.time()
        time_limit = self.dynamic_time_limit(board)
        best_move = None
        depth = 1
        while True:
            best_score = float('-inf')
            current_best_move = None
            for move in self.move_order(board):
                b_copy = board.clone()
                if not b_copy.move(move):
                    continue
                score = self.expectimax(b_copy, depth - 1, False, time_limit)
                if score > best_score:
                    best_score = score
                    current_best_move = move
                if time.time() - self.start_time > time_limit:
                    break
            if time.time() - self.start_time > time_limit:
                break
            if current_best_move is not None:
                best_move = current_best_move
            depth += 1
            if depth > 10:  # increased max depth
                break
        return best_move

    def expectimax(self, board, depth, is_player_turn, time_limit):
        if time.time() - self.start_time > time_limit:
            return self.evaluate(board)

        if depth == 0 or board.is_win() or not board.can_move():
            return self.evaluate(board)

        h = self.hash_board(board)
        if (h, depth, is_player_turn) in self.transposition_table:
            return self.transposition_table[(h, depth, is_player_turn)]

        if is_player_turn:
            best_score = float('-inf')
            for move in self.move_order(board):
                b_copy = board.clone()
                if not b_copy.move(move):
                    continue
                score = self.expectimax(b_copy, depth - 1, False, time_limit)
                if score > best_score:
                    best_score = score
            self.transposition_table[(h, depth, is_player_turn)] = best_score
            return best_score
        else:
            empties = [(r, c) for r in range(SIZE) for c in range(SIZE) if board.grid[r][c] == 0]
            if not empties:
                val = self.evaluate(board)
                self.transposition_table[(h, depth, is_player_turn)] = val
                return val

            scores = 0
            for r, c in empties:
                for tile_value, prob in [(2, 0.9), (4, 0.1)]:
                    b_copy = board.clone()
                    b_copy.grid[r][c] = tile_value
                    score = self.expectimax(b_copy, depth - 1, True, time_limit)
                    scores += prob * score / len(empties)
            self.transposition_table[(h, depth, is_player_turn)] = scores
            return scores

    def move_order(self, board):
        max_tile = max(max(row) for row in board.grid)
        corner_positions = [(0, 0), (0, SIZE - 1), (SIZE - 1, 0), (SIZE - 1, SIZE - 1)]
        corner = None
        for r, c in corner_positions:
            if board.grid[r][c] == max_tile:
                corner = (r, c)
                break
        if corner == (SIZE - 1, 0):
            return [0, 3, 1, 2]
        elif corner == (SIZE - 1, SIZE - 1):
            return [0, 1, 3, 2]
        elif corner == (0, 0):
            return [2, 3, 1, 0]
        elif corner == (0, SIZE - 1):
            return [2, 1, 3, 0]
        else:
            return [0, 1, 2, 3]

    def evaluate(self, board):
        grid = board.grid
        empty_tiles = sum(row.count(0) for row in grid)
        max_tile = max(max(row) for row in grid)
        smoothness = self.smoothness(grid)
        monotonicity = self.monotonicity(grid)
        corner = self.max_tile_in_corner(grid)
        holes = self.count_holes(grid)
        return (empty_tiles * 1200
                + max_tile * 2
                - smoothness * 250
                + monotonicity * 1200
                + corner * 1500
                - holes * 400)

    def smoothness(self, grid):
        smooth = 0
        for r in range(SIZE):
            for c in range(SIZE - 1):
                if grid[r][c] and grid[r][c + 1]:
                    smooth += abs(grid[r][c] - grid[r][c + 1])
        for c in range(SIZE):
            for r in range(SIZE - 1):
                if grid[r][c] and grid[r + 1][c]:
                    smooth += abs(grid[r][c] - grid[r + 1][c])
        return smooth

    def monotonicity(self, grid):
        totals = [0, 0, 0, 0]
        for r in range(SIZE):
            inc = 0
            dec = 0
            for c in range(SIZE - 1):
                if grid[r][c] > grid[r][c + 1]:
                    inc += grid[r][c] - grid[r][c + 1]
                else:
                    dec += grid[r][c + 1] - grid[r][c]
            totals[2] += inc
            totals[3] += dec
        for c in range(SIZE):
            inc = 0
            dec = 0
            for r in range(SIZE - 1):
                if grid[r][c] > grid[r + 1][c]:
                    inc += grid[r][c] - grid[r + 1][c]
                else:
                    dec += grid[r + 1][c] - grid[r][c]
            totals[0] += inc
            totals[1] += dec
        return -min(totals[0], totals[1]) - min(totals[2], totals[3])

    def max_tile_in_corner(self, grid):
        max_tile = max(max(row) for row in grid)
        corners = [grid[0][0], grid[0][SIZE - 1], grid[SIZE - 1][0], grid[SIZE - 1][SIZE - 1]]
        return 1 if max_tile in corners else 0

    def count_holes(self, grid):
        holes = 0
        for c in range(SIZE):
            block_found = False
            for r in range(SIZE):
                if grid[r][c] != 0:
                    block_found = True
                elif block_found and grid[r][c] == 0:
                    holes += 1
        return holes

    def hash_board(self, board):
        flat = tuple(item for row in board.grid for item in row)
        return hash(flat)

def main():
    game = Board()
    ai = AI()

    print("Starting 2048 AI solver...")
    game.print_board()

    move_count = 0
    while True:
        if game.is_win():
            print("AI reached 2048 tile! You win!")
            game.print_board()
            break
        if not game.can_move():
            print("No more moves left. Game over.")
            game.print_board()
            break

        move = ai.find_best_move(game)
        if move is None:
            print("No valid moves found. Game over.")
            game.print_board()
            break

        moved = game.move(move)
        if moved:
            game.spawn_tile()
            move_count += 1
            print(f"Move {move_count}: ", ["UP", "RIGHT", "DOWN", "LEFT"][move])
            game.print_board()
            time.sleep(0.05)

if __name__ == "__main__":
    main()
