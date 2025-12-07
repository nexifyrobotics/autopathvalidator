import React, { useState, useEffect } from 'react';
import { History, Star, Trash2, X, Clock } from 'lucide-react';
import { getHistory, clearHistory, removeFromHistory, toggleFavorite, isFavorite } from '../utils/history';

export function HistoryPanel({ onLoadHistory, onClose }) {
    const [history, setHistory] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        const h = getHistory();
        setHistory(h);
    };

    const handleLoad = (entry) => {
        onLoadHistory(entry);
        onClose();
    };

    const handleRemove = (id) => {
        removeFromHistory(id);
        loadHistory();
    };

    const handleToggleFavorite = (id) => {
        toggleFavorite(id);
        loadHistory();
    };

    const handleClearAll = () => {
        if (window.confirm('Clear all history?')) {
            clearHistory();
            loadHistory();
        }
    };

    const filteredHistory = showFavoritesOnly 
        ? history.filter(h => isFavorite(h.id))
        : history;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-semibold text-lg">Analysis History</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input
                                type="checkbox"
                                checked={showFavoritesOnly}
                                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                                className="rounded"
                            />
                            Favorites only
                        </label>
                        <button
                            onClick={handleClearAll}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredHistory.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="bg-neutral-900 p-4 rounded-lg border border-neutral-700 hover:border-blue-500 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-white font-medium">{entry.fileName}</h4>
                                                {isFavorite(entry.id) && (
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </div>
                                                <div>
                                                    Time: {entry.summary.totalTime.toFixed(2)}s
                                                </div>
                                                <div className={entry.summary.errorCount > 0 ? 'text-red-400' : 'text-green-400'}>
                                                    Errors: {entry.summary.errorCount}
                                                </div>
                                                <div className={entry.summary.warningCount > 0 ? 'text-yellow-400' : ''}>
                                                    Warnings: {entry.summary.warningCount}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleLoad(entry)}
                                                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                                                >
                                                    Load
                                                </button>
                                                <button
                                                    onClick={() => handleToggleFavorite(entry.id)}
                                                    className={`px-3 py-1 text-sm rounded ${
                                                        isFavorite(entry.id)
                                                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                            : 'bg-neutral-700 hover:bg-neutral-600 text-gray-300'
                                                    }`}
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(entry.id)}
                                                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

