import React from 'react';
import { ReflectionState } from '../types';

interface GeminiReflectionProps {
  reflectionState: ReflectionState;
  onGenerate: () => void;
  disabled: boolean;
}

export const GeminiReflection: React.FC<GeminiReflectionProps> = ({ reflectionState, onGenerate, disabled }) => {
  const { isLoading, content, error } = reflectionState;

  if (content) {
    return (
      <div className="mt-8 p-6 bg-biblical-parchment border border-biblical-gold/30 rounded-lg shadow-sm animate-fade-in">
        <h3 className="text-biblical-gold font-sans uppercase tracking-widest text-xs font-bold mb-2">
          Theological Reflection
        </h3>
        <p className="text-biblical-charcoal font-serif text-lg leading-relaxed italic">
          {content}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-center text-red-500 text-sm font-sans">
        <p>Unable to load reflection. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={onGenerate}
        disabled={disabled || isLoading}
        className={`
          group relative inline-flex items-center justify-center px-6 py-2 
          overflow-hidden font-sans text-sm font-medium tracking-tighter 
          text-biblical-charcoal transition-all duration-300 
          bg-white border border-gray-200 rounded-full 
          hover:bg-biblical-stone hover:text-biblical-red focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className="relative flex items-center gap-2">
            {isLoading ? (
                 <>
                   <svg className="animate-spin -ml-1 h-4 w-4 text-biblical-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span>Contemplating...</span>
                 </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-biblical-gold">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    <span>Reflect on this Verse</span>
                </>
            )}
        </span>
      </button>
    </div>
  );
};
