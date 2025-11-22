#!/usr/bin/env python3
import os
import requests
import json
from pathlib import Path

# Read API key
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('ELEVENLABS_API_KEY='):
            api_key = line.split('=', 1)[1].strip()
            break

print("🎭 Testing Diverse Voice Selection")
print("─" * 50)

headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

# Diverse voice selection - Arnold + 2 complementary diverse voices
diverse_voices = [
    {
        "id": "VR6AewLTigWG4xSOukaG", 
        "name": "Arnold",
        "description": "Warm, expressive male voice - KEEPER"
    },
    {
        "id": "XB0fDUnXU5powFXDhCwa", 
        "name": "Rachel", 
        "description": "Clear, professional female voice - Great for narration"
    },
    {
        "id": "pNInz6obpgDQGcFmaJgB", 
        "name": "Adam",
        "description": "Young, energetic male voice - Modern and engaging"
    }
]

# Alternative diverse options if you want more variety:
alternative_voices = [
    {
        "id": "ThT5KcBeYPX3keUQqHPh", 
        "name": "Liam",
        "description": "Deep, authoritative male voice - Cinematic presence"
    },
    {
        "id": "MF3mGyEYCl7XYWbV9V6O", 
        "name": "Grace",
        "description": "Elegant, sophisticated female voice - Premium feel"
    },
    {
        "id": "JBFqnCBsd6RMkjVDRZzb", 
        "name": "Kevin",
        "description": "Friendly, conversational male voice - Approachable"
    }
]

test_text = "The starship glides silently through the cosmic void, its metallic hull reflecting the distant starlight as it approaches the mysterious alien structure."

# Create output directory
Path("diverse-voice-tests").mkdir(exist_ok=True)

print("🎙️  Testing Primary Diverse Selection:")
print("─" * 40)

success_count = 0
for voice in diverse_voices:
    print(f"\n🔊 Testing {voice['name']}...")
    print(f"   📝 {voice['description']}")
    
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
            output_file = f"diverse-voice-tests/{voice['name'].lower()}-test.wav"
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"   ✅ Generated: {output_file}")
            success_count += 1
        else:
            print(f"   ❌ Failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

print(f"\n🎯 Generated {success_count}/{len(diverse_voices)} voices")
print("🎧 Listen to files in: diverse-voice-tests/")

# Show available voices for more options
print("\n🌍 Available Diverse Voices Summary:")
print("─" * 45)
response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)
if response.status_code == 200:
    all_voices = response.json()['voices']
    print("Female voices:")
    for v in all_voices[:8]:  # Show first 8 voices
        if any(gender in v.get('labels', {}).get('gender', '').lower() for gender in ['female', 'woman']):
            print(f"  • {v['name']} - {v.get('labels', {}).get('accent', 'Various')}")
    
    print("\nMale voices (besides Arnold):")
    for v in all_voices[:8]:
        if any(gender in v.get('labels', {}).get('gender', '').lower() for gender in ['male', 'man']):
            if v['name'] != 'Arnold':
                print(f"  • {v['name']} - {v.get('labels', {}).get('accent', 'Various')}")
