'use client';

import { useState, useEffect } from 'react';
import { isToday, parseISO } from 'date-fns';

const LAST_PROMPT_KEY = 'vibo_last_prompt_date';

export function useDailyPrompt() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // This effect should only run on the client
    const lastShownDateStr = localStorage.getItem(LAST_PROMPT_KEY);
    
    if (lastShownDateStr) {
      const lastShownDate = parseISO(lastShownDateStr);
      if (!isToday(lastShownDate)) {
        setShouldShow(true);
      }
    } else {
      // If it's never been shown, show it.
      setShouldShow(true);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const closePrompt = () => {
    setShouldShow(false);
    localStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
  };

  return { shouldShowPrompt: shouldShow, closePrompt };
}
