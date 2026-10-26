/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/theme/ThemeProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Native theme context from @azes/design-tokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { getTheme, type Theme, type ThemeName } from '@azes/design-tokens';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

const ThemeContext = createContext<Theme>(getTheme('light'));

export type ThemeProviderProps = {
  theme?: ThemeName;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function ThemeProvider({ theme = 'light', children, style, testID }: ThemeProviderProps) {
  const value = useMemo(() => getTheme(theme), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <View
        testID={testID}
        style={[{ flex: 1, backgroundColor: value.color.background.canvas }, style]}
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
