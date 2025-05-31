// Define the structure for a Book
export interface Book {
  id: string;
  title: string;
  content: string;
  author?: string;
  category: string; // Added category
  coverImageUrl?: string; // Added cover image URL
}

// Sample book data
export const sampleBooks: Book[] = [
  {
    id: 'book1',
    title: 'A New Beginning',
    author: 'AI Storyteller',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=A+New+Beginning',
    content: `
      Chapter 1: A New Beginning
      In a world of constant change, where technology and humanity intertwine, a new era has begun. Everything seems to be evolving rapidly, from how we communicate to how we learn.
      "It's hard to believe we've made such incredible progress," Sarah said, her eyes gazing out the window. "Everything is a continuous development."
      Daily life has become more complex, yet full of promise. Concepts like "artificial intelligence" and "virtual reality" are no longer science fiction but have become an integral part of reality.
      One of the biggest challenges is how to adapt to these changes. "We need to learn continuously," David, a renowned scientist, stated at a recent conference. "Knowledge is the key to survival in this era."
      He emphasized the importance of "critical thinking" and the ability to "solve problems." "Don't just accept what you hear," he advised. "Always seek 'reliable' information 'sources' and 'analyze' it carefully."
      Meanwhile, in another corner of the city, a group of young developers are working on a new "application." Their goal is to create a tool that helps people easily "access" information and "connect" with each other.
      "We believe that 'education' is everyone's right," a team member said. "And technology can be the 'bridge' to make that a reality."
      They are facing many "challenges," but their spirit remains undiminished. "Every 'problem' is an 'opportunity' to learn and grow," they often remind each other.
      And so, against the backdrop of a world that is constantly "evolving," the story of learning and adaptation continues to be written.
    `,
  },
  {
    id: 'book2',
    title: 'The Journey of Bytes',
    author: 'Code Weaver',
    category: 'Technology & Future',
    coverImageUrl: 'https://placehold.co/200x300/A9CCE3/333333?text=Journey+of+Bytes',
    content: `
      Chapter 1: The Spark
      In the digital realm, where 'data' flows like rivers and 'algorithms' shape destinies, a small 'program' named Spark came into existence. Spark wasn't just any program; it had a unique 'goal': to understand the meaning of 'creativity'.
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
