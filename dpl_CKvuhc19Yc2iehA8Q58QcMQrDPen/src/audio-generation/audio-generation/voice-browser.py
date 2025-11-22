#!/usr/bin/env python3
import requests
import json

with open('.env', 'r') as f:
    for line in f:
        if line.startswith('ELEVENLABS_API_KEY='):
            api_key = line.split('=', 1)[1].strip()
            break

headers = {"xi-api-key": api_key}
response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)

print("🎭 COMPREHENSIVE VOICE BROWSER")
print("─" * 80)

if response.status_code == 200:
    voices = response.json()['voices']
    
    # Group by potential African American voices first
    print("\n📍 POTENTIAL AFRICAN AMERICAN VOICES (based on name/description):")
    print("─" * 80)
    
    potential_aa_voices = []
    other_voices = []
    
    for voice in voices:
        name = voice['name'].lower()
        desc = voice.get('description', '').lower()
        
        # Broad search for potential AA voices
        aa_indicators = ['black', 'african', 'urban', 'street', 'soul', 'rap', 'hip hop', 'ebonic']
        is_potential_aa = any(indicator in name or indicator in desc for indicator in aa_indicators)
        
        if is_potential_aa:
            potential_aa_voices.append(voice)
        else:
            other_voices.append(voice)
    
    # Show potential AA voices
    for i, voice in enumerate(potential_aa_voices):
        labels = voice.get('labels', {})
        print(f"🔊 {voice['name']}")
        print(f"   ID: {voice['voice_id']}")
        print(f"   Desc: {voice.get('description', 'No description')}")
        print(f"   Labels: {labels}")
        print()
    
    # Show all male voices as alternatives
    print("\n🎙️ ALL MALE VOICES (potential alternatives):")
    print("─" * 80)
    
    male_voices = [v for v in other_voices if v.get('labels', {}).get('gender') == 'male']
    for i, voice in enumerate(male_voices[:10]):  # Show first 10
        labels = voice.get('labels', {})
        print(f"{i+1:2d}. {voice['name']:15} | {labels.get('accent', 'various'):15} | {voice.get('description', '')}")
    
    print(f"\n📊 Total voices available: {len(voices)}")
    print(f"📍 Potential AA voices found: {len(potential_aa_voices)}")
    print(f"🎙️  Other male voices: {len(male_voices)}")
    
    print("\n💡 TIP: Listen to the potential AA voices first, then male alternatives if needed.")
