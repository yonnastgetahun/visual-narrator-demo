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

print("🎭 Testing Josh + Rachel + African American Voice Selection")
print("─" * 60)

headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

# First, let's explore available African American voices
print("\n🔍 Searching for African American voices...")
response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)

african_american_voices = []
other_voices = []

if response.status_code == 200:
    all_voices = response.json()['voices']
    
    for voice in all_voices:
        name = voice['name'].lower()
        description = voice.get('description', '').lower()
        labels = voice.get('labels', {})
        
        # Look for African American indicators
        is_aa = any(indicator in name or indicator in description 
                   for indicator in ['black', 'african', 'aa', 'ebonic', 'urban'])
        
        # Also check labels
        if labels.get('ethnicity') == 'black' or labels.get('accent') == 'african american':
            is_aa = True
        
        if is_aa:
            african_american_voices.append({
                'id': voice['voice_id'],
                'name': voice['name'],
                'description': voice.get('description', ''),
                'labels': labels
            })
        else:
            other_voices.append(voice)

# Show what we found
print(f"✅ Found {len(african_american_voices)} African American voices")
for voice in african_american_voices:
    print(f"   🔊 {voice['name']} - {voice.get('description', 'No description')}")

# If no specific AA voices found, show male voices that might work
if not african_american_voices:
    print("\n🔧 No specifically labeled African American voices found.")
    print("   Showing male voices that could work well:")
    
    male_voices = []
    for voice in other_voices:
        labels = voice.get('labels', {})
        if labels.get('gender') == 'male':
            male_voices.append({
                'id': voice['voice_id'],
                'name': voice['name'],
                'description': voice.get('description', ''),
                'labels': labels
            })
    
    # Show potential candidates
    for voice in male_voices[:5]:
        print(f"   🔊 {voice['name']} - {voice.get('description', '')}")

# Our selected trio
selected_voices = [
    {
        "id": "TxGEqnHWrfWFTfGW9XjX", 
        "name": "Josh",
        "description": "Deep, authoritative male voice"
    },
    {
        "id": "XB0fDUnXU5powFXDhCwa", 
        "name": "Rachel",
        "description": "Clear, professional female voice"
    }
]

# Add African American voice if found, otherwise use a good male alternative
if african_american_voices:
    aa_voice = african_american_voices[0]  # Use the first found AA voice
    selected_voices.append({
        "id": aa_voice['id'],
        "name": aa_voice['name'],
        "description": f"African American voice - {aa_voice.get('description', '')}"
    })
else:
    # Fallback to another good male voice
    selected_voices.append({
        "id": "pNInz6obpgDQGcFmaJgB", 
        "name": "Adam",
        "description": "Young, energetic male voice - potential diverse representation"
    })

test_text = "The starship glides silently through the cosmic void, its metallic hull reflecting the distant starlight as it approaches the mysterious alien structure."

# Create output directory
Path("final-voice-tests").mkdir(exist_ok=True)

print(f"\n🎙️  Testing Final Trio: Josh + Rachel + African American Voice")
print("─" * 60)

success_count = 0
for voice in selected_voices:
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
            output_file = f"final-voice-tests/{voice['name'].lower()}-test.wav"
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"   ✅ Generated: {output_file}")
            success_count += 1
        else:
            print(f"   ❌ Failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

print(f"\n🎯 Generated {success_count}/{len(selected_voices)} voices")
print("🎧 Listen to files in: final-voice-tests/")

# Show complete voice library for manual selection if needed
print("\n🌍 Complete Voice Library (for manual selection):")
print("─" * 50)
response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)
if response.status_code == 200:
    all_voices = response.json()['voices']
    for i, voice in enumerate(all_voices[:12]):  # Show first 12 voices
        labels = voice.get('labels', {})
        print(f"{i+1:2d}. {voice['name']:15} | {labels.get('gender', 'unknown'):8} | {labels.get('accent', 'various'):15} | {voice.get('description', '')[:50]}...")
