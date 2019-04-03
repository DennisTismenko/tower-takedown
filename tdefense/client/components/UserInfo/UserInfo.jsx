import React, {useContext, useState, useRef} from 'react';
import AuthContext from '../../context/AuthContext';
import Auth from '../../services/authentication';
import { BrowserRouter as Router, withRouter} from "react-router-dom";
import './UserInfo.css';

const UserInfo = props => {
    const [state, setState] = useState({toggled: false}); 
    const authContext = useContext(AuthContext);
    const handleSignOut = () => {
        Auth.logout()
            .then(() => {
                authContext.socket.emit('manualDisconnect');
                redirectHome();
            } )
            .catch(() => {
                authContext.socket.disconnect();
                redirectHome();
            });
    }
    const redirectHome = () => {
        Auth.verifyAuth()
            .then(res => {
                authContext.setAuthenticated(res.authenticated);
                props.history.replace("/");
            })
            .catch(() => {
                authContext.setAuthenticated(false);
                props.history.replace("/");
            });
        
    }

    const handleSettings = () => {
        props.history.replace("/account");
    }

    const handleHelp = () => {
        props.history.replace("/help");
    }

    const handleToggleExit = e => {
        if (!e.target.matches(".UserInfo")) {
            setState({toggled: false});
            window.removeEventListener('click', handleToggleExit);
        }
    }

    const handleToggle = () => {
        setState({toggled: true});
        window.addEventListener('click', handleToggleExit);
    }

    return (
        <div className="UserInfo wrapper">
            <div onClick={handleToggle} className={`UserInfo container${state.toggled ? " selected" : ""}`}>
                <div className="UserInfo profile-image"></div>
                <div className="UserInfo identifier-container">
                    <div className="UserInfo inGameName">{authContext.inGameName}</div>
                    <div className="UserInfo email">{authContext.email}</div>
                </div>
                <div className="UserInfo arrow-down"></div>
            </div>
            <div className={`UserInfo dropdown-container${state.toggled ? " show" : ""}`}>
                <div onClick={handleSettings}>Settings</div>
                <div onClick={handleHelp}>Help</div>
                <div onClick={handleSignOut}>Sign out</div>
            </div>
        </div>
    );
};

export default withRouter(UserInfo);