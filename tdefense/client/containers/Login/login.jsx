import React, { Component } from 'react';
import InputField from '../../components/InputField/InputField';
import PasswordField from '../../components/PasswordField/PasswordField';
import Button from '../../components/Button/Button';
import Auth from '../../services/authentication';
import 'babel-polyfill';
import './login.css';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = this.getNewState();
        this.setAuthenticatedState = props.setAuthenticatedState;
        this.setContainer = props.setContainer;
        this.usernameRef = React.createRef();
        this.loginFormRef = React.createRef();
    }

    componentDidMount() {
        this.usernameRef.current.focus();
        this.loginFormRef.current.addEventListener('submit', e => e.preventDefault());
        this.setContainer('login');
    }

    getNewState() {
        return ({
            email: '',
            password: '',
            processingRequest: false,
            error: ''
        });
    }

    redirectTo(path) {
        this.props.history.replace(path);
    }

    async handleLogin() {
        this.setState({processingRequest: true});
        try {
            await Auth.login(this.state.email, this.state.password);
            this.setState({processingRequest: false});
            this.setAuthenticatedState(true);
            this.redirectTo("/lobby");
        } catch (e) {
            this.setState({processingRequest: false});
            this.setAuthenticatedState(false);
            this.setState({password: "", error: "Incorrect username or password."});
        }   
    }

    async handleRegistration() {
        this.setState({processingRequest: true});
        try {
            await Auth.register(this.state.email, this.state.password);
            this.setState({processingRequest: false});
            this.setAuthenticatedState(true);
            this.redirectTo("/lobby");
        } catch (e) {
            this.setState({processingRequest: false});
            this.setAuthenticatedState(false);
            this.setState({ email: "", password: "", error: "Email already registered." });
        }
        
        
    }

    render() {
        return (
            <div className="Login container">
                <div className="Login heading">
                    <h1>Tower Takedown</h1>
                    <h2>A WebRTC-based multiplayer tower defense game</h2>
                </div>
                <form className="Login form" ref={this.loginFormRef} onSubmit={this.handleLogin.bind(this)}>
                    {this.state.processingRequest && <React.Fragment><div className="Login processing"></div><Spinner/></React.Fragment> }
                    <h3>Sign-in or Register</h3>
                    <InputField ref={this.usernameRef} onChange={e => this.setState({ email: e.target.value })} placeholder="Email" value={this.state.email}/>
                    <PasswordField onChange={e => this.setState({ password: e.target.value })} value={this.state.password} />
                    <div className="button-bar">
                        <Button text="Register" clickAction={this.handleRegistration.bind(this)} />
                        <Button text="Sign-in" submit="true" />
                    </div>
                    {this.state.error && <Alert type="danger" text={this.state.error}/>}
                </form>
            </div>
        ); 
    }
}