import { useEffect } from 'react';
import { useGetSettingsData } from './useQueries';

export function useTheme() {
  const { data: settingsData } = useGetSettingsData();

  useEffect(() => {
    if (settingsData?.adminConfig?.theme) {
      const { primaryColor, secondaryColor } = settingsData.adminConfig.theme;
      
      // Apply theme colors to CSS variables
      const root = document.documentElement;
      
      // Convert hex to OKLCH (simplified - using the colors directly for now)
      if (primaryColor) {
        root.style.setProperty('--theme-primary', primaryColor);
      }
      if (secondaryColor) {
        root.style.setProperty('--theme-secondary', secondaryColor);
      }
    }
  }, [settingsData]);

  return {
    theme: settingsData?.adminConfig?.theme,
  };
}
