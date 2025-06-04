import React, { useState, useEffect, useCallback } from 'react';
// Removed lucide-react import
// import { Trophy, Ticket, Users, Clock, Sparkles, DollarSign, Gift } from 'lucide-react';

// Inline SVG Icons
const TrophyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6c2.1 0 3 2 3 5V15c0 1.7 1.3 3 3 3zm0 0h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm12 0h1.5a2.5 2.5 0 0 0 0-5H18c-2.1 0-3 2-3 5V15c0 1.7 1.3 3 3 3z" />
    <path d="M12 10v6" />
    <path d="M11 17h2" />
  </svg>
);

const TicketIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 10V8a2 2 0 0 1 2-2h3.93a2 2 0 0 0 1.66.88L14 10l-4 4 4 4 4.07-2.88a2 2 0 0 0 1.66.88H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3.93a2 2 0 0 0-1.66.88L10 22l-4-4-4-4-4.07 2.88a2 2 0 0 0-1.66.88H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>
);

const DollarSignIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const GiftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 12 12 12 12 20" />
    <path d="M20 12h-8v8H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6z" />
    <path d="M12 20v2" />
    <path d="M12 4V2" />
    <path d="M7 4V2" />
    <path d="M17 4V2" />
    <path d="M12 12h8" />
  </svg>
);


