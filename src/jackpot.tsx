import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Ticket, Users, Clock, Sparkles, DollarSign, Gift } from 'lucide-react';

const SoXoGame = () => {
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

  const TICKET_PRICE = 10000;
  const PROVINCES = ['TP.HCM', 'Đồng Tháp', 'Cà Mau', 'Bến Tre', 'Vũng Tàu', 'Bạc Liêu', 'An Giang'];
  const PRIZES = [
    { name: 'Giải Đặc Biệt', count: 1, digits: 5 },
    { name: 'Giải Nhất', count: 1, digits: 5 },
    { name: 'Giải Nhì', count: 2, digits: 5 },
    { name: 'Giải Ba', count: 6, digits: 5 },
    { name: 'Giải Tư', count: 4, digits: 4 },
    { name: 'Giải Năm', count: 6, digits: 4 },
    { name: 'Giải Sáu', count: 3, digits: 3 },
    { name: 'Giải Bảy', count: 4, digits: 2 }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
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
    setJackpot(prev => prev + TICKET_PRICE);
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
    PRIZES.forEach(prize => {
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

  const checkWinning = (ticketNumber, results) => {
    const wins = [];
    
    PRIZES.forEach(prize => {
      results[prize.name].forEach(winningNumber => {
        const ticketStr = ticketNumber;
        const winStr = winningNumber;
        
        if (prize.digits === 5) {
          if (ticketStr === winStr) {
            wins.push({ prize: prize.name, match: 'Trúng toàn bộ', amount: getPrizeAmount(prize.name) });
          } else if (ticketStr.slice(-4) === winStr.slice(-4)) {
            wins.push({ prize: 'Giải khuyến khích', match: '4 số cuối', amount: 300000 });
          } else if (ticketStr.slice(-3) === winStr.slice(-3)) {
            wins.push({ prize: 'Giải khuyến khích', match: '3 số cuối', amount: 150000 });
          } else if (ticketStr.slice(-2) === winStr.slice(-2)) {
            wins.push({ prize: 'Giải khuyến khích', match: '2 số cuối', amount: 70000 });
          }
        } else if (prize.digits === 4) {
          if (ticketStr.slice(-4) === winStr) {
            wins.push({ prize: prize.name, match: 'Trúng toàn bộ', amount: getPrizeAmount(prize.name) });
          }
        } else if (prize.digits === 3) {
          if (ticketStr.slice(-3) === winStr) {
            wins.push({ prize: prize.name, match: 'Trúng toàn bộ', amount: getPrizeAmount(prize.name) });
          }
        } else if (prize.digits === 2) {
          if (ticketStr.slice(-2) === winStr) {
            wins.push({ prize: prize.name, match: 'Trúng toàn bộ', amount: getPrizeAmount(prize.name) });
          }
        }
      });
    });
    
    return wins;
  };

  const getPrizeAmount = (prizeName) => {
    const amounts = {
      'Giải Đặc Biệt': 3000000000,
      'Giải Nhất': 30000000,
      'Giải Nhì': 10000000,
      'Giải Ba': 3000000,
      'Giải Tư': 300000,
      'Giải Năm': 100000,
      'Giải Sáu': 40000,
      'Giải Bảy': 10000
    };
    return amounts[prizeName] || 0;
  };

  const startDraw = useCallback(() => {
    if (playerTickets.length === 0) return;
    
    setIsDrawing(true);
    setShowResults(false);
    
    // Simulate drawing animation
    let drawCount = 0;
    const drawInterval = setInterval(() => {
      const tempResults = generateDrawResults();
      setDrawResults(tempResults);
      
      drawCount++;
      if (drawCount >= 15) {
        clearInterval(drawInterval);
        setIsDrawing(false);
        
        // Check for winners
        const winnersInfo = playerTickets.map(ticket => ({
          ...ticket,
          wins: checkWinning(ticket.number, tempResults)
        })).filter(ticket => ticket.wins.length > 0);

        const newHistoryEntry = {
          date: new Date(),
          results: tempResults,
          totalPool: jackpot,
          winners: winnersInfo.length,
          totalWinnings: winnersInfo.reduce((sum, winner) => 
            sum + winner.wins.reduce((s, w) => s + w.amount, 0), 0
          )
        };

        setDrawHistory([newHistoryEntry, ...drawHistory.slice(0, 4)]);
        setShowResults(true);
        
        // Reset for next round
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
            <Ticket className="text-yellow-400 w-10 h-10" />
            <h1 className="text-5xl font-bold text-white">SỔ XỐ MIỀN NAM</h1>
            <Ticket className="text-yellow-400 w-10 h-10" />
          </div>
          <p className="text-orange-200 text-xl">Mua vé số - Chờ quay thưởng - Trúng lớn!</p>
        </div>

        {/* Jackpot Display */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 mb-8 text-center shadow-2xl border-4 border-yellow-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="text-yellow-300 w-10 h-10" />
            <h2 className="text-3xl font-bold text-white">TỔNG GIẢI THƯỞNG</h2>
          </div>
          <div className="text-5xl font-bold text-yellow-300 mb-4">{formatCurrency(jackpot)}</div>
          <div className="flex justify-center gap-12 text-white text-lg">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span>{totalPlayers.toLocaleString()} người chơi</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6" />
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
                  <Ticket className="w-6 h-6" />
                  Chọn Vé Số
                </h3>
                <button
                  onClick={generateAvailableTickets}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
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
                            {formatCurrency(ticket.price)}
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
                  <DollarSign className="w-6 h-6" />
                  {selectedTicketForPurchase 
                    ? `Mua Vé ${selectedTicketForPurchase.series}-${selectedTicketForPurchase.number}` 
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
                <Gift className="w-6 h-6" />
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
                  {PRIZES.map(prize => (
                    <div key={prize.name} className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-white font-bold">{prize.name}</h4>
                        <span className="text-yellow-400 text-sm">
                          {formatCurrency(getPrizeAmount(prize.name))}
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
                  <Clock className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Chờ đến giờ quay thưởng</p>
                </div>
              )}
            </div>

            {/* Winners Check */}
            {showResults && drawResults && (
              <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-6 border border-green-400/50">
                <h3 className="text-xl font-bold text-green-300 mb-4">Kiểm Tra Trúng Thưởng</h3>
                {playerTickets.filter(t => t.name === playerName).map(ticket => {
                  const wins = checkWinning(ticket.number, drawResults);
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
    </div>
  );
};

export default SoXoGame;
