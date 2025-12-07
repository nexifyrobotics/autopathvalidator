import React from 'react';
import { Sparkles, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { generateOptimizationSuggestions } from '../utils/pathOptimizer';

export function OptimizationPanel({ trajectoryData, violations, constraints, onClose }) {
    if (!trajectoryData || trajectoryData.length === 0) {
        return null;
    }

    const suggestions = generateOptimizationSuggestions(trajectoryData, violations, constraints);

    if (suggestions.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-2xl w-full mx-4">
                    <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <h3 className="text-white font-semibold text-lg">Optimization Suggestions</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <p className="text-white text-lg mb-2">Great job!</p>
                        <p className="text-gray-400">Your path is already well optimized. No major improvements needed.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-semibold text-lg">Optimization Suggestions</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                                suggestion.priority === 'high'
                                    ? 'border-red-500 bg-red-900/20'
                                    : 'border-yellow-500 bg-yellow-900/20'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                                    suggestion.priority === 'high' ? 'text-red-400' : 'text-yellow-400'
                                }`} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-white font-semibold">{suggestion.title}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            suggestion.priority === 'high'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {suggestion.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                                    <div className="flex items-start gap-2 p-2 bg-neutral-900/50 rounded">
                                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-blue-300 text-xs">{suggestion.action}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

