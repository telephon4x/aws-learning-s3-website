# AWS Learning S3 Website

This project is a study hub for preparing for the **AWS Certified Solutions Architect – Associate exam**.  
It is built as a static website hosted on **Amazon S3** with **CloudFront** distribution for delivery.

The site provides interactive tools to help users practice and reinforce AWS knowledge.

---

## Features

### 1. Home Page (`index.html`)
- Landing page that connects users to the main study tools.  
- Simple navigation to Referral Topics, Flashcards, Practice Exams, and Blitz Mode.

### 2. Referral Topics (`referral.html`)
- Organized links to the 20 core topics of the AWS Solutions Architect Associate exam.  
- Each card links to external AWS documentation or study resources.  
- Responsive grid layout for desktop and mobile.

### 3. Flashcards (`learning.html`)
- Four AWS domains represented:  
  - Domain 1: Security  
  - Domain 2: Reliability  
  - Domain 3: Performance  
  - Domain 4: Cost Optimization  
- Flashcards are dynamically pulled from JSON (`securityQA.json`, `reliabilityQA.json`, `performanceQA.json`, `costQA.json`).  
- Flip animation reveals answers.  
- Navigation buttons allow stepping through questions.

### 4. Practice Exams (`practice.html`)
- Full-length exam simulation with **65 questions** (50 graded, 15 ungraded).  
- Two modes:  
  - **Timed Exam**: mimics real exam conditions.  
  - **Untimed Exam**: focus on learning without a countdown.  
- Questions and answers pulled dynamically from `examQA.json`.  
- Selected answers persist while navigating forward and backward.  
- End-of-exam grading with explanations (when available).

### 5. Blitz Mode (`blitzmode.html`)
- A focused study feature that randomly selects **10 questions** across all AWS domains.  
- Provides instant feedback and explanations where available.  
- Designed for short, high-focus practice sessions.  
- Uses `blitz.js` and integrates seamlessly into the site navigation.

### 6. Deployment
- Static assets deployed to Amazon S3: `aws-learning-s3-website-telephon4x-001`.  
- Deployment automated via `deploy.sh`.  
- CloudFront invalidation ensures immediate cache refresh after updates.  
- AWS CLI used for S3 uploads and invalidations.

---

## Project Structure

```bash
aws-learning-s3-website/
├── index.html         # Home page
├── referral.html      # Referral Topics page
├── learning.html      # Flashcards
├── practice.html      # Practice Exams
├── blitzmode.html     # Blitz Mode page
├── style.css          # Main styling
├── flashcards.js      # Flashcards logic
├── exam.js            # Practice exam logic
├── blitz.js           # Blitz Mode logic
├── data/              # JSON storage
│   ├── securityQA.json
│   ├── reliabilityQA.json
│   ├── performanceQA.json
│   ├── costQA.json
│   └── examQA.json
├── deploy.sh          # Deployment script (S3 upload + CloudFront invalidation)
└── README.md          # Project documentation
```

