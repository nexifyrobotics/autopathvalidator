// Keyboard shortcuts handler

export function setupKeyboardShortcuts(handlers) {
    const handleKeyDown = (e) => {
        // Ctrl/Cmd + O: Open file
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            handlers.onOpenFile?.();
        }
        
        // Ctrl/Cmd + S: Export
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handlers.onExport?.();
        }
        
        // Ctrl/Cmd + K: Toggle theme (if implemented)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            handlers.onToggleTheme?.();
        }
        
        // Tab navigation (when not in input)
        if (e.key === 'Tab' && !e.target.matches('input, textarea, select')) {
            // Let default behavior handle it
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            handlers.onEscape?.();
        }
        
        // Number keys for tabs
        if (e.key >= '1' && e.key <= '2' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            const tabIndex = parseInt(e.key) - 1;
            handlers.onSwitchTab?.(tabIndex);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}

