import React, {useEffect, useRef, useContext} from 'react';
import Button from '../../components/Button/Button';
import AuthContext from '../../context/AuthContext';
import './CreateGameName.css';

const CreateGameName = props => {
    const setInGameName = props.setInGameName;
    const authContext = useContext(AuthContext);
    const formRef = useRef();
    const ignRef = useRef();

    const verifyAndSubmitIGN = () => {
        const ign = ignRef.current.value;
        authContext.socket.emit("verifySubmitIgn", ign, approved => {
            if (approved) {
                setInGameName(ign);
            } else {
                console.log("IGN is already in use, or does not satisfy appropriate criteria.");
            }
        });
    }

    useEffect(() => {
        formRef.current.addEventListener('submit', e => e.preventDefault());
        ignRef.current.focus();
    }, []);
    return (
        <div className="CreateGameName container">
            <div className="CreateGameName prompt">
                <div className="CreateGameName title">Hello there!</div>
                We've noticed that this is your first time logging in. Please create an <b>IGN</b> (in-game name) that will identify your character to other players:
            </div>
            <form ref={formRef} className="CreateGameName form">
                <input ref={ignRef} className="CreateGameName form input" type="text" placeholder="Name (maximum 16 characters)"/>
                <Button clickAction={verifyAndSubmitIGN} text="Submit" submit/>
            </form>
        </div>
    );
}

export default CreateGameName;