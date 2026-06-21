export interface Quote {
  text: string;
  author: string;
}

export const CAMPUS_QUOTES: Quote[] = [
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  },
  {
    text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.",
    author: "Lou Holtz"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch"
  },
  {
    text: "There are no shortcuts to any place worth going.",
    author: "Beverly Sills"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  }
];

export function getDailyQuote(): Quote {
  // Select quote based on day of the month
  const day = new Date().getDate();
  const index = day % CAMPUS_QUOTES.length;
  return CAMPUS_QUOTES[index];
}
