// start the game
game = new ChessBackEnd();
var board;

$('#board').hide();
$('#gameover').hide();
$('#greatgame').hide();
$('#difficulty').show();

// depth of minmax
var depth;

// handle difficulty buttons
$('.easy').click(function () {
    setDepth(1);
});
$('.medium').click(function () {
    setDepth(2);
});
$('.hard').click(function () {
    setDepth(4);
});

function setDepth(depthvalue) {
    $('#difficulty').hide();
    $('#board').show();
    $('#restart').show();
    depth = depthvalue;
}



/* board visualization and games status handling */

// if drag start check if the game still not ended
var on_Drag_Start = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

//when the pieces are actually moved
var on_Drop = function (source, target) {

    var move = game.move({
        from: source,
        to: target
    });

    remoeve_highlightedSquares();
    if (move === null) {
        return 'returnToSrc';
    }
    window.setTimeout(makeBestMove, 250);
};

// when drop ends redraw the board
var on_Drop_End = function () {
    board.position(game.fen());
};

// when mouse is over a piece get her possible moves and highlight it
var on_Mouse_Over_Square = function (square, piece) {
    var moves = game.moves({
        square: square
    });
    if (moves.length === 0) return;

    highlight_Squares(square);

    for (var i = 0; i < moves.length; i++) {
        highlight_Squares(moves[i].to);
    }
};

// when mouse is not on any piece remove all highlighted squares if there is any
var on_Mouse_Out_Square = function (square, piece) {
    remoeve_highlightedSquares();
};

var remoeve_highlightedSquares = function () {
    $('#board .square-class').css('background', '');
};

// highlight the selected squares 
var highlight_Squares = function (square) {
    var squareObj = $('#board .square-' + square);

    var background = '#f0d9b5';
    if (squareObj.hasClass('black-class') === true) {
        background = '#d49d70';
    }

    squareObj.css('background', background);
};

var config_functions = {
    orientation: 'white',
    on_Drag_Start: on_Drag_Start,
    on_Drop: on_Drop,
    on_Mouse_Out_Square: on_Mouse_Out_Square,
    on_Mouse_Over_Square: on_Mouse_Over_Square,
    on_Drop_End: on_Drop_End
};
board = ChessFrontEnd('board', config_functions);
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

/* AI start here */

// the AI will do his move
var makeBestMove = function () {
    // get the AI move
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
    board.position(game.fen());
    if (game.game_over()) {
        $('#gameover').show();
        $("#gameover").html('Game Over You Lost!');
    }
};

// save how many possibilities checked to get the best move
var positionCount;

//return the AI best move
var getBestMove = function (game) {
    if (game.game_over()) {
        $('#greatgame').show();
        $("#greatgame").html('Great Game You Won!');
    }

    // if we generating new best move reset positionCount to 0
    positionCount = 0;

    let depth1 = depth;

    // get the best move
    var bestMove = minimaxRoot(depth1, game, true);

    return bestMove;
};

// pawn value is 10 and change depend of his position
// white pawn evaluation positions
var pawnEvalWhite =
    [
        16.0, 16.0, 16.0, 16.0, 16.0, 16.0, 16.0, 16.0,
        15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0,
        11.0, 11.0, 12.0, 13.0, 13.0, 12.0, 11.0, 11.0,
        10.5, 10.5, 11.0, 12.5, 12.5, 11.0, 10.5, 10.5,
        10.0, 10.0, 10.0, 12.0, 12.0, 10.0, 10.0, 10.0,
        10.5, 9.5, 9.0, 10.0, 10.0, 9.0, 9.5, 10.5,
        10.5, 11.0, 11.0, 8.0, 8.0, 11.0, 11.0, 10.5,
        10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0
    ];

// black pawn evaluation positions
var pawnEvalBlack = pawnEvalWhite.slice().reverse();

