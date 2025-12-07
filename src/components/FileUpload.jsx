import React, { useRef } from 'react';
import { Upload, FileJson } from 'lucide-react';

export function FileUpload({ onFileUpload }) {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Only accept JSON files
        if (!file.name.endsWith('.json') && !file.name.endsWith('.path')) {
            alert("Please upload a JSON trajectory file (.json or .path)");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                onFileUpload(json, file.name);
            } catch (err) {
                alert("Invalid JSON file: " + err.message);
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer bg-neutral-900"
            onClick={() => fileInputRef.current.click()}>
            <div className="flex gap-3 mb-2">
                <Upload className="w-12 h-12 text-gray-400" />
                <FileJson className="w-12 h-12 text-blue-400" />
            </div>
            <span className="text-gray-300 font-medium text-center">Click to upload</span>
            <span className="text-gray-500 text-sm mt-1">JSON Trajectory File</span>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json,.path"
            />
        </div>
    );
}
