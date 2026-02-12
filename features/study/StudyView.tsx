
import * as React from 'react';
import { StudyDocument, Concept, NotificationType, Flashcard } from '../../types';
import { processMaterial, generateFlashcards } from '../../services/geminiService';
import { calculateSM2, isCardDue } from '../../services/spacedRepetitionService';

const { useState, useMemo, useRef, useEffect } = React;

interface StudyViewProps {
  documents: StudyDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<StudyDocument[]>>;
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  notify: (msg: string, type: NotificationType) => void;
}

type SortOption = 'date' | 'title' | 'concepts';

const StudyView: React.FC<StudyViewProps> = ({ documents, setDocuments, activeDocId, setActiveDocId, notify }) => {
  const [activeView, setActiveView] = useState<'upload' | 'explorer'>('upload');
  const [tab, setTab] = useState<'notes' | 'concepts' | 'map' | 'flashcards'>('notes');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [currentProcessingType, setCurrentProcessingType] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isReviewing, setIsReviewing] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenieWorking, setIsGenieWorking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const explorerScrollRef = useRef<HTMLDivElement>(null);
  const selectedDoc = documents.find(d => d.id === activeDocId);

  useEffect(() => {
    if (activeDocId && explorerScrollRef.current) {
      explorerScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeDocId]);

  const mapLayout = useMemo(() => {
    if (!selectedDoc) return [];
    const centerX = 50, centerY = 50, radius = 35;
    return selectedDoc.concepts.map((c, i) => {
      if (i === 0) return { ...c, x: centerX, y: centerY, isCenter: true };
      const angle = ((i - 1) / (selectedDoc.concepts.length - 1)) * 2 * Math.PI;
      return { ...c, x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), isCenter: false };
    });
  }, [selectedDoc]);

  const filteredAndSortedDocs = useMemo(() => {
    let result = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === 'date') return b.uploadedAt - a.uploadedAt;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'concepts') return b.concepts.length - a.concepts.length;
      return 0;
    });

    return result;
  }, [documents, searchTerm, sortBy]);

  const handleUpload = async (uploadType: 'pdf' | 'video' | 'notes' | 'audio') => {
    if (!content.trim() && !selectedFile) {
      notify("Please provide a file or some text notes.", "info");
      return;
    }

    setIsProcessing(true);
    setCurrentProcessingType(uploadType);
    setProcessingStep('Genie is encoding your materials...');
    
    try {
      let fileData;
      if (selectedFile) {
        setProcessingStep('Synchronizing multimodal data streams...');
        const reader = new FileReader();
        const base64: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        fileData = { data: base64, mimeType: selectedFile.type };
      }
      
      setProcessingStep('Extracting atomic architectural concepts...');
      const result = await processMaterial(content, uploadType, fileData);
      
      const newDoc: StudyDocument = {
        id: `doc-${Date.now()}`,
        title: title || selectedFile?.name || "New Knowledge Unit",
        content: content || `Extracted from ${selectedFile?.name || 'manual input'}`,
        summary: result.summary,
        type: uploadType,
        uploadedAt: Date.now(),
        concepts: result.concepts,
        relationships: result.relationships,
        flashcards: []
      };

      setDocuments(prev => [...prev, newDoc]);
      setActiveDocId(newDoc.id);
      setActiveView('explorer');
      notify("Knowledge Unit Synced Successfully", "success");
      
      setTitle(''); 
      setContent(''); 
      setSelectedFile(null);
    } catch (err: any) {
      notify(err.message || "Failed to process knowledge.", "error");
    } finally {
      setIsProcessing(false);
      setCurrentProcessingType(null);
    }
  };

  const handleGenieFlashcards = async () => {
    if (!selectedDoc) return;
    setIsGenieWorking(true);
    try {
      const newCards = await generateFlashcards(selectedDoc.concepts);
      setDocuments(prev => prev.map(d => 
        d.id === selectedDoc.id 
        ? { ...d, flashcards: [...(d.flashcards || []), ...newCards] } 
        : d
      ));
      notify(`Synthesized ${newCards.length} magic flashcards!`, "success");
    } catch (e) {
      notify("Flashcard synthesis failed.", "error");
    } finally {
      setIsGenieWorking(false);
    }
  };

  const handleReviewResult = (quality: number) => {
    if (!selectedDoc) return;
    const cardsDue = (selectedDoc.flashcards || []).filter(isCardDue);
    const currentCard = cardsDue[currentCardIndex];
    
    if (!currentCard) return;

    const updatedCard = calculateSM2(currentCard, quality);
    
    setDocuments(prev => prev.map(d => 
      d.id === selectedDoc.id 
      ? { ...d, flashcards: (d.flashcards || []).map(c => c.id === currentCard.id ? updatedCard : c) } 
      : d
    ));

    if (currentCardIndex < cardsDue.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setIsReviewing(false);
      setCurrentCardIndex(0);
      notify("Neural session stabilized. Check back tomorrow for the next cycle.", "success");
    }
  };

  const getFileIcon = (file: File | null) => {
    if (!file) return '📁';
    if (file.type.includes('video')) return '🎬';
    if (file.type.includes('audio')) return '🎙️';
    if (file.type.includes('pdf')) return '📄';
    return '📄';
  };

  const cardsDueCount = selectedDoc?.flashcards?.filter(isCardDue).length || 0;

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <style>{`
        .flip-card { background-color: transparent; width: 100%; height: 400px; perspective: 1000px; }
        .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-style: preserve-3d; }
        .flip-card-flipped { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; border-radius: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); }
        .flip-card-front { background-color: #fff; border: 1px solid #f1f5f9; color: #0f172a; }
        .flip-card-back { background-color: #4f46e5; color: white; transform: rotateY(180deg); }
        
        .tab-button-active { background: white; color: #4f46e5; box-shadow: 0 4px 15px -2px rgba(79, 70, 229, 0.1); }
        .tab-container { background: #f1f5f9; border-radius: 18px; padding: 4px; display: inline-flex; }
        
        .knowledge-card { background: white; border: 1px solid #f1f5f9; border-radius: 2.5rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.006); }
        .knowledge-card:hover { transform: translateY(-4px); box-shadow: 0 25px 45px -10px rgba(0,0,0,0.04); border-color: #e2e8f0; }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .float-anim { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-slate-400 mb-2">Cognitive Hub</h2>
          <h1 className="text-4xl font-black text-indigo-950 tracking-tighter">Study Room</h1>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-full md:w-auto shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveView('upload')} 
            className={`flex-1 md:flex-none px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'upload' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
          >
            Deploy Source
          </button>
          <button 
            onClick={() => setActiveView('explorer')} 
            className={`flex-1 md:flex-none px-10 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'explorer' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
          >
            Vault Explorer
          </button>
        </div>
      </div>

      {activeView === 'upload' ? (
        <div className="bg-white p-8 md:p-16 rounded-[4rem] premium-shadow border border-slate-50 max-w-5xl mx-auto relative overflow-hidden">
          {isProcessing && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center text-center p-10 animate-fade-in">
              <div className="relative mb-10">
                <div className="w-24 h-24 border-[12px] border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-24 border-[12px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-2xl font-black text-indigo-950 mb-4 tracking-tighter">{processingStep}</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-xs">Synapse Sync in Progress...</p>
            </div>
          )}
          
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Subject Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Molecular Biology" 
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Contextual Notes</label>
                  <textarea 
                    placeholder="Paste transcripts or extra context..." 
                    className="w-full h-48 px-8 py-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-sm font-medium focus:outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all resize-none" 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                  />
                </div>
              </div>

              <div className="w-full md:w-80 space-y-6">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">File Capture</label>
                   <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`h-[336px] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 ${selectedFile ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 shadow-sm hover:shadow-xl'}`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                    <div className="bg-white w-20 h-20 rounded-[1.5rem] shadow-xl flex items-center justify-center text-4xl mb-6">
                      {getFileIcon(selectedFile)}
                    </div>
                    <p className="font-black text-slate-800 text-sm px-6 truncate w-full">{selectedFile ? selectedFile.name : 'Drop material here'}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedFile ? 'Ready for sync' : 'PDF, Vid, Aud'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleUpload('notes')} 
              disabled={isProcessing}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              Analyze & Extract Neural Architecture
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" ref={explorerScrollRef}>
          {/* Side Repository */}
          <div className="lg:col-span-4 space-y-4 max-h-[780px] overflow-y-auto pr-3 scrollbar-hide">
            <div className="px-4 space-y-4 mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Knowledge Vault</h3>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Filter vault..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-10 py-3 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredAndSortedDocs.map(doc => (
                <button 
                  key={doc.id} 
                  onClick={() => setActiveDocId(doc.id)} 
                  className={`w-full p-6 rounded-[2.5rem] border-2 text-left transition-all duration-300 relative overflow-hidden group ${activeDocId === doc.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white border-slate-50 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${activeDocId === doc.id ? 'bg-white/20' : 'bg-slate-50'}`}>
                      {doc.type === 'video' ? '🎬' : '📑'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">{doc.title}</p>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${activeDocId === doc.id ? 'opacity-60' : 'text-slate-400'}`}>{doc.concepts.length} Nodes</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {selectedDoc ? (
              <div className="space-y-6 animate-fade-in relative">
                
                {isReviewing ? (
                  <div className="knowledge-card min-h-[600px] flex flex-col items-center justify-center bg-slate-50 p-12 animate-fade-in">
                    <div className="w-full max-w-xl mb-12">
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Active Recall Cycle</h3>
                        <span className="text-[10px] font-black uppercase text-slate-400 mb-1">{currentCardIndex + 1} / {(selectedDoc.flashcards || []).filter(isCardDue).length}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${((currentCardIndex + 1) / ((selectedDoc.flashcards || []).filter(isCardDue).length || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="flip-card w-full max-w-xl" onClick={() => setIsFlipped(!isFlipped)}>
                      <div className={`flip-card-inner cursor-pointer ${isFlipped ? 'flip-card-flipped' : ''}`}>
                        <div className="flip-card-front">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">Stimulus</span>
                          <h3 className="text-2xl font-black leading-tight tracking-tight">{(selectedDoc.flashcards || []).filter(isCardDue)[currentCardIndex]?.front}</h3>
                          <div className="mt-auto px-6 py-2 bg-indigo-50 rounded-full text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tap to reveal synapse</div>
                        </div>
                        <div className="flip-card-back">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8">Concept Map</span>
                          <h3 className="text-xl font-medium">{(selectedDoc.flashcards || []).filter(isCardDue)[currentCardIndex]?.back}</h3>
                          <div className="mt-auto px-6 py-2 bg-white/10 rounded-full text-[9px] font-black text-white/60 uppercase tracking-widest">Evaluation Stage</div>
                        </div>
                      </div>
                    </div>

                    {isFlipped && (
                      <div className="mt-12 w-full max-w-xl grid grid-cols-4 gap-4 animate-slide-up">
                        {[
                          { label: 'Again', val: 1, color: 'bg-rose-500' },
                          { label: 'Hard', val: 3, color: 'bg-amber-500' },
                          { label: 'Good', val: 4, color: 'bg-emerald-500' },
                          { label: 'Easy', val: 5, color: 'bg-indigo-600' },
                        ].map(btn => (
                          <button 
                            key={btn.label}
                            onClick={(e) => { e.stopPropagation(); handleReviewResult(btn.val); }}
                            className={`${btn.color} p-5 rounded-2xl text-white shadow-xl transition-all hover:scale-105 active:scale-95`}
                          >
                            <p className="font-black text-[10px] uppercase tracking-widest">{btn.label}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setIsReviewing(false)} className="mt-12 text-slate-400 font-black text-[10px] uppercase tracking-widest">Abort Review</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="knowledge-card !p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-indigo-100">
                          {selectedDoc.type === 'video' ? '🎬' : '📑'}
                        </div>
                        <h3 className="text-xl font-black text-indigo-950 tracking-tighter truncate max-w-[200px]">{selectedDoc.title}</h3>
                      </div>
                      <div className="tab-container">
                        {['notes', 'concepts', 'map', 'flashcards'].map(t => (
                          <button 
                            key={t} 
                            onClick={() => setTab(t as any)} 
                            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all ${tab === t ? 'tab-button-active' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="animate-fade-in">
                      {tab === 'notes' && (
                        <div className="knowledge-card !p-10">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Executive Synthesis</h4>
                          <p className="text-xl font-bold text-indigo-950 leading-relaxed italic mb-10">"{selectedDoc.summary}"</p>
                          <div className="h-px bg-slate-50 mb-10"></div>
                          <p className="text-sm text-slate-600 leading-loose whitespace-pre-wrap">{selectedDoc.content}</p>
                        </div>
                      )}

                      {tab === 'concepts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {selectedDoc.concepts.map(c => (
                            <div key={c.id} className="knowledge-card !p-8 flex flex-col hover:border-indigo-200">
                              <div className="flex justify-between items-start mb-6">
                                <h5 className="font-black text-indigo-950 text-lg leading-tight">{c.name}</h5>
                                <span className="text-[9px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase">{c.masteryLevel}%</span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 flex-1">{c.description}</p>
                              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${c.masteryLevel}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {tab === 'map' && (
                        <div className="knowledge-card h-[600px] relative bg-slate-50/50 border-2 border-slate-100 flex items-center justify-center overflow-hidden p-0 rounded-[3rem]">
                           {mapLayout.map((c, i) => (
                             <div 
                               key={i} 
                               className={`absolute p-6 rounded-[2rem] shadow-2xl text-center min-w-[160px] transition-all duration-500 animate-pop-in cursor-default ${c.isCenter ? 'bg-indigo-600 text-white z-10 scale-110 shadow-indigo-200' : 'bg-white border-2 border-indigo-50 scale-100 hover:scale-110'}`} 
                               style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.1}s` }}
                             >
                               <p className={`font-black uppercase tracking-tighter ${c.isCenter ? 'text-xs' : 'text-slate-800 text-[10px]'}`}>{c.name}</p>
                             </div>
                           ))}
                        </div>
                      )}

                      {tab === 'flashcards' && (
                        <div className="space-y-6">
                          <div className="knowledge-card !p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div>
                              <h3 className="text-xl font-black text-indigo-950 tracking-tighter">Memory Matrix</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Spaced Repetition Engine</p>
                            </div>
                            <button 
                              onClick={handleGenieFlashcards}
                              disabled={isGenieWorking}
                              className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {isGenieWorking ? 'Synthesizing...' : '✨ Synapse Synthesis'}
                            </button>
                          </div>

                          {cardsDueCount > 0 && (
                            <div className="knowledge-card !p-12 bg-indigo-950 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-indigo-300 group overflow-hidden border-none">
                              <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl -rotate-12 float-anim pointer-events-none">🃏</div>
                              <div className="relative z-10 text-center md:text-left">
                                <h4 className="text-3xl font-black tracking-tighter mb-2">Neural Refresh Ready</h4>
                                <p className="text-indigo-200 text-sm font-medium max-w-sm">You have {cardsDueCount} due cards optimized for recall.</p>
                              </div>
                              <button 
                                onClick={() => { setIsReviewing(true); setCurrentCardIndex(0); setIsFlipped(false); }}
                                className="mt-8 md:mt-0 px-10 py-5 bg-white text-indigo-950 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all relative z-10 shadow-xl"
                              >
                                Initiate Session
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(selectedDoc.flashcards || []).map(card => {
                              const due = isCardDue(card);
                              return (
                                <div key={card.id} className="knowledge-card !p-8 flex flex-col hover:border-indigo-100 min-h-[220px] transition-all">
                                  <div className="flex justify-between items-start mb-6">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Atomic Card</span>
                                    {due ? (
                                      <span className="text-[9px] font-black uppercase text-amber-500 animate-pulse bg-amber-50 px-3 py-1 rounded-md border border-amber-100">Recall Due</span>
                                    ) : (
                                      <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">Stable</span>
                                    )}
                                  </div>
                                  <p className="font-black text-slate-800 text-sm leading-relaxed mb-6 line-clamp-3">{card.front}</p>
                                  <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center opacity-60">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Int: {card.interval}d</span>
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                      {due ? 'Review Now' : `Next: ${new Date(card.nextReviewAt).toLocaleDateString()}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[700px] bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-6">
                <div className="w-24 h-24 bg-white rounded-[3rem] shadow-xl flex items-center justify-center text-5xl grayscale opacity-20">🏛️</div>
                <div className="text-center">
                   <p className="font-black text-[10px] uppercase tracking-[0.5em]">Vault Explorer</p>
                   <p className="text-sm font-medium mt-3">Select a source unit to begin neural mapping.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyView;
