# Route Analysis API Documentation

## Overview
The Route Analysis system provides a comprehensive API for analyzing robot trajectories and detecting problems with actionable suggestions.

## Core Functions

### `analyzeRouteForProblems(trajectoryData, constraints)`

**Purpose**: Main entry point for route analysis

**Parameters**:
- `trajectoryData` (Array<Object>): Array of trajectory waypoints
  - Each point should have: `time`, `x`, `y`, `rotation`, `velocity`, `acceleration`, `curvature`
  - May optionally include: `calculatedAccel`, `calculatedJerk`
- `constraints` (Object): Robot movement constraints
  - `maxVelocity` (Number): Maximum velocity in m/s
  - `maxAcceleration` (Number): Maximum acceleration in m/s²
  - `maxJerk` (Number): Maximum jerk in m/s³
  - `maxCentripetal` (Number): Maximum centripetal acceleration in m/s²

**Returns**: 
```javascript
{
  problemStartIndex: Number,           // Index of first problem (-1 if none)
  problemStartPoint: Object,           // First problem waypoint (null if none)
  severity: String,                    // 'none' | 'info' | 'warning' | 'critical'
  issues: Array<IssueObject>,         // All detected issues
  suggestions: Array<SuggestionObject> // Improvement recommendations
}
```

**Example**:
```javascript
import { analyzeRouteForProblems } from './utils/routeAnalyzer';

const analysis = analyzeRouteForProblems(trajectoryData, {
  maxVelocity: 3.8,
  maxAcceleration: 2.5,
  maxJerk: 10.0,
  maxCentripetal: 2.5
});

console.log(`Found ${analysis.issues.length} issues`);
console.log(`Severity: ${analysis.severity}`);
```

---

### `detectPointProblems(point, index, trajectoryData, constraints)`

**Purpose**: Analyzes a single trajectory point for violations

**Parameters**:
- `point` (Object): The trajectory point to analyze
- `index` (Number): Index of the point in the trajectory array
- `trajectoryData` (Array): Full trajectory for context analysis
- `constraints` (Object): Movement constraints

**Returns**: Array<IssueObject>

**Issue Object Structure**:
```javascript
{
  type: String,           // Issue type identifier
  name: String,          // Human-readable name
  severity: String,      // 'error' | 'warning'
  value?: Number,        // Actual value that triggered issue
  limit?: Number,        // Constraint limit that was exceeded
  curvature?: Number,    // Optional: curvature value
  angle?: Number,        // Optional: direction change angle
  velocityChange?: Number, // Optional: velocity change amount
  distance?: Number,     // Optional: jump distance
  timeDelta?: Number     // Optional: time interval
}
```

**Example**:
```javascript
const issues = detectPointProblems(point, 5, trajectoryData, constraints);
issues.forEach(issue => {
  console.log(`${issue.name}: ${issue.value} vs limit ${issue.limit}`);
});
```

---

## Data Types

### TrajectoryPoint
```javascript
{
  time: Number,              // Timestamp in seconds
  x: Number,                 // X position in meters
  y: Number,                 // Y position in meters
  rotation: Number,          // Heading in radians
  velocity: Number,          // Velocity in m/s
  acceleration: Number,      // Acceleration in m/s²
  curvature: Number,         // Curvature in rad/m
  calculatedAccel?: Number,  // Optional: calculated acceleration
  calculatedJerk?: Number    // Optional: calculated jerk
}
```

### IssueObject
```javascript
{
  type: String,      // One of the 7 issue types
  name: String,      // Display name
  severity: String,  // 'error' or 'warning'
  // Additional fields depend on issue type
}
```

**Issue Types**:
1. `velocity_violation` - Speed exceeds maxVelocity
2. `acceleration_violation` - Acceleration exceeds maxAcceleration
3. `jerk_violation` - Jerk exceeds maxJerk
4. `sharp_turn` - Centripetal acceleration exceeds maxCentripetal
5. `jerky_movement` - Velocity change too abrupt
6. `unrealistic_movement` - Position jump detected
7. `sharp_direction_change` - Direction change >120°

### SuggestionObject
```javascript
{
  title: String,           // Suggestion title
  description: String,     // Problem description
  actions: Array<String>   // List of recommended actions
}
```

---

## Usage Examples

### Basic Analysis
```javascript
import { analyzeRouteForProblems } from './utils/routeAnalyzer';

const constraints = {
  maxVelocity: 3.8,
  maxAcceleration: 2.5,
  maxJerk: 10.0,
  maxCentripetal: 2.5
};

const analysis = analyzeRouteForProblems(trajectoryData, constraints);

if (analysis.severity === 'critical') {
  console.warn('Critical issues found at waypoint', analysis.problemStartIndex);
}
```

