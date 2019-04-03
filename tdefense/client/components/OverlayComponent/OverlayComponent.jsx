import React from 'react';
import './OverlayComponent.css';

const OverlayComponent = props => {
    const Component = props.component;
    // const dismissable = props.dismissByClick;
    return (
        <React.Fragment>
            {true && <div className="OverlayComponent">
                <Component {...props.componentProps} className="OverlayComponent component"/>
            </div>}
        </React.Fragment>
        
    );
}

export default OverlayComponent;