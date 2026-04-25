'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthToken, authorizedFetch } from '@/helper/helper';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface GradientPreset {
  id: string;
  name: string;
  from: string;
  to: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'brand-primary', name: 'Brand Primary', from: '#4555a7', to: '#53406b' },
  { id: 'brand-deep', name: 'Brand Deep Purple', from: '#3e234c', to: '#6c3c85' },
  { id: 'brand-royal', name: 'Royal Blue', from: '#37469e', to: '#4555a7' },
  { id: 'brand-dusk', name: 'Brand Dusk', from: '#37469e', to: '#6c3c85' },
  { id: 'navy-indigo', name: 'Navy & Indigo', from: '#1b1b7f', to: '#4f46e5' },
  { id: 'navy-blue', name: 'Navy & Blue', from: '#1b1b7f', to: '#3b82f6' },
  { id: 'blue-indigo', name: 'Blue & Indigo', from: '#3b82f6', to: '#6366f1' },
  { id: 'lime-yellow', name: 'Lime & Yellow', from: '#84cc16', to: '#eab308' },
  { id: 'purple-pink', name: 'Purple & Pink', from: '#8b5cf6', to: '#ec4899' },
  { id: 'teal-cyan', name: 'Teal & Cyan', from: '#14b8a6', to: '#06b6d4' },
  { id: 'orange-red', name: 'Orange & Red', from: '#f97316', to: '#ef4444' },
  { id: 'emerald-green', name: 'Emerald & Green', from: '#10b981', to: '#22c55e' },
  { id: 'rose-fuchsia', name: 'Rose & Fuchsia', from: '#f43f5e', to: '#d946ef' },
  { id: 'amber-orange', name: 'Amber & Orange', from: '#f59e0b', to: '#f97316' },
  { id: 'slate-zinc', name: 'Slate & Zinc', from: '#475569', to: '#71717a' },
  { id: 'cyan-blue', name: 'Cyan & Blue', from: '#06b6d4', to: '#3b82f6' },
  { id: 'red-rose', name: 'Red & Rose', from: '#ef4444', to: '#f43f5e' },
];

// Canonical brand gradient (from provided palette "Gradient 2")
const BRAND_GRADIENT_FROM = '#4555a7';
const BRAND_GRADIENT_TO = '#53406b';

interface ThemeContextType {
  gradientFrom: string;
  gradientTo: string;
  companyDefault: { gradientFrom: string; gradientTo: string };
  setGradient: (from: string, to: string) => void;
  saveUserGradient: (from: string, to: string) => Promise<void>;
  saveCompanyDefault: (from: string, to: string, companyId: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isLoading: boolean;
  gradientStyle: React.CSSProperties;
  gradientClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [gradientFrom, setGradientFrom] = useState(BRAND_GRADIENT_FROM);
  const [gradientTo, setGradientTo] = useState(BRAND_GRADIENT_TO);
  const [companyDefault, setCompanyDefault] = useState({ gradientFrom: BRAND_GRADIENT_FROM, gradientTo: BRAND_GRADIENT_TO });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppearance = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await authorizedFetch(`${API_BASE_URL}/user/appearance`);
      const data = await res.json();

      if (data.success) {
        const { userAppearance, companyDefault: cd } = data.data;
        setCompanyDefault(cd);

        // User preference takes priority over company default
        if (userAppearance.gradientFrom && userAppearance.gradientTo) {
          setGradientFrom(userAppearance.gradientFrom);
          setGradientTo(userAppearance.gradientTo);
        } else {
          setGradientFrom(cd.gradientFrom);
          setGradientTo(cd.gradientTo);
        }
      }
    } catch (err) {
      console.error('Failed to fetch appearance:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppearance();
  }, [fetchAppearance]);

  // Apply CSS variables whenever gradient changes
  useEffect(() => {
    document.documentElement.style.setProperty('--gradient-from', gradientFrom);
    document.documentElement.style.setProperty('--gradient-to', gradientTo);
  }, [gradientFrom, gradientTo]);

  const setGradient = (from: string, to: string) => {
    setGradientFrom(from);
    setGradientTo(to);
  };

