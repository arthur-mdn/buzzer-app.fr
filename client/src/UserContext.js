// UserContext.js

import React, { createContext, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children, userId }) => {
    return (
        <UserContext.Provider value={userId}>
            {children}
        </UserContext.Provider>
    );
};