// knight value is 30 and change depend of his position
// white and black knight evaluation positions
var knightEval =
    [
        28.0, 28.5, 29.0, 29.0, 29.0, 29.0, 28.5, 28.0,
        28.5, 29.5, 30.0, 30.5, 30.5, 30.0, 29.5, 28.5,
        29.0, 30.0, 31.0, 31.5, 31.5, 31.0, 30.0, 29.0,
        29.0, 30.5, 31.5, 32.0, 32.0, 31.5, 30.5, 29.0,
        29.0, 30.5, 31.5, 32.0, 32.0, 31.5, 30.5, 29.0,
        29.0, 30.0, 31.0, 31.5, 31.5, 31.0, 30.0, 29.0,
        28.5, 29.5, 30.0, 30.5, 30.5, 30.0, 29.5, 28.5,
        28.0, 28.5, 29.0, 29.0, 29.0, 29.0, 28.5, 28.0
    ];

// bishop value is 30 and change depend of his position
// white bishop evaluation positions
var bishopEvalWhite = [
    28.0, 28.5, 29.0, 29.0, 29.0, 29.0, 28.5, 28.0,
    28.5, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 28.5,
    29.0, 30.0, 30.5, 31.0, 31.0, 30.5, 30.0, 29.0,
    29.0, 30.5, 30.5, 31.0, 31.0, 30.5, 30.5, 29.0,
    29.0, 30.0, 31.0, 31.0, 31.0, 31.0, 30.0, 29.0,
    29.0, 31.0, 31.0, 31.0, 31.0, 31.0, 31.0, 29.0,
    28.5, 30.5, 30.0, 30.0, 30.0, 30.0, 30.5, 28.5,
    28.0, 28.5, 29.0, 29.0, 29.0, 29.0, 28.5, 28.0
];

// black bishop evaluation positions
var bishopEvalBlack = bishopEvalWhite.slice().reverse();

// rook value is 50 and change depend of his position
// white rook evaluation positions
var rookEvalWhite = [
    50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0,
    50.5, 51.0, 51.0, 51.0, 51.0, 51.0, 51.0, 50.5,
    49.5, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 49.5,
    49.5, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 49.5,
    49.5, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 49.5,
    49.5, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 49.5,
    49.5, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 49.5,
    50.0, 50.0, 50.0, 50.5, 50.5, 50.0, 50.0, 50.0
];

// black rook evaluation positions
var rookEvalBlack = rookEvalWhite.slice().reverse();

// queen value is 90 and change depend of his position
// white and black queen evaluation positions
var evalQueen = [
    88.0, 89.0, 89.0, 89.5, 89.5, 89.0, 89.0, 88.0,
    89.0, 90.0, 90.0, 90.0, 90.0, 90.0, 90.0, 89.0,
    89.0, 90.0, 90.5, 90.5, 90.5, 90.5, 90.0, 89.0,
    89.5, 90.0, 90.5, 90.5, 90.5, 90.5, 90.0, 89.5,
    90.0, 90.0, 90.5, 90.5, 90.5, 90.5, 90.0, 89.5,
    89.0, 90.5, 90.5, 90.5, 90.5, 90.5, 90.0, 89.0,
    89.0, 90.0, 90.5, 90.0, 90.0, 90.0, 90.0, 89.0,
    88.0, 89.0, 89.0, 89.5, 89.5, 89.0, 89.0, 88.0
];

// king value is 900 and change depend of his position
// white king evaluation positions
var kingEvalWhite = [

    897.0, 896.0, 896.0, 895.0, 895.0, 896.0, 896.0, 897.0,
    897.0, 896.0, 896.0, 895.0, 895.0, 896.0, 896.0, 897.0,
    897.0, 896.0, 896.0, 895.0, 895.0, 896.0, 896.0, 897.0,
    897.0, 896.0, 896.0, 895.0, 895.0, 896.0, 896.0, 897.0,
    898.0, 897.0, 897.0, 896.0, 896.0, 897.0, 897.0, 898.0,
    899.0, 898.0, 898.0, 898.0, 898.0, 898.0, 898.0, 899.0,
    902.0, 902.0, 900.0, 900.0, 900.0, 900.0, 902.0, 902.0,
    902.0, 903.0, 901.0, 900.0, 900.0, 901.0, 903.0, 902.0
];

// black king evaluation positions
var kingEvalBlack = kingEvalWhite.slice().reverse();

