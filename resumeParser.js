const fs = require("fs");
const pdfParse = require("pdf-parse");

let resumeText = "";

async function loadResume() {
  const dataBuffer = fs.readFileSync("resume.pdf");
  const data = await pdfParse(dataBuffer);
  resumeText = data.text;
}

function queryResume(question) {
  // Simple Q&A with keyword matching (basic for now)
  const q = question.toLowerCase();
  if (q.includes("last position")) {
    const match = resumeText.match(/(?:at|for)\s+([A-Za-z0-9 ,.&]+)/);
    return match ? `Your last position was at ${match[1]}` : "Couldn't find last position.";
  }
  if (q.includes("skills")) {
    const match = resumeText.match(/skills[:\s]+([A-Za-z0-9, .]+)/i);
    return match ? `Skills: ${match[1]}` : "Couldn't find skills.";
  }
  if (q.includes("education")) {
    const match = resumeText.match(/education[:\s]+([A-Za-z0-9, .\-\n]+)/i);
    return match ? `Education: ${match[1].replace(/\n/g, ' ')}` : "Couldn't find education.";
  }
  if (q.includes("experience")) {
    const match = resumeText.match(/experience[:\s]+([A-Za-z0-9, .\-\n]+)/i);
    return match ? `Experience: ${match[1].replace(/\n/g, ' ')}` : "Couldn't find experience.";
  }
  if (q.includes("certification")) {
    const match = resumeText.match(/certifications?[:\s]+([A-Za-z0-9, .\-\n]+)/i);
    return match ? `Certifications: ${match[1].replace(/\n/g, ' ')}` : "Couldn't find certifications.";
  }
  if (q.includes("email")) {
    const match = resumeText.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    return match ? `Email: ${match[0]}` : "Couldn't find email address.";
  }
  return "Sorry, I can't answer that yet.";
}

module.exports = { loadResume, queryResume };
