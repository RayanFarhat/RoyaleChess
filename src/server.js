// implement the requires libraries
const express = require('express');
const http = require('http');
const server_socket = require('socket.io');


// variable to edit the playing database
var PlayingVAR = 0;

// use 8000 as the default port number
const port = process.env.PORT || 8000

// call express constructor
var app = express();

// start the server
const server = http.createServer(app)

// initialize a new instance of socket.io by passing the HTTP server object
const io = server_socket(server)

// keep track of how many players in a game (0, 1, 2)
var players;

// call the middleware functions to listen to on requests
app.use(express.static(__dirname + "/"));

// create an array of 100 rooms and initialize them
var rooms = Array(100);
for (let i = 0; i < 100; i++) {
    rooms[i] = { players: 0, pid: [0, 0], status: "wait" };
}


// show main.html when “/” is accessed
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/main.html');
});



// when connection started
io.on('connection', function (server_socket) {

    //send the rooms
    let tmprooms = Array(100);
    for (let i = 0; i < 100; i++) {
        tmprooms[i] = rooms[i].players;
    }
    server_socket.emit('rooms', tmprooms);

    //send the number of online players
    server_socket.emit('players', PlayingVAR);

    // black or white
    var playerColor;

    // just assign a random number to every player that has connected
    // the numbers have no significance so it
    // doesn't matter if 2 people get the same number
    var playerId = Math.floor((Math.random() * 100) + 1)

    // when player try to join a room
    server_socket.on('joined', function (roomId) {

        // if the room is not full then add the player to that room
        if (rooms[roomId].players < 2 && rooms[roomId].status == 'wait') {
            rooms[roomId].players++;
            rooms[roomId].pid[rooms[roomId].players - 1] = playerId;

            PlayingVAR++;
        }
        //if room full take player to full alert page
        else {
            server_socket.emit('full', roomId)
            return;
        }

        // if a user connect to the room print their on server
        console.log('Player' + playerId + ' connected to ' + 'room ' + roomId);

        // if joined then get players number
        players = rooms[roomId].players;

        //change room status
        if (rooms[roomId].players == 2) {
            console.log('room' + roomId + ' started!');
            rooms[roomId].status = 'started';
        }
        // the first player to join the room gets white
        if (players % 2 == 0) playerColor = 'black';
        else playerColor = 'white';

        //set up in the client side, and display the chess board
        server_socket.emit('player', { playerId, players, playerColor, roomId })
    });

    // The client side emits a 'move' event when a valid move has been made.
    server_socket.on('move', function (msg) {
        // pass on the move event to the other clients
        server_socket.broadcast.emit('move', msg);
    });

    // send names of players to each other
    server_socket.on('enemy', function (msg1, msg2) {
        server_socket.broadcast.emit('enemy', msg1, msg2);
    });

    // 'play' is emitted when both players have joined and the game can start
    server_socket.on('play', function (msg) {
        server_socket.broadcast.emit('play', msg);
    });

    // The client side emits a 'gameOver' event when a valid move has been made.
    server_socket.on('gameOver', function (msg) {
        //change room status
        rooms[msg].status = 'wait';

        // pass on the 'gameOver' event to the other clients
        server_socket.broadcast.emit('gameOver', msg);
    });

    // when the user disconnects from the server, remove him from the game room
    server_socket.on('disconnect', function () {

        for (let i = 0; i < 100; i++) {
            if (rooms[i].pid[0] == playerId || rooms[i].pid[1] == playerId) {
                rooms[i].players--;

                //update database
                if (PlayingVAR > 0) {
                    PlayingVAR--;
                }

                // pass on the player disconnected event to the other clients if game not finished
                if (rooms[i].status == 'started')
                    server_socket.broadcast.emit('playerDisconnected', i);

                // if a user disconnects just print their playerID
                console.log('Player' + playerId + ' disconnected  to ' + 'room ' + i);

                //if room is empty then reset it
                if (rooms[i].players == 0)
                    rooms[i].status = 'wait';
            }
        }
    });
});

// server start listen from port 8000
server.listen(port);
// print that server started
console.log('Server Connected');