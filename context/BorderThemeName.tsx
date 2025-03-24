// In ThemeContext, store a separate borderTheme:
const BORDER_COLORS = {
    pink: '#ff69b4',
    aqua: '#00ffff',
    default: '#444',
  };
  
  interface ThemeContextProps {
    themeName: string;
    setThemeName: (n: string) => void;
    borderTheme: string;
    setBorderTheme: (b: string) => void;
    ...
  }
  
  ...
  
  export const ThemeProvider: React.FC = ({ children }) => {
    const [themeName, setThemeName] = useState('default');
    const [borderTheme, setBorderTheme] = useState('default');
  
    const theme = useMemo(() => {
      const base = THEME_DEFINITIONS[themeName];
      return {
        ...base,
        borderColor: BORDER_COLORS[borderTheme],
      };
    }, [themeName, borderTheme]);
  
    return (
      <ThemeContext.Provider value={{ themeName, setThemeName, borderTheme, setBorderTheme, theme }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  