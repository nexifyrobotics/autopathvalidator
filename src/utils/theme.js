// Theme management

export function getInitialTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }

    return 'dark'; // Default
}

export function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
    } else {
        root.classList.remove('light');
        root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
}

export function toggleTheme() {
    const current = getInitialTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    // Save user's explicit choice to localStorage to prevent system sync
    localStorage.setItem('theme', newTheme);
    return newTheme;
}

