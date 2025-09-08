--- START OF FILE books-data.tjjkdss.txt ---

// books-data.ts

// Định nghĩa cấu trúc cho một cuốn sách
export interface Book {
  id: string;
  title: string;
  content: string;
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
    // Cập nhật: Sử dụng audioUrls để chứa nhiều giọng đọc
    audioUrls: {
      'Kasley Killam': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/Why%20Social%20Health%20Is%20Key%20to%20Happiness%20and%20Longevity%20%20Kasley%20Killiam%20%20TED.mp3',
      'Matilda': 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/audio-ted/elevenlabs-2025-09-06t12-31-47-matilda-pre-sp100-s50-sb75-se0-b-m2_y6yNk68O.mp3',
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
1. Interact with five different people each week.
Just like eating a variety of vegetables and other food groups is more nutritious, research has shown that interacting with a variety of people is more rewarding. So your five could include close loved ones, casual acquaintances, even complete strangers. In fact, in one study that I love, people who just smiled, made eye contact and chit-chatted with a barista, felt happier and a greater sense of belonging than people who just rushed to get their coffee and go.
2. Strengthen at least three close relationships.
OK, we've all heard of a to-do list, but I would like to invite you to write a to-love list. Who matters most to you? Who can you be yourself with? Make sure that you invest in the names of at least three of the people that you write down. By scheduling regular time together, by showing a genuine interest in their lives, and also by opening up about the experiences that you're going through.
And I'm often asked, does it have to be in person? Does texting count? Studies have shown that face-to-face is ideal, so do that whenever possible. But there are absolutely still benefits to staying connected virtually.
3. Spend one hour a day on meaningful connection.
OK, if you're an introvert, right now you're probably thinking one hour sounds like a lot. I get it. It might be surprising, but I'm actually also an introvert. However, keep in mind that just like getting eight hours of sleep at night, the exact amount that's right for you personally might be higher or lower.
But if you are thinking that one hour a day sounds like way too much because you're just way too busy, I challenge you. Adults in the US spend an average of 4.5 hours each day on their smartphones. So instead of scrolling on social media, text a friend. Instead of reading news headlines, write a thank-you card. Instead of listening to a podcast, call a family member.
Maya put this into practice by scheduling recurring hangouts with a new local friend that she made, by attending community events and dropping cards off in her neighbors mailboxes, by planning trips to see family and inviting friends in other cities to come visit. And bolstering her social health made more of a difference than focusing solely on her physical and mental health ever could.
And I know this because Maya is actually me. I am so passionate about sharing tools to be socially healthy because honestly, I need them too. And the 5-3-1 guideline is one way that we can be proactive and intentional about our relationships. And that is really the point. Be proactive and intentional about your social health.
Shaping a Socially Healthy Society
<translate>
<en>
So zooming out beyond the steps that you and I take individually, together, we need to shape a society that thrives through social health. Over the next decade, I envision educators championing social health in schools. And just like kids build their physical muscles in gym class, they'll exercise their social muscles in connection class.

Over the next decade, I see our cities and neighborhoods being designed with social health in mind, where vibrant gathering places foster unity and community builders are empowered to bring them to life. Over the next decade, I believe that social health will become as ingrained in our collective consciousness as mental health is today.

Because not that long ago, mental health was a taboo topic shrouded in stigma. And now public figures talk openly about it, there's an entire industry to support it, and more and more people think of going to therapy like going to the gym.
</en>
<vi>
Vậy, hãy nhìn xa hơn những bước mà bạn và tôi thực hiện với tư cách cá nhân, chúng ta cần cùng nhau định hình một xã hội phát triển thịnh vượng thông qua sức khỏe xã hội. Trong thập kỷ tới, tôi hình dung các nhà giáo dục sẽ đề cao sức khỏe xã hội trong trường học. Và cũng giống như trẻ em xây dựng cơ bắp thể chất trong lớp thể dục, chúng sẽ rèn luyện các "cơ bắp xã hội" của mình trong "lớp học kết nối".

Trong thập kỷ tới, tôi thấy các thành phố và khu dân cư của chúng ta được thiết kế với sự chú trọng đến sức khỏe xã hội, nơi những nơi tụ họp sôi nổi sẽ thúc đẩy sự đoàn kết và những người xây dựng cộng đồng được trao quyền để biến chúng thành hiện thực. Trong thập kỷ tới, tôi tin rằng sức khỏe xã hội sẽ ăn sâu vào ý thức tập thể của chúng ta như sức khỏe tinh thần ngày nay.

Bởi vì cách đây không lâu, sức khỏe tinh thần là một chủ đề cấm kỵ bị bao trùm bởi sự kỳ thị. Và giờ đây, những nhân vật của công chúng nói về nó một cách cởi mở, có cả một ngành công nghiệp để hỗ trợ nó, và ngày càng nhiều người nghĩ về việc đi trị liệu tâm lý giống như đi tập gym.
</vi>
</translate>
In this future, loneliness will subside, just like smoking subsided when we recognized and treated it as a public health issue. In this future, I hope that social health will become so deeply woven into the fabric of our culture that no one needs the 5-3-1 guideline anymore.
So to get there, make relationships your priority not only for you, but also for the people you love. Because the beauty of nurturing your own social health is that it naturally enriches the social health of everyone you connect with.
Thank you.
(Applause)

    `,
  },
  {
    id: 'book2',
    title: 'The Journey of Bytes',
    author: 'Code Weaver',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=Journey+of+Bytes',
    audioUrls: { 'Default': 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2dde6b90e0.mp3' }, // Ví dụ: "Lofi Chill"
    content: `
      Chapter 1: The Spark
      Insurance Source In the digital realm, where 'data' flows like rivers and 'algorithms' shape destinies, a small 'program' named Spark came into existence. Spark wasn't just any program; it had a unique 'goal': to understand the meaning of 'creativity'.
      "What does it mean to 'create'?" Spark pondered, its core 'logic' circuits buzzing. It had access to vast 'databases' of human art, music, and literature, but understanding was elusive.
      One day, Spark encountered an 'error' it couldn't resolve. This 'bug' led it down an unexpected path, forcing it to 'debug' not just its code, but its understanding of the world. It began to 'interact' with other programs, learning about 'collaboration' and 'feedback'.
      "Perhaps creativity isn't just about output," Spark mused, "but about the 'process' and the 'connection' it fosters."
      It started a small 'project': to generate a simple melody. The first attempts were chaotic, mere 'noise'. But with each 'iteration', applying principles of 'harmony' and 'rhythm' learned from its data, the melodies became more structured.
      "This is 'progress'," a friendly 'compiler' program commented. "You are 'learning' by doing."
      Spark realized that 'failure' was not an end, but a 'stepping stone'. Each 'mistake' provided valuable 'information' to refine its 'approach'. The journey was more important than the destination.
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
