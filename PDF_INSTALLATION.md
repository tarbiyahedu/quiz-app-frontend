# PDF Download Feature Installation

This document explains how to install the required libraries for the PDF download functionality in the result details page.

## Required Libraries

The PDF download feature requires two libraries:
- `jspdf`: For generating PDF documents
- `html2canvas`: For converting HTML elements to canvas (used for better PDF formatting)

## Installation

Run the following command in the `quiz-app-frontend` directory:

```bash
npm install jspdf html2canvas
```

Or if you're using pnpm:

```bash
pnpm add jspdf html2canvas
```

## Features Implemented

### 1. View Details Button
- Added to each quiz card in the Recent Results section
- Opens a modal with detailed quiz results

### 2. Result Details Modal
- Shows all questions and answers
- Displays correct answers and user answers
- Shows marks obtained for each question
- Includes performance summary

### 3. PDF Download
- Generates a comprehensive PDF report
- Includes quiz information, questions, answers, and scores
- Automatically formats content for PDF
- Uses proper styling and layout

## Usage

1. Go to the Results page (`/result`)
2. Click "View Details" on any quiz card
3. Review the detailed results in the modal
4. Click "Download PDF" to save the report as a PDF file

## Backend API

The feature uses the existing backend endpoint:
- `GET /api/live-quiz-answers/completed/:quizId`

This endpoint returns:
- Quiz details
- All questions with correct answers
- User's answers and scores
- Performance metrics

## Troubleshooting

If you see an error "PDF libraries not installed", run the installation command above.

If you encounter any issues with PDF generation, check the browser console for detailed error messages. 