import React, { useState } from 'react';
import { Sparkles, X, AlertCircle, CheckCircle, Info, Zap, BarChart3 } from 'lucide-react';
import { generateOptimizationSuggestions } from '../utils/pathOptimizer';
import PathOptimizer from './PathOptimizer';

export function OptimizationPanel({ trajectoryData, violations, constraints, onClose, onOptimizedPath }) {
    const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' or 'optimizer'

    if (!trajectoryData || trajectoryData.length === 0) {
        return null;
    }

    const suggestions = generateOptimizationSuggestions(trajectoryData, violations, constraints);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-semibold text-lg">Path Optimization</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-neutral-700">
                    <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                            activeTab === 'suggestions'
                                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Suggestions
                    </button>
                    <button
                        onClick={() => setActiveTab('optimizer')}
                        className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                            activeTab === 'optimizer'
                                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Zap className="w-4 h-4" />
                        Auto Optimizer
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'suggestions' && (
                        <div className="p-4">
                            {suggestions.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                    <p className="text-white text-lg mb-2">Great job!</p>
                                    <p className="text-gray-400">Your path is already well optimized. No major improvements needed.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart3 className="w-5 h-5 text-blue-400" />
                                        <h4 className="text-white font-semibold">Optimization Suggestions ({suggestions.length})</h4>
                                    </div>
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
                            )}
                        </div>
                    )}

                    {activeTab === 'optimizer' && (
                        <div className="p-4">
                            <PathOptimizer
                                trajectory={trajectoryData}
                                constraints={constraints}
                                onOptimizedPath={(optimizedPath) => {
                                    if (onOptimizedPath) {
                                        onOptimizedPath(optimizedPath);
                                    }
                                    onClose(); // Close the modal after optimization
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
