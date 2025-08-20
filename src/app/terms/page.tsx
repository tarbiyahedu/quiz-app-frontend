import React from "react";

const TermsOfServicePage = () => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
    <p className="mb-4">These Terms of Service govern your use of the Quiz App. By accessing or using the app, you agree to these terms.</p>
    <h2 className="text-lg font-semibold mt-6 mb-2">Quiz Participation</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>Users must provide accurate information when registering or joining quizzes.</li>
      <li>Cheating, misuse, or manipulation of quiz results is strictly prohibited.</li>
      <li>Admins reserve the right to remove users or disqualify participants for violating rules.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Content & Intellectual Property</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>Quiz questions, results, and materials are the property of the Quiz App and its contributors.</li>
      <li>Users may not copy, distribute, or use quiz content for commercial purposes without permission.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Limitation of Liability</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>The Quiz App is provided "as is" without warranties of any kind.</li>
      <li>We are not liable for any damages resulting from quiz participation or use of the app.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Changes to Terms</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>We may update these Terms of Service at any time. Continued use of the app constitutes acceptance of changes.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
    <p>If you have any questions about these Terms, please contact the admin at support@quizapp.com.</p>
  </div>
);

export default TermsOfServicePage;
