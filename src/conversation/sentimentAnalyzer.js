import Sentiment from 'sentiment';
const sentiment = new Sentiment();

function analyzeSentiment(text) {
  const result = sentiment.analyze(text);
  
  // Normalize score to a -1 to 1 range (if not already)
  // The 'sentiment' library's score is already typically in a reasonable range, 
  // but we can ensure it's within -1 to 1 for easier interpretation.
  let normalizedScore = result.score / 5; // Assuming max score of 5 or so for typical sentences
  if (normalizedScore > 1) normalizedScore = 1;
  if (normalizedScore < -1) normalizedScore = -1;

  let overallSentiment = 'neutral';
  if (normalizedScore > 0.6) {
    overallSentiment = 'very positive';
  } else if (normalizedScore > 0.2) {
    overallSentiment = 'positive';
  } else if (normalizedScore < -0.6) {
    overallSentiment = 'very negative';
  } else if (normalizedScore < -0.2) {
    overallSentiment = 'negative';
  }

  return {
    score: result.score,
    normalizedScore: normalizedScore,
    comparative: result.comparative,
    overall: overallSentiment,
    words: result.words,
    positive: result.positive,
    negative: result.negative,
  };
}

export {
  analyzeSentiment,
};