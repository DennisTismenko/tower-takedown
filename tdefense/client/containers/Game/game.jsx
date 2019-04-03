import React, { Component } from 'react';
import Button from '../../components/Button/Button';
import GameMain from '../../game/game';
import './game.css';
import AuthContext from '../../context/AuthContext';
import Peer from 'peerjs';
import Spinner from '../../components/Spinner/Spinner';
import Credentials from './credentials';

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            gameInstance: null,
            peer: null,
            connection: null,
            weapons: [],
            map: null,
            level: null,
            host: null,
            gotMapInfo: false,
            gotWeaponInfo: false,
            peer: null
        };
    }

    componentDidMount() {
        if (!this.props.location.state) {
            return this.props.history.replace('/');
        }
        this.context.setContainer('game');
        if (!this.context.socket.connected) {
            this.context.socket.open();
        }
        this.initSocket();
        fetch("https://global.xirsys.net/_turn/towertakedown", {
            method: "PUT",
            headers: new Headers({
                "Authorization": "Basic " + btoa(Credentials.XIRSYS),
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({ "format": "urls" })
        })
            .then(res => {
                return res.json();
            })
            .then(servers => {
                const iceServers = servers.v.iceServers;
                this.initRTC(iceServers);
            });

    }

    componentDidUpdate() {
        if (!this.state.loaded && this.state.connection && this.state.gotMapInfo && this.state.gotWeaponInfo && this.state.gameInstance === null) {
            this.setState({ loaded: true });
            this.launchGame();
        }
    }

    launchGame() {
        const gameInstance = GameMain.run(this.state.connection, this.state.map, this.state.weapons, this.state.level, this.state.host);
        this.setState({ gameInstance });
    }

    getData(host) {
        const room = this.props.location.state.room;
        this.setState({ host: host });
        // Get the map
        this.context.socket.emit('retrieveStatInfo', room.gameAdmin, data => {
            let map = data.map;
            let level = data.lv;
            this.setState({ map, level, gotMapInfo: true});
        });
        // Get the players weapons
        let retrieveCount = 0;
        for (let i = 0; i < room.players.length; i++) {
            this.context.socket.emit('retrieveStatInfo', room.players[i], data => {
                let weapon = data.weapon;
                let weapons = this.state.weapons;
                weapons.push(weapon);
                this.setState({ weapons });
                retrieveCount++;
                if (retrieveCount >= room.players.length) {
                    this.setState({ gotWeaponInfo: true });
                }
            });
        }
    }

    storeResults(results) {
        const room = this.props.location.state.room;
        let adminResults = results[0];
        let playerResults = results[1];
        this.context.socket.emit('setGold', room.gameAdmin, adminResults[0]);
        this.context.socket.emit('setExp', room.gameAdmin, adminResults[1]);
        // Store results for all players
        for (let i = 0; i < room.players.length; i++) {
            let id = room.players[i];
            this.context.socket.emit('setGold', id, playerResults[0]);
            this.context.socket.emit('setExp', id, playerResults[1]);
        }
    }

    initSocket() {
        this.context.socket.on('endGame', () => {
            this.props.history.replace("/lobby");
        });
    }

    initRTC(iceServers) {
        const room = this.props.location.state.room;
        const peer = new Peer(this.context.inGameName, { host: 'server.towertakedowngame.com', secure: true, path: '/p2p', config: iceServers }); // PROD
        // const peer = new Peer(this.context.inGameName, {host: 'localhost', port: 9000, path: '/p2p'}); // DEV
        if (this.context.inGameName === room.players[0]) {
            // HOST
            peer.on('open', id => {
                // console.log(`Sending HOST establishment signal: ${id}`);
                this.context.socket.emit('establishHost', room.name);
            });
            peer.on('connection', connection => {
                this.setState({ peer, connection });
                connection.on('data', data => {
                    connection.send(this.context.inGameName);
                });
            });
            this.getData(true);
        } else {
            // NON-HOST
            const connectToHost = () => {
                const connection = peer.connect(room.players[0]);
                // console.log(`Connection: ${connection}`);
                connection.on('open', () => {
                    this.setState({ peer, connection });
                    connection.send(this.context.inGameName);
                });
                connection.on('data', data => {
                    if (data[0] == 'results') {
                        this.storeResults(data[1]);
                    }
                });
                this.getData(false);
            }

            this.context.socket.emit('getHostState', room.name, ready => {
                // console.log(`Retrieving HOST READY state: ${ready}`)
                if (ready) {
                    connectToHost();
                } else {
                    this.context.socket.on('hostEstablished', () => {
                        // console.log('Connection to HOST established.');
                        connectToHost();
                    })
                }
            });
        }
    }

    handleEndGame() {
        this.context.socket.emit('requestEndGame', this.props.location.state.room);
        this.props.history.replace("/lobby");
    }

    componentWillUnmount() {
        if (this.state.gameInstance) {
            this.state.gameInstance.destroy();
        }
        if (this.state.peer) {
            // If ever implementing reconnection in the future, this needs to be changed to peer.disconnect();
            this.state.peer.destroy();
        }
        this.unmountSocket();
    }

    unmountSocket() {
        this.context.socket.removeAllListeners();
    }

    render() {
        return (
            <div className="Game container">
                <div id="content" className="Game content"></div>
                {!this.state.loaded && <Spinner />}
                <Button text="Return to Lobby" clickAction={this.handleEndGame.bind(this)} />
            </div>
        );
    }
}
Game.contextType = AuthContext;
export default Game;
