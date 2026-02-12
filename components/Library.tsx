
import React, { useState } from 'react';
import { StudyDocument } from '../types';
import { processMaterial } from '../services/geminiService';

interface LibraryProps {
  documents: StudyDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<StudyDocument[]>>;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
}

const Library: React.FC<LibraryProps> = ({ documents, setDocuments, selectedDocId, setSelectedDocId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');

  const handleUpload = async () => {
    if (!uploadText.trim() || !uploadTitle.trim()) return;

    setIsUploading(true);
    try {
      // Use processMaterial to get full document structure including relationships and summary
      const result = await processMaterial(uploadText, 'notes');
      const docId = result.concepts[0]?.documentId || `doc-${Date.now()}`;
      
      // Fix: Add missing 'flashcards' property to satisfy the StudyDocument interface requirements
      const newDoc: StudyDocument = {
        id: docId,
        title: uploadTitle,
        content: uploadText,
        summary: result.summary,
        type: 'notes',
        uploadedAt: Date.now(),
        concepts: result.concepts,
        relationships: result.relationships,
        flashcards: []
      };

      setDocuments(prev => [...prev, newDoc]);
      setUploadText('');
      setUploadTitle('');
      setSelectedDocId(newDoc.id);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to extract concepts. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Left Pane: Doc List & Upload */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Add Study Material</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Document Title (e.g. Physics 101)" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <textarea 
              placeholder="Paste notes or text here..." 
              className="w-full h-40 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
            />
            <button 
              onClick={handleUpload}
              disabled={isUploading || !uploadText || !uploadTitle}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
                isUploading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Concepts...
                </span>
              ) : '✨ Analyze & Extract'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Your Library</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedDocId === doc.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-700 truncate">{doc.title}</div>
                <div className="text-xs text-slate-400 mt-1">{doc.concepts.length} Concepts</div>
              </button>
            ))}
            {documents.length === 0 && <p className="text-slate-400 text-sm italic text-center py-4">Your library is empty.</p>}
          </div>
        </div>
      </div>

      {/* Right Pane: Content Detail */}
      <div className="lg:col-span-8">
        {selectedDoc ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[600px] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedDoc.title}</h2>
                <p className="text-sm text-slate-400">Added on {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id))}
                className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                title="Remove Document"
              >
                🗑️
              </button>
            </div>

            <div className="space-y-8">
              <section>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Extracted Concepts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDoc.concepts.map(concept => (
                    <div key={concept.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                      <h5 className="font-bold text-indigo-700 mb-2">{concept.name}</h5>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">{concept.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Mastery</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${concept.masteryLevel}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-700">{concept.masteryLevel}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Material Source</h4>
                <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {selectedDoc.content}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <span className="text-6xl mb-4">🧐</span>
            <p className="text-lg font-medium">Select a document or upload new notes to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;