// Age calculator with color coding
function calculateAge(birthdate, eventDate) {
  // Parse birthdate from DDMMYY format
  const day = parseInt(birthdate.substring(0, 2));
  const month = parseInt(birthdate.substring(2, 4)) - 1; // JS months are 0-indexed
  const yearShort = parseInt(birthdate.substring(4, 6));
  
  // Determine full year (assume 2000s for 00-25, 1900s for 26-99)
  const year = yearShort <= 25 ? 2000 + yearShort : 1900 + yearShort;
  
  const birthDate = new Date(year, month, day);
  const eventDateObj = new Date(eventDate);
  
  // Calculate age
  let age = eventDateObj.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDateObj.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && eventDateObj.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

function getAgeColor(age, colorRanges) {
  // colorRanges format: { "0-15": "#FF6B6B", "16-17": "#FFA500", "18+": "#4CAF50" }
  for (const [range, color] of Object.entries(colorRanges)) {
    if (range.includes('+')) {
      const minAge = parseInt(range.replace('+', ''));
      if (age >= minAge) return color;
    } else if (range.includes('-')) {
      const [min, max] = range.split('-').map(Number);
      if (age >= min && age <= max) return color;
    }
  }
  return '#808080'; // Default gray
}

function formatBirthdate(birthdate) {
  const day = birthdate.substring(0, 2);
  const month = birthdate.substring(2, 4);
  const yearShort = birthdate.substring(4, 6);
  const year = parseInt(yearShort) <= 25 ? `20${yearShort}` : `19${yearShort}`;
  
  return `${day}.${month}.${year}`;
}

module.exports = {
  calculateAge,
  getAgeColor,
  formatBirthdate
};
