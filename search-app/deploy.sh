#!/bin/bash

# Exit on error
set -e

# Load configuration
CONFIG_FILE="deploy.config.json"
AWS_PROFILE=$(jq -r '.aws.profile' "$CONFIG_FILE")
AWS_REGION=$(jq -r '.aws.region' "$CONFIG_FILE")
S3_BUCKET=$(jq -r '.aws.bucket' "$CONFIG_FILE")
VERSIONS_PATH=$(jq -r '.aws.paths.versions' "$CONFIG_FILE")
PUBLIC_PATH=$(jq -r '.aws.paths.public' "$CONFIG_FILE")
BROWSER_PATH="${PUBLIC_PATH}browser/"

# Set AWS profile
export AWS_PROFILE=$AWS_PROFILE

# Get version from package.json
VERSION=$(jq -r '.version' package.json)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_VERSION="${VERSION}-${TIMESTAMP}"

echo "Building version: $DEPLOY_VERSION"

# Build the application
echo "Building Angular application..."
npm run build

# Create version directory in S3
VERSION_DIR="${VERSIONS_PATH}${DEPLOY_VERSION}"
echo "Creating version directory: $VERSION_DIR"

# Upload build to versions directory
echo "Uploading build to versions directory..."
aws s3 sync dist/search-app "s3://${S3_BUCKET}/${VERSION_DIR}" \
    --region $AWS_REGION \
    --cache-control "max-age=31536000"

# Clean up public directory
echo "Cleaning up public browser directory..."
aws s3 rm "s3://${S3_BUCKET}/${BROWSER_PATH}" \
    --recursive \
    --region $AWS_REGION

# Upload to public directory (latest version)
echo "Uploading to public browser directory..."
aws s3 sync dist/search-app/browser "s3://${S3_BUCKET}/${BROWSER_PATH}" \
    --region $AWS_REGION \
    --cache-control "no-cache,no-store,must-revalidate"

# Upload license file separately
aws s3 cp dist/search-app/3rdpartylicenses.txt "s3://${S3_BUCKET}/${PUBLIC_PATH}3rdpartylicenses.txt" \
    --region $AWS_REGION \
    --cache-control "no-cache,no-store,must-revalidate"

# Verify deployment
echo "Verifying deployment..."

# Function to verify files in a path
verify_deployment() {
    local path=$1
    local description=$2
    echo "Verifying $description..."
    
    # List all files in S3 path
    aws s3 ls "s3://${S3_BUCKET}/${path}" --recursive --region $AWS_REGION > deployed_files.txt
    
    # Check if all expected files are present
    local missing_files=0
    local expected_files=(
        "index.html"
        "main-HZTFNSRQ.js"
        "polyfills-FFHMD2TL.js"
        "styles-5INURTSO.css"
        "favicon.ico"
    )
    
    for file in "${expected_files[@]}"; do
        if ! grep -q "$file" deployed_files.txt; then
            echo " Missing file: $file"
            missing_files=$((missing_files + 1))
        else
            echo " Found file: $file"
        fi
    done
    
    # Check file accessibility
    local url_base="https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${path}"
    if curl -s -I "${url_base}index.html" | grep -q "200 OK"; then
        echo " Index file is accessible"
    else
        echo " Index file is not accessible"
        missing_files=$((missing_files + 1))
    fi
    
    return $missing_files
}

# Verify both versioned and public deployments
verify_deployment "${VERSION_DIR}/browser/" "versioned deployment"
versioned_status=$?

verify_deployment "${BROWSER_PATH}" "public deployment"
public_status=$?

# Final status report
echo -e "\nDeployment Status:"
echo "===================="
echo "Version archive: ${VERSION_DIR}"
echo "Public URL: https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${BROWSER_PATH}index.html"

if [ $versioned_status -eq 0 ] && [ $public_status -eq 0 ]; then
    echo " Deployment verification successful!"
    echo "You can now access your application at:"
    echo "https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${BROWSER_PATH}index.html"
else
    echo " Deployment verification failed!"
    echo "Please check the logs above for details."
    exit 1
fi

# Cleanup
rm -f deployed_files.txt
