#!/bin/bash

# Ensure we are in the root directory
cd "$(dirname "$0")"

echo "🚀 Starting Firebase Functions Deployment..."

# 1. Login check
echo "Checking Firebase login status..."
npx firebase login:list || {
    echo "⚠️ Not logged in via CLI."
    echo "Please run: npx firebase login"
    exit 1
}

# 2. Build Functions
echo "🛠️ Building functions..."
cd functions
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
cd ..

# 3. Deploy
echo "☁️ Deploying to Firebase..."
if ! npx firebase deploy --only functions; then
    echo "❌ Deployment failed! Check the logs above."
    exit 1
fi

echo "✅ Deployment complete!"
