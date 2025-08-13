// puppeteer-export.js
// Usage: node puppeteer-export.js
// This script generates a PDF from an HTML file using Puppeteer, with Google Fonts for Bengali/Arabic/English rendering.

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

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
    .question { margin-bottom: 1em; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <h1>Quiz Result Report</h1>
  <div class="section">
    <div class="label">Quiz:</div>
    <div class="bangla">বাংলা প্রশ্ন</div>
    <div class="arabic">سؤال عربي</div>
    <div class="english">English Question</div>
    <div>Score: 100%</div>
    <div>Correct Answers: 4/4</div>
    <div>Time Taken: 0 minutes</div>
    <div>Completion Date: 8/7/2025</div>
  </div>
  <div class="section">
    <div class="label">Questions and Answers:</div>
    <div class="question">
      <div class="label">Question 1 (Bangla):</div>
      <div class="bangla">আপনার উত্তর: বাংলা টেক্সট</div>
      <div class="bangla">সঠিক উত্তর: বাংলা টেক্সট</div>
    </div>
    <div class="question">
      <div class="label">Question 2 (Arabic):</div>
      <div class="arabic">إجابتك: نص عربي</div>
      <div class="arabic">الإجابة الصحيحة: نص عربي</div>
    </div>
    <div class="question">
      <div class="label">Question 3 (English):</div>
      <div class="english">Your Answer: English text</div>
      <div class="english">Correct Answer: English text</div>
    </div>
  </div>
</body>
</html>
`;

const outputHtmlPath = path.join(__dirname, 'quiz-result.html');
const outputPdfPath = path.join(__dirname, 'quiz-result.pdf');

fs.writeFileSync(outputHtmlPath, htmlTemplate, 'utf8');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + outputHtmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPdfPath, format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF generated:', outputPdfPath);
})();
