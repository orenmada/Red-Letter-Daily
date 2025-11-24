import React, { useState, useEffect, useCallback } from 'react';
import { JESUS_SAYINGS } from './data/sayings';
import { Saying, ReflectionState } from './types';
import { GeminiReflection } from './components/GeminiReflection';
import { fetchReflection } from './services/geminiService';

const App: React.FC = () => {
  const [currentSaying, setCurrentSaying] = useState<Saying | null>(null);
  const [reflection, setReflection] = useState<ReflectionState>({
    isLoading: false,
    content: null,
    error: null,
  });

  // Select a random saying
  const getRandomSaying = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * JESUS_SAYINGS.length);
    return JESUS_SAYINGS[randomIndex];
  }, []);

  // Initial load
  useEffect(() => {
    setCurrentSaying(getRandomSaying());
  }, [getRandomSaying]);

  // Handle getting a new quote
  const handleNewSaying = () => {
    setReflection({ isLoading: false, content: null, error: null }); // Reset reflection
    let newSaying = getRandomSaying();
    // Simple check to avoid immediate repeat if list is small
    while (newSaying.id === currentSaying?.id && JESUS_SAYINGS.length > 1) {
      newSaying = getRandomSaying();
    }
    setCurrentSaying(newSaying);
  };

  // Handle generating reflection via Gemini
  const handleGenerateReflection = async () => {
    if (!currentSaying) return;

    setReflection({ isLoading: true, content: null, error: null });
    
    try {
      const reflectionText = await fetchReflection(currentSaying);
      setReflection({
        isLoading: false,
        content: reflectionText,
        error: null
      });
    } catch (err) {
      setReflection({
        isLoading: false,
        content: null,
        error: "Failed to generate reflection."
      });
    }
  };

  // Helper to generate BibleHub URL
  const getBibleHubUrl = (reference: string) => {
    // Matches "Book Chapter:Verse" and ignores optional end range "-Verse" (e.g. Matthew 6:9-10 -> matches Matthew 6:9)
    const match = reference.match(/^(.+)\s(\d+):(\d+)/);
    if (match) {
      const book = match[1].toLowerCase().replace(/\s+/g, '_');
      const chapter = match[2];
      const verse = match[3];
      return `https://biblehub.com/${book}/${chapter}-${verse}.htm`;
    }
    return "https://biblehub.com/";
  };

  // Helper for BibleGateway URL
  const getBibleGatewayUrl = (reference: string) => {
    return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`;
  };

  // Helper for StepBible URL
  const getStepBibleUrl = (reference: string) => {
    return `https://www.stepbible.org/?q=version=ESV|reference=${encodeURIComponent(reference)}`;
  };

  if (!currentSaying) return <div className="min-h-screen flex items-center justify-center bg-biblical-parchment text-biblical-charcoal">Loading...</div>;

  return (
    <div className="min-h-screen bg-biblical-parchment flex flex-col relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-biblical-red via-biblical-gold to-biblical-red opacity-80"></div>
      
      {/* Main Content Container */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 max-w-3xl mx-auto w-full z-10">
        
        {/* Header / Branding */}
        <header className="mb-12 text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-biblical-charcoal tracking-wide border-b-2 border-biblical-gold/20 pb-4 inline-block">
            Red Letter Daily
          </h1>
          <p className="mt-4 font-sans text-xs tracking-widest text-gray-500 uppercase">
            Give us today our daily bread
          </p>
        </header>

        {/* Quote Card */}
        <div className="w-full bg-white p-8 md:p-16 rounded-sm shadow-2xl shadow-stone-300/50 border-t-4 border-biblical-red relative">
            
          {/* Decorative Quote Mark */}
          <div className="absolute top-8 left-8 font-serif text-8xl text-biblical-gold/10 -z-0 select-none">
            &ldquo;
          </div>

          <div className="relative z-10">
            <blockquote className="text-center space-y-6">
              <p className="font-serif text-2xl md:text-4xl leading-relaxed text-biblical-red font-medium">
                {currentSaying.text}
              </p>
              
              {/* Separator between languages */}
              <div className="flex justify-center items-center opacity-20">
                 <div className="w-16 h-px bg-biblical-red"></div>
              </div>

              <p className="font-serif text-xl md:text-2xl leading-relaxed text-biblical-red/80 italic">
                {currentSaying.text_es}
              </p>
            </blockquote>
            
            <div className="mt-10 flex flex-col items-center gap-4">
              {/* Reference and Context Display */}
              <div className="text-center">
                <span className="font-sans font-bold text-biblical-charcoal tracking-wide text-lg">
                  {currentSaying.reference}
                </span>
                {currentSaying.context && (
                  <div className="font-serif italic text-gray-400 text-sm mt-1">
                    {currentSaying.context}
                  </div>
                )}
              </div>

              {/* External Link Buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                <a 
                  href={getBibleHubUrl(currentSaying.reference)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs font-sans font-medium tracking-wider uppercase border border-gray-200 rounded-full text-gray-500 bg-gray-50 hover:border-biblical-gold hover:text-biblical-red hover:bg-white transition-all duration-300"
                >
                  BibleHub
                </a>
                <a 
                  href={getBibleGatewayUrl(currentSaying.reference)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs font-sans font-medium tracking-wider uppercase border border-gray-200 rounded-full text-gray-500 bg-gray-50 hover:border-biblical-gold hover:text-biblical-red hover:bg-white transition-all duration-300"
                >
                  BibleGateway
                </a>
                <a 
                  href={getStepBibleUrl(currentSaying.reference)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs font-sans font-medium tracking-wider uppercase border border-gray-200 rounded-full text-gray-500 bg-gray-50 hover:border-biblical-gold hover:text-biblical-red hover:bg-white transition-all duration-300"
                >
                  StepBible
                </a>
              </div>
            </div>

            {/* Gemini Feature */}
            <GeminiReflection 
              reflectionState={reflection} 
              onGenerate={handleGenerateReflection}
              disabled={!process.env.API_KEY}
            />

          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex flex-col sm:flex-row gap-6 items-center">
          <button
            onClick={handleNewSaying}
            className="font-sans text-sm font-semibold text-biblical-charcoal hover:text-biblical-red transition-colors tracking-wider uppercase border-b border-transparent hover:border-biblical-red pb-1"
          >
            Read Another
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-400 font-sans text-xs">
        <p>&copy; {new Date().getFullYear()} Red Letter Daily. AI insights provided by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;