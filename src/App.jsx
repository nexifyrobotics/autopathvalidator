import React, { useState, useEffect, useRef } from 'react'
import { FileUpload } from './components/FileUpload'
import { ConstraintsForm } from './components/ConstraintsForm'
import { AnalysisPanel } from './components/AnalysisPanel'
import { EnhancedCharts } from './components/EnhancedCharts'
import { SummaryDashboard } from './components/SummaryDashboard'
import { FieldOverlay } from './components/FieldOverlay'
import { ExportButton } from './components/ExportButton'
import { PathComparison } from './components/PathComparison'
import { AdvancedAnalysis } from './components/AdvancedAnalysis'
import { HistoryPanel } from './components/HistoryPanel'
import { ShareDialog } from './components/ShareDialog'
import { OptimizationPanel } from './components/OptimizationPanel'
import { RouteAnalyzer } from './components/RouteAnalyzer'
import { parseTrajectory } from './utils/parser'
import { calculateKinematics } from './utils/kinematics'
import { validateTrajectory } from './utils/validator'
import { setupKeyboardShortcuts } from './utils/keyboardShortcuts'
import { saveToHistory } from './utils/history'
import { parseShareURL } from './utils/shareUtils'
import { Activity, Loader2, History, Share2, Github, Sparkles, Route } from 'lucide-react'

function App() {
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [violations, setViolations] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [activeView, setActiveView] = useState('analysis'); // 'analysis', 'route', or 'compare'
  const fileInputRef = useRef(null);

  const [constraints, setConstraints] = useState({
    maxVelocity: 3.8,
    maxAcceleration: 2.5,
    maxJerk: 10.0,
    maxCentripetal: 2.5
  });

  // Setup keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts({
      onOpenFile: () => fileInputRef.current?.click(),
      onExport: () => {/* Export handled by ExportButton */},
      onEscape: () => {
        setShowHistory(false);
        setShowShare(false);
        setShowOptimization(false);
      },
      onSwitchTab: (index) => {
        const views = ['analysis', 'route', 'compare'];
        setActiveView(views[Math.min(index, views.length - 1)]);
      }
    });
    return cleanup;
  }, []);

  // Check for share URL on mount
  useEffect(() => {
    const shareData = parseShareURL();
    if (shareData && shareData.constraints) {
      setConstraints(shareData.constraints);
      showToast('Loaded constraints from shared URL', 'success');
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (json, name) => {
    setIsLoading(true);
    try {
      console.log('📁 File uploaded:', name);
      console.log('📊 Raw JSON:', json);

      const rawTrajectory = parseTrajectory(json);
      console.log('✅ Parsed trajectory:', rawTrajectory);

      const enrichedTrajectory = calculateKinematics(rawTrajectory);
      console.log('✅ Enriched trajectory:', enrichedTrajectory);

      const v = validateTrajectory(enrichedTrajectory, constraints);
      console.log('✅ Violations:', v);

      setTrajectoryData(enrichedTrajectory);
      setFileName(name);
      setViolations(v);

      // Save to history
      saveToHistory({
        fileName: name,
        trajectoryData: enrichedTrajectory,
        violations: v,
        constraints: constraints
      });

      showToast('Loaded: ' + name, 'success');
    } catch (err) {
      console.error('❌ Error during file upload:', err);
      console.error('Stack:', err.stack);
      showToast('Error: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistory = (entry) => {
    setTrajectoryData(entry.trajectoryData);
    setFileName(entry.fileName);
    setViolations(entry.violations);
    setConstraints(entry.constraints);
    showToast('Loaded from history', 'success');
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
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Auto Path Validator
            </h1>
            <span className="text-sm text-gray-500 font-mono">v0.2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOptimization(!showOptimization)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Optimization Suggestions"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              title="History (Ctrl+H)"
            >
              <History className="w-4 h-4" />
            </button>
            {trajectoryData.length > 0 && (
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {trajectoryData.length > 0 && (
              <ExportButton
                trajectoryData={trajectoryData}
                violations={violations}
                constraints={constraints}
              />
            )}
            <a
              href="https://github.com/nexifyrobotics/autopathvalidator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="w-full p-8 space-y-6">

        {/* Upload & Constraints Section - Modular Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Upload Block */}
          <div className="lg:col-span-4">
            <div ref={fileInputRef}>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
            {fileName && <p className="mt-2 text-sm text-center text-green-400">Loaded: {fileName}</p>}
          </div>

          {/* Constraints Block */}
          <div className="lg:col-span-8">
            <ConstraintsForm constraints={constraints} setConstraints={setConstraints} />
          </div>
        </div>

        {/* Tabs */}
        {trajectoryData.length > 0 && (
          <div className="flex gap-2 border-b border-neutral-700">
            <button
              onClick={() => setActiveView('analysis')}
              className={`px-6 py-3 font-medium text-sm flex items-center space-x-2 ${
                activeView === 'analysis'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Analysis</span>
            </button>

            <button
              onClick={() => setActiveView('route')}
              className={`px-6 py-3 font-medium text-sm flex items-center space-x-2 ${
                activeView === 'route'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Route className="w-4 h-4" />
              <span>Route Analysis</span>
            </button>

            <button
              onClick={() => setActiveView('compare')}
              className={`px-6 py-3 font-medium text-sm flex items-center space-x-2 ${
                activeView === 'compare'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Compare Paths</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-3 text-gray-400">Processing trajectory...</span>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          } text-white flex items-center gap-2`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2">×</button>
          </div>
        )}

        {/* Analysis Tab */}
        {trajectoryData.length > 0 && activeView === 'analysis' && (
          <>
            {/* Summary Dashboard */}
            <SummaryDashboard
              key={`dashboard-${violations.length}-${violations.filter(v => v.severity === 'error').length}-${violations.filter(v => v.severity === 'warning').length}`}
              trajectory={trajectoryData}
              violations={violations}
              constraints={constraints}
            />
            {/* Charts Grid */}
            <div className="w-full">
              <EnhancedCharts
                data={trajectoryData}
                constraints={constraints}
                violations={violations}
              />
            </div>

            {/* Analysis Panel */}
            <div className="w-full">
              <AnalysisPanel violations={violations} />
            </div>
          </>
        )}

        {/* Route Analysis Tab */}
        {trajectoryData.length > 0 && activeView === 'route' && (
          <div className="space-y-6">
            <RouteAnalyzer
              trajectory={trajectoryData}
              violations={violations}
              constraints={constraints}
            />
          </div>
        )}

        {/* Compare Tab */}
        {trajectoryData.length > 0 && activeView === 'compare' && (
          <PathComparison
            trajectory={trajectoryData}
            constraints={constraints}
          />
        )}
      </main>

      {/* Modals */}
      {showHistory && (
        <HistoryPanel
          onLoadHistory={handleLoadHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showShare && trajectoryData.length > 0 && (
        <ShareDialog
          data={{
            fileName,
            trajectoryData,
            violations,
            constraints
          }}
          onClose={() => setShowShare(false)}
        />
      )}

      {showOptimization && trajectoryData.length > 0 && (
        <OptimizationPanel
          trajectoryData={trajectoryData}
          violations={violations}
          constraints={constraints}
          onClose={() => setShowOptimization(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-neutral-800 border-t border-neutral-700 mt-12">
        <div className="w-full px-8 py-6">
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
                Auto Path Validator v0.2.0
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Built for FRC Teams
              </p>
              <a
                href="https://github.com/nexify-robotics/autopathvalidator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2 justify-center md:justify-end"
              >
                <Github className="w-3 h-3" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
