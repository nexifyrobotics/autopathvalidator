# Auto Path Validator v1.0.0

**Advanced FRC Autonomous Path Planning & Analysis Tool** - Design, validate, and optimize autonomous paths for FRC robots with specialized FRC 2025 Reefscape strategies.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![FRC](https://img.shields.io/badge/FRC-2025-red)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-yellow)

## 🚀 Features

### 🎯 **Path Analysis & Validation**
- ✅ **JSON Trajectory Analysis**: Validate PathPlanner and WPILib trajectories
- ✅ **Screenshot Processing**: Upload PathPlanner screenshots for instant analysis
- 📊 **Advanced Visualization**: Interactive charts for velocity, acceleration, and jerk
- 🎯 **Smart Violation Detection**: AI-powered suggestions for constraint violations
- 🔧 **Customizable Constraints**: Set precise robot physical limits

### 🎮 **Path Editor & Design**
- ✅ **Interactive Path Editor**: Design paths with waypoint-based interface
- ✅ **Field Selection**: Support for FRC 2025, 2024, and 2023 game fields
- ✅ **20+ Strategic Templates**: Specialized FRC 2025 Reefscape path templates
- ✅ **Real-time Preview**: Visual path preview with coordinate editing
- ✅ **Template Management**: Import/export custom path templates

### 🏆 **FRC 2025 Reefscape Optimization**
- ✅ **Coral Scoring Strategies**: L2, L3, L4 level approaches and techniques
- ✅ **Algae Collection Paths**: Ground pickup, processor, and net scoring
- ✅ **Endgame Excellence**: Barge climb positioning and chain strategies
- ✅ **Advanced Tactics**: Defense evasion, triple threat autos, combo plays
- ✅ **Mobility Maximization**: Optimal bonus point collection routes

### ⚡ **Optimization & Analytics**
- ✅ **Multi-algorithm Optimization**: Smooth, energy-efficient, and balanced modes
- ✅ **Advanced Analytics Dashboard**: Comprehensive performance metrics
- ✅ **Path Comparison**: Side-by-side analysis of different strategies
- ✅ **Performance Prediction**: Estimated scoring potential and efficiency

### 🌐 **Modern Web Experience**
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Dark Theme**: Eye-friendly interface for long design sessions
- ✅ **Real-time Updates**: Instant feedback on constraint changes
- ✅ **Export Capabilities**: Save paths in multiple formats

### 🎬 **RealTime Path Visualization**
- ✅ **Interactive Field View**: Real-time robot animation on FRC field
- ✅ **Manual Frame Control**: Step through trajectory frames precisely
- ✅ **Velocity & Acceleration Charts**: Live kinematic profile visualization
- ✅ **Constraint Violation Tracking**: Real-time violation detection and highlighting
- ✅ **Data Table View**: Complete trajectory data in tabular format
- ✅ **Export Current Frame**: Save visualization frames as images
- ✅ **Keyboard Shortcuts**: Full keyboard control for navigation
- ✅ **Performance Metrics**: Frame rate and data statistics

## 🎮 **Path Editor Guide**

### Creating a Custom Path
1. Navigate to the **"Path Editor"** tab
2. Select your game field from the dropdown
3. Use **"Add Waypoint"** to create path points
4. Edit X/Y coordinates manually or load from templates
5. Click **"Generate Path"** to create and validate

### Using Strategic Templates
- **20+ Pre-built Templates**: Specialized for FRC 2025 Reefscape
- **Smart Search & Filters**: Find templates by difficulty or game element
- **Star Favorites**: Mark your most-used strategies
- **Import/Export**: Share templates with your team

## 🏆 **FRC 2025 Reefscape Strategies**

### Coral Scoring Templates
- **Reef L4 Approach**: Optimal path to Level 4 coral branches
- **Rapid Fire Coral**: High-speed multi-coral collection
- **Reef L2-L3 Hybrid**: Balanced scoring across multiple levels

### Algae Collection Templates
- **Ground Algae Collection**: Efficient ground pickup routes
- **Processor Algae Shot**: Direct shots to processor targets
- **Net Algae Shot**: Precise trajectories for net scoring
- **Algae Processor + Net Combo**: Double algae scoring paths

### Advanced Game Strategies
- **Triple Threat Auto**: Coral + Algae + Mobility in one path
- **Defense Evasion**: Strategic routes avoiding defensive robots
- **Endgame Positioning**: Optimal climb setup trajectories
- **Cooperative Play**: Alliance partner coordination routes

## ⚡ **Optimization Features**

### Multi-Algorithm Optimization
- **Smooth Path**: Minimizes jerk and mechanical stress
- **Energy Efficient**: Reduces power consumption
- **Balanced**: Combines multiple optimization goals
- **Minimum Jerk**: Prioritizes robot longevity

### Advanced Analytics Dashboard
- **Performance Metrics**: Velocity efficiency, smoothness scores
- **Constraint Analysis**: Violation tracking and trends
- **Path Comparison**: Side-by-side strategy evaluation

## 📊 **Supported Input Formats**

### JSON Trajectory Files (WPILib/PathPlanner)
```json
{
  "states": [
    {
      "time": 0.0,
      "velocity": 0.0,
      "acceleration": 2.0,
      "pose": {
        "rotation": {"radians": 0.0},
        "translation": {"x": 0.0, "y": 0.0}
      },
      "curvature": 0.0
    }
  ]
}
```

### PathPlanner Screenshots
- Automatic detection of blue/red path lines
- Pixel-to-meter coordinate conversion
- Real-time kinematic property calculation

## 🛠️ **Technical Specifications**

- **Framework**: React 19 with modern hooks
- **Build Tool**: Vite for fast development
- **Visualization**: Recharts for interactive charts
- **Styling**: Tailwind CSS with dark theme
- **Image Processing**: Canvas API for screenshot analysis

## 📈 **Analysis Capabilities**

### Comprehensive Validation
- **Velocity Limits**: Real-time speed constraint checking
- **Acceleration Profiles**: Smooth motion validation
- **Jerk Analysis**: Mechanical stress assessment
- **Centripetal Forces**: Turn feasibility evaluation

### Smart Recommendations
- **Constraint Violations**: Detailed violation reports
- **Optimization Suggestions**: AI-powered improvement tips
- **Performance Metrics**: Efficiency scores and rankings

## 🎯 **Complete FRC Workflow**

1. **Design**: Use Path Editor or load strategic templates
2. **Validate**: Upload JSON files or screenshots for analysis
3. **Optimize**: Apply multi-algorithm path optimization
4. **Compare**: Evaluate different strategies side-by-side
5. **Deploy**: Export validated paths to your robot code

## 🔄 **Continuous Improvement**

The tool evolves with FRC game changes, featuring:
- Latest game field layouts and dimensions
- Current meta strategies and optimal routes
- Performance data from top-performing teams
- Community-contributed template library

## 📄 License

MIT License - feel free to use in your FRC team!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🎬 **RealTime Path Visualization Guide**

### Loading and Analyzing Trajectories
1. **Upload Trajectory**: Click "Choose File" and select your JSON trajectory file
2. **Navigate to RealTime View**: Click the "Realtime View" tab
3. **Manual Frame Control**:
   - Use **Frame input** to jump to specific frame numbers
   - Use **Time input** to jump to specific time points
   - Use **step buttons** (← →) for frame-by-frame navigation
   - Use **quick navigation** (⟪ ⟪10 10⟫ ⟫) for fast movement

### Advanced Features
- **Velocity Charts**: Real-time velocity profile with constraint violations
- **Acceleration Charts**: Live acceleration data with visual indicators
- **Data Table**: Complete trajectory data with clickable rows
- **Export Frame**: Save current visualization as PNG image
- **Keyboard Shortcuts**: Space (play/pause), ←→ (step), R (reset), L (loop)

### Keyboard Shortcuts
- **Space**: Play/Pause (removed in current version)
- **← →**: Step backward/forward
- **R**: Reset to start
- **L**: Toggle loop mode

## 🚀 **Local Development Setup**

### Prerequisites
- **Node.js** 18+ (Download from [nodejs.org](https://nodejs.org/))
- **npm** or **yarn** package manager

### Installation & Running

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dorukdogular/autopathvalidator.git
   cd autopathvalidator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   npx vite
   ```

4. **Open in browser**:
   - Navigate to `http://localhost:5173`
   - The app will automatically reload on code changes

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Project Structure
```
autopathvalidator/
├── src/
│   ├── components/          # React components
│   │   ├── RealTimeVisualization.jsx  # Trajectory visualization
│   │   ├── PathEditor.jsx             # Path creation tool
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── parser.js        # Trajectory parsing
│   │   ├── kinematics.js    # Motion calculations
│   │   └── validator.js     # Constraint validation
│   └── App.jsx              # Main application
├── public/                  # Static assets
├── sample.json              # Sample trajectory data
└── package.json
```

## 🐛 **Troubleshooting**

### Common Issues
- **RealTime View not showing**: Make sure to upload a trajectory file first
- **Charts not displaying**: Check that your trajectory has valid kinematic data
- **Performance issues**: Large trajectory files may cause slowdowns

### Debug Mode
- Open browser developer tools (F12)
- Check console for error messages
- RealTime View has debug logging enabled

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Made with ❤️ for FRC Teams**
