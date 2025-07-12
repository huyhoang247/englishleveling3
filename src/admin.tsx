// src/admin.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase.js';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, DocumentData } from 'firebase/firestore';

// --- Icons ---
const XIcon = ({ size = 24, color = 'currentColor', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const SaveIcon = ({ size = 20, color = 'currentColor', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);
const TrashIcon = ({ size = 20, color = 'currentColor', ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
const Spinner = () => (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
);

interface AdminPanelProps {
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const COLLECTIONS = ['users', 'appData']; // Các collection chính bạn muốn quản lý
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
    const [documents, setDocuments] = useState<{ id: string }[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [docData, setDocData] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const fetchDocuments = useCallback(async (collectionName: string) => {
        setIsLoading(true);
        setError(null);
        setDocuments([]);
        setSelectedDocId(null);
        setDocData('');
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const docsList = querySnapshot.docs.map(doc => ({ id: doc.id }));
            setDocuments(docsList);
        } catch (e: any) {
            setError(`Lỗi khi tải documents: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchDocumentData = useCallback(async (collectionName: string, docId: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                // Convert Firestore Timestamps to strings for JSON.stringify
                const data = docSnap.data();
                const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => {
                     if (value && value.seconds !== undefined) {
                         return new Date(value.seconds * 1000).toISOString();
                     }
                     return value;
                }));
                setDocData(JSON.stringify(sanitizedData, null, 2));
            } else {
                setError('Document không tồn tại.');
            }
        } catch (e: any) {
            setError(`Lỗi khi tải dữ liệu document: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSave = async () => {
        if (!selectedCollection || !selectedDocId) return;
        let parsedData: DocumentData;
        try {
            parsedData = JSON.parse(docData);
        } catch (e) {
            setError('Lỗi JSON: Dữ liệu không hợp lệ.');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const docRef = doc(db, selectedCollection, selectedDocId);
            await setDoc(docRef, parsedData, { merge: true }); // Dùng merge để không ghi đè toàn bộ
            setSuccess('Lưu document thành công!');
        } catch (e: any) {
            setError(`Lỗi khi lưu document: ${e.message}`);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    };
    
    const handleDelete = async () => {
        if (!selectedCollection || !selectedDocId) return;

        if (window.confirm(`Bạn có chắc chắn muốn xóa document "${selectedDocId}" trong collection "${selectedCollection}" không? Hành động này không thể hoàn tác.`)) {
            setIsDeleting(true);
            setError(null);
            setSuccess(null);
            try {
                await deleteDoc(doc(db, selectedCollection, selectedDocId));
                setSuccess('Xóa document thành công!');
                // Reset view
                setDocData('');
                setSelectedDocId(null);
                fetchDocuments(selectedCollection); // Tải lại danh sách document
            } catch (e: any) {
                setError(`Lỗi khi xóa document: ${e.message}`);
            } finally {
                setIsDeleting(false);
                setTimeout(() => setSuccess(null), 3000);
            }
        }
    };

    useEffect(() => {
        if (selectedCollection && selectedDocId) {
            fetchDocumentData(selectedCollection, selectedDocId);
        }
    }, [selectedCollection, selectedDocId, fetchDocumentData]);

    return (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white tracking-wider">
                        <span className="text-purple-400">ADMIN</span> PANEL
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <XIcon size={24} />
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-grow flex h-full overflow-hidden">
                    {/* Column 1: Collections & Documents */}
                    <aside className="w-1/3 border-r border-slate-800 flex flex-col">
                        <div className="p-3 border-b border-slate-800">
                             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Collections</h3>
                        </div>
                        <ul className="overflow-y-auto">
                            {COLLECTIONS.map(name => (
                                <li key={name}>
                                    <button
                                        onClick={() => { setSelectedCollection(name); fetchDocuments(name); }}
                                        className={`w-full text-left px-4 py-3 text-base font-medium transition-colors ${selectedCollection === name ? 'bg-purple-600/20 text-purple-300' : 'text-slate-300 hover:bg-slate-800'}`}
                                    >
                                        {name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-auto border-t border-slate-800">
                            <div className="p-3 border-b border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Documents in <span className="text-purple-300">{selectedCollection}</span></h3>
                            </div>
                            <div className="overflow-y-auto max-h-96">
                                {isLoading && !documents.length ? <div className="text-slate-400 p-4">Đang tải...</div> : null}
                                {!isLoading && selectedCollection && !documents.length ? <div className="text-slate-400 p-4">Không có document nào.</div> : null}
                                <ul>
                                    {documents.map(doc => (
                                        <li key={doc.id}>
                                            <button
                                                onClick={() => setSelectedDocId(doc.id)}
                                                className={`w-full text-left px-4 py-2 text-sm truncate font-mono transition-colors ${selectedDocId === doc.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                                            >
                                                {doc.id}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Column 2: Data Editor */}
                    <section className="w-2/3 flex flex-col">
                        {selectedDocId ? (
                            <>
                                <div className="p-3 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                        Editing Document: <span className="text-purple-300 font-mono">{selectedDocId}</span>
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={handleSave} disabled={isSaving || isDeleting} className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 rounded-lg transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed">
                                            {isSaving ? <Spinner/> : <SaveIcon />}
                                            <span>Lưu</span>
                                        </button>
                                        <button onClick={handleDelete} disabled={isDeleting || isSaving} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-lg transition-colors disabled:bg-red-800 disabled:cursor-not-allowed">
                                            {isDeleting ? <Spinner/> : <TrashIcon />}
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-grow p-1 relative">
                                    <textarea
                                        value={docData}
                                        onChange={e => { setDocData(e.target.value); setError(null); }}
                                        className="w-full h-full bg-slate-950 text-slate-200 p-4 font-mono text-sm rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none resize-none"
                                        spellCheck="false"
                                        placeholder={isLoading ? "Đang tải dữ liệu..." : "Dữ liệu JSON của document sẽ hiển thị ở đây."}
                                    />
                                </div>
                                <footer className="p-3 border-t border-slate-800 h-12 flex-shrink-0">
                                     {error && <div className="text-red-400 text-sm">{error}</div>}
                                     {success && <div className="text-green-400 text-sm">{success}</div>}
                                </footer>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <p>Chọn một collection và một document để xem hoặc chỉnh sửa.</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
