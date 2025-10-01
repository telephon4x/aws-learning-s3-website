AWS Learning S3 Website

This project is a study hub for preparing for the AWS Certified Solutions Architect – Associate exam. It is built as a static website hosted on Amazon S3 with CloudFront distribution for delivery. The site provides interactive tools to help practice and reinforce AWS knowledge.

⸻

Features

1. Home Page (index.html)
	•	Landing page that connects users to the main study tools.
	•	Simple navigation to Referral Topics, Flashcards, and Practice Exams.

2. Referral Topics (referral.html)
	•	Organized links to the 20 core topics covered in the Solutions Architect Associate exam.
	•	Each card links to external AWS documentation or study resources.
	•	Responsive grid layout for both desktop and mobile.

3. Flashcards (learning.html)
	•	Four domains represented:
	•	Domain 1: Security
	•	Domain 2: Reliability
	•	Domain 3: Performance
	•	Domain 4: Cost Optimization
	•	Flashcards are pulled dynamically from JSON files (securityQA.json, reliabilityQA.json, performanceQA.json, costQA.json).
	•	Each card supports flip animation to reveal answers.
	•	Navigation buttons allow stepping through questions one at a time.

4. Practice Exams (practice.html)
	•	Full-length exam simulation with 65 questions (50 graded, 15 ungraded).
	•	Two modes:
	•	Timed Exam: mimics real exam conditions.
	•	Untimed Exam: focus on learning without a countdown.
	•	Questions and answers pulled dynamically from examQA.json.
	•	Selected answers persist while navigating forward and backward.
	•	End-of-exam grading with explanations where available.

5. Deployment
	•	Static assets deployed to Amazon S3 bucket: aws-learning-s3-website-telephon4x-001.
	•	AWS CLI used for uploads (deploy.sh automates deployment).
	•	CloudFront invalidation used to ensure immediate cache refresh.

aws-learning-s3-website/
│
├── index.html          # Home page
├── referral.html       # Referral Topics page
├── learning.html       # Flashcards
├── practice.html       # Practice Exams
│
├── style.css           # Main styling for all pages
├── flashcards.js       # Logic for flashcards
├── exam.js             # Logic for practice exam
│
├── data/               # JSON data storage
│   ├── securityQA.json
│   ├── reliabilityQA.json
│   ├── performanceQA.json
│   ├── costQA.json
│   └── examQA.json
│
├── deploy.sh           # Deployment script (S3 upload + CloudFront invalidation)
└── README.md           # Project documentation
