const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socket = require('socket.io');
const Room = require('./room/room');
const mongoose = require('mongoose');
const cors = require('cors');
const validator = require('validator');

// CREDENTIALS - SET UP LOCALLY
// MONGO_USERNAME
// MONGO_PASSWORD
// SESSION_SECRET
const credentials = require('./credentials');

mongoose.set('useFindAndModify', false); // Fix deprecation warning
const MongoStore = require('connect-mongo')(session);
// MongoDB setup
const MONGO_URL = `mongodb+srv://${credentials.MONGO_USERNAME}:${credentials.MONGO_PASSWORD}@cluster0-nuoao.mongodb.net/tdefense?retryWrites=true`; // Production
// const MONGO_URL = 'mongodb://localhost:27017'; // Local
const DB_NAME = 'tdefense';
mongoose.connect(`${MONGO_URL}/${DB_NAME}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
});

// Express setup
const app = express();
app.set('trust proxy', 1);
app.use(bodyParser.json());
// Socket.io setup
const PORT = 8081;
const server = http.createServer(app);
const io = socket(server);

// PeerJS
const ExpressPeerServer = require('peer').ExpressPeerServer;
const peerApp = express();
const peerServer = http.createServer(peerApp);
const peerSetup = ExpressPeerServer(peerServer, {debug: true});
const PEER_PORT = 9000;


// CORS
const corsOptions = {
    // origin: ['https://towertakedowngame.com', 'http://towertakedowngame.com', 'http://localhost:3000'], // Remove localhost for PROD
    origin: ['https://towertakedowngame.com', 'http://towertakedowngame.com'], 
    credentials: true
}
app.use(cors(corsOptions));
peerApp.use(cors(corsOptions));

const sessionMiddleware = session({
    secret: credentials.SESSION_SECRET,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        sameSite: true, // Enable for PROD
        secure: true
    },
    proxy: true
});

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

app.use(sessionMiddleware);

app.use((req, res, next) => {
    console.log(`BACKEND ${req.method} ${req.url} ${JSON.stringify(req.body)}`);
    next();
});
peerApp.use((req, res, next) => {
    console.log(`P2P ${req.method} ${req.url} ${JSON.stringify(req.body)}`);
    next();
});
peerApp.use('/p2p', peerSetup);

// Routers
const userRouter = require('./routers/user-router');

app.use('/users', userRouter);

const User = require('./model/user');
const Stat = require('./model/stat');
let rooms = new Map();
let players = new Map();
let rtcHostPool = new Set();

io.on('connection', socket => {
    socket.emit('lobby', [...rooms.values()]);
    socket.on('getLobby', () => {
        socket.emit('lobby', [...rooms.values()]);
    });

    socket.on('getRoomState', callback => {
        const inGameName = socket.request.session.user.inGameName;
        if (players.has(inGameName)) {
            const room = players.get(inGameName);
            callback({joinedRoom: room, inGame: room.isGameActive});
        } else {
            callback();
        }
    });

    socket.on('retrieveUserInfo', callback => {
        let ign;
        let email;
        if (socket.request.session.user) {
            ign = socket.request.session.user.inGameName;
            email = socket.request.session.user.email;
        }
        callback(ign, email);
    });

    socket.on('verifySubmitIgn', (inGameName, callback) => {
        inGameName = validator.escape(validator.trim(inGameName));
        User.findOne({ inGameName: { $regex: `^${inGameName}$`, $options: 'i' }})
            .then(user => {
                if (!user) {
                    Stat.findOneAndUpdate({email: socket.request.session.user.email}, {$set: {ign: inGameName}}, { runValidators: true, new: true }, (err, doc) => {
                        if (err) console.log(err);
                    });
                    return User.findOneAndUpdate({ _id: socket.request.session.user._id }, { inGameName }, { runValidators: true, new: true });
                } else {
                    callback(false);
                }
            })
            .then(user => {
                if (user) {
                    sessionMiddleware(socket.handshake, {}, err => {
                        if (!err) {
                            const session = socket.handshake.session;
                            session.user.inGameName = user.inGameName;
                            session.save();
                            session.reload(err => {
                                if (!err) {
                                    socket.request.session.user.inGameName = user.inGameName;
                                    callback(true);
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
            })
            .catch(err => {
                console.log(err);
                callback(false);
            });
    });

    socket.on('createRoom', (roomName, callback) => {
        if (!rooms.has(roomName) && !validator.isEmpty(roomName)) {
            roomName = validator.escape(roomName);
            const gameAdmin = socket.request.session.user.inGameName;
            const room = new Room(roomName, gameAdmin, parseInt(2));
            rooms.set(roomName, room);
            io.emit('lobby', [...rooms.values()]);
            callback(room);
        } else {
            callback();
        }
    });

    socket.on('joinRoom', (roomName, player, callback) => {
        if (rooms.has(roomName) && !players.has(player)) {
            // Join socket.io room
            socket.join(roomName);
            // Join local room object
            let room = rooms.get(roomName);
            room.addPlayer(player);
            // Set player to join room
            players.set(player, room);
            callback(room);
            socket.to(roomName).emit('message', `${player} has joined your room!`);
            if (room.size() === room.maxCapacity) {
                room.isGameActive = true;
                io.in(roomName).emit('startGame', room);
            }
            // Broadcast updates
            io.emit('lobby', [...rooms.values()]);
        }
    });

    const deleteRoom = (room, socket) => {
        room.players.forEach(player => players.delete(player));
        rooms.delete(room.name);
        rtcHostPool.delete(room.name);
        socket.to(room.name).emit('endGame');
        io.in(room.name).clients((err, clients) => {
            if (err) {
                return console.log(err);
            }
            clients.forEach(id => io.sockets.connected[id].leave(room.name));
        });
        io.emit('lobby', [...rooms.values()]);
    };

    socket.on('deleteRoom', roomName => {
        if (rooms.has(roomName) && socket.request.session.user.inGameName === rooms.get(roomName).gameAdmin) {
            const room = rooms.get(roomName);
            deleteRoom(room, socket);
        }
    });

    socket.on('requestEndGame', room => {
        if (rooms.has(room.name)) {
            const localRoom = rooms.get(room.name);
            deleteRoom(localRoom, socket);
        }
    });

    socket.on('retrieveStatInfo', (ign, callback) => {
        Stat.findOne({ ign })
            .then(stat => {
                data = {
                    lv: stat.lv,
                    gold: stat.gold,
                    exp: stat.exp,
                    weapon: stat.weapon,
                    map: stat.map,
                    lockMap: stat.lockMap,
                    lockWeapon: stat.lockWeapon
                };
                callback(data);
            })
            .catch(err => {
                console.log(err);
            });
    });

    socket.on('setNewMap', (ign, type) => {
        Stat.findOneAndUpdate({ign}, {$set: {map: type}}, { runValidators: true, new: true }, (err, doc) => {
            if (err) console.log(err);
        });
    });

    socket.on('unlockNewMap', (ign, gold, lockMap) =>{
        Stat.findOneAndUpdate({ign}, {$set: {gold: gold, lockMap: lockMap}}, { runValidators: true, new: true }, (err, doc) => {
            if (err) console.log(err);
        });
    });

    socket.on('setNewWeapon', (ign, type) => {
        Stat.findOneAndUpdate({ign}, {$set: {weapon: type}}, { runValidators: true, new: true }, (err, doc) => {
            if (err) console.log(err);
        })
    });

    socket.on('setGold', (ign, amount) => {
      Stat.findOneAndUpdate({ign}, {$inc: {gold: amount}}, { runValidators: true, new: true }, (err, doc) => {
          if (err) console.log(err);
      });
    });

    socket.on('setExp', (ign, amount) => {
      Stat.findOne({ign})
        .then(stat => {
            let l = stat.lv;
            let max = l * 16;
            let e = stat.exp;
            e = e + amount;
            if (e >= max){
                e = e - max;
                l++;
            }
            Stat.FindOneAndUpdate({ign}, {$set: {lv: l, exp: e}}, { runValidators: true, new: true }, (err, doc) => {
                if (err) console.log(err);
            });
        })
        .catch(err => {
            console.log(err);
        });
    });

    socket.on('unlockNewWeapon', (ign, gold, lockWeapon) =>{
        Stat.findOneAndUpdate({ign}, {$set: {gold: gold, lockWeapon: lockWeapon}}, { runValidators: true, new: true }, (err, doc) => {
            if (err) console.log(err);
        });
    });

    socket.on('establishHost', roomName => {
        rtcHostPool.add(roomName);
        socket.to(roomName).emit('hostEstablished');
    });

    socket.on('getHostState', (roomName, callback) => {
        callback(rtcHostPool.has(roomName));
    });

    socket.on('manualDisconnect', () => {
        socket.disconnect();
    });
});

// PeerJS
peerServer.on('connection', id => {
    console.log(`New peer connection: ${id}`);
});

peerServer.on('disconnect', id => {
    console.log(`Peer disconnected: ${id}`);
});

// Server init
server.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('HTTP server on http://localhost:%s', PORT);
    }
});

peerServer.listen(PEER_PORT, err => {
    if (err) {
        console.log(err);
    } else {
        console.log('PeerJS server on http://localhost:%s', PEER_PORT);
    }
});
