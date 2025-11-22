#!/usr/bin/env python3
import os
import requests
import json
from pathlib import Path

# Read API key directly
try:
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('ELEVENLABS_API_KEY='):
                api_key = line.split('=', 1)[1].strip()
                break
        else:
            print("❌ ELEVENLABS_API_KEY not found in .env")
            exit(1)
except FileNotFoundError:
    print("❌ .env file not found")
    exit(1)

print("🚀 ElevenLabs Voice Test - Direct Method")
print("─" * 50)

headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

# Test voices with their exact IDs
test_voices = [
    {"id": "TxGEqnHWrfWFTfGW9XjX", "name": "Josh"},
    {"id": "VR6AewLTigWG4xSOukaG", "name": "Arnold"}, 
    {"id": "AZnzlk1XvdvUeBnXmlld", "name": "Domi"}
]

test_text = "The starship glides silently through the cosmic void, its metallic hull reflecting the distant starlight."

# Create output directory
Path("voice-tests").mkdir(exist_ok=True)

success_count = 0

for voice in test_voices:
    print(f"\n🎙️  Testing {voice['name']}...")
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice['id']}"
    
    payload = {
        "text": test_text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.7,
            "use_speaker_boost": True
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            # Save as WAV file
            output_file = f"voice-tests/{voice['name'].lower()}-test.wav"
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"✅ Generated: {output_file}")
            success_count += 1
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print(f"\n🎯 Results: {success_count}/{len(test_voices)} voices generated successfully")
if success_count > 0:
    print("🎧 Listen to the WAV files in voice-tests/ directory")
