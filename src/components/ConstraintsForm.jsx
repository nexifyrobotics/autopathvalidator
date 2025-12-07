import React from 'react';

export function ConstraintsForm({ constraints, setConstraints }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setConstraints(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    return (
        <div className="flex flex-wrap gap-4 p-4 bg-neutral-800 rounded-lg shadow-md">
            <h3 className="w-full text-lg font-semibold text-white mb-2">Robot Constraints</h3>

            <div className="flex flex-col">
                <label className="text-gray-400 text-sm mb-1">Max Velocity (m/s)</label>
                <input
                    type="number" step="0.1" name="maxVelocity"
                    value={constraints.maxVelocity} onChange={handleChange}
                    className="bg-neutral-900 border border-gray-700 text-white rounded px-2 py-1"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-gray-400 text-sm mb-1">Max Acceleration (m/s²)</label>
                <input
                    type="number" step="0.1" name="maxAcceleration"
                    value={constraints.maxAcceleration} onChange={handleChange}
                    className="bg-neutral-900 border border-gray-700 text-white rounded px-2 py-1"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-gray-400 text-sm mb-1">Max Jerk (m/s³)</label>
                <input
                    type="number" step="0.1" name="maxJerk"
                    value={constraints.maxJerk} onChange={handleChange}
                    className="bg-neutral-900 border border-gray-700 text-white rounded px-2 py-1"
                />
            </div>

            <div className="flex flex-col">
                <label className="text-gray-400 text-sm mb-1">Max Centripetal Accel (m/s²)</label>
                <input
                    type="number" step="0.1" name="maxCentripetal"
                    value={constraints.maxCentripetal || 0} onChange={handleChange}
                    className="bg-neutral-900 border border-gray-700 text-white rounded px-2 py-1"
                    title="Lateral acceleration limit (friction)"
                />
            </div>
        </div>
    );
}
