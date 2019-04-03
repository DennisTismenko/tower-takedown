import React from 'react';
import './RoomCard.css';

const RoomCard = props => {
    return (
    <div onClick={props.onClick} className={`RoomCard container${props.selected ? ' selected' : ''}`}>
        <div className="RoomCard game-name">{props.gameName}</div>
        <div className="RoomCard game-admin">Created by <b>{props.gameAdmin}</b></div>
        <div className="RoomCard capacity-container"><div className="RoomCard capacity-stats">{props.currentCapacity}/{props.maxCapacity}</div> Players</div>
    </div>
    );
};

export default RoomCard;