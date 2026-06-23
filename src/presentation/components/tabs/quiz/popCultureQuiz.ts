export interface Question {
  question: string
  options: string[]
  correctIndex: number
  category: string
}

// Correct answers distributed: A(0)=Q2,6,10,14,18 | B(1)=Q4,8,12,16,20 | C(2)=Q1,5,9,13,17 | D(3)=Q3,7,11,15,19
export const popCultureQuestions: Question[] = [
  {
    question: "What is the name of Hiccup's dragon in How to Train Your Dragon?",
    options: ['Stormfly', 'Meatlug', 'Toothless', 'Barf & Belch'],
    correctIndex: 2,
    category: 'Movies & TV',
  },
  {
    question: 'Which actor plays Iron Man in the Marvel Cinematic Universe?',
    options: ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Jeremy Renner'],
    correctIndex: 0,
    category: 'Movies & TV',
  },
  {
    question: "What is the name of Wednesday Addams' roommate in Wednesday?",
    options: ['Bianca Barclay', 'Yoko Tanaka', 'Divina de la Muerte', 'Enid Sinclair'],
    correctIndex: 3,
    category: 'Movies & TV',
  },
  {
    question: 'In which city is Friends primarily set?',
    options: ['Los Angeles', 'New York City', 'Chicago', 'Boston'],
    correctIndex: 1,
    category: 'Movies & TV',
  },
  {
    question: 'What is the name of the coffee shop in Friends?',
    options: ['The Brew', 'Java Joe\'s', 'Central Perk', 'Starbucks'],
    correctIndex: 2,
    category: 'Movies & TV',
  },
  {
    question: 'Which artist released the album 1989?',
    options: ['Taylor Swift', 'Ariana Grande', 'Katy Perry', 'Selena Gomez'],
    correctIndex: 0,
    category: 'Music',
  },
  {
    question: 'Which song won the Eurovision Song Contest 2023?',
    options: ['Cha Cha Cha', 'Waterfall', 'Quero', 'Tattoo'],
    correctIndex: 3,
    category: 'Music',
  },
  {
    question: "What is Beyoncé's husband's stage name?",
    options: ['Drake', 'Jay-Z', 'Kanye West', 'Kendrick Lamar'],
    correctIndex: 1,
    category: 'Music',
  },
  {
    question: 'Which band recorded Bohemian Rhapsody?',
    options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Rolling Stones'],
    correctIndex: 2,
    category: 'Music',
  },
  {
    question: 'Who is known as "The King of Pop"?',
    options: ['Michael Jackson', 'Elvis Presley', 'Prince', 'Justin Timberlake'],
    correctIndex: 0,
    category: 'Music',
  },
  {
    question: 'Which social media platform is owned by ByteDance?',
    options: ['Instagram', 'Snapchat', 'Pinterest', 'TikTok'],
    correctIndex: 3,
    category: 'Social Media & Internet',
  },
  {
    question: "What is MrBeast's first name?",
    options: ['Jake', 'Jimmy', 'Logan', 'Donovan'],
    correctIndex: 1,
    category: 'Social Media & Internet',
  },
  {
    question: 'What was X called before its rebranding in 2023?',
    options: ['Instagram', 'Facebook', 'Twitter', 'Tumblr'],
    correctIndex: 2,
    category: 'Social Media & Internet',
  },
  {
    question: 'What does POV stand for on social media?',
    options: ['Point of View', 'Point of Value', 'Person on Video', 'Proof of Vision'],
    correctIndex: 0,
    category: 'Social Media & Internet',
  },
  {
    question: 'Which YouTube channel has the most subscribers as of 2026?',
    options: ['MrBeast', 'PewDiePie', 'Cocomelon', 'T-Series'],
    correctIndex: 3,
    category: 'Social Media & Internet',
  },
  {
    question: 'Which company originally developed Minecraft?',
    options: ['Microsoft', 'Mojang', 'Blizzard', 'Epic Games'],
    correctIndex: 1,
    category: 'Gaming',
  },
  {
    question: "What is the name of Mario's brother?",
    options: ['Wario', 'Waluigi', 'Luigi', 'Yoshi'],
    correctIndex: 2,
    category: 'Gaming',
  },
  {
    question: 'Which company created The Legend of Zelda series?',
    options: ['Nintendo', 'Sony', 'Sega', 'Capcom'],
    correctIndex: 0,
    category: 'Gaming',
  },
  {
    question: 'What is the name of the platform where users publish games made in Roblox Studio?',
    options: ['Fortnite', 'Minecraft', 'Scratch', 'Roblox'],
    correctIndex: 3,
    category: 'Gaming',
  },
  {
    question: 'Which standalone battle royale game released by Activision is called Warzone?',
    options: ['Fortnite', 'Call of Duty: Warzone', 'PUBG', 'Apex Legends'],
    correctIndex: 1,
    category: 'Gaming',
  },
]
