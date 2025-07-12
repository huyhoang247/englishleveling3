// src/admin.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { auth } from './firebase.js';

// --- Hằng số ---
const ADMIN_EMAIL = 'vanlongt309@gmail.com';

// --- Icons ---
const XIcon = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const SaveIcon = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
const TrashIcon = ({ size = 20, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const RefreshCwIcon = ({ size = 16, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);


// --- Component chính ---
interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // NOTE: Firestore web SDK cannot list collections. You must define them here.
  const collectionsToManage = ['users', 'appData'];
  
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ id: string }[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docData, setDocData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const db = getFirestore();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, []);

  const fetchDocuments = useCallback(async (collectionName: string) => {
    setIsLoading(true);
    setSelectedDocId(null);
    setDocData('');
    setError(null);
    try {
      const docsSnap = await getDocs(collection(db, collectionName));
      const docsList = docsSnap.docs.map(doc => ({ id: doc.id }));
      setDocuments(docsList);
    } catch (e: any) {
      setError(`Lỗi khi tải documents: ${e.message}`);
      setDocuments([]);
    }
    setIsLoading(false);
  }, [db]);

  const fetchDocumentData = useCallback(async (collectionName: string, docId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDocData(JSON.stringify(docSnap.data(), null, 2));
      } else {
        setError('Document không tồn tại.');
        setDocData('');
      }
    } catch (e: any) {
      setError(`Lỗi khi tải dữ liệu document: ${e.message}`);
      setDocData('');
    }
    setIsLoading(false);
  }, [db]);

  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments(selectedCollection);
    }
  }, [selectedCollection, fetchDocuments]);

  useEffect(() => {
    if (selectedCollection && selectedDocId) {
      fetchDocumentData(selectedCollection, selectedDocId);
    }
  }, [selectedCollection, selectedDocId, fetchDocumentData]);

  const handleSave = async () => {
    if (!selectedCollection || !selectedDocId) return;

    let dataToSave: DocumentData;
    try {
        dataToSave = JSON.parse(docData);
    } catch (e) {
        setSaveStatus('error');
        setError("Lỗi: Dữ liệu JSON không hợp lệ.");
        setTimeout(() => { setSaveStatus('idle'); setError(null); }, 3000);
        return;
    }

    setSaveStatus('saving');
    setError(null);
    try {
        const docRef = doc(db, selectedCollection, selectedDocId);
        await setDoc(docRef, dataToSave, { merge: true }); // Use merge to avoid overwriting fields not in the JSON
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e: any) {
        setSaveStatus('error');
        setError(`Lỗi khi lưu: ${e.message}`);
        setTimeout(() => { setSaveStatus('idle'); setError(null); }, 3000);
    }
  };

  const handleDelete = async () => {
      if (!selectedCollection || !selectedDocId) return;

      if (window.confirm(`Bạn có chắc chắn muốn XÓA document '${selectedDocId}' trong collection '${selectedCollection}' không? Hành động này không thể hoàn tác!`)) {
          setIsLoading(true);
          try {
              await deleteDoc(doc(db, selectedCollection, selectedDocId));
              setSelectedDocId(null);
              setDocData('');
              fetchDocuments(selectedCollection); // Refresh the list
          } catch (e: any) {
              setError(`Lỗi khi xóa: ${e.message}`);
          }
          setIsLoading(false);
      }
  };

  if (isLoading && !isAuthorized) {
    return <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white">Đang kiểm tra quyền...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">TRUY CẬP BỊ TỪ CHỐI</h2>
        <p>Bạn không có quyền truy cập vào trang này.</p>
        <button onClick={onClose} className="mt-6 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm text-gray-200 font-sans flex flex-col p-4 z-50">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-purple-400">Admin Firestore Panel</h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <XIcon size={28} />
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Panel 1: Collections */}
        <div className="w-1/4 flex flex-col bg-slate-900/70 p-3 rounded-lg border border-slate-800">
          <h2 className="text-lg font-semibold mb-3 text-gray-400">Collections</h2>
          <ul className="space-y-2 overflow-y-auto">
            {collectionsToManage.map(col => (
              <li key={col}>
                <button
                  onClick={() => setSelectedCollection(col)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${selectedCollection === col ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
                >
                  {col}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel 2: Documents */}
        <div className="w-1/4 flex flex-col bg-slate-900/70 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-400">Documents</h2>
                {selectedCollection && (
                    <button onClick={() => fetchDocuments(selectedCollection)} className="p-1.5 rounded-md hover:bg-slate-700 transition-colors" title="Làm mới danh sách">
                        <RefreshCwIcon className={isLoading ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>
            {isLoading && !documents.length ? <div className="text-center py-4">Đang tải...</div> : null}
            {!selectedCollection ? <div className="text-center text-gray-500 py-4">Chọn một collection</div> : null}
            <ul className="space-y-1.5 overflow-y-auto pr-1">
                {documents.map(docItem => (
                <li key={docItem.id}>
                    <button
                    onClick={() => setSelectedDocId(docItem.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-xs truncate ${selectedDocId === docItem.id ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                    {docItem.id}
                    </button>
                </li>
                ))}
          </ul>
        </div>

        {/* Panel 3: Data Editor */}
        <div className="w-2/4 flex flex-col bg-slate-900/70 p-3 rounded-lg border border-slate-800">
            <h2 className="text-lg font-semibold mb-3 text-gray-400">Document Data</h2>
            {!selectedDocId ? <div className="flex-1 flex items-center justify-center text-gray-500">Chọn một document để xem/sửa</div> :
                <>
                    <textarea
                        value={docData}
                        onChange={(e) => setDocData(e.target.value)}
                        className="flex-1 w-full bg-slate-950 p-3 rounded-md border border-slate-700 font-mono text-sm text-green-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        spellCheck="false"
                        disabled={isLoading}
                    />
                    {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
                    <div className="flex items-center justify-end gap-3 mt-3">
                        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50" disabled={isLoading || saveStatus === 'saving'}>
                            <TrashIcon /> Xóa
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 w-28 justify-center" disabled={isLoading || saveStatus === 'saving'}>
                            {saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'success' ? 'Đã lưu!' : <><SaveIcon /> Lưu</>}
                        </button>
                    </div>
                </>
            }
        </div>
      </div>
    </div>
  );
}
