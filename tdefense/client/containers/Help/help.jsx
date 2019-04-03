import React, { Component } from 'react';
import Button from '../../components/Button/Button';
import Auth from '../../services/authentication';
import './help.css';
import AuthContext from '../../context/AuthContext';

class Help extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }; 
    }

    componentDidMount() {
        this.context.setContainer('help');
        Auth.verifyAuth()
            .then(res => {
                if (!res.authenticated) {
                    this.context.setAuthenticated(false);
                } else {
                }
            })
            .catch(() => this.context.setAuthenticated(false));
    }


    componentWillUnmount() {
    }

    redirectTo(path) {
        this.props.history.replace(path);
    }

    render() {
        return (
            <div className="Help container">
                <div className="Help textcontainer">
                    <h1>Welcome to Tower Takedown</h1>
                    <div className="Help instruct">
                        <p>In Tower Takedown you will partner with other players to attack other player's towers.</p>
                        <p>Each player has their own tower, which can be customized in your account settings.</p>
                        <p>If your tower successfully defends itself from enemy attack, you will gain gold.</p>
                    </div>
                    <h1>GamePlay</h1>
                    <div className="Help gameinstruct">
                        <p>Use the arrow keys or the WASD keys to move.</p>
                        <p>Press 'SPACE' to attack enemies. You can change your weapon type in your account settings.</p>
                        <p>Press 'B' to block with your shield. This is only available when using a sword.</p>
                        <p>Press and hold 'H' to pick up a bomb. Release 'H' to let go.</p>
                        <p>Towers can only be damaged with bombs.</p>
                    </div>
                </div>
                <Button
                    className="btn-return"
                    text="Return to Lobby"
                    clickAction={() => {
                        this.redirectTo('/lobby');
                    }}
                />
            </div>
        ); 
    }
}

Help.contextType = AuthContext;
export default Help;