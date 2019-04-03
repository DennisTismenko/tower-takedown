import React, { useEffect, useRef, useContext, useState } from 'react';
import Button from '../../components/Button/Button';
import Select from 'react-select';
import './WeaponSelect.css';

const WeaponSelect = props => { 
    const lockWeapon = props.lockWeapon;
    const handleWeaponUnlock = props.handleWeaponUnlock;
    const handleWeaponSave = props.handleWeaponSave;
    const weapontype = props.weapontype;
    const [state, setState] = useState({type: weapontype, toggle: false, lock: false, err: false});
    const options = [{value: 'sword', label: 'Sword'}, {value: 'gun', label: 'Gun'}];
    let lock = lockWeapon;

    const handleSelect = e => {
        let newLock = lock.includes(e.value);
        setState({type: e.value, toggle: true, lock: newLock, err: false});
    }

    const checklock = () => {
        let newLock = lock.includes(state.type);
        setState({type: state.type, toggle: false, lock: newLock});
    }

    return (
        <div className="WeaponSelect container">
            <div className={`WeaponSelect img ${state.type}`}></div>
            <div className="WeaponSelect selection">
                <Select
                    className="weapon-select"
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
                        if (state.lock == false) handleWeaponSave(state.type);}}
                />
                <Button 
                    className={`${state.lock ? 'lock' : 'unlock'}`} 
                    text="Unlock: 200 G" 
                    clickAction={() => {
                        setState({type: state.type, toggle: true, lock: false});
                        handleWeaponUnlock(state.type, (unlock) => {
                            // was unlocked
                            if (unlock) lock.splice(lock.indexOf(state.type), 1);
                            else setState({err: true});
                        });}}
                />
                <div className={`WeaponSelect errormsg ${state.err ? 'show' : 'hide'}`}>Not enough gold.</div>
            </div>
        </div>
    );
}

export default WeaponSelect;