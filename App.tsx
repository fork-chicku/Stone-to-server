
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import { analyzeRuin, generateRestorationImage } from './services/geminiService';
import { RestorationAnalysis, AppState } from './types';

// Extend window for AI Studio helpers - Ensure type compatibility with pre-existing AIStudio interface
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RestorationAnalysis | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Key check failed", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success per instructions to avoid race conditions
      if (state === AppState.ERROR) reset();
    }
  };

  useEffect(() => {
    // Atmosphere: Indian Flute / Ambient drone
    const audio = new Audio("https://cdn.pixabay.com/audio/2022/05/27/audio_1808f3030e.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const startAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          console.log("Ambience initiated.");
          window.removeEventListener('click', startAudio);
          window.removeEventListener('touchstart', startAudio);
        }).catch(() => {});
      }
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, []);

  const handleImageSelected = async (base64: string) => {
    try {
      setError(null);
      setSelectedImage(base64);
      setState(AppState.ANALYZING);
      
      const result = await analyzeRuin(base64);
      setAnalysis(result);
      setState(AppState.VIEWING_ANALYSIS);
    } catch (err: any) {
      console.error(err);
      setError("The vision is clouded. Please try a different perspective.");
      setState(AppState.ERROR);
    }
  };

  const handleStartRestoration = async () => {
    if (!analysis) return;
    try {
      setState(AppState.RESTORING);
      const imageUrl = await generateRestorationImage(analysis);
      setRestoredImage(imageUrl);
      setState(AppState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      // If the error suggests authorization issues, flag the key state
      if (err.message?.includes("authorized") || err.message?.includes("entity was not found")) {
        setHasKey(false);
      }
      setError(err.message || "The sculptors could not complete the vision.");
      setState(AppState.ERROR);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setRestoredImage(null);
    setError(null);
    setState(AppState.IDLE);
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-orange-900 selection:text-amber-50">
      <Header />

      {/* Persistent Key Selector Overlay if required */}
      {!hasKey && state === AppState.IDLE && (
        <div className="fixed inset-0 z-[100] bg-stone-900/90 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass max-w-md p-10 text-center space-y-6 rounded-lg border-2 border-amber-600/50">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-900 text-2xl font-bold">!</div>
            <h2 className="text-3xl font-bold text-stone-900">Project Authorization</h2>
            <p className="text-stone-700 font-serif italic text-lg leading-relaxed">
              "To manifest the divine architecture, one must first present the seal of the archives."
            </p>
            <p className="text-sm text-stone-500">
              Restoration imagery requires an API key from a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-amber-700 underline font-bold">paid GCP project</a>.
            </p>
            <button 
              onClick={handleOpenKeySelection}
              className="w-full py-4 bg-orange-900 hover:bg-orange-800 text-amber-50 font-bold tracking-widest uppercase text-sm rounded shadow-xl transition-all border border-amber-600/30"
            >
              Select Authorized Key
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto mt-20 relative z-10 px-6">
        {state === AppState.IDLE && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-stone-900 drop-shadow-sm">
                The Forgotten Empire
              </h2>
              <div className="flex justify-center items-center gap-4 opacity-70">
                <div className="h-px w-24 bg-gradient-to-l from-amber-700 to-transparent"></div>
                <div className="w-3 h-3 rotate-45 bg-amber-700"></div>
                <div className="h-px w-24 bg-gradient-to-r from-amber-700 to-transparent"></div>
              </div>
              <p className="text-xl md:text-2xl text-stone-700 font-serif max-w-2xl mx-auto leading-relaxed italic">
                "Awaken the stones of Hampi. Restore the glory of Vijayanagara."
              </p>
            </div>
            <ImageUploader onImageSelected={handleImageSelected} isLoading={false} />
          </div>
        )}

        {/* Updated state condition to handle ANALYZING exclusively as a full-screen-ish loader */}
        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 glass rounded-lg max-w-2xl mx-auto mt-10">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-amber-100 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-orange-800 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center text-orange-900 font-bold text-xl">ॐ</div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-stone-800 tracking-widest uppercase">
                Consulting the Shilpa Shastras...
              </h2>
              <p className="text-stone-600 italic">Reading history etched in stone.</p>
            </div>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="max-w-xl mx-auto glass p-12 rounded-lg text-center border-t-4 border-red-800 shadow-2xl mt-10">
            <h3 className="text-3xl font-bold text-red-900 mb-4">The Process Falters</h3>
            <p className="text-stone-700 mb-8 font-serif italic text-lg">{error}</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button onClick={reset} className="px-10 py-3 bg-stone-800 hover:bg-stone-700 text-amber-50 rounded-sm font-bold tracking-widest uppercase text-sm transition-colors border border-stone-600">Return to Beginning</button>
              {!hasKey && (
                <button onClick={handleOpenKeySelection} className="px-10 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-sm font-bold tracking-widest uppercase text-sm transition-colors border border-amber-500">Update Project Key</button>
              )}
            </div>
          </div>
        )}

        {/* Updated state condition to include AppState.RESTORING, ensuring analysis is visible during reconstruction */}
        {(state === AppState.VIEWING_ANALYSIS || state === AppState.RESTORING || state === AppState.COMPLETED) && analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="lg:col-span-4 space-y-6">
              <div className="glass p-4 rounded-lg border border-amber-900/10 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-900 to-amber-600"></div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 mb-3 mt-2">The Relic</h4>
                <img src={selectedImage!} alt="Original Ruin" className="w-full rounded border border-stone-200 shadow-sm sepia-[.15] group-hover:sepia-0 transition-all duration-700" />
              </div>

              <div className="glass p-8 rounded-lg border-l-4 border-l-orange-800 shadow-lg">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-800 mb-4 pb-2 border-b border-orange-800/20">Historical Context</h4>
                <p className="text-stone-800 font-serif text-lg leading-relaxed italic">"{analysis.historicalContext}"</p>
              </div>

              {state === AppState.VIEWING_ANALYSIS && (
                <button
                  onClick={handleStartRestoration}
                  className="w-full py-5 bg-gradient-to-r from-orange-900 to-amber-800 hover:from-orange-800 hover:to-amber-700 text-amber-50 font-bold tracking-widest uppercase text-sm rounded shadow-xl shadow-orange-900/20 hover:-translate-y-1 transition-all duration-300 border border-amber-500/30"
                >
                  Initiate Restoration
                </button>
              )}
              
              <button 
                onClick={reset}
                className="w-full py-4 bg-white/40 hover:bg-white/80 border border-stone-300 text-stone-700 font-bold tracking-widest uppercase text-xs rounded transition-colors"
              >
                Examine Another Artifact
              </button>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {state === AppState.COMPLETED && restoredImage ? (
                <div className="glass p-2 rounded-lg shadow-2xl border border-amber-900/10 animate-in fade-in duration-1000">
                   <div className="bg-[#f5efe6] p-4 border-b border-amber-900/10 flex justify-between items-center rounded-t-lg">
                     <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs">Divine Reconstruction</h4>
                     <span className="text-xs text-orange-800 font-bold uppercase border border-orange-800 px-3 py-1 rounded-full bg-orange-50">Restored</span>
                   </div>
                   <img src={restoredImage} alt="Restored" className="w-full rounded-b" />
                </div>
              ) : (
                <div className="glass p-10 rounded-lg h-[450px] flex items-center justify-center text-center border-2 border-dashed border-stone-300 bg-stone-50/30">
                  <div className="max-w-md space-y-4">
                    <h3 className="text-3xl font-bold text-stone-800">Blueprint Unfurled</h3>
                    {/* state === AppState.RESTORING is now correctly reachable within this block */}
                    <p className="text-stone-600 font-serif italic text-lg">
                      {state === AppState.RESTORING ? '"Invoking the artisans of ancient Hampi..."' : '"The artisans await your command to begin reconstruction."'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-8 rounded-lg border-t-4 border-stone-500 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-600 mb-4 pb-2 border-b border-stone-200">Present Condition</h4>
                  <p className="text-stone-800 font-serif leading-relaxed text-lg">{analysis.statusReport}</p>
                </div>
                <div className="glass p-8 rounded-lg border-t-4 border-amber-600 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800 mb-4 pb-2 border-b border-amber-100">Restoration Blueprint</h4>
                  <p className="text-stone-800 font-serif leading-relaxed text-lg whitespace-pre-line">{analysis.restorationBlueprint}</p>
                </div>
                <div className="glass p-8 rounded-lg md:col-span-2 border border-stone-200 bg-[#fdfbf7] shadow-inner">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Architectural Prompt (Generative Matrix)</h4>
                  <div className="font-mono text-xs text-stone-600 leading-relaxed bg-white/60 p-5 border border-stone-200 rounded text-justify">
                     {analysis.aiVisualizationPrompt}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-3 bg-[#271c19] z-40 px-6 text-[11px] text-stone-400 flex justify-between items-center tracking-widest uppercase font-serif border-t border-amber-900/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
          Project: Stone to Server
        </div>
        <div>© Vijayanagara Empire Archive</div>
      </footer>
    </div>
  );
};

export default App;
