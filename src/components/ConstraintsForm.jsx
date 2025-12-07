import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { ROBOT_PROFILES, getProfileByName, loadCustomProfiles, saveCustomProfile } from '../utils/robotProfiles';

export function ConstraintsForm({ constraints, setConstraints }) {
    const [selectedProfile, setSelectedProfile] = useState('kitbot');
    const [customProfiles, setCustomProfiles] = useState({});
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [customName, setCustomName] = useState('');

    useEffect(() => {
        setCustomProfiles(loadCustomProfiles());
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConstraints(prev => ({
            ...prev,
            [name]: Number(value)
        }));
        setSelectedProfile('custom');
    };

    const handleProfileChange = (e) => {
        const profileName = e.target.value;
        setSelectedProfile(profileName);
        const profile = getProfileByName(profileName);
        if (profile) {
            setConstraints(profile.constraints);
        }
    };

    const handleSaveProfile = () => {
        if (customName.trim()) {
            saveCustomProfile(customName.trim(), constraints);
            setCustomProfiles(loadCustomProfiles());
            setCustomName('');
            setShowSaveDialog(false);
        }
    };

    const allProfiles = { ...ROBOT_PROFILES, ...customProfiles };

    return (
        <div className="p-4 bg-neutral-800 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Robot Constraints
                </h3>
                <button
                    onClick={() => setShowSaveDialog(true)}
                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"
                >
                    <Save className="w-3 h-3" />
                    Save Profile
                </button>
            </div>

            {/* Profile Selector */}
            <div className="mb-4">
                <label className="text-gray-400 text-sm mb-1 block">Robot Profile</label>
                <select
                    value={selectedProfile}
                    onChange={handleProfileChange}
                    className="w-full bg-neutral-900 border border-gray-700 text-white rounded px-3 py-2 text-sm"
                >
                    {Object.entries(allProfiles).map(([key, profile]) => (
                        <option key={key} value={key}>
                            {profile.name} {profile.description ? `- ${profile.description}` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 max-w-md w-full mx-4">
                        <h4 className="text-white font-semibold mb-4">Save Custom Profile</h4>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Profile name..."
                            className="w-full bg-neutral-900 border border-gray-700 text-white rounded px-3 py-2 mb-4"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveProfile()}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setShowSaveDialog(false); setCustomName(''); }}
                                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-4">

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
        </div>
    );
}
