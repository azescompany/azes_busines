/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/charts/AzesCharts.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-13
 * ║ Purpose: Line, bar, pie and scatter chart wrappers with AZES palette
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import { useTheme, type Theme, type SxProps } from '@mui/material/styles';
import { BarChart, type BarChartProps } from '@mui/x-charts/BarChart';
import { Gauge, type GaugeProps } from '@mui/x-charts/Gauge';
import { LineChart, type LineChartProps } from '@mui/x-charts/LineChart';
import { PieChart, type PieChartProps } from '@mui/x-charts/PieChart';
import { ScatterChart, type ScatterChartProps } from '@mui/x-charts/ScatterChart';
import { SparkLineChart, type SparkLineChartProps } from '@mui/x-charts/SparkLineChart';
import { useId, type ReactNode } from 'react';

/** When `width` is omitted, fill the parent so MUI X can measure a non-zero size. */
function chartFillSx(width: number | undefined, sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const fill: SxProps<Theme> | false =
    width === undefined ? { width: '100%', maxWidth: '100%' } : false;
  if (sx == null) return fill || {};
  return [fill, ...(Array.isArray(sx) ? sx : [sx])];
}

export const AZES_CHART_HEIGHT = 300;

/** Series colors: primary, secondary, then status colors. Read from CSS variables so dark mode works. */
export function azesChartPalette(theme: Theme): string[] {
  const p = theme.vars.palette;
  return [
    p.primary.main,
    p.secondary.main,
    p.info.main,
    p.success.main,
    p.warning.main,
    p.error.main,
  ];
}

type ChartFrameProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function ChartFrame({ title, description, children }: ChartFrameProps) {
  const id = useId();
  return (
    <Box
      component="figure"
      role="group"
      aria-labelledby={id}
      sx={{ margin: 0, width: '100%', minWidth: 0 }}
    >
      <Box
        component="figcaption"
        id={id}
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {description ? `${title}. ${description}` : title}
      </Box>
      {children}
    </Box>
  );
}

type WithTitle = { title: string; description?: string };

export type AzesLineChartProps = LineChartProps & WithTitle;
export type AzesBarChartProps = BarChartProps & WithTitle;
export type AzesPieChartProps = PieChartProps & WithTitle;
export type AzesScatterChartProps = ScatterChartProps & WithTitle;
export type AzesGaugeProps = Omit<GaugeProps, 'ref'> & Partial<WithTitle>;
export type AzesSparkLineChartProps = Omit<SparkLineChartProps, 'ref'>;

export function AzesLineChart({
  title,
  description,
  height = AZES_CHART_HEIGHT,
  width,
  colors,
  sx,
  ...props
}: AzesLineChartProps) {
  const theme = useTheme();
  return (
    <ChartFrame title={title} description={description}>
      <LineChart
        {...props}
        height={height}
        width={width}
        colors={colors ?? azesChartPalette(theme)}
        sx={chartFillSx(width, sx)}
      />
    </ChartFrame>
  );
}

export function AzesBarChart({
  title,
  description,
  height = AZES_CHART_HEIGHT,
  width,
  colors,
  sx,
  ...props
}: AzesBarChartProps) {
  const theme = useTheme();
  return (
    <ChartFrame title={title} description={description}>
      <BarChart
        {...props}
        height={height}
        width={width}
        colors={colors ?? azesChartPalette(theme)}
        sx={chartFillSx(width, sx)}
      />
    </ChartFrame>
  );
}

export function AzesPieChart({
  title,
  description,
  height = AZES_CHART_HEIGHT,
  width,
  colors,
  sx,
  ...props
}: AzesPieChartProps) {
  const theme = useTheme();
  return (
    <ChartFrame title={title} description={description}>
      <PieChart
        {...props}
        height={height}
        width={width}
        colors={colors ?? azesChartPalette(theme)}
        sx={chartFillSx(width, sx)}
      />
    </ChartFrame>
  );
}

export function AzesScatterChart({
  title,
  description,
  height = AZES_CHART_HEIGHT,
  width,
  colors,
  sx,
  ...props
}: AzesScatterChartProps) {
  const theme = useTheme();
  return (
    <ChartFrame title={title} description={description}>
      <ScatterChart
        {...props}
        height={height}
        width={width}
        colors={colors ?? azesChartPalette(theme)}
        sx={chartFillSx(width, sx)}
      />
    </ChartFrame>
  );
}

/** Thin Gauge wrap — apps must not import `@mui/x-charts` directly. */
export function AzesGauge({ title, description, sx, ...props }: AzesGaugeProps) {
  const chart = <Gauge {...props} sx={sx} />;
  if (!title) return chart;
  return (
    <ChartFrame title={title} description={description}>
      {chart}
    </ChartFrame>
  );
}

/** Thin SparkLine wrap — apps must not import `@mui/x-charts` directly. */
export function AzesSparkLineChart(props: AzesSparkLineChartProps) {
  return <SparkLineChart {...props} />;
}
