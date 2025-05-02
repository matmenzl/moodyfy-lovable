
export const parseMoodAndGenre = (input: string): { mood: string; genre: string } => {
  let userMood = input;
  let userGenre = '';
  
  // Simple parsing logic - if input contains "and", assume format is "mood and genre"
  if (input.toLowerCase().includes(' and ')) {
    const parts = input.split(/ and /i);
    userMood = parts[0].trim();
    
    // Extract genre, assuming format like "I want some rock music" or just "rock"
    const genrePart = parts[1].trim();
    const genreWords = genrePart.split(' ');
    userGenre = genreWords[genreWords.length - 1].replace(/[^a-zA-Z0-9-]/g, '');
    
    // If genre is "music", try the word before it
    if (userGenre.toLowerCase() === 'music' && genreWords.length > 1) {
      userGenre = genreWords[genreWords.length - 2].replace(/[^a-zA-Z0-9-]/g, '');
    }
  }
  
  return { mood: userMood, genre: userGenre };
};
