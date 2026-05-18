import React from 'react';
import { ElementReference } from '../types';
import { Plus, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  elements: ElementReference[];
  onAdd: (file: File, type: ElementReference['type']) => void;
  onRemove: (id: string) => void;
}

export const ElementsTool: React.FC<Props> = React.memo(({ elements, onAdd, onRemove }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeType, setActiveType] = React.useState<ElementReference['type']>('scene');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAdd(e.target.files[0], activeType);
    }
    // Reset
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = (type: ElementReference['type']) => {
    setActiveType(type);
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-100 font-semibold uppercase tracking-wide flex items-center gap-2">
          <ImageIcon size={18} className="text-yellow-400" /> Elements Tool
        </h3>
        <span className="text-xs text-zinc-500">Multimodal References</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Render Slots */}
        {(['face', 'outfit', 'scene', 'global'] as const).map(type => {
            const existing = elements.find(e => e.type === type);
            return (
                <div key={type} className="group relative aspect-square rounded-lg border border-dashed border-zinc-700 hover:border-yellow-400/50 transition-colors bg-zinc-900/30 overflow-hidden flex flex-col items-center justify-center">
                    {existing ? (
                        <>
                            <img src={existing.previewUrl || ''} alt={type} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => onRemove(existing.id)}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                            >
                                <X size={12} />
                            </button>
                            <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-center py-1 uppercase font-bold tracking-widest text-zinc-300">
                                {type}
                            </div>
                        </>
                    ) : (
                        <button 
                            onClick={() => triggerUpload(type)}
                            className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-yellow-400 transition-colors"
                        >
                            <Plus size={24} />
                            <span className="text-xs uppercase font-bold">{type} Ref</span>
                        </button>
                    )}
                </div>
            );
        })}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
});