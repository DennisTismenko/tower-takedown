import React, { useEffect, useRef, useContext } from 'react';
import Button from '../../components/Button/Button';
import AuthContext from '../../context/AuthContext';
import './CreateRoom.css';

const CreateRoom = props => {
    const handleCreateRoom = props.handleCreateRoom;
    const cancelCreateRoom = props.cancelCreateRoom;
    const formRef = useRef();
    const roomNameRef = useRef();

    useEffect(() => {
        formRef.current.addEventListener('submit', e => e.preventDefault());
        roomNameRef.current.focus();
    }, []);
    return (
        <div className="CreateRoom container">
            <div className="CreateRoom prompt">
                <div className="CreateRoom title">Create Room</div>
            </div>
            <form ref={formRef} className="CreateRoom form">
                <div className="CreateRoom form main">
                    <input ref={roomNameRef} className="CreateRoom form input" type="text" placeholder="Room name..." required />
                    
                </div>
                <div className="CreateRoom form button-bar">
                    <Button clickAction={cancelCreateRoom} text="Cancel" />
                    <Button clickAction={() => {
                        handleCreateRoom(roomNameRef.current.value);
                        }} text="Create" submit />
                </div>
            </form>
        </div>
    );
}

export default CreateRoom;