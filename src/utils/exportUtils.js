// Export utilities for generating reports

export function exportToJSON(trajectoryData, violations, constraints) {
    const report = {
        timestamp: new Date().toISOString(),
        constraints: constraints,
        summary: {
            totalPoints: trajectoryData.length,
            totalTime: trajectoryData.length > 0 
                ? (trajectoryData[trajectoryData.length - 1].time || 0) - (trajectoryData[0].time || 0)
                : 0,
            errorCount: violations.filter(v => v.severity === 'error').length,
            warningCount: violations.filter(v => v.severity === 'warning').length
        },
        violations: violations,
        trajectory: trajectoryData.map(p => ({
            time: p.time,
            x: p.x,
            y: p.y,
            velocity: p.velocity,
            acceleration: p.calculatedAccel || p.acceleration,
            curvature: p.curvature
        }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportToText(trajectoryData, violations, constraints) {
    let text = 'AUTO PATH VALIDATOR REPORT\n';
    text += '='.repeat(50) + '\n\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    text += 'CONSTRAINTS\n';
    text += '-'.repeat(50) + '\n';
    text += `Max Velocity: ${constraints.maxVelocity} m/s\n`;
    text += `Max Acceleration: ${constraints.maxAcceleration} m/s²\n`;
    text += `Max Jerk: ${constraints.maxJerk} m/s³\n`;
    text += `Max Centripetal: ${constraints.maxCentripetal} m/s²\n\n`;

    text += 'SUMMARY\n';
    text += '-'.repeat(50) + '\n';
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warningCount = violations.filter(v => v.severity === 'warning').length;
    text += `Total Points: ${trajectoryData.length}\n`;
    text += `Errors: ${errorCount}\n`;
    text += `Warnings: ${warningCount}\n\n`;

    text += 'VIOLATIONS\n';
    text += '='.repeat(50) + '\n';
    violations.forEach((v, i) => {
        text += `\n${i + 1}. ${v.type} [${v.severity.toUpperCase()}]\n`;
        text += `   ${v.message}\n`;
        if (v.location) text += `   Location: ${v.location}\n`;
        if (v.suggestion) text += `   Suggestion: ${v.suggestion}\n`;
        if (v.impact) text += `   Impact: ${v.impact}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Simple PDF-like export using canvas (basic implementation)
export function exportToPDF(trajectoryData, violations, constraints) {
    // For a full PDF export, you'd want to use jsPDF library
    // This is a simplified version that creates a printable HTML page
    const printWindow = window.open('', '_blank');
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Path Analysis Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .section { margin: 20px 0; }
                .violation { margin: 10px 0; padding: 10px; border-left: 4px solid #ccc; }
                .error { border-color: #ef4444; }
                .warning { border-color: #f59e0b; }
                .success { border-color: #10b981; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <h1>Auto Path Validator Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            
            <div class="section">
                <h2>Constraints</h2>
                <table>
                    <tr><th>Parameter</th><th>Value</th></tr>
                    <tr><td>Max Velocity</td><td>${constraints.maxVelocity} m/s</td></tr>
                    <tr><td>Max Acceleration</td><td>${constraints.maxAcceleration} m/s²</td></tr>
                    <tr><td>Max Jerk</td><td>${constraints.maxJerk} m/s³</td></tr>
                    <tr><td>Max Centripetal</td><td>${constraints.maxCentripetal} m/s²</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>Summary</h2>
                <p>Total Points: ${trajectoryData.length}</p>
                <p>Errors: ${violations.filter(v => v.severity === 'error').length}</p>
                <p>Warnings: ${violations.filter(v => v.severity === 'warning').length}</p>
            </div>

            <div class="section">
                <h2>Violations</h2>
                ${violations.map((v, i) => `
                    <div class="violation ${v.severity}">
                        <h3>${i + 1}. ${v.type}</h3>
                        <p>${v.message}</p>
                        ${v.location ? `<p><strong>Location:</strong> ${v.location}</p>` : ''}
                        ${v.suggestion ? `<p><strong>Suggestion:</strong> ${v.suggestion}</p>` : ''}
                        ${v.impact ? `<p><strong>Impact:</strong> ${v.impact}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

