#!/usr/bin/env python3
import os
import requests
import json
from pathlib import Path
import time

# Read API key
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('ELEVENLABS_API_KEY='):
            api_key = line.split('=', 1)[1].strip()
            break

print("🎬 Generating All Scene Audio with Josh, Rachel & Callum")
print("─" * 70)

headers = {
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

# Our selected voice trio
VOICES = {
    "Josh": "TxGEqnHWrfWFTfGW9XjX",
    "Rachel": "XB0fDUnXU5powFXDhCwa", 
    "Callum": "N2lVS1w4EtoT3dr4eOWO"
}

# Emotional settings for different scene types
EMOTIONAL_SETTINGS = {
    "intense": {
        "stability": 0.3,
        "similarity_boost": 0.7,
        "style": 0.8,
        "use_speaker_boost": True,
        "description": "High drama, action sequences"
    },
    "cinematic": {
        "stability": 0.5,
        "similarity_boost": 0.8,
        "style": 0.7,
        "use_speaker_boost": True,
        "description": "Epic scenes, visual spectacles"
    },
    "suspense": {
        "stability": 0.4,
        "similarity_boost": 0.75,
        "style": 0.6,
        "use_speaker_boost": True,
        "description": "Mysterious, tense moments"
    }
}

# Scene configuration with voice assignments and emotions
SCENES = [
    {
        "id": "interstellar-docking",
        "title": "Interstellar - Docking Scene",
        "text": "The Endurance spins violently against the black void of space, its massive cylindrical form silhouetted by the distant stars as Cooper desperately aligns the docking ports amid blaring emergency alarms and cascading warning lights",
        "voice": "Josh",
        "emotion": "intense"
    },
    {
        "id": "john-wick-fight", 
        "title": "John Wick - Red Circle Fight",
        "text": "John moves with lethal precision through the strobe-lit bathhouse, his tailored suit barely rustling as he dispatches attackers with brutal efficiency, each movement a symphony of controlled violence in the chaotic neon atmosphere",
        "voice": "Josh",
        "emotion": "intense"
    },
    {
        "id": "avatar-flight",
        "title": "Avatar - First Banshee Flight", 
        "text": "Jake soars through the breathtaking alien landscape on his majestic banshee, the vibrant bioluminescent flora creating an ethereal glow as they dive between massive floating mountains in the misty Pandoran sky",
        "voice": "Rachel",
        "emotion": "cinematic"
    },
    {
        "id": "matrix-lobby",
        "title": "The Matrix - Lobby Scene",
        "text": "Neo arches his body backward in impossible slow motion, dozens of gleaming brass bullets suspended around him like deadly metallic raindrops as his black trench coat billows dramatically in the frozen moment of surreal violence",
        "voice": "Callum", 
        "emotion": "suspense"
    },
    {
        "id": "blade-runner-rain",
        "title": "Blade Runner 2049 - Hologram Rain", 
        "text": "K stands in the relentless neon-drenched rain as Joi's shimmering holographic form glitches delicately beside him, each raindrop creating tiny crystalline distortions in her ethereal blue light under the towering urban landscape",
        "voice": "Rachel",
        "emotion": "cinematic"
    },
    {
        "id": "inception-folding",
        "title": "Inception - Paris Folding Scene",
        "text": "The Parisian cityscape folds impossibly over itself in a breathtaking geometric transformation, ancient stone buildings curving like paper as the laws of physics surrender to the dreamlike architectural ballet",
        "voice": "Callum",
        "emotion": "suspense"
    },
    {
        "id": "mad-max-sandstorm",
        "title": "Mad Max - Sandstorm Chase", 
        "text": "The armored war rig charges through the apocalyptic orange sandstorm, its massive tires spraying desert debris as it narrowly avoids collisions with pursuing vehicles in the chaotic, visibility-obscured frenzy",
        "voice": "Josh",
        "emotion": "intense"
    }
]

def generate_audio(scene, output_dir):
    """Generate audio for a single scene"""
    voice_id = VOICES[scene["voice"]]
    emotion_settings = EMOTIONAL_SETTINGS[scene["emotion"]]
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    
    payload = {
        "text": scene["text"],
        "model_id": "eleven_monolingual_v1",
        "voice_settings": emotion_settings
    }
    
    try:
        print(f"🎙️  Generating: {scene['title']}")
        print(f"   🔊 Voice: {scene['voice']} | 🎭 Emotion: {scene['emotion']}")
        print(f"   📝 Text: {scene['text'][:60]}...")
        
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            output_file = output_dir / f"{scene['id']}.wav"
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"   ✅ Saved: {output_file}")
            return True
        else:
            print(f"   ❌ Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    # Create output directories
    audio_dir = Path("generated-audio")
    audio_dir.mkdir(exist_ok=True)
    
    print(f"🎯 Generating {len(SCENES)} scenes with 3 voices")
    print(f"📁 Output directory: {audio_dir}")
    print("─" * 70)
    
    success_count = 0
    failed_scenes = []
    
    for i, scene in enumerate(SCENES):
        print(f"\n📋 Scene {i+1}/{len(SCENES)}")
        if generate_audio(scene, audio_dir):
            success_count += 1
        else:
            failed_scenes.append(scene["title"])
        
        # Add delay to avoid rate limiting (1.5 seconds between requests)
        if i < len(SCENES) - 1:
            time.sleep(1.5)
    
    # Print summary
    print(f"\n🎉 GENERATION COMPLETE")
    print("─" * 70)
    print(f"✅ Successful: {success_count}/{len(SCENES)}")
    
    if failed_scenes:
        print(f"❌ Failed scenes: {', '.join(failed_scenes)}")
    
    # Voice usage summary
    voice_usage = {}
    for scene in SCENES:
        voice = scene["voice"]
        voice_usage[voice] = voice_usage.get(voice, 0) + 1
    
    print(f"\n🎙️  Voice Distribution:")
    for voice, count in voice_usage.items():
        print(f"   • {voice}: {count} scenes")
    
    print(f"\n📊 Emotion Distribution:")
    emotion_usage = {}
    for scene in SCENES:
        emotion = scene["emotion"]
        emotion_usage[emotion] = emotion_usage.get(emotion, 0) + 1
    
    for emotion, count in emotion_usage.items():
        print(f"   • {emotion}: {count} scenes")
    
    print(f"\n💾 Audio files saved to: {audio_dir}/")
    print("🚀 Ready to integrate with the Visual Narrator demo!")

if __name__ == "__main__":
    main()
