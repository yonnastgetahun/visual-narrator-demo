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

if response.status_code == 200:
    voices = response.json()['voices']
    
    print("🎭 COMPLETE VOICE LIBRARY")
    print("─" * 60)
    
    categories = {}
    for voice in voices:
        labels = voice.get('labels', {})
        gender = labels.get('gender', 'unknown')
        accent = labels.get('accent', 'various')
        age = labels.get('age', 'unknown')
        
        category = f"{gender} - {age}"
        if category not in categories:
            categories[category] = []
        
        categories[category].append({
            'name': voice['name'],
            'id': voice['voice_id'],
            'accent': accent,
            'description': voice.get('description', '')
        })
    
    for category, voices_in_category in categories.items():
        print(f"\n📁 {category.upper()}:")
        for voice in voices_in_category[:4]:  # Show top 4 per category
            print(f"   🔊 {voice['name']}")
            print(f"      ID: {voice['id']}")
            print(f"      Accent: {voice['accent']}")
            if voice['description']:
                print(f"      Desc: {voice['description'][:80]}...")
            print()
