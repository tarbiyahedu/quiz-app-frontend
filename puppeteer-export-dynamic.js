// puppeteer-export-dynamic.js
// Usage: node puppeteer-export-dynamic.js <quizId>
// This script generates a PDF from dynamic quiz data using Puppeteer and Google Fonts.

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Load quiz data from a JSON file (simulate API response)
// You can replace this with a real API call if needed
const quizId = process.argv[2] || 'sample';
const quizDataPath = path.join(__dirname, `quiz-result-${quizId}.json`);
if (!fs.existsSync(quizDataPath)) {
  console.error('Quiz data file not found:', quizDataPath);
  process.exit(1);
}
const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf8'));

function detectScript(text) {
  if (/[ঀ-৾]/.test(text)) return 'bangla';
  if (/[ء-ي]/.test(text)) return 'arabic';
  return 'english';
}

function fontClass(text) {
  const script = detectScript(text);
  if (script === 'bangla') return 'bangla';
  if (script === 'arabic') return 'arabic';
  return 'english';
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Build HTML dynamically
let htmlQuestions = '';
quizData.answers.forEach((answer, idx) => {
  htmlQuestions += `
    <div class="question">
      <div class="label">Question ${idx + 1}:</div>
      <div class="${fontClass(answer.questionText)}">${escapeHtml(answer.questionText)}</div>
      <div class="label">Type:</div>
      <div class="${fontClass(answer.questionType)}">${escapeHtml(answer.questionType)}</div>
      <div class="label">Your Answer:</div>
      <div class="${fontClass(answer.userAnswer)}">${escapeHtml(answer.userAnswer)}</div>
      <div class="label">Correct Answer:</div>
      <div class="${fontClass(answer.correctAnswer)}">${escapeHtml(answer.correctAnswer)}</div>
      <div class="label">Score:</div>
      <div>${answer.score}/${answer.marks}</div>
      <div class="${answer.isCorrect ? 'correct' : 'incorrect'}">${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
    </div>
  `;
});

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quiz Result PDF</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Hind+Siliguri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: Arial, Hind Siliguri, Amiri, sans-serif; }
    .bangla { font-family: 'Hind Siliguri', Arial, sans-serif; }
    .arabic { font-family: 'Amiri', Arial, sans-serif; }
    .english { font-family: Arial, sans-serif; }
    h1 { font-size: 2em; font-weight: bold; }
    .section { margin-bottom: 2em; }
    .question { margin-bottom: 1em; border-bottom: 1px solid #ccc; padding-bottom: 1em; }
    .label { font-weight: bold; margin-top: 0.5em; }
    .correct { color: green; font-weight: bold; }
    .incorrect { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Quiz Result Report</h1>
  <div class="section">
    <div class="label">Quiz:</div>
    <div class="${fontClass(quizData.title)}">${escapeHtml(quizData.title)}</div>
    <div class="${fontClass(String(quizData.score))}">Score: ${escapeHtml(String(quizData.score))}%</div>
    <div class="${fontClass(String(quizData.correctAnswers))}">Correct Answers: ${escapeHtml(String(quizData.correctAnswers))}/${escapeHtml(String(quizData.totalQuestions))}</div>
    <div class="${fontClass(String(quizData.timeTaken))}">Time Taken: ${escapeHtml(String(quizData.timeTaken))} minutes</div>
    <div class="${fontClass(new Date(quizData.completionDate).toLocaleDateString())}">Completion Date: ${escapeHtml(new Date(quizData.completionDate).toLocaleDateString())}</div>
  </div>
  <div class="section">
    <div class="label">Questions and Answers:</div>
    ${htmlQuestions}
  </div>
</body>
</html>
`;

const outputHtmlPath = path.join(__dirname, `quiz-result-${quizId}.html`);
const outputPdfPath = path.join(__dirname, `quiz-result-${quizId}.pdf`);

fs.writeFileSync(outputHtmlPath, htmlTemplate, 'utf8');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + outputHtmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPdfPath, format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF generated:', outputPdfPath);
})();
