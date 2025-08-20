import React from "react";

const PrivacyPolicyPage = () => (
  <div className="max-w-2xl mx-auto py-10 px-4">
    <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
    <p className="mb-4">This Privacy Policy explains how we collect, use, and protect your information when you use the Quiz App.</p>
    <h2 className="text-lg font-semibold mt-6 mb-2">Information Collection</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>We collect your name, email, and quiz participation data when you register or join a quiz.</li>
      <li>Guest users may provide their name and email to join public quizzes.</li>
      <li>We do not collect sensitive personal information unless required for quiz administration.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Use of Information</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>Your information is used to manage quiz participation, display leaderboards, and provide results.</li>
      <li>We may use your email to send quiz notifications and updates.</li>
      <li>We do not share your information with third parties except as required by law or for quiz functionality.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Data Security</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>We use industry-standard security measures to protect your data.</li>
      <li>Access to your data is restricted to authorized personnel only.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Children's Privacy</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>The Quiz App is intended for users above the age of 13. We do not knowingly collect data from children under 13.</li>
    </ul>
    <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
    <p>If you have any questions about this Privacy Policy, please contact the admin at support@quizapp.com.</p>
  </div>
);

export default PrivacyPolicyPage;
