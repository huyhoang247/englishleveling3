// --- START OF FILE: phrase-data.ts ---

interface PhrasePart {
  english: string;
  vietnamese: string;
}

interface PhraseSentence {
  parts: PhrasePart[];
  fullEnglish: string;
  fullVietnamese: string;
}

// --- DỮ LIỆU GỐC ---
// Dán toàn bộ danh sách cụm từ vào đây.
// QUAN TRỌNG: Mỗi câu phải được cách nhau bằng MỘT DÒNG TRỐNG.
const rawPhraseStream = `
Solar energy (Năng lượng mặt trời)
is (là)
a renewable source of power (một nguồn năng lượng tái tạo)

The company (Công ty)
is looking for (đang tìm kiếm)
a new source of raw materials (một nguồn nguyên liệu thô mới)

Health insurance (Bảo hiểm sức khỏe)
is (là)
a must (điều bắt buộc)
for all employees (đối với tất cả nhân viên)

The car (Chiếc xe)
was totalled (đã bị hỏng hoàn toàn)
but luckily (nhưng may mắn là)
she had insurance (cô ấy đã có bảo hiểm)

We (Chúng tôi)
offer (cung cấp)
a range of insurance services (một loạt các dịch vụ bảo hiểm)
to our clients (cho khách hàng của mình)

The couple (Cặp đôi)
had an argument (đã tranh cãi)
about spending money (về việc tiêu tiền)

His main argument (Luận điểm chính của anh ấy)
is supported (được hỗ trợ)
by recent studies (bởi các nghiên cứu gần đây)

They (Họ)
got into an argument (đã tranh cãi)
over politics (về chính trị)

Social media (Mạng xã hội)
has (có)
a big influence (ảnh hưởng lớn)
on young people (đối với giới trẻ)

He (Anh ấy)
has (có)
a lot of influence (nhiều ảnh hưởng)
in the company (trong công ty)

Her parents (Bố mẹ cô ấy)
had a strong influence (có ảnh hưởng mạnh mẽ)
on her career choice (đến sự lựa chọn nghề nghiệp của cô ấy)

The band (Ban nhạc)
is planning (đang lên kế hoạch)
to release a new album (phát hành một album mới)
next month (vào tháng tới)

After years of research (Sau nhiều năm nghiên cứu)
the scientist (nhà khoa học)
is ready to release (sẵn sàng công bố)
his findings (phát hiện của mình)
to the public (cho công chúng)

The movie (Bộ phim)
is scheduled for release (được lên lịch phát hành)
during the holiday season (trong mùa lễ hội)

The stadium (Sân vận động)
has (có)
a seating capacity of 50000 (sức chứa 50.000 chỗ ngồi)

The battery (Pin)
has (có)
a capacity of 2000 milliampere-hours (dung lượng 2000 miliampe-giờ)

The memory card (Thẻ nhớ)
has (có)
a storage capacity of 128 gigabytes (dung lượng lưu trữ 128 gigabyte)

The Senate (Thượng viện)
passed the bill (đã thông qua dự luật)
with a large majority (với đa số lớn)

He (Anh ấy)
announced (đã công bố)
his candidacy (ứng cử)
for the U.S. Senate (vào Thượng viện Mỹ)

The proposal (Đề xuất)
needs approval (cần được sự chấp thuận)
from both the House and the Senate (từ cả Hạ viện và Thượng viện)

The earthquake (Trận động đất)
caused (đã gây ra)
massive damage (thiệt hại lớn)
to the city (cho thành phố)

She (Cô ấy)
received (đã nhận được)
massive support (sự ủng hộ lớn)
from her fans (từ người hâm mộ)

The company (Công ty)
is undertaking (đang tiến hành)
a massive project (một dự án lớn)

He (Anh ấy)
picked up a stick (nhặt một cây gậy)
to defend himself (để tự vệ)

He (Anh ấy)
used a stick (dùng một cây gậy)
to poke the fire (để khều lửa)

She (Cô ấy)
used a walking stick (đã sử dụng một cây gậy)
on her hike (khi đi bộ đường dài)

He (Anh ấy)
lives (sống)
in the downtown district (ở khu vực trung tâm thành phố)

The school district (Khu vực trường học)
is implementing (đang thực hiện)
new policies (các chính sách mới)

This district (Khu vực này)
is known for (nổi tiếng với)
its vibrant nightlife (cuộc sống về đêm sôi động)

The project (Dự án)
went over budget (đã vượt quá ngân sách)

We (Chúng ta)
need to cut (cần cắt giảm)
our monthly budget (ngân sách hàng tháng của mình)

The government (Chính phủ)
is preparing (đang chuẩn bị)
the annual budget (ngân sách hàng năm)

We (Chúng ta)
need to measure the room (cần đo căn phòng)
before buying new furniture (trước khi mua đồ nội thất mới)

Measure (Đo)
the distance (khoảng cách)
between the two points (giữa hai điểm)

This ruler (Cái thước này)
can measure (có thể đo)
up to 30 centimeters (lên đến 30 centimet)

Be careful (Hãy cẩn thận)
when you cross the street (khi bạn băng qua đường)

The idea (Ý tưởng đó)
didnt even cross my mind (thậm chí không hề xuất hiện trong đầu tôi)

Cross off (Gạch)
the names of the guests (tên của những vị khách)
who have confirmed they are not coming (đã xác nhận là họ sẽ không đến)

The central theme (Chủ đề trung tâm)
of the book (của cuốn sách)
is (là)
love and forgiveness (tình yêu và sự tha thứ)

He (Anh ấy)
lives in a central location (sống ở một vị trí trung tâm)
convenient for all (thuận tiện cho tất cả mọi người)

Central heating (Sưởi trung tâm)
is (là)
a common feature (một tính năng phổ biến)
in these homes (trong những ngôi nhà này)

She (Cô ấy)
was proud of (tự hào về)
her childrens achievements (thành tích của con mình)

He (Anh ấy)
stood tall and proud (đứng thẳng và tự hào)
despite the challenges (bất chấp những thách thức)

They (Họ)
are proud (tự hào)
to serve their community (phục vụ cộng đồng của mình)

Honesty (Trung thực)
is (là)
the core value (giá trị cốt lõi)
of our company (của công ty chúng tôi)

The core of the problem (Cốt lõi của vấn đề)
lies in (nằm ở)
communication issues (các vấn đề về giao tiếp)

An apples core (Lõi của quả táo)
contains seeds (chứa hạt)

She (Cô ấy)
was elected (đã được bầu làm)
as the sheriff (cảnh sát trưởng)
of the county (của hạt)

The county fair (Hội chợ hạt)
is held (được tổ chức)
every summer (mỗi mùa hè)

Our library system (Hệ thống thư viện của chúng tôi)
serves (phục vụ)
the entire county (toàn bộ hạt)

This species of bird (Loài chim này)
is known for (được biết đến với)
its colorful plumage (bộ lông sặc sỡ)

Several species (Một số loài)
are endangered (đang bị đe dọa)
due to habitat destruction (do phá hủy môi trường sống)

Scientists (Các nhà khoa học)
discovered (đã phát hiện)
a new species (một loài mới)
in the rainforest (trong rừng mưa)

The conditions of the contract (Các điều kiện của hợp đồng)
are (là)
clear and binding (rõ ràng và có tính ràng buộc)

They (Họ)
had to work (phải làm việc)
in harsh conditions (trong điều kiện khắc nghiệt)

The road conditions (Điều kiện đường xá)
are poor (kém)
due to the snow (do tuyết)

She (Cô ấy)
felt (cảm thấy)
a touch (một cái chạm)
on her shoulder (trên vai mình)

Dont touch (Đừng chạm vào)
the wet paint (sơn ướt)

She (Cô ấy)
has a gentle touch (rất nhẹ tay)
with flowers (với hoa)

The mass (Khối lượng)
of the sun (của mặt trời)
is incredibly large (rất lớn)

A mass of people (Một đám đông người)
attended the concert (đã tham dự buổi hòa nhạc)

The product (Sản phẩm)
is sold (được bán)
at mass market retailers (tại các cửa hàng bán lẻ đại chúng)

The social media platform (Nền tảng mạng xã hội)
has (có)
millions of users (hàng triệu người dùng)

The train (Tàu)
arrived (đã đến)
at the platform (sân ga)

Developers (Các nhà phát triển)
can create applications (có thể tạo ứng dụng)
on this platform (trên nền tảng này)

Keep the picture (Giữ bức tranh)
straight (thẳng)
on the wall (trên tường)

I (Tôi)
drove straight home (lái xe thẳng về nhà)
after work (sau khi tan làm)

She (Cô ấy)
has (đạt)
straight As (toàn điểm A)
in all her subjects (trong tất cả các môn học của mình)

The doctor said (Bác sĩ nói)
it was (đó là)
a serious condition (một tình trạng nghiêm trọng)

We (Chúng ta)
need to have (cần phải có)
a serious discussion (một cuộc thảo luận nghiêm túc)
about our future (về tương lai của chúng ta)

She (Cô ấy)
is serious about (rất nghiêm túc với)
her career in music (sự nghiệp âm nhạc của mình)

We (Chúng tôi)
encourage (khuyến khích)
healthy eating habits (thói quen ăn uống lành mạnh)

Teachers (Giáo viên)
should encourage students (nên khuyến khích học sinh)
to ask questions (đặt câu hỏi)

Positive feedback (Phản hồi tích cực)
can encourage employees (có thể khuyến khích nhân viên)
to perform better (làm việc tốt hơn)

The project (Dự án)
is due (đến hạn)
next Monday (vào thứ Hai tới)

Payment (Việc thanh toán)
is due (đến hạn)
at the end of the month (vào cuối tháng)

The success of the event (Sự thành công của sự kiện)
was due to (là nhờ vào)
the hard work of volunteers (sự chăm chỉ của các tình nguyện viên)

I (Tôi)
have (có)
a fond memory (một ký ức đẹp)
of our vacation (về kỳ nghỉ của chúng tôi)

The computer (Máy tính)
has (có)
8GB of RAM (8GB RAM)
for memory (cho bộ nhớ)

She (Cô ấy)
has a great memory (có trí nhớ rất tốt)
for names and faces (về tên và khuôn mặt)

The secretary (Thư ký)
scheduled a meeting (đã lên lịch một cuộc họp)
for next week (cho tuần tới)

He (Anh ấy)
worked as a secretary (đã làm thư ký)
before becoming a lawyer (trước khi trở thành luật sư)

The secretary (Thư ký)
took notes (đã ghi chú)
during the meeting (trong cuộc họp)

I (Tôi)
caught a cold (bị cảm lạnh)
last week (tuần trước)

The water (Nước)
was too cold (quá lạnh)
for swimming (để bơi)

Keep the food (Giữ thức ăn)
cold (lạnh)
in the refrigerator (trong tủ lạnh)

For instance (Chẳng hạn)
lets consider (hãy xem xét)
the companys growth (sự tăng trưởng của công ty)
last year (trong năm ngoái)

This is an instance (Đây là một trường hợp)
where patience is required (cần có sự kiên nhẫn)

In this instance (Trong trường hợp này)
we should follow (chúng ta nên tuân theo)
the guidelines (hướng dẫn)

The foundation of the house (Nền móng của ngôi nhà)
needs to be strong (cần phải vững chắc)

She (Cô ấy)
set up a foundation (đã thành lập một quỹ từ thiện)
to help underprivileged children (để giúp đỡ trẻ em kém may mắn)

Trust (Tin tưởng)
is (là)
the foundation (nền tảng)
of a good relationship (của một mối quan hệ tốt đẹp)

Please keep (Vui lòng để)
the clean and dirty clothes (quần áo sạch và bẩn)
separate (riêng)

They (Họ)
decided to separate (quyết định chia tay)
after ten years of marriage (sau mười năm kết hôn)

The teacher (Giáo viên)
asked the students (yêu cầu học sinh)
to work in separate groups (làm việc trong các nhóm riêng biệt)

We (Chúng tôi)
used a map (đã sử dụng bản đồ)
to find our way (để tìm đường)
to the hotel (đến khách sạn)

The treasure map (Bản đồ kho báu)
led them (dẫn họ)
to an isolated island (đến một hòn đảo biệt lập)

You (Bạn)
can see (có thể thấy)
the countrys topography (địa hình của đất nước)
on this map (trên bản đồ này)

She (Cô ấy)
added some ice (thêm một ít đá)
to her drink (vào thức uống của mình)
to cool it down (để làm mát)
`;

