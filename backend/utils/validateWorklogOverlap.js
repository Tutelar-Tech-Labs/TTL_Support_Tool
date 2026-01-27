import Worklog from '../models/mongo/Worklog.js';

const validateWorklogOverlap = async (userId, date, fromTime, toTime, excludeId = null) => {
  // Convert new times to minutes
  const [newFromH, newFromM] = fromTime.split(':').map(Number);
  const [newToH, newToM] = toTime.split(':').map(Number);
  const newStart = newFromH * 60 + newFromM;
  const newEnd = newToH * 60 + newToM;
  
  // Find existing worklogs for the user on that date
  const query = {
    userId,
    date,
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existingWorklogs = await Worklog.find(query);
  
  for (const log of existingWorklogs) {
    const [existFromH, existFromM] = log.fromTime.split(':').map(Number);
    const [existToH, existToM] = log.toTime.split(':').map(Number);
    
    const existStart = existFromH * 60 + existFromM;
    const existEnd = existToH * 60 + existToM;
    
    // Check for overlap
    // (StartA < EndB) and (EndA > StartB)
    if (newStart < existEnd && newEnd > existStart) {
      return {
        isValid: false,
        message: `Time overlaps with existing entry: ${log.fromTime} - ${log.toTime} (${log.activity})`,
      };
    }
  }
  
  return { isValid: true };
};

export default validateWorklogOverlap;
