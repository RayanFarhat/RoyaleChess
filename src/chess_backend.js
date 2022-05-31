// start
var ChessBackEnd = function () {

    // represent with one letter for easier readability
    var BLACK = 'b';
    var WHITE = 'w';

    var EMPTY = -1;

    var PAWN = 'p';
    var KNIGHT = 'n';
    var BISHOP = 'b';
    var ROOK = 'r';
    var QUEEN = 'q';
    var KING = 'k';

    var SYMBOLS = 'pnbrqkPNBRQK';

    // default position when chess game start
    var DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

    // pawn possible moves
    var Pawn_Moves = {
        b: [16, 32, 17, 15],
        w: [-16, -32, -17, -15]
    };

    // pieces possible moves
    var Pieces_Moves = {
        n: [-18, -33, -31, -14, 18, 33, 31, 14],
        b: [-17, -15, 17, 15],
        r: [-16, 1, 16, -1],
        q: [-17, -16, -15, 1, 17, 16, 15, -1],
        k: [-17, -16, -15, 1, 17, 16, 15, -1]
    };


    ////////////////////////////////////////////////////////////////////
    // this part we use with 0x88 to catch fast if there is enemy pieces threaten the selected piece
    var ATTACKS = [
        20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0,
        0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
        0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
        0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
        0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
        24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0,
        0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0,
        0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0,
        0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
        0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0,
        20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20
    ];

    var STEPS = [
        17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0,
        0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0,
        0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
        0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0,
        0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0,
        0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0,
        0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0,
        0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0,
        0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
        -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17
    ];

    var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };
    ////////////////////////////////////////////////////////////////////

    // to know the actions and control it
    var FLAGS = {
        NORMAL: 'n',
        BIG_PAWN: 'b',
        QSIDE_CASTLE: 'q',
        KSIDE_CASTLE: 'k',
        EP_CAPTURE: 'e',
        CAPTURE: 'c',
        PROMOTION: 'p'
    };

    // in bits for performance 
    // also needed for sorting the moves
    var BITS = {
        NORMAL: 1,
        BIG_PAWN: 2,
        QSIDE_CASTLE: 4,
        KSIDE_CASTLE: 8,
        EP_CAPTURE: 16,
        CAPTURE: 32,
        PROMOTION: 64
    };

    // just to not get confused with ranks
    var RANK_1 = 7;
    var RANK_2 = 6;
    var RANK_3 = 5;
    var RANK_4 = 4;
    var RANK_5 = 3;
    var RANK_6 = 2;
    var RANK_7 = 1;
    var RANK_8 = 0;

    // 0x88 board for performanace
    var SQUARES = {
        a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
        a7: 16, b7: 17, c7: 18, d7: 19, e7: 20, f7: 21, g7: 22, h7: 23,
        a6: 32, b6: 33, c6: 34, d6: 35, e6: 36, f6: 37, g6: 38, h6: 39,
        a5: 48, b5: 49, c5: 50, d5: 51, e5: 52, f5: 53, g5: 54, h5: 55,
        a4: 64, b4: 65, c4: 66, d4: 67, e4: 68, f4: 69, g4: 70, h4: 71,
        a3: 80, b3: 81, c3: 82, d3: 83, e3: 84, f3: 85, g3: 86, h3: 87,
        a2: 96, b2: 97, c2: 98, d2: 99, e2: 100, f2: 101, g2: 102, h2: 103,
        a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
    };

    // starter position of rooks and says if it closer to king or queen
    var ROOKS = {
        w: [{ square: SQUARES.a1, flag: BITS.QSIDE_CASTLE },
        { square: SQUARES.h1, flag: BITS.KSIDE_CASTLE }],
        b: [{ square: SQUARES.a8, flag: BITS.QSIDE_CASTLE },
        { square: SQUARES.h8, flag: BITS.KSIDE_CASTLE }]
    };

    // start board array
    var board = new Array(128);
    var kings = { w: EMPTY, b: EMPTY };
    //starter turn is always for white
    var turn = WHITE;

    // fast way to know if castling is stil available
    var castling = { w: 0, b: 0 };
    castling.w |= BITS.KSIDE_CASTLE;
    castling.w |= BITS.QSIDE_CASTLE;
    castling.b |= BITS.KSIDE_CASTLE;
    castling.b |= BITS.QSIDE_CASTLE;

    // for EN Passant event
    var ep_square = EMPTY;

    // keep tracking of moves
    var MOVES_STACK = [];

    /* start with starting position */

    // save square index in 0x88 board
    var square = 0;

    // insert pieces in default position to the board
    for (var i = 0; i < DEFAULT_POSITION.length; i++) {
        //get the piece char
        var piece = DEFAULT_POSITION.charAt(i);

        // if it is '/' then we go to next row
        if (piece === '/') {
            square += 8;
            //if the piece is a number then we skip this number times
        } else if (is_digit(piece)) {
            square += parseInt(piece, 10);
        } else {
            // determine if the piece is white or black (lowercase is black)
            var color = (piece < 'a') ? WHITE : BLACK;
            // insert the piece with square index
            put({ type: piece.toLowerCase(), color: color }, get_notation(square));
            square++;
        }
    }

    /***************************************************************************
    * Functions start here
    **************************************************************************/

    // get the fen from the squares array
    function generate_fen() {
        var empty = 0;
        var fen = '';

        //real all board
        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
            //check how many empty squares until next piece
            if (board[i] == null) {
                empty++;
            } else {
                //if we have empty number then put it in fen the reset it
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                //get piece color and type
                var color = board[i].color;
                var piece = board[i].type;

                // put piece in fen as upper case or lower case depend on the color (lower case is black)
                fen += (color === WHITE) ?
                    piece.toUpperCase() : piece.toLowerCase();
            }
            //if we reached to the end of the line then insert '/' to fen
            if ((i + 1) & 0x88) {
                if (empty > 0) {
                    fen += empty;
                }

                if (i !== SQUARES.h1) {
                    fen += '/';
                }

                empty = 0;
                i += 8;
            }
        }
        return fen;
    }

    // insert piece to the square
    function put(piece, square) {
        /* check for valid piece object */
        if (!('type' in piece && 'color' in piece)) {
            return false;
        }

        /* check for piece */
        if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
            return false;
        }

        /* check for valid square */
        if (!(square in SQUARES)) {
            return false;
        }

        var sq = SQUARES[square];

        /* don't let the user place more than one king */
        if (piece.type == KING &&
            !(kings[piece.color] == EMPTY || kings[piece.color] == sq)) {
            return false;
        }

        board[sq] = { type: piece.type, color: piece.color };
        if (piece.type === KING) {
            kings[piece.color] = sq;
        }

        return true;
    }

    // create the move
    function build_move(board, from, to, flags, promotion) {
        var move = {
            color: turn,
            from: from,
            to: to,
            flags: flags,
            piece: board[from].type
        };

        // return promotion check also
        if (promotion) {
            move.flags |= BITS.PROMOTION;
            move.promotion = promotion;
        }

        // check for captured pieces
        if (board[to]) {
            move.captured = board[to].type;
        } else if (flags & BITS.EP_CAPTURE) {
            move.captured = PAWN;
        }
        return move;
    }

    // generate ugly moves (moves that repersent by board index)
    function get_moves(options) {
        function add_move(board, moves, from, to, flags) {
            /* if pawn promotion */
            if (board[from].type === PAWN &&
                (rank(to) === RANK_8 || rank(to) === RANK_1)) {
                moves.push(build_move(board, from, to, flags, QUEEN));
            } else {
                moves.push(build_move(board, from, to, flags));
            }
        }

        var moves = [];
        var us = turn;
        var them = swap_color(us);
        var second_rank = { b: RANK_7, w: RANK_2 };

        var first_sq = SQUARES.a8;
        var last_sq = SQUARES.h1;
        var single_square = false;

        /* are we generating moves for a single square? */
        if (typeof options !== 'undefined' && 'square' in options) {
            if (options.square in SQUARES) {
                first_sq = last_sq = SQUARES[options.square];
                single_square = true;
            } else {
                /* invalid square */
                return [];
            }
        }

        for (var i = first_sq; i <= last_sq; i++) {
            /* did we run off the end of the board */
            if (i & 0x88) { i += 7; continue; }

            var piece = board[i];

            if (piece == null || piece.color !== us) {
                continue;
            }

            if (piece.type === PAWN) {
                /* single square, non-capturing */
                var square = i + Pawn_Moves[us][0];
                if (board[square] == null) {
                    add_move(board, moves, i, square, BITS.NORMAL);

                    /* double square */
                    var square = i + Pawn_Moves[us][1];
                    if (second_rank[us] === rank(i) && board[square] == null) {
                        add_move(board, moves, i, square, BITS.BIG_PAWN);
                    }
                }

                /* pawn captures */
                for (j = 2; j < 4; j++) {
                    var square = i + Pawn_Moves[us][j];
                    if (square & 0x88) continue;

                    if (board[square] != null &&
                        board[square].color === them) {
                        add_move(board, moves, i, square, BITS.CAPTURE);
                    } else if (square === ep_square) {
                        add_move(board, moves, i, ep_square, BITS.EP_CAPTURE);
                    }
                }
            } else {
                //for other pieces
                for (var j = 0, len = Pieces_Moves[piece.type].length; j < len; j++) {
                    var offset = Pieces_Moves[piece.type][j];
                    var square = i;

                    // keep check all squares until reach other piece same as us
                    while (true) {
                        square += offset;
                        if (square & 0x88) break;

                        if (board[square] == null) {
                            add_move(board, moves, i, square, BITS.NORMAL);
                        } else {
                            if (board[square].color === us) break;
                            add_move(board, moves, i, square, BITS.CAPTURE);
                            break;
                        }

                        /* break, if knight or king */
                        if (piece.type === 'n' || piece.type === 'k') break;
                    }
                }
            }
        }

        // check for castling if: 
        // a) we're generating all moves
        // b) we're doing single square move generation on the king's square        
        if ((!single_square) || last_sq === kings[us]) {
            /* king-side castling */
            if (castling[us] & BITS.KSIDE_CASTLE) {
                var castling_from = kings[us];
                var castling_to = castling_from + 2;

                if (board[castling_from + 1] == null &&
                    board[castling_to] == null &&
                    !threatened(them, kings[us]) &&
                    !threatened(them, castling_from + 1) &&
                    !threatened(them, castling_to)) {
                    add_move(board, moves, kings[us], castling_to,
                        BITS.KSIDE_CASTLE);
                }
            }

            /* queen-side castling */
            if (castling[us] & BITS.QSIDE_CASTLE) {
                var castling_from = kings[us];
                var castling_to = castling_from - 2;

                if (board[castling_from - 1] == null &&
                    board[castling_from - 2] == null &&
                    board[castling_from - 3] == null &&
                    !threatened(them, kings[us]) &&
                    !threatened(them, castling_from - 1) &&
                    !threatened(them, castling_to)) {
                    add_move(board, moves, kings[us], castling_to,
                        BITS.QSIDE_CASTLE);
                }
            }
        }

        /* filter out illegal moves (moves that not threaten our king) */
        var legal_moves = [];
        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i]);
            if (!king_attacked(us)) {
                legal_moves.push(moves[i]);
            }
            cancel_move();
        }

        return legal_moves;
    }

    // check for piece if it is threatened
    function threatened(color, square) {
        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
            /* did we run off the end of the board */
            if (i & 0x88) { i += 7; continue; }

            /* if empty square or wrong color */
            if (board[i] == null || board[i].color !== color) continue;

            var piece = board[i];

            // difference between enemy index and square index
            var difference = i - square;
            var index = difference + 119;

            // check if square in range of enemy piece (can be eaten)
            // include if blocked or not
            if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {

                if (piece.type === PAWN) {
                    // check difference because pawn can only eat forward
                    if (difference > 0) {
                        if (piece.color === WHITE) return true;
                    } else {
                        if (piece.color === BLACK) return true;
                    }
                    continue;
                }

                // if the piece is a knight or a king then return true
                // because it can't be another piece blocked
                if (piece.type === 'n' || piece.type === 'k') return true;

                // get the first step the enemy piece can do
                var offset = STEPS[index];
                var j = i + offset;

                // check if path is blocked
                var blocked = false;
                while (j !== square) {
                    if (board[j] != null) { blocked = true; break; }
                    j += offset;
                }

                // if path is not blocked then the square is under attack
                if (!blocked) return true;
            }
        }

        // if no then the square is safe
        return false;
    }

    // check if king is threatened
    function king_attacked(color) {
        return threatened(swap_color(color), kings[color]);
    }

    // if king is under attack then you in check 
    function in_check() {
        return king_attacked(turn);
    }

    // if king in check and there is no moves available then you are in checkmate
    function in_checkmate() {
        return in_check() && get_moves().length === 0;
    }

    // if king not in check and there is no moves available then you in stalemate
    function in_stalemate() {
        return !in_check() && get_moves().length === 0;
    }

    // when neither player has enough pieces left on the board
    // so that they can Check-Mate the other player
    function insufficient_material() {
        var pieces = {};
        var bishops = [];
        var num_pieces = 0;
        var sq_color = 0;

        for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
            // save what square color we are in now
            sq_color = (sq_color + 1) % 2;
            if (i & 0x88) { i += 7; continue; }

            var piece = board[i];
            if (piece) {
                pieces[piece.type] = (piece.type in pieces) ?
                    pieces[piece.type] + 1 : 1;
                if (piece.type === BISHOP) {
                    // now we know if the bishops in same color or not
                    bishops.push(sq_color);
                }
                num_pieces++;
            }
        }

        /* if just king vs king */
        if (num_pieces === 2) { return true; }

        /* if there is only one KNIGHT or one BISHOP */
        else if (num_pieces === 3 && (pieces[BISHOP] === 1 ||
            pieces[KNIGHT] === 1)) { return true; }

        /* king and BISHOP vs king and BISHOP where any number of bishops are all on the same color */
        else if (num_pieces === pieces[BISHOP] + 2) {
            var sum = 0;
            var len = bishops.length;
            for (var i = 0; i < len; i++) {
                sum += bishops[i];
            }
            if (sum === 0 || sum === len) { return true; }
        }

        return false;
    }

    //the threefold repetition rule states that a player may
    // claim a draw if the same position occurs three times.
    function in_threefold_repetition() {

        var moves = [];
        var positions = {};
        var repetition = false;

        while (true) {
            var move = cancel_move();
            if (!move) break;
            moves.push(move);
        }

        while (true) {
            /* remove the last two fields in the FEN string, they're not needed
             * when checking for draw by rep */
            var fen = generate_fen().split(' ').slice(0, 4).join(' ');

            /* has the position occurred three or move times */
            positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
            if (positions[fen] >= 3) {
                repetition = true;
            }

            if (!moves.length) {
                break;
            }
            make_move(moves.pop());
        }

        return repetition;
    }

    // push the move to keep tracking it
    function push(move) {
        MOVES_STACK.push({
            move: move,
            kings: { b: kings.b, w: kings.w },
            turn: turn,
            castling: { b: castling.b, w: castling.w },
            ep_square: ep_square,
        });
    }

    // make the real move in board (change pieces place)
    function make_move(move) {
        var us = turn;
        var them = swap_color(us);
        push(move);

        board[move.to] = board[move.from];
        board[move.from] = null;

        /* if ep capture, remove the captured pawn */
        if (move.flags & BITS.EP_CAPTURE) {
            if (turn === BLACK) {
                board[move.to - 16] = null;
            } else {
                board[move.to + 16] = null;
            }
        }

        /* if pawn promotion, replace with queen piece */
        if (move.flags & BITS.PROMOTION) {
            board[move.to] = { type: QUEEN, color: us };
        }

        /* if we moved the king */
        if (board[move.to].type === KING) {
            kings[board[move.to].color] = move.to;

            /* if we castled, move the rook next to the king */
            if (move.flags & BITS.KSIDE_CASTLE) {
                var castling_to = move.to - 1;
                var castling_from = move.to + 1;
                board[castling_to] = board[castling_from];
                board[castling_from] = null;
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                var castling_to = move.to + 1;
                var castling_from = move.to - 2;
                board[castling_to] = board[castling_from];
                board[castling_from] = null;
            }

            /* turn off castling */
            castling[us] = '';
        }

        /* turn off castling if we move a rook */
        if (castling[us]) {
            for (var i = 0, len = ROOKS[us].length; i < len; i++) {
                if (move.from === ROOKS[us][i].square &&
                    castling[us] & ROOKS[us][i].flag) {
                    castling[us] ^= ROOKS[us][i].flag;
                    break;
                }
            }
        }

        /* turn off castling if we capture a rook */
        if (castling[them]) {
            for (var i = 0, len = ROOKS[them].length; i < len; i++) {
                if (move.to === ROOKS[them][i].square &&
                    castling[them] & ROOKS[them][i].flag) {
                    castling[them] ^= ROOKS[them][i].flag;
                    break;
                }
            }
        }

        /* if big pawn move, update the en passant square */
        if (move.flags & BITS.BIG_PAWN) {
            if (turn === 'b') {
                ep_square = move.to - 16;
            } else {
                ep_square = move.to + 16;
            }
        } else {
            ep_square = EMPTY;
        }

        turn = swap_color(turn);
    }

    function cancel_move() {
        var old = MOVES_STACK.pop();
        //if no moves yet do nothing
        if (old == null) { return null; }

        //get old move info
        var move = old.move;
        kings = old.kings;
        turn = old.turn;
        castling = old.castling;
        ep_square = old.ep_square;

        var us = turn;
        var them = swap_color(turn);

        board[move.from] = board[move.to];
        board[move.from].type = move.piece;  // to cancel any promotions
        board[move.to] = null;

        // if move captured piece return it
        if (move.flags & BITS.CAPTURE) {
            board[move.to] = { type: move.captured, color: them };
            // if EP captured action happen then return the pawn 
        } else if (move.flags & BITS.EP_CAPTURE) {
            var index;
            if (us === BLACK) {
                index = move.to - 16;
            } else {
                index = move.to + 16;
            }
            board[index] = { type: PAWN, color: them };
        }

        // if castling happen cancel it
        if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            var castling_to, castling_from;
            if (move.flags & BITS.KSIDE_CASTLE) {
                castling_to = move.to + 1;
                castling_from = move.to - 1;
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                castling_to = move.to - 2;
                castling_from = move.to + 1;
            }

            board[castling_to] = board[castling_from];
            board[castling_from] = null;
        }

        // return last move
        return move;
    }




    /*****************************************************************************
     * UTILITY FUNCTIONS
     ****************************************************************************/

    // get index rank in board
    function rank(i) {
        return i >> 4;
    }

    // get index notation
    function get_notation(i) {
        //get index place on board
        var f = i & 15;
        var r = rank(i);
        return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1);
    }

    function swap_color(c) {
        return c === WHITE ? BLACK : WHITE;
    }

    function is_digit(c) {
        return '0123456789'.indexOf(c) !== -1;
    }

    // make the move readable with board notations
    function get_pretty_move(ugly_move) {
        var move = get_pretty_move_helper(ugly_move);

        move.to = get_notation(move.to);
        move.from = get_notation(move.from);

        var flags = '';

        for (var flag in BITS) {
            if (BITS[flag] & move.flags) {
                flags += FLAGS[flag];
            }
        }
        move.flags = flags;

        return move;
    }

    // slice move to get the move to and from objects
    function get_pretty_move_helper(obj) {
        var dupe = (obj instanceof Array) ? [] : {};

        for (var property in obj) {
            if (typeof property === 'object') {
                dupe[property] = get_pretty_move_helper(obj[property]);
            } else {
                dupe[property] = obj[property];
            }
        }

        return dupe;
    }

    return {
        /***************************************************************************
         * PUBLIC CONSTANTS
         **************************************************************************/
        WHITE: WHITE,
        BLACK: BLACK,
        PAWN: PAWN,
        KNIGHT: KNIGHT,
        BISHOP: BISHOP,
        ROOK: ROOK,
        QUEEN: QUEEN,
        KING: KING,
        SQUARES: (function () {
            var keys = [];
            for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                //if (i & 0x88) { i += 7; continue; }
                keys.push(get_notation(i));
            }
            return keys;
        })(),
        FLAGS: FLAGS,

        /***************************************************************************
         * PUBLIC API
         **************************************************************************/

        // get the moves options to choose for all squares of one square
        moves: function (options) {

            var ugly_moves = get_moves(options);
            var moves = [];

            // make them readable
            for (var i = 0, len = ugly_moves.length; i < len; i++) {
                moves.push(get_pretty_move(ugly_moves[i]));
            }
            return moves;
        },

        ugly_moves: function (options) {
            var ugly_moves = get_moves(options);
            return ugly_moves;
        },

        in_checkmate: function () {
            return in_checkmate();
        },

        in_draw: function () {
            return in_stalemate() ||
                insufficient_material() ||
                in_threefold_repetition();
        },

        game_over: function () {
            return in_checkmate() ||
                in_stalemate() ||
                insufficient_material() ||
                in_threefold_repetition();
        },

        fen: function () {
            return generate_fen();
        },

        board: function () {
            var output = [];
            var row_index = 0;
            var col_index = 0;

            for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                if (board[i] != null) {
                    output.push({ type: board[i].type, color: board[i].color, row: row_index, col: col_index })
                }

                if ((i + 1) & 0x88) {
                    i += 8;
                    row_index++;
                    col_index = 0;
                } else {
                    col_index++;
                }
            }
            return output;
        },

        turn: function () {
            return turn;
        },

        // make the move
        move: function (move) {

            var move_obj = null;


            var moves = get_moves();

            /* convert the pretty move object to an ugly move object */
            for (var i = 0, len = moves.length; i < len; i++) {
                if (move.from === get_notation(moves[i].from) &&
                    move.to === get_notation(moves[i].to)) {
                    move_obj = moves[i];
                    break;
                }
            }


            /* failed to find move */
            if (!move_obj) {
                return null;
            }

            // need to make a pretty copy of move to return it

            var pretty_move = get_pretty_move(move_obj);

            make_move(move_obj);

            return pretty_move;
        },

        ugly_move: function (move_obj) {
            var pretty_move = get_pretty_move(move_obj);
            make_move(move_obj);
            return pretty_move;
        },

        cancel_move: function () {
            var move = cancel_move();
            return (move) ? get_pretty_move(move) : null;
        },
    };
};