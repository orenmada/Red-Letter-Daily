import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { JESUS_SAYINGS } from './data/sayings';
import { Saying } from './types';

const App: React.FC = () => {
  const [currentSaying, setCurrentSaying] = useState<Saying | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Routing & Data Logic ---

  // Organize sayings by Gospel to allow for equal probability selection of Gospel first.
  // This prevents Matthew (which has the most verses) from dominating the feed.
  const sayingsByGospel = useMemo(() => {
    const groups: Record<string, Saying[]> = {};
    JESUS_SAYINGS.forEach(s => {
      // Extract book name (e.g., "Matthew" from "Matthew 5:3")
      const book = s.reference.split(' ')[0];
      if (!groups[book]) groups[book] = [];
      groups[book].push(s);
    });
    return groups;
  }, []);

  const getRandomSaying = useCallback(() => {
    const gospels = Object.keys(sayingsByGospel);
    if (gospels.length === 0) return JESUS_SAYINGS[0];

    // 1. Randomize the Gospel (Equal chance for Matthew, Mark, Luke, John)
    const randomGospel = gospels[Math.floor(Math.random() * gospels.length)];
    
    // 2. Randomize the verse within that specific Gospel
    const verses = sayingsByGospel[randomGospel];
    return verses[Math.floor(Math.random() * verses.length)];
  }, [sayingsByGospel]);

  const getSayingById = useCallback((id: string) => {
    return JESUS_SAYINGS.find(s => s.id.toString() === id);
  }, []);

  // Handle URL navigation and initial load
  useEffect(() => {
    console.log("App mounted");
    const handlePopState = () => {
      let id = null;
      try {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
      } catch (e) {
        console.warn("Location access restricted:", e);
      }

      if (id) {
        const found = getSayingById(id);
        if (found) {
          setCurrentSaying(found);
          // Update title for SEO/UX
          document.title = `${found.reference} | Red Letter Daily`;
          return;
        }
      }
      // If no ID or invalid, load random
      const random = getRandomSaying();
      setCurrentSaying(random);
      document.title = `Red Letter Daily`;
      
      try {
        window.history.replaceState(null, "", `?id=${random.id}`);
      } catch (e) {
        console.warn("History API restricted (replaceState):", e);
      }
    };

    // Initial check
    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getSayingById, getRandomSaying]);

  // Navigate to new verse
  const handleNewSaying = () => {
    let newSaying = getRandomSaying();
    // Avoid immediate repeat
    while (newSaying.id === currentSaying?.id && JESUS_SAYINGS.length > 1) {
      newSaying = getRandomSaying();
    }
    
    setCurrentSaying(newSaying);
    document.title = `${newSaying.reference} | Red Letter Daily`;
    
    try {
      window.history.pushState(null, "", `?id=${newSaying.id}`);
    } catch (e) {
      console.warn("History API restricted (pushState):", e);
    }
    
    // Scroll to top gently
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Links & Sharing ---

  const getBibleHubUrl = (reference: string) => {
    const match = reference.match(/^(.+)\s(\d+):(\d+)/);
    if (match) {
      const book = match[1].toLowerCase().replace(/\s+/g, '_');
      const chapter = match[2];
      const verse = match[3];
      return `https://biblehub.com/${book}/${chapter}-${verse}.htm`;
    }
    return "https://biblehub.com/";
  };

  const getBibleGatewayUrl = (reference: string) => 
    `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`;

  const getStepBibleUrl = (reference: string) => 
    `https://www.stepbible.org/?q=version=ESV|reference=${encodeURIComponent(reference)}`;

  const handleShare = (platform: string) => {
    if (!currentSaying) return;
    
    let url = "https://red-letter-daily.com";
    try {
        url = `${window.location.origin}${window.location.pathname}?id=${currentSaying.id}`;
    } catch (e) {
        console.warn("Location access restricted during share:", e);
    }

    const text = `"${currentSaying.text}" - ${currentSaying.reference}`;
    
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'whatsapp':
        // Custom format for WhatsApp as requested
        const waMessage = `Here is a verse I thought you would like:\n\n${text}\n\nFor more sayings of Jesus check this link:\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(waMessage)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=A Saying of Jesus&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }
  };

  if (!currentSaying) return <div className="min-h-screen flex items-center justify-center bg-biblical-parchment"></div>;

  return (
    <div className="min-h-screen bg-biblical-parchment flex flex-col relative font-sans text-biblical-charcoal">
      
      {/* Semantic Header */}
      <header className="pt-8 pb-6 text-center z-10">
        <h1 className="font-serif text-3xl md:text-4xl text-biblical-charcoal tracking-wide inline-block border-b border-biblical-gold/30 pb-2">
          Red Letter Daily
        </h1>
        <p className="mt-2 font-sans text-xs tracking-[0.2em] text-gray-500 uppercase">
          Give us today our daily bread
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center w-full px-4 md:px-6">
        
        {/* Verse Section - Hero */}
        <section className="w-full max-w-[720px] mx-auto pt-4 md:pt-12 pb-8">
          
          <figure 
            key={currentSaying.id} // Forces animation replay on change
            className="verse-card bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-stone-100 p-6 md:p-12 mb-8 animate-fade-in relative overflow-hidden"
          >
            {/* Subtle Texture/Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-biblical-gold/50 via-biblical-red/50 to-biblical-gold/50 opacity-60"></div>

            <blockquote className="text-center relative z-10">
              <p className="verse-primary font-serif text-[1.4rem] md:text-[1.8rem] leading-[1.5] text-biblical-red font-medium mb-6">
                “{currentSaying.text}”
              </p>
              
              <div className="w-12 h-px bg-biblical-red/20 mx-auto mb-6"></div>

              <p className="verse-secondary font-serif text-xl md:text-2xl leading-relaxed text-biblical-red/70 italic mb-8">
                {currentSaying.text_es}
              </p>
            </blockquote>

            <figcaption className="text-center">
              <div className="font-sans font-bold text-gray-800 tracking-wider text-sm md:text-base uppercase mb-6">
                {currentSaying.reference}
              </div>
              
              {/* External Tools - Ghost Buttons */}
              <div className="flex flex-wrap justify-center items-center gap-3">
                {[
                  { name: 'BibleHub', url: getBibleHubUrl(currentSaying.reference) },
                  { name: 'BibleGateway', url: getBibleGatewayUrl(currentSaying.reference) },
                  { name: 'StepBible', url: getStepBibleUrl(currentSaying.reference) }
                ].map((link) => (
                  <a 
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 text-xs font-medium tracking-wider uppercase border border-stone-200 rounded-full text-stone-500 hover:border-biblical-gold hover:text-biblical-red transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </figcaption>
          </figure>

          {/* Primary CTA */}
          <div className="flex justify-center mb-12">
            <button
              onClick={handleNewSaying}
              className="bg-biblical-red text-white px-8 py-3 rounded-full font-sans font-semibold tracking-wide shadow-md hover:bg-[#7a1200] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-w-[200px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-biblical-red"
            >
              Read Another
            </button>
          </div>

        </section>
      </main>

      {/* Footer & Sharing */}
      <footer className="w-full bg-white border-t border-stone-100 py-8 px-4 mt-auto">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-stone-200 flex-grow"></div>
              <h3 className="font-sans text-[10px] tracking-widest text-gray-400 uppercase whitespace-nowrap">Share the good news</h3>
              <div className="h-px bg-stone-200 flex-grow"></div>
          </div>
          
          <div className="flex justify-center gap-6">
             {/* Twitter */}
             <button onClick={() => handleShare('twitter')} aria-label="Share on X" className="text-gray-400 hover:text-biblical-red transition-colors transform hover:scale-110 duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg>
             </button>
             
             {/* Facebook */}
             <button onClick={() => handleShare('facebook')} aria-label="Share on Facebook" className="text-gray-400 hover:text-biblical-red transition-colors transform hover:scale-110 duration-200">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
             </button>

             {/* WhatsApp */}
             <button onClick={() => handleShare('whatsapp')} aria-label="Share on WhatsApp" className="text-gray-400 hover:text-biblical-red transition-colors transform hover:scale-110 duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.988 4.478-9.988 9.988 0 1.93.556 3.725 1.517 5.257l-1.54 5.378 5.626-1.444c1.436.837 3.095 1.32 4.886 1.32 5.506 0 9.987-4.479 9.987-9.988 0-5.51-4.481-9.988-9.988-9.988zm0 18.254c-1.616 0-3.136-.456-4.46-1.242l-.465-.276-2.924.752.8-2.775-.326-.533c-.93-1.523-1.423-3.264-1.423-5.074 0-4.526 3.682-8.208 8.208-8.208 4.526 0 8.208 3.682 8.208 8.208 0 4.526-3.682 8.208-8.208 8.208zm4.496-6.035c-.244-.122-1.453-0.716-1.678-0.798-.225-.082-.39-.122-.553.122-.164.244-.634.798-.777.962-.143.163-.286.183-.53.061-.245-.122-1.034-.381-1.97-1.215-.726-.648-1.216-1.448-1.358-1.693-.143-.245-.015-.378.107-.5.11-.11.245-.286.368-.429.122-.143.163-.245.245-.408.081-.163.04-.306-.02-.429-.061-.122-.553-1.327-.757-1.817-.2-.48-.4-.413-.553-.422-.142-.008-.306-.01-.469-.01-.163 0-.428.061-.653.306-.224.245-.857.837-.857 2.042 0 1.205.877 2.368 1 2.532.122.163 1.726 2.634 4.181 3.694.584.252 1.04.403 1.396.516.598.19 1.142.163 1.572.099.48-.072 1.453-.593 1.658-1.165.204-.572.204-1.062.143-1.165-.061-.102-.224-.163-.469-.286z"/></svg>
             </button>

             {/* Email */}
             <button onClick={() => handleShare('email')} aria-label="Share via Email" className="text-gray-400 hover:text-biblical-red transition-colors transform hover:scale-110 duration-200">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
             </button>

             {/* Copy */}
             <button onClick={() => handleShare('copy')} aria-label="Copy Link" className="text-gray-400 hover:text-biblical-red transition-colors transform hover:scale-110 duration-200 relative">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
               {copied && (
                   <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded animate-fade-in whitespace-nowrap">Copied</span>
               )}
             </button>
          </div>
        </div>
        
        <div className="text-center mt-8 text-gray-300 text-[10px]">
           &copy; {new Date().getFullYear()} Red Letter Daily
        </div>
      </footer>
    </div>
  );
};

export default App;