// UserContext.jsx

import React, { createContext, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children, userId, userName, userRole, userPictureSmiley, userPictureColor, userTheme}) => {
    const value = {userId, userRole, userName, userPictureSmiley,userPictureColor, userTheme }
    return (
        <UserContext.Provider value={value} >
            {children}
        </UserContext.Provider>
    );
};
