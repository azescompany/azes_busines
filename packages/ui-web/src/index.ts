/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-11
 * ║ Purpose: Public entry point for @azes/ui-web
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import './theme/mui-augment';
export { Box, type BoxProps } from './components/Box/Box';
export { Stack, type StackProps } from './components/Stack/Stack';
export {
  Text,
  type TextProps,
  type TextSize,
  type TextTone,
  type TextWeight,
} from './components/Text/Text';
export {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './components/Button/Button';
export {
  AzesAccordion,
  type AzesAccordionActiveFilter,
  type AzesAccordionCrudProps,
  type AzesAccordionProps,
  type AzesAccordionSearchProps,
} from './components/Accordion/AzesAccordion';
export {
  AzesConfirmDialog,
  type AzesConfirmDialogProps,
} from './components/Accordion/AzesConfirmDialog';
export { AzesFormGrid, type AzesFormGridProps } from './components/Accordion/AzesFormGrid';
export {
  AzesDialogProvider,
  closeDialog,
  DEFAULT_AZES_DIALOG_LABELS,
  openDialog,
  useAzesDialog,
  useOptionalAzesDialog,
  type AzesConfirmDialogOptions,
  type AzesDangerDialogOptions,
  type AzesDialogApi,
  type AzesDialogAutoFocus,
  type AzesDialogLabels,
  type AzesDialogMaxWidth,
  type AzesDialogOptions,
  type AzesDialogProviderProps,
  type AzesDialogVariant,
  type AzesNotifyDialogOptions,
  type AzesNotifyVariant,
} from './dialog';
export {
  AzesSidePanel,
  AzesSidePanelHost,
  AzesSidePanelProvider,
  DEFAULT_AZES_SIDE_PANEL_DISCARD_LABELS,
  DEFAULT_AZES_SIDE_PANEL_HOST_LABELS,
  useSidePanel,
  useSidePanelState,
  type AzesSidePanelDiscardLabels,
  type AzesSidePanelHostLabels,
  type AzesSidePanelId,
  type AzesSidePanelProps,
  type AzesSidePanelProviderProps,
  type AzesSidePanelRegistry,
  type AzesSidePanelWidth,
} from './side-panel';
export {
  AzesCarousel,
  DEFAULT_AZES_CAROUSEL_LABELS,
  formatCarouselLabel,
  type AzesCarouselImage,
  type AzesCarouselLabels,
  type AzesCarouselProps,
  type AzesCarouselVariant,
} from './carousel';
export { AzesThemeProvider, type AzesThemeProviderProps } from './theme/AzesThemeProvider';
export {
  AZES_FONT_PRESET_IDS,
  createAzesTheme,
  DEFAULT_AZES_FONT_PRESET,
  isAzesFontPresetId,
  resolveAzesFontPresetId,
  type AzesDensity,
  type AzesDirection,
  type AzesFontPresetId,
  type CreateAzesThemeInput,
} from './theme/createAzesTheme';
export type { AzesLoginShellTokens, AzesThemeExtension } from './theme/azes-theme-types';
export { isPrimaryContrastSafe } from './theme/palette';
export { DEFAULT_AZES_DENSITY } from './theme/density';
export { azesVariantMapping, type AzesVariantMapping } from './theme/typography';
export {
  AZES_COLOR_SCHEME_ATTRIBUTE,
  AZES_COLOR_SCHEME_STORAGE_KEY,
  AZES_MODE_STORAGE_KEY,
  AZES_PRIMARY_COOKIE,
  AZES_PRIMARY_STORAGE_KEY,
  brandSeeds,
  brandSeedDarkPrimary,
  brandSeedOrder,
  brandSeedSecondary,
  DEFAULT_PRIMARY,
  DEFAULT_SECONDARY,
  persistPrimary,
  readStoredPrimary,
  resolveBrandColor,
  resolveBrandPrimary,
  resolveBrandSecondary,
  type BrandSeedName,
} from './theme/brand';
export {
  AZES_FAVICON_HOME_PATHS,
  AZES_FAVICON_KEY_PATHS,
  AZES_FAVICON_LINK_ATTR,
  AZES_FAVICON_VIEWBOX,
  applyAzesFavicon,
  buildAzesFaviconDataUrl,
  buildAzesFaviconSvg,
  buildAzesKeyFaviconDataUrl,
  buildAzesKeyFaviconSvg,
  createAzesFaviconHtmlPlugin,
  getAzesFaviconPrepaintScript,
  syncAzesFaviconFromPrefs,
} from './theme/azesFavicon';
export {
  contrastRatio,
  deltaE,
  hexToOklch,
  hueDelta,
  oklchToHex,
  type Oklch,
} from './theme/color-utils';
export {
  deriveFocusFromPrimary,
  deriveLinkFromPrimary,
  deriveSecondaryFromPrimary,
  hexToHsl,
  hslToHex,
  type ColorSchemeName,
} from './theme/harmony';
export { createSurfaceScale, type AzesSurfaceScale } from './theme/surfaces';
export {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  AppBar,
  Autocomplete,
  Avatar,
  AvatarGroup,
  Backdrop,
  Badge,
  Breadcrumbs,
  ButtonGroup,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fade,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  MenuList,
  MuiBox,
  MuiButton,
  OutlinedInput,
  Pagination,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slider,
  Snackbar,
  SvgIcon,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
  keyframes,
  useColorScheme,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
  type CSSObject,
  type SxProps,
  type Theme,
} from './catalog';
