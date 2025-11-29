import React, { useState, useRef } from 'react';
// Use dynamic import or require for JSON
const scenes = [
  {
    "id": "game-of-thrones-opening",
    "title": "Game of Thrones - Opening Scene",
    "description": "Three rangers discover ritualistic bodies in the forest",
    "videoUrl": "/videos/gameofthronesseason1episode1.mp4",
    "duration": 180,
    "category": "fantasy"
  },
  {
    "id": "matrix-lobby", 
    "title": "The Matrix - Lobby Scene",
    "description": "Neo and Trinity assault the lobby",
    "videoUrl": "/videos/matrix-lobby.mp4",
    "duration": 120,
    "category": "action"
  }
];

import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import VideoStill from './VideoStill';

const SceneGallery = () => {
  const [selectedScene, setSelectedScene] = useState(scenes[0]);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="scene-gallery p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Scene Gallery</h2>
      
      {/* Scene selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className={`p-4 border rounded cursor-pointer ${
              selectedScene.id === scene.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedScene(scene)}
          >
            <h3 className="font-semibold">{scene.title}</h3>
            <p className="text-sm text-gray-600">{scene.description}</p>
          </div>
        ))}
      </div>

      {/* Selected scene display */}
      {selectedScene && (
        <div className="selected-scene">
          <VideoPlayer videoUrl={selectedScene.videoUrl} />
          <AudioPlayer audioUrl={`/audio/${selectedScene.id}.wav`} />
        </div>
      )}
    </div>
  );
};

export default SceneGallery;
