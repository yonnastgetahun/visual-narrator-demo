#!/usr/bin/env python3
import os
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class ElevenLabsTester:
    def __init__(self):
        self.api_key = os.getenv('ELEVENLABS_API_KEY')
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        self.test_voices = [
            {"id": "TxGEqnHWrfWFTfGW9XjX", "name": "Josh"},    # Deep, authoritative
            {"id": "VR6AewLTigWG4xSOukaG", "name": "Arnold"},  # Warm, expressive
            {"id": "AZnzlk1XvdvUeBnXmlld", "name": "Domi"}     # Clear, professional
        ]
        self.test_text = "The starship glides silently through the cosmic void, its metallic hull reflecting the distant starlight as it approaches the mysterious alien structure."

    def get_voices(self):
        """Fetch available voices from ElevenLabs"""
        try:
            response = requests.get(f"{self.base_url}/voices", headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Error fetching voices: {e}")
            return None

    def generate_voice_test(self, voice_id, voice_name, text, output_path):
        """Generate test audio for a specific voice"""
        url = f"{self.base_url}/text-to-speech/{voice_id}"
        
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8,
                "style": 0.7,
                "use_speaker_boost": True
            }
        }

        try:
            print(f"🎙️  Generating test for {voice_name}...")
            response = requests.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            
            # Save as WAV file
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Saved: {output_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error generating {voice_name}: {e}")
            return False

    def run_tests(self):
        """Run voice tests for all selected voices"""
        print("🚀 Starting ElevenLabs Voice Tests")
        print(f"📝 Test Text: {self.test_text}")
        print("─" * 60)
        
        # Create output directory
        Path("audio-generation/voice-tests").mkdir(exist_ok=True)
        
        successful_tests = []
        
        for voice in self.test_voices:
            output_file = f"audio-generation/voice-tests/{voice['name'].lower()}-test.wav"
            
            if self.generate_voice_test(voice['id'], voice['name'], self.test_text, output_file):
                successful_tests.append({
                    "name": voice['name'],
                    "id": voice['id'], 
                    "file": output_file
                })
            
            print()
        
        # Print summary
        print("🎯 VOICE TEST SUMMARY")
        print("─" * 60)
        for test in successful_tests:
            print(f"✅ {test['name']}: {test['file']}")
        
        return successful_tests

if __name__ == "__main__":
    tester = ElevenLabsTester()
    
    # Verify API key
    if not tester.api_key:
        print("❌ Please set ELEVENLABS_API_KEY in audio-generation/.env")
        exit(1)
    
    # Run voice tests
    results = tester.run_tests()
    
    if results:
        print(f"\n🎉 Successfully tested {len(results)} voices!")
        print("🎧 Listen to the WAV files in audio-generation/voice-tests/")
    else:
        print("\n💥 No voices were successfully tested")
