import React, { Component } from 'react';
import Button from '../../components/Button/Button';
import RoomCard from '../../components/RoomCard/RoomCard';
import OverlayComponent from '../../components/OverlayComponent/OverlayComponent';
import CreateGameName from '../../components/CreateGameName/CreateGameName';
import CreateRoom from '../../components/CreateRoom/CreateRoom';
import Auth from '../../services/authentication';
import './mainLobby.css';
import AuthContext from '../../context/AuthContext';
import { BrowserRouter as Router, Redirect } from "react-router-dom";
import Spinner from '../../components/Spinner/Spinner';

class MainLobby extends Component {
    constructor(props) {
        super(props);

        // With Backend
        this.state = {
            loaded: false,
            creatingRoom: false,
            rooms: [],
            selectedRoom: null,
            joinedRoom: null,
            inGame: false
        }; 
    }

    componentDidMount() {
        this.context.setContainer('lobby');
        Auth.verifyAuth()
            .then(res => {
                if (!res.authenticated) {
                    this.context.setAuthenticated(false);
                } else {
                    if (!this.context.socket.connected) {
                        this.context.socket.open();
                    }
                    this.initSocket();
                }
            })
            .catch(() => this.context.setAuthenticated(false));
    }

    componentWillUnmount() {
        this.unmountSocket();
    }

    initSocket() {
        this.context.socket.emit('retrieveUserInfo', (inGameName, email) => {
            this.context.setInGameName(inGameName);
            this.context.setEmail(email);
            this.context.socket.emit('getRoomState', state => {
                if (state) {
                    this.setState(state);
                }
                this.setState({ loaded: true });
            });
        });
        this.context.socket.on('lobby', rooms => {
            let selectedRoom = null;
            const updatedRooms = rooms.map(room => {
                if (this.state.selectedRoom && this.state.selectedRoom.name === room.name) {
                    room.selected = true;
                    selectedRoom = room;
                }
                return room;
            });
            this.setState({rooms: updatedRooms, selectedRoom});
        });
        this.context.socket.on('startGame', room => {
            console.log('Starting game!')
            this.handleStartGame(room);
        });
        this.context.socket.on('message', message => console.log(message));
        this.context.socket.emit('getLobby');
    }

    unmountSocket() {
        this.context.socket.removeAllListeners();
    }

    handleCreateRoomInit() {
        this.setState({creatingRoom: true});
    }

    handleCreateRoomCancel() {
        this.setState({creatingRoom: false});
    }

    handleCreateRoom(roomName) {
        this.context.socket.emit('createRoom', roomName, room => {
            if (room) {
                this.setState({creatingRoom: false});
            }
        });
    }

    handleJoinRoom() {
        this.context.socket.emit('joinRoom', this.state.selectedRoom.name, this.context.inGameName, room => {
            if (room) {
                this.setState({joinedRoom: room});
                console.log('Successfully joined room.');
            }
        });
    }

    handleStartGame(room) {
        this.setState({ joinedRoom: room, inGame: true});
    }

    handleDeleteRoom() {
        this.context.socket.emit('deleteRoom', this.state.selectedRoom.name);
    }

    handleSelectRoom(index) {
        if (this.state.selectedRoom) {
            this.state.selectedRoom.selected = false;
        }
        const rooms = [...this.state.rooms];
        const selectedRoom = !this.state.selectedRoom || rooms[index].name !== this.state.selectedRoom.name ? rooms[index] : null;
        if (selectedRoom) {
            selectedRoom.selected = true;
        }
        this.setState({selectedRoom, rooms});
    }

    isRoomOwner() {
        return this.state.selectedRoom && this.context.inGameName === this.state.selectedRoom.gameAdmin;
    }

    render() {
        return (
            <div className="MainLobby container">
                {!this.state.loaded && <Spinner />}
                {this.state.loaded && <React.Fragment>
                    {!this.context.inGameName && <OverlayComponent componentProps={{ setInGameName: this.context.setInGameName }} component={CreateGameName} />}
                    {this.state.creatingRoom && <OverlayComponent componentProps={{ handleCreateRoom: this.handleCreateRoom.bind(this), cancelCreateRoom: this.handleCreateRoomCancel.bind(this) }} component={CreateRoom} />}
                    <div className="MainLobby heading">
                        <h1>Games</h1>
                        <h2>Select a game to join or create a new game.</h2>
                    </div>
                    <div className="MainLobby game-selector">
                        {this.state.rooms.map((room, index) => {
                            return <RoomCard 
                                key={room.name}
                                gameName={room.name}
                                gameAdmin={room.gameAdmin}
                                currentCapacity={room.players.length}
                                maxCapacity={room.maxCapacity} 
                                selected={room.selected}
                                onClick={this.handleSelectRoom.bind(this, index)}
                                />;
                        })}
                    </div>
                    <div className="button-bar">
                        <Button clickAction={this.handleCreateRoomInit.bind(this)} text="Create Room" />
                        <Button 
                            className={this.isRoomOwner() ? "delete-button" : ""} 
                            clickAction={!this.isRoomOwner() ? this.handleJoinRoom.bind(this) : this.handleDeleteRoom.bind(this)}
                            text={!this.isRoomOwner() ? "Join": "Delete"} 
                            disabled={!this.state.selectedRoom} />
                    </div>
                    {this.state.inGame && <Redirect to={{pathname: "/game", state: {room: this.state.joinedRoom}}}/>}
                </React.Fragment>}
            </div>
        );
    }
}
MainLobby.contextType = AuthContext;
export default MainLobby;