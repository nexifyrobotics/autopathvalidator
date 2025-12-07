# Auto Path Validator v0.1.0

**FRC Autonomous Path Analysis Tool** - Validate your PathPlanner and WPILib trajectories against robot constraints.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- ✅ **Dual Input Support**: Upload JSON trajectories or PathPlanner screenshots
- 📊 **Real-time Visualization**: Interactive charts for velocity, acceleration, and jerk
- 🎯 **Smart Analysis**: Intelligent violation detection with actionable suggestions
- 🔧 **Customizable Constraints**: Set your robot's physical limits
- 🌐 **Web-based**: No installation required, runs in your browser

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd autopathvalidator

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎮 Usage

### 1. Start the Application
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Configure Robot Constraints
Set your robot's physical limits:
- **Max Velocity** (m/s)
- **Max Acceleration** (m/s²)
- **Max Jerk** (m/s³)
- **Max Centripetal Acceleration** (m/s²)

### 3. Upload Your Path
**Option A: JSON File**
- Export your trajectory from PathPlanner or WPILib
- Upload the `.json` file

**Option B: Screenshot**
- Take a screenshot of your PathPlanner path
- Upload the `.png` or `.jpg` file
- The tool will automatically detect path lines

### 4. Analyze Results
- View interactive charts showing velocity, acceleration, and jerk profiles
- Check the Analysis Panel for violations and suggestions
- Adjust your path in PathPlanner based on recommendations

## 📊 Supported Formats

### JSON Trajectory (WPILib/PathPlanner)
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
- Blue or red path lines are automatically detected
- Converts pixel coordinates to real-world meters
- Calculates kinematic properties from visual data

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Recharts** - Chart visualization
- **Tailwind CSS** - Styling
- **Canvas API** - Image processing

## 📝 Analysis Features

### Velocity Analysis
- Detects speed limit violations
- Shows velocity profile over time
- Highlights acceleration/deceleration zones

### Acceleration Analysis
- Checks against robot acceleration limits
- Identifies harsh acceleration changes
- Suggests smoother motion profiles

### Jerk Analysis
- Calculates rate of acceleration change
- Warns about mechanical stress
- Recommends S-curve profiles

### Centripetal Acceleration
- Analyzes lateral forces in turns
- Checks friction limits
- Suggests turn radius adjustments

## 🎯 Example Workflow

1. Design your auto path in PathPlanner
2. Export or screenshot the path
3. Upload to Auto Path Validator
4. Review violations and suggestions
5. Adjust path constraints in PathPlanner
6. Re-validate until optimal
7. Deploy to robot

## 🐛 Known Issues

- Recharts may show console warnings on initial load (non-critical)
- Image processing works best with high-contrast path lines

## 🔮 Roadmap

- [ ] Multi-path comparison
- [ ] Export analysis reports
- [ ] Custom field dimensions
- [ ] Real-time path editing
- [ ] Integration with PathPlanner API

## 📄 License

MIT License - feel free to use in your FRC team!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Made with ❤️ for FRC Teams**
