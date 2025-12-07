import React, { useState, useEffect } from 'react'
import { FileUpload } from './components/FileUpload'
import { ConstraintsForm } from './components/ConstraintsForm'
import { AnalysisPanel } from './components/AnalysisPanel'
import { Charts } from './components/Charts'
import { parseTrajectory } from './utils/parser'
import { calculateKinematics } from './utils/kinematics'
import { validateTrajectory } from './utils/validator'
import { parseImagePath } from './utils/imageParser'
import { Activity } from 'lucide-react'

function App() {
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [violations, setViolations] = useState([]);
  const [fileName, setFileName] = useState("");

  const [constraints, setConstraints] = useState({
    maxVelocity: 4.8,      // Typical FRC Swerve: ~4.5-5.0 m/s
    maxAcceleration: 3.5,  // Good acceleration: ~3-4 m/s²
    maxJerk: 15.0,        // Reasonable jerk limit
    maxCentripetal: 4.0   // High friction wheels can handle ~4 m/s²
  });

  const handleFileUpload = (json, name) => {
    try {
      // 1. Parse
      const rawTrajectory = parseTrajectory(json);
      // 2. Kinematics
      const enrichedTrajectory = calculateKinematics(rawTrajectory);

      setTrajectoryData(enrichedTrajectory);
      setFileName(name);

      // 3. Validate
      const v = validateTrajectory(enrichedTrajectory, constraints);
      setViolations(v);

    } catch (err) {
      console.error(err);
      alert("Error parsing file: " + err.message);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setFileName(file.name + " (Processing...)");

      // Parse image to extract path
      const rawTrajectory = await parseImagePath(file);

      // Calculate kinematics
      const enrichedTrajectory = calculateKinematics(rawTrajectory);

      setTrajectoryData(enrichedTrajectory);
      setFileName(file.name + " ✓");

      // Validate
      const v = validateTrajectory(enrichedTrajectory, constraints);
      setViolations(v);

    } catch (err) {
      console.error(err);
      alert("Error processing image: " + err.message);
      setFileName("");
    }
  };

  // Re-run validation if constraints change
  useEffect(() => {
    if (trajectoryData.length > 0) {
      const v = validateTrajectory(trajectoryData, constraints);
      setViolations(v);
    }
  }, [constraints, trajectoryData]);

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100">
      {/* Header - Full Width */}
      <header className="bg-neutral-800 border-b border-neutral-700 px-8 py-6">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Auto Path Validator
            </h1>
            <span className="text-sm text-gray-500 font-mono">v0.1.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-8 space-y-6">

        {/* Upload & Constraints Section - Modular Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Upload Block */}
          <div className="lg:col-span-4">
            <FileUpload onFileUpload={handleFileUpload} onImageUpload={handleImageUpload} />
            {fileName && <p className="mt-2 text-sm text-center text-green-400">Loaded: {fileName}</p>}
          </div>

          {/* Constraints Block */}
          <div className="lg:col-span-8">
            <ConstraintsForm constraints={constraints} setConstraints={setConstraints} />
          </div>
        </div>

        {/* Charts & Analysis Section - Full Width Modular */}
        {trajectoryData.length > 0 && (
          <>
            {/* Charts Grid - 2x2 */}
            <div className="w-full">
              <Charts
                data={trajectoryData}
                constraints={constraints}
                violations={violations}
              />
            </div>

            {/* Analysis Panel - Full Width */}
            <div className="w-full">
              <AnalysisPanel violations={violations} />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-800 border-t border-neutral-700 mt-12">
        <div className="max-w-[1920px] mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and Team Info */}
            <div className="flex items-center gap-4">
              <img
                src="./nexify-logo.jpg"
                alt="Nexify Robotics"
                className="h-12 w-12 object-contain rounded-lg"
              />
              <div>
                <p className="text-white font-bold text-lg">Nexify Robotics</p>
                <p className="text-gray-400 text-sm">#10185</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                Auto Path Validator v0.1.0
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Built for FRC Teams
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
