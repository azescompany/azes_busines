/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/compositions/DetailsSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Media + facts details layout skeleton (ads dialog)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { AzesSkeleton } from '../AzesSkeleton/AzesSkeleton';

export function DetailsSkeleton() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
        gap: 3,
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <AzesSkeleton shape="image" height={theme.spacing(28)} index={0} />
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <AzesSkeleton
              key={i}
              shape="image"
              width={theme.spacing(8)}
              height={theme.spacing(6)}
              index={1 + i}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <AzesSkeleton shape="text" width="70%" height={theme.spacing(3)} index={5} />
        <AzesSkeleton shape="text" width="40%" height={theme.spacing(4)} index={6} />
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
          <AzesSkeleton shape="chip" index={7} />
          <AzesSkeleton shape="chip" index={8} />
          <AzesSkeleton shape="chip" index={9} />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mt: 1,
          }}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <AzesSkeleton shape="text" width="40%" index={10 + i * 2} />
              <AzesSkeleton shape="text" width="70%" index={11 + i * 2} />
            </Box>
          ))}
        </Box>
        <AzesSkeleton shape="text" lines={4} index={18} />
      </Box>
    </Box>
  );
}
