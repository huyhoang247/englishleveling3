// books-data.ts

// Định nghĩa cấu trúc cho một cuốn sách
export interface Book {
  id: string;
  title: string;
  content: string;
  contentVi?: string; // <-- THÊM MỚI: Nội dung bản dịch tiếng Việt (tùy chọn)
  author?: string;
  category: string;
  coverImageUrl?: string;
  audioUrls?: Record<string, string>; // Cập nhật: Hỗ trợ nhiều file audio với tên tùy chỉnh
}

// Dữ liệu sách mẫu
export const sampleBooks: Book[] = [
  {
    id: 'book1',
    title: 'Why Social Health Is Key to Happiness and Longevity',
    author: 'Kasley Killam',
    category: 'Technology & Future',
    coverImageUrl: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/audio-ted/20250531_2319_Social%20Health%20Anime_simple_compose_01jwkj5nzxf9xtzk5dykvqsw6t.png',
    audioUrls: {
      'Kasley Killam': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/Why%20Social%20Health%20Is%20Key%20to%20Happiness%20and%20Longevity%20%20Kasley%20Killiam%20%20TED.mp3',
      'Matilda': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/elevenlabs-2025-09-06t12-31-47-matilda-pre-sp100-s50-sb75-se0-b-m2_y6yNk68O.mp3',
      'Hope': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/book1-hope-voice.mp3',
    },
    content: `
So a couple of years ago, a woman I know who I'll call Maya, went through a lot of big changes in a short amount of time. She got married. She and her husband moved for his job to a new city where she didn’t know anyone. She started a new role working from home, all while managing her dad's new diagnosis of dementia.
And to manage the stress of all this change, Maya doubled down on her physical and mental health. She exercised almost every day, she ate healthy foods, she went to therapy once a week. And these actions really helped. Her body got stronger. Her mind got more resilient, but only up to a point. She was still struggling, often losing sleep in the middle of the night, feeling unfocused, unmotivated during the day.
Maya was doing everything that doctors typically tell us to do to be physically and mentally healthy, and yet something was missing. What if I told you that what was missing for Maya is also missing for billions of people around the world, and that it might be missing for you? What if I told you that not having it undermines our other efforts to be healthy and can even shorten your lifespan?
I’ve been studying this for over a decade, and I've discovered that the traditional way we think about health is incomplete. By thinking of our health as primarily physical and mental, we overlook what I believe is the greatest challenge and the greatest opportunity of our time. Social health.
While physical health is about our bodies and mental health is about our minds, social health is about our relationships. And if you haven't heard this term before, that's because it hasn't yet made its way into mainstream vocabulary, yet it is equally important.
Maya didn't yet have a sense of community in her new home. She wasn't seeing her family, or her friends or her coworkers in person anymore, and she often went weeks only spending quality time with her husband. Her story shows us that we can't be fully healthy, we can’t thrive, if we take care of our bodies and our minds, but not our relationships.
Similar to Maya, hundreds of millions of people around the world go weeks at a time without talking to a single friend or family member. Globally, one in four people feel lonely. And 20 percent of adults worldwide don't feel like they have anyone they can reach out to for support. Think about that. One in five people you encounter may feel like they have no one.
This is more than heartbreaking. It's also a public health crisis. Disconnection triggers stress in the body. It weakens people's immune systems. It puts them at a risk, greater risk, of stroke, heart disease, diabetes, dementia, depression and early death. Social health is essential for longevity.

What Does Social Health Look Like?

So you might be wondering, what does it look like to be socially healthy? What does that even mean? Well it’s about developing close relationships with your family, your friends, your partner, yourself. It's about having regular interaction with your coworkers, your neighbors. It's about feeling like you belong to a community. Being socially healthy is about having the right quantity and quality of connection for you.
And Maya's story is one example of how social health challenges come up. In my work, I hear many others. Stories like Jay, a freshman in college who’s eager to get involved in campus yet is having a hard time fitting in with people in his dorm and often feels homesick. Or Serena and Ali, a couple juggling the chaos of young kids with demanding jobs, they rarely have time to see friends or spend time one-on-one. Or Henry, recently retired, who cherishes time with his spouse and yet feels untethered without his team anymore and wishes he could see his kids and grandkids more often. These stories show that social health is relevant to each of us at every life stage.
The 5-3-1 Guideline
So if you're not sure where to start, try the 5-3-1 guideline from my book. It goes like this. Aim to interact with five different people each week, to strengthen at least three close relationships overall, and to spend one hour a day connecting. Let's dig into these.
1: Interact with five different people each week.
Just like eating a variety of vegetables and other food groups is more nutritious, research has shown that interacting with a variety of people is more rewarding. So your five could include close loved ones, casual acquaintances, even complete strangers. In fact, in one study that I love, people who just smiled, made eye contact and chit-chatted with a barista, felt happier and a greater sense of belonging than people who just rushed to get their coffee and go.
2: Strengthen at least three close relationships.
OK, we've all heard of a to-do list, but I would like to invite you to write a to-love list. Who matters most to you? Who can you be yourself with? Make sure that you invest in the names of at least three of the people that you write down. By scheduling regular time together, by showing a genuine interest in their lives, and also by opening up about the experiences that you're going through.
And I'm often asked, does it have to be in person? Does texting count? Studies have shown that face-to-face is ideal, so do that whenever possible. But there are absolutely still benefits to staying connected virtually.
3: Spend one hour a day on meaningful connection.
OK, if you're an introvert, right now you're probably thinking one hour sounds like a lot. I get it. It might be surprising, but I'm actually also an introvert. However, keep in mind that just like getting eight hours of sleep at night, the exact amount that's right for you personally might be higher or lower.
But if you are thinking that one hour a day sounds like way too much because you're just way too busy, I challenge you. Adults in the US spend an average of 4.5 hours each day on their smartphones. So instead of scrolling on social media, text a friend. Instead of reading news headlines, write a thank-you card. Instead of listening to a podcast, call a family member.
Maya put this into practice by scheduling recurring hangouts with a new local friend that she made, by attending community events and dropping cards off in her neighbors mailboxes, by planning trips to see family and inviting friends in other cities to come visit. And bolstering her social health made more of a difference than focusing solely on her physical and mental health ever could.
And I know this because Maya is actually me. I am so passionate about sharing tools to be socially healthy because honestly, I need them too. And the 5-3-1 guideline is one way that we can be proactive and intentional about our relationships. And that is really the point. Be proactive and intentional about your social health.
Shaping a Socially Healthy Society
So zooming out beyond the steps that you and I take individually, together, we need to shape a society that thrives through social health. Over the next decade, I envision educators championing social health in schools. And just like kids build their physical muscles in gym class, they'll exercise their social muscles in connection class.
Over the next decade, I see our cities and neighborhoods being designed with social health in mind, where vibrant gathering places foster unity and community builders are empowered to bring them to life. Over the next decade, I believe that social health will become as ingrained in our collective consciousness as mental health is today.
Because not that long ago, mental health was a taboo topic shrouded in stigma. And now public figures talk openly about it, there's an entire industry to support it, and more and more people think of going to therapy like going to the gym.
In this future, loneliness will subside, just like smoking subsided when we recognized and treated it as a public health issue. In this future, I hope that social health will become so deeply woven into the fabric of our culture that no one needs the 5-3-1 guideline anymore.
So to get there, make relationships your priority not only for you, but also for the people you love. Because the beauty of nurturing your own social health is that it naturally enriches the social health of everyone you connect with.
Thank you.
(Applause)
    `,
    // --- START: NỘI DUNG DỊCH ĐÃ ĐƯỢC THÊM VÀO ĐÂY ---
    contentVi: `
Vài năm trước, một người phụ nữ tôi quen, tôi sẽ gọi cô ấy là Maya, đã trải qua rất nhiều thay đổi lớn trong một khoảng thời gian ngắn. Cô ấy kết hôn. Cô và chồng chuyển đến một thành phố mới vì công việc của anh ấy, một nơi cô không quen biết ai. Cô bắt đầu một công việc mới tại nhà, và tất cả diễn ra trong khi phải chăm sóc người cha vừa được chẩn đoán mắc chứng mất trí nhớ.
Và để kiểm soát sự căng thẳng từ tất cả những thay đổi này, Maya càng chú trọng hơn vào sức khỏe thể chất và tinh thần của mình. Cô tập thể dục gần như mỗi ngày, ăn những thực phẩm lành mạnh, và đi trị liệu tâm lý mỗi tuần một lần. Và những hành động này thực sự đã giúp ích. Cơ thể cô trở nên khỏe mạnh hơn. Tâm trí cô trở nên kiên cường hơn, nhưng chỉ đến một mức độ nào đó thôi. Cô vẫn gặp khó khăn, thường xuyên mất ngủ giữa đêm, cảm thấy mất tập trung, thiếu động lực vào ban ngày.
Maya đã làm mọi thứ mà các bác sĩ thường khuyên chúng ta làm để có sức khỏe thể chất và tinh thần tốt, vậy mà vẫn có điều gì đó thiếu sót. Sẽ ra sao nếu tôi nói với bạn rằng điều Maya còn thiếu cũng là điều mà hàng tỷ người trên thế giới đang thiếu, và có thể bạn cũng đang thiếu nó? Sẽ ra sao nếu tôi nói với bạn rằng việc không có nó sẽ làm suy yếu những nỗ lực khác của chúng ta để khỏe mạnh và thậm chí có thể rút ngắn tuổi thọ của bạn?
Tôi đã nghiên cứu về điều này hơn một thập kỷ, và tôi đã phát hiện ra rằng cách chúng ta nghĩ về sức khỏe theo kiểu truyền thống là chưa hoàn chỉnh. Khi chỉ xem sức khỏe chủ yếu là về thể chất và tinh thần, chúng ta đã bỏ qua điều mà tôi tin là thách thức lớn nhất và cũng là cơ hội lớn nhất của thời đại chúng ta. Sức khỏe xã hội.
Trong khi sức khỏe thể chất là về cơ thể và sức khỏe tinh thần là về trí óc, thì sức khỏe xã hội là về các mối quan hệ của chúng ta. Và nếu bạn chưa từng nghe đến thuật ngữ này trước đây, đó là vì nó vẫn chưa trở nên phổ biến trong ngôn ngữ hàng ngày, nhưng nó cũng quan trọng không kém.
Maya vẫn chưa có cảm giác thuộc về một cộng đồng nào ở ngôi nhà mới của mình. Cô không còn gặp gia đình, bạn bè hay đồng nghiệp trực tiếp nữa, và cô ấy thường trải qua nhiều tuần chỉ dành thời gian chất lượng bên chồng mình. Câu chuyện của cô ấy cho chúng ta thấy rằng chúng ta không thể hoàn toàn khỏe mạnh, không thể phát triển tốt, nếu chỉ chăm sóc cho cơ thể và tâm trí, mà bỏ qua các mối quan hệ của mình.
Tương tự như Maya, hàng trăm triệu người trên thế giới trải qua nhiều tuần liền mà không nói chuyện với một người bạn hay thành viên gia đình nào. Trên toàn cầu, cứ bốn người thì có một người cảm thấy cô đơn. Và 20% người trưởng thành trên toàn thế giới không cảm thấy có ai để tìm đến hỗ trợ. Hãy nghĩ về điều đó. Cứ năm người bạn gặp thì có thể có một người cảm thấy họ không có ai cả.
Điều này còn hơn cả đau lòng. Nó còn là một cuộc khủng hoảng sức khỏe cộng đồng. Sự mất kết nối gây ra căng thẳng trong cơ thể. Nó làm suy yếu hệ miễn dịch của con người. Nó khiến họ có nguy cơ cao hơn bị đột quỵ, bệnh tim, tiểu đường, mất trí nhớ, trầm cảm và tử vong sớm. Sức khỏe xã hội là yếu tố thiết yếu cho sự trường thọ.

Sức Khỏe Xã Hội Trông Như Thế Nào?

Vậy bạn có thể đang tự hỏi, khỏe mạnh về mặt xã hội trông như thế nào? Điều đó có nghĩa là gì? Vâng, đó là việc phát triển các mối quan hệ thân thiết với gia đình, bạn bè, người bạn đời, và với chính bản thân bạn. Đó là việc tương tác thường xuyên với đồng nghiệp, hàng xóm. Đó là cảm thấy mình thuộc về một cộng đồng. Khỏe mạnh về mặt xã hội là có được số lượng và chất lượng kết nối phù hợp với chính bạn.
Và câu chuyện của Maya là một ví dụ về cách các thách thức về sức khỏe xã hội xuất hiện. Trong công việc của mình, tôi nghe nhiều câu chuyện khác nữa. Những câu chuyện như Jay, một sinh viên năm nhất đại học háo hức tham gia vào các hoạt động trong trường nhưng lại gặp khó khăn trong việc hòa nhập với mọi người trong ký túc xá và thường cảm thấy nhớ nhà. Hay Serena và Ali, một cặp vợ chồng đang phải xoay xở với những đứa con nhỏ và công việc đòi hỏi cao, họ hiếm khi có thời gian gặp gỡ bạn bè hay dành thời gian riêng cho nhau. Hoặc Henry, vừa nghỉ hưu, người trân trọng thời gian bên người bạn đời nhưng lại cảm thấy mất đi sự gắn kết khi không còn đội ngũ của mình nữa và ước gì ông có thể gặp con cháu thường xuyên hơn. Những câu chuyện này cho thấy rằng sức khỏe xã hội có liên quan đến mỗi chúng ta ở mọi giai đoạn của cuộc đời.

Hướng dẫn 5-3-1

Vậy nếu bạn không biết bắt đầu từ đâu, hãy thử hướng dẫn 5-3-1 từ cuốn sách của tôi. Nó như thế này: Mục tiêu là tương tác với năm người khác nhau mỗi tuần, củng cố ít nhất ba mối quan hệ thân thiết, và dành một giờ mỗi ngày để kết nối. Hãy cùng tìm hiểu sâu hơn.
1: Tương tác với năm người khác nhau mỗi tuần.
Cũng giống như việc ăn nhiều loại rau củ và các nhóm thực phẩm khác sẽ bổ dưỡng hơn, nghiên cứu đã chỉ ra rằng việc tương tác với nhiều người khác nhau sẽ mang lại nhiều lợi ích hơn. Vì vậy, năm người của bạn có thể bao gồm những người thân yêu, những người quen biết xã giao, và thậm chí cả những người hoàn toàn xa lạ. Thực tế, trong một nghiên cứu mà tôi rất thích, những người chỉ mỉm cười, giao tiếp bằng mắt và trò chuyện phiếm với nhân viên pha chế, đã cảm thấy hạnh phúc hơn và có cảm giác thuộc về nhiều hơn so với những người chỉ vội vã lấy cà phê rồi đi.
2: Củng cố ít nhất ba mối quan hệ thân thiết.
Được rồi, chúng ta đều biết đến danh sách "việc cần làm" (to-do list), nhưng tôi muốn mời bạn viết ra một danh sách "người cần yêu thương" (to-love list). Ai là người quan trọng nhất với bạn? Bạn có thể là chính mình khi ở bên ai? Hãy chắc chắn rằng bạn đầu tư vào ít nhất ba người bạn đã viết ra. Bằng cách lên lịch dành thời gian bên nhau thường xuyên, bằng cách thể hiện sự quan tâm chân thành đến cuộc sống của họ, và cũng bằng cách cởi mở về những trải nghiệm bạn đang trải qua.
Và tôi thường được hỏi, có nhất thiết phải gặp mặt trực tiếp không? Nhắn tin có được tính không? Các nghiên cứu đã chỉ ra rằng gặp mặt trực tiếp là lý tưởng nhất, vì vậy hãy làm điều đó bất cứ khi nào có thể. Nhưng chắc chắn vẫn có những lợi ích khi duy trì kết nối qua mạng.
3: Dành một giờ mỗi ngày cho kết nối ý nghĩa.
Được rồi, nếu bạn là người hướng nội, ngay lúc này có lẽ bạn đang nghĩ một giờ nghe có vẻ nhiều. Tôi hiểu. Có thể sẽ ngạc nhiên, nhưng thực ra tôi cũng là một người hướng nội. Tuy nhiên, hãy nhớ rằng cũng giống như việc ngủ tám tiếng mỗi đêm, lượng thời gian chính xác phù hợp với cá nhân bạn có thể cao hơn hoặc thấp hơn.
Nhưng nếu bạn nghĩ rằng một giờ mỗi ngày là quá nhiều vì bạn quá bận rộn, tôi thách bạn đấy. Người trưởng thành ở Mỹ dành trung bình 4,5 giờ mỗi ngày cho điện thoại thông minh. Vì vậy, thay vì lướt mạng xã hội, hãy nhắn tin cho một người bạn. Thay vì đọc các tiêu đề tin tức, hãy viết một tấm thiệp cảm ơn. Thay vì nghe podcast, hãy gọi cho một người thân trong gia đình.
Maya đã áp dụng điều này vào thực tế bằng cách lên lịch gặp gỡ định kỳ với một người bạn mới ở địa phương mà cô quen, bằng cách tham dự các sự kiện cộng đồng và bỏ những tấm thiệp vào hòm thư của hàng xóm, bằng cách lên kế hoạch cho các chuyến đi thăm gia đình và mời bạn bè ở các thành phố khác đến thăm. Và việc củng cố sức khỏe xã hội của cô ấy đã tạo ra sự khác biệt nhiều hơn những gì mà việc chỉ tập trung vào sức khỏe thể chất và tinh thần có thể làm được.
Và tôi biết điều này bởi vì Maya chính là tôi. Tôi rất tâm huyết với việc chia sẻ các công cụ để có sức khỏe xã hội tốt vì thành thật mà nói, tôi cũng cần chúng. Và hướng dẫn 5-3-1 là một cách để chúng ta có thể chủ động và có chủ đích về các mối quan hệ của mình. Và đó thực sự là điểm mấu chốt. Hãy chủ động và có chủ đích về sức khỏe xã hội của bạn.

Định Hình Một Xã Hội Khỏe Mạnh Về Mặt Xã Hội

Vậy, hãy nhìn xa hơn những bước mà bạn và tôi thực hiện với tư cách cá nhân, chúng ta cần cùng nhau định hình một xã hội phát triển thịnh vượng thông qua sức khỏe xã hội. Trong thập kỷ tới, tôi hình dung các nhà giáo dục sẽ đề cao sức khỏe xã hội trong trường học. Và cũng giống như trẻ em xây dựng cơ bắp thể chất trong lớp thể dục, chúng sẽ rèn luyện các "cơ bắp xã hội" của mình trong "lớp học kết nối".
Trong thập kỷ tới, tôi thấy các thành phố và khu dân cư của chúng ta được thiết kế với sự chú trọng đến sức khỏe xã hội, nơi những nơi tụ họp sôi nổi sẽ thúc đẩy sự đoàn kết và những người xây dựng cộng đồng được trao quyền để biến chúng thành hiện thực. Trong thập kỷ tới, tôi tin rằng sức khỏe xã hội sẽ ăn sâu vào ý thức tập thể của chúng ta như sức khỏe tinh thần ngày nay.
Bởi vì cách đây không lâu, sức khỏe tinh thần là một chủ đề cấm kỵ bị bao trùm bởi sự kỳ thị. Và giờ đây, những nhân vật của công chúng nói về nó một cách cởi mở, có cả một ngành công nghiệp để hỗ trợ nó, và ngày càng nhiều người nghĩ về việc đi trị liệu tâm lý giống như đi tập gym.
Trong tương lai này, sự cô đơn sẽ giảm bớt, cũng như việc hút thuốc đã giảm đi khi chúng ta nhận ra và coi nó là một vấn đề sức khỏe cộng đồng. Trong tương lai này, tôi hy vọng rằng sức khỏe xã hội sẽ được đan cài sâu sắc vào kết cấu văn hóa của chúng ta đến mức không ai cần đến hướng dẫn 5-3-1 nữa.
Vì vậy, để đạt được điều đó, hãy ưu tiên các mối quan hệ không chỉ cho bạn, mà còn cho những người bạn yêu thương. Bởi vì vẻ đẹp của việc nuôi dưỡng sức khỏe xã hội của chính bạn là nó sẽ tự nhiên làm phong phú thêm sức khỏe xã hội của tất cả những người mà bạn kết nối.

Xin cảm ơn.
(Vỗ tay)
    `,
    // --- END: NỘI DUNG DỊCH ---
  },
  {
    id: 'book2',
    title: 'The Journey of Bytes',
    author: 'Code Weaver',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=Journey+of+Bytes',
    audioUrls: {
      'Hope': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/book1-hope-voice.mp3',
      'Matilda': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/elevenlabs-2025-09-06t12-31-47-matilda-pre-sp100-s50-sb75-se0-b-m2_y6yNk68O.mp3',
      'Hope': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/book1-hope-voice.mp3',
    },
    content: `
Mara, a producer, was prepping Sentinel, an old, broken-down superhero, for a live interview. They were pushing his big comeback: a TV special and a new memoir he didn't even know he'd written. Once a legend, Sentinel was now just a trembling ghost they were trying to sell to the public.
Onstage, the host, Garin, started with the easy, scripted questions. "What's it like to fly?" The teleprompter gave a heroic answer. But Sentinel said, You black out. There's blood in your mouth. The audience went quiet.
Garin tried again, asking about the famous cape. "It soaks up the blood," Sentinel mumbled. In the control room, Mara knew the interview was failing. The scripted nostalgia was turning into a horror show.
Desperate, Garin asked the final question: "Who was your greatest enemy?" The answer was supposed to be the villain, Sovereign.
But Sentinel looked into the camera. "We made him up," he said, his voice suddenly strong. The villain was a lie. The fights were fake. My real enemy? The lies.
The studio scrambled to cut the feed, but it was too late. The truth went viral instantly. In the empty control room, Mara stared at Sentinel’s frozen image on the screen. The hero was a lie, but for the first time all night, he seemed real.
  
    `,
contentVi: `

Mara, một nhà sản xuất, đang chuẩn bị cho buổi phỏng vấn trực tiếp với Sentinel, một siêu anh hùng già nua và suy sụp. Họ đang quảng bá cho sự trở lại của ông: một chương trình TV đặc biệt và một cuốn hồi ký mà chính ông cũng không biết mình đã viết. Từng là một huyền thoại, giờ đây Sentinel chỉ còn là một cái bóng run rẩy mà họ đang cố gắng bán cho công chúng.
Trên sân khấu, người dẫn chương trình Garin bắt đầu với những câu hỏi dễ dãi, có sẵn trong kịch bản. "Cảm giác bay lượn thế nào?" Máy nhắc chữ hiện lên một câu trả lời hào hùng. Nhưng Sentinel đáp: Bạn sẽ ngất đi. Máu trào ra trong miệng. Khán phòng im lặng.
Garin cố gắng lần nữa, hỏi về chiếc áo choàng nổi tiếng. "Nó dùng để thấm máu," Sentinel lẩm bẩm. Trong phòng điều khiển, Mara biết buổi phỏng vấn đang thất bại. Những hoài niệm được dàn dựng đang biến thành một chương trình kinh dị.
Trong tuyệt vọng, Garin hỏi câu cuối cùng: "Ai là kẻ thù lớn nhất của ông?" Câu trả lời đáng lẽ phải là kẻ phản diện Sovereign.
Nhưng Sentinel nhìn thẳng vào máy quay. "Chúng tôi đã bịa ra hắn," ông nói, giọng đột nhiên mạnh mẽ. Kẻ phản diện đó là một lời nói dối. Những trận chiến đó là giả. Kẻ thù thật sự của tôi ư? Là những lời dối trá.
Đài truyền hình vội vã cắt sóng, nhưng đã quá muộn. Sự thật lan truyền trên mạng ngay lập tức. Trong phòng điều khiển trống rỗng, Mara nhìn hình ảnh đông cứng của Sentinel trên màn hình. Vị anh hùng là một lời nói dối, nhưng lần đầu tiên trong cả buổi tối, ông trông thật hơn bao giờ hết.


`,

    
  },
  {
    id: 'book3',
    title: 'Echoes of the Future',
    author: 'Oracle Systems',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=Echoes+Future',
    // Sách này không có audioUrls để kiểm tra việc ẩn/hiện trình phát audio
    content: `
      Prologue: The Whispers
      The 'network' hummed with a quiet 'energy', a constant flow of 'information' painting a picture of a world on the brink of another 'transformation'. Old 'paradigms' were shattering, making way for new 'ideas'.
      "The future is not a fixed 'destination'," a historian 'AI' once lectured. "It's a 'spectrum' of possibilities, shaped by our 'choices' today."
      Young Elara, a 'student' of 'cybernetics', felt this more keenly than most. She believed that 'technology' held the 'key' to solving many of the world's pressing 'issues', from 'climate change' to 'social inequality'.
      "We need 'innovative' solutions," she often told her peers. "And that requires us to 'think' differently, to challenge the 'status quo'."
      Her current 'research' focused on 'decentralized' systems, aiming to create more 'resilient' and 'equitable' infrastructures. It was a daunting 'task', filled with 'technical' hurdles and 'ethical' dilemmas.
      "Every 'line of code' we write, every 'system' we design, has an 'impact'," her mentor, Dr. Aris, reminded her. "We must be 'responsible' for our 'creations'."
      Elara knew the path ahead was long and arduous, but the 'potential' for positive 'change' fueled her 'determination'. The echoes of the future were calling, and she was ready to answer.
    `,
  },
  {
    id: 'book4',
    title: 'Management Essentials',
    author: 'Lead Right Inc.',
    category: 'Management & Leadership',
    coverImageUrl: 'https://placehold.co/200x300/F5B041/333333?text=Mgmt+Essentials',
    audioUrls: { 'Default': 'https://cdn.pixabay.com/download/audio/2023/05/07/audio_6bdffe450b.mp3' }, // Ví dụ: "Corporate Technology"
    content: `Chapter 1: Leading Teams. To lead a team effectively, one must understand motivation, communication, and conflict resolution. This book explores these 'concepts' in depth.`,
  },
  {
    id: 'book5',
    title: 'Marketing Breakthroughs',
    author: 'Market Wizards',
    category: 'Marketing & Sales',
    coverImageUrl: 'https://placehold.co/200x300/76D7C4/333333?text=Marketing+BT',
    content: `Introduction: The new age of marketing is upon us. 'Digital' strategies and 'data analytics' are key. Learn how to 'innovate' and 'capture' your audience.`,
  },
  {
    id: 'book6',
    title: 'Advanced Leadership Tactics',
    author: 'Strategy Gurus',
    category: 'Management & Leadership',
    coverImageUrl: 'https://placehold.co/200x300/F5B041/333333?text=Adv+Leadership',
    content: `Chapter 1: Strategic Vision. Leaders must not only manage but also 'inspire'. This involves 'foresight' and the ability to 'articulate' a compelling future.`,
  },
  {
    id: 'book7',
    title: 'Sales Mastery',
    author: 'Closer Co.',
    category: 'Marketing & Sales',
    coverImageUrl: 'https://placehold.co/200x300/76D7C4/333333?text=Sales+Mastery',
    content: `Unlock the secrets to closing any deal. Understand customer 'psychology', master 'negotiation', and build lasting 'relationships'.`,
  },
];
