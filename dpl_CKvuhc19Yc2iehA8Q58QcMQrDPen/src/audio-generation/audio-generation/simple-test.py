#!/usr/bin/env python3
import os
import requests
import json
from pathlib import Path

# Read API key directly from .env file
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

print(f"🔑 API Key: {api_key[:10]}...")
print("🚀 Testing ElevenLabs API...")

headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

# Test 1: Check user info
print("\n1. Testing API key validity...")
try:
    response = requests.get("https://api.elevenlabs.io/v1/user", headers=headers)
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ API Key valid! Hello {user_data.get('name', 'User')}")
        print(f"💰 Subscription: {user_data.get('subscription', {}).get('tier', 'N/A')}")
        print(f"📊 Characters used: {user_data.get('subscription', {}).get('character_count', 'N/A')}")
    else:
        print(f"❌ API Error: {response.status_code} - {response.text}")
        exit(1)
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

# Test 2: Get available voices
print("\n2. Fetching available voices...")
try:
    response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)
    if response.status_code == 200:
        voices_data = response.json()
        voices = voices_data.get('voices', [])
        print(f"✅ Found {len(voices)} voices")

        # Show first 3 voices
        print("\n🎙️  Available voices:")
        for i, voice in enumerate(voices[:3]):
            print(f"   {i+1}. {voice.get('name')} - {voice.get('voice_id')}")
    else:
        print(f"❌ Failed to fetch voices: {response.status_code}")
except Exception as e:
    print(f"❌ Error fetching voices: {e}")

print("\n🎉 API connection successful! Ready to generate audio.")
