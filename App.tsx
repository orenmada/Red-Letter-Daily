
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { JESUS_SAYINGS } from './data/sayings';
import { Saying } from './types';

const App: React.FC = () => {
  const [currentSaying, setCurrentSaying] = useState<Saying | null>(null);
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // --- Routing & Data Logic ---

  const sayingsByGospel = useMemo(() => {
    const groups: Record<string, Saying[]> = {};
    JESUS_SAYINGS.forEach(s => {
      const book = s.reference.split(' ')[0];
      if (!groups[book]) groups[book] = [];
      groups[book].push(s);
    });
    return groups;
  }, []);

  const getRandomSaying = useCallback(() => {
    const gospels = Object.keys(sayingsByGospel);
    if (gospels.length === 0) return JESUS_SAYINGS[0];
    const randomGospel = gospels[Math.floor(Math.random() * gospels.length)];
    const verses = sayingsByGospel[randomGospel];
    return verses[Math.floor(Math.random() * verses.length)];
  }, [sayingsByGospel]);

  const getSayingById = useCallback((id: string) => {
    return JESUS_SAYINGS.find(s => s.id.toString() === id);
  }, []);

  useEffect(() => {
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
          document.title = `${found.reference} | Red Letter Daily`;
          return;
        }
      }
      const random = getRandomSaying();
      setCurrentSaying(random);
      document.title = `Red Letter Daily`;
      try {
        window.history.replaceState(null, "", `?id=${random.id}`);
      } catch (e) {
        console.warn("History API restricted:", e);
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);

    // Listen for the beforeinstallprompt event for Android/Chrome
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [getSayingById, getRandomSaying]);

  const handleNewSaying = () => {
    let newSaying = getRandomSaying();
    while (newSaying.id === currentSaying?.id && JESUS_SAYINGS.length > 1) {
      newSaying = getRandomSaying();
    }
    setCurrentSaying(newSaying);
    document.title = `${newSaying.reference} | Red Letter Daily`;
    try {
      window.history.pushState(null, "", `?id=${newSaying.id}`);
    } catch (e) {
      console.warn("History API restricted:", e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      // If no native prompt (likely iOS or already installed), show a guide
      setShowInstallGuide(true);
    }
  };

  const handleShare = (platform: string) => {
    if (!currentSaying) return;
    let url = `${window.location.origin}${window.location.pathname}?id=${currentSaying.id}`;
    const text = `"${currentSaying.text}" - ${currentSaying.reference}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);
    
    switch (platform) {
      case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank'); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank'); break;
      case 'whatsapp':
        const waMessage = `Here is a verse I thought you would like:\n\n${text}\n\nFor more sayings of Jesus check this link:\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(waMessage)}`, '_blank');
        break;
      case 'email': window.location.href = `mailto:?subject=A Saying of Jesus&body=${encodedText}%0A%0A${encodedUrl}`; break;
      case 'copy':
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }
  };

  const getBibleHubUrl = (reference: string) => {
    const match = reference.match(/^(.+)\s(\d+):(\d+)/);
    if (match) {
      const book = match[1].toLowerCase().replace(/\s+/g, '_');
      return `https://biblehub.com/${book}/${match[2]}-${match[3]}.htm`;
    }
    return "https://biblehub.com/";
  };

  if (!currentSaying) return <div className="min-h-screen bg-biblical-parchment"></div>;

  return (
    <div className="min-h-screen bg-biblical-parchment flex flex-col relative font-sans text-biblical-charcoal overflow-x-hidden">
      
      {/* iOS Install Guide Overlay */}
      {showInstallGuide && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:hidden animate-fade-in-overlay"
          onClick={() => setShowInstallGuide(false)}
        >
          <div className="bg-white w-full rounded-t-3xl p-8 pb-12 shadow-2xl animate-fade-in">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h2 className="font-serif text-2xl text-biblical-charcoal mb-4 text-center">Add to Home Screen</h2>
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              To use this app anytime, tap the <span className="inline-block p-1.5 bg-gray-100 rounded-md"><svg className="w-4 h-4 text-blue-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span> <strong>Share</strong> icon and then select <strong>'Add to Home Screen'</strong>.
            </p>
            <button 
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-4 bg-biblical-red text-white rounded-full font-bold uppercase tracking-widest text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <header className="pt-8 pb-6 px-4 text-center z-10 w-full">
        <h1 className="font-serif text-3xl md:text-4xl text-biblical-charcoal tracking-[0.04em] inline-block border-b border-biblical-gold/30 pb-2 break-words max-w-full">
          Red Letter Daily
        </h1>
        <p className="mt-3 font-sans text-[10px] md:text-xs tracking-[0.25em] text-gray-500 uppercase break-words">
          Give us today our daily bread
        </p>
      </header>

      <main className="flex-grow flex flex-col items-center w-full px-4 md:px-6 box-border">
        <section className="w-full max-w-[640px] md:max-w-[720px] mx-auto pt-6 md:pt-16 pb-8">
          
          <figure className="verse-card bg-[#FAFAFA] rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 p-6 md:p-14 mb-10 animate-fade-in relative overflow-hidden w-full mx-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-biblical-gold/50 via-biblical-red/50 to-biblical-gold/50 opacity-60"></div>
            <blockquote className="text-center relative z-10 max-w-[95%] md:max-w-[90%] mx-auto">
              <p className="verse-primary font-serif text-[clamp(1.2rem,5vw,1.8rem)] leading-[1.4] md:leading-[1.5] text-biblical-red font-medium mb-6 md:mb-8 break-words">
                {currentSaying.text}
              </p>
              <div className="w-12 md:w-16 h-px bg-biblical-red/10 mx-auto mb-6 md:mb-8"></div>
              <p className="verse-secondary font-serif text-[clamp(1rem,4vw,1.5rem)] leading-relaxed text-biblical-red/70 italic mb-2 break-words">
                {currentSaying.text_es}
              </p>
            </blockquote>
            <figcaption className="text-center mt-10 md:mt-12">
              <div className="font-sans font-medium text-stone-600 tracking-[0.25em] text-xs md:text-base uppercase mb-8 break-words">
                {currentSaying.reference}
              </div>
              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
                {['BibleHub', 'BibleGateway', 'StepBible'].map((name) => (
                  <a 
                    key={name}
                    href={name === 'BibleHub' ? getBibleHubUrl(currentSaying.reference) : name === 'BibleGateway' ? `https://www.biblegateway.com/passage/?search=${encodeURIComponent(currentSaying.reference)}&version=NIV` : `https://www.stepbible.org/?q=version=ESV|reference=${encodeURIComponent(currentSaying.reference)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase border border-stone-200 rounded-full text-stone-400 hover:border-biblical-gold hover:text-biblical-red hover:bg-biblical-parchment transition-all duration-300"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </figcaption>
          </figure>

          <div className="w-full max-w-xs md:max-w-sm mx-auto mb-8 md:mb-10">
            <div className="flex items-center gap-4 mb-5">
                <div className="h-px bg-stone-300 flex-grow"></div>
                <h3 className="font-sans text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-stone-500 uppercase whitespace-nowrap">Share the good news</h3>
                <div className="h-px bg-stone-300 flex-grow"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
               <button onClick={() => handleShare('twitter')} aria-label="Share on X" className="text-stone-600 hover:text-biblical-red transition-all duration-200 p-2"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" /></svg></button>
               <button onClick={() => handleShare('facebook')} aria-label="Share on Facebook" className="text-stone-600 hover:text-biblical-red transition-all duration-200 p-2"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></button>
               <button onClick={() => handleShare('whatsapp')} aria-label="Share on WhatsApp" className="text-stone-600 hover:text-biblical-red transition-all duration-200 p-2"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.988 4.478-9.988 9.988 0 1.93.556 3.725 1.517 5.257l-1.54 5.378 5.626-1.444c1.436.837 3.095 1.32 4.886 1.32 5.506 0 9.987-4.479 9.987-9.988 0-5.51-4.481-9.988-9.988-9.988zm0 18.254c-1.616 0-3.136-.456-4.46-1.242l-.465-.276-2.924.752.8-2.775-.326-.533c-.93-1.523-1.423-3.264-1.423-5.074 0-4.526 3.682-8.208 8.208-8.208 4.526 0 8.208 3.682 8.208 8.208 0 4.526-3.682 8.208-8.208 8.208zm4.496-6.035c-.244-.122-1.453-0.716-1.678-0.798-.225-.082-.39-.122-.553.122-.164.244-.634.798-.777.962-.143.163-.286.183-.53.061-.245-.122-1.034-.381-1.97-1.215-.726-.648-1.216-1.448-1.358-1.693-.143-.245-.015-.378.107-.5.11-.11.245-.286.368-.429.122-.143.163-.245.245-.408.081-.163.04-.306-.02-.429-.061-.122-.553-1.327-.757-1.817-.2-.48-.4-.413-.553-.422-.142-.008-.306-.01-.469-.01-.163 0-.428.061-.653.306-.224.245-.857.837-.857 2.042 0 1.205.877 2.368 1 2.532.122.163 1.726 2.634 4.181 3.694.584.252 1.04.403 1.396.516.598.19 1.142.163 1.572.099.48-.072 1.453-.593 1.658-1.165.204-.572.204-1.062.143-1.165-.061-.102-.224-.163-.469-.286z"/></svg></button>
               <button onClick={() => handleShare('email')} aria-label="Share via Email" className="text-stone-600 hover:text-biblical-red transition-all duration-200 p-2"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></button>
               <button onClick={() => handleShare('copy')} aria-label="Copy Link" className="text-stone-600 hover:text-biblical-red transition-all duration-200 p-2 relative">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                 {copied && <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded animate-fade-in whitespace-nowrap">Copied</span>}
               </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mb-12 md:mb-16 w-full">
            <button
              onClick={handleNewSaying}
              className="bg-biblical-red text-white px-8 md:px-12 py-4 rounded-full font-sans font-bold tracking-widest text-xs md:text-sm uppercase shadow-[0_10px_20px_-8px_rgba(142,22,0,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(142,22,0,0.5)] transition-all duration-300 transform active:scale-95 w-[80%] max-w-[260px]"
            >
              Read Another
            </button>

            {/* Mobile Only: Install/Save Button */}
            <button
              onClick={handleInstallClick}
              className="md:hidden flex items-center justify-center gap-2 text-biblical-gold font-sans font-bold tracking-widest text-[10px] uppercase border border-biblical-gold/30 px-6 py-3 rounded-full w-[80%] max-w-[260px] bg-white hover:bg-biblical-parchment"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Install App
            </button>
          </div>

        </section>
      </main>

      <footer className="w-full bg-white border-t border-stone-100 py-6 md:py-8 px-4 mt-auto">
        <div className="text-center text-gray-300 text-[10px]">
           &copy; {new Date().getFullYear()} Red Letter Daily
        </div>
      </footer>
    </div>
  );
};

export default App;
