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
import PathEditor from './components/PathEditor'
import PathOptimizer from './components/PathOptimizer'
import FieldSelector from './components/FieldSelector'
import RealTimeVisualization from './components/RealTimeVisualization'
import { parseTrajectory } from './utils/parser'
import { calculateKinematics } from './utils/kinematics'
import { validateTrajectory } from './utils/validator'
import { setupKeyboardShortcuts } from './utils/keyboardShortcuts'
import { saveToHistory } from './utils/history'
import { parseShareURL } from './utils/shareUtils'
import { Activity, Loader2, History, Share2, Github, Sparkles, Route, PenTool, Play, Pause, Square } from 'lucide-react'

function App() {
  const [trajectoryData, setTrajectoryData] = useState([]);
  const [violations, setViolations] = useState([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);
  const [activeView, setActiveView] = useState('analysis'); // 'analysis', 'route', 'compare', 'editor', or 'realtime'
  const [selectedField, setSelectedField] = useState(null);
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
        const views = ['analysis', 'route', 'compare', 'editor'];
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
      console.log('Starting file upload processing for:', name);
      
      // Validate input
      if (!json) {
        throw new Error('No data found in the file');
      }
      
      // Parse the trajectory data
      console.log('Parsing trajectory data...');
      const rawTrajectory = parseTrajectory(json);
      
      if (!rawTrajectory || !rawTrajectory.length) {
        throw new Error('No valid trajectory points found in the file');
      }
      
      console.log(`Successfully parsed ${rawTrajectory.length} trajectory points`);
      
      // Calculate kinematics
      console.log('Calculating kinematics...');
      const enrichedTrajectory = calculateKinematics(rawTrajectory);
      
      // Validate against constraints
      console.log('Validating trajectory...');
      const v = validateTrajectory(enrichedTrajectory, constraints);
      
      // Update state
      console.log('Updating application state...');
      setTrajectoryData(enrichedTrajectory);
      setFileName(name);
      setViolations(v);

      // Save to history
      console.log('Saving to history...');
      saveToHistory({
        fileName: name,
        trajectoryData: enrichedTrajectory,
        violations: v,
        constraints: constraints
      });

      console.log('File upload completed successfully');
      showToast(`Successfully loaded ${name} (${enrichedTrajectory.length} points)`, 'success');
    } catch (err) {
      console.error('❌ Error during file upload:', err);
      console.error('Error stack:', err.stack);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        file: name,
        dataType: typeof json,
        isArray: Array.isArray(json),
        jsonKeys: json ? Object.keys(json) : 'no data'
      });
      
      // Reset state to prevent black screen
      setTrajectoryData([]);
      setFileName("");
      setViolations([]);
      
      // Show user-friendly error message
      let errorMessage = err.message || 'Failed to load trajectory file';
      if (errorMessage.includes('JSON')) {
        errorMessage = 'Invalid file format. Please upload a valid JSON trajectory file.';
      } else if (errorMessage.includes('waypoints')) {
        errorMessage = 'This appears to be a waypoint file. Please upload a generated trajectory file instead.';
      }
      
      showToast(`Error: ${errorMessage}`, 'error');
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
            <span className="text-sm text-gray-500 font-mono">v1.0.0</span>
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
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveView('analysis')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 whitespace-nowrap ${activeView === 'analysis' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Activity size={16} />
              <span>Analysis</span>
            </button>
            <button
              onClick={() => setActiveView('route')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 whitespace-nowrap ${activeView === 'route' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Route size={16} />
              <span>Route Analyzer</span>
            </button>
            <button
              onClick={() => setActiveView('compare')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 whitespace-nowrap ${activeView === 'compare' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <Square size={16} />
              <span>Compare</span>
            </button>
            <button
              onClick={() => setActiveView('editor')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 whitespace-nowrap ${activeView === 'editor' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <PenTool size={16} />
              <span>Path Editor</span>
            </button>
            <button
              onClick={() => setActiveView('realtime')}
              disabled={!trajectoryData.length}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 whitespace-nowrap ${!trajectoryData.length ? 'opacity-50 cursor-not-allowed' : ''} ${activeView === 'realtime' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              title={!trajectoryData.length ? 'Please load a trajectory first' : ''}
            >
              {activeView === 'realtime' ? <Pause size={16} /> : <Play size={16} />}
              <span>Realtime View</span>
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
          <div className="space-y-6">
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
          </div>
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

        {/* Realtime View Tab */}
        {trajectoryData.length > 0 && activeView === 'realtime' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RealTimeVisualization trajectoryData={trajectoryData} />
              </div>
              <div className="space-y-4">
                <AnalysisPanel 
                  violations={violations} 
                  trajectoryData={trajectoryData}
                  fileName={fileName}
                />
              </div>
            </div>
          </div>
        )}

        {/* Editor Tab */}
        {activeView === 'editor' && (
          <div className="space-y-6">
            <FieldSelector
              selectedField={selectedField}
              onFieldChange={setSelectedField}
            />
            <PathEditor
              onPathCreated={(trajectory) => {
                // Process the created trajectory
                const enrichedTrajectory = calculateKinematics(trajectory);
                const v = validateTrajectory(enrichedTrajectory, constraints);

                setTrajectoryData(enrichedTrajectory);
                setFileName('Custom Path');
                setViolations(v);

                // Save to history
                saveToHistory({
                  fileName: 'Custom Path',
                  trajectoryData: enrichedTrajectory,
                  violations: v,
                  constraints: constraints
                });

                showToast('Custom path created successfully!', 'success');
                setActiveView('analysis'); // Switch to analysis view
              }}
              constraints={constraints}
              selectedField={selectedField}
            />
          </div>
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
          onOptimizedPath={(optimizedPath) => {
            // Process the optimized trajectory
            const enrichedTrajectory = calculateKinematics(optimizedPath);
            const v = validateTrajectory(enrichedTrajectory, constraints);

            setTrajectoryData(enrichedTrajectory);
            setViolations(v);

            // Save to history
            saveToHistory({
              fileName: fileName + ' (Optimized)',
              trajectoryData: enrichedTrajectory,
              violations: v,
              constraints: constraints
            });

            showToast('Path optimized successfully!', 'success');
          }}
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
                Auto Path Validator v1.0.0
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