// when we reach endgame we encourage the king to move to the center
var ENDGAME_kingEval = [

    895.0, 896.0, 897.0, 897.0, 897.0, 897.0, 896.0, 895.0,
    896.0, 899.0, 900.0, 900.0, 900.0, 900.0, 899.0, 896.0,
    897.0, 900.0, 901.0, 902.0, 902.0, 901.0, 900.0, 897.0,
    897.0, 900.0, 902.0, 903.0, 903.0, 902.0, 900.0, 897.0,
    897.0, 900.0, 902.0, 903.0, 903.0, 902.0, 900.0, 897.0,
    897.0, 900.0, 901.0, 902.0, 902.0, 901.0, 900.0, 897.0,
    896.0, 899.0, 900.0, 900.0, 900.0, 900.0, 899.0, 896.0,
    895.0, 896.0, 897.0, 897.0, 897.0, 897.0, 896.0, 895.0
];

// when we reach endgame the pawn is so important to move forward
var ENDGAME_pawnEvalWhite =
    [
        16.0, 16.0, 16.0, 16.0, 16.0, 16.0, 16.0, 16.0,
        15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0,
        14.0, 14.0, 14.0, 14.0, 14.0, 14.0, 14.0, 14.0,
        13.0, 13.0, 13.0, 13.0, 13.0, 13.0, 13.0, 13.0,
        12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0,
        11.0, 11.0, 11.0, 11.0, 11.0, 11.0, 11.0, 11.0,
        10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0,
        10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0
    ];

// black pawn evaluation positions
var ENDGAME_pawnEvalBlack = pawnEvalWhite.slice().reverse();

/* Position evaluation Algorithm */
//get the value of the piece depend on it strength 
//so AI know what piece is more important than other 
var getPieceValue = function (piece, isWhite, x, y) {

    // check if we are in endgame
    if (isWhite && IsEndGame.isWhiteEndgame && piece === 'k')
        return ENDGAME_kingEval[(x * 8) + y];

    if (isWhite && IsEndGame.isWhiteEndgame && piece === 'p')
        return ENDGAME_pawnEvalWhite[(x * 8) + y];

    if (IsEndGame.isBlackEndgame && piece === 'k')
        return -ENDGAME_kingEval[(x * 8) + y];

    if (IsEndGame.isBlackEndgame && piece === 'p')
        return -ENDGAME_pawnEvalBlack[(x * 8) + y];

    // return piece value
    // return minus if piece is black
    switch (piece) {
        case 'p':
            return (isWhite ? pawnEvalWhite[(x * 8) + y] : -pawnEvalBlack[(x * 8) + y]);
        case 'r':
            return (isWhite ? rookEvalWhite[(x * 8) + y] : -rookEvalBlack[(x * 8) + y]);
        case 'n':
            return (isWhite ? knightEval[(x * 8) + y] : -knightEval[(x * 8) + y]);
        case 'b':
            return (isWhite ? bishopEvalWhite[(x * 8) + y] : -bishopEvalBlack[(x * 8) + y]);
        case 'q':
            return (isWhite ? evalQueen[(x * 8) + y] : -evalQueen[(x * 8) + y]);
        case 'k':
            return (isWhite ? kingEvalWhite[(x * 8) + y] : -kingEvalBlack[(x * 8) + y]);
        default:
            throw "Unknown piece type: " + piece;
    }
};


// init endgame checker
var IsEndGame = {
    isWhiteEndgame: false,
    isBlackEndgame: false,
};

// get the board value
// check also for endgame
var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    var totalBlackEvaluation = 0;
    var totalWhiteEvaluation = 0;
    var Value;

    for (var i = 0; i < board.length; i++) {

        Value = getPieceValue(board[i].type, board[i].color === 'w', board[i].row, board[i].col);
        // value smaller than 0 that means its black piece value
        if (Value < 0) {
            totalBlackEvaluation = totalBlackEvaluation + Value;
        }
        if (Value > 0) {
            totalWhiteEvaluation = totalWhiteEvaluation + Value;
        }
        totalEvaluation = totalEvaluation + Value;

    }

    if ((-totalBlackEvaluation) < 1050)
        IsEndGame.isBlackEndgame = true;

    if ((totalWhiteEvaluation) < 1050)
        IsEndGame.isWhiteEndgame = true;

    return totalEvaluation;
};


