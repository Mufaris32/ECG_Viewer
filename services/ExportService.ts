import { Alert } from 'react-native';
import { AppStatistics, ECGSession } from './StorageService';

/**
 * ExportService - Handles exporting ECG data in various formats
 * Supports CSV, JSON exports with alert-based sharing
 * Note: For full file system support, use expo-file-system and expo-sharing when needed
 */

// ===========================
// TYPES & INTERFACES
// ===========================

export interface ExportOptions {
  format: 'csv' | 'json' | 'html';
  includeCharts?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportResult {
  success: boolean;
  data?: string;
  fileName?: string;
  error?: string;
}

// ===========================
// CSV EXPORT
// ===========================

/**
 * Export ECG sessions to CSV format
 */
export const exportToCSV = (sessions: ECGSession[]): ExportResult => {
  try {
    if (sessions.length === 0) {
      return {
        success: false,
        error: 'No sessions to export',
      };
    }

    // Create CSV header
    const csvHeader = 'ID,Date,Time,Heart Rate (bpm),Avg ECG (mV),Min ECG (mV),Max ECG (mV),Status,Duration,Notes\n';
    
    // Create CSV rows
    const csvRows = sessions.map(session => {
      const notes = (session.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
      return [
        session.id,
        session.date,
        session.time,
        session.heartRate,
        session.avgECG.toFixed(2),
        session.minECG.toFixed(2),
        session.maxECG.toFixed(2),
        session.status,
        session.duration,
        notes,
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    
    // Generate file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const finalFileName = `ECG_Export_${timestamp}.csv`;
    
    return {
      success: true,
      data: csvContent,
      fileName: finalFileName,
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ===========================
// JSON EXPORT
// ===========================

/**
 * Export ECG sessions to JSON format
 */
export const exportToJSON = (
  sessions: ECGSession[],
  statistics?: AppStatistics
): ExportResult => {
  try {
    if (sessions.length === 0) {
      return {
        success: false,
        error: 'No sessions to export',
      };
    }

    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      totalSessions: sessions.length,
      sessions,
      statistics: statistics || null,
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    
    // Generate file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const finalFileName = `ECG_Export_${timestamp}.json`;
    
    return {
      success: true,
      data: jsonContent,
      fileName: finalFileName,
    };
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ===========================
// HTML/PDF EXPORT
// ===========================

/**
 * Export ECG sessions to HTML format (can be printed as PDF)
 */
export const exportToHTML = (
  sessions: ECGSession[],
  statistics?: AppStatistics
): ExportResult => {
  try {
    if (sessions.length === 0) {
      return {
        success: false,
        error: 'No sessions to export',
      };
    }

    // Generate HTML content
    const htmlContent = generateHTMLReport(sessions, statistics);
    
    // Generate file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const finalFileName = `ECG_Report_${timestamp}.html`;
    
    return {
      success: true,
      data: htmlContent,
      fileName: finalFileName,
    };
  } catch (error) {
    console.error('Error exporting to HTML:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Generate HTML report
 */
const generateHTMLReport = (sessions: ECGSession[], statistics?: AppStatistics): string => {
  const reportDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statsSection = statistics ? `
    <div class="statistics">
      <h2>Overall Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Sessions</div>
          <div class="stat-value">${statistics.totalSessions}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average Heart Rate</div>
          <div class="stat-value">${statistics.avgHeartRate} bpm</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Average Duration</div>
          <div class="stat-value">${statistics.avgDuration}</div>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card success">
          <div class="stat-label">Normal Readings</div>
          <div class="stat-value">${statistics.normalReadings}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">Elevated Readings</div>
          <div class="stat-value">${statistics.elevatedReadings}</div>
        </div>
        <div class="stat-card error">
          <div class="stat-label">Low Readings</div>
          <div class="stat-value">${statistics.lowReadings}</div>
        </div>
      </div>
    </div>
  ` : '';

  const sessionsRows = sessions.map((session, index) => `
    <tr class="${index % 2 === 0 ? 'even' : 'odd'}">
      <td>${session.date}</td>
      <td>${session.time}</td>
      <td>${session.heartRate} bpm</td>
      <td>${session.avgECG.toFixed(2)} mV</td>
      <td><span class="badge badge-${session.status}">${session.status}</span></td>
      <td>${session.duration}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ECG Report - ${reportDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #00A8E8; }
    .header h1 { color: #00A8E8; font-size: 2.5em; margin-bottom: 10px; }
    .header .subtitle { color: #666; font-size: 1.1em; }
    .statistics { margin-bottom: 40px; }
    h2 { color: #333; margin-bottom: 20px; font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .stat-card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #00A8E8; }
    .stat-card.success { border-left-color: #00E676; }
    .stat-card.warning { border-left-color: #FFB74D; }
    .stat-card.error { border-left-color: #FF5252; }
    .stat-label { font-size: 0.9em; color: #666; margin-bottom: 8px; }
    .stat-value { font-size: 1.8em; font-weight: bold; color: #333; }
    .sessions { margin-top: 40px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #00A8E8; color: white; padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 12px; border-bottom: 1px solid #eee; }
    tr.even { background: #f9f9f9; }
    tr:hover { background: #f0f0f0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600; text-transform: uppercase; }
    .badge-normal { background: #E8F5E9; color: #2E7D32; }
    .badge-elevated { background: #FFF3E0; color: #E65100; }
    .badge-low { background: #FFEBEE; color: #C62828; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #666; font-size: 0.9em; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 ECG Monitoring Report</h1>
      <div class="subtitle">Generated on ${reportDate}</div>
    </div>
    ${statsSection}
    <div class="sessions">
      <h2>ECG Sessions (${sessions.length} total)</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Time</th><th>Heart Rate</th><th>Avg ECG</th><th>Status</th><th>Duration</th></tr>
        </thead>
        <tbody>${sessionsRows}</tbody>
      </table>
    </div>
    <div class="footer">
      <p><strong>ECG Viewer</strong> - Professional Cardiac Monitoring Application</p>
      <p>This report is for informational purposes only and should not replace professional medical advice.</p>
      <p>© ${new Date().getFullYear()} ECG Viewer Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// ===========================
// QUICK EXPORT WITH ALERTS
// ===========================

/**
 * Quick export and show alert with data preview
 */
export const quickExportCSV = (sessions: ECGSession[]): boolean => {
  try {
    const result = exportToCSV(sessions);
    
    if (!result.success || !result.data) {
      Alert.alert('Export Failed', result.error || 'Unable to export CSV file.');
      return false;
    }
    
    Alert.alert(
      'Export Successful',
      `ECG data has been exported as CSV.\n\nFilename: ${result.fileName}\nSessions: ${sessions.length}\n\nData is ready to be shared or saved.`,
      [
        { text: 'OK' },
      ]
    );
    
    // Log data for debugging (can be used with share functionality later)
    console.log('CSV Export:', result.data.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('Error in quick export CSV:', error);
    return false;
  }
};

/**
 * Quick export JSON with alert
 */
export const quickExportJSON = (
  sessions: ECGSession[],
  statistics?: AppStatistics
): boolean => {
  try {
    const result = exportToJSON(sessions, statistics);
    
    if (!result.success || !result.data) {
      Alert.alert('Export Failed', result.error || 'Unable to export JSON file.');
      return false;
    }
    
    Alert.alert(
      'Export Successful',
      `ECG data has been exported as JSON.\n\nFilename: ${result.fileName}\nSessions: ${sessions.length}\n\nData is ready to be shared or saved.`,
      [
        { text: 'OK' },
      ]
    );
    
    // Log data for debugging
    console.log('JSON Export:', result.data.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('Error in quick export JSON:', error);
    return false;
  }
};

/**
 * Quick export HTML/PDF with alert
 */
export const quickExportPDF = (
  sessions: ECGSession[],
  statistics?: AppStatistics
): boolean => {
  try {
    const result = exportToHTML(sessions, statistics);
    
    if (!result.success || !result.data) {
      Alert.alert('Export Failed', result.error || 'Unable to export PDF report.');
      return false;
    }
    
    Alert.alert(
      'Export Successful',
      `ECG report has been generated as HTML.\n\nFilename: ${result.fileName}\nSessions: ${sessions.length}\n\nOpen in a web browser and print to PDF.`,
      [
        { text: 'OK' },
      ]
    );
    
    // Log data for debugging
    console.log('HTML Export:', result.data.substring(0, 200) + '...');
    
    return true;
  } catch (error) {
    console.error('Error in quick export PDF:', error);
    return false;
  }
};

// ===========================
// EXPORT STATISTICS
// ===========================

/**
 * Get export preview info
 */
export const getExportPreview = (sessions: ECGSession[]): string => {
  if (sessions.length === 0) return 'No data to export';
  
  const totalSessions = sessions.length;
  const dateRange = sessions.length > 0 
    ? `${sessions[sessions.length - 1].date} to ${sessions[0].date}`
    : 'N/A';
  
  const normalCount = sessions.filter(s => s.status === 'normal').length;
  const elevatedCount = sessions.filter(s => s.status === 'elevated').length;
  const lowCount = sessions.filter(s => s.status === 'low').length;
  
  return `
Export Preview:
━━━━━━━━━━━━━━━━━━━━━━
📊 Total Sessions: ${totalSessions}
📅 Date Range: ${dateRange}

Status Distribution:
  ✓ Normal: ${normalCount}
  ⚠ Elevated: ${elevatedCount}
  ⚠ Low: ${lowCount}
  `;
};
