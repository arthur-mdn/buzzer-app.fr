// UserContext.js

import React, { createContext, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children, userId, userName, userRole, userPictureSmiley, userPictureColor}) => {
    const value = {userId, userRole, userName, userPictureSmiley,userPictureColor }
    return (
        <UserContext.Provider value={value} >
            {children}
        </UserContext.Provider>
    );
};
