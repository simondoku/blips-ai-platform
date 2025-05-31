# Amazon S3 Integration Guide for Blips Platform

This guide will walk you through setting up Amazon S3 storage for your Blips Platform.

## Prerequisites

1. An AWS account
2. Node.js and npm installed
3. The Blips Platform already set up locally

## Step 1: Create an S3 Bucket

1. Log in to the [AWS Console](https://console.aws.amazon.com/)
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `your-blips-bucket-name`)
5. Select your preferred AWS region (e.g., `us-east-1`)
6. **Important**: Keep "Block all public access" checked for security
7. Enable versioning (optional but recommended)
8. Click "Create bucket"

## Step 2: Create IAM User and Permissions

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Create user"
3. Enter username (e.g., `blips-s3-user`)
4. Click "Next"
5. In the "Set permissions" step, you have three options:
   - **Option A**: Select "Attach policies directly" (if available)
   - **Option B**: Select "Add user to group" and create a new group
   - **Option C**: Select "Copy permissions" from an existing user

**For Option A or B**, you'll need to create a custom policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-blips-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::your-blips-bucket-name"
    }
  ]
}
```

### If you chose "Add user to group":

1. Click "Create group"
2. Enter group name (e.g., `blips-s3-group`)
3. Click "Create policy" to create the custom policy above
4. Search for and select your newly created policy
5. Create the group and add your user to it

### If you chose "Attach policies directly":

1. Click "Create policy"
2. Switch to the JSON tab
3. Paste the policy JSON above
4. Replace `your-blips-bucket-name` with your actual bucket name
5. Review and create the policy
6. Go back to user creation and attach this policy

### Alternative: Use AWS Managed Policies (Less Secure)

If you want a quicker setup for testing, you can use:

- `AmazonS3FullAccess` (gives access to ALL S3 buckets - not recommended for production)

**Important**: Always replace `your-blips-bucket-name` with your actual bucket name in the policy!

7. Create the user and **save the Access Key ID and Secret Access Key**

**Note**: After creating the user, you'll need to create access keys:

1. Click on the newly created user
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Choose "Application running on an AWS compute service" or "Other"
5. **Important**: Download and save the Access Key ID and Secret Access Key immediately

## Step 3: Configure Environment Variables

1. Copy your `.env.example` to `.env` in the server directory:

```bash
cp server/.env.example server/.env
```

2. Update your `.env` file with S3 configuration:

```bash
# Storage Configuration
STORAGE_TYPE=s3

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-blips-bucket-name
```

## Step 4: Test the Configuration

1. Start your server:

```bash
cd server
npm run dev
```

2. Try uploading a video through the platform
3. Check your S3 bucket to verify files are being uploaded

## Step 5: CORS Configuration (if needed)

If you encounter CORS issues, add this policy to your S3 bucket:

1. Go to your S3 bucket → Permissions → CORS
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173",
      "your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

## Step 6: Production Deployment

For production, consider:

1. **CloudFront CDN**: Set up CloudFront distribution for faster video delivery
2. **Lifecycle Policies**: Configure automatic deletion/archival of old files
3. **Monitoring**: Set up CloudWatch for monitoring S3 usage
4. **Backup**: Enable cross-region replication for backups

## Switching Between Local and S3 Storage

You can easily switch between local and S3 storage by changing the `STORAGE_TYPE` environment variable:

- Local storage: `STORAGE_TYPE=local`
- S3 storage: `STORAGE_TYPE=s3`

## Troubleshooting

### Common Issues:

1. **Access Denied**: Check IAM permissions and bucket policies
2. **Region Mismatch**: Ensure AWS_REGION matches your bucket region
3. **Large File Uploads**: Increase upload limits in your nginx/server configuration
4. **CORS Errors**: Configure CORS policy in S3 bucket settings

### Useful Commands:

```bash
# Test AWS credentials
aws s3 ls s3://your-bucket-name

# Check bucket region
aws s3api get-bucket-location --bucket your-bucket-name

# List bucket contents
aws s3 ls s3://your-bucket-name --recursive
```

## Cost Optimization

- Use S3 Intelligent Tiering for automatic cost optimization
- Set up lifecycle policies to move old files to cheaper storage classes
- Monitor usage with AWS Cost Explorer

## Security Best Practices

1. Never commit AWS credentials to version control
2. Use IAM roles when deploying to AWS services
3. Enable CloudTrail for API logging
4. Regularly rotate access keys
5. Use least privilege principle for IAM permissions

## Next Steps

Once S3 is configured, you can:

1. Set up CloudFront for CDN
2. Implement video transcoding with AWS MediaConvert
3. Add video thumbnails generation with AWS Lambda
4. Set up automated backups with S3 Cross-Region Replication
