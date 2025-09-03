import React, { useState, useEffect } from 'react';
// Removed lucide-react import

const DailyCheckIn = () => {
  const [currentDay, setCurrentDay] = useState(3);
  const [claimedDays, setClaimedDays] = useState([1, 2]);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [animatingReward, setAnimatingReward] = useState(null);
  const [showTestControls, setShowTestControls] = useState(true);
  // Initialize loginStreak based on the number of already claimed days
  const [loginStreak, setLoginStreak] = useState(claimedDays.length);

  // Define SVG icons as components or directly as JSX
  const StarIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  const SparklesIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 17.8l-2.6-1.5L6.8 18l1.5-2.6-1.5-2.6 2.6-1.5 2.6-1.5 2.6 1.5 2.6 1.5-1.5 2.6 1.5 2.6-2.6 1.5-2.6 1.5z"></path>
      <path d="M12 2v2"></path>
      <path d="M4.2 4.2l1.4 1.4"></path>
      <path d="M2 12h2"></path>
      <path d="M4.2 19.8l1.4-1.4"></path>
      <path d="M12 22v-2"></path>
      <path d="M19.8 19.8l-1.4-1.4"></path>
      <path d="M22 12h-2"></path>
      <path d="M19.8 4.2l-1.4 1.4"></path>
    </svg>
  );

  const ZapIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );

  const ShieldIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );

  const GiftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"></polyline>
      <rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
  );

  const FlameIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.27 16.78A9.61 9.61 0 0 0 12 15c-3.6 0-6.73 1.08-9.27 3.22C1.96 18.85 2 22 2 22c0 0 3.22-.04 7.82-2.73C12.43 21.03 15 22 15 22c2.22 0 4.2-.8 5.73-2.11C22.72 18.39 21.27 16.78 21.27 16.78z"></path>
      <path d="M12 15c1.66 0 3-1.34 3-3 0-1.33-.5-2-1-3 0 0-2 2-3 3l-3 3c.5 1 1.66 3 3 3z"></path>
    </svg>
  );

  const CrownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6l-2 3H5l2-3-2-3h5l2-3 2 3h5l-2 3 2 3h-5l-2-3z"></path>
      <path d="M2 15l.9 1.8a6 6 0 0 0 8.2 8.2l1.8.9 1.8-.9a6 6 0 0 0 8.2-8.2L22 15"></path>
    </svg>
  );


  const dailyRewards = [
    { day: 1, name: "Kim Cương", amount: "100", icon: <StarIcon className="text-blue-400" /> },
    { day: 2, name: "Vàng", amount: "5000", icon: <SparklesIcon className="text-yellow-400" /> },
    { day: 3, name: "Thẻ Ma Thuật", amount: "3", icon: <ZapIcon className="text-purple-400" /> },
    { day: 4, name: "Đá Linh Hồn", amount: "10", icon: <ShieldIcon className="text-emerald-400" /> },
    { day: 5, name: "Rương Huyền Thoại", amount: "1", icon: <GiftIcon className="text-amber-400" /> },
    { day: 6, name: "Vé Triệu Hồi", amount: "5", icon: <FlameIcon className="text-red-400" /> },
    { day: 7, name: "Vũ Khí Thần Thánh", amount: "1", icon: <CrownIcon className="text-yellow-400" /> },
  ];

  const claimReward = (day) => {
    // Check if the day is the current day and hasn't been claimed yet
    if (day === currentDay && !claimedDays.includes(day)) {
      setAnimatingReward(dailyRewards.find(reward => reward.day === day));
      
      // MODIFIED: Update state immediately, then show animation
      const newClaimedDays = [...claimedDays, day];
      setClaimedDays(newClaimedDays);
      setLoginStreak(newClaimedDays.length);
      
      setShowRewardAnimation(true);

      // REMOVED: The setTimeout that automatically closed the animation overlay.
      // The user will now close it manually.
    }
  };

  const goToNextDay = () => {
    if (currentDay < 7) {
      setCurrentDay(currentDay + 1);
    }
  };

  const goToPreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const resetClaimedDays = () => {
    setClaimedDays([]);
    setLoginStreak(0);
  };

  // Toggle test controls visibility
  const toggleTestControls = () => {
    setShowTestControls(!showTestControls);
  };

  // REMOVED: Sparkle animation effect via useEffect is no longer needed.

  return (
    <div className="bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 shadow-2xl rounded-xl max-w-md mx-auto overflow-hidden relative">
      {/* REMOVED: Background sparkle effects have been removed as per the request. */}

      {/* Enhanced Progress info - REDESIGNED WITH WATER LEVEL */}
      <div className="flex justify-center mt-6 mb-6">
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 backdrop-blur-sm rounded-full px-6 py-2 flex items-center gap-3 border border-slate-700 shadow-lg">
          <div className="flex items-center">
            <div className="relative w-16 h-16">
              {/* Water level container */}
              <div className="w-16 h-16 relative overflow-hidden rounded-full border-2 border-slate-700">
                {/* Water background */}
                <div className="absolute inset-0 bg-slate-900"></div>

                {/* Water fill animation */}
                <div
                  className="water-fill absolute w-full bg-gradient-to-b from-cyan-400 to-blue-600 opacity-80"
                  style={{
                    bottom: 0,
                    height: `${(loginStreak / 7) * 100}%`,
                    borderTopLeftRadius: '50%',
                    borderTopRightRadius: '50%',
                    transition: 'height 1s ease-out'
                  }}
                >
                  {/* Water wave effect */}
                  <div className="water-wave1"></div>
                  <div className="water-wave2"></div>
                </div>

                {/* Login streak number */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  {/* MODIFIED: Added opacity-70 class */}
                  <span className="text-2xl font-bold text-white opacity-70">{loginStreak}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-white font-bold">Check In</div>
            <div className="text-indigo-300 text-sm font-medium">
              Ngày {currentDay}
            </div>
            <div className="mt-1 flex items-center">
              {/* Progress dots reflect current day */}
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-1 rounded-full mr-1 ${
                    i < currentDay
                      ? 'bg-gradient-to-r from-purple-400 to-indigo-500'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar bar with glowing current day */}
      <div className="px-6 mb-6">
        {/* Enhanced day indicators */}
        <div className="flex justify-between">
          {dailyRewards.map(reward => {
            // Determine the status and styles for each day indicator
            const isPast = reward.day < currentDay;
            const isCurrent = reward.day === currentDay;
            const isClaimed = claimedDays.includes(reward.day);
            const isFuture = reward.day > currentDay;

            // Base classes
            let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 relative";

            // Apply status-specific styles
            if (isPast && isClaimed) {
              dayClasses += " bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md";
            } else if (isPast && !isClaimed) {
              dayClasses += " bg-slate-700 text-slate-400 opacity-70";
            } else if (isCurrent) {
              dayClasses += " bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg";
            } else { // isFuture or past but not claimed
              dayClasses += " bg-slate-700 text-slate-400";
            }

            return (
              <div key={reward.day} className="relative group">
                {/* Day indicator circle */}
                <div className={dayClasses}>
                  {/* Day number */}
                  <span className="font-bold z-10">{reward.day}</span>

                  {/* Decorative elements */}
                  {isCurrent && (
                    <>
                      {/* Pulsing ring effect for current day */}
                      <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-indigo-400"></div>
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 opacity-30 blur-sm"></div>
                    </>
                  )}

                  {/* Check mark for claimed days */}
                  {isClaimed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg z-20">
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                  <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {reward.name}
                  </div>
                  <div className="w-2 h-2 bg-slate-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards section */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 gap-4">
          {dailyRewards.map(reward => (
            <div
              key={reward.day}
              className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                claimedDays.includes(reward.day) ? 'opacity-60' : 'hover:transform hover:scale-[1.02]'
              }`}
            >
              {/* Glowing border for current day */}
              {reward.day === currentDay && !claimedDays.includes(reward.day) && (
                <div className="absolute inset-0 rounded-xl animate-pulse-slow"
                    style={{
                      background: `linear-gradient(45deg, transparent, rgba(139,92,246,0.6), transparent)`,
                      backgroundSize: '200% 200%',
                    }}>
                </div>
              )}

              <div
                className={`relative flex items-center gap-4 p-4 rounded-xl ${
                  reward.day === currentDay && !claimedDays.includes(reward.day)
                    ? 'bg-gradient-to-r from-slate-800 to-slate-800/95 border border-purple-500/50'
                    : 'bg-slate-800'
                }`}
              >
                {/* Day indicator */}
                <div className="absolute top-0 left-0 p-1 px-2 text-xs bg-slate-700 rounded-br-lg font-medium text-slate-300">
                  Ngày {reward.day}
                </div>

                {/* Reward icon */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  reward.day === 7
                    ? 'bg-gradient-to-br from-purple-400 to-indigo-600'
                    : reward.day === currentDay && !claimedDays.includes(reward.day)
                    ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-slate-600'
                    : 'bg-gradient-to-br from-slate-700 to-slate-900'
                } shadow-lg p-1`}>
                  <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                    reward.day === 7
                      ? 'bg-indigo-500/20'
                      : reward.day === currentDay && !claimedDays.includes(reward.day)
                      ? 'bg-slate-800/80 backdrop-blur-sm'
                      : 'bg-slate-800'
                  }`}>
                    <div className="w-8 h-8">{reward.icon}</div>
                  </div>
                </div>

                {/* Reward info */}
                <div className="flex-1">
                  <h3 className="font-bold text-white">{reward.name}</h3>
                  <p className="text-slate-300 text-sm">x{reward.amount}</p>
                </div>

                {/* Claim button */}
                <button
                  onClick={() => claimReward(reward.day)}
                  disabled={reward.day !== currentDay || claimedDays.includes(reward.day)}
                  className={`min-w-[90px] py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    claimedDays.includes(reward.day)
                      ? 'bg-green-600 text-white'
                      : reward.day === currentDay
                      ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:shadow-indigo-400/20 hover:shadow-lg'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {claimedDays.includes(reward.day)
                    ? 'Đã Nhận'
                    : reward.day === currentDay
                    ? 'Nhận Ngay'
                    : 'Chờ'}
                </button>

                {/* "Claimed" overlay */}
                {claimedDays.includes(reward.day) && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-green-600 rounded-full p-2 transform rotate-12">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final day special reward */}
      <div className="mx-6 mb-6 relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-indigo-500/20 to-purple-400/20 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>

        <div className="relative p-5 bg-gradient-to-br from-slate-800/95 to-slate-900 backdrop-blur-sm border border-purple-500/30">
          <div className="absolute top-1 right-2">
            <div className="text-xs font-semibold text-slate-300 bg-slate-700 px-2 py-1 rounded">
              Còn {7 - currentDay} ngày
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 p-1 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-indigo-500/20 rounded-lg flex items-center justify-center">
                   {/* Replaced Crown icon with SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-indigo-300 w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 6l-2 3H5l2-3-2-3h5l2-3 2 3h5l-2 3 2 3h-5l-2-3z"></path>
                    <path d="M2 15l.9 1.8a6 6 0 0 0 8.2 8.2l1.8.9 1.8-.9a6 6 0 0 0 8.2-8.2L22 15"></path>
                  </svg>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-400 rounded-full text-slate-900 flex items-center justify-center font-bold text-xs">
                7
              </div>
            </div>

            <div>
              <div className="text-sm text-indigo-300 font-semibold">PHẦN THƯỞNG ĐẶC BIỆT</div>
              <div className="text-white font-bold text-lg">Vũ Khí Thần Thánh</div>
              <div className="text-xs text-slate-400 mt-1">Hiếm có - Chỉ đạt được khi đăng nhập đủ 7 ngày</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls Area */}
      <div className="mx-6 mb-6">
        <div className="relative">
          <button
            onClick={toggleTestControls}
            className="mb-2 bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
          >
            {showTestControls ? "Ẩn Bảng Điều Khiển" : "Hiện Bảng Điều Khiển"}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTestControls && (
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
              <h3 className="text-white font-medium mb-3 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bảng Điều Khiển
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={goToPreviousDay}
                  disabled={currentDay === 1}
                  className={`p-2 rounded text-center text-sm font-medium ${
                    currentDay === 1
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  Ngày Trước
                </button>
                <button
                  onClick={resetClaimedDays}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded text-center text-sm font-medium"
                >
                  Đặt Lại
                </button>
                <button
                  onClick={goToNextDay}
                  disabled={currentDay === 7}
                  className={`p-2 rounded text-center text-sm font-medium ${
                    currentDay === 7
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  Ngày Sau
                </button>
              </div>

              <div className="mt-2 text-xs text-slate-400">
                Ngày hiện tại: <span className="text-indigo-400 font-medium">{currentDay}</span> |
                Đã nhận: <span className="text-green-400 font-medium">{claimedDays.length}</span> phần thưởng |
                Streak: <span className="text-purple-400 font-medium">{loginStreak}</span> ngày
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODIFIED: Reward animation overlay */}
      {showRewardAnimation && animatingReward && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
          {/* ADDED: Subtle radial gradient background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,rgba(139,92,246,0)_70%)]"></div>

          <div className="relative max-w-xs w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl animate-float border border-slate-700">
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 p-1 shadow-lg shadow-indigo-500/50">
                <div className="w-full h-full rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                  {/* MODIFIED: Applied new animation to the icon wrapper */}
                  <div className="w-12 h-12 animate-reward-icon-pop">
                    {animatingReward?.icon}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-14 text-center">
              <div className="text-indigo-400 text-lg font-bold mb-1">Nhận Thưởng Thành Công!</div>
              <div className="text-white text-xl font-bold mb-3">{animatingReward?.name}</div>
              <div className="text-indigo-200 text-3xl font-bold">x{animatingReward?.amount}</div>
              <div className="mt-6 text-sm text-slate-400">Phần thưởng đã được thêm vào kho đồ</div>

              {/* ADDED: Confirmation button to close the overlay */}
              <button
                onClick={() => setShowRewardAnimation(false)}
                className="mt-6 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-shadow duration-300"
              >
                Tuyệt vời!
              </button>
            </div>
          </div>

          {/* REMOVED: Animated particles are no longer needed. */}
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* ADDED: New keyframe animation for the reward icon */
        @keyframes reward-icon-pop {
            0% { transform: scale(0.8); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 10px rgba(167, 139, 250, 0.7));}
            100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(167, 139, 250, 0.5));}
        }

        /* REMOVED: Particle animations are no longer needed */

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes wave {
          0% { transform: translateX(-100%) translateY(5px); }
          100% { transform: translateX(100%) translateY(-5px); }
        }

        .water-wave1, .water-wave2 {
          position: absolute;
          top: -15px;
          left: 0;
          width: 200%;
          height: 20px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: wave 3s infinite linear;
        }

        .water-wave2 {
          top: -5px;
          animation-delay: 1s;
          opacity: 0.6;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* ADDED: Class for the new icon animation */
        .animate-reward-icon-pop {
            animation: reward-icon-pop 1.5s ease-in-out infinite;
        }

        /* REMOVED: Particle animation classes are no longer needed */

        .drop-shadow-glow {
          filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.5));
        }
      `}</style>
    </div>
  );
};

export default DailyCheckIn;
