import React, {useContext} from 'react';
import AuthContext from '../../context/AuthContext';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

const AuthRoute = props => {
    const authContext = useContext(AuthContext);
    const { component: Component, ...otherProps } = props;
    return (
        <Route render={innerProps => {
            return authContext.authenticated ? <Component {...innerProps} /> : <Redirect to="/" /> // PROD
            // return true || authContext.authenticated ? <Component {...innerProps} /> : <Redirect to="/" /> // DEV
        }} {...otherProps} />
    );
}
export default AuthRoute;
  