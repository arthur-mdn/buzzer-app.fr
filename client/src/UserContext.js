// TokenContext.js

import React, { createContext, useContext } from 'react';

const TokenContext = createContext();

export const useToken = () => {
    return useContext(TokenContext);
};

export const TokenProvider = ({ children, token }) => {
    return (
        <TokenContext.Provider value={token}>
            {children}
        </TokenContext.Provider>
    );
};
