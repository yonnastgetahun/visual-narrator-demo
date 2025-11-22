'use client';

interface VideoStillProps {
  category: string;
  className?: string;
}

export default function VideoStill({ category, className = '' }: VideoStillProps) {
  // Color gradients based on category
  const getGradient = (cat: string) => {
    const gradients = {
      'Cinematic Moments': 'from-purple-600 to-blue-600',
      'Action Sequence': 'from-red-600 to-orange-600', 
      'Visual Spectacle': 'from-green-600 to-teal-600',
      'Complex Multi-Object': 'from-indigo-600 to-purple-600',
      'Fine Detail Focus': 'from-pink-600 to-rose-600',
      'Architectural Precision': 'from-gray-600 to-blue-600',
      'Rapid Motion': 'from-yellow-600 to-red-600'
    };
    return gradients[cat as keyof typeof gradients] || 'from-blue-600 to-purple-600';
  };

  // Icons based on category
  const getIcon = (cat: string) => {
    const icons = {
      'Cinematic Moments': '🎬',
      'Action Sequence': '💥',
      'Visual Spectacle': '✨',
      'Complex Multi-Object': '🎯',
      'Fine Detail Focus': '🔍',
      'Architectural Precision': '🏛️',
      'Rapid Motion': '⚡'
    };
    return icons[cat as keyof typeof icons] || '🎥';
  };

  return (
    <div className={`h-48 bg-gradient-to-br ${getGradient(category)} flex items-center justify-center text-white font-semibold relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-grid-white/[0.2]"></div>
      </div>
      
      {/* Content */}
      <div className="text-center z-10">
        <div className="text-3xl mb-2">{getIcon(category)}</div>
        <div className="text-sm bg-black bg-opacity-40 px-3 py-1 rounded-full">
          {category}
        </div>
      </div>

      {/* Play Button Overlay */}
      <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 rounded-full p-1">
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
        </div>
      </div>
    </div>
  );
}