// to stop AI to do threefold repetition
var move1;
var move2;
var count = 0;

/* Minimax and Alpha-Beta Pruning  algorithms */
// algorithm that create a search tree to chose the best move (best case scenario)
// return either the smallest or the largest value of the child to the parent node
// depending on whether it’s a white or black to move
var minimaxRoot = function (depthlayer, game, isBlackTurn) {

    // generate all moves for this turn
    var newGameMoves = game.ugly_moves();

    // Sort moves ( MOVE ORDERING ) to get more important moves first
    //it helps a lot alpha beta to be much faster
    newGameMoves = mergeSort(newGameMoves);

    // make it biggest so black(AI) always choose first move he got then compare it with other moves
    var bestMove = 9999;

    // save best move found
    var bestMoveFound;

    // get best move for this turn
    for (var i = 0; i < newGameMoves.length; i++) {

        // to stop AI do the threefold repetition
        // unless its the only move
        if (newGameMoves.length > 1) {
            if (count === 0 && move1 === newGameMoves[i])
                continue;
            if (count === 1 && move2 === newGameMoves[i])
                continue;
        }

        // get the current move
        var newGameMove = newGameMoves[i]

        // make the move so we get the board value when this move is done
        game.ugly_move(newGameMove);

        // get the best value of board after this move is done
        var value = minimax(depthlayer - 1, game, -10000, 10000, !isBlackTurn);

        // cancel the move so no changes is really happened to the board
        game.cancel_move();

        // if the move is better than the previous best move make it the best move
        if (value <= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }

    // track the moves
    if (count === 0) {
        count++;
        move1 = bestMoveFound;
    }
    else if (count === 1) {
        count--;
        move2 = bestMoveFound;
    }

    return bestMoveFound;
};

//use recursive tree function
var minimax = function (depthlayer, game, alpha, beta, isBlackTurn) {

    // increase positions that checked by 1
    positionCount++;

    // if we reached the "leaves" of tree return the value
    if (depthlayer === 0) {
        return evaluateBoard(game.board());
    }

    // get all moves for this turn in tree
    var newGameMoves = game.ugly_moves();

    // Sort moves ( MOVE ORDERING ) to get more important moves first
    //it helps a lot alpha beta to be much faster
    newGameMoves = mergeSort(newGameMoves);

    if (isBlackTurn) {
        // make it biggest so black(AI) always choose first move he got then compare it with other moves
        var bestMove = 9999;

        // get best move for this turn
        for (var i = 0; i < newGameMoves.length; i++) {

            // make the move so we get the board value when this move is done
            game.ugly_move(newGameMoves[i]);

            // get the best value of board after this move is done
            // and if the move is better than the previous best move make it the best move
            bestMove = Math.min(bestMove, minimax(depthlayer - 1, game, alpha, beta, !isBlackTurn));

            // cancel the move so no changes is really happened to the board
            game.cancel_move();


            // get beta
            beta = Math.min(beta, bestMove);
            // so now if there is already better move no need to expand other possible moves
            // that there is already better moves we already choosed 
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        // make it smallest so white always choose first move he got then compare it with other moves
        var bestMove = -9999;

        // get best move for this turn
        for (var i = 0; i < newGameMoves.length; i++) {

            // make the move so we get the board value when this move is done
            game.ugly_move(newGameMoves[i]);

            // get the best value of board after this move is done
            // and if the move is better than the previous best move make it the best move
            bestMove = Math.max(bestMove, minimax(depthlayer - 1, game, alpha, beta, !isBlackTurn));

            // cancel the move so no changes is really happened to the board
            game.cancel_move();

            // get alpha
            alpha = Math.max(alpha, bestMove);

            // so now if there is already better move no need to expand other possible moves
            // that there is already better moves we already choosed 
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};

/* move ordering algorithm */
// we use mergesort aalgorithm to sort moves
// so alpha beta algorithm can cut more move from his way
function mergeSort(arr) {
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);

    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
    var result = [];

    while (left.length && right.length) {
        if (left[0].flags <= right[0].flags) {
            result.push(right.shift());
        } else {
            result.push(left.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}
