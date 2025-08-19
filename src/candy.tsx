import React, { useState, useEffect } from 'react';

// --- Cài đặt Game ---
const width = 8; // Số ô mỗi hàng
const candyColors = [
    '🍬', // Kẹo
    '🍭', // Kẹo mút
    '🍫', // Sô cô la
    '🍩', // Bánh donut
    '🍪', // Bánh quy
    '🧁'  // Bánh cupcake
];

// --- Component Chính Của Ứng Dụng ---
export default function App() {
    const [currentColorArrangement, setCurrentColorArrangement] = useState([]);
    const [squareBeingDragged, setSquareBeingDragged] = useState(null);
    const [squareBeingReplaced, setSquareBeingReplaced] = useState(null);
    const [scoreDisplay, setScoreDisplay] = useState(0);

    // --- Hàm kiểm tra các hàng và cột có kẹo trùng màu ---

    const checkForColumnOfFour = () => {
        let changed = false;
        for (let i = 0; i <= 39; i++) {
            const columnOfFour = [i, i + width, i + width * 2, i + width * 3];
            const decidedColor = currentColorArrangement[i];
            const isBlank = currentColorArrangement[i] === ' ';

            if (columnOfFour.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 4);
                columnOfFour.forEach(square => currentColorArrangement[square] = ' ');
                changed = true;
            }
        }
        return changed;
    }

    const checkForColumnOfThree = () => {
        let changed = false;
        for (let i = 0; i <= 47; i++) {
            const columnOfThree = [i, i + width, i + width * 2];
            const decidedColor = currentColorArrangement[i];
            const isBlank = currentColorArrangement[i] === ' ';

            if (columnOfThree.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 3);
                columnOfThree.forEach(square => currentColorArrangement[square] = ' ');
                changed = true;
            }
        }
        return changed;
    }

    const checkForRowOfFour = () => {
        let changed = false;
        for (let i = 0; i < 64; i++) {
            const rowOfFour = [i, i + 1, i + 2, i + 3];
            const decidedColor = currentColorArrangement[i];
            const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 61, 62, 63];
            const isBlank = currentColorArrangement[i] === ' ';

            if (notValid.includes(i)) continue;

            if (rowOfFour.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 4);
                rowOfFour.forEach(square => currentColorArrangement[square] = ' ');
                changed = true;
            }
        }
        return changed;
    }

    const checkForRowOfThree = () => {
        let changed = false;
        for (let i = 0; i < 64; i++) {
            const rowOfThree = [i, i + 1, i + 2];
            const decidedColor = currentColorArrangement[i];
            const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
            const isBlank = currentColorArrangement[i] === ' ';

            if (notValid.includes(i)) continue;

            if (rowOfThree.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 3);
                rowOfThree.forEach(square => currentColorArrangement[square] = ' ');
                changed = true;
            }
        }
        return changed;
    }

    const moveIntoSquareBelow = () => {
        let changed = false;
        for (let i = 0; i <= 55; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
            const isFirstRow = firstRow.includes(i);

            if (isFirstRow && currentColorArrangement[i] === ' ') {
                let randomNumber = Math.floor(Math.random() * candyColors.length);
                currentColorArrangement[i] = candyColors[randomNumber];
                changed = true;
            }

            if ((currentColorArrangement[i + width]) === ' ') {
                currentColorArrangement[i + width] = currentColorArrangement[i];
                currentColorArrangement[i] = ' ';
                changed = true;
            }
        }
        return changed;
    }

    // --- Xử lý sự kiện kéo thả (cho cả chuột và cảm ứng) ---

    const dragStart = (e) => setSquareBeingDragged(e.target);
    const dragDrop = (e) => setSquareBeingReplaced(e.target);
    
    // <<< THAY ĐỔI: Thêm các hàm xử lý sự kiện chạm cho điện thoại
    const touchStart = (e) => {
        // e.target có thể là icon <span>, chúng ta cần thẻ <div> cha chứa data-id
        setSquareBeingDragged(e.target.closest('[data-id]'));
    };
    const touchMove = (e) => {
        // Ngăn màn hình cuộn khi lướt tay trên game
        e.preventDefault();
        // Lấy vị trí ngón tay trên màn hình
        const touch = e.touches[0];
        // Tìm xem ngón tay đang ở trên phần tử nào
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        // Lấy thẻ <div> cha chứa data-id và cập nhật ô sẽ được thay thế
        setSquareBeingReplaced(targetElement?.closest('[data-id]'));
    };

    const dragEnd = () => {
        if (!squareBeingDragged || !squareBeingReplaced) {
            setSquareBeingDragged(null);
            setSquareBeingReplaced(null);
            return;
        }

        const squareBeingDraggedId = parseInt(squareBeingDragged.getAttribute('data-id'));
        const squareBeingReplacedId = parseInt(squareBeingReplaced.getAttribute('data-id'));

        const validMoves = [
            squareBeingDraggedId - 1,
            squareBeingDraggedId - width,
            squareBeingDraggedId + 1,
            squareBeingDraggedId + width
        ];

        const validMove = validMoves.includes(squareBeingReplacedId);

        const newArrangement = [...currentColorArrangement];
        const colorBeingDragged = newArrangement[squareBeingDraggedId];
        newArrangement[squareBeingDraggedId] = newArrangement[squareBeingReplacedId];
        newArrangement[squareBeingReplacedId] = colorBeingDragged;
        
        const checkArrangementForMatch = (board) => {
            for (let i = 0; i <= 39; i++) {
                const columnOfFour = [i, i + width, i + width * 2, i + width * 3];
                const decidedColor = board[i];
                if (decidedColor && columnOfFour.every(square => board[square] === decidedColor)) return true;
            }
            for (let i = 0; i < 64; i++) {
                const rowOfFour = [i, i + 1, i + 2, i + 3];
                const decidedColor = board[i];
                const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 61, 62, 63];
                if (notValid.includes(i)) continue;
                if (decidedColor && rowOfFour.every(square => board[square] === decidedColor)) return true;
            }
            for (let i = 0; i <= 47; i++) {
                const columnOfThree = [i, i + width, i + width * 2];
                const decidedColor = board[i];
                if (decidedColor && columnOfThree.every(square => board[square] === decidedColor)) return true;
            }
             for (let i = 0; i < 64; i++) {
                const rowOfThree = [i, i + 1, i + 2];
                const decidedColor = board[i];
                const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
                if (notValid.includes(i)) continue;
                if (decidedColor && rowOfThree.every(square => board[square] === decidedColor)) return true;
            }
            return false;
        }

        const isAValidMove = checkArrangementForMatch(newArrangement);

        if (validMove && isAValidMove) {
            setCurrentColorArrangement(newArrangement);
        }
        
        setSquareBeingDragged(null);
        setSquareBeingReplaced(null);
    }

    const createBoard = () => {
        const randomColorArrangement = [];
        for (let i = 0; i < width * width; i++) {
            const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
            randomColorArrangement.push(randomColor);
        }
        setCurrentColorArrangement(randomColorArrangement);
    }

    useEffect(() => {
        createBoard();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const c4 = checkForColumnOfFour();
            const r4 = checkForRowOfFour();
            const c3 = checkForColumnOfThree();
            const r3 = checkForRowOfThree();
            const moved = moveIntoSquareBelow();
            
            if (c4 || r4 || c3 || r3 || moved) {
                setCurrentColorArrangement([...currentColorArrangement]);
            }
        }, 100);
        return () => clearInterval(timer);
    }, [currentColorArrangement]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 p-4 font-sans">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h1 className="text-3xl font-bold text-white tracking-wider">Kẹo Ngọt</h1>
                    <div className="text-right">
                        <div className="text-xl font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg shadow-lg">
                            Điểm: {scoreDisplay}
                        </div>
                    </div>
                </div>
                <div 
                    className="grid gap-1.5"
                    style={{gridTemplateColumns: `repeat(${width}, 1fr)`}}
                >
                    {currentColorArrangement.map((candyColor, index) => (
                        <div
                            key={index}
                            data-id={index}
                            // Sự kiện cho chuột (máy tính)
                            draggable={true}
                            onDragStart={dragStart}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={(e) => e.preventDefault()}
                            onDragLeave={(e) => e.preventDefault()}
                            onDrop={dragDrop}
                            onDragEnd={dragEnd}
                            // <<< THAY ĐỔI: Thêm sự kiện cho cảm ứng (điện thoại)
                            onTouchStart={touchStart}
                            onTouchMove={touchMove}
                            onTouchEnd={dragEnd} // Dùng chung hàm dragEnd
                            
                            className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg cursor-grab active:cursor-grabbing transition-all duration-300"
                            style={{ 
                                backgroundColor: candyColor === ' ' ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                                boxShadow: candyColor === ' ' ? 'none' : 'inset 0 2px 4px rgba(0,0,0,0.3)',
                             }}
                        >
                           <span 
                                className="text-4xl md:text-5xl select-none transition-transform duration-300 hover:scale-110"
                                style={{
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
                                    transform: `scale(${candyColor === ' ' ? 0 : 1})`,
                                    transition: 'transform 0.3s ease-in-out',
                                    // <<< THAY ĐỔI: Ngăn icon kẹo bị "chạm" phải, để thẻ div nhận sự kiện
                                    pointerEvents: 'none',
                                }}
                            >
                                {candyColor}
                            </span>
                        </div>
                    ))}
                </div>
                 <p className="text-center text-slate-400 mt-6 text-sm">Chạm và lướt kẹo để tạo thành hàng 3, 4.</p>
            </div>
        </div>
    );
}
