import EngineDemo from './components/EngineDemo';
import SceneGallery from './components/SceneGallery';
import BusinessCalculator from './components/BusinessCalculator';
import CalculatorButton from './components/CalculatorButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Visual Narrator VLM
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Transforming Visual Experiences into Immersive Audio Theater
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Demo Platform</div>
              <div className="text-xs text-gray-400">v2.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See the 908% Difference
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Compare our adjective-dominant audio narration against current AI solutions. 
            Click any scene to see the dramatic quality difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">908% Better Adjective Density</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">2,161x Faster Inference</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">$344.69 Training Cost</span>
          </div>
        </div>

        {/* Scene Gallery */}
        <SceneGallery />

        {/* Business Calculator Toggle */}
        <div className="text-center mt-16">
          <CalculatorButton />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">

		 <section className="my-12">
      			<EngineDemo />
   		 </section>

          <div className="text-center text-gray-500 text-sm">
            <p>Visual Narrator VLM Demo Platform • World's First Adjective-Dominant Visual Language Model</p>
            <p className="mt-2">Ready for investor demonstrations and technical validation</p>
          </div>
        </div>
      </div>
    </main>
  );
}
