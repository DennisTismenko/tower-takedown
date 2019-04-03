import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Login from './containers/Login/login';
import Lobby from './containers/MainLobby/mainLobby';
import Game from './containers/Game/game';
import Account from './containers/Account/account';
import Help from './containers/Help/help';
import { BrowserRouter as Router, Route, Redirect, Switch, Link } from "react-router-dom";
import AuthRoute from './components/AuthRoute/AuthRoute';
import AuthContext from './context/AuthContext';
import Auth from './services/authentication';
import io from 'socket.io-client';
import './index.css';
import UserInfo from './components/UserInfo/UserInfo';
import Spinner from './components/Spinner/Spinner';
import Credits from './containers/Credits/credits';
const socket = io('https://server.towertakedowngame.com', {autoConnect: false});
// const socket = io('http://localhost:8081', {autoConnect: false});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
  }

  componentDidMount() {
    Auth.verifyAuth()
      .then(res => {
        if (!res.authenticated) {
          this.setState({ authenticated: false, loaded: true });
        } else {
          this.setState({authenticated: true});
          if (!socket.connected) {
              socket.open();
          }
          this.initSocket();
        }
      })
      .catch((e) => this.setState({ authenticated: false, loaded: true }));
  }

  initSocket() {
    socket.emit('retrieveUserInfo', (inGameName, email) => {
      this.setState({inGameName, email, loaded: true });
    });
  }

  getDefaultState() {
    return {
      container: 'login',
      authenticated: false,
      loaded: false,
      inGameName: null,
      email: null
    }
  }

  setInGameName(inGameName) {
    this.setState({inGameName});
  }

  setEmail(email) {
    this.setState({email});
  }

  setAuthenticatedState(authenticated) {
    this.setState({ authenticated });
  }

  setContainer(container) {
    this.setState({container});
  }

  render() {
    return (
      <div className="App">
        {!this.state.loaded && <Spinner />}
        {this.state.loaded && <Router>
          <AuthContext.Provider value={{
            authenticated: this.state.authenticated,
            setAuthenticated: this.setAuthenticatedState.bind(this),
            socket,
            setContainer: this.setContainer.bind(this),
            inGameName: this.state.inGameName,
            email: this.state.email,
            setInGameName: this.setInGameName.bind(this),
            setEmail: this.setEmail.bind(this)

          }}>
            {this.state.container !== 'login' && this.state.container !== 'game' && <UserInfo />}
            <Switch>
              <Route path="/" exact render={props => !this.state.authenticated ? <Login {...props} setContainer={this.setContainer.bind(this)} setAuthenticatedState={this.setAuthenticatedState.bind(this)} /> : <Redirect to="/lobby" />} />
              <AuthRoute exact path="/lobby" component={Lobby} />
              <AuthRoute path="/game" component={Game} />
              <AuthRoute path="/account" component={Account} />
              <AuthRoute path="/help" component={Help} />
              <Route path="/credits" component={Credits}/> 
              <Route render={() => <Redirect to="/" />} />
            </Switch>
            {this.state.container === 'login' && <div className="credits-link"><Link to="/credits">Credits</Link></div>}
          </AuthContext.Provider>
        </Router>}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
