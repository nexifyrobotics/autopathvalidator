import React, { useState } from 'react';
import { Download, FileText, FileJson, Printer, Code } from 'lucide-react';
import { exportToJSON, exportToText, exportToPDF } from '../utils/exportUtils';
import { exportToPathPlanner } from '../utils/pathplannerExport';

export function ExportButton({ trajectoryData, violations, constraints }) {
    const [showMenu, setShowMenu] = useState(false);

    const hasData = trajectoryData && trajectoryData.length > 0;

    if (!hasData) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
                <Download className="w-4 h-4" />
                <span>Export</span>
            </button>

            {showMenu && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 min-w-[200px]">
                        <button
                            onClick={() => {
                                exportToJSON(trajectoryData, violations, constraints);
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left transition-colors"
                        >
                            <FileJson className="w-5 h-5 text-blue-400" />
                            <div>
                                <div className="text-white text-sm font-medium">Export JSON</div>
                                <div className="text-gray-400 text-xs">Full analysis data</div>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                exportToText(trajectoryData, violations, constraints);
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left transition-colors"
                        >
                            <FileText className="w-5 h-5 text-green-400" />
                            <div>
                                <div className="text-white text-sm font-medium">Export Text</div>
                                <div className="text-gray-400 text-xs">Human-readable report</div>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                exportToPDF(trajectoryData, violations, constraints);
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left transition-colors"
                        >
                            <Printer className="w-5 h-5 text-purple-400" />
                            <div>
                                <div className="text-white text-sm font-medium">Print/PDF</div>
                                <div className="text-gray-400 text-xs">Printable format</div>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                exportToPathPlanner(trajectoryData, constraints);
                                setShowMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left transition-colors"
                        >
                            <Code className="w-5 h-5 text-green-400" />
                            <div>
                                <div className="text-white text-sm font-medium">Export to PathPlanner</div>
                                <div className="text-gray-400 text-xs">PathPlanner compatible format</div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

