# AWS Learning S3 Website

This is my first AWS practice project.  
The goal is to create a simple static website hosted in an S3 bucket while learning the basics of AWS security and storage.  
I will expand this project later to include more AWS services.

## S3 Bucket Setup

- Created a new S3 bucket named `aws-learning-s3-website-telephon4x-001` in region `us-east-2`.
- Uploaded `index.html` to the bucket using the AWS CLI.
- Verified the file exists in the bucket with `aws s3 ls`.
- Decided not to enable versioning to avoid additional costs.

## Static Website Hosting

- Enabled static website hosting for S3 bucket: `aws-learning-s3-website-telephon4x-001`
- Index document: `index.html`
- Website endpoint: http://aws-learning-s3-website-telephon4x-001.s3-website.us-east-2.amazonaws.com
