import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';

export function AnalysisPanel({ violations }) {
    if (!violations || violations.length === 0) {
        return (
            <div className="bg-neutral-800 border border-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 font-semibold">No analysis yet. Upload a file to begin.</p>
            </div>
        );
    }

    // Check if it's a success case
    const isSuccess = violations.length === 1 && violations[0].severity === 'success';

    return (
        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg max-h-[600px] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                {isSuccess ? (
                    <>
                        <CheckCircle className="text-green-500" /> Path Analysis
                    </>
                ) : (
                    <>
                        <AlertTriangle className="text-yellow-500" /> Issues Found ({violations.length})
                    </>
                )}
            </h3>

            <div className="space-y-3">
                {violations.map((v, i) => {
                    const isError = v.severity === 'error';
                    const isWarning = v.severity === 'warning';
                    const isOk = v.severity === 'success';

                    return (
                        <div key={i} className={`p-4 rounded-lg border-l-4 ${isError ? 'border-red-500 bg-red-900/20' :
                            isWarning ? 'border-yellow-500 bg-yellow-900/20' :
                                'border-green-500 bg-green-900/20'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {isError && <XCircle className="w-5 h-5 text-red-400" />}
                                    {isWarning && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                                    {isOk && <CheckCircle className="w-5 h-5 text-green-400" />}
                                    <span className="font-semibold text-white">{v.type}</span>
                                </div>
                                {v.count && <span className="text-xs bg-neutral-700 px-2 py-1 rounded">{v.count} points</span>}
                            </div>

                            {v.location && (
                                <p className="text-xs text-purple-400 mb-1 flex items-center gap-1">
                                    <span>📍</span> Location: {v.location}
                                </p>
                            )}

                            {v.time > 0 && <p className="text-xs text-gray-400 mb-1">First occurrence: t = {v.time.toFixed(2)}s</p>}

                            <p className="text-gray-200 text-sm mb-2">{v.message}</p>

                            <div className="flex items-start gap-2 mt-2 p-2 bg-neutral-900/50 rounded">
                                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-blue-300 text-xs">{v.suggestion}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
