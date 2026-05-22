const { Groq } = require('groq-sdk');

const apiKey = process.env.GROK_API_KEY;
const client = new Groq({ apiKey });

const SYSTEM_PROMPT = `You are a helpful career assistant for students applying for jobs, internships, and mentorships. Use the student's department, year, skills and career goals to give actionable, concise advice. Keep responses professional, easy to read, and focused on next steps.`;

function buildStudentProfile(student) {
  const profileLines = [];
  if (student?.name) profileLines.push(`Name: ${student.name}`);
  if (student?.email) profileLines.push(`Email: ${student.email}`);
  if (student?.studentProfile?.department) profileLines.push(`Department: ${student.studentProfile.department}`);
  if (student?.studentProfile?.currentYear) profileLines.push(`Year: ${student.studentProfile.currentYear}`);
  if (student?.studentProfile?.skills?.length) profileLines.push(`Skills: ${student.studentProfile.skills.join(', ')}`);
  if (student?.studentProfile?.careerGoal) profileLines.push(`Career goal: ${student.studentProfile.careerGoal}`);
  if (student?.studentProfile?.resumeUrl) profileLines.push(`Resume: ${student.studentProfile.resumeUrl}`);
  if (student?.studentProfile?.linkedinUrl) profileLines.push(`LinkedIn: ${student.studentProfile.linkedinUrl}`);
  return profileLines.join('\n');
}

async function askCareerAssistant({ prompt, student }) {
  if (!apiKey) throw new Error('GROK_API_KEY is not configured');
  if (!prompt || !prompt.trim()) throw new Error('Prompt is required');

  const profile = buildStudentProfile(student);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Student profile:\n${profile || 'No additional profile details available.'}\n\nQuestion:\n${prompt}` },
  ];

  const completion = await client.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages,
    max_tokens: 600,
    temperature: 0.7,
  });

  const message = completion?.choices?.[0]?.message?.content;
  return message?.trim() || 'I could not generate a response. Please try again.';
}

module.exports = { askCareerAssistant };
