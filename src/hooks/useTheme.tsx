import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'clean' | 'sunrise' | 'green-mountain' | 'blue-water' | 'night' | 'material-indigo' | 'material-pink' | 'material-teal';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('clean');

  useEffect(() => {
    // 从 localStorage 读取保存的主题
    const savedTheme = localStorage.getItem('komari-theme') as Theme;
    if (savedTheme && ['clean', 'sunrise', 'green-mountain', 'blue-water', 'night', 'material-indigo', 'material-pink', 'material-teal'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // 应用主题到 HTML 元素
    const root = document.documentElement;
    
    // 移除所有可能的主题属性
    root.removeAttribute('data-theme');
    root.classList.remove('dark');
    
    // 应用当前主题
    if (theme === 'clean') {
      // clean 主题不需要特殊属性，使用默认的 :root
    } else if (theme === 'night') {
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    // 保存主题到 localStorage
    localStorage.setItem('komari-theme', theme);
  }, [theme]);

  const contextValue = {
    theme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}