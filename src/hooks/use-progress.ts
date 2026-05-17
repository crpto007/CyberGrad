'use client';

import { useState, useEffect, useCallback } from 'react';

type ProgressData = {
  completion: number; // percentage
  scores: number[]; // array of scores (0 or 1)
  modulesCompleted: number;
};

const TOTAL_MODULES_PER_PATH = 10; // Assume a fixed number of modules for calculation

function getInitialState(pathSlug: string): ProgressData {
  if (typeof window === 'undefined') {
    return { completion: 0, scores: [], modulesCompleted: 0 };
  }

  try {
    const item = window.localStorage.getItem(`progress-${pathSlug}`);
    if (item) {
      const data = JSON.parse(item);
      // Basic validation
      if (
        typeof data.completion === 'number' &&
        Array.isArray(data.scores) &&
        typeof data.modulesCompleted === 'number'
      ) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error reading from localStorage', error);
  }

  return { completion: 0, scores: [], modulesCompleted: 0 };
}

export function useProgress(pathSlug: string) {
  const [progress, setProgress] = useState<ProgressData>(() => getInitialState(pathSlug));

  useEffect(() => {
    // Sync state if it changes in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `progress-${pathSlug}`) {
        setProgress(getInitialState(pathSlug));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathSlug]);

  const updateProgress = useCallback(
    (newScore: number) => {
      setProgress((prevProgress) => {
        const newScores = [...prevProgress.scores, newScore];
        const newModulesCompleted = prevProgress.modulesCompleted + 1;
        const newCompletion = (newModulesCompleted / TOTAL_MODULES_PER_PATH) * 100;

        const newState: ProgressData = {
          scores: newScores,
          modulesCompleted: newModulesCompleted,
          completion: Math.min(100, newCompletion),
        };

        try {
          window.localStorage.setItem(
            `progress-${pathSlug}`,
            JSON.stringify(newState)
          );
        } catch (error) {
          console.error('Error writing to localStorage', error);
        }

        return newState;
      });
    },
    [pathSlug]
  );

  const getProgress = useCallback(() => {
    const totalScore = progress.scores.reduce((sum, score) => sum + score, 0);
    const averageScore = progress.scores.length > 0 ? totalScore / progress.scores.length : -1;

    return {
      completion: progress.completion,
      averageScore,
      modulesCompleted: progress.modulesCompleted,
    };
  }, [progress]);
  
  const getPerformanceForAI = useCallback(() => {
     const recentScores = progress.scores.slice(-5);
     if (recentScores.length === 0) return 0.5; // Start with medium difficulty
     const totalScore = recentScores.reduce((sum, score) => sum + score, 0);
     return totalScore / recentScores.length;
  }, [progress.scores]);

  return { updateProgress, getProgress, getPerformanceForAI };
}
