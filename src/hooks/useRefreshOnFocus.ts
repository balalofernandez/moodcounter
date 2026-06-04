import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/** Re-runs `refresh` whenever the screen regains focus (e.g. after dismissing the log modal). */
export function useRefreshOnFocus(refresh: () => void) {
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );
}
