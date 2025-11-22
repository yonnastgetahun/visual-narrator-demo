#!/bin/bash

echo "🔧 ElevenLabs API Setup Debug"
echo "=============================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating one..."
    cat > .env << 'ENV_TEMPLATE'
ELEVENLABS_API_KEY=your_actual_api_key_here
ENV_TEMPLATE
    echo "✅ Created .env template"
    echo "📝 Please edit audio-generation/.env with your real API key"
    exit 1
fi

# Check API key format
API_KEY=$(grep ELEVENLABS_API_KEY .env | cut -d '=' -f2)

if [ "$API_KEY" = "your_api_key_here" ] || [ -z "$API_KEY" ]; then
    echo "❌ API key not set properly in .env"
    echo "💡 Your .env should look like:"
    echo "ELEVENLABS_API_KEY=sk_1234567890abcdef"
    echo ""
    echo "🌐 Get your API key from: https://elevenlabs.io/speech-synthesis"
    echo "   → Click Profile → Profile & API Keys → + Add API Key"
    exit 1
fi

echo "✅ API Key found: ${API_KEY:0:10}..."
echo "🚀 Testing API connection..."

# Test API key with a simple request
python3 << 'TEST_SCRIPT'
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('ELEVENLABS_API_KEY')
url = "https://api.elevenlabs.io/v1/voices"

headers = {
    "xi-api-key": api_key
}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        print("✅ API key is valid! Connected to ElevenLabs successfully.")
        voices = response.json()
        print(f"🎙️  Found {len(voices['voices'])} available voices")
    elif response.status_code == 401:
        print("❌ API key is invalid or expired")
        print("💡 Please check:")
        print("   1. API key is correct (starts with 'sk_')")
        print("   2. API key is not expired")
        print("   3. You have sufficient credits")
    else:
        print(f"❌ API error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
TEST_SCRIPT
