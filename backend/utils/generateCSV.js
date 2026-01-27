const generateCSV = (worklogs) => {
  // CSV Header
  const headers = ['Date', 'From Time', 'To Time', 'Duration (min)', 'Activity'];
  
  // CSV Rows
  const rows = worklogs.map((log) => [
    log.date,
    log.fromTime,
    log.toTime,
    log.durationMinutes,
    // Escape quotes in activity and wrap in quotes
    `"${log.activity.replace(/"/g, '""')}"`,
  ]);
  
  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
  
  return csvContent;
};

export default generateCSV;
