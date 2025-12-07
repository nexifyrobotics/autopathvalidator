import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export function FileUpload({ onFileUpload, onImageUpload }) {
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if it's an image
        if (file.type.startsWith('image/')) {
            try {
                onImageUpload(file);
            } catch (err) {
                alert("Error processing image: " + err.message);
                console.error(err);
            }
            return;
        }

        // Otherwise, treat as JSON
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                onFileUpload(json, file.name);
            } catch (err) {
                alert("Invalid JSON file");
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
                <ImageIcon className="w-12 h-12 text-purple-400" />
            </div>
            <span className="text-gray-300 font-medium text-center">Click to upload</span>
            <span className="text-gray-500 text-sm mt-1">JSON Trajectory or PathPlanner Screenshot</span>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json,.path,.png,.jpg,.jpeg"
            />
        </div>
    );
}
