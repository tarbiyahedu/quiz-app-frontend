// convert-font-to-base64.js
// Usage: node convert-font-to-base64.js
// Converts TTF font files to base64 and saves as .base64.txt in public/font/

const fs = require('fs');
const path = require('path');

const fonts = [
  {
    name: 'HindSiliguri-Regular',
    filePath: path.join(__dirname, 'public/font/Hind_Siliguri/HindSiliguri-Regular.ttf'),
    outputFile: 'HindSiliguri-Regular.base64.txt',
  },
  {
    name: 'Amiri-Regular',
    filePath: path.join(__dirname, 'public/font/Amiri/Amiri-Regular.ttf'),
    outputFile: 'Amiri-Regular.base64.txt',
  },
];

fonts.forEach(font => {
  if (!fs.existsSync(font.filePath)) {
    console.error(`Font file not found: ${font.filePath}`);
    return;
  }
  const fontData = fs.readFileSync(font.filePath);
  const base64Font = fontData.toString('base64');
  fs.writeFileSync(path.join(__dirname, 'public/font', font.outputFile), base64Font, 'utf8');
  console.log(`Created: public/font/${font.outputFile}`);
});
