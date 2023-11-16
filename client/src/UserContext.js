// UserContext.js

import React, { createContext, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children, userId, userRole }) => {
    const value = {userId, userRole}
    return (
        <UserContext.Provider value={value} >
            {children}
        </UserContext.Provider>
    );
};
