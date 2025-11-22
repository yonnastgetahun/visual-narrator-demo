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

print("🎭 Testing Callum, George & River for African American Representation")
print("─" * 70)

headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

# Voice IDs for Callum, George, and River
test_voices = [
    {
        "id": "N2lVS1w4EtoT3dr4eOWO",  # Callum
        "name": "Callum",
        "description": "Warm, friendly male voice - potential diverse representation"
    },
    {
        "id": "JBFqnCBsd6RMkjVDRZzb",  # George
        "name": "George", 
        "description": "Friendly, conversational male voice - approachable tone"
    },
    {
        "id": "Aznzlk1XvdvUeBnXmlld",  # River
        "name": "River",
        "description": "Clear, professional male voice - versatile narrator"
    }
]

# Test with different text that might better showcase African American vocal qualities
test_texts = [
    "The starship glides silently through the cosmic void, its metallic hull reflecting the distant starlight.",
    "In the heart of the city, rhythm flows through the streets like a steady heartbeat, connecting everyone in its path.",
    "With precision and soul, the artist transforms blank canvas into vibrant story, each stroke speaking volumes."
]

# Create output directory
Path("cgr-voice-tests").mkdir(exist_ok=True)

print("🎙️  Testing Callum, George, and River with Multiple Text Samples")
print("─" * 70)

for voice in test_voices:
    print(f"\n🔊 Testing {voice['name']}...")
    print(f"   📝 {voice['description']}")
    
    for i, test_text in enumerate(test_texts):
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice['id']}"
        
        payload = {
            "text": test_text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.4,  # Slightly more dynamic for expression
                "similarity_boost": 0.8,
                "style": 0.7,
                "use_speaker_boost": True
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                output_file = f"cgr-voice-tests/{voice['name'].lower()}-sample-{i+1}.wav"
                with open(output_file, 'wb') as f:
                    f.write(response.content)
                print(f"   ✅ Sample {i+1}: {output_file}")
                print(f"      Text: '{test_text[:50]}...'")
            else:
                print(f"   ❌ Sample {i+1} failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Add a small delay between voices
    import time
    time.sleep(1)

print(f"\n🎯 Testing complete!")
print("🎧 Listen to all samples in: cgr-voice-tests/")

# Compare with Josh to ensure good variety
print("\n🔍 Voice Variety Analysis:")
print("─" * 40)
print("Josh + Rachel + [Your Choice] = Perfect Diversity")
print("• Josh: Deep, authoritative")
print("• Rachel: Clear, professional female") 
print("• Your choice should provide unique vocal qualities")

# Get more details about these voices
print("\n📋 Voice Details:")
response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)
if response.status_code == 200:
    all_voices = response.json()['voices']
    for voice in test_voices:
        for v in all_voices:
            if v['voice_id'] == voice['id']:
                labels = v.get('labels', {})
                print(f"\n🎯 {voice['name']}:")
                print(f"   Labels: {labels}")
                print(f"   Description: {v.get('description', 'No description available')}")
                break