// --- LOGIC TỰ ĐỘNG XỬ LÝ --- (Không cần sửa phần dưới này)

/**
 * Phân tích một khối chuỗi của một câu thành các phần (Anh-Việt).
 * @param block Chuỗi của một câu.
 * @returns Một mảng các đối tượng PhrasePart.
 */
const parseSingleSentenceBlock = (block: string): PhrasePart[] => {
  const lines = block.split('\n').filter(line => line.trim() !== '');
  const partRegex = /^(.*)\s\((.*)\)$/;

  return lines.map(line => {
    const match = line.trim().match(partRegex);
    if (match && match.length === 3) {
      return {
        // Tự động loại bỏ dấu ' và , khỏi tiếng Anh
        english: match[1].trim().replace(/'/g, '').replace(/,/g, ''),
        vietnamese: match[2].trim(),
      };
    }
    console.warn(`Dòng sau không khớp định dạng "English (Vietnamese)": ${line}`);
    return { english: line.trim(), vietnamese: 'N/A' };
  });
};

// Tự động xử lý toàn bộ khối văn bản để cung cấp cho ứng dụng
export const phraseData: PhraseSentence[] = rawPhraseStream
  .trim()
  // Tách thành các câu dựa trên các dòng trống
  .split(/\n\s*\n/)
  .map(block => {
    const parts = parseSingleSentenceBlock(block.trim());
    if (parts.length === 0) return null;
    return {
      parts,
      fullEnglish: parts.map(p => p.english).join(' '),
      fullVietnamese: parts.map(p => p.vietnamese).join(' '),
    };
  })
  // Lọc ra các kết quả rỗng (nếu có nhiều dòng trống liên tiếp)
  .filter((item): item is PhraseSentence => item !== null);

// --- END OF FILE: phrase-data.ts ---
