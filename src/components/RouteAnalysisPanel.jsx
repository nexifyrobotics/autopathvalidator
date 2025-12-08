import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Lightbulb, X } from 'lucide-react';
import { analyzeRouteForProblems } from '../utils/routeAnalyzer';

export function RouteAnalysisPanel({ 
    trajectoryData, 
    constraints,
    onClose
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedIssue, setExpandedIssue] = useState(null);

    // Compute analysis instead of storing in state
    const analysis = React.useMemo(() => {
        if (!trajectoryData || trajectoryData.length === 0) {
            return null;
        }
        return analyzeRouteForProblems(trajectoryData, constraints);
    }, [trajectoryData, constraints]);

    if (!analysis) {
        return null;
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
            case 'error':
                return 'bg-red-500/20 border-red-500 text-red-400';
            case 'warning':
                return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
            case 'info':
            case 'none':
                return 'bg-green-500/20 border-green-500 text-green-400';
            default:
                return 'bg-gray-500/20 border-gray-500 text-gray-400';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
            case 'error':
                return <AlertTriangle className="w-5 h-5" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <CheckCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-neutral-700 border-b border-neutral-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Route Analysis Report</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-600 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Status Card */}
                    <div className={`border-l-4 rounded-lg p-4 mb-6 ${getSeverityColor(analysis.severity)}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {getSeverityIcon(analysis.severity)}
                            <h3 className="text-lg font-semibold">
                                {analysis.severity === 'none' && 'Route Analysis Complete - No Critical Issues Found'}
                                {analysis.severity === 'info' && 'Route Analysis Complete - Minor Issues Detected'}
                                {analysis.severity === 'warning' && 'Route Analysis Complete - Warnings Found'}
                                {analysis.severity === 'critical' && 'Route Analysis Complete - Critical Issues Found'}
                            </h3>
                        </div>
                        {analysis.severity !== 'none' && analysis.problemStartPoint && (
                            <p className="text-sm opacity-90">
                                First issue detected at waypoint {analysis.problemStartIndex + 1} 
                                ({analysis.problemStartPoint.time?.toFixed(2)}s)
                            </p>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-neutral-700 mb-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'overview'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('issues')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'issues'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            Issues ({analysis.issues.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('suggestions')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'suggestions'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            Suggestions ({analysis.suggestions.length})
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-neutral-700 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Total Waypoints</p>
                                    <p className="text-2xl font-bold text-white">{trajectoryData.length}</p>
                                </div>
                                <div className="bg-neutral-700 rounded-lg p-4">
                                    <p className="text-gray-400 text-sm mb-1">Issues Found</p>
                                    <p className="text-2xl font-bold text-white">{analysis.issues.length}</p>
                                </div>
                            </div>

                            <div className="bg-neutral-700 rounded-lg p-4">
                                <h4 className="font-semibold text-white mb-3">Analysis Summary</h4>
                                <div className="space-y-2 text-sm text-gray-300">
                                    {analysis.severity === 'none' ? (
                                        <p className="text-green-400">✓ Route is well-formed with no critical issues detected.</p>
                                    ) : (
                                        <>
                                            <p>
                                                <span className="text-yellow-400">⚠ </span>
                                                Problems detected starting at waypoint {analysis.problemStartIndex + 1}
                                            </p>
                                            <p>
                                                {analysis.issues.length} issue(s) require attention to ensure smooth robot operation.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {analysis.suggestions.length > 0 && (
                                <div className="bg-neutral-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-white mb-3">Quick Recommendations</h4>
                                    <ul className="space-y-2 text-sm text-gray-300">
                                        {analysis.suggestions.slice(0, 3).map((suggestion, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <span className="text-blue-400">•</span>
                                                <span>{suggestion.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Issues Tab */}
                    {activeTab === 'issues' && (
                        <div className="space-y-3">
                            {analysis.issues.length === 0 ? (
                                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center text-green-400">
                                    No issues found in the route
                                </div>
                            ) : (
                                analysis.issues.map((issue, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-neutral-700 rounded-lg p-4 cursor-pointer hover:bg-neutral-600 transition-colors"
                                        onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                issue.severity === 'error' 
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {issue.severity === 'error' ? (
                                                    <AlertTriangle className="w-4 h-4" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white">{issue.name}</h4>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {issue.type === 'velocity_violation' && `Current: ${issue.value.toFixed(2)} m/s, Limit: ${issue.limit.toFixed(2)} m/s`}
                                                    {issue.type === 'acceleration_violation' && `Current: ${issue.value.toFixed(2)} m/s², Limit: ${issue.limit.toFixed(2)} m/s²`}
                                                    {issue.type === 'jerk_violation' && `Current: ${issue.value.toFixed(2)} m/s³, Limit: ${issue.limit.toFixed(2)} m/s³`}
                                                    {issue.type === 'sharp_turn' && `Centripetal accel: ${issue.value.toFixed(2)} m/s²`}
                                                    {issue.type === 'jerky_movement' && `Velocity change: ${issue.velocityChange?.toFixed(2)} m/s`}
                                                    {issue.type === 'unrealistic_movement' && `Jump distance: ${issue.distance?.toFixed(2)} m`}
                                                    {issue.type === 'sharp_direction_change' && `Direction change: ${issue.angle?.toFixed(1)}°`}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                issue.severity === 'error'
                                                    ? 'bg-red-500/30 text-red-400'
                                                    : 'bg-yellow-500/30 text-yellow-400'
                                            }`}>
                                                {issue.severity.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Suggestions Tab */}
                    {activeTab === 'suggestions' && (
                        <div className="space-y-3">
                            {analysis.suggestions.length === 0 ? (
                                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center text-green-400">
                                    No suggestions needed - your route looks great!
                                </div>
                            ) : (
                                analysis.suggestions.map((suggestion, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-neutral-700 rounded-lg overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
                                            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-neutral-600 transition-colors text-left"
                                        >
                                            <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white">{suggestion.title}</h4>
                                                <p className="text-sm text-gray-400 mt-1">{suggestion.description}</p>
                                            </div>
                                            <span className={`transform transition-transform ${expandedIssue === idx ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        </button>
                                        {expandedIssue === idx && (
                                            <div className="px-4 pb-4 border-t border-neutral-600">
                                                <h5 className="text-sm font-semibold text-blue-400 mb-2">Recommended Actions:</h5>
                                                <ul className="space-y-2">
                                                    {suggestion.actions.map((action, actionIdx) => (
                                                        <li key={actionIdx} className="text-sm text-gray-300 flex gap-2">
                                                            <span className="text-blue-400">→</span>
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-neutral-700 border-t border-neutral-600 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
