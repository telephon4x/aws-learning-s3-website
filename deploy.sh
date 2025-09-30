aws s3 sync . s3://aws-learning-s3-website-telephon4x-001 \
  --exclude ".git/*" --exclude ".gitignore" --exclude ".DS_Store" --exclude "*.md" --exclude ".sh"

aws cloudfront create-invalidation --distribution-id E2N00XX6UXFGP2 --paths "/*"