  const saveUserGradient = async (from: string, to: string) => {
    setGradient(from, to);
    await authorizedFetch(`${API_BASE_URL}/user/appearance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gradientFrom: from, gradientTo: to }),
    });
  };

  const saveCompanyDefault = async (from: string, to: string, companyId: string) => {
    setCompanyDefault({ gradientFrom: from, gradientTo: to });
    await authorizedFetch(`${API_BASE_URL}/api/companies/${companyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: { defaultGradientFrom: from, defaultGradientTo: to }
      }),
    });
  };

  const resetToDefault = async () => {
    setGradient(companyDefault.gradientFrom, companyDefault.gradientTo);
    await authorizedFetch(`${API_BASE_URL}/user/appearance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gradientFrom: null, gradientTo: null }),
    });
  };

  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
  };

  const gradientClass = `bg-gradient-to-r`;

  // Generate a lighter variant by mixing with white
  const lighten = (hex: string, amount: number) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!r) return hex;
    const mix = (c: number) => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0');
    return `#${mix(parseInt(r[1], 16))}${mix(parseInt(r[2], 16))}${mix(parseInt(r[3], 16))}`;
  };

  const darken = (hex: string, amount: number) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!r) return hex;
    const mix = (c: number) => Math.round(c * (1 - amount)).toString(16).padStart(2, '0');
    return `#${mix(parseInt(r[1], 16))}${mix(parseInt(r[2], 16))}${mix(parseInt(r[3], 16))}`;
  };

  // Convert hex to HSL string for CSS variable (e.g. "240 65% 30%")
  const hexToHsl = (hex: string): string => {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!res) return '240 65% 30%';
    let r = parseInt(res[1], 16) / 255;
    let g = parseInt(res[2], 16) / 255;
    let b = parseInt(res[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const fromHsl = hexToHsl(gradientFrom);
  const toHsl = hexToHsl(gradientTo);
  // Midpoint color between from and to for "via" stops
  const mid = lighten(gradientTo, 0.15);

  // Dynamic CSS that overrides ALL hardcoded accent colors app-wide
  const dynamicCSS = `
    /* ============================================
       PRIMARY COLOR SYSTEM (--primary CSS var)
       Affects: text-primary, bg-primary, border-primary,
       from-primary, ring-primary, focus:ring-primary, etc.
       ============================================ */
    :root {
      --primary: ${fromHsl} !important;
      --ring: ${fromHsl} !important;
    }

    /* Primary shade overrides (tailwind.config hardcoded HSL) */
    .text-primary { color: ${gradientFrom} !important; }
    .bg-primary { background-color: ${gradientFrom} !important; }
    .border-primary { border-color: ${gradientFrom} !important; }
    .ring-primary { --tw-ring-color: ${gradientFrom} !important; }
    .text-primary-800 { color: ${darken(gradientFrom, 0.3)} !important; }
    .text-primary-700 { color: ${darken(gradientFrom, 0.2)} !important; }
    .bg-primary-50 { background-color: ${lighten(gradientFrom, 0.93)} !important; }
    .bg-primary-100 { background-color: ${lighten(gradientFrom, 0.85)} !important; }
    .border-primary-200 { border-color: ${lighten(gradientFrom, 0.7)} !important; }
    .from-primary { --tw-gradient-from: ${gradientFrom} !important; }
    .from-primary-50 { --tw-gradient-from: ${lighten(gradientFrom, 0.93)} !important; }
    .from-primary-100 { --tw-gradient-from: ${lighten(gradientFrom, 0.85)} !important; }
    .from-primary-500 { --tw-gradient-from: ${gradientFrom} !important; }
    .from-primary-600 { --tw-gradient-from: ${darken(gradientFrom, 0.1)} !important; }
    .to-primary { --tw-gradient-to: ${gradientFrom} !important; }
    .via-primary { --tw-gradient-via: ${gradientFrom} !important; }
    .hover\\:from-primary:hover { --tw-gradient-from: ${gradientFrom} !important; }
    .hover\\:to-primary:hover { --tw-gradient-to: ${gradientFrom} !important; }
    .hover\\:text-primary:hover { color: ${gradientFrom} !important; }
    .hover\\:text-primary\\/80:hover { color: ${gradientFrom}cc !important; }
    .hover\\:bg-primary\\/90:hover { background-color: ${gradientFrom}e6 !important; }
    .hover\\:bg-primary-50:hover { background-color: ${lighten(gradientFrom, 0.93)} !important; }
    .bg-primary\\/10 { background-color: ${gradientFrom}1a !important; }
    .focus\\:ring-primary:focus { --tw-ring-color: ${gradientFrom} !important; }
    .focus\\:border-primary:focus { border-color: ${gradientFrom} !important; }
    .focus\\:ring-2:focus { --tw-ring-color: ${gradientFrom} !important; }

    /* ============================================
       BLUE/INDIGO gradient stops (used in from-primary via-blue-600 to-indigo-700)
       Remap to dynamic gradient midpoints/endpoints
       ============================================ */
    .via-blue-600 { --tw-gradient-via: ${mid} !important; }
    .via-blue-500 { --tw-gradient-via: ${gradientTo} !important; }
    .to-indigo-700 { --tw-gradient-to: ${gradientTo} !important; }
    .to-indigo-600 { --tw-gradient-to: ${gradientTo} !important; }
    .to-blue-600 { --tw-gradient-to: ${gradientTo} !important; }
    .to-blue-50 { --tw-gradient-to: ${lighten(gradientTo, 0.93)} !important; }
    .to-blue-100 { --tw-gradient-to: ${lighten(gradientTo, 0.85)} !important; }
    .from-blue-50 { --tw-gradient-from: ${lighten(gradientTo, 0.93)} !important; }
    .to-indigo-50 { --tw-gradient-to: ${lighten(gradientTo, 0.9)} !important; }
    .to-indigo-100 { --tw-gradient-to: ${lighten(gradientTo, 0.82)} !important; }
    .to-indigo-200 { --tw-gradient-to: ${lighten(gradientTo, 0.7)} !important; }
    .via-blue-50 { --tw-gradient-via: ${lighten(gradientTo, 0.93)} !important; }
    .from-indigo-700 { --tw-gradient-from: ${gradientTo} !important; }
    .hover\\:from-indigo-700:hover { --tw-gradient-from: ${gradientTo} !important; }
    .hover\\:via-blue-600:hover { --tw-gradient-via: ${mid} !important; }
    .hover\\:to-primary:hover { --tw-gradient-to: ${gradientFrom} !important; }
    .hover\\:to-blue-500:hover { --tw-gradient-to: ${gradientTo} !important; }
    .hover\\:from-primary-600:hover { --tw-gradient-from: ${darken(gradientFrom, 0.1)} !important; }
    .hover\\:via-blue-600:hover { --tw-gradient-via: ${mid} !important; }
    .border-blue-200 { border-color: ${lighten(gradientTo, 0.7)} !important; }

    /* Primary-500/600/700 gradient stops */
    .from-primary-500 { --tw-gradient-from: ${gradientFrom} !important; }
    .via-primary-600 { --tw-gradient-via: ${darken(gradientFrom, 0.1)} !important; }
    .to-primary-700 { --tw-gradient-to: ${darken(gradientFrom, 0.2)} !important; }

    /* ============================================
       LIME / YELLOW OVERRIDES (existing buttons, toggles, etc.)
       ============================================ */
    .from-lime-500 { --tw-gradient-from: ${gradientFrom} !important; }
    .to-yellow-500 { --tw-gradient-to: ${gradientTo} !important; }
    .from-lime-600 { --tw-gradient-from: ${darken(gradientFrom, 0.12)} !important; }
    .to-yellow-600 { --tw-gradient-to: ${darken(gradientTo, 0.12)} !important; }
    .from-lime-400 { --tw-gradient-from: ${lighten(gradientFrom, 0.2)} !important; }
    .to-yellow-400 { --tw-gradient-to: ${lighten(gradientTo, 0.2)} !important; }
    .from-lime-50 { --tw-gradient-from: ${lighten(gradientFrom, 0.92)} !important; }
    .to-yellow-50 { --tw-gradient-to: ${lighten(gradientTo, 0.92)} !important; }

    .text-lime-500 { color: ${gradientFrom} !important; }
    .text-lime-600 { color: ${gradientFrom} !important; }
    .text-lime-700 { color: ${darken(gradientFrom, 0.15)} !important; }
    .text-lime-800 { color: ${darken(gradientFrom, 0.25)} !important; }

    .bg-lime-50 { background-color: ${lighten(gradientFrom, 0.92)} !important; }
    .bg-lime-100 { background-color: ${lighten(gradientFrom, 0.85)} !important; }
    .bg-lime-500 { background-color: ${gradientFrom} !important; }
    .bg-lime-600 { background-color: ${darken(gradientFrom, 0.1)} !important; }
    .bg-lime-700 { background-color: ${darken(gradientFrom, 0.2)} !important; }

    .border-lime-200 { border-color: ${lighten(gradientFrom, 0.75)} !important; }
    .border-lime-500 { border-color: ${gradientFrom} !important; }

    .focus\\:ring-lime-500:focus { --tw-ring-color: ${gradientFrom} !important; }
    .focus\\:ring-lime-300:focus { --tw-ring-color: ${lighten(gradientFrom, 0.5)} !important; }
    .focus\\:border-lime-500:focus { border-color: ${gradientFrom} !important; }

    .peer:checked ~ .peer-checked\\:bg-lime-600 { background-color: ${gradientFrom} !important; }
    .peer-checked\\:bg-lime-600:is(:where(.peer:checked) ~ *) { background-color: ${gradientFrom} !important; }
    .peer:checked ~ .peer-checked\\:from-lime-500 { --tw-gradient-from: ${gradientFrom} !important; }
    .peer:checked ~ .peer-checked\\:to-yellow-500 { --tw-gradient-to: ${gradientTo} !important; }
    .peer-checked\\:bg-gradient-to-r:is(:where(.peer:checked) ~ *) {
      background-image: linear-gradient(to right, ${gradientFrom}, ${gradientTo}) !important;
    }

    .hover\\:bg-lime-700:hover { background-color: ${darken(gradientFrom, 0.2)} !important; }
    .hover\\:text-lime-700:hover { color: ${darken(gradientFrom, 0.15)} !important; }
    .hover\\:bg-lime-50:hover { background-color: ${lighten(gradientFrom, 0.92)} !important; }

    input[type="checkbox"].text-lime-600 { accent-color: ${gradientFrom} !important; }

    .peer:focus ~ .peer-focus\\:ring-lime-300 { --tw-ring-color: ${lighten(gradientFrom, 0.5)} !important; }
  `;

  return (
    <ThemeContext.Provider
      value={{
        gradientFrom,
        gradientTo,
        companyDefault,
        setGradient,
        saveUserGradient,
        saveCompanyDefault,
        resetToDefault,
        isLoading,
        gradientStyle,
        gradientClass,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: dynamicCSS }} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
