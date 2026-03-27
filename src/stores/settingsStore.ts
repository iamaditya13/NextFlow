import { create } from 'zustand'

export type Theme = 'system' | 'light' | 'dark'
export type SidebarIconStyle = 'colored' | 'simple' | 'minimal'
export type SessionsDisplay = 'all' | 'current'
export type Plan = 'free' | 'basic' | 'pro' | 'max' | 'business' | 'enterprise'

export interface LoginMethods {
  emailPassword: boolean
  google: boolean
  apple: boolean
  sso: boolean
}

export interface UserProfile {
  displayName: string
  handle: string
  bio: string
  email: string
  avatarLetter: string
  avatarColor: string
  social: {
    twitter: string
    instagram: string
    youtube: string
  }
}

export interface ComputeBalance {
  freeDaily: number
  freeDailyMax: number
  oneTime: number
}

interface SettingsState {
  // Theme & appearance
  theme: Theme
  sidebarIconStyle: SidebarIconStyle
  sessionsDisplay: SessionsDisplay
  collapseSidebarForImmersive: boolean
  setTheme: (theme: Theme) => void
  setSidebarIconStyle: (style: SidebarIconStyle) => void
  setSessionsDisplay: (display: SessionsDisplay) => void
  setCollapseSidebarForImmersive: (collapse: boolean) => void

  // User profile
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  updateSocial: (updates: Partial<UserProfile['social']>) => void

  // Plan & compute
  plan: Plan
  compute: ComputeBalance

  // Login methods
  loginMethods: LoginMethods
  toggleLoginMethod: (method: keyof LoginMethods) => void

  // Pricing page
  billingPeriod: 'monthly' | 'yearly'
  setBillingPeriod: (period: 'monthly' | 'yearly') => void
  maxComputeSlider: number
  setMaxComputeSlider: (value: number) => void
  businessComputeSlider: number
  setBusinessComputeSlider: (value: number) => void

  // Settings modal
  settingsOpen: boolean
  openSettings: (path?: string) => void
  closeSettings: () => void
  settingsPath: string

  // FAQ
  openFaqIndex: number | null
  setOpenFaqIndex: (index: number | null) => void

  // Compare plans tab
  comparePlansTab: string
  setComparePlansTab: (tab: string) => void

  // API Tokens
  apiTokens: Array<{ id: string; name: string; token: string; created: string; lastUsed: string }>
  addApiToken: (name: string) => void
  removeApiToken: (id: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  sidebarIconStyle: 'colored',
  sessionsDisplay: 'current',
  collapseSidebarForImmersive: true,
  setTheme: (theme) => set({ theme }),
  setSidebarIconStyle: (style) => set({ sidebarIconStyle: style }),
  setSessionsDisplay: (display) => set({ sessionsDisplay: display }),
  setCollapseSidebarForImmersive: (collapse) => set({ collapseSidebarForImmersive: collapse }),

  profile: {
    displayName: '',
    handle: 'smittenenchantedsaol',
    bio: '',
    email: 'imaditya4work@gmail.com',
    avatarLetter: 'S',
    avatarColor: '#D4A017',
    social: { twitter: '', instagram: '', youtube: '' },
  },
  updateProfile: (updates) =>
    set((s) => ({ profile: { ...s.profile, ...updates } })),
  updateSocial: (updates) =>
    set((s) => ({
      profile: { ...s.profile, social: { ...s.profile.social, ...updates } },
    })),

  plan: 'free',
  compute: { freeDaily: 86, freeDailyMax: 100, oneTime: 0 },

  loginMethods: { emailPassword: false, google: true, apple: false, sso: false },
  toggleLoginMethod: (method) =>
    set((s) => ({
      loginMethods: { ...s.loginMethods, [method]: !s.loginMethods[method] },
    })),

  billingPeriod: 'monthly',
  setBillingPeriod: (period) => set({ billingPeriod: period }),
  maxComputeSlider: 60000,
  setMaxComputeSlider: (value) => set({ maxComputeSlider: value }),
  businessComputeSlider: 80000,
  setBusinessComputeSlider: (value) => set({ businessComputeSlider: value }),

  settingsOpen: false,
  settingsPath: 'overview',
  openSettings: (path) => set({ settingsOpen: true, settingsPath: path || 'overview' }),
  closeSettings: () => set({ settingsOpen: false }),

  openFaqIndex: null,
  setOpenFaqIndex: (index) => set({ openFaqIndex: index }),

  comparePlansTab: 'features',
  setComparePlansTab: (tab) => set({ comparePlansTab: tab }),

  apiTokens: [],
  addApiToken: (name) =>
    set((s) => ({
      apiTokens: [
        ...s.apiTokens,
        {
          id: crypto.randomUUID(),
          name,
          token: `krea_${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`,
          created: new Date().toLocaleDateString(),
          lastUsed: 'Never',
        },
      ],
    })),
  removeApiToken: (id) =>
    set((s) => ({ apiTokens: s.apiTokens.filter((t) => t.id !== id) })),
}))
