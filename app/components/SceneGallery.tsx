'use client';

import { useState, useRef } from 'react';
import scenes from '../../data/scenes.json';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import VideoStill from './VideoStill';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

type Scene = typeof scenes.scenes[0];

export default function SceneGallery() {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showMagic, setShowMagic] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Ready for transformation');
  const videoRef = useRef<HTMLVideoElement>(null);

  const nextScene = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % scenes.scenes.length);
  };

  const prevScene = () => {
    setCurrentSceneIndex((prev) => (prev - 1 + scenes.scenes.length) % scenes.scenes.length);
  };

  const openScene = (scene: Scene, index: number) => {
    setSelectedScene(scene);
    setCurrentSceneIndex(index);
    setShowMagic(false);
    setSyncStatus('Ready for transformation');
  };

  const closeModal = () => {
    setSelectedScene(null);
    setShowMagic(false);
    setSyncStatus('Ready for transformation');
  };

  const handleSeeMagic = async () => {
    setShowMagic(true);
    setSyncStatus('Starting cinematic experience...');
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setSyncStatus('Loading premium audio...');
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Single Row Scene Gallery */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevScene}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all z-10"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        <button
          onClick={nextScene}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all z-10"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>

        {/* Scene Cards Row */}
        <div className="flex space-x-6 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {scenes.scenes.map((scene, index) => (
            <div 
              key={scene.id}
              className="flex-none w-80 border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
              onClick={() => openScene(scene, index)}
            >
              <VideoStill category={scene.category} />
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {scene.category}
                  </span>
                  <span className="text-sm text-gray-500">30s</span>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Compare Standard CV vs Visual Narrator
                  </p>
                  <div className="flex justify-center space-x-3 mb-3">
                    <div className="w-6 h-6 bg-gray-400 rounded" title="Microsoft"></div>
                    <div className="w-6 h-6 bg-red-400 rounded" title="Google"></div>
                    <div className="w-6 h-6 bg-orange-400 rounded" title="AWS"></div>
                    <div className="w-6 h-6 bg-red-500 rounded" title="YouTube"></div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Object detection only</div>
                    <div>• No spatial relationships</div>
                    <div>• No adjectives</div>
                    <div>• No audio narration</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scene Indicator Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          {scenes.scenes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSceneIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSceneIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Transformation Demo Modal */}
      {selectedScene && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header with Navigation */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedScene.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedScene.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Scene Navigation */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const prevIndex = (currentSceneIndex - 1 + scenes.scenes.length) % scenes.scenes.length;
                        setSelectedScene(scenes.scenes[prevIndex]);
                        setCurrentSceneIndex(prevIndex);
                        setShowMagic(false);
                        setSyncStatus('Ready for transformation');
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentSceneIndex + 1} of {scenes.scenes.length}
                    </span>
                    <button
                      onClick={() => {
                        const nextIndex = (currentSceneIndex + 1) % scenes.scenes.length;
                        setSelectedScene(scenes.scenes[nextIndex]);
                        setCurrentSceneIndex(nextIndex);
                        setShowMagic(false);
                        setSyncStatus('Ready for transformation');
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Transformation Status */}
              {showMagic && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="text-purple-600" size={20} />
                    <div className="flex-1">
                      <div className="font-semibold text-purple-800">Cinematic Experience Active</div>
                      <div className="text-sm text-purple-600">{syncStatus}</div>
                    </div>
                    <div className="text-xs text-purple-500 bg-white px-2 py-1 rounded">
                      {selectedScene.ourSolution.voice} • {selectedScene.ourSolution.emotion}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content - Dynamic Layout Based on State */}
              <div className={`grid gap-8 ${showMagic ? 'lg:grid-cols-5' : 'lg:grid-cols-2'}`}>
                
                {/* Video Column - Always visible */}
                <div className={`${showMagic ? 'lg:col-span-3' : 'lg:col-span-1'} space-y-6`}>
                  <VideoPlayer
                    ref={videoRef}
                    videoUrl={selectedScene.videoUrl}
                    title={selectedScene.title}
                    autoPlay={showMagic}
                    muted={true}
                  />

                  {/* Audio Player - Shows after magic */}
                  {showMagic && selectedScene.ourSolution.audioUrl && videoRef.current && (
                    <AudioPlayer 
                      audioUrl={selectedScene.ourSolution.audioUrl}
                      videoRef={videoRef}
                      autoPlay={true}
                      onSyncStatusChange={setSyncStatus}
                    />
                  )}

                  {/* Magic Button - Shows before transformation */}
                  {!showMagic && (
                    <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 border-dashed">
                      <div className="mb-4">
                        <Sparkles className="mx-auto text-blue-600 mb-2" size={32} />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">From Basic Detection to Cinematic Storytelling</h3>
                        <p className="text-gray-600 mb-4">
                          Transform standard computer vision output into immersive audio narration
                        </p>
                      </div>
                      <button
                        onClick={handleSeeMagic}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                      >
                        🎬 See the Magic
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Column - Changes based on state */}
                <div className={`${showMagic ? 'lg:col-span-2 space-y-6' : 'lg:col-span-1'}`}>
                  
                  {!showMagic ? (
                    // BEFORE Magic - Show standard computer vision output
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Standard Computer Vision Output
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Basic object detection misses spatial relationships, adjectives, and narrative context
                        </p>
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-700">Microsoft Azure</span>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Basic Objects</span>
                            </div>
                            <p className="text-gray-600">{selectedScene.competitors.microsoft}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              ❌ No spatial relationships • No adjectives • No audio narration
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-700">Google Cloud</span>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Basic Objects</span>
                            </div>
                            <p className="text-gray-600">{selectedScene.competitors.google}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              ❌ No spatial relationships • No adjectives • No audio narration
                            </div>
                          </div>

                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-700">AWS Rekognition</span>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Basic Objects</span>
                            </div>
                            <p className="text-gray-600">{selectedScene.competitors.aws}</p>
                            <div className="mt-2 text-xs text-gray-500">
                              ❌ No spatial relationships • No adjectives • No audio narration
                            </div>
                          </div>

                          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-red-700">YouTube Auto Captions</span>
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Wrong Technology</span>
                            </div>
                            <p className="text-red-600 text-sm">{selectedScene.competitors.youtube}</p>
                            <div className="mt-2 text-xs text-red-600">
                              ❌ Speech-to-text fails on cinematic moments • No visual understanding
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Limitations Summary */}
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-800 mb-2">Key Limitations of Standard CV:</h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Identifies objects but misses relationships between them</li>
                          <li>• No descriptive language or emotional context</li>
                          <li>• Cannot create narrative from visual sequences</li>
                          <li>• No audio output for accessibility or entertainment</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    // AFTER Magic - Show our solution and metrics
                    <>
                      {/* Our Solution */}
                      <div className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Narrator Premium</h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-bold text-green-800">908% Better Adjective Density</span>
                          <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                            {selectedScene.ourSolution.adjectiveDensity} density
                          </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed mb-4">{selectedScene.ourSolution.text}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{selectedScene.ourSolution.wordCount} words</span>
                          <span className="text-green-600 font-semibold">✅ Complete audio experience</span>
                        </div>
                      </div>

                      {/* Key Advantages Summary */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Visual Narrator Advantages:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Understands spatial relationships between objects</li>
                          <li>• Uses rich descriptive language and emotional context</li>
                          <li>• Creates compelling narrative from visual sequences</li>
                          <li>• Generates premium audio narration automatically</li>
                        </ul>
                      </div>

                      {/* Metrics */}
                      {selectedScene.ourSolution.metrics && (
                        <div className="animate-fade-in">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quantitative Advantage</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">{selectedScene.ourSolution.metrics.objects}</div>
                              <div className="text-sm text-gray-600">Objects Detected</div>
                              <div className="text-xs text-green-600 mt-1">400% better</div>
                            </div>
                            <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">{selectedScene.ourSolution.metrics.spatial}</div>
                              <div className="text-sm text-gray-600">Spatial Relationships</div>
                              <div className="text-xs text-green-600 mt-1">800% better</div>
                            </div>
                            <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">{selectedScene.ourSolution.metrics.adjectives}</div>
                              <div className="text-sm text-gray-600">Adjectives Used</div>
                              <div className="text-xs text-green-600 mt-1">1200% better</div>
                            </div>
                            <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="text-2xl font-bold text-gray-900">{selectedScene.ourSolution.metrics.audio}</div>
                              <div className="text-sm text-gray-600">Audio Narration</div>
                              <div className="text-xs text-green-600 mt-1">Complete solution</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
