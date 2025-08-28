// src/SystemCheckScreen.tsx

import React, { useState, useEffect, useCallback, memo } from 'react';

// --- Helper Icons (tự chứa, không cần import từ bên ngoài) ---
const MemoryIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 13h2"/><path d="M20 13h2"/><path d="M12 2v2"/><path d="M12 20v2"/><rect width="14" height="14" x="5" y="5" rx="2"/><path d="M9 5v14"/><path d="M15 5v14"/></svg>;
const HardDriveIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>;
const WifiIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>;
const CpuIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>;
const RefreshCwIcon = ({ size = 16, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
const DownloadCloudIcon = ({ size = 20, ...props }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>;
const XIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide-icon ${className}`} {...props}> <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /> </svg> );

// --- Helper Function ---
const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// --- Component Props ---
interface SystemCheckScreenProps {
  onClose: () => void;
}

const SystemCheckScreenComponent: React.FC<SystemCheckScreenProps> = ({ onClose }) => {
  const [systemInfo, setSystemInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [speedTestResult, setSpeedTestResult] = useState<string>('Chưa kiểm tra');
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);

  const runSpeedTest = async () => {
    setIsTestingSpeed(true);
    setSpeedTestResult('Đang kiểm tra...');
    const testFileUrl = 'https://link-to-your-5mb-file.zip'; // <-- THAY URL FILE CỦA BẠN
    const startTime = performance.now();

    try {
      const response = await fetch(`${testFileUrl}?t=${new Date().getTime()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const blob = await response.blob();
      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      const sizeInBits = blob.size * 8;
      const speedBps = sizeInBits / durationInSeconds;
      const speedMbps = (speedBps / 1024 / 1024).toFixed(2);
      setSpeedTestResult(`${speedMbps} Mbps`);
    } catch (error) {
      console.error('Speed test failed:', error);
      setSpeedTestResult('Kiểm tra thất bại');
    } finally {
      setIsTestingSpeed(false);
    }
  };

  const fetchSystemData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: any = {};
      if ('performance' in window && 'memory' in (window.performance as any)) data.memory = (window.performance as any).memory;
      if ('storage' in navigator && 'estimate' in navigator.storage) data.storage = await navigator.storage.estimate();
      if ('connection' in navigator) data.network = navigator.connection;
      if ('hardwareConcurrency' in navigator) data.cpuCores = navigator.hardwareConcurrency;
      setSystemInfo(data);
    } catch (error) {
      console.error("Error fetching system info:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; notSupported?: boolean }> = ({ icon, title, children, notSupported }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <div className="flex items-center mb-3">
        <div className="text-cyan-400 mr-3">{icon}</div>
        <h3 className="text-md font-semibold text-gray-200">{title}</h3>
      </div>
      {notSupported ? <p className="text-sm text-gray-500 italic">API không được trình duyệt này hỗ trợ.</p> : children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl text-white font-sans animate-fade-in-scale-fast">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-cyan-300 tracking-wide">System Status</h2>
          <div className="flex items-center space-x-2">
            <button onClick={fetchSystemData} disabled={isLoading || isTestingSpeed} className="p-1.5 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Refresh Data">
              <RefreshCwIcon className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors">
              <XIcon size={20} />
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-gray-300">Đang tải dữ liệu hệ thống...</div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            <div className="md:col-span-2">
              <InfoCard icon={<DownloadCloudIcon />} title="Live Speed Test">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-semibold text-cyan-300">Download: </span>
                    <span className={isTestingSpeed ? 'animate-pulse' : ''}>{speedTestResult}</span>
                  </p>
                  <button onClick={runSpeedTest} disabled={isTestingSpeed} className="px-3 py-1 text-xs font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                    {isTestingSpeed ? 'Testing...' : 'Start Test'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">*Kiểm tra sẽ tốn dung lượng mạng của bạn.</p>
              </InfoCard>
            </div>
            <InfoCard icon={<HardDriveIcon />} title="Local Storage">
              {!systemInfo.storage ? <p className="text-sm text-gray-500 italic">Không thể lấy thông tin.</p> : (
                <>
                  <div className="w-full bg-slate-700 rounded-full h-2.5 my-1"><div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full" style={{ width: `${((systemInfo.storage.usage / systemInfo.storage.quota) * 100).toFixed(2)}%` }}></div></div>
                  <div className="flex justify-between text-xs text-gray-400"><span>{formatBytes(systemInfo.storage.usage)} đã dùng</span><span>Tổng: {formatBytes(systemInfo.storage.quota)}</span></div>
                </>
              )}
            </InfoCard>
            <InfoCard icon={<WifiIcon />} title="Connection Info (Theoretical)">
              <ul className="text-sm space-y-1">
                <li><span className="font-semibold text-cyan-300">Type:</span> {systemInfo.network?.type || 'N/A'}</li>
                <li><span className="font-semibold text-cyan-300">Est. Speed:</span> {systemInfo.network?.effectiveType || 'N/A'}</li>
                <li><span className="font-semibold text-cyan-300">Max Downlink:</span> {systemInfo.network?.downlink ? `${systemInfo.network.downlink} Mbps` : 'N/A'}</li>
              </ul>
            </InfoCard>
            <InfoCard icon={<CpuIcon />} title="Hardware" notSupported={!systemInfo.cpuCores}><p className="text-sm"><span className="font-semibold text-cyan-300">CPU Logical Cores:</span> {systemInfo.cpuCores || 'N/A'}</p></InfoCard>
            <InfoCard icon={<MemoryIcon />} title="JavaScript Heap Memory" notSupported={!systemInfo.memory}>
              <ul className="text-sm space-y-1">
                <li><span className="font-semibold text-cyan-300">Used:</span> {formatBytes(systemInfo.memory?.usedJSHeapSize)}</li>
                <li><span className="font-semibold text-cyan-300">Allocated:</span> {formatBytes(systemInfo.memory?.totalJSHeapSize)}</li>
                <li><span className="font-semibold text-cyan-300">Limit:</span> {formatBytes(systemInfo.memory?.jsHeapSizeLimit)}</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2 italic">*Chỉ số tham khảo cho dev, không phải tổng RAM.</p>
            </InfoCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(SystemCheckScreenComponent);