### Checking Specific Issues
```javascript
const hasVelocityIssues = analysis.issues.some(
  issue => issue.type === 'velocity_violation'
);

if (hasVelocityIssues) {
  console.log('Route has velocity violations');
}
```

### Getting Suggestions
```javascript
analysis.suggestions.forEach((suggestion, index) => {
  console.log(`\nSuggestion ${index + 1}: ${suggestion.title}`);
  console.log(`Description: ${suggestion.description}`);
  suggestion.actions.forEach(action => {
    console.log(`  • ${action}`);
  });
});
```

### Severity Handling
```javascript
const handleAnalysis = (analysis) => {
  switch (analysis.severity) {
    case 'critical':
      alert('Critical issues found! Route may not execute properly.');
      break;
    case 'warning':
      console.warn(`${analysis.issues.length} warnings detected.`);
      break;
    case 'info':
    case 'none':
      console.log('Route analysis complete - no critical issues.');
      break;
  }
};
```

---

## Integration with React Components

### Using RouteAnalysisPanel
```javascript
import { RouteAnalysisPanel } from './components/RouteAnalysisPanel';

function MyComponent() {
  const [showAnalysis, setShowAnalysis] = useState(false);

  return (
    <>
      <button onClick={() => setShowAnalysis(true)}>
        View Route Analysis
      </button>

      {showAnalysis && (
        <RouteAnalysisPanel
          trajectoryData={trajectoryData}
          constraints={constraints}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </>
  );
}
```

### Using FieldOverlay with Analysis
```javascript
import { FieldOverlay } from './components/FieldOverlay';

<FieldOverlay
  trajectoryData={trajectoryData}
  violations={violations}
  analysisData={routeAnalysis}  // Pass analysis results
/>
```

---

## Performance Considerations

### Time Complexity
- **analyzeRouteForProblems**: O(n) where n = number of waypoints
- **detectPointProblems**: O(n) in worst case (checks previous points)
- Overall: O(n²) worst case, O(n) typical case

### Optimization Tips
1. Use `React.useMemo()` to cache analysis results
2. Only re-analyze when trajectory or constraints change
3. Avoid calling analysis functions in render methods
4. Consider debouncing if analysis is triggered by frequent changes

**Example**:
```javascript
const analysis = React.useMemo(() => {
  return analyzeRouteForProblems(trajectoryData, constraints);
}, [trajectoryData, constraints]);
```

---

## Error Handling

### Input Validation
```javascript
// analyzeRouteForProblems handles these cases:
// - trajectoryData is null or empty → returns null analysis
// - constraints values are missing → uses undefined (falsy) in comparisons
// - individual points missing fields → defaults to 0

try {
  const analysis = analyzeRouteForProblems(data, constraints);
  if (!analysis) {
    console.log('No valid data to analyze');
  }
} catch (error) {
  console.error('Analysis error:', error);
}
```

---

## Extending the System

### Adding New Issue Types
1. Add detection logic in `detectPointProblems()`
2. Create issue object with `type`, `name`, `severity`
3. Add case handler in `generateSuggestions()`
4. Return suggestions with title, description, actions

**Example**:
```javascript
// In detectPointProblems()
const customIssue = {
  type: 'custom_issue',
  name: 'Custom Issue Detected',
  severity: 'warning',
  customValue: someValue
};
issues.push(customIssue);

// In generateSuggestions()
case 'custom_issue':
  suggestions.push({
    title: 'Fix Custom Issue',
    description: 'Description of the issue',
    actions: ['Action 1', 'Action 2']
  });
  break;
```

### Custom Constraint Checking
```javascript
// Extend detectPointProblems with custom logic
if (myCustomCondition) {
  issues.push({
    type: 'custom_violation',
    name: 'Custom Violation',
    severity: 'warning'
  });
}
```

---

## API Reference Summary

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `analyzeRouteForProblems` | Main analysis | trajectory, constraints | AnalysisObject |
| `detectPointProblems` | Point analysis | point, index, data, constraints | IssueArray |
| `generateSuggestions` | Get recommendations | point, index, data, issues | SuggestionArray |
| `calculatePathStatistics` | Path metrics | trajectory | StatsObject |

---

## Troubleshooting

**Analysis not detecting issues?**
- Verify constraint values are correct
- Check trajectory data is properly formatted
- Ensure point calculations (accel, jerk) are populated

**Suggestions seem generic?**
- Review issue type detection in `detectPointProblems()`
- Suggestions are based on issue types; improve detection for better suggestions

**Performance issues?**
- Memoize analysis results with `React.useMemo()`
- Batch analyses if processing multiple trajectories
- Consider sampling large trajectories

---

For questions or improvements, check the main README or contact the development team.
