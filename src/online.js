// creates a new chess game
game = new ChessBackEnd();
var board;

//initialize the client socket
var client_socket = io();

// piece color
var playerColor = "white";

// number of players in the current room
var players;

// the username of player
var playerName;

// the room number between 0 and 99
var roomId;

// if the both players have joined then it will be true
var play = false;


// For Dom controling

//get username
var uid = document.getElementById("uid");
var username = document.getElementById("username");
var emptyUsername = document.getElementById("emptyUsername");
emptyUsername.style.display = "none";
//get rooms list
var roomlist = document.getElementById("roomlist");
var roomheader = document.getElementById("roomheader");
var roomNumber = document.getElementById("roomNumbers");
var game_status = document.getElementById('game_status');
var online_players = document.getElementById('online_players');

// show how many players online
client_socket.on('players', function (msg) {
    online_players.innerHTML = "Online players: " + msg;
});


// show the available rooms
client_socket.on('rooms', function (msg) {
    // show the not full rooms
    let li;
    for (let i = 0; i < 100; i++) {
        if (msg[i] === 2)
            continue;
        li = document.createElement("li");
        if (msg[i] === 1)
            li.style.backgroundColor = "#ccce60";
        li.appendChild(document.createTextNode("Room" + (i + 1) + " - " + msg[i] + "/2"));
        li.setAttribute("id", "element" + i);
        li.setAttribute("onclick", "connect(" + i + ")");
        roomlist.appendChild(li);
    }
});


//When we click the connect button it needs to emit an event with the room id that the player has entered
var connect = function (index) {
    // extract the value of the input field
    playerName = username.value;
    if (username.value == "") {
        emptyUsername.style.display = '';
        return;
    }
    emptyUsername.style.display = "none";
    roomId = index;
    // if the room number is valid
    username.remove();
    roomNumber.innerHTML = "Room Number " + (index + 1);
    uid.remove();
    roomheader.remove();
    roomlist.remove();

    // emit the 'joined' event which we have set up a listener for on the server
    client_socket.emit('joined', roomId);

}

// if the room is full (players > 2), redirect the user
// to the fullroom.html page we made
client_socket.on('full', function (msg) {
    if (roomId == msg)
        window.open("fullroom.html", "_self");
});

// change play to true when both players have
// joined the room, so that they can start playing
// (when play is true the players can play)
client_socket.on('play', function (msg) {
    if (msg == roomId) {
        play = true;
        game_status.innerHTML = "Game in progress"
        //send your name to enemy
        client_socket.emit('enemy', roomId, playerName);
    }
});

//get enemy name
client_socket.on('enemy', function (msg1, msg2) {
    if (msg1 == roomId) {
        var en = document.getElementById("enemy");
        if (playerColor === "black")
            en.innerHTML = "Against " + msg2 + " <=> white";
        else
            en.innerHTML = "Against " + msg2 + " <=> black";
    }
});

// when a move happens, check if it was meant for the clients room
// if yes, then make the move on the clients board
client_socket.on('move', function (msg) {
    if (msg.room === roomId) {
        game.move(msg.move);
        board.position(game.fen());
    }
});

// if you recieved 'gameOver' event then you lost
client_socket.on('gameOver', function (msg) {
    console.log(1111111111111111111111111111);
    if (msg === roomId) {
        game_status.innerHTML = 'GAME OVER YOU LOST!';
        game_status.style.color = 'red';
    }
});

// if you recieved 'playerDisconnected' event then your enemy is out
client_socket.on('playerDisconnected', function (msg) {
    if (msg == roomId) {
        window.open("playerdisconnect.html", "_self");
    }
});

// return highlighted squares to normal color
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

//we add a few more conditions to check if the move is valid or not
var on_Drag_Start = function (source, piece) {
    // do not pick up pieces if the game is over
    // or if it's not that side's turn
    if (game.game_over() === true || !play || // check if both players have joined
        // if the player is white, he cannot move black pieces and also for black
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() === 'w' && playerColor === 'black') ||
        (game.turn() === 'b' && playerColor === 'white')) {
        return false;
    }
};

//when the pieces are actually moved. So when the player makes a move and drops a move, the ‘move’ event is emitted
var on_Drop = function (source, target) {
    remoeve_highlightedSquares();

    // see if the move is legal
    var move = game.move({
        from: source,
        to: target
    });
    if (game.game_over()) {
        game_status.innerHTML = 'GAME OVER YOU WON!';
        game_status.style.color = 'green';
        client_socket.emit('gameOver', roomId)
    }

    // illegal move so return to the square
    if (move === null) return 'returnToSrc';
    // if the move is allowed, emit the move event
    else
        client_socket.emit('move', { move: move, board: game.fen(), room: roomId });

};

// when mouse is over a piece get her possible moves and highlight it
var on_Mouse_Over_Square = function (square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
        square: square
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    // highlight the square they moused over
    highlight_Squares(square);

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
        highlight_Squares(moves[i].to);
    }
};

// when mouse is not on any piece remove all highlighted squares if there is any
var on_Mouse_Out_Square = function (square, piece) {
    remoeve_highlightedSquares();
};

// when drop ends redraw the board
var on_Drop_End = function () {
    board.position(game.fen());
};

// when player is allowed to join the room, get the room ready and draw the board
client_socket.on('player', (msg) => {
    var pl = document.getElementById("player")
    online_players.style.display = "none";
    // we're passing an object -
    // { playerId, players, color, roomId } as msg
    playerColor = msg.playerColor;

    // show the players number and color in the player div
    pl.innerHTML = "You " + playerName + " <=> " + playerColor;
    players = msg.players;
    // emit the play event when 2 players have joined
    if (players == 2) {
        play = true;
        // relay it to the other player that is in the room
        client_socket.emit('play', msg.roomId);

        //send your name to enemy
        client_socket.emit('enemy', msg.roomId, playerName);
        // change the status from 'join room' to -
        game_status.innerHTML = "Game in progress"
    }
    // if only one person is in the room
    else
        game_status.innerHTML = "Waiting for Second player";


    // init the chess frontend
    var config_functions = {
        orientation: playerColor,
        on_Drag_Start: on_Drag_Start,
        on_Drop: on_Drop,
        on_Mouse_Out_Square: on_Mouse_Out_Square,
        on_Mouse_Over_Square: on_Mouse_Over_Square,
        on_Drop_End: on_Drop_End
    };
    board = ChessFrontEnd('board', config_functions);
});