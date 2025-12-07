// Analysis history management

const HISTORY_KEY = 'pathAnalysisHistory';
const MAX_HISTORY = 20;

export function saveToHistory(analysisData) {
    try {
        const history = getHistory();
        const newEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            fileName: analysisData.fileName,
            trajectoryData: analysisData.trajectoryData,
            violations: analysisData.violations,
            constraints: analysisData.constraints,
            summary: {
                totalTime: analysisData.trajectoryData.length > 0 
                    ? (analysisData.trajectoryData[analysisData.trajectoryData.length - 1].time || 0) - (analysisData.trajectoryData[0].time || 0)
                    : 0,
                errorCount: analysisData.violations.filter(v => v.severity === 'error').length,
                warningCount: analysisData.violations.filter(v => v.severity === 'warning').length
            }
        };
        
        // Remove duplicates (same fileName)
        const filtered = history.filter(h => h.fileName !== newEntry.fileName);
        
        // Add to beginning
        filtered.unshift(newEntry);
        
        // Keep only last MAX_HISTORY entries
        const limited = filtered.slice(0, MAX_HISTORY);
        
        localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
        return true;
    } catch (error) {
        console.error('Error saving to history:', error);
        return false;
    }
}

export function getHistory() {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
}

export function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
}

export function removeFromHistory(id) {
    try {
        const history = getHistory();
        const filtered = history.filter(h => h.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error removing from history:', error);
        return false;
    }
}

export function getFavoritePaths() {
    try {
        const stored = localStorage.getItem('favoritePaths');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}

export function toggleFavorite(id) {
    try {
        const favorites = getFavoritePaths();
        const index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }
        localStorage.setItem('favoritePaths', JSON.stringify(favorites));
        return true;
    } catch (error) {
        return false;
    }
}

export function isFavorite(id) {
    const favorites = getFavoritePaths();
    return favorites.includes(id);
}

