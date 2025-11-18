// --- START OF FILE example-data.ts ---

export interface ExampleSentence {
  english: string;
  vietnamese: string;
}

// Dữ liệu thô chứa các câu ví dụ và bản dịch
const exampleSentencesText = `

His contributions to the project were invaluable. (Những đóng góp của anh ấy cho dự án là vô giá.)
We would like to thank everyone for their generous contributions to the charity. (Chúng tôi xin cảm ơn mọi người vì những đóng góp hào phóng cho quỹ từ thiện.)
Albert Einstein's contributions to science changed the world. (Những đóng góp của Albert Einstein cho khoa học đã thay đổi thế giới.)
The price tag shows that this jacket is on sale. (Mác giá cho thấy chiếc áo khoác này đang được giảm giá.)
Don't forget to tag your friends in the photo. (Đừng quên gắn thẻ bạn bè của bạn vào bức ảnh nhé.)
My younger brother always wants to tag along when I go out with my friends. (Em trai tôi luôn muốn đi theo mỗi khi tôi ra ngoài với bạn bè.)
The cost of living has increased in the city. Similarly, rent prices have also gone up. (Chi phí sinh hoạt trong thành phố đã tăng lên. Tương tự, giá thuê nhà cũng đã tăng theo.)
My sister loves to read books. Similarly, I enjoy spending my weekends at the library. (Chị gái tôi rất thích đọc sách. Tương tự, tôi cũng thích dành những ngày cuối tuần của mình ở thư viện.)
You should treat others with respect; similarly, you should expect them to respect you in return. (Bạn nên đối xử với người khác một cách tôn trọng; tương tự, bạn cũng nên mong đợi họ tôn trọng lại bạn.)
What's your favorite sport? (Môn thể thao yêu thích của bạn là gì?)
Playing a sport is a great way to stay healthy. (Chơi thể thao là một cách tuyệt vời để giữ gìn sức khỏe.)
Football is the most popular sport in many countries. (Bóng đá là môn thể thao phổ biến nhất ở nhiều quốc gia.)
He was diagnosed with type 2 diabetes last year. (Anh ấy được chẩn đoán mắc bệnh tiểu đường tuýp 2 vào năm ngoái.)
Managing diabetes requires careful attention to diet and exercise. (Kiểm soát bệnh tiểu đường đòi hỏi phải chú ý cẩn thận đến chế độ ăn uống và tập thể dục.)
A family history of diabetes can increase your risk of developing the condition. (Tiền sử gia đình mắc bệnh tiểu đường có thể làm tăng nguy cơ mắc bệnh của bạn.)
The government announced a new fiscal policy to combat inflation. (Chính phủ đã công bố một chính sách tài khóa mới để chống lạm phát.)
Our company's fiscal year runs from July 1st to June 30th. (Năm tài chính của công ty chúng tôi bắt đầu từ ngày 1 tháng 7 đến ngày 30 tháng 6.)
The country is struggling with a large fiscal deficit. (Quốc gia này đang phải vật lộn với mức thâm hụt ngân sách lớn.)
The weather was awful, so we had to cancel the picnic. (Thời tiết thật tệ, nên chúng tôi đã phải hủy chuyến dã ngoại.)
I feel awful for yelling at you earlier. (Tôi cảm thấy thật tồi tệ vì đã la mắng bạn lúc nãy.)
The food at that restaurant tasted awful. (Đồ ăn ở nhà hàng đó có vị rất kinh khủng.)
She is a highly educated woman with a Ph.D. in physics. (Bà là một người phụ nữ có học vấn cao với bằng tiến sĩ vật lý.)
Based on the dark clouds, I made an educated guess that it was going to rain. (Dựa vào những đám mây đen, tôi đã đưa ra một phỏng đoán có cơ sở rằng trời sắp mưa.)
A well-educated population is crucial for a nation's development. (Trình độ dân trí cao là yếu tố thiết yếu cho sự phát triển của quốc gia.)




`;

/**
 * Phân tích chuỗi dữ liệu ví dụ thành một mảng các đối tượng có cấu trúc.
 * @param text - Chuỗi văn bản thô chứa các ví dụ.
 * @returns Một mảng các đối tượng ExampleSentence.
 */
export const parseExampleSentences = (text: string): ExampleSentence[] => {
  const lines = text.trim().split('\n');
  const examples: ExampleSentence[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const match = line.match(/(.*)\s*\((.*)\)/);
    if (match && match[1] && match[2]) {
      examples.push({
        english: match[1].trim(),
        vietnamese: match[2].trim().replace(/\.$/, ''), // Bỏ dấu chấm ở cuối nếu có
      });
    } else {
      // Fallback nếu dòng không đúng định dạng
      examples.push({
        english: line.trim(),
        vietnamese: 'Bản dịch không có sẵn',
      });
    }
  }

  return examples;
};

// Xuất dữ liệu đã được phân tích để các component khác có thể sử dụng trực tiếp
export const exampleData: ExampleSentence[] = parseExampleSentences(exampleSentencesText);

// --- END OF FILE example-data.ts ---

