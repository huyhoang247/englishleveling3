// src/admin.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { auth } from './firebase.js';

// --- Hằng số ---
const ADMIN_EMAIL = 'vanlongt309@gmail.com';

// --- Icons ---
const XIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const SaveIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>);
const TrashIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const RefreshCwIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>);
const PlusIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const AlertTriangleIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const ArrowLeftIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const FileTextIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const ListIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const BarChartIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;


// --- Component phụ ---
const Alert = ({ message, type = 'error' }: { message: string, type?: 'error' | 'success' }) => {
    const colors = {
        error: 'bg-red-500/20 border-red-500/50 text-red-300',
        success: 'bg-green-500/20 border-green-500/50 text-green-300'
    };
    return <div className={`p-3 rounded-md border text-sm ${colors[type]}`}>{message}</div>;
};

// --- Types ---
interface AdminPanelProps { onClose: () => void; }
type View = 'collections' | 'documents' | 'editor';
type UserViewMode = 'list' | 'ranking';

// --- Component chính ---
export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const collectionsToManage = useMemo(() => ['users', 'appData'], []);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<View>('collections');
  const [userViewMode, setUserViewMode] = useState<UserViewMode>('list');

  const db = getFirestore();

  useEffect(() => {
    const currentUser = auth.currentUser;
    setIsAuthorized(currentUser?.email === ADMIN_EMAIL);
    setIsLoading(false);
  }, []);

  const fetchDocuments = useCallback(async (collectionName: string, mode: UserViewMode = 'list') => {
    setIsLoading(true);
    setError(null);
    setDocuments([]);
    try {
        const docsSnap = await getDocs(collection(db, collectionName));
        let docsList: DocumentData[] = [];
        if (collectionName === 'users' && mode === 'ranking') {
            docsList = docsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // SỬA Ở ĐÂY: từ coin -> coins
            docsList.sort((a, b) => (b.coins || 0) - (a.coins || 0));
        } else {
            docsList = docsSnap.docs.map(doc => ({ id: doc.id }));
        }
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
        setDocData(docSnap.exists() ? docSnap.data() : null);
        if (!docSnap.exists()) setError('Document không tồn tại.');
      } catch (e: any) {
        setError(`Lỗi khi tải dữ liệu document: ${e.message}`); setDocData(null);
      }
      setIsLoading(false);
  }, [db]);

  const handleSelectCollection = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setSelectedDocId(null);
    setDocData(null);
    setSearchTerm('');
    setUserViewMode('list');
    fetchDocuments(collectionName, 'list');
    setCurrentView('documents');
  };

  const handleSetUserViewMode = (mode: UserViewMode) => {
    setUserViewMode(mode);
    if(selectedCollection) {
        fetchDocuments(selectedCollection, mode);
    }
  }

  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    if(selectedCollection) fetchDocumentData(selectedCollection, docId);
    setCurrentView('editor');
  };

  const handleBack = () => {
    if (currentView === 'editor') {
        setSelectedDocId(null);
        setDocData(null);
        setCurrentView('documents');
    } else if (currentView === 'documents') {
        setSelectedCollection(null);
        setDocuments([]);
        setCurrentView('collections');
    }
  };

  const handleDataChange = (path: (string | number)[], value: any) => {
    setDocData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        let current = newData;
        for (let i = 0; i < path.length - 1; i++) { current = current[path[i]]; }
        current[path[path.length - 1]] = value;
        return newData;
    });
  };

  const handleSave = async () => {
    if (!selectedCollection || !selectedDocId || !docData) return;
    setSaveStatus('saving');
    setError(null);
    try {
        const docRef = doc(db, selectedCollection, selectedDocId);
        const dataToSave = JSON.parse(JSON.stringify(docData), (key, value) => 
            value === 'serverTimestamp()' ? serverTimestamp() : value
        );
        await setDoc(docRef, dataToSave, { merge: true });
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
    if (window.confirm(`Bạn có chắc muốn XÓA document '${selectedDocId}' trong '${selectedCollection}'?`)) {
        setIsLoading(true);
        try {
            await deleteDoc(doc(db, selectedCollection, selectedDocId));
            handleBack();
            await fetchDocuments(selectedCollection, userViewMode);
        } catch (e: any) {
            setError(`Lỗi khi xóa: ${e.message}`);
        }
        setIsLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!selectedCollection) return;
    const newDocId = prompt(`Nhập ID cho document mới trong '${selectedCollection}':`);
    if (newDocId) {
        setIsLoading(true);
        try {
            const docRef = doc(db, selectedCollection, newDocId);
            await setDoc(docRef, { createdAt: serverTimestamp(), placeholder: true });
            await fetchDocuments(selectedCollection, 'list');
            handleSelectDocument(newDocId);
        } catch (e: any) {
            setError(`Lỗi khi tạo document: ${e.message}`);
        }
        setIsLoading(false);
    }
  };

  const filteredDocuments = useMemo(() => {
    if (userViewMode === 'ranking') return documents;
    if (!searchTerm) return documents;
    return documents.filter(doc => doc.id.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [documents, searchTerm, userViewMode]);

  if (isLoading && !isAuthorized) { return <div className="fixed inset-0 bg-gray-900 flex items-center justify-center text-white">Đang kiểm tra quyền...</div>; }
  if (!isAuthorized) { return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md text-center border border-slate-700">
            <AlertTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">TRUY CẬP BỊ TỪ CHỐI</h2>
            <p className="text-slate-300 mb-6">Bạn không có quyền truy cập.</p>
            <button onClick={onClose} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Đóng</button>
        </div>
      </div>
  ); }

  const getHeaderTitle = () => {
    if (currentView === 'editor') return `Sửa: ${selectedDocId}`;
    if (currentView === 'documents') return `Collection: ${selectedCollection}`;
    return 'Admin Firestore Panel';
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md text-slate-200 font-sans flex flex-col p-2 sm:p-4 z-50">
        <header className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
                {currentView !== 'collections' && (
                    <button onClick={handleBack} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors md:hidden">
                        <ArrowLeftIcon />
                    </button>
                )}
                 <h1 className="text-lg sm:text-xl font-bold text-indigo-400 truncate">{getHeaderTitle()}</h1>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex-shrink-0"><XIcon /></button>
        </header>

        <div className="flex-1 flex md:grid md:grid-cols-[350px_1fr] md:gap-4 overflow-hidden">
            
            <aside className={`flex-col bg-slate-900 md:flex md:p-3 rounded-lg md:border md:border-slate-800 overflow-hidden ${currentView === 'collections' || currentView === 'documents' ? 'flex' : 'hidden'}`}>
                <div className={`${currentView === 'collections' ? 'block' : 'hidden'} md:block w-full p-2 md:p-0`}>
                    <h2 className="text-lg font-semibold mb-3 text-slate-300 px-1">Collections</h2>
                    <ul className="space-y-1.5">
                        {collectionsToManage.map(col => (
                            <li key={col}><button onClick={() => handleSelectCollection(col)} className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${selectedCollection === col ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}>{col}</button></li>
                        ))}
                    </ul>
                </div>
                {selectedCollection && <div className="hidden md:block w-full h-[1px] bg-slate-800 my-4"></div>}
                
                <div className={`${currentView === 'documents' ? 'flex' : 'hidden'} md:flex flex-col flex-1 w-full p-2 md:p-0 overflow-hidden`}>
                     <div className="flex justify-between items-center mb-2 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-slate-300">Documents</h2>
                        <div className="flex items-center gap-1">
                            {userViewMode === 'list' && <button onClick={handleAddDocument} className="p-1.5 rounded-md hover:bg-slate-700" title="Add"><PlusIcon/></button>}
                            <button onClick={() => fetchDocuments(selectedCollection!, userViewMode)} className="p-1.5 rounded-md hover:bg-slate-700" title="Refresh"><RefreshCwIcon className={isLoading ? 'animate-spin' : ''}/></button>
                        </div>
                    </div>
                    
                    {selectedCollection === 'users' && (
                        <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
                            <button onClick={() => handleSetUserViewMode('list')} className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${userViewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                <ListIcon /> <span className="hidden sm:inline">Xem theo ID</span>
                            </button>
                             <button onClick={() => handleSetUserViewMode('ranking')} className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${userViewMode === 'ranking' ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                <BarChartIcon /> <span className="hidden sm:inline">Xem BXH Coins</span>
                            </button>
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                        {isLoading ? <p className="text-center text-slate-500 py-4">Đang tải...</p> : (
                            <>
                                {userViewMode === 'list' || selectedCollection !== 'users' ? (
                                    <>
                                        <input type="text" placeholder="Tìm kiếm ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 text-sm mb-3 flex-shrink-0"/>
                                        <ul className="space-y-1.5">
                                            {filteredDocuments.map(docItem => (
                                                <li key={docItem.id}><button onClick={() => handleSelectDocument(docItem.id)} className={`w-full text-left px-3 py-1.5 rounded-md text-xs truncate ${selectedDocId === docItem.id ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}>{docItem.id}</button></li>
                                            ))}
                                            {filteredDocuments.length === 0 && <p className="text-center text-slate-500 py-4">Không có document.</p>}
                                        </ul>
                                    </>
                                ) : (
                                    <UserRankingView users={filteredDocuments} onUserSelect={handleSelectDocument} />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </aside>

            <main className={`flex-col bg-slate-900 md:flex md:p-4 rounded-lg md:border md:border-slate-800 overflow-hidden ${currentView === 'editor' ? 'flex' : 'hidden'}`}>
                {!selectedDocId ? (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-600">
                        <FileTextIcon className="h-16 w-16 mb-4"/>
                        <h3 className="text-lg font-semibold text-slate-400">Chưa chọn Document</h3>
                        <p className="text-sm">Chọn một document để xem và sửa.</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500"><p>Đang tải dữ liệu...</p></div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-2 md:p-0 md:pr-2 -mr-2 space-y-3">
                            {error && <Alert message={error} />}
                            {docData ? <JsonEditor data={docData} onDataChange={handleDataChange} /> : <p className="text-center text-slate-500 py-4">Không có dữ liệu để hiển thị.</p>}
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-800 p-2 md:p-0 -mx-2 md:mx-0 bg-slate-900/90 backdrop-blur-sm sticky bottom-0">
                            <button onClick={handleDelete} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-semibold" disabled={isLoading || saveStatus === 'saving'}><TrashIcon /> Xóa</button>
                            <button onClick={handleSave} className="flex-1 md:w-36 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-semibold" disabled={isLoading || saveStatus === 'saving'}>
                                {saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'success' ? 'Đã lưu!' : <><SaveIcon /> Lưu</>}
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    </div>
  );
}

// --- Component Bảng xếp hạng ---
interface UserRankingViewProps { users: DocumentData[]; onUserSelect: (id: string) => void; }
const UserRankingView = ({ users, onUserSelect }: UserRankingViewProps) => {
    if (!users.length) {
        return <p className="text-center text-slate-500 py-4">Không có dữ liệu người dùng.</p>;
    }
    return (
        <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="border-b border-slate-700">
                    <th className="p-2 font-semibold w-10">#</th>
                    <th className="p-2 font-semibold">User</th>
                    <th className="p-2 font-semibold text-right">Coins</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user, index) => (
                    <tr key={user.id} onClick={() => onUserSelect(user.id)} className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors">
                        <td className="p-2 text-slate-500">{index + 1}</td>
                        <td className="p-2 min-w-0">
                            <p className="font-semibold text-cyan-300 truncate">{user.username || 'N/A'}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email || 'N/A'}</p>
                        </td>
                        {/* SỬA Ở ĐÂY: từ coin -> coins */}
                        <td className="p-2 text-right font-bold text-amber-300 font-mono">{user.coins?.toLocaleString() || 0}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}


// --- Trình chỉnh sửa JSON ---
const JsonEditor = ({ data, onDataChange, path = [] }: { data: any, onDataChange: (path: (string|number)[], value: any) => void, path?: (string|number)[] }) => {
    if (typeof data !== 'object' || data === null) {
        return <p className="text-slate-400">Dữ liệu không hợp lệ.</p>;
    }
    return (
        <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
                <Field key={key} fieldKey={key} value={value} onDataChange={onDataChange} path={[...path, key]} />
            ))}
        </div>
    );
};

const Field = ({ fieldKey, value, onDataChange, path }: { fieldKey: string | number, value: any, onDataChange: (path: (string|number)[], value: any) => void, path: (string|number)[] }) => {
    const valueType = typeof value;
    
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let newValue: any = e.target.value;
        if (valueType === 'number') { newValue = parseFloat(newValue) || 0; }
        if (valueType === 'boolean') { newValue = (e.target as HTMLInputElement).checked; }
        onDataChange(path, newValue);
    };

    const renderInput = () => {
        if (valueType === 'string') {
            return <input type="text" value={value} onChange={handleValueChange} className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-cyan-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />;
        }
        if (valueType === 'number') {
            return <input type="number" value={value} onChange={handleValueChange} className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm text-amber-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />;
        }
        if (valueType === 'boolean') {
            return (
                <label className="flex items-center gap-2 cursor-pointer h-full">
                    <input type="checkbox" checked={value} onChange={handleValueChange} className="form-checkbox h-4 w-4 rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-indigo-500" />
                    <span className={`text-sm font-mono ${value ? 'text-green-400' : 'text-red-400'}`}>{String(value)}</span>
                </label>
            );
        }
        if (value !== null && typeof value === 'object') {
            if ('seconds' in value && 'nanoseconds' in value && Object.keys(value).length === 2) {
                const date = new Date(value.seconds * 1000).toLocaleString('vi-VN');
                return <div className="text-xs text-purple-300 bg-slate-800 p-2 rounded-md">Timestamp: <span className="font-mono">{date}</span></div>
            }
            return (
                <div className="pl-4 border-l-2 border-slate-700/50">
                    <JsonEditor data={value} onDataChange={onDataChange} path={path} />
                </div>
            );
        }
        return <span className="text-slate-500 text-sm italic pt-1">null</span>;
    };

    return (
        <div className="grid grid-cols-3 gap-2 items-start">
            <label className="col-span-1 text-sm text-slate-400 font-medium truncate pt-1">{fieldKey}:</label>
            <div className="col-span-2">
                {renderInput()}
            </div>
        </div>
    );
};
