import React from 'react';
import './Button.css';

export default props => {
    const inputType = props.submit ? "submit" : "button"; 
    return (
        <input 
            className={`button${props.className ? ` ${props.className}` : ''}`} 
            type={inputType} 
            value={props.text} 
            onClick={props.clickAction} 
            disabled={props.disabled} />
    );
}

