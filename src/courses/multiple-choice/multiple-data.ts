// quizData.ts

import QuizDataPart1 from './multiple-data/multiple-data-p1.ts';
import QuizDataPart2 from './multiple-data/multiple-data-p2.ts';
import QuizDataPart3 from './multiple-data/multiple-data-p3.ts';


const QuizDataOriginal = [
  
  {
    "question": "Từ \"Source\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lửa", "Nước", "Nguồn", "Hơi nước"],
    "correctAnswer": "Nguồn"
  },
  {
    "question": "Từ \"Insurance\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bảo vệ", "Bảo hiểm", "Đầu tư", "Rủi ro"],
    "correctAnswer": "Bảo hiểm"
  },
  {
    "question": "Từ \"Argument\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thỏa thuận", "Tranh luận", "Cuộc chiến", "Im lặng"],
    "correctAnswer": "Tranh luận"
  },
  {
    "question": "Từ \"Influence\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ảnh hưởng", "Thờ ơ", "Kháng cự", "Lờ đi"],
    "correctAnswer": "Ảnh hưởng"
  },
  {
    "question": "Từ \"Release\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bắt giữ", "Giải phóng", "Giữ lại", "Giam giữ"],
    "correctAnswer": "Giải phóng"
  },
  {
    "question": "Từ \"Capacity\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khả năng", "Giới hạn", "Sức chứa", "Khoảng trống"],
    "correctAnswer": "Sức chứa"
  },
  {
    "question": "Từ \"Senate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chính phủ", "Hội đồng", "Thượng nghị viện", "Tòa án"],
    "correctAnswer": "Thượng nghị viện"
  },
  {
    "question": "Từ \"Massive\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhỏ", "Lớn", "Nhẹ", "Nặng"],
    "correctAnswer": "Lớn"
  },
  {
    "question": "Từ \"Stick\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cành cây", "Keo dán", "Cây gậy", "Lá"],
    "correctAnswer": "Cây gậy"
  },
  {
    "question": "Từ \"District\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Quốc gia", "Thành phố", "Quận", "Làng"],
    "correctAnswer": "Quận"
  },
  {
    "question": "Từ \"Budget\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chi phí", "Ngân sách", "Nợ", "Kế hoạch"],
    "correctAnswer": "Ngân sách"
  },
  {
    "question": "Từ \"Measure\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tính toán", "Đo lường", "Đoán", "Lờ đi"],
    "correctAnswer": "Đo lường"
  },
  {
    "question": "Từ \"Cross\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Theo dõi", "Băng qua", "Gặp gỡ", "Tránh"],
    "correctAnswer": "Băng qua"
  },
  {
    "question": "Từ \"Central\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trung tâm", "Rìa", "Đỉnh", "Đáy"],
    "correctAnswer": "Trung tâm"
  },
  {
    "question": "Từ \"Proud\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xấu hổ", "Tự hào", "Hạnh phúc", "Buồn"],
    "correctAnswer": "Tự hào"
  },
  {
    "question": "Từ \"Core\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lõi", "Bề mặt", "Bên ngoài", "Lớp"],
    "correctAnswer": "Lõi"
  },
  {
    "question": "Từ \"County\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành phố", "Hạt ( Tương đương cấp Huyện )", "Thị trấn", "Quận"],
    "correctAnswer": "Hạt ( Tương đương cấp Huyện )"
  },
  {
    "question": "Từ \"Species\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Loài", "Giống", "Cá thể", "Nhóm"],
    "correctAnswer": "Loài"
  },
  {
    "question": "Từ \"Conditions\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Điều kiện", "Kết quả", "Nguyên nhân", "Vấn đề"],
    "correctAnswer": "Điều kiện"
  },
  {
    "question": "Từ \"Touch\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhìn", "Chạm", "Nghe", "Nếm"],
    "correctAnswer": "Chạm"
  },
  {
    "question": "Từ \"Mass\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lửa", "Nước", "Khối lượng", "Hơi nước"],
    "correctAnswer": "Khối lượng"
  },
  {
    "question": "Từ \"Platform\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xe lửa", "Sân ga", "Ghế", "Cửa"],
    "correctAnswer": "Sân ga"
  },
  {
    "question": "Từ \"Straight\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cong", "Thẳng", "Tròn", "Xoắn"],
    "correctAnswer": "Thẳng"
  },
  {
    "question": "Từ \"Serious\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vui vẻ", "Nghiêm túc", "Buồn bã", "Ngớ ngẩn"],
    "correctAnswer": "Nghiêm túc"
  },
  {
    "question": "Từ \"Encourage\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngăn cản", "Khuyến khích", "Làm nản lòng", "Phớt lờ"],
    "correctAnswer": "Khuyến khích"
  },
  {
    "question": "Từ \"Due\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sớm", "Đến hạn", "Tùy chọn", "Quá hạn"],
    "correctAnswer": "Đến hạn"
  },
  {
    "question": "Từ \"Memory\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự quên", "Trí nhớ", "Sự thờ ơ", "Mất mát"],
    "correctAnswer": "Trí nhớ"
  },
  {
    "question": "Từ \"Secretary\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giáo viên", "Thư ký", "Kỹ sư", "Bác sĩ"],
    "correctAnswer": "Thư ký"
  },
  {
    "question": "Từ \"Cold\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nóng", "Ấm", "Lạnh", "Nhiệt đới"],
    "correctAnswer": "Lạnh"
  },
  {
    "question": "Từ \"Instance\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ví dụ", "Toàn bộ", "Lý thuyết", "Sai lầm"],
    "correctAnswer": "Ví dụ"
  },
  {
    "question": "Từ \"Foundation\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mái nhà", "Nền tảng", "Trang trí", "Cửa sổ"],
    "correctAnswer": "Nền tảng"
  },
  {
    "question": "Từ \"Separate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kết hợp", "Tách biệt", "Gắn liền", "Trộn lẫn"],
    "correctAnswer": "Tách biệt"
  },
  {
    "question": "Từ \"Map\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bản đồ", "Sách", "Bài hát", "Tranh"],
    "correctAnswer": "Bản đồ"
  },
  {
    "question": "Từ \"Ice\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lửa", "Nước", "Đá", "Hơi nước"],
    "correctAnswer": "Đá"
  },
  {
    "question": "Từ \"Statement\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Câu hỏi", "Tuyên bố", "Thì thầm", "Im lặng"],
    "correctAnswer": "Tuyên bố"
  },
  {
    "question": "Từ \"Rich\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghèo", "Giàu có", "Trung lưu", "Tiết kiệm"],
    "correctAnswer": "Giàu có"
  },
  {
    "question": "Từ \"Previous\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiếp theo", "Hiện tại", "Trước đó", "Tương lai"],
    "correctAnswer": "Trước đó"
  },
  {
    "question": "Từ \"Necessary\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tùy chọn", "Cần thiết", "Thêm", "Không quan trọng"],
    "correctAnswer": "Cần thiết"
  },
  {
    "question": "Từ \"Engineering\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Y học", "Nghệ thuật", "Kỹ thuật", "Văn học"],
    "correctAnswer": "Kỹ thuật"
  },
  {
    "question": "Từ \"Heat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lạnh", "Nhiệt", "Đá", "Hơi nước"],
    "correctAnswer": "Nhiệt"
  },
  {
    "question": "Từ \"Collection\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự phân tán", "Cá nhân", "Bộ sưu tập", "Sự phá hủy"],
    "correctAnswer": "Bộ sưu tập"
  },
  {
    "question": "Từ \"Labor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giải trí", "Lao động", "Nghỉ ngơi", "Học tập"],
    "correctAnswer": "Lao động"
  },
  {
    "question": "Từ \"Flow\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhảy", "Bay", "Chảy", "Đứng yên"],
    "correctAnswer": "Chảy"
  },
  {
    "question": "Từ \"Floor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trần nhà", "Sàn nhà", "Tường", "Cửa sổ"],
    "correctAnswer": "Sàn nhà"
  },
  {
    "question": "Từ \"Variety\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự giống nhau", "Sự đa dạng", "Sự đơn điệu", "Sự cố định"],
    "correctAnswer": "Sự đa dạng"
  },
  {
    "question": "Từ \"Math\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Môn Văn", "Môn Toán", "Môn Sử", "Môn Địa"],
    "correctAnswer": "Môn Toán"
  },
  {
    "question": "Từ \"Session\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kỳ nghỉ", "Phiên làm việc", "Buổi tiệc", "Chuyến đi"],
    "correctAnswer": "Phiên làm việc"
  },
  {
    "question": "Từ \"Nuclear\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sinh học", "Hóa học", "Hạt nhân", "Thiên văn"],
    "correctAnswer": "Hạt nhân"
  },
  {
    "question": "Từ \"Roll\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cắt", "Cuộn", "Dán", "Gấp"],
    "correctAnswer": "Cuộn"
  },
  {
    "question": "Từ \"Museum\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhà hát", "Bảo tàng", "Trường học", "Siêu thị"],
    "correctAnswer": "Bảo tàng"
  },
  {
    "question": "Từ \"Limited\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vô hạn", "Có giới hạn", "Tạm thời", "Mở rộng"],
    "correctAnswer": "Có giới hạn"
  },
  {
    "question": "Từ \"Constant\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngẫu nhiên", "Hằng số", "Không đều", "Thỉnh thoảng"],
    "correctAnswer": "Hằng số"
  },
  {
    "question": "Từ \"Temperature\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Áp suất", "Nhiệt độ", "Độ ẩm", "Tốc độ"],
    "correctAnswer": "Nhiệt độ"
  },
  {
    "question": "Từ \"Description\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dự đoán", "Sự miêu tả", "Giải thích", "Câu hỏi"],
    "correctAnswer": "Sự miêu tả"
  },
  {
    "question": "Từ \"Transition\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Gián đoạn", "Sự chuyển tiếp", "Kết thúc", "Khởi đầu"],
    "correctAnswer": "Sự chuyển tiếp"
  },
  {
    "question": "Từ \"Chair\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bàn", "Ghế", "Đèn", "Tủ"],
    "correctAnswer": "Ghế"
  },
  {
    "question": "Từ \"Pattern\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Màu sắc", "Hoa văn", "Kích thước", "Chất liệu"],
    "correctAnswer": "Hoa văn"
  },
  {
    "question": "Từ \"Demand\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cung cấp", "Nhu cầu", "Từ chối", "Đề nghị"],
    "correctAnswer": "Nhu cầu"
  },
  {
    "question": "Từ \"Hate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Yêu", "Ghét", "Thích", "Quan tâm"],
    "correctAnswer": "Ghét"
  },
  {
    "question": "Từ \"Classroom\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phòng ngủ", "Lớp học", "Nhà bếp", "Phòng tắm"],
    "correctAnswer": "Lớp học"
  },
  {
    "question": "Từ “Army” trong tiếng Anh có nghĩa là gì?",
    "options": ["Lính", "Quân đội", "Chiến thuật", "Vũ khí"],
    "correctAnswer": "Quân đội"
  },
  {
    "question": "Từ “Spring” trong tiếng Anh có nghĩa là gì?",
    "options": ["Mùa đông", "Mùa hè", "Mùa xuân", "Mùa thu"],
    "correctAnswer": "Mùa xuân"
  },
  {
    "question": "Từ “Senior” trong tiếng Anh có nghĩa là gì?",
    "options": ["Trẻ", "Người lớn tuổi", "Sinh viên", "Bạn bè"],
    "correctAnswer": "Người lớn tuổi"
  },
  {
    "question": "Từ “Wind” trong tiếng Anh có nghĩa là gì?",
    "options": ["Gió", "Mưa", "Sấm", "Mây"],
    "correctAnswer": "Gió"
  },
  {
    "question": "Từ “Award” trong tiếng Anh có nghĩa là gì?",
    "options": ["Quà tặng", "Giải thưởng", "Tiền thưởng", "Công nhận"],
    "correctAnswer": "Giải thưởng"
  },
  {
    "question": "Từ “Clinical” trong tiếng Anh có nghĩa là gì?",
    "options": ["Lâm sàng", "Thử nghiệm", "Khoa học", "Thực tế"],
    "correctAnswer": "Lâm sàng"
  },
  {
    "question": "Từ “Trouble” trong tiếng Anh có nghĩa là gì?",
    "options": ["Niềm vui", "Hài lòng", "Rắc rối", "Thách thức"],
    "correctAnswer": "Rắc rối"
  },
  {
    "question": "Từ “Grade” trong tiếng Anh có nghĩa là gì?",
    "options": ["Điểm số", "Bảng", "Học kỳ", "Lớp học"],
    "correctAnswer": "Điểm số"
  },
  {
    "question": "Từ “Station” trong tiếng Anh có nghĩa là gì?",
    "options": ["Trạm", "Công viên", "Bệnh viện", "Thư viện"],
    "correctAnswer": "Trạm"
  },
  {
    "question": "Từ “Moments” trong tiếng Anh có nghĩa là gì?",
    "options": ["Khoảnh khắc", "Ngày", "Giờ", "Năm"],
    "correctAnswer": "Khoảnh khắc"
  },
  {
    "question": "Từ “Wave” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sóng biển", "Dòng chảy", "Bờ biển", "Cơn bão"],
    "correctAnswer": "Sóng biển"
  },
  {
    "question": "Từ “Block” trong tiếng Anh có nghĩa là gì?",
    "options": ["Khối", "Cây", "Đường", "Cột"],
    "correctAnswer": "Khối"
  },
  {
    "question": "Từ “Compared” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã so sánh", "Đã chênh lệch", "Đã tương phản", "Đã cạnh tranh"],
    "correctAnswer": "Đã so sánh"
  },
  {
    "question": "Từ “Strength” trong tiếng Anh có nghĩa là gì?",
    "options": ["Yếu đuối", "Sức mạnh", "Nhẹ nhàng", "Độ bền"],
    "correctAnswer": "Sức mạnh"
  },
  {
    "question": "Từ “Phase” trong tiếng Anh có nghĩa là gì?",
    "options": ["Giai đoạn", "Bước", "Vòng quay", "Tình huống"],
    "correctAnswer": "Giai đoạn"
  },
  {
    "question": "Từ “Secret” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bí mật", "Rõ ràng", "Công khai", "Đơn giản"],
    "correctAnswer": "Bí mật"
  },
  {
    "question": "Từ “Highest” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thấp nhất", "Cao nhất", "Trung bình", "Nhanh nhất"],
    "correctAnswer": "Cao nhất"
  },
  {
    "question": "Từ “Leaving” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đến", "Ở lại", "Rời đi", "Quay lại"],
    "correctAnswer": "Rời đi"
  },
  {
    "question": "Từ “Obvious” trong tiếng Anh có nghĩa là gì?",
    "options": ["Kỳ lạ", "Rõ ràng", "Mơ hồ", "Bí ẩn"],
    "correctAnswer": "Rõ ràng"
  },
  {
    "question": "Từ “Terrible” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tuyệt vời", "Khủng khiếp", "Đáng yêu", "Vui vẻ"],
    "correctAnswer": "Khủng khiếp"
  },
  {
    "question": "Từ \"Motion\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tĩnh lặng", "Chuyển động", "Nghỉ ngơi", "Phản ứng"],
    "correctAnswer": "Chuyển động"
  },
  {
    "question": "Từ \"Window\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tường", "Mái nhà", "Cửa sổ", "Sân"],
    "correctAnswer": "Cửa sổ"
  },
  {
    "question": "Từ \"Assume\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chứng minh", "Giả định", "Phân tích", "Thảo luận"],
    "correctAnswer": "Giả định"
  },
  {
    "question": "Từ \"Cycle\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chu kỳ", "Khoảng cách", "Lịch trình", "Quãng đường"],
    "correctAnswer": "Chu kỳ"
  },
  {
    "question": "Từ \"Suddenly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Từ từ", "Đột nhiên", "Thận trọng", "Dần dần"],
    "correctAnswer": "Đột nhiên"
  },
  {
    "question": "Từ \"Western\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phương Đông", "Phương Nam", "Phương Tây", "Phương Bắc"],
    "correctAnswer": "Phương Tây"
  },
  {
    "question": "Từ \"Broken\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mới", "Đầy đủ", "Bị hỏng", "Sạch sẽ"],
    "correctAnswer": "Bị hỏng"
  },
  {
    "question": "Từ \"Define\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xác định", "Định nghĩa", "So sánh", "Giải thích"],
    "correctAnswer": "Định nghĩa"
  },
  {
    "question": "Từ \"Spiritual\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thể chất", "Hữu hình", "Tâm linh", "Vật chất"],
    "correctAnswer": "Tâm linh"
  },
  {
    "question": "Từ \"Concerns\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Niềm vui", "Nỗi buồn", "Mối quan tâm", "Sự im lặng"],
    "correctAnswer": "Mối quan tâm"
  },
  {
    "question": "Từ \"Random\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Có kế hoạch", "Ngẫu nhiên", "Định mệnh", "Cố định"],
    "correctAnswer": "Ngẫu nhiên"
  },
  {
    "question": "Từ \"Moon\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mặt trời", "Mặt đất", "Mặt trăng", "Sao Thủy"],
    "correctAnswer": "Mặt trăng"
  },
  {
    "question": "Từ \"Dangerous\" trong tiếng Anh có nghĩa là gì?",
    "options": ["An toàn", "Nguy hiểm", "Dễ chịu", "Thú vị"],
    "correctAnswer": "Nguy hiểm"
  },
  {
    "question": "Từ \"Trees\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hoa", "Cây", "Đá", "Nước"],
    "correctAnswer": "Cây"
  },
  {
    "question": "Từ \"Trip\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chuyến đi", "Tai nạn", "Nghỉ ngơi", "Lỗi lầm"],
    "correctAnswer": "Chuyến đi"
  },
  {
    "question": "Từ \"Curious\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tò mò", "Lười biếng", "Buồn chán", "Dễ dãi"],
    "correctAnswer": "Tò mò"
  },
  {
    "question": "Từ \"Heavy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhẹ", "Nặng", "Béo", "Đậm"],
    "correctAnswer": "Nặng"
  },
  {
    "question": "Từ \"Fly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chạy", "Bay", "Bơi", "Nhảy"],
    "correctAnswer": "Bay"
  },
  {
    "question": "Từ \"Noticed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Nhận ra", "Quên lãng", "Phớt lờ"],
    "correctAnswer": "Nhận ra"
  },
  {
    "question": "Từ \"March\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Ba", "Lễ hội", "Hồi ức", "Biểu diễn"],
    "correctAnswer": "Tháng Ba"
  },
  {
    "question": "Từ \"Evening\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Buổi sáng", "Buổi trưa", "Buổi chiều", "Buổi tối"],
    "correctAnswer": "Buổi tối"
  },
  {
    "question": "Từ \"Objects\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đồ vật", "Con người", "Cảm xúc", "Động vật"],
    "correctAnswer": "Đồ vật"
  },
  {
    "question": "Từ \"Agreement\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự đồng ý", "Sự tranh cãi", "Sự từ chối", "Sự thất bại"],
    "correctAnswer": "Sự đồng ý"
  },
  {
    "question": "Từ \"Youth\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tuổi trẻ", "Người già", "Sự mệt mỏi", "Học vấn"],
    "correctAnswer": "Tuổi trẻ"
  },
  {
    "question": "Từ \"Crime\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Pháp luật", "Tội phạm", "Công lý", "Hòa bình"],
    "correctAnswer": "Tội phạm"
  },
  {
    "question": "Từ \"Detail\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tổng quan", "Chi tiết", "Khái niệm", "Kết luận"],
    "correctAnswer": "Chi tiết"
  },
  {
    "question": "Từ \"Expensive\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Rẻ", "Đắt", "Miễn phí", "Cũ"],
    "correctAnswer": "Đắt"
  },
  {
    "question": "Từ \"Damage\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sửa chữa", "Hư hại", "Xây dựng", "Làm mới"],
    "correctAnswer": "Hư hại"
  },
  {
    "question": "Từ \"Fix\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sửa chữa", "Làm hỏng", "Bán", "Đánh mất"],
    "correctAnswer": "Sửa chữa"
  },
  {
    "question": "Từ \"Heaven\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Địa ngục", "Thiên đường", "Mặt đất", "Mặt trăng"],
    "correctAnswer": "Thiên đường"
  },
  {
    "question": "Từ \"Select\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chọn", "Loại bỏ", "Cất giữ", "Phá hủy"],
    "correctAnswer": "Chọn"
  },
  {
    "question": "Từ \"Struggle\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đấu tranh", "Nghỉ ngơi", "Bỏ cuộc", "Đồng ý"],
    "correctAnswer": "Đấu tranh"
  },
  {
    "question": "Từ \"Equipment\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thiết bị", "Thức ăn", "Quần áo", "Xe cộ"],
    "correctAnswer": "Thiết bị"
  },
  {
    "question": "Từ \"Failure\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành công", "Thất bại", "Hạnh phúc", "Cố gắng"],
    "correctAnswer": "Thất bại"
  },
  {
    "question": "Từ \"Garden\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khu vườn", "Tòa nhà", "Nhà bếp", "Văn phòng"],
    "correctAnswer": "Khu vườn"
  },
  {
    "question": "Từ \"Manager\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhân viên", "Quản lý", "Khách hàng", "Giáo viên"],
    "correctAnswer": "Quản lý"
  },
  {
    "question": "Từ \"Prison\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trường học", "Bệnh viện", "Nhà tù", "Công viên"],
    "correctAnswer": "Nhà tù"
  },
  {
    "question": "Từ \"Feed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cho ăn", "Ngủ", "Chạy", "Học"],
    "correctAnswer": "Cho ăn"
  },
  {
    "question": "Từ \"Wild\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hoang dã", "Văn minh", "Đô thị", "Nhẹ nhàng"],
    "correctAnswer": "Hoang dã"
  },
  {
    "question": "Từ \"Valley\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thung lũng", "Đỉnh núi", "Sa mạc", "Rừng rậm"],
    "correctAnswer": "Thung lũng"
  },
  {
    "question": "Từ \"Totally\" có nghĩa là gì?",
    "options": ["Một phần", "Hoàn toàn", "Thỉnh thoảng", "Chậm chạp"],
    "correctAnswer": "Hoàn toàn"
  },
  {
    "question": "Từ \"Faith\" có nghĩa là gì?",
    "options": ["Niềm tin", "Hy vọng", "Yêu thương", "Sự kiên trì"],
    "correctAnswer": "Niềm tin"
  },
  {
    "question": "Từ \"Comments\" có nghĩa là gì?",
    "options": ["Tin nhắn", "Bình luận", "Lời chúc", "Câu hỏi"],
    "correctAnswer": "Bình luận"
  },
  {
    "question": "Từ \"Street\" có nghĩa là gì?",
    "options": ["Quán cà phê", "Đường phố", "Công viên", "Ngõ hẻm"],
    "correctAnswer": "Đường phố"
  },
  {
    "question": "Từ \"Search\" có nghĩa là gì?",
    "options": ["Tìm kiếm", "Phản đối", "Phân tích", "Tổ chức"],
    "correctAnswer": "Tìm kiếm"
  },
  {
    "question": "Từ \"Unique\" có nghĩa là gì?",
    "options": ["Phổ biến", "Thông thường", "Duy nhất", "Tương đồng"],
    "correctAnswer": "Duy nhất"
  },
  {
    "question": "Từ \"Cancer\" có nghĩa là gì?",
    "options": ["Bệnh tim", "Ung thư", "Cảm cúm", "Đái tháo đường"],
    "correctAnswer": "Ung thư"
  },
  {
    "question": "Từ \"Crazy\" có nghĩa là gì?",
    "options": ["Bình thường", "Điềm tĩnh", "Điên rồ", "Hài hước"],
    "correctAnswer": "Điên rồ"
  },
  {
    "question": "Từ \"Record\" có nghĩa là gì?",
    "options": ["Ghi âm", "Bản vẽ", "Hình ảnh", "Danh sách"],
    "correctAnswer": "Ghi âm"
  },
  {
    "question": "Từ \"Save\" có nghĩa là gì?",
    "options": ["Lưu lại", "Xóa bỏ", "Gửi đi", "Tiêu xài"],
    "correctAnswer": "Lưu lại"
  },
  {
    "question": "Từ \"Incredible\" có nghĩa là gì?",
    "options": ["Bình thường", "Không thể tin được", "Dễ chịu", "Cũ kỹ"],
    "correctAnswer": "Không thể tin được"
  },
  {
    "question": "Từ \"Nation\" có nghĩa là gì?",
    "options": ["Thành phố", "Làng mạc", "Quốc gia", "Hành tinh"],
    "correctAnswer": "Quốc gia"
  },
  {
    "question": "Từ \"Material\" có nghĩa là gì?",
    "options": ["Ý tưởng", "Vật liệu", "Công cụ", "Cảm xúc"],
    "correctAnswer": "Vật liệu"
  },
  {
    "question": "Từ \"Choice\" có nghĩa là gì?",
    "options": ["Sự lựa chọn", "Sự bắt buộc", "Sự kết thúc", "Sự thay đổi"],
    "correctAnswer": "Sự lựa chọn"
  },
  {
    "question": "Từ \"Weird\" có nghĩa là gì?",
    "options": ["Thông minh", "Kỳ lạ", "Nhanh nhẹn", "Hiền lành"],
    "correctAnswer": "Kỳ lạ"
  },
  {
    "question": "Từ \"Shape\" có nghĩa là gì?",
    "options": ["Âm thanh", "Hình dạng", "Màu sắc", "Kích thước"],
    "correctAnswer": "Hình dạng"
  },
  {
    "question": "Từ \"Games\" có nghĩa là gì?",
    "options": ["Công việc", "Trò chơi", "Học tập", "Âm nhạc"],
    "correctAnswer": "Trò chơi"
  },
  {
    "question": "Từ \"Freedom\" có nghĩa là gì?",
    "options": ["Quyền lực", "Sự kiểm soát", "Tự do", "Phụ thuộc"],
    "correctAnswer": "Tự do"
  },
  {
    "question": "Từ \"Fish\" có nghĩa là gì?",
    "options": ["Chim", "Cá", "Thằn lằn", "Động vật có vú"],
    "correctAnswer": "Cá"
  },
  {
    "question": "Từ \"Worry\" có nghĩa là gì?",
    "options": ["Vui vẻ", "Lo lắng", "Yên tâm", "Thư giãn"],
    "correctAnswer": "Lo lắng"
  },
  {
    "question": "Từ \"Expand\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thu hẹp", "Mở rộng", "Giảm bớt", "Đóng lại"],
    "correctAnswer": "Mở rộng"
  },
  {
    "question": "Từ \"Fire\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nước", "Lửa", "Gió", "Đất"],
    "correctAnswer": "Lửa"
  },
  {
    "question": "Từ \"Screen\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Màn hình", "Âm thanh", "Bàn phím", "Chuột"],
    "correctAnswer": "Màn hình"
  },
  {
    "question": "Từ \"Climate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thời tiết", "Khí hậu", "Biển", "Rừng"],
    "correctAnswer": "Khí hậu"
  },
  {
    "question": "Từ \"Scale\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cân", "Thang đo", "Máy tính", "Bản đồ"],
    "correctAnswer": "Thang đo"
  },
  {
    "question": "Từ \"Results\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bắt đầu", "Kết thúc", "Kết quả", "Thử nghiệm"],
    "correctAnswer": "Kết quả"
  },
  {
    "question": "Từ \"Bill\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hóa đơn", "Chuyến tàu", "Xe buýt", "Bàn ăn"],
    "correctAnswer": "Hóa đơn"
  },
  {
    "question": "Từ \"Opportunities\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cơ hội", "Vấn đề", "Rào cản", "Hạn chế"],
    "correctAnswer": "Cơ hội"
  },
  {
    "question": "Từ \"Blood\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nước", "Máu", "Nham", "Tim"],
    "correctAnswer": "Máu"
  },
  {
    "question": "Từ \"Stage\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giai đoạn", "Màn hình", "Cửa sổ", "Bước đi"],
    "correctAnswer": "Giai đoạn"
  },
  {
    "question": "Từ \"Private\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Công cộng", "Riêng tư", "Lớn", "Nhỏ"],
    "correctAnswer": "Riêng tư"
  },
  {
    "question": "Từ \"Hearing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghe", "Xem", "Nói", "Chạm"],
    "correctAnswer": "Nghe"
  },
  {
    "question": "Từ \"Recently\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã từng", "Gần đây", "Hàng ngày", "Hàng tuần"],
    "correctAnswer": "Gần đây"
  },
  {
    "question": "Từ \"Leaders\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Người lao động", "Người dân", "Lãnh đạo", "Học sinh"],
    "correctAnswer": "Lãnh đạo"
  },
  {
    "question": "Từ \"Context\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bối cảnh", "Thông tin", "Hình ảnh", "Âm thanh"],
    "correctAnswer": "Bối cảnh"
  },
  {
    "question": "Từ \"Actual\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giả", "Thực", "Lý thuyết", "Sơ bộ"],
    "correctAnswer": "Thực"
  },
  {
    "question": "Từ \"Multiple\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Một", "Nhiều", "Duy nhất", "Đơn lẻ"],
    "correctAnswer": "Nhiều"
  },
  {
    "question": "Từ \"Channel\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kênh", "Đường", "Cửa sổ", "Máy tính"],
    "correctAnswer": "Kênh"
  },
  {
    "question": "Từ \"Congress\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Quốc hội", "Bệnh viện", "Thư viện", "Bãi biển"],
    "correctAnswer": "Quốc hội"
  },
  {
    "question": "Từ \"Hour\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phút", "Giờ", "Ngày", "Tuần"],
    "correctAnswer": "Giờ"
  },
  {
    "question": "Từ \"Expect\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Kỳ vọng", "Từ chối", "Lo lắng"],
    "correctAnswer": "Kỳ vọng"
  },
  {
    "question": "Từ \"Professor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sinh viên", "Thầy giáo", "Giáo sư", "Học giả"],
    "correctAnswer": "Giáo sư"
  },
  {
    "question": "Từ \"Turned\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Quay", "Bẻ cong", "Lật đổ", "Rẽ"],
    "correctAnswer": "Quay"
  },
  {
    "question": "Từ \"Direction\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đường đi", "Hướng", "Chỉ dẫn", "Phương pháp"],
    "correctAnswer": "Hướng"
  },
  {
    "question": "Từ \"Mission\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trò chơi", "Nhiệm vụ", "Kỷ niệm", "Sự kiện"],
    "correctAnswer": "Nhiệm vụ"
  },
  {
    "question": "Từ \"Network\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hệ thống", "Mạng lưới", "Công nghệ", "Ứng dụng"],
    "correctAnswer": "Mạng lưới"
  },
  {
    "question": "Từ \"Blue\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xanh lá", "Đỏ", "Xanh da trời", "Tím"],
    "correctAnswer": "Xanh da trời"
  },
  {
    "question": "Từ \"Police\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cảnh sát", "Thám tử", "Tội phạm", "Lính"],
    "correctAnswer": "Cảnh sát"
  },
  {
    "question": "Từ \"Skills\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kỹ năng", "Sự năng động", "Trí tuệ", "Tài năng"],
    "correctAnswer": "Kỹ năng"
  },
  {
    "question": "Từ \"Changing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cố định", "Thay đổi", "Giữ nguyên", "Nổi bật"],
    "correctAnswer": "Thay đổi"
  },
  {
    "question": "Từ \"Structure\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cấu trúc", "Sự phá hủy", "Sự phân chia", "Hệ thống"],
    "correctAnswer": "Cấu trúc"
  },
  {
    "question": "Từ \"Develop\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hủy hoại", "Phát triển", "Dừng lại", "Rút lui"],
    "correctAnswer": "Phát triển"
  },
  {
    "question": "Từ \"Pull\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đẩy", "Kéo", "Nhấc", "Đưa"],
    "correctAnswer": "Kéo"
  },
  {
    "question": "Từ \"Link\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngắt kết nối", "Liên kết", "Tách rời", "Gắn bó"],
    "correctAnswer": "Liên kết"
  },
  {
    "question": "Từ \"App\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ứng dụng", "Trò chơi", "Phần mềm", "Mạng xã hội"],
    "correctAnswer": "Ứng dụng"
  },
  {
    "question": "Từ \"English\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiếng Pháp", "Tiếng Trung", "Tiếng Anh", "Tiếng Nhật"],
    "correctAnswer": "Tiếng Anh"
  },
  {
    "question": "Từ \"Worth\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Không xứng đáng", "Đáng giá", "Tạm được", "Rẻ tiền"],
    "correctAnswer": "Đáng giá"
  },
  {
    "question": "Từ \"Pain\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Niềm vui", "Đau đớn", "Hạnh phúc", "Sức mạnh"],
    "correctAnswer": "Đau đớn"
  },
  {
    "question": "Từ \"Late\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sớm", "Trễ", "Nhanh", "Chậm"],
    "correctAnswer": "Trễ"
  },
  {
    "question": "Từ \"Values\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giá trị", "Sự ưa thích", "Phong cách", "Sự khác biệt"],
    "correctAnswer": "Giá trị"
  },
  {
    "question": "Từ \"Sleep\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chơi", "Ngủ", "Ăn", "Học"],
    "correctAnswer": "Ngủ"
  },
  {
    "question": "Từ \"Extra\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thêm", "Giảm", "Đầu tiên", "Cuối cùng"],
    "correctAnswer": "Thêm"
  },
  {
    "question": "Từ \"Setting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tình huống", "Bối cảnh", "Nút bấm", "Hình ảnh"],
    "correctAnswer": "Bối cảnh"
  },
  {
    "question": "Từ \"Press\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhấn", "Chạy", "Hát", "Nấu"],
    "correctAnswer": "Nhấn"
  },
  {
    "question": "Từ \"Date\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngày", "Tuần", "Tháng", "Năm"],
    "correctAnswer": "Ngày"
  },
  {
    "question": "Từ \"Honor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiền", "Danh dự", "Thù lao", "Quyền lực"],
    "correctAnswer": "Danh dự"
  },
  {
    "question": "Từ \"Decide\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cân nhắc", "Suy nghĩ", "Quyết định", "Phớt lờ"],
    "correctAnswer": "Quyết định"
  },
  {
    "question": "Từ \"Sun\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trăng", "Sao", "Mặt trời", "Hỏa tinh"],
    "correctAnswer": "Mặt trời"
  },
  {
    "question": "Từ \"Connect\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngắt kết nối", "Kết nối", "Cắt đứt", "Tách rời"],
    "correctAnswer": "Kết nối"
  },
  {
    "question": "Từ \"Topic\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chủ đề", "Ngữ cảnh", "Phần mở đầu", "Đoạn kết"],
    "correctAnswer": "Chủ đề"
  },
  {
    "question": "Từ \"Park\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trường học", "Sân bay", "Công viên", "Bệnh viện"],
    "correctAnswer": "Công viên"
  },
  {
    "question": "Từ \"Politics\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kinh tế", "Văn hóa", "Giáo dục", "Chính trị"],
    "correctAnswer": "Chính trị"
  },
  {
    "question": "Từ \"East\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hướng bắc", "Hướng nam", "Hướng tây", "Hướng đông"],
    "correctAnswer": "Hướng đông"
  },
  {
    "question": "Từ \"Wish\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nói", "Biết", "Muốn", "Ước muốn"],
    "correctAnswer": "Ước muốn"
  },
  {
    "question": "Từ \"Graduate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tốt nghiệp", "Học sinh", "Giáo viên", "Trưởng thành"],
    "correctAnswer": "Tốt nghiệp"
  },
  {
    "question": "Từ \"Square\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tròn", "Vuông", "Tam giác", "Chữ nhật"],
    "correctAnswer": "Vuông"
  },
  {
    "question": "Từ \"Campaign\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chuyến đi", "Chiến dịch", "Cuộc họp", "Sự kiện"],
    "correctAnswer": "Chiến dịch"
  },
  {
    "question": "Từ \"Effects\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nguyên nhân", "Tác động", "Quy luật", "Giải pháp"],
    "correctAnswer": "Tác động"
  },
  {
    "question": "Từ \"Gas\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nước", "Khí", "Đất", "Lửa"],
    "correctAnswer": "Khí"
  },
  {
    "question": "Từ \"Native\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bản địa", "Ngoại lai", "Mới lạ", "Cổ xưa"],
    "correctAnswer": "Bản địa"
  },
  {
    "question": "Từ \"Charge\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thay đổi", "Tính phí", "Trách nhiệm", "Đánh giá"],
    "correctAnswer": "Tính phí"
  },
  {
    "question": "Từ \"Poor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giàu có", "Nghèo", "Dồi dào", "Khỏe mạnh"],
    "correctAnswer": "Nghèo"
  },
  {
    "question": "Từ \"Drop\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhỏ", "Rơi", "Văng", "Lệch"],
    "correctAnswer": "Rơi"
  },
  {
    "question": "Từ \"Drug\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thuốc", "Thức ăn", "Dược phẩm", "Dung dịch"],
    "correctAnswer": "Thuốc"
  },
  {
    "question": "Từ \"Sea\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đất liền", "Hồ", "Biển", "Suối"],
    "correctAnswer": "Biển"
  },
  {
    "question": "Từ \"Season\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Năm", "Mùa", "Tháng", "Ngày"],
    "correctAnswer": "Mùa"
  },
  {
    "question": "Từ \"Hospital\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trường học", "Bệnh viện", "Nhà thờ", "Công viên"],
    "correctAnswer": "Bệnh viện"
  },
  {
    "question": "Từ \"Property\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đặc tính", "Tài sản", "Phương tiện", "Quyền lực"],
    "correctAnswer": "Tài sản"
  },
  {
    "question": "Từ \"Universe\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vũ trụ", "Hệ mặt trời", "Thiên hà", "Ngân hà"],
    "correctAnswer": "Vũ trụ"
  },
  {
    "question": "Từ \"Stress\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thư giãn", "Căng thẳng", "Nỗi buồn", "Sự vui vẻ"],
    "correctAnswer": "Căng thẳng"
  },
  {
    "question": "Từ \"Thousand\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trăm", "Nghìn", "Triệu", "Tỷ"],
    "correctAnswer": "Nghìn"
  },
  {
    "question": "Từ \"Wide\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dài", "Rộng", "Cao", "Sâu"],
    "correctAnswer": "Rộng"
  },
  {
    "question": "Từ \"Double\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giảm một nửa", "Đơn", "Nhân đôi", "Gấp ba"],
    "correctAnswer": "Nhân đôi"
  },
  {
    "question": "Từ \"Mine\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhà", "Mỏ", "Trại", "Cửa hàng"],
    "correctAnswer": "Mỏ"
  },
  {
    "question": "Từ \"Throw\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ném", "Nhặt", "Giữ", "Bắt"],
    "correctAnswer": "Ném"
  },
  {
    "question": "Từ \"Majority\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Số ít", "Phần lớn", "Một ít", "Tất cả"],
    "correctAnswer": "Phần lớn"
  },
  {
    "question": "Từ \"Spread\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thu nhỏ", "Lan rộng", "Hạn chế", "Gom lại"],
    "correctAnswer": "Lan rộng"
  },
  {
    "question": "Từ \"Option\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lựa chọn", "Bắt buộc", "Quyết định", "Từ chối"],
    "correctAnswer": "Lựa chọn"
  },
  {
    "question": "Từ \"Decades\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thế kỷ", "Năm", "Thập kỷ", "Giờ"],
    "correctAnswer": "Thập kỷ"
  },
  {
    "question": "Từ \"Wonder\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Điều kỳ diệu", "Nghi ngờ", "Sự bình thường", "Sự hờ hững"],
    "correctAnswer": "Điều kỳ diệu"
  },
  {
    "question": "Từ “Letter” trong tiếng Anh có nghĩa là gì?",
    "options": ["Con số", "Chữ cái", "Đoạn văn", "Ký hiệu"],
    "correctAnswer": "Chữ cái"
  },
  {
    "question": "Từ “Method” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phương pháp", "Kết quả", "Vấn đề", "Mục tiêu"],
    "correctAnswer": "Phương pháp"
  },
  {
    "question": "Từ “Wear” trong tiếng Anh có nghĩa là gì?",
    "options": ["Mặc", "Cởi", "Giặt", "Gấp"],
    "correctAnswer": "Mặc"
  },
  {
    "question": "Từ “Scene” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cảnh", "Toàn bộ bộ phim", "Diễn viên", "Lời thoại"],
    "correctAnswer": "Cảnh"
  },
  {
    "question": "Từ “Spot” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đường thẳng", "Điểm", "Góc", "Bề mặt"],
    "correctAnswer": "Điểm"
  },
  {
    "question": "Từ “Enter” trong tiếng Anh có nghĩa là gì?",
    "options": ["Ra", "Vào", "Đứng im", "Nhảy lên"],
    "correctAnswer": "Vào"
  },
  {
    "question": "Từ “Africa” trong tiếng Anh có nghĩa là gì?",
    "options": ["Châu Á", "Châu Âu", "Châu Phi", "Châu Mỹ"],
    "correctAnswer": "Châu Phi"
  },
  {
    "question": "Từ “Achieve” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thất bại", "Đạt được", "Bắt đầu", "Trì hoãn"],
    "correctAnswer": "Đạt được"
  },
  {
    "question": "Từ “Afraid” trong tiếng Anh có nghĩa là gì?",
    "options": ["Vui vẻ", "Sợ hãi", "Buồn chán", "Tức giận"],
    "correctAnswer": "Sợ hãi"
  },
  {
    "question": "Từ “Fund” trong tiếng Anh có nghĩa là gì?",
    "options": ["Quỹ", "Lợi nhuận", "Hóa đơn", "Chi phí"],
    "correctAnswer": "Quỹ"
  },
  {
    "question": "Từ “Tiny” trong tiếng Anh có nghĩa là gì?",
    "options": ["To lớn", "Khổng lồ", "Trung bình", "Rất nhỏ"],
    "correctAnswer": "Rất nhỏ"
  },
  {
    "question": "Từ “Forever” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tạm thời", "Mãi mãi", "Thỉnh thoảng", "Hiếm khi"],
    "correctAnswer": "Mãi mãi"
  },
  {
    "question": "Từ “Independent” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phụ thuộc", "Độc lập", "Yếu đuối", "Mạnh mẽ"],
    "correctAnswer": "Độc lập"
  },
  {
    "question": "Từ “Status” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tình trạng", "Nguyên nhân", "Hành động", "Sự kiện"],
    "correctAnswer": "Tình trạng"
  },
  {
    "question": "Từ “Prevent” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cho phép", "Ngăn chặn", "Khuyến khích", "Gây ra"],
    "correctAnswer": "Ngăn chặn"
  },
  {
    "question": "Từ “Feature” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hạn chế", "Yêu cầu", "Đặc điểm", "Bề ngoài"],
    "correctAnswer": "Đặc điểm"
  },
  {
    "question": "Từ “Equation” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phương trình", "Phép tính", "Hình học", "Dãy số"],
    "correctAnswer": "Phương trình"
  },
  {
    "question": "Từ “Vice” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đức hạnh", "Lợi thế", "Thói xấu", "Sở thích"],
    "correctAnswer": "Thói xấu"
  },
  {
    "question": "Từ “Debt” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiền tiết kiệm", "Nợ nần", "Tiền lương", "Khoản đầu tư"],
    "correctAnswer": "Nợ nần"
  },
  {
    "question": "Từ “Unit” trong tiếng Anh có nghĩa là gì?",
    "options": ["Toàn thể", "Đơn vị", "Nhóm", "Số lượng"],
    "correctAnswer": "Đơn vị"
  },
  {
    "question": "Từ \"Presence\" có nghĩa là gì?",
    "options": ["Vắng mặt", "Sự hiện diện", "Sự biến mất", "Sự xuất hiện"],
    "correctAnswer": "Sự hiện diện"
  },
  {
    "question": "Từ \"Missing\" có nghĩa là gì?",
    "options": ["Vắng mặt", "Xuất hiện", "Đầy đủ", "Hiện hữu"],
    "correctAnswer": "Vắng mặt"
  },
  {
    "question": "Từ \"Resource\" có nghĩa là gì?",
    "options": ["Nguồn tài nguyên", "Sự lãng phí", "Sự tiêu thụ", "Khoảng cách"],
    "correctAnswer": "Nguồn tài nguyên"
  },
  {
    "question": "Từ \"Coffee\" có nghĩa là gì?",
    "options": ["Trà", "Nước", "Cà phê", "Sữa"],
    "correctAnswer": "Cà phê"
  },
  {
    "question": "Từ \"Flight\" có nghĩa là gì?",
    "options": ["Chuyến tàu", "Hành trình đi bộ", "Chuyến bay", "Chuyến xe"],
    "correctAnswer": "Chuyến bay"
  },
  {
    "question": "Từ \"Accept\" có nghĩa là gì?",
    "options": ["Từ chối", "Chấp nhận", "Bỏ qua", "Phủ nhận"],
    "correctAnswer": "Chấp nhận"
  },
  {
    "question": "Từ \"Guide\" có nghĩa là gì?",
    "options": ["Lạc đường", "Dẫn dắt", "Hướng dẫn", "Tìm kiếm"],
    "correctAnswer": "Hướng dẫn"
  },
  {
    "question": "Từ \"Provides\" có nghĩa là gì?",
    "options": ["Cung cấp", "Thu hồi", "Tích lũy", "Bỏ lại"],
    "correctAnswer": "Cung cấp"
  },
  {
    "question": "Từ \"Chain\" có nghĩa là gì?",
    "options": ["Xích", "Chuỗi", "Dây buộc", "Sợi liên kết"],
    "correctAnswer": "Chuỗi"
  },
  {
    "question": "Từ \"Plane\" có nghĩa là gì?",
    "options": ["Tàu hỏa", "Máy bay", "Ô tô", "Thuyền"],
    "correctAnswer": "Máy bay"
  },
  {
    "question": "Từ \"India\" có nghĩa là gì?",
    "options": ["Ấn Độ", "Indonesia", "Ả Rập", "Iran"],
    "correctAnswer": "Ấn Độ"
  },
  {
    "question": "Từ \"Institution\" có nghĩa là gì?",
    "options": ["Trường học", "Tổ chức", "Cơ quan chính phủ", "Ngân hàng"],
    "correctAnswer": "Tổ chức"
  },
  {
    "question": "Từ \"Filled\" có nghĩa là gì?",
    "options": ["Rỗng", "Đầy", "Thiếu", "Hấp thụ"],
    "correctAnswer": "Đầy"
  },
  {
    "question": "Từ \"Document\" có nghĩa là gì?",
    "options": ["Tài liệu", "Hình ảnh", "Bản đồ", "Video"],
    "correctAnswer": "Tài liệu"
  },
  {
    "question": "Từ \"Closed\" có nghĩa là gì?",
    "options": ["Mở", "Đóng", "Bắt đầu", "Kết thúc"],
    "correctAnswer": "Đóng"
  },
  {
    "question": "Từ \"Launch\" có nghĩa là gì?",
    "options": ["Hủy bỏ", "Dừng lại", "Ra mắt", "Kết thúc"],
    "correctAnswer": "Ra mắt"
  },
  {
    "question": "Từ \"Visual\" có nghĩa là gì?",
    "options": ["Thị giác", "Âm thanh", "Hình ảnh", "Vị giác"],
    "correctAnswer": "Hình ảnh"
  },
  {
    "question": "Từ \"Determine\" có nghĩa là gì?",
    "options": ["Đoán", "Xác định", "Phản đối", "Lưỡng lự"],
    "correctAnswer": "Xác định"
  },
  {
    "question": "Từ \"Sector\" có nghĩa là gì?",
    "options": ["Khu vực", "Ngành", "Câu lạc bộ", "Tầng lớp"],
    "correctAnswer": "Khu vực"
  },
  {
    "question": "Từ \"Taste\" có nghĩa là gì?",
    "options": ["Mùi vị", "Âm thanh", "Cảm giác", "Kích thước"],
    "correctAnswer": "Mùi vị"
  },
  {
    "question": "Từ “Sick” trong tiếng Anh có nghĩa là gì?",
    "options": ["Khỏe mạnh", "Vui vẻ", "Bệnh", "Đẹp"],
    "correctAnswer": "Bệnh"
  },
  {
    "question": "Từ “Master” trong tiếng Anh có nghĩa là gì?",
    "options": ["Học sinh", "Người lạ", "Bậc thầy", "Kẻ điên"],
    "correctAnswer": "Bậc thầy"
  },
  {
    "question": "Từ “Competition” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cuộc thi", "Hợp tác", "Chia sẻ", "Trì hoãn"],
    "correctAnswer": "Cuộc thi"
  },
  {
    "question": "Từ “Corner” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đường phố", "Nhà cửa", "Hàng xóm", "Góc"],
    "correctAnswer": "Góc"
  },
  {
    "question": "Từ “Hurt” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cười", "Nấu ăn", "Làm đau", "Nói chuyện"],
    "correctAnswer": "Làm đau"
  },
  {
    "question": "Từ “Prime” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phụ", "Chính", "Phụ thuộc", "Rẻ"],
    "correctAnswer": "Chính"
  },
  {
    "question": "Từ “Ship” trong tiếng Anh có nghĩa là gì?",
    "options": ["Xe hơi", "Máy bay", "Tàu", "Xe đạp"],
    "correctAnswer": "Tàu"
  },
  {
    "question": "Từ “Ancient” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hiện đại", "Tương lai", "Mới", "Cổ xưa"],
    "correctAnswer": "Cổ xưa"
  },
  {
    "question": "Từ “Mix” trong tiếng Anh có nghĩa là gì?",
    "options": ["Trộn", "Chia tách", "Bỏ qua", "Giữ nguyên"],
    "correctAnswer": "Trộn"
  },
  {
    "question": "Từ “Root” trong tiếng Anh có nghĩa là gì?",
    "options": ["Lá", "Hoa", "Rễ", "Thân"],
    "correctAnswer": "Rễ"
  },
  {
    "question": "Từ “Copy” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sao chép", "Xoá", "Lưu trữ", "Sửa đổi"],
    "correctAnswer": "Sao chép"
  },
  {
    "question": "Từ “Input” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đầu ra", "Đầu vào", "Xoá", "Sao chép"],
    "correctAnswer": "Đầu vào"
  },
  {
    "question": "Từ “Protection” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự tấn công", "Sự bảo vệ", "Sự cạnh tranh", "Sự bỏ qua"],
    "correctAnswer": "Sự bảo vệ"
  },
  {
    "question": "Từ “Aspect” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hình dạng", "Âm thanh", "Khía cạnh", "Vị trí"],
    "correctAnswer": "Khía cạnh"
  },
  {
    "question": "Từ “Mobile” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đứng yên", "Di động", "Cố định", "Ngồi"],
    "correctAnswer": "Di động"
  },
  {
    "question": "Từ “Glass” trong tiếng Anh có nghĩa là gì?",
    "options": ["Gỗ", "Sắt", "Thủy tinh", "Nhựa"],
    "correctAnswer": "Thủy tinh"
  },
  {
    "question": "Từ “Weather” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thời tiết", "Nhiệt độ", "Áp suất", "Độ ẩm"],
    "correctAnswer": "Thời tiết"
  },
  {
    "question": "Từ “Slowly” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhanh", "Chậm", "Sớm", "Muộn"],
    "correctAnswer": "Chậm"
  },
  {
    "question": "Từ “Aid” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự cản trở", "Sự trợ giúp", "Sự bỏ qua", "Sự phản đối"],
    "correctAnswer": "Sự trợ giúp"
  },
  {
    "question": "Từ “Claim” trong tiếng Anh có nghĩa là gì?",
    "options": ["Từ chối", "Hài lòng", "Bỏ qua", "Khẳng định"],
    "correctAnswer": "Khẳng định"
  },
  {
    "question": "Từ “Opposed” có nghĩa là gì?",
    "options": ["Hỗ trợ", "Đồng ý", "Chống lại", "Yêu thích"],
    "correctAnswer": "Chống lại"
  },
  {
    "question": "Từ “Equity” có nghĩa là gì?",
    "options": ["Sự thiên vị", "Công bằng", "Thiếu thốn", "Tham lam"],
    "correctAnswer": "Công bằng"
  },
  {
    "question": "Từ “Sample” có nghĩa là gì?",
    "options": ["Ví dụ", "Mẫu", "Tổng hợp", "Thử nghiệm"],
    "correctAnswer": "Mẫu"
  },
  {
    "question": "Từ “Produced” có nghĩa là gì?",
    "options": ["Sản xuất", "Tiêu thụ", "Sửa chữa", "Hủy bỏ"],
    "correctAnswer": "Sản xuất"
  },
  {
    "question": "Từ “Giant” có nghĩa là gì?",
    "options": ["Nhỏ nhắn", "Trung bình", "Khổng lồ", "Bình thường"],
    "correctAnswer": "Khổng lồ"
  },
  {
    "question": "Từ “Farm” có nghĩa là gì?",
    "options": ["Khu công nghiệp", "Nông trại", "Thành phố", "Nhà máy"],
    "correctAnswer": "Nông trại"
  },
  {
    "question": "Từ “Suggest” có nghĩa là gì?",
    "options": ["Cấm", "Phớt lờ", "Đề nghị", "Từ chối"],
    "correctAnswer": "Đề nghị"
  },
  {
    "question": "Từ “Sweet” có nghĩa là gì?",
    "options": ["Đắng", "Chua", "Ngọt", "Mặn"],
    "correctAnswer": "Ngọt"
  },
  {
    "question": "Từ “Limit” có nghĩa là gì?",
    "options": ["Mở rộng", "Giới hạn", "Kéo dài", "Thoát"],
    "correctAnswer": "Giới hạn"
  },
  {
    "question": "Từ “Switch” có nghĩa là gì?",
    "options": ["Chuyển đổi", "Giữ nguyên", "Dừng lại", "Bỏ qua"],
    "correctAnswer": "Chuyển đổi"
  },
  {
    "question": "Từ “Leaves” có nghĩa là gì?",
    "options": ["Hoa", "Cành", "Lá", "Rễ"],
    "correctAnswer": "Lá"
  },
  {
    "question": "Từ “Maintain” có nghĩa là gì?",
    "options": ["Hủy bỏ", "Duy trì", "Tăng lên", "Giảm đi"],
    "correctAnswer": "Duy trì"
  },
  {
    "question": "Từ “Caused” có nghĩa là gì?",
    "options": ["Gây ra", "Ngăn chặn", "Sửa chữa", "Tăng cường"],
    "correctAnswer": "Gây ra"
  },
  {
    "question": "Từ “Lesson” có nghĩa là gì?",
    "options": ["Bài học", "Giải pháp", "Câu chuyện", "Bài hát"],
    "correctAnswer": "Bài học"
  },
  {
    "question": "Từ “Soul” có nghĩa là gì?",
    "options": ["Vật chất", "Linh hồn", "Hồn ma", "Tinh thần"],
    "correctAnswer": "Linh hồn"
  },
  {
    "question": "Từ “Extent” có nghĩa là gì?",
    "options": ["Phạm vi", "Thời gian", "Số lượng", "Chất lượng"],
    "correctAnswer": "Phạm vi"
  },
  {
    "question": "Từ “Rid” có nghĩa là gì?",
    "options": ["Bảo vệ", "Giữ lại", "Loại bỏ", "Thu hút"],
    "correctAnswer": "Loại bỏ"
  },
  {
    "question": "Từ “Advanced” có nghĩa là gì?",
    "options": ["Cơ bản", "Tiên tiến", "Lạc hậu", "Thụ động"],
    "correctAnswer": "Tiên tiến"
  },
  {
    "question": "Từ “Bear” có thể có nghĩa là gì?",
    "options": ["Con gấu", "Con sói", "Con hổ", "Con chim"],
    "correctAnswer": "Con gấu"
  },
  {
    "question": "Từ “Deliver” có nghĩa là gì?",
    "options": ["Thu mua", "Giao hàng", "Nhận về", "Từ chối"],
    "correctAnswer": "Giao hàng"
  },
  {
    "question": "Từ “Hell” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thiên đường", "Địa ngục", "Nhà", "Thủy cung"],
    "correctAnswer": "Địa ngục"
  },
  {
    "question": "Từ “Lucky” trong tiếng Anh có nghĩa là gì?",
    "options": ["Xui xẻo", "May mắn", "Buồn bã", "Hạnh phúc"],
    "correctAnswer": "May mắn"
  },
  {
    "question": "Từ “Dry” trong tiếng Anh có nghĩa là gì?",
    "options": ["Ướt", "Mát", "Khô", "Ẩm ướt"],
    "correctAnswer": "Khô"
  },
  {
    "question": "Từ “Sugar” trong tiếng Anh có nghĩa là gì?",
    "options": ["Muối", "Đường", "Bột", "Sữa"],
    "correctAnswer": "Đường"
  },
  {
    "question": "Từ “Pushing” trong tiếng Anh có nghĩa là gì?",
    "options": ["Kéo", "Nhấn", "Đẩy", "Giữ"],
    "correctAnswer": "Đẩy"
  },
  {
    "question": "Từ “Officer” trong tiếng Anh có nghĩa là gì?",
    "options": ["Quan chức", "Lính", "Sĩ quan", "Công dân"],
    "correctAnswer": "Sĩ quan"
  },
  {
    "question": "Từ “Interests” trong tiếng Anh có nghĩa là gì?",
    "options": ["Lời mời", "Trách nhiệm", "Sở thích", "Sự thật"],
    "correctAnswer": "Sở thích"
  },
  {
    "question": "Từ “Deeper” trong tiếng Anh có nghĩa là gì?",
    "options": ["Rộng hơn", "Sâu hơn", "Cao hơn", "Nặng hơn"],
    "correctAnswer": "Sâu hơn"
  },
  {
    "question": "Từ “Row” trong tiếng Anh có nghĩa là gì?",
    "options": ["Dãy", "Hàng", "Cột", "Trật tự"],
    "correctAnswer": "Hàng"
  },
  {
    "question": "Từ “Sold” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã mua", "Đã bán", "Cho thuê", "Tặng"],
    "correctAnswer": "Đã bán"
  },
  {
    "question": "Từ “Layer” trong tiếng Anh có nghĩa là gì?",
    "options": ["Mặt", "Lớp", "Giọt", "Mảng"],
    "correctAnswer": "Lớp"
  },
  {
    "question": "Từ “Adult” trong tiếng Anh có nghĩa là gì?",
    "options": ["Trẻ em", "Thiếu niên", "Người lớn", "Trưởng thành"],
    "correctAnswer": "Người lớn"
  },
  {
    "question": "Từ “Schedule” trong tiếng Anh có nghĩa là gì?",
    "options": ["Lịch trình", "Lịch sử", "Kế hoạch", "Bảng tin"],
    "correctAnswer": "Lịch trình"
  },
  {
    "question": "Từ “Studio” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phòng thu", "Nhà hát", "Xưởng", "Văn phòng"],
    "correctAnswer": "Phòng thu"
  },
  {
    "question": "Từ “Band” trong tiếng Anh có nghĩa là gì?",
    "options": ["Ban nhạc", "Dải", "Nhóm", "Loạt"],
    "correctAnswer": "Ban nhạc"
  },
  {
    "question": "Từ “Distribution” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phân phối", "Chia sẻ", "Sản xuất", "Tiêu thụ"],
    "correctAnswer": "Phân phối"
  },
  {
    "question": "Từ “Pages” trong tiếng Anh có nghĩa là gì?",
    "options": ["Trang", "Bìa", "Chương", "Số"],
    "correctAnswer": "Trang"
  },
  {
    "question": "Từ “Apple” trong tiếng Anh có nghĩa là gì?",
    "options": ["Táo", "Cam", "Nho", "Dưa"],
    "correctAnswer": "Táo"
  },
  {
    "question": "Từ “Kingdom” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đế chế", "Vương quốc", "Quốc gia", "Lãnh địa"],
    "correctAnswer": "Vương quốc"
  },
  {
    "question": "Từ “Arms” trong tiếng Anh có nghĩa là gì?",
    "options": ["Quân đội", "Bàn chân", "Vũ khí", "Cái khiên"],
    "correctAnswer": "Vũ khí"
  },
  {
    "question": "Từ \"Therapy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bài tập", "Liệu pháp", "Học tập", "Vui chơi"],
    "correctAnswer": "Liệu pháp"
  },
  {
    "question": "Từ \"Buying\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mua", "Bán", "Thuê", "Tặng"],
    "correctAnswer": "Mua"
  },
  {
    "question": "Từ \"Player\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Người học", "Người chơi", "Người nghe", "Người xem"],
    "correctAnswer": "Người chơi"
  },
  {
    "question": "Từ \"January\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư"],
    "correctAnswer": "Tháng Một"
  },
  {
    "question": "Từ \"Waste\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiết kiệm", "Lãng phí", "Đầu tư", "Tái chế"],
    "correctAnswer": "Lãng phí"
  },
  {
    "question": "Từ \"Meat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Rau", "Thịt", "Cá", "Trứng"],
    "correctAnswer": "Thịt"
  },
  {
    "question": "Từ \"Soil\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nước", "Khí", "Đất", "Cát"],
    "correctAnswer": "Đất"
  },
  {
    "question": "Từ \"Reference\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giới thiệu", "Tham khảo", "Tư vấn", "Dẫn chứng"],
    "correctAnswer": "Tham khảo"
  },
  {
    "question": "Từ \"Winter\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mùa xuân", "Mùa hè", "Mùa thu", "Mùa đông"],
    "correctAnswer": "Mùa đông"
  },
  {
    "question": "Từ \"Internal\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngoại bộ", "Nội bộ", "Bên ngoài", "Khác"],
    "correctAnswer": "Nội bộ"
  },
  {
    "question": "Từ \"Volume\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Điện tích", "Thể tích", "Khối lượng", "Tốc độ"],
    "correctAnswer": "Thể tích"
  },
  {
    "question": "Từ \"Construction\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sửa chữa", "Xây dựng", "Phá dỡ", "Trang trí"],
    "correctAnswer": "Xây dựng"
  },
  {
    "question": "Từ \"Shoot\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chạy", "Nhảy", "Bắn", "Đá"],
    "correctAnswer": "Bắn"
  },
  {
    "question": "Từ \"Mid\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đầu", "Giữa", "Cuối", "Trên"],
    "correctAnswer": "Giữa"
  },
  {
    "question": "Từ \"Urban\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nông thôn", "Đô thị", "Vùng ngoại ô", "Đồng quê"],
    "correctAnswer": "Đô thị"
  },
  {
    "question": "Từ \"Breath\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hơi thở", "Nói chuyện", "Nghe nhạc", "Sự sống"],
    "correctAnswer": "Hơi thở"
  },
  {
    "question": "Từ \"Survey\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khảo sát", "Nghiên cứu", "Đo đạc", "Xem xét"],
    "correctAnswer": "Khảo sát"
  },
  {
    "question": "Từ \"Anxiety\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hạnh phúc", "Lo âu", "Bình tĩnh", "Yên tâm"],
    "correctAnswer": "Lo âu"
  },
  {
    "question": "Từ \"Flat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dốc", "Gồ ghề", "Phẳng", "Lồi"],
    "correctAnswer": "Phẳng"
  },
  {
    "question": "Từ \"Desire\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ghét bỏ", "Từ chối", "Khát khao", "Sợ hãi"],
    "correctAnswer": "Khát khao"
  },
  {
    "question": "Từ “Sky” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đất", "Bầu trời", "Biển", "Núi"],
    "correctAnswer": "Bầu trời"
  },
  {
    "question": "Từ “Stock” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cổ phiếu", "Con gà", "Cây cảnh", "Trái cây"],
    "correctAnswer": "Cổ phiếu"
  },
  {
    "question": "Từ “Remove” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thêm vào", "Loại bỏ", "Giữ lại", "Đổi mới"],
    "correctAnswer": "Loại bỏ"
  },
  {
    "question": "Từ “Trial” trong tiếng Anh có nghĩa là gì?",
    "options": ["Kỳ nghỉ", "Thử nghiệm", "Sự cố", "Ngày lễ"],
    "correctAnswer": "Thử nghiệm"
  },
  {
    "question": "Từ “Circle” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hình vuông", "Hình tam giác", "Vòng tròn", "Hình chữ nhật"],
    "correctAnswer": "Vòng tròn"
  },
  {
    "question": "Từ “Lecture” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bài giảng", "Cuộc họp", "Bài hát", "Bản tin"],
    "correctAnswer": "Bài giảng"
  },
  {
    "question": "Từ “Deeply” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nông cạn", "Vô tâm", "Sâu sắc", "Nhanh chóng"],
    "correctAnswer": "Sâu sắc"
  },
  {
    "question": "Từ “Facing” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đối mặt", "Chạy", "Nhảy", "Bay"],
    "correctAnswer": "Đối mặt"
  },
  {
    "question": "Từ “Chat” trong tiếng Anh có nghĩa là gì?",
    "options": ["Viết thư", "Hát", "Trò chuyện", "Nói dối"],
    "correctAnswer": "Trò chuyện"
  },
  {
    "question": "Từ “Governor” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tổng thống", "Thống đốc", "Thủ tướng", "Vua"],
    "correctAnswer": "Thống đốc"
  },
  {
    "question": "Từ “Hole” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cái đỉnh", "Cái lỗ", "Cái tường", "Cái cửa"],
    "correctAnswer": "Cái lỗ"
  },
  {
    "question": "Từ “Passion” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự yêu thích", "Đam mê", "Sự buồn bã", "Sự bình thường"],
    "correctAnswer": "Đam mê"
  },
  {
    "question": "Từ “Commercial” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghệ thuật", "Thương mại", "Giáo dục", "Nông nghiệp"],
    "correctAnswer": "Thương mại"
  },
  {
    "question": "Từ “Grab” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ đi", "Bắt lấy", "Nhìn", "Nghe"],
    "correctAnswer": "Bắt lấy"
  },
  {
    "question": "Từ “Paint” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nấu ăn", "Mua sắm", "Sơn", "Học"],
    "correctAnswer": "Sơn"
  },
  {
    "question": "Từ “Border” trong tiếng Anh có nghĩa là gì?",
    "options": ["Ranh giới", "Con đường", "Nhà cửa", "Khu vườn"],
    "correctAnswer": "Ranh giới"
  },
  {
    "question": "Từ “Consistent” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đa dạng", "Không đồng nhất", "Nhất quán", "Thay đổi"],
    "correctAnswer": "Nhất quán"
  },
  {
    "question": "Từ “Era” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thời đại", "Khoảng lặng", "Sự phân chia", "Ngày xửa ngày xưa"],
    "correctAnswer": "Thời đại"
  },
  {
    "question": "Từ “AI” trong tiếng Anh là viết tắt của gì?",
    "options": ["Automated Instrument", "Artificial Intelligence", "Artistic Innovation", "Advanced Internet"],
    "correctAnswer": "Artificial Intelligence"
  },
  {
    "question": "Từ “Signs” trong tiếng Anh có nghĩa là gì?",
    "options": ["Dấu hiệu", "Con số", "Cuốn sách", "Thực phẩm"],
    "correctAnswer": "Dấu hiệu"
  },
  {
    "question": "Từ \"Extraordinary\" có nghĩa là gì?",
    "options": ["Bình thường", "Phi thường", "Thường xuyên", "Trẻ con"],
    "correctAnswer": "Phi thường"
  },
  {
    "question": "Từ \"Symptoms\" có nghĩa là gì?",
    "options": ["Phương pháp", "Triệu chứng", "Kỹ năng", "Hành vi"],
    "correctAnswer": "Triệu chứng"
  },
  {
    "question": "Từ \"Reform\" có nghĩa là gì?",
    "options": ["Cải cách", "Tẩy chay", "Bảo vệ", "Phản đối"],
    "correctAnswer": "Cải cách"
  },
  {
    "question": "Từ \"Southern\" có nghĩa là gì?",
    "options": ["Miền Bắc", "Miền Nam", "Trung tâm", "Tây"],
    "correctAnswer": "Miền Nam"
  },
  {
    "question": "Từ \"Topics\" có nghĩa là gì?",
    "options": ["Chủ đề", "Từ vựng", "Câu chuyện", "Lịch sử"],
    "correctAnswer": "Chủ đề"
  },
  {
    "question": "Từ \"Birth\" có nghĩa là gì?",
    "options": ["Cái chết", "Sự trưởng thành", "Sự ra đời", "Sự kết thúc"],
    "correctAnswer": "Sự ra đời"
  },
  {
    "question": "Từ \"Moral\" có nghĩa là gì?",
    "options": ["Vật chất", "Đạo đức", "Pháp luật", "Khoa học"],
    "correctAnswer": "Đạo đức"
  },
  {
    "question": "Từ \"Doubt\" có nghĩa là gì?",
    "options": ["Tin tưởng", "Nghi ngờ", "Tự tin", "Yêu thương"],
    "correctAnswer": "Nghi ngờ"
  },
  {
    "question": "Từ \"Sister\" có nghĩa là gì?",
    "options": ["Em trai", "Anh chị em", "Chị gái", "Chị em gái"],
    "correctAnswer": "Chị em gái"
  },
  {
    "question": "Từ \"Compare\" có nghĩa là gì?",
    "options": ["So sánh", "Chia sẻ", "Đánh giá", "Phân tích"],
    "correctAnswer": "So sánh"
  },
  {
    "question": "Từ \"Engine\" có nghĩa là gì?",
    "options": ["Động cơ", "Thiết kế", "Máy móc", "Bộ phận"],
    "correctAnswer": "Động cơ"
  },
  {
    "question": "Từ \"Criminal\" có nghĩa là gì?",
    "options": ["Tội phạm", "Công dân", "Luật sư", "Thủ phạm"],
    "correctAnswer": "Tội phạm"
  },
  {
    "question": "Từ \"Fuel\" có nghĩa là gì?",
    "options": ["Nước", "Nhiên liệu", "Thực phẩm", "Dầu mỡ"],
    "correctAnswer": "Nhiên liệu"
  },
  {
    "question": "Từ \"Dinner\" có nghĩa là gì?",
    "options": ["Bữa sáng", "Bữa trưa", "Bữa tối", "Bữa phụ"],
    "correctAnswer": "Bữa tối"
  },
  {
    "question": "Từ \"Beauty\" có nghĩa là gì?",
    "options": ["Xấu xí", "Vẻ đẹp", "Sự giàu có", "Sức khỏe"],
    "correctAnswer": "Vẻ đẹp"
  },
  {
    "question": "Từ \"Tradition\" có nghĩa là gì?",
    "options": ["Sự đổi mới", "Truyền thống", "Phát minh", "Sáng tạo"],
    "correctAnswer": "Truyền thống"
  },
  {
    "question": "Từ \"Landscape\" có nghĩa là gì?",
    "options": ["Kiến trúc", "Phong cảnh", "Khu vực công nghiệp", "Đô thị"],
    "correctAnswer": "Phong cảnh"
  },
  {
    "question": "Từ \"Vehicle\" có nghĩa là gì?",
    "options": ["Xe cộ", "Động cơ", "Lái xe", "Xe đạp"],
    "correctAnswer": "Xe cộ"
  },
  {
    "question": "Từ \"German\" có nghĩa là gì?",
    "options": ["Người Đức", "Người Hà Lan", "Người Hàn", "Người Áo"],
    "correctAnswer": "Người Đức"
  },
  {
    "question": "Từ \"Atmosphere\" có nghĩa là gì?",
    "options": ["Bầu khí quyển", "Âm thanh", "Áp suất", "Năng lượng"],
    "correctAnswer": "Bầu khí quyển"
  },
  {
    "question": "Từ \"Chicken\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Con gà", "Con chó", "Con mèo", "Con chim"],
    "correctAnswer": "Con gà"
  },
  {
    "question": "Từ \"Decade\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thập kỷ", "Năm", "Tháng", "Tuần"],
    "correctAnswer": "Thập kỷ"
  },
  {
    "question": "Từ \"Surprised\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vui", "Ngạc nhiên", "Buồn", "Tức giận"],
    "correctAnswer": "Ngạc nhiên"
  },
  {
    "question": "Từ \"Category\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Số lượng", "Danh mục", "Khoảng cách", "Cảm xúc"],
    "correctAnswer": "Danh mục"
  },
  {
    "question": "Từ \"Ride\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cưỡi", "Chạy", "Bơi", "Nấu"],
    "correctAnswer": "Cưỡi"
  },
  {
    "question": "Từ \"Mountain\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Rừng", "Sông", "Núi", "Biển"],
    "correctAnswer": "Núi"
  },
  {
    "question": "Từ \"Solid\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lỏng", "Nước", "Khí", "Rắn"],
    "correctAnswer": "Rắn"
  },
  {
    "question": "Từ \"Evil\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ác", "Tốt", "Hài hước", "Nhân hậu"],
    "correctAnswer": "Ác"
  },
  {
    "question": "Từ \"Importantly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Quan trọng", "Nhanh chóng", "Dễ thương", "Thú vị"],
    "correctAnswer": "Quan trọng"
  },
  {
    "question": "Từ \"Weekend\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngày thường", "Cuối tuần", "Tuần lễ", "Tháng lễ"],
    "correctAnswer": "Cuối tuần"
  },
  {
    "question": "Từ \"Hall\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sảnh", "Phòng ngủ", "Bếp", "Phòng khách"],
    "correctAnswer": "Sảnh"
  },
  {
    "question": "Từ \"Traffic\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Văn hóa", "Động vật", "Thực phẩm", "Giao thông"],
    "correctAnswer": "Giao thông"
  },
  {
    "question": "Từ \"Print\" trong tiếng Anh có nghĩa là gì?",
    "options": ["In", "Viết", "Đọc", "Nói"],
    "correctAnswer": "In"
  },
  {
    "question": "Từ \"Angle\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hình tròn", "Đoạn đường", "Đường thẳng", "Góc"],
    "correctAnswer": "Góc"
  },
  {
    "question": "Từ \"Feelings\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cảm giác nóng", "Cảm giác đau", "Cảm xúc", "Cảm giác lạnh"],
    "correctAnswer": "Cảm xúc"
  },
  {
    "question": "Từ \"Wake\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngủ", "Thức dậy", "Ăn", "Uống"],
    "correctAnswer": "Thức dậy"
  },
  {
    "question": "Từ \"Cash\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiền điện tử", "Tiền mặt", "Thẻ tín dụng", "Chuyển khoản"],
    "correctAnswer": "Tiền mặt"
  },
  {
    "question": "Từ \"Division\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhân", "Cộng", "Trừ", "Chia"],
    "correctAnswer": "Chia"
  },
  {
    "question": "Từ \"Busy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Rảnh", "Buồn ngủ", "Thư giãn", "Bận"],
    "correctAnswer": "Bận"
  },
  {
    "question": "Từ \"Secure\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nguy hiểm", "An toàn", "Lỏng lẻo", "Mở"],
    "correctAnswer": "An toàn"
  },
  {
    "question": "Từ \"Extreme\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bình thường", "Vừa phải", "Cực đoan", "Trung lập"],
    "correctAnswer": "Cực đoan"
  },
  {
    "question": "Từ \"Curve\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đường thẳng", "Đường gãy", "Đường cong", "Đường xiên"],
    "correctAnswer": "Đường cong"
  },
  {
    "question": "Từ \"Matrix\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ma trận", "Mạng lưới", "Phối hợp", "Hợp đồng"],
    "correctAnswer": "Ma trận"
  },
  {
    "question": "Từ \"Frankly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giấu giếm", "Lén lút", "Thẳng thắn", "Khách quan"],
    "correctAnswer": "Thẳng thắn"
  },
  {
    "question": "Từ \"Efficient\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lãng phí", "Hiệu quả", "Chậm chạp", "Tẻ nhạt"],
    "correctAnswer": "Hiệu quả"
  },
  {
    "question": "Từ \"Broad\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hẹp", "Rộng", "Sâu", "Ngắn"],
    "correctAnswer": "Rộng"
  },
  {
    "question": "Từ \"Effectively\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Không hiệu quả", "Thủ công", "Một cách hiệu quả", "Nhanh chóng"],
    "correctAnswer": "Một cách hiệu quả"
  },
  {
    "question": "Từ \"Saved\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã mất", "Đã lưu lại", "Đã bán", "Đã ăn"],
    "correctAnswer": "Đã lưu lại"
  },
  {
    "question": "Từ \"Component\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành phần", "Dự án", "Quy trình", "Bản đồ"],
    "correctAnswer": "Thành phần"
  },
  {
    "question": "Từ \"Patterns\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hỗn loạn", "Mẫu", "Sự ngẫu nhiên", "Hỗn hợp"],
    "correctAnswer": "Mẫu"
  },
  {
    "question": "Từ \"Gain\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mất", "Giảm", "Thu được", "Lơ đãng"],
    "correctAnswer": "Thu được"
  },
  {
    "question": "Từ \"Theme\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chủ đề", "Thể loại", "Cốt truyện", "Nhân vật"],
    "correctAnswer": "Chủ đề"
  },
  {
    "question": "Từ \"Prepare\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Chuẩn bị", "Từ chối", "Kết thúc"],
    "correctAnswer": "Chuẩn bị"
  },
  {
    "question": "Từ \"Gene\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Di truyền", "Gen", "Protein", "Tế bào"],
    "correctAnswer": "Gen"
  },
  {
    "question": "Từ \"Literature\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khoa học", "Nghệ thuật", "Văn học", "Toán học"],
    "correctAnswer": "Văn học"
  },
  {
    "question": "Từ \"Neighborhood\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành phố", "Quận", "Khu phố", "Thôn xóm"],
    "correctAnswer": "Khu phố"
  },
  {
    "question": "Từ \"Survive\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sống sót", "Chết", "Ngủ", "Đi bộ"],
    "correctAnswer": "Sống sót"
  },
  {
    "question": "Từ \"Korea\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhật Bản", "Trung Quốc", "Hàn Quốc", "Việt Nam"],
    "correctAnswer": "Hàn Quốc"
  },
  {
    "question": "Từ \"Fell\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lên", "Rơi", "Nhảy", "Bay"],
    "correctAnswer": "Rơi"
  },
  {
    "question": "Từ \"Restaurant\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khách sạn", "Nhà hàng", "Siêu thị", "Bệnh viện"],
    "correctAnswer": "Nhà hàng"
  },
  {
    "question": "Từ \"Connections\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự chia cách", "Sự kết nối", "Sự trao đổi", "Sự tương tác"],
    "correctAnswer": "Sự kết nối"
  },
  {
    "question": "Từ \"Seek\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tìm kiếm", "Tránh né", "Dừng lại", "Giấu giếm"],
    "correctAnswer": "Tìm kiếm"
  },
  {
    "question": "Từ \"Remind\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhắc nhở", "Quên lãng", "Lấy lại", "Thương tiếc"],
    "correctAnswer": "Nhắc nhở"
  },
  {
    "question": "Từ \"Item\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Món đồ", "Công việc", "Giao dịch", "Kỷ niệm"],
    "correctAnswer": "Món đồ"
  },
  {
    "question": "Từ \"Cards\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thẻ", "Sổ", "Hộp", "Bản đồ"],
    "correctAnswer": "Thẻ"
  },
  {
    "question": "Từ \"Framework\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phần mềm", "Khung", "Bộ máy", "Lược đồ"],
    "correctAnswer": "Khung"
  },
  {
    "question": "Từ \"Bridge\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cầu", "Đảo", "Dòng sông", "Cửa"],
    "correctAnswer": "Cầu"
  },
  {
    "question": "Từ \"Coast\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bờ biển", "Núi", "Đồi", "Sông"],
    "correctAnswer": "Bờ biển"
  },
  {
    "question": "Từ \"Weapons\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vũ khí", "Công cụ", "Phương tiện", "Trang phục"],
    "correctAnswer": "Vũ khí"
  },
  {
    "question": "Từ \"Quarter\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Một phần tư", "Một phần ba", "Một nửa", "Một phần năm"],
    "correctAnswer": "Một phần tư"
  },
  {
    "question": "Từ \"Exchange\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trao đổi", "Chuyển tiếp", "Giữ lại", "Kết nối"],
    "correctAnswer": "Trao đổi"
  },
  {
    "question": "Từ \"Express\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Biểu đạt", "Nhập khẩu", "Vận chuyển", "Đường sắt nhanh"],
    "correctAnswer": "Biểu đạt"
  },
  {
    "question": "Từ \"Lake\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hồ", "Sông", "Biển", "Ao"],
    "correctAnswer": "Hồ"
  },
  {
    "question": "Từ \"Facility\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cơ sở", "Tiện nghi", "Công cụ", "Dịch vụ"],
    "correctAnswer": "Cơ sở"
  },
  {
    "question": "Từ \"Rare\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hiếm", "Phổ biến", "Thông thường", "Thường ngày"],
    "correctAnswer": "Hiếm"
  },
  {
    "question": "Từ \"Fruit\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trái cây", "Rau", "Đồ uống", "Thịt"],
    "correctAnswer": "Trái cây"
  },
  {
    "question": "Từ \"Originally\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ban đầu", "Hiện nay", "Cuối cùng", "Sau này"],
    "correctAnswer": "Ban đầu"
  },
  {
    "question": "Từ \"Hill\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đồi", "Núi", "Đường", "Thung lũng"],
    "correctAnswer": "Đồi"
  },
  {
    "question": "Từ \"Architecture\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kiến trúc", "Nghệ thuật", "Hệ thống", "Mô hình"],
    "correctAnswer": "Kiến trúc"
  },
  {
    "question": "Từ \"Lunch\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bữa trưa", "Bữa sáng", "Bữa tối", "Bữa ăn nhẹ"],
    "correctAnswer": "Bữa trưa"
  },
  {
    "question": "Từ \"Sequence\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hỗn loạn", "Trình tự", "Phản chiếu", "Đột phá"],
    "correctAnswer": "Trình tự"
  },
  {
    "question": "Từ \"Revolution\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự quay vòng", "Sự tiến triển", "Cách mạng", "Sự dừng lại"],
    "correctAnswer": "Cách mạng"
  },
  {
    "question": "Từ \"Priority\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ưu tiên", "Quan tâm", "Phụ thuộc", "Giải pháp"],
    "correctAnswer": "Ưu tiên"
  },
  {
    "question": "Từ \"Enormous\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhỏ nhắn", "Khổng lồ", "Phức tạp", "Rất ít"],
    "correctAnswer": "Khổng lồ"
  },
  {
    "question": "Từ \"Reflect\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phản chiếu", "Thực hiện", "Đánh lừa", "Phản đối"],
    "correctAnswer": "Phản chiếu"
  },
  {
    "question": "Từ \"Evolution\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cách mạng", "Tiến hóa", "Sự suy thoái", "Quá trình lặp lại"],
    "correctAnswer": "Tiến hóa"
  },
  {
    "question": "Từ \"Writer\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Người viết", "Người đọc", "Người diễn thuyết", "Người mua sắm"],
    "correctAnswer": "Người viết"
  },
  {
    "question": "Từ \"Messages\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tin nhắn", "Âm thanh", "Hình ảnh", "Sự im lặng"],
    "correctAnswer": "Tin nhắn"
  },
  {
    "question": "Từ \"Plenty\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vừa đủ", "Thiếu thốn", "Nhiều", "Ít ỏi"],
    "correctAnswer": "Nhiều"
  },
  {
    "question": "Từ \"Expert\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Người mới bắt đầu", "Chuyên gia", "Người làm việc tạm thời", "Người lạ"],
    "correctAnswer": "Chuyên gia"
  },
  {
    "question": "Từ \"Occur\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xảy ra", "Phá hủy", "Ngăn chặn", "Ẩn nấp"],
    "correctAnswer": "Xảy ra"
  },
  {
    "question": "Từ \"April\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Tư", "Tháng Ba", "Tháng Năm", "Tháng Hai"],
    "correctAnswer": "Tháng Tư"
  },
  {
    "question": "Từ \"Log\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhật ký", "Bức tranh", "Chìa khóa", "Đồ uống"],
    "correctAnswer": "Nhật ký"
  },
  {
    "question": "Từ \"Operation\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Làm việc", "Phẫu thuật", "Tách rời", "Bùng nổ"],
    "correctAnswer": "Phẫu thuật"
  },
  {
    "question": "Từ \"Perform\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghe", "Biểu diễn", "Mua", "Lắng nghe"],
    "correctAnswer": "Biểu diễn"
  },
  {
    "question": "Từ \"Capture\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ lỡ", "Đánh mất", "Bắt giữ", "Phóng thích"],
    "correctAnswer": "Bắt giữ"
  },
  {
    "question": "Từ \"Frequency\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tần số", "Khoảng cách", "Tốc độ", "Khối lượng"],
    "correctAnswer": "Tần số"
  },
  {
    "question": "Từ \"Birds\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Động vật có vú", "Cá", "Chim", "Côn trùng"],
    "correctAnswer": "Chim"
  },
  {
    "question": "Từ \"Celebrate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đánh giá", "Chia sẻ", "Kỷ niệm", "Từ chối"],
    "correctAnswer": "Kỷ niệm"
  },
  {
    "question": "Từ \"Salt\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đường", "Muối", "Nước", "Bột ngọt"],
    "correctAnswer": "Muối"
  },
  {
    "question": "Từ \"Nervous\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vui vẻ", "Lo lắng", "Bình tĩnh", "Thư giãn"],
    "correctAnswer": "Lo lắng"
  },
  {
    "question": "Từ \"Chemical\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hóa chất", "Sinh học", "Vật lý", "Địa chất"],
    "correctAnswer": "Hóa chất"
  },
  {
    "question": "Từ \"Invite\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cấm", "Mời", "Buộc", "Chối từ"],
    "correctAnswer": "Mời"
  },
  {
    "question": "Từ \"Score\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Điểm số", "Bài hát", "Bản nhạc", "Câu chuyện"],
    "correctAnswer": "Điểm số"
  },
  {
    "question": "Từ \"Prayer\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ca hát", "Cầu nguyện", "Lời chào", "Lời chúc"],
    "correctAnswer": "Cầu nguyện"
  },
  {
    "question": "Từ \"Camp\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trại", "Nhà nghỉ", "Trường học", "Căn cứ quân sự"],
    "correctAnswer": "Trại"
  },
  {
    "question": "Từ \"Launched\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hủy bỏ", "Ra mắt", "Kết thúc", "Dừng lại"],
    "correctAnswer": "Ra mắt"
  },
  {
    "question": "Từ \"Coach\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Huấn luyện viên", "Người lái xe", "Bác sĩ", "Giáo viên"],
    "correctAnswer": "Huấn luyện viên"
  },
  {
    "question": "Từ \"Electric\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cơ học", "Điện", "Nhiệt", "Hóa học"],
    "correctAnswer": "Điện"
  },
  {
    "question": "Từ \"Fail\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành công", "Thất bại", "Tiến bộ", "Thành tựu"],
    "correctAnswer": "Thất bại"
  },
  {
    "question": "Từ \"Relative\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Họ hàng", "Tương đối", "Bạn bè", "Người quen"],
    "correctAnswer": "Họ hàng"
  },
  {
    "question": "Từ \"Command\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hỏi", "Chỉ huy", "Cứu trợ", "Nói chuyện"],
    "correctAnswer": "Chỉ huy"
  },
  {
    "question": "Từ \"Zone\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khu vực", "Thành phố", "Vùng đất", "Quận"],
    "correctAnswer": "Khu vực"
  },
  {
    "question": "Từ \"Diseases\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bệnh tật", "Tai nạn", "Chấn thương", "Rối loạn"],
    "correctAnswer": "Bệnh tật"
  },
  {
    "question": "Từ \"Forced\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tự do", "Ép buộc", "Tình cờ", "Vô tình"],
    "correctAnswer": "Ép buộc"
  },
  {
    "question": "Từ \"Mode\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phương tiện", "Chế độ", "Cách thức", "Kiểu"],
    "correctAnswer": "Chế độ"
  },
  {
    "question": "Từ \"Units\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đơn vị", "Nhóm", "Số lượng", "Bộ phận"],
    "correctAnswer": "Đơn vị"
  },
  {
    "question": "Từ \"Excuse\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lý do", "Cách giải thích", "Lời biện hộ", "Lời chào"],
    "correctAnswer": "Lời biện hộ"
  },
  {
    "question": "Từ \"Dean\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trưởng khoa", "Hiệu trưởng", "Giám đốc", "Giáo sư"],
    "correctAnswer": "Trưởng khoa"
  },
  {
    "question": "Từ \"Dreams\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giấc mơ", "Âm mưu", "Huyền thoại", "Ảo tưởng"],
    "correctAnswer": "Giấc mơ"
  },
  {
    "question": "Từ \"Assistant\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đối thủ", "Trợ lý", "Người hướng dẫn", "Khách mời"],
    "correctAnswer": "Trợ lý"
  },
  {
    "question": "Từ \"Wood\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nước", "Gỗ", "Lửa", "Đá"],
    "correctAnswer": "Gỗ"
  },
  {
    "question": "Từ \"Sentence\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Câu", "Đoạn văn", "Câu chuyện", "Từ"],
    "correctAnswer": "Câu"
  },
  {
    "question": "Từ \"Letting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cho thuê", "Ngăn cản", "Lặp lại", "Phớt lờ"],
    "correctAnswer": "Cho thuê"
  },
  {
    "question": "Từ \"Display\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ẩn giấu", "Trưng bày", "Sửa chữa", "Cướp bóc"],
    "correctAnswer": "Trưng bày"
  },
  {
    "question": "Từ \"Stone\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nước", "Gỗ", "Đá", "Kim loại"],
    "correctAnswer": "Đá"
  },
  {
    "question": "Từ \"Rural\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành thị", "Công nghiệp", "Nông thôn", "Hiện đại"],
    "correctAnswer": "Nông thôn"
  },
  {
    "question": "Từ \"Veterans\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Học sinh", "Chiến binh trẻ", "Cựu chiến binh", "Người già"],
    "correctAnswer": "Cựu chiến binh"
  },
  {
    "question": "Từ \"Transfer\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chuyển giao", "Gặp gỡ", "Phát triển", "Lặp lại"],
    "correctAnswer": "Chuyển giao"
  },
  {
    "question": "Từ \"Tour\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chuyến du lịch", "Lịch trình làm việc", "Buổi biểu diễn", "Hành trình mạo hiểm"],
    "correctAnswer": "Chuyến du lịch"
  },
  {
    "question": "Từ \"Classic\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cổ điển", "Hiện đại", "Lạ lẫm", "Bất thường"],
    "correctAnswer": "Cổ điển"
  },
  {
    "question": "Từ \"String\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dây", "Sợi kim loại", "Sợi len", "Chuỗi"],
    "correctAnswer": "Dây"
  },
  {
    "question": "Từ \"Struggling\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành công", "Khó khăn", "Dễ dàng", "Vui vẻ"],
    "correctAnswer": "Khó khăn"
  },
  {
    "question": "Từ \"Christmas\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tết Nguyên Đán", "Lễ Phục Sinh", "Giáng sinh", "Lễ hội mùa hè"],
    "correctAnswer": "Giáng sinh"
  },
  {
    "question": "Từ \"Roughly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chính xác", "Xấp xỉ", "Cẩn thận", "Nhanh chóng"],
    "correctAnswer": "Xấp xỉ"
  },
  {
    "question": "Từ \"Depth\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chiều cao", "Chiều dài", "Độ sâu", "Chiều rộng"],
    "correctAnswer": "Độ sâu"
  },
  {
    "question": "Từ \"Pair\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đôi", "Một", "Ba", "Nhiều"],
    "correctAnswer": "Đôi"
  },
  {
    "question": "Từ \"Storage\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lưu trữ", "Sử dụng", "Mua bán", "Xoá bỏ"],
    "correctAnswer": "Lưu trữ"
  },
  {
    "question": "Từ \"Sum\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hiệu", "Tích", "Tổng", "Phần trăm"],
    "correctAnswer": "Tổng"
  },
  {
    "question": "Từ \"Host\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chủ nhà", "Khách mời", "Người đến thăm", "Người hướng dẫn"],
    "correctAnswer": "Chủ nhà"
  },
  {
    "question": "Từ “Careful” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhanh nhẹn", "Cẩn thận", "Lười biếng", "Vui vẻ"],
    "correctAnswer": "Cẩn thận"
  },
  {
    "question": "Từ “Match” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cái bàn", "Que diêm", "Ngôi nhà", "Bông hoa"],
    "correctAnswer": "Que diêm"
  },
  {
    "question": "Từ “Fundamental” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phức tạp", "Cơ bản", "Phụ thuộc", "Thứ yếu"],
    "correctAnswer": "Cơ bản"
  },
  {
    "question": "Từ “European” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thuộc về châu Âu", "Thuộc về châu Á", "Thuộc về Bắc Mỹ", "Thuộc về Phi Châu"],
    "correctAnswer": "Thuộc về châu Âu"
  },
  {
    "question": "Từ “Twice” trong tiếng Anh có nghĩa là gì?",
    "options": ["Một lần", "Hai lần", "Ba lần", "Nhiều lần"],
    "correctAnswer": "Hai lần"
  },
  {
    "question": "Từ “Processes” trong tiếng Anh có nghĩa là gì?",
    "options": ["Các hiện tượng", "Các sản phẩm", "Các quá trình", "Các hoạt động"],
    "correctAnswer": "Các quá trình"
  },
  {
    "question": "Từ “Valuable” trong tiếng Anh có nghĩa là gì?",
    "options": ["Rẻ tiền", "Quý giá", "Hữu ích", "Phổ biến"],
    "correctAnswer": "Quý giá"
  },
  {
    "question": "Từ “Creates” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phá hủy", "Tạo ra", "Sửa chữa", "Sao chép"],
    "correctAnswer": "Tạo ra"
  },
  {
    "question": "Từ “Invest” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đầu tư", "Tiết kiệm", "Chi tiêu", "Từ bỏ"],
    "correctAnswer": "Đầu tư"
  },
  {
    "question": "Từ “Argue” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đồng ý", "Tranh luận", "Cười", "Hòa giải"],
    "correctAnswer": "Tranh luận"
  },
  {
    "question": "Từ “Signal” trong tiếng Anh có nghĩa là gì?",
    "options": ["Âm thanh", "Tín hiệu", "Hình ảnh", "Mã hóa"],
    "correctAnswer": "Tín hiệu"
  },
  {
    "question": "Từ “Gap” trong tiếng Anh có nghĩa là gì?",
    "options": ["Khoảng cách", "Lỗ hổng", "Khe hở", "Khoảng trống"],
    "correctAnswer": "Khoảng trống"
  },
  {
    "question": "Từ “Cast” trong tiếng Anh có nghĩa là gì?",
    "options": ["Ném", "Bắt", "Bỏ", "Nói"],
    "correctAnswer": "Ném"
  },
  {
    "question": "Từ “Consumer” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhà sản xuất", "Người tiêu dùng", "Người bán hàng", "Nhà phân phối"],
    "correctAnswer": "Người tiêu dùng"
  },
  {
    "question": "Từ “Grace” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự uy nghi", "Duyên dáng", "Sự lãng mạn", "Sự nhanh nhẹn"],
    "correctAnswer": "Duyên dáng"
  },
  {
    "question": "Từ “Physics” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hóa học", "Sinh học", "Vật lý", "Tin học"],
    "correctAnswer": "Vật lý"
  },
  {
    "question": "Từ “Beach” trong tiếng Anh có nghĩa là gì?",
    "options": ["Núi", "Biển", "Sông", "Bãi biển"],
    "correctAnswer": "Bãi biển"
  },
  {
    "question": "Từ “Collaboration” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cạnh tranh", "Hợp tác", "Độc lập", "Thù địch"],
    "correctAnswer": "Hợp tác"
  },
  {
    "question": "Từ “Principle” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nguyên tắc", "Giả thuyết", "Kết quả", "Phương pháp"],
    "correctAnswer": "Nguyên tắc"
  },
  {
    "question": "Từ “Stronger” trong tiếng Anh có nghĩa là gì?",
    "options": ["Yếu hơn", "Mạnh hơn", "Tốt hơn", "Nhanh hơn"],
    "correctAnswer": "Mạnh hơn"
  },
  {
    "question": "Từ \"Wealth\" có nghĩa là gì?",
    "options": ["Sự nghèo nàn", "Sự giàu có", "Sự thông thường", "Sự mỏng manh"],
    "correctAnswer": "Sự giàu có"
  },
  {
    "question": "Từ \"Skill\" có nghĩa là gì?",
    "options": ["Sự cẩu thả", "Kỹ năng", "Sự may mắn", "Sự mệt mỏi"],
    "correctAnswer": "Kỹ năng"
  },
  {
    "question": "Từ \"Crew\" có nghĩa là gì?",
    "options": ["Đội ngũ", "Người lái", "Khách hàng", "Đội quân"],
    "correctAnswer": "Đội ngũ"
  },
  {
    "question": "Từ \"Friday\" có nghĩa là gì?",
    "options": ["Thứ Hai", "Thứ Ba", "Thứ Sáu", "Thứ Bảy"],
    "correctAnswer": "Thứ Sáu"
  },
  {
    "question": "Từ \"Breaking\" có nghĩa là gì?",
    "options": ["Kết nối", "Phá vỡ", "Sửa chữa", "Ghi nhận"],
    "correctAnswer": "Phá vỡ"
  },
  {
    "question": "Từ \"Japanese\" có nghĩa là gì?",
    "options": ["Trung Quốc", "Hàn Quốc", "Nhật Bản", "Việt Nam"],
    "correctAnswer": "Nhật Bản"
  },
  {
    "question": "Từ \"Annual\" có nghĩa là gì?",
    "options": ["Hàng tháng", "Hàng năm", "Hàng tuần", "Hàng ngày"],
    "correctAnswer": "Hàng năm"
  },
  {
    "question": "Từ \"Loop\" có nghĩa là gì?",
    "options": ["Đường thẳng", "Vòng lặp", "Mảnh ghép", "Hình vuông"],
    "correctAnswer": "Vòng lặp"
  },
  {
    "question": "Từ \"Fixed\" có nghĩa là gì?",
    "options": ["Di động", "Biến động", "Cố định", "Lỏng lẻo"],
    "correctAnswer": "Cố định"
  },
  {
    "question": "Từ \"Cook\" có nghĩa là gì?",
    "options": ["Nấu ăn", "Học tập", "Chạy bộ", "Nhảy múa"],
    "correctAnswer": "Nấu ăn"
  },
  {
    "question": "Từ \"Functions\" có nghĩa là gì?",
    "options": ["Sự kiện", "Chức năng", "Hình thức", "Phương pháp"],
    "correctAnswer": "Chức năng"
  },
  {
    "question": "Từ \"Dance\" có nghĩa là gì?",
    "options": ["Ngủ nghỉ", "Hát ca", "Nhảy múa", "Đọc sách"],
    "correctAnswer": "Nhảy múa"
  },
  {
    "question": "Từ \"Drawing\" có nghĩa là gì?",
    "options": ["Vẽ", "Nấu ăn", "Hát ca", "Viết lách"],
    "correctAnswer": "Vẽ"
  },
  {
    "question": "Từ \"Fresh\" có nghĩa là gì?",
    "options": ["Cũ kỹ", "Ô nhiễm", "Tươi mới", "Héo hon"],
    "correctAnswer": "Tươi mới"
  },
  {
    "question": "Từ \"Warm\" có nghĩa là gì?",
    "options": ["Lạnh lẽo", "Ấm áp", "Rét mướt", "Nóng bức"],
    "correctAnswer": "Ấm áp"
  },
  {
    "question": "Từ \"Grateful\" có nghĩa là gì?",
    "options": ["Kiêu hãnh", "Biết ơn", "Thù địch", "Lạnh nhạt"],
    "correctAnswer": "Biết ơn"
  },
  {
    "question": "Từ \"Radio\" có nghĩa là gì?",
    "options": ["Đài phát thanh", "Tivi", "Máy tính", "Điện thoại"],
    "correctAnswer": "Đài phát thanh"
  },
  {
    "question": "Từ \"Combination\" có nghĩa là gì?",
    "options": ["Sự tách rời", "Sự kết hợp", "Sự phân chia", "Sự phân tích"],
    "correctAnswer": "Sự kết hợp"
  },
  {
    "question": "Từ \"Walked\" có nghĩa là gì?",
    "options": ["Chạy bộ", "Nhảy múa", "Đi bộ", "Ngồi nghỉ"],
    "correctAnswer": "Đi bộ"
  },
  {
    "question": "Từ \"Doctors\" có nghĩa là gì?",
    "options": ["Giáo viên", "Bác sĩ", "Kỹ sư", "Luật sư"],
    "correctAnswer": "Bác sĩ"
  },
  {
    "question": "Từ \"Excellent\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tệ hại", "Trung bình", "Tuyệt vời", "Kinh khủng"],
    "correctAnswer": "Tuyệt vời"
  },
  {
    "question": "Từ \"Apps\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ứng dụng", "Trò chơi", "Trang web", "Phần mềm"],
    "correctAnswer": "Ứng dụng"
  },
  {
    "question": "Từ \"Photo\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Video", "Ảnh", "Bản đồ", "Tài liệu"],
    "correctAnswer": "Ảnh"
  },
  {
    "question": "Từ \"Appear\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Biến mất", "Xuất hiện", "Ẩn nấp", "Di chuyển"],
    "correctAnswer": "Xuất hiện"
  },
  {
    "question": "Từ \"Trained\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mới", "Học", "Huấn luyện", "Phát triển"],
    "correctAnswer": "Huấn luyện"
  },
  {
    "question": "Từ \"Arm\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đầu", "Chân", "Cánh tay", "Tay chân"],
    "correctAnswer": "Cánh tay"
  },
  {
    "question": "Từ \"Confident\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lo lắng", "Tự tin", "Sợ hãi", "Nhút nhát"],
    "correctAnswer": "Tự tin"
  },
  {
    "question": "Từ \"Upper\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dưới", "Bên cạnh", "Trên", "Trong"],
    "correctAnswer": "Trên"
  },
  {
    "question": "Từ \"Losing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chiến thắng", "Thua cuộc", "Bắt đầu", "Kết thúc"],
    "correctAnswer": "Thua cuộc"
  },
  {
    "question": "Từ \"Yellow\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Màu xanh", "Màu đỏ", "Màu vàng", "Màu đen"],
    "correctAnswer": "Màu vàng"
  },
  {
    "question": "Từ \"Pulled\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đẩy", "Kéo", "Nhấc", "Đưa"],
    "correctAnswer": "Kéo"
  },
  {
    "question": "Từ \"Club\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhóm", "Câu lạc bộ", "Nhà hàng", "Thư viện"],
    "correctAnswer": "Câu lạc bộ"
  },
  {
    "question": "Từ \"Figured\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Biết", "Bỏ qua", "Suy luận", "Quên"],
    "correctAnswer": "Suy luận"
  },
  {
    "question": "Từ \"Poverty\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giàu có", "Thịnh vượng", "Nghèo đói", "Trung lưu"],
    "correctAnswer": "Nghèo đói"
  },
  {
    "question": "Từ \"Academy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trường đại học", "Học viện", "Thư viện", "Sân vận động"],
    "correctAnswer": "Học viện"
  },
  {
    "question": "Từ \"Diet\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chế độ ăn kiêng", "Thể thao", "Nghỉ ngơi", "Làm việc"],
    "correctAnswer": "Chế độ ăn kiêng"
  },
  {
    "question": "Từ \"Zoom\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phóng to", "Thu nhỏ", "Xoay", "Dời"],
    "correctAnswer": "Phóng to"
  },
  {
    "question": "Từ \"France\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ý", "Đức", "Pháp", "Tây Ban Nha"],
    "correctAnswer": "Pháp"
  },
  {
    "question": "Từ \"Load\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tải", "Nhỏ", "Nặng", "Xếp"],
    "correctAnswer": "Tải"
  },
  {
    "question": "Từ \"Fat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Gầy", "Béo", "Khỏe", "Nhanh"],
    "correctAnswer": "Béo"
  },
  {
    "question": "Từ \"Generations\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hành trình", "Thế hệ", "Cách mạng", "Di sản"],
    "correctAnswer": "Thế hệ"
  },
  {
    "question": "Từ \"Offering\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lời mời", "Sự dâng hiến", "Món quà", "Sự hy sinh"],
    "correctAnswer": "Sự dâng hiến"
  },
  {
    "question": "Từ \"Stream\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Con sông", "Dòng suối", "Luồng dữ liệu", "Tiếng nói"],
    "correctAnswer": "Dòng suối"
  },
  {
    "question": "Từ \"Broke\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bị vỡ", "Được chia ra", "Phá sản", "Hư hỏng"],
    "correctAnswer": "Bị vỡ"
  },
  {
    "question": "Từ \"Initially\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sau này", "Ban đầu", "Cuối cùng", "Trước đây"],
    "correctAnswer": "Ban đầu"
  },
  {
    "question": "Từ \"Dogs\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chó", "Mèo", "Gấu", "Thỏ"],
    "correctAnswer": "Chó"
  },
  {
    "question": "Từ \"Wrap\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mở ra", "Gói lại", "Đập phá", "Vỡ ra"],
    "correctAnswer": "Gói lại"
  },
  {
    "question": "Từ \"Metal\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Gỗ", "Nhựa", "Kim loại", "Vải"],
    "correctAnswer": "Kim loại"
  },
  {
    "question": "Từ \"Philosophy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Triết học", "Khoa học", "Nghệ thuật", "Văn học"],
    "correctAnswer": "Triết học"
  },
  {
    "question": "Từ \"Hire\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bán", "Thuê", "Sửa chữa", "Mua"],
    "correctAnswer": "Thuê"
  },
  {
    "question": "Từ \"Absolute\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tuyệt đối", "Tạm thời", "Phần lớn", "Liên tục"],
    "correctAnswer": "Tuyệt đối"
  },
  {
    "question": "Từ \"Wine\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nước ngọt", "Rượu vang", "Trà", "Cà phê"],
    "correctAnswer": "Rượu vang"
  },
  {
    "question": "Từ \"September\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Sáu", "Tháng Tám", "Tháng Chín", "Tháng Mười"],
    "correctAnswer": "Tháng Chín"
  },
  {
    "question": "Từ \"Empty\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đầy", "Trống", "Sống động", "Rộn rã"],
    "correctAnswer": "Trống"
  },
  {
    "question": "Từ \"Underneath\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trên", "Bên trong", "Dưới", "Ngoài"],
    "correctAnswer": "Dưới"
  },
  {
    "question": "Từ \"Stem\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lá", "Thân", "Hoa", "Rễ"],
    "correctAnswer": "Thân"
  },
  {
    "question": "Từ \"Kitchen\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phòng khách", "Nhà bếp", "Phòng ngủ", "Phòng ăn"],
    "correctAnswer": "Nhà bếp"
  },
  {
    "question": "Từ \"Noise\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Âm nhạc", "Tiếng ồn", "Sự im lặng", "Tiếng nói"],
    "correctAnswer": "Tiếng ồn"
  },
  {
    "question": "Từ \"Refer\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tham khảo", "Viết ra", "Nói chuyện", "Đếm số"],
    "correctAnswer": "Tham khảo"
  },
  {
    "question": "Từ \"Northern\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Miền Nam", "Miền Bắc", "Miền Trung", "Miền Đông"],
    "correctAnswer": "Miền Bắc"
  },
  {
    "question": "Từ \"Boat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xe hơi", "Thuyền", "Máy bay", "Tàu hỏa"],
    "correctAnswer": "Thuyền"
  },
  {
    "question": "Từ \"Legacy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Di sản", "Tiền điện tử", "Đổi mới", "Kế thừa"],
    "correctAnswer": "Di sản"
  },
  {
    "question": "Từ \"Automatically\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tự động", "Chậm chạp", "Bất ngờ", "Tinh tế"],
    "correctAnswer": "Tự động"
  },
  {
    "question": "Từ \"Novel\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kịch bản", "Tiểu thuyết", "Hồi ký", "Thơ ca"],
    "correctAnswer": "Tiểu thuyết"
  },
  {
    "question": "Từ \"Introduction\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giới thiệu", "Kết thúc", "Phụ lục", "Thảo luận"],
    "correctAnswer": "Giới thiệu"
  },
  {
    "question": "Từ \"Falling\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bay lên", "Rơi xuống", "Đi bộ", "Chạy"],
    "correctAnswer": "Rơi xuống"
  },
  {
    "question": "Từ \"Privilege\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đặc quyền", "Hạn chế", "Nghiệp vụ", "Cơ hội"],
    "correctAnswer": "Đặc quyền"
  },
  {
    "question": "Từ \"Wisdom\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự thông minh", "Sự khôn ngoan", "Sự dại khờ", "Sự giàu có"],
    "correctAnswer": "Sự khôn ngoan"
  },
  {
    "question": "Từ \"Biology\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hóa học", "Sinh học", "Vật lý", "Địa lý"],
    "correctAnswer": "Sinh học"
  },
  {
    "question": "Từ \"Expectations\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngạc nhiên", "Kỳ vọng", "Hành động", "Tiêu chuẩn"],
    "correctAnswer": "Kỳ vọng"
  },
  {
    "question": "Từ \"Inner\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bên ngoài", "Bên trong", "Trung tâm", "Đầu tiên"],
    "correctAnswer": "Bên trong"
  },
  {
    "question": "Từ \"July\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám"],
    "correctAnswer": "Tháng Bảy"
  },
  {
    "question": "Từ \"Bacteria\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Virus", "Vi khuẩn", "Nấm", "Tế bào"],
    "correctAnswer": "Vi khuẩn"
  },
  {
    "question": "Từ \"Cheese\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bánh mì", "Trứng", "Pho mát", "Sữa"],
    "correctAnswer": "Pho mát"
  },
  {
    "question": "Từ \"Missed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhớ", "Bỏ lỡ", "Gặp lại", "Bỏ qua"],
    "correctAnswer": "Bỏ lỡ"
  },
  {
    "question": "Từ \"Broader\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hẹp hơn", "Rộng hơn", "Dài hơn", "Ngắn hơn"],
    "correctAnswer": "Rộng hơn"
  },
  {
    "question": "Từ \"Walls\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cửa sổ", "Sàn nhà", "Tường", "Mái nhà"],
    "correctAnswer": "Tường"
  },
  {
    "question": "Từ \"Promote\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phớt lờ", "Cấm đoán", "Thúc đẩy", "Chỉ trích"],
    "correctAnswer": "Thúc đẩy"
  },
  {
    "question": "Từ \"Stretch\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Co lại", "Kéo dài", "Rút ngắn", "Nhún nhảy"],
    "correctAnswer": "Kéo dài"
  },
  {
    "question": "Từ \"December\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Mười Một", "Tháng Mười Hai", "Tháng Mười", "Tháng Chín"],
    "correctAnswer": "Tháng Mười Hai"
  },
  {
    "question": "Từ \"Latest\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cũ nhất", "Mới nhất", "Trung bình", "Lâu đời"],
    "correctAnswer": "Mới nhất"
  },
  {
    "question": "Từ \"Angry\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vui vẻ", "Buồn", "Tức giận", "Ngạc nhiên"],
    "correctAnswer": "Tức giận"
  },
  {
    "question": "Từ \"London\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thủ đô của Pháp", "Thành phố New York", "Luân Đôn", "Tokyo"],
    "correctAnswer": "Luân Đôn"
  },
  {
    "question": "Từ \"Flip\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lật", "Ném", "Xoay", "Chạy"],
    "correctAnswer": "Lật"
  },
  {
    "question": "Từ \"Immune\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dễ bị bệnh", "Miễn dịch", "Độc hại", "Yếu ớt"],
    "correctAnswer": "Miễn dịch"
  },
  {
    "question": "Từ \"Childhood\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tuổi trẻ", "Tuổi trưởng thành", "Thời thơ ấu", "Tuổi già"],
    "correctAnswer": "Thời thơ ấu"
  },
  {
    "question": "Từ \"Spectrum\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nguyên nhân", "Quang cảnh", "Âm lượng", "Phổ"],
    "correctAnswer": "Phổ"
  },
  {
    "question": "Từ \"Cute\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đáng sợ", "Dễ thương", "Xinh đẹp", "Thông minh"],
    "correctAnswer": "Dễ thương"
  },
  {
    "question": "Từ \"Coverage\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bao phủ", "Chi phí", "Khoảng cách", "Dịch vụ"],
    "correctAnswer": "Bao phủ"
  },
  {
    "question": "Từ \"Vulnerable\" trong tiếng Anh có nghĩa là gì?",
    "options": ["An toàn", "Bảo vệ", "Dễ bị tổn thương", "Mạnh mẽ"],
    "correctAnswer": "Dễ bị tổn thương"
  },
  {
    "question": "Từ \"Doors\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cửa", "Cửa sổ", "Tường", "Sân"],
    "correctAnswer": "Cửa"
  },
  {
    "question": "Từ \"Minister\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thủ tướng", "Bộ trưởng", "Tổng thống", "Thị trưởng"],
    "correctAnswer": "Bộ trưởng"
  },
  {
    "question": "Từ \"Plastic\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Gỗ", "Kim loại", "Nhựa", "Vải"],
    "correctAnswer": "Nhựa"
  },
  {
    "question": "Từ \"Scary\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đáng sợ", "Dễ thương", "Hài hước", "Vui vẻ"],
    "correctAnswer": "Đáng sợ"
  },
  {
    "question": "Từ \"Replace\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giữ lại", "Thay thế", "Bỏ qua", "Lặp lại"],
    "correctAnswer": "Thay thế"
  },
  {
    "question": "Từ \"Saving\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiêu xài", "Tiết kiệm", "Đầu tư", "Chi tiêu"],
    "correctAnswer": "Tiết kiệm"
  },
  {
    "question": "Từ \"Traveling\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Du lịch", "Ở nhà", "Làm việc", "Học tập"],
    "correctAnswer": "Du lịch"
  },
  {
    "question": "Từ \"Engineers\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghệ sĩ", "Nhà khoa học", "Kỹ sư", "Giáo viên"],
    "correctAnswer": "Kỹ sư"
  },
  {
    "question": "Từ \"Acid\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bazơ", "Axit", "Muối", "Nước giải khát"],
    "correctAnswer": "Axit"
  },
  {
    "question": "Từ \"November\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Mười", "Tháng Mười Hai", "Tháng Mười Một", "Tháng Chín"],
    "correctAnswer": "Tháng Mười Một"
  },
  {
    "question": "Từ \"Associate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tách rời", "Liên kết", "Cắt", "Bỏ qua"],
    "correctAnswer": "Liên kết"
  },
  {
    "question": "Từ \"Programming\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Học tập", "Nấu ăn", "Lập trình", "Viết lách"],
    "correctAnswer": "Lập trình"
  },
  {
    "question": "Từ \"Bread\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bánh mì", "Nước", "Sữa", "Trứng"],
    "correctAnswer": "Bánh mì"
  },
  {
    "question": "Từ \"Repeat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xóa", "Tạm dừng", "Lặp lại", "Thay đổi"],
    "correctAnswer": "Lặp lại"
  },
  {
    "question": "Từ \"Acknowledge\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phủ nhận", "Nhận ra", "Thừa nhận", "Bỏ qua"],
    "correctAnswer": "Thừa nhận"
  },
  {
    "question": "Từ \"Risks\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lợi ích", "Rủi ro", "Thành công", "Thách thức"],
    "correctAnswer": "Rủi ro"
  },
  {
    "question": "Từ \"Farmers\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thợ xây", "Nông dân", "Giáo viên", "Bác sĩ"],
    "correctAnswer": "Nông dân"
  },
  {
    "question": "Từ \"Proper\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sai sót", "Không đúng", "Phù hợp", "Kém cỏi"],
    "correctAnswer": "Phù hợp"
  },
  {
    "question": "Từ \"Resolution\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mục tiêu", "Sự rời bỏ", "Giải pháp", "Nỗi buồn"],
    "correctAnswer": "Giải pháp"
  },
  {
    "question": "Từ \"Experiments\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thí nghiệm", "Lý thuyết", "Khoa học", "Bài học"],
    "correctAnswer": "Thí nghiệm"
  },
  {
    "question": "Từ \"Figures\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Con số", "Hình vẽ", "Âm thanh", "Từ ngữ"],
    "correctAnswer": "Con số"
  },
  {
    "question": "Từ \"Molecules\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phân tử", "Nguyên tử", "Hạt nhân", "Tế bào"],
    "correctAnswer": "Phân tử"
  },
  {
    "question": "Từ \"Naturally\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhân tạo", "Tự nhiên", "Giả tạo", "Ngoại lai"],
    "correctAnswer": "Tự nhiên"
  },
  {
    "question": "Từ \"Favor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ghét", "Ưa thích", "Phớt lờ", "Sợ hãi"],
    "correctAnswer": "Ưa thích"
  },
  {
    "question": "Từ \"Enemy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bạn", "Kẻ thù", "Đồng minh", "Người quen"],
    "correctAnswer": "Kẻ thù"
  },
  {
    "question": "Từ \"Flavor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hương vị", "Mùi hương", "Âm thanh", "Hình dáng"],
    "correctAnswer": "Hương vị"
  },
  {
    "question": "Từ \"Output\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đầu vào", "Đầu ra", "Trung gian", "Kết quả"],
    "correctAnswer": "Đầu ra"
  },
  {
    "question": "Từ \"Horse\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngựa", "Heo", "Chó", "Mèo"],
    "correctAnswer": "Ngựa"
  },
  {
    "question": "Từ \"Stable\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chuồng ngựa", "Tòa nhà", "Nhà hàng", "Sân chơi"],
    "correctAnswer": "Chuồng ngựa"
  },
  {
    "question": "Từ \"October\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tháng Một", "Tháng Mười", "Tháng Chín", "Tháng Hai"],
    "correctAnswer": "Tháng Mười"
  },
  {
    "question": "Từ “Discovery” có nghĩa là gì?",
    "options": ["Sự phát triển", "Sự khám phá", "Sự hủy diệt", "Sự hoài nghi"],
    "correctAnswer": "Sự khám phá"
  },
  {
    "question": "Từ “Scared” có nghĩa là gì?",
    "options": ["Hạnh phúc", "Sợ hãi", "Bình tĩnh", "Mệt mỏi"],
    "correctAnswer": "Sợ hãi"
  },
  {
    "question": "Từ “Highlight” có nghĩa là gì?",
    "options": ["Làm mờ đi", "Nổi bật", "Bỏ qua", "Giảm nhẹ"],
    "correctAnswer": "Nổi bật"
  },
  {
    "question": "Từ “Raising” có nghĩa là gì?",
    "options": ["Hạ thấp", "Giảm bớt", "Nâng lên", "Phân chia"],
    "correctAnswer": "Nâng lên"
  },
  {
    "question": "Từ “Linear” có nghĩa là gì?",
    "options": ["Hình tròn", "Tuyến tính", "Góc nghiêng", "Bất quy tắc"],
    "correctAnswer": "Tuyến tính"
  },
  {
    "question": "Từ “Contribute” có nghĩa là gì?",
    "options": ["Cản trở", "Đóng góp", "Phá hủy", "Lấy đi"],
    "correctAnswer": "Đóng góp"
  },
  {
    "question": "Từ “Eastern” có nghĩa là gì?",
    "options": ["Miền Nam", "Miền Tây", "Miền Đông", "Miền Bắc"],
    "correctAnswer": "Miền Đông"
  },
  {
    "question": "Từ “Mail” thường được hiểu là gì?",
    "options": ["Thư", "Điện thoại", "Xe hơi", "Máy tính"],
    "correctAnswer": "Thư"
  },
  {
    "question": "Từ “Producing” có nghĩa là gì?",
    "options": ["Hủy hoại", "Sản xuất", "Thu thập", "Lưu trữ"],
    "correctAnswer": "Sản xuất"
  },
  {
    "question": "Từ “Pure” có nghĩa là gì?",
    "options": ["Nhân tạo", "Tinh khiết", "Hỗn hợp", "Rối rắm"],
    "correctAnswer": "Tinh khiết"
  },
  {
    "question": "Từ “Considering” có nghĩa là gì?",
    "options": ["Bỏ qua", "Xem xét", "Giữ lại", "Chỉ trích"],
    "correctAnswer": "Xem xét"
  },
  {
    "question": "Từ “Technique” có nghĩa là gì?",
    "options": ["Kỹ thuật", "Học tập", "Thảo luận", "Tình huống"],
    "correctAnswer": "Kỹ thuật"
  },
  {
    "question": "Từ “Staying” có nghĩa là gì?",
    "options": ["Rời đi", "Ở lại", "Bắt đầu", "Kết thúc"],
    "correctAnswer": "Ở lại"
  },
  {
    "question": "Từ “Increases” có nghĩa là gì?",
    "options": ["Giảm xuống", "Tăng lên", "Ổn định", "Biến mất"],
    "correctAnswer": "Tăng lên"
  },
  {
    "question": "Từ “Laid” có nghĩa là gì?",
    "options": ["Đặt xuống", "Nâng lên", "Cầm", "Bỏ qua"],
    "correctAnswer": "Đặt xuống"
  },
  {
    "question": "Từ “August” có thể hiểu theo nghĩa nào dưới đây?",
    "options": ["Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10"],
    "correctAnswer": "Tháng 8"
  },
  {
    "question": "Từ “Properly” có nghĩa là gì?",
    "options": ["Đúng cách", "Sai cách", "Nhanh chóng", "Chậm chạp"],
    "correctAnswer": "Đúng cách"
  },
  {
    "question": "Từ “Offers” có nghĩa là gì?",
    "options": ["Từ chối", "Cung cấp", "Xóa bỏ", "Giấu đi"],
    "correctAnswer": "Cung cấp"
  },
  {
    "question": "Từ “Discover” có nghĩa là gì?",
    "options": ["Khám phá", "Phá hủy", "Che giấu", "Xác nhận"],
    "correctAnswer": "Khám phá"
  },
  {
    "question": "Từ “Finance” có nghĩa là gì?",
    "options": ["Văn hóa", "Tài chính", "Giáo dục", "Y tế"],
    "correctAnswer": "Tài chính"
  },
  {
    "question": "Từ \"Tested\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chưa thử", "Đã thử", "Bỏ qua", "Đang thử"],
    "correctAnswer": "Đã thử"
  },
  {
    "question": "Từ \"Impacts\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tác động", "Phản ứng", "Giải pháp", "Hệ quả"],
    "correctAnswer": "Tác động"
  },
  {
    "question": "Từ \"Leg\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cánh", "Chân", "Đầu", "Tay"],
    "correctAnswer": "Chân"
  },
  {
    "question": "Từ \"Physically\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tinh thần", "Thể xác", "Về mặt thể chất", "Về mặt tâm lý"],
    "correctAnswer": "Về mặt thể chất"
  },
  {
    "question": "Từ \"Cat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Con chó", "Con mèo", "Con cá", "Con chim"],
    "correctAnswer": "Con mèo"
  },
  {
    "question": "Từ \"Lens\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Gương", "Mắt kính", "Thấu kính", "Khung ảnh"],
    "correctAnswer": "Thấu kính"
  },
  {
    "question": "Từ \"Soldiers\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thủy thủ", "Lính", "Chiến lược gia", "Công binh"],
    "correctAnswer": "Lính"
  },
  {
    "question": "Từ \"Placed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Được lấy ra", "Được xếp đặt", "Được đặt", "Được phá hủy"],
    "correctAnswer": "Được đặt"
  },
  {
    "question": "Từ \"Carefully\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cẩn thận", "Nhanh chóng", "Một cách ngẫu nhiên", "Lạnh lùng"],
    "correctAnswer": "Cẩn thận"
  },
  {
    "question": "Từ \"Divide\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tăng", "Chia", "Hợp nhất", "Giảm"],
    "correctAnswer": "Chia"
  },
  {
    "question": "Từ \"Hanging\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Treo", "Ngồi", "Nằm", "Chạy"],
    "correctAnswer": "Treo"
  },
  {
    "question": "Từ \"Cup\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ly", "Chén", "Cốc", "Bình"],
    "correctAnswer": "Cốc"
  },
  {
    "question": "Từ \"Podcast\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bản tin truyền hình", "Chương trình phát thanh qua Internet", "Sách nói", "Video clip"],
    "correctAnswer": "Chương trình phát thanh qua Internet"
  },
  {
    "question": "Từ \"Exposed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bị ẩn", "Bị bảo vệ", "Bị che giấu", "Bị lộ"],
    "correctAnswer": "Bị lộ"
  },
  {
    "question": "Từ \"Consumers\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhà sản xuất", "Người bán hàng", "Người tiêu dùng", "Người mua bán"],
    "correctAnswer": "Người tiêu dùng"
  },
  {
    "question": "Từ \"Vast\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hẹp", "Nhỏ bé", "Rộng lớn", "Hạn chế"],
    "correctAnswer": "Rộng lớn"
  },
  {
    "question": "Từ \"Formed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phá hủy", "Hủy bỏ", "Được hình thành", "Được chia nhỏ"],
    "correctAnswer": "Được hình thành"
  },
  {
    "question": "Từ \"Likes\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ghét", "Thích", "Để ý", "Quên"],
    "correctAnswer": "Thích"
  },
  {
    "question": "Từ \"Studied\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã bỏ qua", "Đã đọc", "Đã nghiên cứu", "Đã giải thích"],
    "correctAnswer": "Đã nghiên cứu"
  },
  {
    "question": "Từ \"Portion\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Toàn bộ", "Phần", "Đoạn văn", "Khoảng cách"],
    "correctAnswer": "Phần"
  },
  {
    "question": "Từ “Ring” trong tiếng Anh có nghĩa là gì?",
    "options": ["Loa", "Dây", "Nhẫn", "Bánh"],
    "correctAnswer": "Nhẫn"
  },
  {
    "question": "Từ “Located” trong tiếng Anh có nghĩa là gì?",
    "options": ["Di chuyển", "Tìm kiếm", "Nằm ở", "Phát hiện"],
    "correctAnswer": "Nằm ở"
  },
  {
    "question": "Từ “Computers” trong tiếng Anh có nghĩa là gì?",
    "options": ["Điện thoại", "Máy in", "Máy tính", "Tivi"],
    "correctAnswer": "Máy tính"
  },
  {
    "question": "Từ “Properties” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hành động", "Sự kiện", "Đặc tính", "Giá trị"],
    "correctAnswer": "Đặc tính"
  },
  {
    "question": "Từ “Database” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tài liệu", "Hệ thống", "Cơ sở dữ liệu", "Mạng máy tính"],
    "correctAnswer": "Cơ sở dữ liệu"
  },
  {
    "question": "Từ “Represents” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phản ánh", "So sánh", "Đại diện", "Thể hiện"],
    "correctAnswer": "Đại diện"
  },
  {
    "question": "Từ “Shooting” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhảy", "Chạy", "Bắn", "Hát"],
    "correctAnswer": "Bắn"
  },
  {
    "question": "Từ “Brief” trong tiếng Anh có nghĩa là gì?",
    "options": ["Rườm rà", "Phức tạp", "Ngắn gọn", "Chi tiết"],
    "correctAnswer": "Ngắn gọn"
  },
  {
    "question": "Từ “Resistance” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sức mạnh", "Hỗ trợ", "Kháng cự", "Năng lượng"],
    "correctAnswer": "Kháng cự"
  },
  {
    "question": "Từ “Accurate” trong tiếng Anh có nghĩa là gì?",
    "options": ["Mơ hồ", "Lầm lì", "Chính xác", "Gần đúng"],
    "correctAnswer": "Chính xác"
  },
  {
    "question": "Từ “Generate” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hủy bỏ", "Lặp lại", "Tạo ra", "Phá hủy"],
    "correctAnswer": "Tạo ra"
  },
  {
    "question": "Từ “Congratulations” trong tiếng Anh có nghĩa là gì?",
    "options": ["Xin lỗi", "Tạm biệt", "Chúc mừng", "Chào hỏi"],
    "correctAnswer": "Chúc mừng"
  },
  {
    "question": "Từ “Collect” trong tiếng Anh có nghĩa là gì?",
    "options": ["Phân phát", "Rải rác", "Thu thập", "Xóa bỏ"],
    "correctAnswer": "Thu thập"
  },
  {
    "question": "Từ “Positions” trong tiếng Anh có nghĩa là gì?",
    "options": ["Số lượng", "Khu vực", "Vị trí", "Kỹ năng"],
    "correctAnswer": "Vị trí"
  },
  {
    "question": "Từ “Minimum” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tối đa", "Trung bình", "Tối thiểu", "Vô hạn"],
    "correctAnswer": "Tối thiểu"
  },
  {
    "question": "Từ “Suppose” trong tiếng Anh có nghĩa là gì?",
    "options": ["Khẳng định", "Chứng minh", "Giả sử", "Phủ nhận"],
    "correctAnswer": "Giả sử"
  },
  {
    "question": "Từ “Wherever” trong tiếng Anh có nghĩa là gì?",
    "options": ["Tại đây", "Chỉ riêng", "Bất cứ nơi nào", "Cứ chừng"],
    "correctAnswer": "Bất cứ nơi nào"
  },
  {
    "question": "Từ “Failed” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành công", "Hoàn thành", "Thất bại", "Khởi đầu"],
    "correctAnswer": "Thất bại"
  },
  {
    "question": "Từ “Soft” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cứng", "Sần sùi", "Mềm mại", "Sắc bén"],
    "correctAnswer": "Mềm mại"
  },
  {
    "question": "Từ “Minds” trong tiếng Anh có nghĩa là gì?",
    "options": ["Cảm xúc", "Thân thể", "Trí óc", "Hành động"],
    "correctAnswer": "Trí óc"
  },
  {
    "question": "Từ \"Seat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cửa", "Chỗ ngồi", "Bàn", "Giường"],
    "correctAnswer": "Chỗ ngồi"
  },
  {
    "question": "Từ \"Languages\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Âm nhạc", "Ngôn ngữ", "Quốc gia", "Văn hóa"],
    "correctAnswer": "Ngôn ngữ"
  },
  {
    "question": "Từ \"Chose\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chọn", "Gửi", "Bỏ qua", "Nhận"],
    "correctAnswer": "Chọn"
  },
  {
    "question": "Từ \"Lady\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Quý bà", "Cô gái", "Nữ hoàng", "Bạn gái"],
    "correctAnswer": "Quý bà"
  },
  {
    "question": "Từ \"Bright\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tối", "Xám xịt", "Sáng", "Lạnh"],
    "correctAnswer": "Sáng"
  },
  {
    "question": "Từ \"Tips\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mẹo", "Phần thưởng", "Lợi ích", "Chỉ dẫn"],
    "correctAnswer": "Mẹo"
  },
  {
    "question": "Từ \"Fashion\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghệ thuật", "Thời trang", "Kiến trúc", "Văn học"],
    "correctAnswer": "Thời trang"
  },
  {
    "question": "Từ \"Belief\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Niềm tin", "Kinh nghiệm", "Ý kiến", "Sự lựa chọn"],
    "correctAnswer": "Niềm tin"
  },
  {
    "question": "Từ \"Everyday\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hàng ngày", "Đặc biệt", "Hiếm khi", "Cuối tuần"],
    "correctAnswer": "Hàng ngày"
  },
  {
    "question": "Từ \"Shop\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Siêu thị", "Cửa hàng", "Nhà hàng", "Khách sạn"],
    "correctAnswer": "Cửa hàng"
  },
  {
    "question": "Từ \"Sad\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vui vẻ", "Buồn", "Nổi giận", "Bất ngờ"],
    "correctAnswer": "Buồn"
  },
  {
    "question": "Từ \"Error\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành công", "Lỗi", "Cơ hội", "Bí ẩn"],
    "correctAnswer": "Lỗi"
  },
  {
    "question": "Từ \"Taxes\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiền lương", "Phí dịch vụ", "Thuế", "Học phí"],
    "correctAnswer": "Thuế"
  },
  {
    "question": "Từ \"Flying\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chạy", "Nhảy", "Bay", "Bơi"],
    "correctAnswer": "Bay"
  },
  {
    "question": "Từ \"Genetic\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Di truyền", "Tự nhiên", "Hóa học", "Vật lý"],
    "correctAnswer": "Di truyền"
  },
  {
    "question": "Từ \"Structures\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khuôn mẫu", "Cấu trúc", "Kiến trúc", "Thành phố"],
    "correctAnswer": "Cấu trúc"
  },
  {
    "question": "Từ \"Facts\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thông tin sai lệch", "Sự thật", "Truyền thuyết", "Mẹo vặt"],
    "correctAnswer": "Sự thật"
  },
  {
    "question": "Từ \"Cutting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nấu ăn", "Cắt", "Vẽ", "Sửa chữa"],
    "correctAnswer": "Cắt"
  },
  {
    "question": "Từ \"Reached\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã đạt được", "Đã bỏ qua", "Đã rời đi", "Đã quên"],
    "correctAnswer": "Đã đạt được"
  },
  {
    "question": "Từ \"Aside\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bên trong", "Bên ngoài", "Bên cạnh", "Bên trên"],
    "correctAnswer": "Bên cạnh"
  },
  {
    "question": "Từ “Letters” trong tiếng Anh có nghĩa là gì?",
    "options": ["Các con số", "Các chữ cái", "Các ký hiệu", "Các hình vẽ"],
    "correctAnswer": "Các chữ cái"
  },
  {
    "question": "Từ “Mistake” trong tiếng Anh có nghĩa là gì?",
    "options": ["Thành công", "Sai lầm", "Niềm vui", "Tài năng"],
    "correctAnswer": "Sai lầm"
  },
  {
    "question": "Từ “Runs” trong tiếng Anh có nghĩa là gì?",
    "options": ["Chạy", "Nhảy", "Bay", "Ngồi"],
    "correctAnswer": "Chạy"
  },
  {
    "question": "Từ “Typical” trong tiếng Anh có nghĩa là gì?",
    "options": ["Lạ lẫm", "Thông thường", "Hiếm gặp", "Quá mức"],
    "correctAnswer": "Thông thường"
  },
  {
    "question": "Từ “Assistance” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự cản trở", "Sự giúp đỡ", "Sự cạnh tranh", "Sự lãng phí"],
    "correctAnswer": "Sự giúp đỡ"
  },
  {
    "question": "Từ “Surprise” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự bình thường", "Sự dự đoán", "Sự ngạc nhiên", "Sự buồn bã"],
    "correctAnswer": "Sự ngạc nhiên"
  },
  {
    "question": "Từ “Lessons” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bài tập", "Bài học", "Cuốn sách", "Trò chơi"],
    "correctAnswer": "Bài học"
  },
  {
    "question": "Từ “Reported” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bị lãng quên", "Được báo cáo", "Bị bỏ qua", "Được vẽ"],
    "correctAnswer": "Được báo cáo"
  },
  {
    "question": "Từ “Strange” trong tiếng Anh có nghĩa là gì?",
    "options": ["Quen thuộc", "Lạ lẫm", "Vui vẻ", "Đơn giản"],
    "correctAnswer": "Lạ lẫm"
  },
  {
    "question": "Từ “Prove” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghi ngờ", "Chứng minh", "Phản đối", "Bỏ qua"],
    "correctAnswer": "Chứng minh"
  },
  {
    "question": "Từ “Prices” trong tiếng Anh có nghĩa là gì?",
    "options": ["Giá cả", "Sự giảm giá", "Thuế suất", "Hóa đơn"],
    "correctAnswer": "Giá cả"
  },
  {
    "question": "Từ “Enjoyed” trong tiếng Anh có nghĩa là gì?",
    "options": ["Ghét bỏ", "Yêu thích", "Bỏ qua", "Lo lắng"],
    "correctAnswer": "Yêu thích"
  },
  {
    "question": "Từ “Measures” trong tiếng Anh có nghĩa là gì?",
    "options": ["Các đơn vị", "Các biện pháp", "Các số liệu", "Các điều kiện"],
    "correctAnswer": "Các biện pháp"
  },
  {
    "question": "Từ “Advance” trong tiếng Anh có nghĩa là gì?",
    "options": ["Lùi lại", "Tiến lên", "Dừng lại", "Ngừng nghỉ"],
    "correctAnswer": "Tiến lên"
  },
  {
    "question": "Từ “Creation” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự hủy hoại", "Sự sáng tạo", "Sự sao chép", "Sự bắt chước"],
    "correctAnswer": "Sự sáng tạo"
  },
  {
    "question": "Từ “Entirely” trong tiếng Anh có nghĩa là gì?",
    "options": ["Một phần", "Hoàn toàn", "Ít nhiều", "Vô cùng"],
    "correctAnswer": "Hoàn toàn"
  },
  {
    "question": "Từ “Picked” trong tiếng Anh có nghĩa là gì?",
    "options": ["Được chọn", "Bỏ qua", "Đánh bại", "Thu gom"],
    "correctAnswer": "Được chọn"
  },
  {
    "question": "Từ “Defined” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bị lãng quên", "Được định nghĩa", "Được bôi trơn", "Được xóa bỏ"],
    "correctAnswer": "Được định nghĩa"
  },
  {
    "question": "Từ “Author” trong tiếng Anh có nghĩa là gì?",
    "options": ["Biên tập viên", "Tác giả", "Độc giả", "Nhà phê bình"],
    "correctAnswer": "Tác giả"
  },
  {
    "question": "Từ “Grand” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhỏ bé", "Hùng vĩ", "Bình thường", "Kém cỏi"],
    "correctAnswer": "Hùng vĩ"
  },
  {
    "question": "Từ \"Closely\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Rộng rãi", "Gần gũi", "Xa xôi", "Cách biệt"],
    "correctAnswer": "Gần gũi"
  },
  {
    "question": "Từ \"Principles\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nguyên tắc", "Sự lãng phí", "Tính cách", "Thành phần"],
    "correctAnswer": "Nguyên tắc"
  },
  {
    "question": "Từ \"Established\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Chưa thành lập", "Được thành lập", "Không được công nhận"],
    "correctAnswer": "Được thành lập"
  },
  {
    "question": "Từ \"Probability\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xác suất", "Tính hiếm", "Sự tự do", "Phân bố"],
    "correctAnswer": "Xác suất"
  },
  {
    "question": "Từ \"Association\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Độc lập", "Liên kết", "Sự cạnh tranh", "Tự do"],
    "correctAnswer": "Liên kết"
  },
  {
    "question": "Từ \"Begins\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kết thúc", "Bắt đầu", "Tiếp tục", "Lặp lại"],
    "correctAnswer": "Bắt đầu"
  },
  {
    "question": "Từ \"Stopped\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tiếp tục", "Bắt đầu", "Dừng lại", "Tăng lên"],
    "correctAnswer": "Dừng lại"
  },
  {
    "question": "Từ \"Believed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tin rằng", "Nghi ngờ", "Lo lắng", "Khước từ"],
    "correctAnswer": "Tin rằng"
  },
  {
    "question": "Từ \"Protein\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Carbohydrate", "Chất béo", "Chất đạm", "Vitamin"],
    "correctAnswer": "Chất đạm"
  },
  {
    "question": "Từ \"Younger\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Già hơn", "Trẻ hơn", "Cao hơn", "Thông minh hơn"],
    "correctAnswer": "Trẻ hơn"
  },
  {
    "question": "Từ \"Serving\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ăn uống", "Phục vụ", "Ngủ", "Chơi"],
    "correctAnswer": "Phục vụ"
  },
  {
    "question": "Từ \"Impossible\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Có thể", "Khó khăn", "Không thể", "Thường xuyên"],
    "correctAnswer": "Không thể"
  },
  {
    "question": "Từ \"Essential\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Không cần thiết", "Quan trọng", "Phụ", "Tạm thời"],
    "correctAnswer": "Quan trọng"
  },
  {
    "question": "Từ \"Liked\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ghét", "Được ưa thích", "Bỏ qua", "Không thích"],
    "correctAnswer": "Được ưa thích"
  },
  {
    "question": "Từ \"Russian\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nga", "Hoa Kỳ", "Pháp", "Nhật Bản"],
    "correctAnswer": "Nga"
  },
  {
    "question": "Từ \"Followed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Phớt lờ", "Theo sau", "Thách thức"],
    "correctAnswer": "Theo sau"
  },
  {
    "question": "Từ \"Increasing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giảm dần", "Tăng lên", "Không đổi", "Biến mất"],
    "correctAnswer": "Tăng lên"
  },
  {
    "question": "Từ \"Funds\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nợ nần", "Quỹ", "Vay mượn", "Chi phí"],
    "correctAnswer": "Quỹ"
  },
  {
    "question": "Từ \"Expression\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Toán học", "Diễn đạt", "Ký hiệu", "Sự im lặng"],
    "correctAnswer": "Diễn đạt"
  },
  {
    "question": "Từ \"Client\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đối tác", "Đối thủ", "Khách hàng", "Nhân viên"],
    "correctAnswer": "Khách hàng"
  },
  {
    "question": "Từ \"Causes\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lời khen", "Nguyên nhân", "Kết quả", "Sự trùng hợp"],
    "correctAnswer": "Nguyên nhân"
  },
  {
    "question": "Từ \"Understood\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nói", "Học", "Chạy", "Hiểu"],
    "correctAnswer": "Hiểu"
  },
  {
    "question": "Từ \"Existing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tồn tại", "Phát triển", "Bị lãng quên", "Hủy diệt"],
    "correctAnswer": "Tồn tại"
  },
  {
    "question": "Từ \"Keeps\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giữ", "Mua", "Đổi", "Buông bỏ"],
    "correctAnswer": "Giữ"
  },
  {
    "question": "Từ \"Remain\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Biến mất", "Đổi mới", "Còn lại", "Thay đổi"],
    "correctAnswer": "Còn lại"
  },
  {
    "question": "Từ \"Relevant\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngẫu nhiên", "Liên quan", "Vô nghĩa", "Không liên quan"],
    "correctAnswer": "Liên quan"
  },
  {
    "question": "Từ \"Supporting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cản trở", "Bỏ qua", "Hỗ trợ", "Thách thức"],
    "correctAnswer": "Hỗ trợ"
  },
  {
    "question": "Từ \"Joy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Niềm vui", "Nỗi buồn", "Sự tức giận", "Sự lo lắng"],
    "correctAnswer": "Niềm vui"
  },
  {
    "question": "Từ \"Selling\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mua sắm", "Trao đổi", "Bán hàng", "Thu thập"],
    "correctAnswer": "Bán hàng"
  },
  {
    "question": "Từ \"Caught\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chạy", "Bắt", "Xem", "Lắng nghe"],
    "correctAnswer": "Bắt"
  },
  {
    "question": "Từ \"Turning\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chạy", "Nhảy", "Quay", "Ngồi"],
    "correctAnswer": "Quay"
  },
  {
    "question": "Từ \"Situations\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tình huống", "Mối quan hệ", "Giải pháp", "Sự nhầm lẫn"],
    "correctAnswer": "Tình huống"
  },
  {
    "question": "Từ \"Studying\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Làm việc", "Nghỉ ngơi", "Học tập", "Ăn uống"],
    "correctAnswer": "Học tập"
  },
  {
    "question": "Từ \"Inspired\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Làm buồn", "Truyền cảm hứng", "Làm mất năng lượng", "Xấu hổ"],
    "correctAnswer": "Truyền cảm hứng"
  },
  {
    "question": "Từ \"Seriously\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghiêm túc", "Vui vẻ", "Hài hước", "Thoải mái"],
    "correctAnswer": "Nghiêm túc"
  },
  {
    "question": "Từ \"Sports\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nghệ thuật", "Thể thao", "Văn học", "Âm nhạc"],
    "correctAnswer": "Thể thao"
  },
  {
    "question": "Từ \"Communicate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chỉ trích", "Im lặng", "Giao tiếp", "Phớt lờ"],
    "correctAnswer": "Giao tiếp"
  },
  {
    "question": "Từ \"Frame\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Màn hình", "Khung", "Hình ảnh", "Khuôn"],
    "correctAnswer": "Khung"
  },
  {
    "question": "Từ \"Choices\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự lựa chọn", "Sự nhầm lẫn", "Sự thay đổi", "Sự cố"],
    "correctAnswer": "Sự lựa chọn"
  },
  {
    "question": "Từ \"Courses\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Các khóa học", "Các chuyến đi", "Các món ăn", "Các cửa hàng"],
    "correctAnswer": "Các khóa học"
  },
  {
    "question": "Từ \"Finished\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bắt đầu", "Hoàn thành", "Bỏ dở", "Sai lầm"],
    "correctAnswer": "Hoàn thành"
  },
  {
    "question": "Từ \"Article\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bài viết", "Đồng phục", "Thành phố", "Vật dụng"],
    "correctAnswer": "Bài viết"
  },
  {
    "question": "Từ \"Tests\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kiểm tra", "Món ăn", "Học bổng", "Sách"],
    "correctAnswer": "Kiểm tra"
  },
  {
    "question": "Từ \"Drink\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ăn", "Uống", "Ngủ", "Nói"],
    "correctAnswer": "Uống"
  },
  {
    "question": "Từ \"Threat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mối quan tâm", "Đe dọa", "Hòa bình", "Lời khen"],
    "correctAnswer": "Đe dọa"
  },
  {
    "question": "Từ \"Bought\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã bán", "Đã mua", "Đã cho", "Đã lấy"],
    "correctAnswer": "Đã mua"
  },
  {
    "question": "Từ \"Continued\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dừng lại", "Tiếp tục", "Quay lại", "Bắt đầu"],
    "correctAnswer": "Tiếp tục"
  },
  {
    "question": "Từ \"Pray\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cầu nguyện", "Ca hát", "Đọc", "Nói"],
    "correctAnswer": "Cầu nguyện"
  },
  {
    "question": "Từ \"Colors\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Số đếm", "Âm nhạc", "Màu sắc", "Động vật"],
    "correctAnswer": "Màu sắc"
  },
  {
    "question": "Từ \"Democracy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nền độc tài", "Nền dân chủ", "Chế độ phong kiến", "Nền kinh tế"],
    "correctAnswer": "Nền dân chủ"
  },
  {
    "question": "Từ \"Historical\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hiện đại", "Tương lai", "Lịch sử", "Hư cấu"],
    "correctAnswer": "Lịch sử"
  },
  {
    "question": "Từ \"Afternoon\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Buổi sáng", "Buổi tối", "Buổi trưa", "Buổi chiều"],
    "correctAnswer": "Buổi chiều"
  },
  {
    "question": "Từ \"Equals\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Không bằng", "Bằng", "Khác", "Nhiều hơn"],
    "correctAnswer": "Bằng"
  },
  {
    "question": "Từ \"Researchers\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhà nghiên cứu", "Sinh viên", "Thợ xây", "Người bán hàng"],
    "correctAnswer": "Nhà nghiên cứu"
  },
  {
    "question": "Từ \"Prior\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sau", "Trước", "Bên cạnh", "Giữa"],
    "correctAnswer": "Trước"
  },
  {
    "question": "Từ \"Conflict\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hòa hợp", "Xung đột", "Sự kiện", "Kết thúc"],
    "correctAnswer": "Xung đột"
  },
  {
    "question": "Từ \"Institute\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trường học", "Viện", "Công ty", "Cửa hàng"],
    "correctAnswer": "Viện"
  },
  {
    "question": "Từ \"Stuck\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Di chuyển", "Rời đi", "Mắc kẹt", "Tự do"],
    "correctAnswer": "Mắc kẹt"
  },
  {
    "question": "Từ \"Top\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dưới", "Giữa", "Đỉnh", "Cuối"],
    "correctAnswer": "Đỉnh"
  },
  {
    "question": "Từ \"Reports\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thông báo", "Bài hát", "Báo cáo", "Quảng cáo"],
    "correctAnswer": "Báo cáo"
  },
  {
    "question": "Từ \"Grant\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cho phép", "Từ chối", "Mượn", "Trả lại"],
    "correctAnswer": "Cho phép"
  },
  {
    "question": "Từ \"Sources\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Điểm đến", "Nguồn", "Chương trình", "Kết quả"],
    "correctAnswer": "Nguồn"
  },
  {
    "question": "Từ \"Husband\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cha", "Anh rể", "Chồng", "Bạn trai"],
    "correctAnswer": "Chồng"
  },
  {
    "question": "Từ \"Contract\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hợp đồng", "Giấy phép", "Chứng nhận", "Quy định"],
    "correctAnswer": "Hợp đồng"
  },
  {
    "question": "Từ \"Explore\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lướt web", "Suy nghĩ", "Khám phá", "Thảo luận"],
    "correctAnswer": "Khám phá"
  },
  {
    "question": "Từ \"Initial\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cuối cùng", "Ban đầu", "Trung bình", "Kết thúc"],
    "correctAnswer": "Ban đầu"
  },
  {
    "question": "Từ \"Requires\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Yêu cầu", "Từ chối", "Cho phép", "Thử nghiệm"],
    "correctAnswer": "Yêu cầu"
  },
  {
    "question": "Từ \"Relatively\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cực kỳ", "Tương đối", "Hơn hẳn", "Tuyệt đối"],
    "correctAnswer": "Tương đối"
  },
  {
    "question": "Từ \"Gift\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Món quà", "Hóa đơn", "Phần thưởng", "Tiền lương"],
    "correctAnswer": "Món quà"
  },
  {
    "question": "Từ \"Length\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chiều rộng", "Độ dày", "Độ dài", "Trọng lượng"],
    "correctAnswer": "Độ dài"
  },
  {
    "question": "Từ \"Wearing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đang mặc", "Đang ăn", "Đang ngủ", "Đang nghe"],
    "correctAnswer": "Đang mặc"
  },
  {
    "question": "Từ \"Ran\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đã ngủ", "Đã chạy", "Đã nói", "Đã đứng"],
    "correctAnswer": "Đã chạy"
  },
  {
    "question": "Từ \"Male\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nữ giới", "Nam giới", "Trẻ em", "Người già"],
    "correctAnswer": "Nam giới"
  },
  {
    "question": "Từ \"Normally\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bất thường", "Thông thường", "Hiếm khi", "Đột ngột"],
    "correctAnswer": "Thông thường"
  },
  {
    "question": "Từ \"Differently\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tương tự", "Cùng nhau", "Khác nhau", "Đồng đều"],
    "correctAnswer": "Khác nhau"
  },
  {
    "question": "Từ \"Glad\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Buồn", "Giận dữ", "Vui mừng", "Sợ hãi"],
    "correctAnswer": "Vui mừng"
  },
  {
    "question": "Từ \"Items\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Các mục", "Các sự kiện", "Các công việc", "Các ý tưởng"],
    "correctAnswer": "Các mục"
  },
  {
    "question": "Từ \"Opened\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đóng", "Mở ra", "Đổ xăng", "Tắt máy"],
    "correctAnswer": "Mở ra"
  },
  {
    "question": "Từ \"Condition\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Điều kiện", "Quá trình", "Sự thay đổi", "Thời tiết"],
    "correctAnswer": "Điều kiện"
  },
  {
    "question": "Từ \"Honestly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nói dối", "Giấu giếm", "Thành thật", "Thô lỗ"],
    "correctAnswer": "Thành thật"
  },
  {
    "question": "Từ \"Seemed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhận ra", "Dường như", "Nói", "Hành động"],
    "correctAnswer": "Dường như"
  },
  {
    "question": "Từ \"Slightly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đột nhiên", "Một chút", "Quá mức", "Rất nhiều"],
    "correctAnswer": "Một chút"
  },
  {
    "question": "Từ \"Described\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Miêu tả", "Bỏ qua", "Giải thích", "Phớt lờ"],
    "correctAnswer": "Miêu tả"
  },
  {
    "question": "Từ \"Handle\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tay cầm", "Xử lý", "Nắm bắt", "Phản ứng"],
    "correctAnswer": "Xử lý"
  },
  {
    "question": "Từ \"Authority\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Quyền lực", "Người dân", "Tình bạn", "Đẳng cấp"],
    "correctAnswer": "Quyền lực"
  },
  {
    "question": "Từ \"Battle\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đánh đập", "Trận chiến", "Thương lượng", "Thỏa thuận"],
    "correctAnswer": "Trận chiến"
  },
  {
    "question": "Từ \"Served\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phục vụ", "Kết thúc", "Bắt đầu", "Tham gia"],
    "correctAnswer": "Phục vụ"
  },
  {
    "question": "Từ \"Characters\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Các nhân vật", "Các tính cách", "Các đoạn văn", "Các biểu tượng"],
    "correctAnswer": "Các nhân vật"
  },
  {
    "question": "Từ \"Represent\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đối xử", "Đại diện", "Diễn đạt", "Miêu tả"],
    "correctAnswer": "Đại diện"
  },
  {
    "question": "Từ \"Sorts\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kích cỡ", "Loại", "Số lượng", "Đếm"],
    "correctAnswer": "Loại"
  },
  {
    "question": "Từ \"Discovered\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Giấu kín", "Phát hiện", "Tìm kiếm"],
    "correctAnswer": "Phát hiện"
  },
  {
    "question": "Từ \"Chief\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phụ", "Hỗ trợ", "Chính", "Nhỏ"],
    "correctAnswer": "Chính"
  },
  {
    "question": "Từ \"Require\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Yêu cầu", "Cho phép", "Từ chối", "Bỏ qua"],
    "correctAnswer": "Yêu cầu"
  },
  {
    "question": "Từ \"Concern\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Quan tâm", "Bỏ qua", "Đuổi theo", "Cười"],
    "correctAnswer": "Quan tâm"
  },
  {
    "question": "Từ \"Clients\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhân viên", "Khách hàng", "Nhà cung cấp", "Đối tác"],
    "correctAnswer": "Khách hàng"
  },
  {
    "question": "Từ \"Adding\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trừ đi", "Nhân đôi", "Thêm vào", "Chia ra"],
    "correctAnswer": "Thêm vào"
  },
  {
    "question": "Từ \"Count\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đếm", "Xóa bỏ", "Cắt bỏ", "Tính toán"],
    "correctAnswer": "Đếm"
  },
  {
    "question": "Từ \"Element\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nguyên tố", "Bộ phận", "Yếu tố", "Điều kiện"],
    "correctAnswer": "Nguyên tố"
  },
  {
    "question": "Từ \"Discuss\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Thảo luận", "Giải thích", "Hỏi đáp"],
    "correctAnswer": "Thảo luận"
  },
  {
    "question": "Từ \"Promise\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lời hứa", "Từ chối", "Sự hứa hẹn", "Giao kèo"],
    "correctAnswer": "Lời hứa"
  },
  {
    "question": "Từ \"Worst\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tốt nhất", "Khá", "Tệ nhất", "Bình thường"],
    "correctAnswer": "Tệ nhất"
  },
  {
    "question": "Từ \"Covered\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Được phơi sáng", "Được bao phủ", "Bị bỏ qua", "Trống trải"],
    "correctAnswer": "Được bao phủ"
  },
  {
    "question": "Từ \"Defense\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tấn công", "Phòng thủ", "Phản ứng", "Lính canh"],
    "correctAnswer": "Phòng thủ"
  },
  {
    "question": "Từ \"Experiment\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thí nghiệm", "Dự đoán", "Sáng tạo", "Lý thuyết"],
    "correctAnswer": "Thí nghiệm"
  },
  {
    "question": "Từ \"Technical\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kỹ thuật", "Khoa học", "Tự nhiên", "Hóa học"],
    "correctAnswer": "Kỹ thuật"
  },
  {
    "question": "Từ \"Carry\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ đi", "Mang", "Bỏ lại", "Đẩy"],
    "correctAnswer": "Mang"
  },
  {
    "question": "Từ \"Apart\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chung", "Tách biệt", "Gần nhau", "Bảo vệ"],
    "correctAnswer": "Tách biệt"
  },
  {
    "question": "Từ \"Interview\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phỏng vấn", "Gặp gỡ", "Tổ chức", "Hỏi đáp"],
    "correctAnswer": "Phỏng vấn"
  },
  {
    "question": "Từ \"Lack\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thiếu hụt", "Đầy đủ", "Phong phú", "Vô hạn"],
    "correctAnswer": "Thiếu hụt"
  },
  {
    "question": "Từ \"Location\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tên gọi", "Vị trí", "Mục đích", "Khoảng cách"],
    "correctAnswer": "Vị trí"
  },
  {
    "question": "Từ \"Council\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ban giám đốc", "Hội đồng", "Bộ phận", "Tập đoàn"],
    "correctAnswer": "Hội đồng"
  },
  {
    "question": "Từ \"Intelligence\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trí tuệ", "Ngu dốt", "Hài hước", "Mơ mộng"],
    "correctAnswer": "Trí tuệ"
  },
  {
    "question": "Từ \"Innovation\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự lặp lại", "Sự đổi mới", "Sự tiêu chuẩn", "Sự cổ điển"],
    "correctAnswer": "Sự đổi mới"
  },
  {
    "question": "Từ \"Subscribe\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hủy bỏ", "Đăng nhập", "Đăng ký", "Tham gia"],
    "correctAnswer": "Đăng ký"
  },
  {
    "question": "Từ \"Supply\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cung cấp", "Tiêu thụ", "Thừa", "Tăng trưởng"],
    "correctAnswer": "Cung cấp"
  },
  {
    "question": "Từ \"Affect\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ảnh hưởng", "Bỏ qua", "Bác bỏ", "Tăng cường"],
    "correctAnswer": "Ảnh hưởng"
  },
  {
    "question": "Từ \"Acting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Học thuật", "Diễn xuất", "Sáng tác", "Kịch bản"],
    "correctAnswer": "Diễn xuất"
  },
  {
    "question": "Từ \"Bond\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kết nối", "Chia rẽ", "Tách rời", "Phá vỡ"],
    "correctAnswer": "Kết nối"
  },
  {
    "question": "Từ \"Lift\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hạ xuống", "Đẩy đi", "Nâng lên", "Kéo ra"],
    "correctAnswer": "Nâng lên"
  },
  {
    "question": "Từ \"Grown\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chưa phát triển", "Từng là trẻ con", "Đã phát triển", "Tạm dừng"],
    "correctAnswer": "Đã phát triển"
  },
  {
    "question": "Từ “Remains” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bắt đầu", "Còn lại", "Xác định", "Tăng lên"],
    "correctAnswer": "Còn lại"
  },
  {
    "question": "Từ “Puts” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đặt", "Nhặt", "Ném đi", "Mua"],
    "correctAnswer": "Đặt"
  },
  {
    "question": "Từ “Oxygen” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nitơ", "Oxy", "Carbon", "Hydro"],
    "correctAnswer": "Oxy"
  },
  {
    "question": "Từ “Sending” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhận", "Gửi", "Mượn", "Trả lại"],
    "correctAnswer": "Gửi"
  },
  {
    "question": "Từ “Beat” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đánh", "Chạy", "Ngồi", "Nói"],
    "correctAnswer": "Đánh"
  },
  {
    "question": "Từ “Dollar” trong tiếng Anh có nghĩa là gì?",
    "options": ["Đồng", "Yên", "Đô la", "Bảng Anh"],
    "correctAnswer": "Đô la"
  },
  {
    "question": "Từ “Ocean” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sông", "Hồ", "Đại dương", "Biển nhỏ"],
    "correctAnswer": "Đại dương"
  },
  {
    "question": "Từ “Engaged” trong tiếng Anh có nghĩa là gì?",
    "options": ["Rảnh rỗi", "Độc thân", "Đã đính hôn", "Thờ ơ"],
    "correctAnswer": "Đã đính hôn"
  },
  {
    "question": "Từ “Ball” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bàn", "Quả bóng", "Giày", "Mũ"],
    "correctAnswer": "Quả bóng"
  },
  {
    "question": "Từ “Importance” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự quan trọng", "Sự đơn giản", "Sự ngẫu nhiên", "Sự bất thường"],
    "correctAnswer": "Sự quan trọng"
  },
  {
    "question": "Từ “Gold” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bạc", "Đồng", "Vàng", "Sắt"],
    "correctAnswer": "Vàng"
  },
  {
    "question": "Từ “Exact” trong tiếng Anh có nghĩa là gì?",
    "options": ["Gần đúng", "Sai sót", "Chính xác", "Phỏng đoán"],
    "correctAnswer": "Chính xác"
  },
  {
    "question": "Từ “Prepared” trong tiếng Anh có nghĩa là gì?",
    "options": ["Sẵn sàng", "Bỏ mặc", "Bất ngờ", "Chậm trễ"],
    "correctAnswer": "Sẵn sàng"
  },
  {
    "question": "Từ “Stars” trong tiếng Anh có nghĩa là gì?",
    "options": ["Hành tinh", "Ngôi sao", "Tinh tú", "Mặt trăng"],
    "correctAnswer": "Ngôi sao"
  },
  {
    "question": "Từ “Catch” trong tiếng Anh có nghĩa là gì?",
    "options": ["Bắt", "Thả", "Bỏ qua", "Quên lãng"],
    "correctAnswer": "Bắt"
  },
  {
    "question": "Từ “Honest” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhanh nhẹn", "Trung thực", "Lười biếng", "Bất cẩn"],
    "correctAnswer": "Trung thực"
  },
  {
    "question": "Từ “Executive” trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhân viên thường", "Sinh viên", "Nhà điều hành", "Công nhân"],
    "correctAnswer": "Nhà điều hành"
  },
  {
    "question": "Từ “Pleasure” trong tiếng Anh có nghĩa là gì?",
    "options": ["Niềm vui", "Nỗi buồn", "Sự thất vọng", "Sự khó chịu"],
    "correctAnswer": "Niềm vui"
  },
  {
    "question": "Từ “Target” trong tiếng Anh có nghĩa là gì?",
    "options": ["Mục tiêu", "Con số", "Vùng đất", "Bản đồ"],
    "correctAnswer": "Mục tiêu"
  },
  {
    "question": "Từ “Virus” trong tiếng Anh có nghĩa là gì?",
    "options": ["Vi khuẩn", "Vi rút", "Nấm", "Sâu bệnh"],
    "correctAnswer": "Vi rút"
  },
  {
    "question": "Từ \"Artists\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhà sản xuất", "Nghệ sĩ", "Nhà phê bình", "Nhà thiết kế"],
    "correctAnswer": "Nghệ sĩ"
  },
  {
    "question": "Từ \"Environmental\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Liên quan đến thời tiết", "Liên quan đến môi trường", "Liên quan đến thực phẩm", "Liên quan đến giáo dục"],
    "correctAnswer": "Liên quan đến môi trường"
  },
  {
    "question": "Từ \"DNA\" trong tiếng Anh có nghĩ là gì?",
    "options": ["Chuỗi protein", "Gen", "Mã di truyền", "Năng lượng di truyền"],
    "correctAnswer": "Mã di truyền"
  },
  {
    "question": "Từ \"Avoid\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Tránh né", "Chấp nhận", "Tham gia"],
    "correctAnswer": "Tránh né"
  },
  {
    "question": "Từ \"Factors\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thông tin", "Yếu tố", "Điều kiện", "Lý do"],
    "correctAnswer": "Yếu tố"
  },
  {
    "question": "Từ \"Married\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Độc thân", "Ly hôn", "Kết hôn", "Hẹn hò"],
    "correctAnswer": "Kết hôn"
  },
  {
    "question": "Từ \"Opinion\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự thật", "Ý kiến", "Lời khuyên", "Tin đồn"],
    "correctAnswer": "Ý kiến"
  },
  {
    "question": "Từ \"Task\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trò chơi", "Nhiệm vụ", "Giải trí", "Nghỉ ngơi"],
    "correctAnswer": "Nhiệm vụ"
  },
  {
    "question": "Từ \"Island\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hòn đảo", "Bán đảo", "Liên lục địa", "Vùng đất nổi"],
    "correctAnswer": "Hòn đảo"
  },
  {
    "question": "Từ \"Medicine\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thực phẩm", "Y học", "Thuốc", "Phẫu thuật"],
    "correctAnswer": "Thuốc"
  },
  {
    "question": "Từ \"Solar\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Liên quan đến mặt trời", "Liên quan đến gió", "Liên quan đến nước", "Liên quan đến đất"],
    "correctAnswer": "Liên quan đến mặt trời"
  },
  {
    "question": "Từ \"Describe\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mô tả", "Phân tích", "Tóm tắt", "Giải thích"],
    "correctAnswer": "Mô tả"
  },
  {
    "question": "Từ \"Train\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xe buýt", "Tàu hỏa", "Máy bay", "Tàu thủy"],
    "correctAnswer": "Tàu hỏa"
  },
  {
    "question": "Từ \"Greatest\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kém nhất", "Trung bình", "Vĩ đại nhất", "Nhanh nhất"],
    "correctAnswer": "Vĩ đại nhất"
  },
  {
    "question": "Từ \"Identity\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Danh tính", "Bí mật", "Lời hứa", "Ý định"],
    "correctAnswer": "Danh tính"
  },
  {
    "question": "Từ \"Panel\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bảng thông báo", "Tấm vải", "Màn hình", "Ban hội thẩm"],
    "correctAnswer": "Ban hội thẩm"
  },
  {
    "question": "Từ \"Fill\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xóa", "Lấp đầy", "Tách ra", "Phủ lên"],
    "correctAnswer": "Lấp đầy"
  },
  {
    "question": "Từ \"Wondering\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Biết chắc", "Tự hỏi", "Quên lãng", "Chắc chắn"],
    "correctAnswer": "Tự hỏi"
  },
  {
    "question": "Từ \"Reaction\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hành động", "Cảm xúc", "Phản ứng", "Quan sát"],
    "correctAnswer": "Phản ứng"
  },
  {
    "question": "Từ \"Recommend\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phê bình", "Cấm đoán", "Đề xuất", "So sánh"],
    "correctAnswer": "Đề xuất"
  },
  {
    "question": "Từ \"Degrees\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Công thức", "Độ", "Quy tắc", "Bằng chứng"],
    "correctAnswer": "Độ"
  },
  {
    "question": "Từ \"Dog\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mèo", "Chó", "Vịt", "Gà"],
    "correctAnswer": "Chó"
  },
  {
    "question": "Từ \"Reduce\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tăng", "Giảm bớt", "Giữ nguyên", "Xoay tròn"],
    "correctAnswer": "Giảm bớt"
  },
  {
    "question": "Từ \"Brown\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xanh", "Đỏ", "Nâu", "Vàng"],
    "correctAnswer": "Nâu"
  },
  {
    "question": "Từ \"Edge\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cạnh", "Mặt", "Trung tâm", "Bề mặt"],
    "correctAnswer": "Cạnh"
  },
  {
    "question": "Từ \"Housing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhà ở", "Đồ ăn", "Xe cộ", "Đồ dùng"],
    "correctAnswer": "Nhà ở"
  },
  {
    "question": "Từ \"Respond\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hỏi", "Trả lời", "Xem xét", "Lặp lại"],
    "correctAnswer": "Trả lời"
  },
  {
    "question": "Từ \"Former\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hiện tại", "Tương lai", "Trước đây", "Mới"],
    "correctAnswer": "Trước đây"
  },
  {
    "question": "Từ \"Mention\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Nhắc đến", "Thảo luận", "Khen ngợi"],
    "correctAnswer": "Nhắc đến"
  },
  {
    "question": "Từ \"Bank\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngân hàng", "Cửa hàng", "Trường học", "Bệnh viện"],
    "correctAnswer": "Ngân hàng"
  },
  {
    "question": "Từ \"Foreign\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Trong nước", "Nước ngoài", "Nội địa", "Bản địa"],
    "correctAnswer": "Nước ngoài"
  },
  {
    "question": "Từ \"Carbon\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cacbon", "Cát", "Kim loại", "Nước"],
    "correctAnswer": "Cacbon"
  },
  {
    "question": "Từ \"Holy\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thiêng liêng", "Bẩn thỉu", "Bình thường", "Hài hước"],
    "correctAnswer": "Thiêng liêng"
  },
  {
    "question": "Từ \"Worse\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tốt hơn", "Xấu hơn", "Cũng được", "Bỏ qua"],
    "correctAnswer": "Xấu hơn"
  },
  {
    "question": "Từ \"Driving\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đi bộ", "Lái xe", "Bay", "Chạy bộ"],
    "correctAnswer": "Lái xe"
  },
  {
    "question": "Từ \"Round\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vuông", "Tròn", "Dài", "Ngắn"],
    "correctAnswer": "Tròn"
  },
  {
    "question": "Từ \"Distance\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khoảng cách", "Tốc độ", "Chiều cao", "Khối lượng"],
    "correctAnswer": "Khoảng cách"
  },
  {
    "question": "Từ \"Faster\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chậm hơn", "Nhanh hơn", "Lâu hơn", "Ngắn hơn"],
    "correctAnswer": "Nhanh hơn"
  },
  {
    "question": "Từ \"Regular\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thường xuyên", "Đặc biệt", "Bất thường", "Hiếm"],
    "correctAnswer": "Thường xuyên"
  },
  {
    "question": "Từ \"Laws\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Luật", "Tiểu sử", "Phim ảnh", "Sách vở"],
    "correctAnswer": "Luật"
  },
  {
    "question": "Từ \"Waiting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngủ", "Đợi", "Chạy", "Ăn"],
    "correctAnswer": "Đợi"
  },
  {
    "question": "Từ \"Primary\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chủ yếu", "Thứ yếu", "Nâng cao", "Cuối cùng"],
    "correctAnswer": "Chủ yếu"
  },
  {
    "question": "Từ \"Concerned\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bình tĩnh", "Vui vẻ", "Quan tâm", "Mệt mỏi"],
    "correctAnswer": "Quan tâm"
  },
  {
    "question": "Từ \"Models\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hình mẫu", "Sai sót", "Quy trình", "Kích thước"],
    "correctAnswer": "Hình mẫu"
  },
  {
    "question": "Từ \"Introduce\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chế tạo", "Giới thiệu", "Phá hủy", "Ngăn chặn"],
    "correctAnswer": "Giới thiệu"
  },
  {
    "question": "Từ \"Cultural\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Văn hóa", "Cơ học", "Tài chính", "Thể thao"],
    "correctAnswer": "Văn hóa"
  },
  {
    "question": "Từ \"Developing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thu nhỏ", "Phát triển", "Bỏ rơi", "Hủy diệt"],
    "correctAnswer": "Phát triển"
  },
  {
    "question": "Từ \"Brand\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hàng hiệu", "Sản phẩm lỗi", "Thương hiệu", "Quá trình sản xuất"],
    "correctAnswer": "Thương hiệu"
  },
  {
    "question": "Từ \"Comfortable\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khó chịu", "Thoải mái", "Nghiêm khắc", "Nặng nề"],
    "correctAnswer": "Thoải mái"
  },
  {
    "question": "Từ \"Complicated\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đơn giản", "Phức tạp", "Rõ ràng", "Thẳng thắn"],
    "correctAnswer": "Phức tạp"
  },
  {
    "question": "Từ \"Famous\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ẩn dật", "Nổi tiếng", "Bí mật", "Thờ ơ"],
    "correctAnswer": "Nổi tiếng"
  },
  {
    "question": "Từ \"Academic\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Học thuật", "Giải trí", "Chế tạo", "Lịch sử"],
    "correctAnswer": "Học thuật"
  },
  {
    "question": "Từ \"Weight\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chiều cao", "Cân nặng", "Tốc độ", "Khoảng cách"],
    "correctAnswer": "Cân nặng"
  },
  {
    "question": "Từ \"Advantage\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Khuyết điểm", "Thiệt hại", "Lợi thế", "Chi phí"],
    "correctAnswer": "Lợi thế"
  },
  {
    "question": "Từ \"Doctor\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bác sĩ", "Giáo viên", "Kỹ sư", "Nhà báo"],
    "correctAnswer": "Bác sĩ"
  },
  {
    "question": "Từ \"Peace\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chiến tranh", "Hòa bình", "Xung đột", "Hỗn loạn"],
    "correctAnswer": "Hòa bình"
  },
  {
    "question": "Từ \"Direct\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Gián tiếp", "Trực tiếp", "Lẩn trốn", "Chậm rãi"],
    "correctAnswer": "Trực tiếp"
  },
  {
    "question": "Từ \"Balance\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mất cân bằng", "Cân bằng", "Sai lệch", "Phân chia"],
    "correctAnswer": "Cân bằng"
  },
  {
    "question": "Từ \"Foods\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thức ăn", "Đồ uống", "Món tráng miệng", "Nước giải khát"],
    "correctAnswer": "Thức ăn"
  },
  {
    "question": "Từ \"Attempt\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Thất bại", "Cố gắng", "Ngừng lại", "Đột nhiên"],
    "correctAnswer": "Cố gắng"
  },
  {
    "question": "Từ \"Affordable\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giá cả phải chăng", "Sang trọng", "Cao cấp", "Đắt đỏ"],
    "correctAnswer": "Giá cả phải chăng"
  },
  {
    "question": "Từ \"Brothers\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bạn bè", "Anh chị em", "Anh em", "Ông bà"],
    "correctAnswer": "Anh em"
  },
  {
    "question": "Từ \"Phrase\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Câu hỏi", "Cụm từ", "Từ vựng", "Câu nói"],
    "correctAnswer": "Cụm từ"
  },
  {
    "question": "Từ \"Organized\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bừa bộn", "Lộn xộn", "Có tổ chức", "Xáo trộn"],
    "correctAnswer": "Có tổ chức"
  },
  {
    "question": "Từ \"Primarily\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chủ yếu", "Phụ thuộc", "Vô cùng", "Hoàn toàn"],
    "correctAnswer": "Chủ yếu"
  },
  {
    "question": "Từ \"Emotions\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tình cảm", "Cảm xúc", "Lý trí", "Suy nghĩ"],
    "correctAnswer": "Cảm xúc"
  },
  {
    "question": "Từ \"Apparently\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chắc chắn", "Hiển nhiên", "Rõ ràng", "Dường như"],
    "correctAnswer": "Dường như"
  },
  {
    "question": "Từ \"Firm\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Công ty", "Nhẹ nhàng", "Mềm mại", "Đàn hồi"],
    "correctAnswer": "Công ty"
  },
  {
    "question": "Từ \"Announced\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giấu kín", "Phớt lờ", "Thông báo", "Khuất phục"],
    "correctAnswer": "Thông báo"
  },
  {
    "question": "Từ \"Net\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lưới", "Ròng", "Mạng", "Tính toán"],
    "correctAnswer": "Lưới"
  },
  {
    "question": "Từ \"Affected\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Không bị ảnh hưởng", "Ảnh hưởng", "Tự do", "Độc lập"],
    "correctAnswer": "Ảnh hưởng"
  },
  {
    "question": "Từ \"Parties\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Đảng phái", "Các bên", "Người lạ", "Hành động"],
    "correctAnswer": "Các bên"
  },
  {
    "question": "Từ \"Exists\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tồn tại", "Biến mất", "Xuất hiện", "Mất tích"],
    "correctAnswer": "Tồn tại"
  },
  {
    "question": "Từ \"Wanting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Muốn", "Thiếu hụt", "Cần", "Yêu cầu"],
    "correctAnswer": "Muốn"
  },
  {
    "question": "Từ \"Tip\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Mũ", "Mẹo", "Đầu", "Ngón tay"],
    "correctAnswer": "Mẹo"
  },
  {
    "question": "Từ \"Perfectly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hoàn toàn", "Chỉ", "Rõ ràng", "Nhanh chóng"],
    "correctAnswer": "Hoàn toàn"
  },
  {
    "question": "Từ \"Initiative\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sáng kiến", "Khởi xướng", "Lãnh đạo", "Kế hoạch"],
    "correctAnswer": "Sáng kiến"
  },
  {
    "question": "Từ \"Methods\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phương pháp", "Công cụ", "Chiến lược", "Quá trình"],
    "correctAnswer": "Phương pháp"
  },
  {
    "question": "Từ \"Reporting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Báo cáo", "Truyền hình", "Tin tức", "Thông tin"],
    "correctAnswer": "Báo cáo"
  },
  {
    "question": "Từ \"Television\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Radio", "Tivi", "Máy tính", "Máy ảnh"],
    "correctAnswer": "Tivi"
  },
  {
    "question": "Từ \"Fan\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Máy tính", "Đồng hồ", "Quạt", "Áo khoác"],
    "correctAnswer": "Quạt"
  },
  {
    "question": "Từ \"Players\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Người sản xuất", "Người chơi", "Người quản lý", "Người điều khiển"],
    "correctAnswer": "Người chơi"
  },
  {
    "question": "Từ \"Awareness\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự quên lãng", "Sự nhận thức", "Sự ngơ ngác", "Sự phớt lờ"],
    "correctAnswer": "Sự nhận thức"
  },
  {
    "question": "Từ \"Sudden\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Chậm rãi", "Đột ngột", "Liên tục", "Biến đổi"],
    "correctAnswer": "Đột ngột"
  },
  {
    "question": "Từ \"Request\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Từ chối", "Đề nghị", "Yêu cầu", "Câu hỏi"],
    "correctAnswer": "Yêu cầu"
  },
  {
    "question": "Từ \"Sites\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Các loại", "Địa điểm", "Khu vực", "Nhiệm vụ"],
    "correctAnswer": "Địa điểm"
  },
  {
    "question": "Từ \"Worried\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hào hứng", "Bình tĩnh", "Lo lắng", "Vui vẻ"],
    "correctAnswer": "Lo lắng"
  },
  {
    "question": "Từ \"Joined\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tách ra", "Gia nhập", "Bỏ qua", "Kết nối"],
    "correctAnswer": "Gia nhập"
  },
  {
    "question": "Từ \"Religion\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Văn hóa", "Nghệ thuật", "Tôn giáo", "Khoa học"],
    "correctAnswer": "Tôn giáo"
  },
  {
    "question": "Từ \"Cars\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Xe đạp", "Xe máy", "Xe hơi", "Xe buýt"],
    "correctAnswer": "Xe hơi"
  },
  {
    "question": "Từ \"Opposite\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Gần", "Xa", "Ngược lại", "Song song"],
    "correctAnswer": "Ngược lại"
  },
  {
    "question": "Từ \"Sets\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bộ", "Cái", "Vật", "Sắp xếp"],
    "correctAnswer": "Bộ"
  },
  {
    "question": "Từ \"Experienced\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Có kinh nghiệm", "Mới mẻ", "Thiếu kinh nghiệm", "Học hỏi"],
    "correctAnswer": "Có kinh nghiệm"
  },
  {
    "question": "Từ \"Spoke\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nói", "Nghe", "Đọc", "Viết"],
    "correctAnswer": "Nói"
  },
  {
    "question": "Từ \"Judge\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Học sinh", "Thẩm phán", "Vận động viên", "Giảng viên"],
    "correctAnswer": "Thẩm phán"
  },
  {
    "question": "Từ \"Increased\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Giảm", "Tăng lên", "Giữ nguyên", "Thay đổi"],
    "correctAnswer": "Tăng lên"
  },
  {
    "question": "Từ \"Debate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tranh luận", "Đồng ý", "Phân tích", "Giải thích"],
    "correctAnswer": "Tranh luận"
  },
  {
    "question": "Từ \"Harder\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Dễ dàng hơn", "Khó hơn", "Nhanh hơn", "Nhẹ nhàng hơn"],
    "correctAnswer": "Khó hơn"
  },
  {
    "question": "Từ \"Scientific\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Lịch sử", "Văn học", "Khoa học", "Nghệ thuật"],
    "correctAnswer": "Khoa học"
  },
  {
    "question": "Từ \"Matters\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Vấn đề", "Vật thể", "Sự kiện", "Quyết định"],
    "correctAnswer": "Vấn đề"
  },
  {
    "question": "Từ \"Appropriate\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hài hước", "Phù hợp", "Kinh dị", "Phức tạp"],
    "correctAnswer": "Phù hợp"
  },
  {
    "question": "Từ \"Expected\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Ngẫu nhiên", "Dự kiến", "Bất ngờ", "Phản đối"],
    "correctAnswer": "Dự kiến"
  },
  {
    "question": "Từ \"Emotional\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Cảm xúc", "Lạnh lùng", "Hài hước", "Hợp lý"],
    "correctAnswer": "Cảm xúc"
  },
  {
    "question": "Từ \"Fighting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hòa bình", "Tránh né", "Chiến đấu", "Thỏa thuận"],
    "correctAnswer": "Chiến đấu"
  },
  {
    "question": "Từ \"Answers\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Câu hỏi", "Lời giải thích", "Các câu trả lời", "Lời chào"],
    "correctAnswer": "Các câu trả lời"
  },
  {
    "question": "Từ \"Fairly\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hoàn toàn", "Rõ ràng", "Khá", "Nhanh chóng"],
    "correctAnswer": "Khá"
  },
  {
    "question": "Từ \"Depending\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Không liên quan", "Tùy thuộc", "Ngẫu nhiên", "Bất ngờ"],
    "correctAnswer": "Tùy thuộc"
  },
  {
    "question": "Từ \"Bed\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bàn", "Ghế", "Giường", "Tủ"],
    "correctAnswer": "Giường"
  },
  {
    "question": "Từ \"Speaker\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Máy tính", "Loa", "Màn hình", "Bàn phím"],
    "correctAnswer": "Loa"
  },
  {
    "question": "Từ \"Painting\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bài thơ", "Bức tranh", "Sách", "Bản đồ"],
    "correctAnswer": "Bức tranh"
  },
  {
    "question": "Từ \"Accessible\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phức tạp", "Dễ tiếp cận", "Khó hiểu", "Vô hình"],
    "correctAnswer": "Dễ tiếp cận"
  },
  {
    "question": "Từ \"Marriage\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Hôn nhân", "Học vấn", "Mối quan hệ bạn bè", "Sự nghiệp"],
    "correctAnswer": "Hôn nhân"
  },
  {
    "question": "Từ \"Pop\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Nhạc pop", "Nhạc rock", "Âm nhạc cổ điển", "Thể thao"],
    "correctAnswer": "Nhạc pop"
  },
  {
    "question": "Từ \"Bodies\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Các cơ thể", "Những ý tưởng", "Các thành phố", "Tập hợp các đối tượng"],
    "correctAnswer": "Các cơ thể"
  },
  {
    "question": "Từ \"Definition\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Sự mô tả", "Định nghĩa", "Tóm tắt", "Giải thích chi tiết"],
    "correctAnswer": "Định nghĩa"
  },
  {
    "question": "Từ \"Foot\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Tay", "Bàn chân", "Đầu", "Mắt"],
    "correctAnswer": "Bàn chân"
  },
  {
    "question": "Từ \"Finish\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bắt đầu", "Tiếp tục", "Kết thúc", "Giữa chừng"],
    "correctAnswer": "Kết thúc"
  },
  {
    "question": "Từ \"Treat\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Bỏ qua", "Đối xử", "Phớt lờ", "Chê bai"],
    "correctAnswer": "Đối xử"
  },
  {
    "question": "Từ \"Marketing\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Kinh doanh", "Tiếp thị", "Bán hàng trực tiếp", "Dịch vụ"],
    "correctAnswer": "Tiếp thị"
  },
  {
    "question": "Từ \"Seconds\" trong tiếng Anh có nghĩa là gì?",
    "options": ["Phút", "Giây", "Tháng", "Năm"],
    "correctAnswer": "Giây"
  }
  




];

const quizData = [
  ...QuizDataOriginal, 
  ...QuizDataPart1,
  ...QuizDataPart2,
  ...QuizDataPart3
];


export default quizData;
