import React from 'react';
import { PromptState } from '../types';
import { OPTIONS } from '../constants';
import { Camera, Zap, Palette, MapPin, Film, Sliders } from 'lucide-react';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const BuilderSection: React.FC<SectionProps> = React.memo(({ title, icon, children, isOpen, onToggle }) => (
  <div className="border-b border-zinc-800 last:border-0">
    <button 
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-zinc-900 ${isOpen ? 'bg-zinc-900/50' : ''}`}
    >
      <div className="flex items-center gap-3 text-zinc-100">
        <span className="text-yellow-400">{icon}</span>
        <span className="font-semibold tracking-wide uppercase text-sm">{title}</span>
      </div>
      <span className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
    {isOpen && (
      <div className="p-5 bg-zinc-900/30 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-2 duration-200">
        {children}
      </div>
    )}
  </div>
));

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = React.memo(({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">{label}</label>
    {children}
  </div>
));

interface Props {
  state: PromptState;
  onChange: (key: keyof PromptState, value: string) => void;
}

export const PromptBuilder: React.FC<Props> = React.memo(({ state, onChange }) => {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    'subject': true,
    'lighting': true,
    'camera': false,
    'style': false
  });

  const toggleSection = React.useCallback((id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSubject = React.useCallback(() => toggleSection('subject'), [toggleSection]);
  const toggleLighting = React.useCallback(() => toggleSection('lighting'), [toggleSection]);
  const toggleCamera = React.useCallback(() => toggleSection('camera'), [toggleSection]);
  const toggleStyle = React.useCallback(() => toggleSection('style'), [toggleSection]);

  const inputClass = "bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all placeholder:text-zinc-700";
  const selectClass = "bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-all appearance-none cursor-pointer";

  return (
    <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      
      {/* Section 1: Subject & Framing */}
      <BuilderSection 
        title="Subject & Framing" 
        icon={<MapPin size={18} />}
        isOpen={openSections['subject']}
        onToggle={toggleSubject}
      >
        <InputGroup label="Main Subject">
          <input 
            type="text" 
            className={inputClass}
            placeholder="e.g. A futuristic samurai"
            value={state.subject}
            onChange={(e) => onChange('subject', e.target.value)}
          />
        </InputGroup>
        <InputGroup label="Action">
          <input 
            type="text" 
            className={inputClass}
            placeholder="e.g. drawing a katana"
            value={state.action}
            onChange={(e) => onChange('action', e.target.value)}
          />
        </InputGroup>
        <InputGroup label="Environment">
          <input 
            type="text" 
            className={inputClass}
            placeholder="e.g. neon-lit rain-slicked rooftop"
            value={state.environment}
            onChange={(e) => onChange('environment', e.target.value)}
          />
        </InputGroup>
        <InputGroup label="Shot Type">
          <select 
            className={selectClass}
            value={state.shotType}
            onChange={(e) => onChange('shotType', e.target.value)}
          >
            {OPTIONS.shotTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
        <InputGroup label="Angle">
          <select 
            className={selectClass}
            value={state.angle}
            onChange={(e) => onChange('angle', e.target.value)}
          >
             {OPTIONS.angles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
      </BuilderSection>

      {/* Section 2: Lighting & Mood */}
      <BuilderSection 
        title="Lighting & Mood" 
        icon={<Zap size={18} />}
        isOpen={openSections['lighting']}
        onToggle={toggleLighting}
      >
        <InputGroup label="Lighting Source">
           <select 
            className={selectClass}
            value={state.lighting}
            onChange={(e) => onChange('lighting', e.target.value)}
          >
             {OPTIONS.lighting.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
        <InputGroup label="Atmosphere / Mood">
          <input 
            type="text" 
            className={inputClass}
            placeholder="e.g. Melancholic, Tense, Ethereal"
            value={state.mood}
            onChange={(e) => onChange('mood', e.target.value)}
          />
        </InputGroup>
      </BuilderSection>

      {/* Section 3: Camera Gear */}
      <BuilderSection 
        title="Camera Gear" 
        icon={<Camera size={18} />}
        isOpen={openSections['camera']}
        onToggle={toggleCamera}
      >
         <InputGroup label="Camera Body">
           <select 
            className={selectClass}
            value={state.camera}
            onChange={(e) => onChange('camera', e.target.value)}
          >
             {OPTIONS.cameras.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
        <InputGroup label="Lens Type">
           <select 
            className={selectClass}
            value={state.lens}
            onChange={(e) => onChange('lens', e.target.value)}
          >
             {OPTIONS.lenses.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
        <InputGroup label="Film Stock / Look">
           <select 
            className={selectClass}
            value={state.filmLook}
            onChange={(e) => onChange('filmLook', e.target.value)}
          >
             {OPTIONS.filmLooks.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
      </BuilderSection>

      {/* Section 4: Style & Aesthetics */}
      <BuilderSection 
        title="Style & Aesthetics" 
        icon={<Palette size={18} />}
        isOpen={openSections['style']}
        onToggle={toggleStyle}
      >
        <InputGroup label="Photographic Style">
           <select 
            className={selectClass}
            value={state.style}
            onChange={(e) => onChange('style', e.target.value)}
          >
             {OPTIONS.styles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
        <InputGroup label="Movie Look">
           <select 
            className={selectClass}
            value={state.movieLook}
            onChange={(e) => onChange('movieLook', e.target.value)}
          >
             {OPTIONS.movieLooks.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
         <InputGroup label="Post-Process Filter">
           <select 
            className={selectClass}
            value={state.effect}
            onChange={(e) => onChange('effect', e.target.value)}
          >
             {OPTIONS.effects.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </InputGroup>
      </BuilderSection>

    </div>
  );
});