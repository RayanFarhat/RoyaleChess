////////////////////////////////////////////////////////////////////////
var $ = window['jQuery'];

window['ChessFrontEnd'] = function ChessFrontEnd(containerID, config) {

    var COLUMNS = 'abcdefgh'.split('');
    var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    var START_POSITION = fenToObj(START_FEN);

    // save CSS class names in array
    var CSS = {};
    CSS['alpha'] = 'alpha-class';
    CSS['black'] = 'black-class';
    CSS['board'] = 'board-class';
    CSS['chessboard'] = 'chessboard-class';
    CSS['clearfix'] = 'clearfix-class';
    CSS['highlight1'] = 'highlight1-class';
    CSS['highlight2'] = 'highlight2-class';
    CSS['notation'] = 'notation-class';
    CSS['numeric'] = 'numeric-class';
    CSS['piece'] = 'piece-class';
    CSS['row'] = 'row-class';
    CSS['square'] = 'square-class';
    CSS['white'] = 'white-class';

    // convert containerEl to query selector if it is a string
    containerID = '#' + containerID;
    var $container = $(containerID);
    if (!$container) return null;

    // piece theme is location
    config.pieceTheme = 'chesspieces/{piece}.png';

    // DOM elements
    var $board = null;
    var $draggedPiece = null;

    // ChessFrontEnd return object
    var widget = {};

    // save orientation (player color) in variable
    var currentOrientation = config.orientation;

    //create position array
    var currentPosition = {};

    // create dragged piece variable
    var draggedPiece = null;

    // create dragged piece location variable
    var draggedPieceLocation = null;

    // create dragged piece source location variable
    var draggedPieceSource = null;

    // create boolean to check if piece is dragging or not
    var isDragging = false;

    // create array for squares IDs
    var squaresIDs = {};

    // create array for squares locations
    var squaresLocations = {};

    // square size variable for better clean code
    var squareSize = 500 / 8;

    // ---------------------------------------------------------------------------
    // Data dealing functions 
    // ---------------------------------------------------------------------------

    // return random ID 
    function createID() {
        return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
            var r = (Math.random() * 16) | 0;
            return r.toString(16);
        });
    }

    // return the string as JSON representation
    function createJSON(thing) {
        return JSON.parse(JSON.stringify(thing));
    }

    // mege the object and the property
    function mergeTemplate(str, obj) {
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            var keyTemplateStr = '{' + key + '}';
            var value = obj[key];
            while (str.indexOf(keyTemplateStr) !== -1) {
                str = str.replace(keyTemplateStr, value);
            }
        }
        return str;
    }

    // ---------------------------------------------------------------------------
    // check functions for mor clear code
    // ---------------------------------------------------------------------------

    function isFunction(f) {
        return typeof f === 'function';
    }

    function validSquare(square) {
        return square.search(/^[a-h][1-8]$/) !== -1;
    }

    // ---------------------------------------------------------------------------
    // Chess convert functions
    // ---------------------------------------------------------------------------

    // convert FEN piece code to bP, wK, etc
    function fenToPieceCode(piece) {
        // black piece
        if (piece.toLowerCase() === piece) {
            return 'b' + piece.toUpperCase();
        }

        // white piece
        return 'w' + piece.toUpperCase();
    }

    // convert FEN string to position object
    // returns false if the FEN string is invalid
    function fenToObj(fen) {
        // cut off any move, castling, etc info from the end
        // we're only interested in position information
        fen = fen.replace(/ .+$/, '');

        var rows = fen.split('/');
        var position = {};

        var currentRow = 8;
        for (var i = 0; i < 8; i++) {
            var row = rows[i].split('');
            var colIdx = 0;

            // loop through each character in the FEN section
            for (var j = 0; j < row.length; j++) {
                // number / empty squares
                if (row[j].search(/[1-8]/) !== -1) {
                    var numEmptySquares = parseInt(row[j], 10);
                    colIdx = colIdx + numEmptySquares;
                } else {
                    // piece
                    var square = COLUMNS[colIdx] + currentRow;
                    position[square] = fenToPieceCode(row[j]);
                    colIdx = colIdx + 1;
                }
            }

            currentRow = currentRow - 1;
        }

        return position;
    }



    // ---------------------------------------------------------------------------
    // HTML
    // ---------------------------------------------------------------------------

    // build the container
    function build_Container_HTML() {
        var html = '<div class="{chessboard}">';
        html += '<div class="{board}"></div>';
        html += '</div>';

        return mergeTemplate(html, CSS);
    }

    // build and draw the board
    function build_Board_HTML(orientation) {
        if (orientation !== 'black') {
            orientation = 'white';
        }

        var html = '';

        // algebraic notation / orientation
        var alpha = createJSON(COLUMNS);
        var row = 8;
        if (orientation === 'black') {
            alpha.reverse();
            row = 1;
        }

        var squareColor = 'white';
        for (var i = 0; i < 8; i++) {
            html += '<div class="{row}">';
            for (var j = 0; j < 8; j++) {
                var square = alpha[j] + row;

                html += '<div class="{square} ' + CSS[squareColor] + ' ' +
                    'square-' + square + '" ' +
                    'style="width:' + squareSize + 'px;height:' + squareSize + 'px;" ' +
                    'id="' + squaresIDs[square] + '" ' +
                    'data-square="' + square + '">';

                // show the index symbols
                // alpha notation
                if ((orientation === 'white' && row === 1) ||
                    (orientation === 'black' && row === 8)) {
                    html += '<div class="{notation} {alpha}">' + alpha[j] + '</div>';
                }

                // numeric notation
                if (j === 0) {
                    html += '<div class="{notation} {numeric}">' + row + '</div>';
                }


                html += '</div>'; // end .square

                squareColor = (squareColor === 'white') ? 'black' : 'white';
            }
            html += '<div class="{clearfix}"></div></div>';

            squareColor = (squareColor === 'white') ? 'black' : 'white';

            if (orientation === 'white') {
                row = row - 1;
            } else {
                row = row + 1;
            }
        }

        return mergeTemplate(html, CSS);
    }

    // return Src property of Piece image
    function build_Piece_Img_Src(piece) {
        return mergeTemplate(config.pieceTheme, { piece: piece });
    }

    // draw and build the piece
    function build_Piece_HTML(piece, hidden, id) {
        var html = '<img src="' + build_Piece_Img_Src(piece) + '" ';
        if (id !== '') {
            html += 'id="' + id + '" ';
        }
        html += 'alt="" ' +
            'class="{piece}" ' +
            'data-piece="' + piece + '" ' +
            'style="width:' + squareSize + 'px;' + 'height:' + squareSize + 'px;';

        if (hidden) {
            html += 'display:none;';
        }

        html += '" />';

        return mergeTemplate(html, CSS);
    }

    // -------------------------------------------------------------------------
    // Control Flow
    // -------------------------------------------------------------------------

    //rebuild and redraw the pieces on the board
    function draw_New_Position() {
        // clear the board
        $board.find('.' + CSS.piece).remove();

        // add the pieces
        for (var i in currentPosition) {
            if (!currentPosition.hasOwnProperty(i)) continue;

            $('#' + squaresIDs[i]).append(build_Piece_HTML(currentPosition[i]));
        }
    }

    // check if the dragged piece is still on board or outside the board
    function Is_On_Square(x, y) {
        for (var i in squaresLocations) {
            if (!squaresLocations.hasOwnProperty(i)) continue;

            var s = squaresLocations[i];
            if (x >= s.left &&
                x < s.left + squareSize &&
                y >= s.top &&
                y < s.top + squareSize) {
                // return the index of new square
                return i;
            }
        }
        // return if placed outside the board
        return 'outsideBoard';
    }

    // records the XY coords of every square into memory
    function capture_Square_Location() {
        squaresLocations = {};

        for (var i in squaresIDs) {
            if (!squaresIDs.hasOwnProperty(i)) continue;

            squaresLocations[i] = $('#' + squaresIDs[i]).offset();
        }
    }

    // remove the highlights of the squares
    function removeSquareHighlights() {
        $board
            .find('.' + CSS.square)
            .removeClass(CSS.highlight1 + ' ' + CSS.highlight2);
    }

    // return the piece to the squere
    function snapbackDraggedPiece() {

        // first remove square highlights
        removeSquareHighlights();

        // animation complete
        draw_New_Position();
        $draggedPiece.css('display', 'none');

        // set state
        isDragging = false;
    }

    // place the piece on the square
    function dropDraggedPieceOnSquare(square) {

        // first remove square highlights
        removeSquareHighlights();

        // update position
        var newPosition = createJSON(currentPosition);
        delete newPosition[draggedPieceSource];
        newPosition[square] = draggedPiece;
        // update state
        currentPosition = newPosition;

        // draw new position
        draw_New_Position();
        $draggedPiece.css('display', 'none');

        // execute their on_Drop_End function
        config.on_Drop_End(draggedPieceSource, square, draggedPiece);

        // set state
        isDragging = false;
    }

    // control and manage the piece that begin dragging
    function beginDraggingPiece(source, piece, x, y) {

        // run their custom on_Drag_Start function
        // their custom on_Drag_Start function can cancel drag start
        if (config.on_Drag_Start(source, piece, createJSON(currentPosition), currentOrientation) === false) {
            return;
        }

        // set state
        isDragging = true;
        draggedPiece = piece;
        draggedPieceSource = source;

        // save the dragged piece location
        draggedPieceLocation = source;

        // capture the x, y coords of all squares in memory
        capture_Square_Location();

        // create the dragged piece
        $draggedPiece.attr('src', build_Piece_Img_Src(piece)).css({
            display: '',
            position: 'absolute',
            left: x - squareSize / 2,
            top: y - squareSize / 2
        });

        // highlight the source square and hide the piece
        $('#' + squaresIDs[source])
            .addClass(CSS.highlight1)
            .find('.' + CSS.piece)
            .css('display', 'none');
    }

    // update dragged piece location all the time
    function updateDraggedPiece(x, y) {

        // put the dragged piece over the mouse cursor
        $draggedPiece.css({
            left: x - squareSize / 2,
            top: y - squareSize / 2
        });

        // get location
        var location = Is_On_Square(x, y);

        // do nothing if the location has not changed
        if (location === draggedPieceLocation) return;

        // remove highlight from previous square
        if (validSquare(draggedPieceLocation)) {
            $('#' + squaresIDs[draggedPieceLocation]).removeClass(CSS.highlight2);
        }

        // add highlight to new square
        if (validSquare(location)) {
            $('#' + squaresIDs[location]).addClass(CSS.highlight2);
        }

        // run onDragMove
        if (isFunction(config.onDragMove)) {
            config.onDragMove(
                location,
                draggedPieceLocation,
                draggedPieceSource,
                draggedPiece,
                createJSON(currentPosition),
                currentOrientation
            );
        }

        // update state
        draggedPieceLocation = location;
    }

    // handle where dragged piece dropped
    function stopDraggedPiece(location) {

        // determine what the action should be
        var action = 'drop';
        if (location === 'outsideBoard') {
            action = 'returnToSrc';
        }

        // create the position
        var newPosition = createJSON(currentPosition);

        // source piece was on the board and position is off the board
        if (validSquare(draggedPieceSource) && location === 'outsideBoard') {
            // remove the piece from the board
            delete newPosition[draggedPieceSource];
        }

        // source piece was on the board and position is on the board
        if (validSquare(draggedPieceSource) && validSquare(location)) {
            // move the piece
            delete newPosition[draggedPieceSource];
            newPosition[location] = draggedPiece;
        }

        var oldPosition = createJSON(currentPosition);

        // run their on_Drop function, which can potentially change the drop action
        var result = config.on_Drop(
            draggedPieceSource,
            location,
            draggedPiece,
            newPosition,
            oldPosition,
            currentOrientation
        );
        if (result === 'returnToSrc') {
            action = result;
        }


        // do the action
        if (action === 'returnToSrc') {
            snapbackDraggedPiece();
        } else if (action === 'drop') {
            dropDraggedPieceOnSquare(location);
        }
    }


    // -------------------------------------------------------------------------
    // Browser Events
    // -------------------------------------------------------------------------

    // stop the Defualt mouse moving of the browser
    function stopDefault(evt) {
        evt.preventDefault();
    }

    // handle mouse in the square
    function mouse_Down_Square(evt) {
        // do nothing if there is no piece on this square
        var square = $(this).attr('data-square');
        if (!validSquare(square)) return;
        if (!currentPosition.hasOwnProperty(square)) return;

        // start dragging
        beginDraggingPiece(square, currentPosition[square], evt.pageX, evt.pageY);
    }

    // when mouse moved handle the dragged piece
    function mouse_Move_Window(evt) {
        if (isDragging) {
            updateDraggedPiece(evt.pageX, evt.pageY);
        }
    }

    // handle when mouse release the dragged piece
    function mouse_Up_Window(evt) {

        // do nothing if we are not dragging a piece
        if (!isDragging) return;

        // get the location
        var location = Is_On_Square(evt.pageX, evt.pageY);

        stopDraggedPiece(location);
    }

    // handle when mouse on the square without dragging 
    function mouse_Enter_Square(evt) {
        // do not fire this event if we are dragging a piece
        // NOTE: this should never happen, but it's a safeguard
        if (isDragging) return;

        // get the square
        var square = $(evt.currentTarget).attr('data-square');

        // get the piece on this square
        var piece = false;
        if (currentPosition.hasOwnProperty(square)) {
            piece = currentPosition[square];
        }

        // execute their function 
        config.on_Mouse_Over_Square(square, piece, createJSON(currentPosition), currentOrientation);
    }

    // / handle when mouse leave the square without dragging 
    function mouse_Leave_Square(evt) {
        // do not fire this event if we are dragging a piece
        // NOTE: this should never happen, but it's a safeguard
        if (isDragging) return;

        // get the square
        var square = $(evt.currentTarget).attr('data-square');

        // get the piece on this square
        var piece = false;
        if (currentPosition.hasOwnProperty(square)) {
            piece = currentPosition[square];
        }

        // execute their function
        config.on_Mouse_Out_Square(square, piece, createJSON(currentPosition), currentOrientation);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    widget.position = function (position) {
        // convert FEN to position object
        position = fenToObj(position);

        // update position
        currentPosition = position;
        draw_New_Position();
    };

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    function startBuild() {
        // create unique IDs for all the elements we will create
        // squares on the board
        for (var i = 0; i < COLUMNS.length; i++) {
            for (var j = 1; j <= 8; j++) {
                var square = COLUMNS[i] + j;
                squaresIDs[square] = square + '-' + createID();
            }
        }

        // build board and save it in memory
        $container.html(build_Container_HTML());
        $board = $container.find('.' + CSS.board);

        // create the drag piece
        var draggedPieceId = createID();
        $('body').append(build_Piece_HTML('wP', true, draggedPieceId));
        $draggedPiece = $('#' + draggedPieceId);

        // set board width
        $board.css('width', squareSize * 8 + 'px');

        // set drag piece size
        $draggedPiece.css({
            height: squareSize,
            width: squareSize
        });

        // draw the board
        $board.html(build_Board_HTML(currentOrientation, squareSize));
        draw_New_Position();
    }

    // collcet all event handling functions here
    function handleEvents() {
        // prevent "image drag"
        $('body').on('mousedown mousemove', '.' + CSS.piece, stopDefault);

        // mouse drag pieces
        $board.on('mousedown', '.' + CSS.square, mouse_Down_Square);

        // mouse enter / leave square
        $board
            .on('mouseenter', '.' + CSS.square, mouse_Enter_Square)
            .on('mouseleave', '.' + CSS.square, mouse_Leave_Square);

        // piece drag
        $(window)
            .on('mousemove', mouse_Move_Window)
            .on('mouseup', mouse_Up_Window);
    }

    // -------------------------------------------------------------------------
    // Init
    // -------------------------------------------------------------------------

    currentPosition = createJSON(START_POSITION);
    startBuild();
    handleEvents();

    // return the widget object
    return widget;
}; // end front end