import React, { useState, useEffect, useCallback } from 'react';
import { PromptBuilder } from './components/PromptBuilder';
import { ElementsTool } from './components/ElementsTool';
import { PromptState, Preset, GenerationStatus, ElementReference } from './types';
import { INITIAL_STATE, SAMPLE_PRESETS } from './constants';
import { constructPrompt, generateImage } from './services/geminiService';
import { Sparkles, Terminal, Copy, Download, Zap, RotateCcw } from 'lucide-react';

const PresetList = React.memo(({ onApply }: { onApply: (preset: Preset) => void }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SAMPLE_PRESETS.map(preset => (
          <button
              key={preset.id}
              onClick={() => onApply(preset)}
              className="flex-shrink-0 group relative w-32 h-20 rounded-lg overflow-hidden border border-zinc-800 hover:border-yellow-400 transition-all"
          >
              <img src={preset.coverImage} alt={preset.name} loading="lazy" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent">
                  <span className="text-[10px] font-bold text-white uppercase text-center px-1 drop-shadow-md">{preset.name}</span>
              </div>
          </button>
      ))}
  </div>
));

export default function App() {
  const [promptState, setPromptState] = useState<PromptState>(INITIAL_STATE);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [elements, setElements] = useState<ElementReference[]>([]);

  // Calculate constructed prompt continuously without extra re-renders
  const constructedPrompt = React.useMemo(() => constructPrompt(promptState), [promptState]);

  const handleStateChange = useCallback((key: keyof PromptState, value: string) => {
    setPromptState(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePresetApply = useCallback((preset: Preset) => {
    setPromptState(preset.data);
  }, []);

  const handleClear = useCallback(() => {
    setPromptState(INITIAL_STATE);
    setResultImage(null);
    setStatus(GenerationStatus.IDLE);
    setElements(prev => {
      prev.forEach(el => {
        if (el.previewUrl) URL.revokeObjectURL(el.previewUrl);
      });
      return [];
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    setStatus(GenerationStatus.GENERATING);
    try {
      const imageUrl = await generateImage(constructedPrompt, elements);
      setResultImage(imageUrl);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(GenerationStatus.ERROR);
      alert('Failed to generate image. Please check API Key and try again.');
    }
  }, [constructedPrompt, elements]);

  const handleAddElement = useCallback((file: File, type: ElementReference['type']) => {
    const previewUrl = URL.createObjectURL(file);
    const newEl: ElementReference = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      file,
      previewUrl,
      base64: null // base64 is processed asynchronously at generation time
    };
    setElements(prev => {
      const existing = prev.find(e => e.type === type);
      if (existing && existing.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
      }
      return [...prev.filter(e => e.type !== type), newEl];
    });
  }, []);

  const handleRemoveElement = useCallback((id: string) => {
    setElements(prev => {
      const el = prev.find(e => e.id === id);
      if (el && el.previewUrl) {
        URL.revokeObjectURL(el.previewUrl);
      }
      return prev.filter(e => e.id !== id);
    });
  }, []);

  return (
    <div className="min-h-screen pb-32 relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[100px] transform-gpu" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] transform-gpu" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <Zap size={20} className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                            NANO BANANA <span className="text-yellow-400">PRO</span>
                        </h1>
                        <p className="text-[10px] text-zinc-500 tracking-widest uppercase font-mono">Cinematic Prompt Engine</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                     <button 
                        onClick={handleClear}
                        className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                    <div className="h-4 w-px bg-zinc-800" />
                     <span className={`text-xs font-mono flex items-center gap-2 ${status === GenerationStatus.GENERATING ? 'text-yellow-400 animate-pulse' : 'text-zinc-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${status === GenerationStatus.GENERATING ? 'bg-yellow-400' : 'bg-green-500'}`} />
                        {status === GenerationStatus.GENERATING ? 'GENERATING...' : 'SYSTEM READY'}
                    </span>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Builder */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* Presets Row */}
                <PresetList onApply={handlePresetApply} />

                <PromptBuilder state={promptState} onChange={handleStateChange} />
                <ElementsTool elements={elements} onAdd={handleAddElement} onRemove={handleRemoveElement} />
            </div>

            {/* Right Column: Preview & Output */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* Image Output Area */}
                <div className="w-full aspect-video bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
                    {resultImage ? (
                        <img src={resultImage} alt="Generated" className="w-full h-full object-cover shadow-2xl animate-in fade-in duration-500" />
                    ) : (
                        <div className="text-center space-y-4 opacity-30">
                            <Sparkles size={48} className="mx-auto text-zinc-500" />
                            <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest">Awaiting Input</p>
                        </div>
                    )}
                    
                    {/* Overlay Actions */}
                    {resultImage && (
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a 
                                href={resultImage} 
                                download={`nano-banana-${Date.now()}.png`}
                                className="bg-zinc-950/80 hover:bg-yellow-400 hover:text-black text-white p-2 rounded-lg border border-zinc-700 backdrop-blur-md transition-colors"
                            >
                                <Download size={20} />
                            </a>
                        </div>
                    )}

                    {status === GenerationStatus.GENERATING && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-yellow-400 font-mono text-sm tracking-widest animate-pulse">RENDERING PIXELS...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Prompt Terminal */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs md:text-sm text-zinc-400 relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-20" />
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-900">
                        <div className="flex items-center gap-2">
                             <Terminal size={14} className="text-yellow-500" />
                             <span className="text-zinc-500 uppercase font-bold">Live Prompt Feed</span>
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(constructedPrompt)}
                            className="text-zinc-600 hover:text-white transition-colors"
                            title="Copy to clipboard"
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap break-words min-h-[100px]">
                        {constructedPrompt || <span className="text-zinc-700 italic">// Configure settings to build prompt...</span>}
                    </p>
                </div>
            </div>
        </main>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                 <button 
                    onClick={handleGenerate}
                    disabled={status === GenerationStatus.GENERATING}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
                >
                    {status === GenerationStatus.GENERATING ? (
                        'Processing...'
                    ) : (
                        <>
                            <Sparkles size={20} className="animate-pulse" />
                            Generate Cinematic Image
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
}