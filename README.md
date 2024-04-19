# RoyaleChess
Chess game website (singleplayer(smart AI) + multiplayer)

### The website structure
The website structure consists of numerous HTML pages, each with accompanying CSS and JavaScript files. When entering the main page of the site, the server sends the user the main HTML page (html.main) along with its associated CSS (css.main), offering the user the choice to:

1- Play with friends (online).

2- Play with the computer (AI).

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/a1412885-0b49-4678-b574-c57dba88154a)

#### Online
If the user chooses to play with friends, they will be directed to the html.online page (with css.online and js.online). The page will display to the user the current number of players in the game and the available rooms. The website will prompt the user to enter their username and choose a room. Here's an example of part of the page:

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/d8305199-62f2-4779-8cf9-976f4f706401)

After the user enters the game room, the screen will display:

1- A chessboard (but they cannot move the pieces until the second player joins).

2- The player's name and their piece color.

3- The website will prompt to wait for the second player to join if they haven't already.

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/46fdc116-117c-40e0-86be-8ac3542d088f)

At the end of the game, the result will be displayed as follows:

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/345e2e1f-7f82-4c06-9e52-66d5cba089b5)

If one of the players leaves the game before it finishes, the remaining player will see:

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/536c6156-3922-401b-9d08-05d7ef25b9cf)

### with AI
If the user chooses to play against a computer player, they will be directed to the html.offline page (with css.offline and js.offline). Initially, the user will have the option to choose the difficulty level.

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/7433f325-4d2d-46a2-8156-8f7a80b79a20)

At the end of the game, the result will be displayed as follows:

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/5ddf5386-4b29-4604-9f51-2e2ee9a1143e)

## AI Algorithm
The game against the computer is based on various algorithms to ensure accurate and efficient gameplay. We utilized well-known and interesting algorithms with some modifications tailored to our needs.
Some of the algorithms used in the game against the computer include:

### Evaluation
This algorithm assigns values to the pieces so that the AI can distinguish and determine which pieces are more important than others. Since the AI always plays as the black player, it chooses the move that yields the smallest value. The algorithm also adjusts the values of the pieces slightly depending on their positions on the board, encouraging the AI to move the pieces to more suitable positions.

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/0ee64802-550c-44b6-8892-727a02a8c52c)

### Minimax
This algorithm is a search through a tree of all possible moves in the game, allowing the AI to choose the best move for itself. The algorithm generates all possible moves up to a certain depth, so with each additional move, it adds more depth to the search tree. At each depth, the algorithm searches for the move that is more advantageous to either the black or white player (depending on whose turn it is). For example, if it's white's turn, the algorithm searches for the move that maximizes the outcome, whereas if it's black's turn, the algorithm searches for the move that minimizes the outcome (thus, the algorithm also anticipates the opponent making good moves).

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/b3ae7eb6-8d5a-4d96-8c4c-53cf68af34a5)

### Alpha-Beta pruning
The MINIMAX algorithm with a depth of 4 is sufficient to make the AI very difficult to beat, but it requires millions of computations to achieve this. Therefore, we need many other algorithms to allow it to make decisions more quickly. One of these algorithms is Alpha-Beta pruning.

This algorithm is an optimization technique for the MINIMAX algorithm that allows us to ignore some branches in the search tree. It helps us to evaluate the MINIMAX search tree much deeper while using the same resources. Beta-Alpha pruning is based on the scenario where we can stop part of the search tree if we find a move that leads to a better outcome elsewhere in the tree.

The algorithm does not affect the outcome of the MINIMAX algorithm; it just makes it faster.

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/924b03ce-5f18-4249-932b-7e68b290a803)

### Move ordering
In the worst-case scenario of the Beta-Alpha pruning algorithm, the best move is found at the end, so the algorithm does not cause significant changes in the speed of the MINIMAX algorithm. To reduce the likelihood of this scenario, we will use an ordering move algorithm.

In this algorithm, we assign a value to each move so that the AI knows which moves are more likely to bring about changes. The values will be as follows:

If the move involves PROMOTION, its value is 64.
If the move involves CAPTURE, its value is 32.
If the move involves CAPTURE_EP, its value is 16.
If the move involves CASTLING SIDE KING, its value is 8.
If the move involves CASTLING SIDE QUEEN, its value is 4.
If the move involves PAWN BIG, its value is 2.
If the move involves NOTHING, its value is 1.
The algorithm sorts the moves according to the highest value using the Sort Merge algorithm, so the worst-case scenario is less likely to occur.

### End Game
The algorithm can identify when the game is approaching its end, where almost all moves have been made and the board is nearing depletion. In this case, the AI must play differently to cope with the impending situation. The algorithm simply adjusts the values of the pieces on the board. For example, at the beginning, the AI may prefer the king to be at the edge of the board, but in the "GAME END" scenario, the AI may prefer the king to be in the center of the board.

### 0x88
This algorithm serves as a way to represent the chessboard and also determine if the pieces have left the board. The idea is to create 128 squares instead of the typical 64 squares on the board. The additional 64 squares are called "ZONE DEAD". If a player attempts to move a piece to a square in the "ZONE DEAD", we know they are outside the board, and therefore the move is illegal. The algorithm also assists in finding the row and column of the square, and it helps us write an algorithm that knows whether the king is in check.

The algorithm is called "88x0" because if we perform the bitwise "AND" operation with 88x0 on all the square numbers in the "ZONE DEAD", we receive a number greater than 0, while all other square numbers receive 0. This is how we determine if we are in the "ZONE DEAD".

![image](https://github.com/RayanFarhat/RoyaleChess/assets/100049997/dc4ce670-0cf7-4a3f-b889-4f6984c0c237)


### Implementing algorithms in a computer game against an AI opponent
Before the game begins, the player is required to choose a difficulty level. Then, the AI adjusts the difficulty level by setting the depth of the MINIMAX tree as follows:

1-Easy: Tree depth = 1

2- Normal: Tree depth = 3

3- Hard: Tree depth = 4

Each time it's the computer player's turn, all possible moves are entered into an array, and MINIMAX is executed on this array. During each examination of the tree, it utilizes the EVALUATION algorithm with ENDGAME to determine the best board value for the computer player's move.

For example, if the player chooses the HARD difficulty level, MINIMAX will select the best move up to 4 turns ahead in the game and return it. The implemented MINIMAX contains all the other algorithms explained above to run faster.