const SoXoGame = () => {
  // Initial jackpot in VNĐ, will be converted to Coin for display
  const [jackpot, setJackpot] = useState(2500000000); 
  const [playerTickets, setPlayerTickets] = useState([]);
  const [drawResults, setDrawResults] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawHistory, setDrawHistory] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(2847);
  const [timeToNextDraw, setTimeToNextDraw] = useState(2 * 3600 + 15 * 60 + 30); // 2h 15m 30s
  const [playerName, setPlayerName] = useState('');
  const [selectedTicketCount, setSelectedTicketCount] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [showPrizeStructure, setShowPrizeStructure] = useState(false);

  // Updated TICKET_PRICE to Coin (10,000 VNĐ = 100 Coin)
  const TICKET_PRICE = 100; 
  const PROVINCES = ['TP.HCM', 'Đồng Tháp', 'Cà Mau', 'Bến Tre', 'Vũng Tàu', 'Bạc Liêu', 'An Giang'];
  
  // PRIZES array - now only defines the main prize types (Giải Đặc Biệt is the only one left for draw results)
  const PRIZES = [
    { name: 'Giải Đặc Biệt', count: 1, digits: 5 }, 
    // Other fixed prizes are removed from here as they are no longer displayed or checked
  ];

  // Define the structure for the special prize variations for display in modal
  const SPECIAL_PRIZE_STRUCTURE = [
    { name: '5 số cuối', digits: 5, percentage: 0.70, fixedAmount: 0 },
    { name: '4 số cuối', digits: 4, percentage: 0.20, fixedAmount: 0 },
    { name: '3 số cuối', digits: 3, percentage: 0.05, fixedAmount: 0 },
    { name: '2 số cuối', digits: 2, percentage: 0.02, fixedAmount: 0 } 
  ];

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeToNextDraw(prev => {
        if (prev <= 0) {
          startDraw();
          return 24 * 3600; // Reset to 24 hours
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Updated formatCurrency to convert VNĐ to Coin and display "Coin"
  const formatCurrency = (amountVND) => {
    const amountCoin = amountVND / 100; // 10,000 VNĐ = 100 Coin, so 1 VNĐ = 0.01 Coin
    return new Intl.NumberFormat('vi-VN').format(amountCoin) + ' Coin';
  };

  const [availableTickets, setAvailableTickets] = useState([]);
  const [selectedTicketForPurchase, setSelectedTicketForPurchase] = useState(null);

  // Generate available tickets when component mounts
  useEffect(() => {
    generateAvailableTickets();
  }, []);

  const generateAvailableTickets = () => {
    const tickets = [];
    for (let i = 0; i < 12; i++) {
      tickets.push({
        id: `available-${Date.now()}-${i}`,
        number: Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
        province: PROVINCES[Math.floor(Math.random() * PROVINCES.length)],
        series: String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        price: TICKET_PRICE
      });
    }
    setAvailableTickets(tickets);
    setSelectedTicketForPurchase(null);
  };

  const buyTicket = () => {
    if (!playerName.trim() || !selectedTicketForPurchase) return;
    
    const newTicket = {
      id: Date.now(),
      name: playerName,
      number: selectedTicketForPurchase.number,
      province: selectedTicketForPurchase.province,
      series: selectedTicketForPurchase.series,
      purchaseTime: new Date()
    };

    setPlayerTickets([...playerTickets, newTicket]);
    setJackpot(prev => prev + (TICKET_PRICE * 100)); // Convert Coin price back to VNĐ for jackpot state
    setTotalPlayers(prev => prev + 1);
    
    // Remove purchased ticket from available tickets and generate new one
    const newAvailableTickets = availableTickets.filter(t => t.id !== selectedTicketForPurchase.id);
    const newTicketData = {
      id: `available-${Date.now()}`,
      number: Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
      province: PROVINCES[Math.floor(Math.random() * PROVINCES.length)],
      series: String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
              String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      price: TICKET_PRICE
    };
    
    setAvailableTickets([...newAvailableTickets, newTicketData]);
    setSelectedTicketForPurchase(null);
  };

  const generateDrawResults = () => {
    const results = {};
    // Only generate result for Giải Đặc Biệt
    PRIZES.filter(p => p.name === 'Giải Đặc Biệt').forEach(prize => {
      results[prize.name] = [];
      for (let i = 0; i < prize.count; i++) {
        const maxNum = Math.pow(10, prize.digits) - 1;
        const number = Math.floor(Math.random() * (maxNum + 1))
          .toString().padStart(prize.digits, '0');
        results[prize.name].push(number);
      }
    });
    return results;
  };

  // Function to get fixed prize amounts in VNĐ for non-special prizes (now effectively empty)
  const getPrizeAmount = (prizeName) => {
    const amounts = {
      // All other fixed prizes are removed
    };
    return amounts[prizeName] || 0;
  };

  // checkWinning function calculates amounts in VNĐ
  const checkWinning = (ticketNumber, results, currentJackpot) => {
    const wins = [];
    const ticketStr = ticketNumber;

    const specialPrizeWinningNumber = results['Giải Đặc Biệt']?.[0];

    if (specialPrizeWinningNumber) {
      const spWinStr = specialPrizeWinningNumber;

      // Khớp 5 số cuối
      if (ticketStr === spWinStr) {
        wins.push({ prize: 'Giải Đặc Biệt', match: '5 số cuối', amount: currentJackpot * 0.70 });
      }
      // Khớp 4 số cuối
      if (ticketStr.slice(-4) === spWinStr.slice(-4)) {
        wins.push({ prize: 'Giải Đặc Biệt', match: '4 số cuối', amount: currentJackpot * 0.20 });
      }
      // Khớp 3 số cuối
      if (ticketStr.slice(-3) === spWinStr.slice(-3)) {
        wins.push({ prize: 'Giải Đặc Biệt', match: '3 số cuối', amount: currentJackpot * 0.05 });
      }
      // Khớp 2 số cuối - only 2% jackpot, no fixed amount
      if (ticketStr.slice(-2) === spWinStr.slice(-2)) {
        wins.push({ prize: 'Giải Đặc Biệt', match: '2 số cuối', amount: (currentJackpot * 0.02) }); 
      }
    }
    
    // No other fixed prizes to check
    return wins;
  };

  const startDraw = useCallback(() => {
    if (playerTickets.length === 0) return;
    
    setIsDrawing(true);
    setShowResults(false);
    
    let drawCount = 0;
    const drawInterval = setInterval(() => {
      const tempResults = generateDrawResults();
      setDrawResults(tempResults);
      
      drawCount++;
      if (drawCount >= 15) {
        clearInterval(drawInterval);
        setIsDrawing(false);
        
        const winnersInfo = playerTickets.map(ticket => ({
          ...ticket,
          wins: checkWinning(ticket.number, tempResults, jackpot) 
        })).filter(ticket => ticket.wins.length > 0);

        const newHistoryEntry = {
          date: new Date(),
          results: tempResults,
          totalPool: jackpot, // Jackpot is stored in VNĐ
          winners: winnersInfo.length,
          totalWinnings: winnersInfo.reduce((sum, winner) => 
            sum + winner.wins.reduce((s, w) => s + w.amount, 0), 0
          )
        };

        setDrawHistory([newHistoryEntry, ...drawHistory.slice(0, 4)]);
        setShowResults(true);
        
        // Reset for next round - jackpot value in VNĐ
        setPlayerTickets([]);
        setJackpot(2000000000 + Math.floor(Math.random() * 1000000000));
        setTotalPlayers(Math.floor(Math.random() * 1000) + 1500);
      }
    }, 200);
  }, [playerTickets, jackpot, drawHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TicketIcon className="text-yellow-400 w-10 h-10" />
            <h1 className="text-5xl font-bold text-white">SỔ XỐ MIỀN NAM</h1>
            <TicketIcon className="text-yellow-400 w-10 h-10" />
          </div>
          <p className="text-orange-200 text-xl">Mua vé số - Chờ quay thưởng - Trúng lớn!</p>
        </div>

        {/* Prize Structure Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowPrizeStructure(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl border-2 border-white/30 flex items-center gap-3 mx-auto transform hover:scale-105"
          >
            <TrophyIcon className="w-6 h-6" />
            CƠ CẤU GIẢI THƯỞNG
            <SparklesIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Jackpot Display */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 mb-8 text-center shadow-2xl border-4 border-yellow-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrophyIcon className="text-yellow-300 w-10 h-10" />
            <h2 className="text-3xl font-bold text-white">POOL JACKPOT</h2>
          </div>
          <div className="text-5xl font-bold text-yellow-300 mb-4">{formatCurrency(jackpot)}</div>
          <div className="flex justify-center gap-12 text-white text-lg">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-6 h-6" />
              <span>{totalPlayers.toLocaleString()} người chơi</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-6 h-6" />
              <span>Quay thưởng sau: {formatTime(timeToNextDraw)}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Buy Tickets */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <TicketIcon className="w-6 h-6" />
                  Chọn Vé Số
                </h3>
                <button
                  onClick={generateAvailableTickets}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Random Lại
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:border-white/50 focus:outline-none"
                />
              </div>

              {/* Available Tickets Grid */}
              <div className="mb-6">
                <h4 className="text-white font-bold mb-4">Vé số có sẵn - Chọn vé bạn thích:</h4>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {availableTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketForPurchase(ticket)}
                      className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                        selectedTicketForPurchase?.id === ticket.id
                          ? 'ring-4 ring-yellow-400 scale-105'
                          : 'hover:ring-2 hover:ring-white/50'
                      }`}
                    >
                      {/* Ticket Design */}
                      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-lg">
                        {/* Ticket Header */}
                        <div className="bg-yellow-400 text-red-800 text-center py-2 px-3">
                          <div className="font-bold text-lg">SỔ XỐ MIỀN NAM</div>
                          <div className="text-sm">{ticket.province}</div>
                        </div>
                        
                        {/* Ticket Body */}
                        <div className="p-4 text-center">
                          <div className="text-yellow-300 font-bold text-sm mb-1">Series {ticket.series}</div>
                          <div className="text-white text-3xl font-bold tracking-wider mb-2 font-mono">
                            {ticket.number}
                          </div>
                          <div className="text-yellow-300 text-sm font-bold">
                            {formatCurrency(ticket.price * 100)} {/* Convert TICKET_PRICE (Coin) to VNĐ for display */}
                          </div>
                        </div>
                        
                        {/* Ticket Footer */}
                        <div className="bg-red-800 text-center py-1">
                          <div className="text-yellow-300 text-xs">CHÚC MAY MẮN</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTicketForPurchase && (
                <div className="bg-green-500/20 border border-green-400 rounded-lg p-4 mb-4">
                  <h4 className="text-green-300 font-bold mb-2">Vé đã chọn:</h4>
                  <div className="text-white">
                    <span className="font-bold">{selectedTicketForPurchase.series}-{selectedTicketForPurchase.number}</span>
                    <span className="text-green-300 ml-2">({selectedTicketForPurchase.province})</span>
                  </div>
                </div>
              )}

              <button
                onClick={buyTicket}
                disabled={!playerName.trim() || !selectedTicketForPurchase}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center justify-center gap-2">
                  <DollarSignIcon className="w-6 h-6" />
                  {selectedTicketForPurchase 
                    ? `Mua Vé ${selectedTicketForPurchase.series}-${selectedTicketForPurchase.number} (${formatCurrency(selectedTicketForPurchase.price * 100)})` 
                    : 'Chọn vé để mua'
                  }
                </div>
              </button>
            </div>

            {/* My Tickets */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">
                Vé của tôi ({playerTickets.filter(t => t.name === playerName).length})
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {playerTickets.filter(t => t.name === playerName).map(ticket => (
                  <div key={ticket.id}>
                    {/* My Ticket Design */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-lg">
                      {/* Ticket Header */}
                      <div className="bg-yellow-400 text-blue-800 text-center py-2 px-3">
                        <div className="font-bold text-lg">SỔ XỐ MIỀN NAM</div>
                        <div className="text-sm">{ticket.province}</div>
                      </div>
                      
                      {/* Ticket Body */}
                      <div className="p-4 text-center">
                        <div className="text-yellow-300 font-bold text-sm mb-1">Series {ticket.series}</div>
                        <div className="text-white text-3xl font-bold tracking-wider mb-2 font-mono">
                          {ticket.number}
                        </div>
                        <div className="text-yellow-300 text-sm">
                          Mua lúc: {ticket.purchaseTime.toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                      
                      {/* Ticket Footer */}
                      <div className="bg-blue-800 text-center py-1">
                        <div className="text-yellow-300 text-xs">VÉ CỦA TÔI</div>
                      </div>
                    </div>
                  </div>
                ))}
                {playerTickets.filter(t => t.name === playerName).length === 0 && (
                  <p className="text-white/60 text-center py-8">Bạn chưa mua vé nào</p>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Draw Results */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <GiftIcon className="w-6 h-6" />
                Kết Quả Quay Thưởng
              </h3>
              
              {isDrawing && (
                <div className="text-center py-12">
                  <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <p className="text-white text-xl">Đang quay thưởng...</p>
                </div>
              )}

              {drawResults && !isDrawing && (
                <div className="space-y-4">
                  {/* Only show Giải Đặc Biệt result */}
                  {PRIZES.filter(p => p.name === 'Giải Đặc Biệt').map(prize => (
                    <div key={prize.name} className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-white font-bold">{prize.name}</h4>
                        <span className="text-yellow-400 text-sm">
                          (Xem chi tiết trong Cơ cấu giải thưởng)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {drawResults[prize.name].map((number, index) => (
                          <span
                            key={index}
                            className="bg-red-600 text-white px-3 py-2 rounded font-bold text-lg"
                          >
                            {number}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!drawResults && !isDrawing && (
                <div className="text-center py-12">
                  <ClockIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Chờ đến giờ quay thưởng</p>
                </div>
              )}
            </div>

            {/* Winners Check */}
            {showResults && drawResults && (
              <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-6 border border-green-400/50">
                <h3 className="text-xl font-bold text-green-300 mb-4">Kiểm Tra Trúng Thưởng</h3>
                {playerTickets.filter(t => t.name === playerName).map(ticket => {
                  const wins = checkWinning(ticket.number, drawResults, jackpot); // Pass jackpot here
                  return (
                    <div key={ticket.id} className="mb-4 bg-white/10 rounded-lg p-3">
                      <div className="text-white font-bold mb-2">
                        {ticket.series} - {ticket.number}
                      </div>
                      {wins.length > 0 ? (
                        <div className="space-y-1">
                          {wins.map((win, index) => (
                            <div key={index} className="text-green-300">
                              🎉 {win.prize} ({win.match}) - {formatCurrency(win.amount)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-white/60">Không trúng thưởng</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - All Players & History */}
          <div className="space-y-6">
            {/* All Players */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">
                Tất cả người chơi ({playerTickets.length} vé)
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {playerTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-semibold">{ticket.name}</span>
                      <span className="text-yellow-400 text-sm">{ticket.province}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300 font-mono">{ticket.series}-{ticket.number}</span>
                      <span className="text-white/60 text-xs">
                        {ticket.purchaseTime.toLocaleTimeString('vi-VN', { timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
                {playerTickets.length === 0 && (
                  <p className="text-white/60 text-center py-8">Chưa có ai mua vé</p>
                )}
              </div>
            </div>

            {/* Draw History */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Lịch Sử Quay Thưởng</h3>
              <div className="space-y-3">
                {drawHistory.map((entry, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm font-semibold">
                        {entry.date.toLocaleDateString('vi-VN')} {entry.date.toLocaleTimeString('vi-VN', { timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="text-xs text-white/80 mb-2">
                      Đặc biệt: <span className="text-yellow-400 font-bold">{entry.results['Giải Đặc Biệt'][0]}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-300">
                        {entry.winners > 0 ? `${entry.winners} người trúng` : 'Không có người trúng'}
                      </span>
                      <span className="text-yellow-300">
                        {formatCurrency(entry.totalPool)}
                      </span>
                    </div>
                  </div>
                ))}
                {drawHistory.length === 0 && (
                  <p className="text-white/60 text-center py-4">Chưa có lịch sử</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Manual Draw Button */}
        {playerTickets.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={startDraw}
              disabled={isDrawing}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 shadow-2xl border-2 border-yellow-400"
            >
              {isDrawing ? 'Đang quay thưởng...' : '🎲 QUAY THƯỞNG NGAY!'}
            </button>
          </div>
        )}
      </div>

      {/* Prize Structure Modal */}
      {showPrizeStructure && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-yellow-400 shadow-2xl">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <TrophyIcon className="text-yellow-400 w-8 h-8" />
                <h2 className="text-3xl font-bold text-white">CƠ CẤU GIẢI THƯỞNG</h2>
                <TrophyIcon className="text-yellow-400 w-8 h-8" />
              </div>
              <p className="text-orange-200 text-md">Bảng chi tiết các giải thưởng Sổ Xố Miền Nam</p>
            </div>

            {/* Special Prize Section */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                Giải Đặc Biệt (Jackpot: {formatCurrency(jackpot)})
              </h3>
              <div className="space-y-2">
                {SPECIAL_PRIZE_STRUCTURE.map((prize, index) => (
                  <div key={prize.name} className="bg-white/10 rounded-lg p-3 flex items-center justify-between border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-yellow-400">
                        {prize.digits}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">Khớp {prize.name}</h4>
                        <p className="text-orange-200 text-sm">Tỷ lệ trúng: 1/{Math.pow(10, prize.digits).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-400">
                        {formatCurrency(prize.fixedAmount * 100 + (jackpot * prize.percentage))} 
                      </div>
                      <p className="text-orange-200 text-xs">
                        {prize.percentage > 0 && `(${(prize.percentage * 100).toFixed(0)}% Jackpot`}
                        {prize.fixedAmount > 0 && ` + ${formatCurrency(prize.fixedAmount * 100)})`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Pool */}
            <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl p-4 border border-yellow-400/50 mb-6 text-center">
              <h3 className="text-xl font-bold text-yellow-300 mb-2">Tổng Pool Jackpot (Ước tính)</h3>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(
                  (jackpot * 0.70) + (jackpot * 0.20) + (jackpot * 0.05) + (jackpot * 0.02) 
                )}
              </div>
              <p className="text-orange-200 text-sm mt-1">Bao gồm tất cả giải thưởng và phần trăm Jackpot</p>
            </div>

            {/* Close Button */}
            <div className="text-center">
              <button
                onClick={() => setShowPrizeStructure(false)}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-2 rounded-full font-bold text-lg transition-all duration-200 shadow-lg border-2 border-white/30"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoXoGame;
