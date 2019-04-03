import React, { Component } from 'react';
import Button from '../../components/Button/Button';
import Auth from '../../services/authentication';
import './account.css';
import AuthContext from '../../context/AuthContext';
import WeaponSelect from '../../components/WeaponSelect/WeaponSelect';
import MapSelect from '../../components/MapSelect/MapSelect';

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            weapon: 'sword',
            map: 'grass',
            lv: 0,
            gold: 0,
            exp: 0,
            lockMap: [],
            lockWeapon: []
        };
    }

    componentDidMount() {
        this.context.setContainer('account');
        Auth.verifyAuth()
            .then(res => {
                if (!res.authenticated) {
                    this.context.setAuthenticated(false);
                } else {
                    if (!this.context.socket.connected) {
                        this.context.socket.open();
                    }
                    this.initSocket();
                }
            })
            .catch(() => this.context.setAuthenticated(false));
    }


    componentWillUnmount() {
        this.unmountSocket();
    }

    redirectTo(path) {
        this.props.history.replace(path);
    }

    initSocket() {
        this.context.socket.emit('retrieveUserInfo', (inGameName, email) => {
            this.context.setInGameName(inGameName);
            this.context.setEmail(email);
        });

        this.context.socket.emit('retrieveStatInfo', this.context.inGameName, data => {
            this.setState({
                lv: data.lv,
                gold: data.gold,
                exp: data.exp,
                weapon: data.weapon,
                map: data.map,
                lockMap: data.lockMap,
                lockWeapon: data.lockWeapon
            });
        });
    }

    unmountSocket() {
        this.context.socket.removeAllListeners();
    }

    handleMapUnlock(type, callback){
        let g = this.state.gold
        if (g >= 100){
            // can unlock
            let lock = this.state.lockMap;
            lock.splice(lock.indexOf(type), 1);
            this.setState({lockMap: lock});
            this.context.socket.emit("unlockNewMap", this.context.inGameName, (g - 100), this.state.lockMap);
            this.setState({gold: (g - 100)});
            callback(true);
        }
        else callback(false);
        console.log(type +" unlock");
    }

    handleMapSave(type){
        this.setState({map: type});
        this.context.socket.emit('setNewMap', this.context.inGameName, type);
        console.log(type +" save");
    }

    handleWeaponUnlock(type){
        let g = this.state.gold
        if (g >= 200){
            // can unlock
            let lock = this.state.lockWeapon;
            lock.splice(lock.indexOf(type), 1);
            this.setState({lockWeapon: lock});
            this.context.socket.emit("unlockNewWeapon", this.context.inGameName, (g - 200), this.state.lockWeapon);
            this.setState({gold: (g - 200)});
            callback(true);
        }
        else callback(false);
        console.log(type +" unlock");
    }

    handleWeaponSave(type){
        this.setState({weapon: type});
        this.context.socket.emit('setNewWeapon', this.context.inGameName, type);
        console.log(type +" save");
    }

    render() {
        return (
            <div className="Account container">
                <div className="Account heading">
                    <h1>Account Page</h1>
                </div>
                <div className="Account user">
                    <div className="Account profile">
                        <div className="Account inGameName">{this.context.inGameName}</div>
                        <div className="Account email">{this.context.email}</div>
                    </div>
                    <div className="Account stats">
                        <div className="Account level">Lv: {this.state.lv}</div>
                        <div className="Account ex">Exp: {this.state.exp}</div>
                        <div className="Account gold">Gold: {this.state.gold}</div>
                    </div>
                </div>
                <div className="Account selection">
                    <div className="Account chara">
                        <WeaponSelect
                            weapontype={this.state.weapon}
                            lockWeapon={this.state.lockWeapon}
                            handleWeaponSave={this.handleWeaponSave.bind(this)}
                            handleWeaponUnlock={this.handleWeaponUnlock.bind(this)}
                        />
                    </div>
                    <div className="Account map">
                        <MapSelect
                            maptype={this.state.map}
                            lockMap={this.state.lockMap}
                            handleMapSave={this.handleMapSave.bind(this)}
                            handleMapUnlock={this.handleMapUnlock.bind(this)}
                        />
                    </div>
                </div>
                <Button
                    className="btn-return"
                    text="Return to Lobby"
                    clickAction={() => {
                        console.log("return");
                        this.redirectTo('/lobby');
                    }}
                />
            </div>
        );
    }
}

Account.contextType = AuthContext;
export default Account;
