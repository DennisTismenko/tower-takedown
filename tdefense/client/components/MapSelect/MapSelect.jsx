import React, { useEffect, useRef, useContext, useState } from 'react';
import Button from '../../components/Button/Button';
import Select from 'react-select';
import './MapSelect.css';

const MapSelect = props => {
    const lockMap = props.lockMap;
    const handleMapUnlock = props.handleMapUnlock;
    const handleMapSave = props.handleMapSave;
    const maptype = props.maptype;
    const [state, setState] = useState({type: maptype, toggle: false, lock: false, err: false}); 
    const options = [
        {value: 'grass', label: 'Grassland Church'}, 
        {value: 'ice', label: 'Ice Igloo'},
        {value: 'candy', label: 'Candyland House'},
        {value: 'castle', label: 'Castle Tower'}];

    let lock = lockMap;

    const handleSelect = e => {
        let newLock = lock.includes(e.value);
        setState({type: e.value, toggle: true, lock: newLock, err: false});
    }

    const checklock = () => {
        let newLock = lock.includes(state.type);
        setState({type: state.type, toggle: false, lock: newLock});
    }

    return (
        <div className="MapSelect container">
            <div className={`MapSelect img ${state.type}`}></div>
            <div className="MapSelect selection">
                <Select
                    className="map-select"
                    options={options}
                    defaultValue={state.type}
                    onChange={handleSelect}
                />
                <Button 
                    className={`${(state.toggle && !state.lock) ? 'show': 'hide'}`}
                    text="Save Change" 
                    clickAction={() => {
                        setState({err: false});
                        checklock();
                        if (state.lock == false) handleMapSave(state.type);}}
                />
                <Button 
                    className={`${state.lock ? 'lock' : 'unlock'}`} 
                    text="Unlock: 100 G" 
                    clickAction={() => {
                        setState({type: state.type, toggle: true, lock: false});
                        handleMapUnlock(state.type, (unlock) => {
                            // was unlocked
                            if (unlock) lock.splice(lock.indexOf(state.type), 1);
                            else setState({err: true});
                            console.log(unlock +" handle "+ lock);
                        });}}
                />
                <div className={`MapSelect errormsg ${state.err ? 'show' : 'hide'}`}>Not enough gold.</div>
            </div>
        </div>
    );
}

export default MapSelect;