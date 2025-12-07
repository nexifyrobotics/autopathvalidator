import React, { useState } from 'react';
import { Share2, Copy, Check, X, QrCode } from 'lucide-react';
import { generateShareURL, copyToClipboard, generateQRCodeURL } from '../utils/shareUtils';

export function ShareDialog({ data, onClose }) {
    const [copied, setCopied] = useState(false);
    const shareURL = generateShareURL(data);

    const handleCopy = async () => {
        if (shareURL && await copyToClipboard(shareURL)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 rounded-lg border border-neutral-700 max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-semibold">Share Analysis</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm mb-2 block">Share URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareURL || ''}
                                readOnly
                                className="flex-1 bg-neutral-900 border border-gray-700 text-white rounded px-3 py-2 text-sm"
                            />
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {shareURL && (
                        <div>
                            <label className="text-gray-400 text-sm mb-2 block">QR Code</label>
                            <div className="flex justify-center p-4 bg-white rounded">
                                <img
                                    src={generateQRCodeURL(shareURL)}
                                    alt="QR Code"
                                    className="w-32 h-32"
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-500">
                        Share this URL to let others view the analysis results. They can load the same constraints and see the summary.
                    </p>
                </div>
            </div>
        </div>
    );
}

