import type { ThemeConfig } from 'antd';

/**
 * Ant Design theme configuration aligned with the brand palette.
 * Primary: #37469E | Gradient: #4555A7 -> #53406B | Background: #FEF9F3
 *
 * Usage:
 * import { antdTheme } from '@/lib/antd-theme';
 * <ConfigProvider theme={antdTheme}>
 *   {children}
 * </ConfigProvider>
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Primary brand color
    colorPrimary: '#37469E',

    // Primary color variations (derived from #37469E HSL(232 48% 42%))
    colorPrimaryHover: '#4555a7',
    colorPrimaryActive: '#242e72',
    colorPrimaryBg: '#f3f4fc',
    colorPrimaryBgHover: '#e4e6f6',
    colorPrimaryBorder: '#8c94d6',
    colorPrimaryBorderHover: '#626fbe',
    colorPrimaryText: '#242e72',
    colorPrimaryTextHover: '#37469e',
    colorPrimaryTextActive: '#1c2459',

    // Link colors
    colorLink: '#37469E',
    colorLinkHover: '#4555a7',
    colorLinkActive: '#242e72',

    // Status colors (kept conventional but warm-toned to harmonise with cream bg)
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#37469E',

    // Canvas
    colorBgLayout: '#fef9f3',

    // Border and background
    borderRadius: 8,

    // Font
    fontSize: 14,
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      primaryColor: '#ffffff',
      algorithm: true,
    },
    Menu: {
      itemSelectedBg: '#f3f4fc',
      itemSelectedColor: '#37469E',
    },
    Table: {
      headerBg: '#f3f4fc',
      headerColor: '#242e72',
    },
    Card: {
      headerBg: 'transparent',
    },
    Tabs: {
      itemSelectedColor: '#37469E',
      itemHoverColor: '#4555a7',
    },
  },
};

export default antdTheme;
