import React from 'react';
import './Alert.css';

const Alert = props => {
    return (
        <div className={`Alert container${props.type ? ` ${props.type}`: ""}`}>
            <div className="Alert message">
                {props.text}
            </div>
        </div>
    );
}

export default Alert;