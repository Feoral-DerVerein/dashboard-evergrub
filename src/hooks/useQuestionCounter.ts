import { useState, useEffect } from 'react';

const MAX_DAILY_QUESTIONS = 50;
const STORAGE_KEY = 'daily_question_count';

interface QuestionCount {
  count: number;
  date: string;
}

export const useQuestionCounter = () => {
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [questionsRemaining, setQuestionsRemaining] = useState(MAX_DAILY_QUESTIONS);
  const [canAsk, setCanAsk] = useState(true);

  // Get today's date as string
  const getTodayString = () => new Date().toDateString();

  // Load counter from localStorage
  const loadCounter = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: QuestionCount = JSON.parse(stored);
        const today = getTodayString();
        
        if (data.date === today) {
          // Same day, use stored count
          setQuestionsUsed(data.count);
          setQuestionsRemaining(MAX_DAILY_QUESTIONS - data.count);
          setCanAsk(data.count < MAX_DAILY_QUESTIONS);
        } else {
          // New day, reset counter
          resetCounter();
        }
      } else {
        // No stored data, start fresh
        resetCounter();
      }
    } catch (error) {
      console.error('Error loading question counter:', error);
      resetCounter();
    }
  };

  // Reset counter for new day
  const resetCounter = () => {
    setQuestionsUsed(0);
    setQuestionsRemaining(MAX_DAILY_QUESTIONS);
    setCanAsk(true);
    saveCounter(0);
  };

  // Save counter to localStorage
  const saveCounter = (count: number) => {
    const data: QuestionCount = {
      count,
      date: getTodayString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // Increment counter when question is asked
  const incrementCounter = () => {
    const newCount = questionsUsed + 1;
    setQuestionsUsed(newCount);
    setQuestionsRemaining(MAX_DAILY_QUESTIONS - newCount);
    setCanAsk(newCount < MAX_DAILY_QUESTIONS);
    saveCounter(newCount);
  };

  // Load counter on mount
  useEffect(() => {
    loadCounter();
  }, []);

  return {
    questionsUsed,
    questionsRemaining,
    maxQuestions: MAX_DAILY_QUESTIONS,
    canAsk,
    incrementCounter
  };
};