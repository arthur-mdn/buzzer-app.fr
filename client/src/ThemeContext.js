// ThemeContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, userBackground, setUserBackground }) => {

    const setThemeBackground = (newBackground) => {
        setUserBackground(newBackground);
        document.documentElement.style.setProperty('--background-url', `url(/backgrounds/${newBackground}.svg)`);
    };

    useEffect(() => {
        document.documentElement.style.setProperty('--background-url', `url(/backgrounds/${userBackground}.svg)`);
    }, [userBackground]);

    return (
        <ThemeContext.Provider value={{ userBackground, setThemeBackground }}>
            {children}
        </ThemeContext.Provider>
    );
};