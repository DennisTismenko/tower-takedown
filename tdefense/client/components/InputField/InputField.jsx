import React from 'react';

export default React.forwardRef((props, ref) => {
    return (
        <input className="input-field" type="text" ref={ref} {...props}/>
    );
});

