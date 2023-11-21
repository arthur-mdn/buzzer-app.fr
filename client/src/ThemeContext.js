// ThemeContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [background, setBackground] = useState('default');

    const setThemeBackground = (newBackground) => {
        setBackground(newBackground);
        document.documentElement.style.setProperty('--background-url', `url(/backgrounds/${newBackground}.svg)`);
    };

    useEffect(() => {
        document.documentElement.style.setProperty('--background-url', `url(/backgrounds/${background}.svg)`);
    }, [background]);

    return (
        <ThemeContext.Provider value={{ background, setThemeBackground }}>
            {children}
        </ThemeContext.Provider>
    );
};