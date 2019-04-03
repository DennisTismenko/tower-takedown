import React from 'react';

const AuthContext = React.createContext({
    authenticated: false,
    email: undefined,
    inGameName: undefined,
    setInGameName: () => {},
    setEmail: () => {},
    setAuthenticated: () => {},
    socket: undefined,
    setContainer: () => {}
});

export default AuthContext;