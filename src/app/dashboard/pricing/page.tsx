'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  Check,
  X,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react'

// ─── Price data ────────────────────────────────────────────────
const plans = {
  basic: { monthly: 9, yearly: 7, yearlyTotal: 84, saving: 22, compute: 5000 },
  pro: { monthly: 35, yearly: 28, yearlyTotal: 336, saving: 20, compute: 20000 },
  max: { monthly: 105, yearly: 84, yearlyTotal: 1008, saving: 20, compute: 60000 },
  business: { monthly: 200, yearly: 200, compute: 80000 },
}

// ─── FAQ data ──────────────────────────────────────────────────
const faqItems = [
  {
    q: "What's the difference between plans?",
    a: "Our plans are designed to fit different creative needs. Basic is great for individuals getting started, Pro unlocks all video models and workflow automation, Max provides unlimited concurrency and relaxed generations, Business adds team collaboration features, and Enterprise offers custom terms and priority support.",
  },
  {
    q: "How do compute units work?",
    a: "Compute units are the currency for generating content on Krea. Different operations consume different amounts of compute — for example, a standard image generation might use 1-5 units while video generation uses more. Your monthly allocation refreshes at the start of each billing cycle.",
  },
  {
    q: "How do credit rollovers work?",
    a: "Unused compute units from your monthly allocation roll over to the next month for paid plans. Rolled-over credits are used after your fresh monthly allocation is exhausted. Credits roll over for up to 3 months before expiring.",
  },
  {
    q: "Can we share projects and assets?",
    a: "Team collaboration features are currently in development. Business and Enterprise plans will support shared workspaces, asset libraries, and collaborative editing. Stay tuned for updates!",
    badge: "COMING SOON",
  },
  {
    q: "What is SAML SSO and why do I need it?",
    a: "SAML SSO (Single Sign-On) allows your team members to log in using your organization's identity provider (like Okta, Azure AD, or Google Workspace). This provides centralized access control, enhanced security, and simplified user management for larger teams.",
  },
  {
    q: "How does billing work?",
    a: "You're billed at the start of each billing cycle (monthly or yearly). Yearly plans offer significant savings and are billed as a single annual payment. You can upgrade, downgrade, or cancel at any time — changes take effect at the next billing cycle.",
  },
  {
    q: "What support options are available?",
    a: "All paid plans include email support. Pro and Max plans get priority email support with faster response times. Business plans include dedicated account management, and Enterprise plans include priority support with SLA guarantees and Slack Connect integration.",
  },
  {
    q: "Do plans include a commercial license?",
    a: "Yes! All paid plans (Basic and above) include a commercial license that allows you to use generated content for commercial purposes, including client work, marketing materials, and products for sale.",
  },
  {
    q: "Can I switch between plans?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time from your account settings. When upgrading, you'll get immediate access to the new plan's features, and we'll prorate the charge. Downgrades take effect at the next billing cycle.",
  },
  {
    q: "Is Business plan seat-based or team-based?",
    a: "The Business plan is team-based and includes up to 50 seats. Each seat gives a team member full access to all Business features. If you need more than 50 seats, our Enterprise plan offers custom seat arrangements.",
  },
  {
    q: "How do I add or remove members?",
    a: "Team admins can add or remove members from the Team Settings page. Adding a member sends them an invitation email. Removed members immediately lose access but their generated content remains in the team workspace.",
  },
  {
    q: "What happens if we exceed our compute units?",
    a: "When you exhaust your monthly compute units, you can purchase additional compute packs to continue generating. Generations will pause until more compute is available — you'll never be charged unexpectedly. Max and above plans also include unlimited relaxed-mode generations.",
  },
]

// ─── Compare plans data ────────────────────────────────────────
type CellValue = string | boolean | { text: string; color?: string; badge?: string }

interface CompareRow {
  feature: string
  badge?: string
  values: CellValue[] // FREE, BASIC, PRO, MAX, BUSINESS, ENTERPRISE
}

const compareTabs = [
  { id: 'features', label: 'Features & License' },
  { id: 'usage', label: 'Usage & Compute Units' },
  { id: 'teams', label: 'Teams & Admin' },
  { id: 'image', label: 'Image Generation' },
  { id: 'video', label: 'Video Generation' },
  { id: 'other', label: 'Other' },
]

const compareData: Record<string, CompareRow[]> = {
  features: [
    { feature: 'Access to image models', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'Access to video models', values: [{ text: 'Limited', color: 'amber' }, { text: 'Limited', color: 'amber' }, true, true, true, true] },
    { feature: 'Access to LoRA Training', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'Access to real-time models', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'Access to 3D models', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'Access to lipsync models', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'Image concurrency', values: ['1', '4', '8', 'Unlimited', 'Unlimited', 'Unlimited'] },
    { feature: 'Video concurrency', values: [false, '2', '4', 'Unlimited', 'Unlimited', 'Unlimited'] },
    { feature: 'Max images per LoRA', values: ['50', '50', '50', '2,000', '2,000', 'Custom'] },
    { feature: 'Access to Krea Nodes', values: [false, true, true, true, true, true] },
    { feature: 'Access to App Builder', values: [false, true, true, true, true, true] },
    { feature: 'Access to Nodes Agent', badge: 'NEW', values: [false, false, true, true, true, true] },
    { feature: 'Early access to new features', values: [false, false, true, true, true, true] },
    { feature: 'Commercial license', values: [false, true, true, true, true, true] },
    { feature: 'Business Terms of Service', values: [false, false, false, false, true, true] },
    { feature: 'Indemnification', values: [false, false, false, false, false, true] },
  ],
  usage: [
    { feature: 'Monthly compute units', values: ['100/day', '5,000', '20,000', '60,000', '80,000', 'Custom'] },
    { feature: 'Compute pack discounts', values: [false, false, true, true, true, true] },
    { feature: 'Credit rollover', values: [false, true, true, true, true, true] },
  ],
  teams: [
    { feature: 'Team members', values: [false, false, false, false, 'Up to 50', 'Custom'] },
    { feature: 'Custom roles', values: [false, false, false, false, true, true] },
    { feature: 'SSO/SAML', values: [false, false, false, false, false, true] },
    { feature: 'Audit logs', values: [false, false, false, false, false, { text: 'Soon', color: 'amber' }] },
  ],
  image: [
    { feature: 'Standard image generation', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'HD image generation', values: [false, true, true, true, true, true] },
    { feature: 'Upscale to 4K', values: [false, true, true, true, true, true] },
    { feature: 'Upscale to 8K', values: [false, false, true, true, true, true] },
    { feature: 'Upscale to 22K', values: [false, false, false, true, true, true] },
    { feature: 'Real-time generation', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
  ],
  video: [
    { feature: 'Selected video models', values: [false, true, true, true, true, true] },
    { feature: 'All video models', values: [false, false, true, true, true, true] },
    { feature: 'Lipsync models', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'Video concurrency', values: [false, '2', '4', 'Unlimited', 'Unlimited', 'Unlimited'] },
  ],
  other: [
    { feature: 'LoRA fine-tuning', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: '3D model generation', values: [{ text: 'Limited', color: 'amber' }, true, true, true, true, true] },
    { feature: 'Workflow automation (Nodes)', values: [false, true, true, true, true, true] },
    { feature: 'AI Nodes Agent', badge: 'NEW', values: [false, false, true, true, true, true] },
    { feature: 'API access', values: [false, false, true, true, true, true] },
  ],
}

const planColumns = ['FREE', 'BASIC', 'PRO', 'MAX', 'BUSINESS', 'ENTERPRISE']

// ─── Compute packs ─────────────────────────────────────────────
const computePacks = [
  { units: 2000, requirement: 'Any paid plan' },
  { units: 5000, requirement: 'Any paid plan' },
  { units: 10000, requirement: 'Pro or above' },
  { units: 24000, requirement: 'Pro or above' },
  { units: 50000, requirement: 'Max or above' },
]

// ─── Helpers ───────────────────────────────────────────────────
function CellRenderer({ value }: { value: CellValue }) {
  if (value === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />
  if (value === false) return <X className="w-5 h-5 text-gray-300 mx-auto" />
  if (typeof value === 'string') return <span className="text-sm text-gray-700">{value}</span>
  if (typeof value === 'object' && 'text' in value) {
    return (
      <span className={value.color === 'amber' ? 'text-sm text-amber-600 font-medium' : 'text-sm text-gray-700'}>
        {value.text}
      </span>
    )
  }
  return null
}

function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

// ─── Main Page ─────────────────────────────────────────────────
export default function PricingPage() {
  const {
    openFaqIndex,
    setOpenFaqIndex,
    comparePlansTab,
    setComparePlansTab,
  } = useSettingsStore()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [maxComputeSlider, setMaxComputeSlider] = useState(60000)
  const [businessComputeSlider, setBusinessComputeSlider] = useState(80000)

  const isYearly = billingPeriod === 'yearly'

  // Compute Max plan price based on slider
  const maxBaseCompute = 60000
  const maxPricePerUnit = plans.max.monthly / maxBaseCompute
  const maxDynamicPrice = Math.round(maxComputeSlider * maxPricePerUnit)
  const maxYearlyDynamic = Math.round(maxDynamicPrice * 0.8)

  // Compute Business plan price based on slider
  const businessBaseCompute = 80000
  const businessPricePerUnit = plans.business.monthly / businessBaseCompute
  const businessDynamicPrice = Math.round(businessComputeSlider * businessPricePerUnit)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-6">
        {/* ═══ Hero Banner ═══ */}
        <section className="relative bg-gradient-to-r from-gray-900 to-black rounded-xl overflow-hidden min-h-[200px] p-8 mb-12">
          {/* Decorative gradient overlay */}
          <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
            <div className="absolute right-[-20%] top-[-30%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-600/40 via-orange-500/30 to-transparent blur-2xl" />
            <div className="absolute right-[10%] top-[20%] w-[300px] h-[400px] bg-gradient-to-b from-purple-800/50 via-orange-600/20 to-transparent rounded-full blur-xl transform rotate-12" />
            <div className="absolute right-[5%] bottom-0 w-[200px] h-[300px] bg-gradient-to-t from-orange-500/30 via-purple-700/40 to-transparent rounded-t-full blur-lg" />
          </div>
          <div className="relative z-10 flex flex-col justify-center h-full min-h-[136px]">
            <h1 className="text-3xl font-bold text-white mb-3">Why choose Krea</h1>
            <p className="text-gray-300 max-w-lg text-base leading-relaxed">
              The world&apos;s best creative AI studio with 150+ models and 10M+ users
            </p>
          </div>
        </section>

        {/* ═══ Billing Toggle ═══ */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBillingPeriod(isYearly ? 'monthly' : 'yearly')}
            className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 ${isYearly ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isYearly ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
          {isYearly && (
            <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              Save 20% on yearly plans
            </span>
          )}
        </div>

        {/* ═══ Individual Creator Plans ═══ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Individual Creator Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Basic */}
          <div className="relative border border-gray-200 rounded-xl p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">${isYearly ? plans.basic.yearly : plans.basic.monthly}</span>
              <span className="text-sm text-gray-500">/mo</span>
              {isYearly && (
                <span className="text-sm text-gray-400 line-through ml-2">${plans.basic.monthly}</span>
              )}
            </div>
            {isYearly && (
              <p className="text-xs text-gray-500 mb-3">${plans.basic.yearlyTotal} billed yearly, saving {plans.basic.saving}%</p>
            )}
            <p className="text-sm text-gray-500 mb-5">{plans.basic.compute.toLocaleString()} compute units per month</p>
            <ul className="space-y-3 mb-6">
              {[
                'Commercial license',
                'Full access to Image, 3D, and Lipsync models',
                'LoRA fine-tuning with up to 50 images',
                'Upscale & enhance to 4K',
                'Access to selected video models',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button className="bg-black text-white w-full rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
              Get Basic <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pro */}
          <div className="relative border border-gray-200 rounded-xl p-6 bg-white">
            <span className="absolute -top-3 left-6 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
              Most popular
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">${isYearly ? plans.pro.yearly : plans.pro.monthly}</span>
              <span className="text-sm text-gray-500">/mo</span>
              {isYearly && (
                <span className="text-sm text-gray-400 line-through ml-2">${plans.pro.monthly}</span>
              )}
            </div>
            {isYearly && (
              <p className="text-xs text-gray-500 mb-3">${plans.pro.yearlyTotal} billed yearly, saving {plans.pro.saving}%</p>
            )}
            <p className="text-sm text-gray-500 mb-2">{plans.pro.compute.toLocaleString()} compute units per month</p>
            <p className="text-sm text-gray-500 italic mb-5">Everything in Basic plus:</p>
            <ul className="space-y-3 mb-6">
              {[
                { text: 'Access to all video models', badge: null },
                { text: 'Workflow automation with Nodes and Apps', badge: null },
                { text: 'AI-powered Nodes Agent', badge: 'NEW' },
                { text: 'Bulk discounts on compute unit packs', badge: null },
                { text: 'Upscale & enhance to 8K', badge: null },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>
                    {f.text}
                    {f.badge && (
                      <span className="ml-1.5 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {f.badge}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button className="bg-black text-white w-full rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
              Get Pro <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Max */}
          <div className="relative border border-gray-200 rounded-xl p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Max</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">
                ${isYearly ? maxYearlyDynamic : maxDynamicPrice}
              </span>
              <span className="text-sm text-gray-500">/mo</span>
              {isYearly && (
                <span className="text-sm text-gray-400 line-through ml-2">${maxDynamicPrice}</span>
              )}
            </div>
            {isYearly && (
              <p className="text-xs text-gray-500 mb-3">${maxYearlyDynamic * 12} billed yearly, saving 20%</p>
            )}
            <p className="text-sm text-gray-500 mb-2">{maxComputeSlider.toLocaleString()} compute units per month</p>
            {/* Slider */}
            <div className="mb-4">
              <input
                type="range"
                min={40000}
                max={100000}
                step={1000}
                value={maxComputeSlider}
                onChange={(e) =>
                  setMaxComputeSlider(
                    Math.min(100000, Math.max(40000, Number(e.target.value))),
                  )
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>40k</span>
                <span>100k</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic mb-5">Everything in Pro plus:</p>
            <ul className="space-y-3 mb-6">
              {[
                'Unlimited Lora fine-tunings with 2,000 files',
                'Unlimited Concurrency',
                'Unlimited relaxed generations',
                'Upscale & enhance to 22K',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button className="bg-black text-white w-full rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
              Get Max <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══ For Teams and Enterprises ═══ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">For Teams and Enterprises</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Business */}
          <div className="relative border border-gray-200 rounded-xl p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">${businessDynamicPrice}</span>
              <span className="text-sm text-gray-500">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{businessComputeSlider.toLocaleString()} compute units</p>
            {/* Slider */}
            <div className="mb-4">
              <input
                type="range"
                min={20000}
                max={1500000}
                step={10000}
                value={businessComputeSlider}
                onChange={(e) =>
                  setBusinessComputeSlider(
                    Math.min(1500000, Math.max(20000, Number(e.target.value))),
                  )
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>20k</span>
                <span>1.5M</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic mb-5">Everything in Max plus:</p>
            <ul className="space-y-3 mb-6">
              {[
                { text: 'Business Terms of Service', link: true },
                { text: 'Up to 50 seats included', link: false },
                { text: 'Share private Node Apps with your team', link: false },
                { text: 'Train LoRAs with up to 20,000 images', link: false },
                { text: 'Custom user roles and permissions', link: false },
                { text: 'Fine-grained controls for model access', link: false },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="flex items-center gap-1">
                    {f.text}
                    {f.link && <ExternalLink className="w-3 h-3 text-gray-400" />}
                  </span>
                </li>
              ))}
            </ul>
            <button className="bg-black text-white w-full rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
              Try Business <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Enterprise */}
          <div className="relative border border-gray-200 rounded-xl p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold text-gray-900">Custom</span>
            </div>
            <p className="text-sm text-gray-500 italic mb-5">Everything in Business plus:</p>
            <ul className="space-y-3 mb-6">
              {[
                { text: 'Custom Terms of Service', badge: null },
                { text: 'Priority support with SLA', badge: null },
                { text: 'Analytics API', badge: null },
                { text: 'Per-member spend limits', badge: null },
                { text: 'Slack connect', badge: null },
                { text: 'Custom compute packages', badge: null },
                { text: 'Audit logs', badge: 'SOON' },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>
                    {f.text}
                    {f.badge && (
                      <span className="ml-1.5 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {f.badge}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button className="bg-black text-white w-full rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1">
              Contact Sales <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══ Need More Compute? ═══ */}
        <section className="bg-gray-900 rounded-xl p-8 mb-16">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Need More Compute?</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6">Purchase additional compute packs anytime.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {computePacks.map((pack) => (
              <div
                key={pack.units}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:border-gray-500 transition-colors cursor-pointer"
              >
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Valid for 90 days</p>
                <p className="text-white font-bold text-2xl mb-0.5">{pack.units.toLocaleString()}</p>
                <p className="text-gray-400 text-xs mb-2">units</p>
                <p className="text-xs text-gray-400">{pack.requirement}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs">
            Credits are added instantly after purchase and expire after 90 days.
          </p>
        </section>

        {/* ═══ Compare Plans in Detail ═══ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Plans in Detail</h2>

          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
            {compareTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setComparePlansTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  comparePlansTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 w-[220px]">Feature</th>
                  {planColumns.map((col) => (
                    <th key={col} className="text-center py-3 px-3 font-medium text-gray-700 min-w-[100px]">
                      <div className="flex items-center justify-center gap-1">
                        {col}
                        {col === 'FREE' && (
                          <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(compareData[comparePlansTab] || []).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        {row.feature}
                        {row.badge && (
                          <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            {row.badge}
                          </span>
                        )}
                      </span>
                    </td>
                    {row.values.map((val, j) => (
                      <td key={j} className="py-3 px-3 text-center">
                        <CellRenderer value={val} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl">
            {faqItems.map((item, i) => {
              const isOpen = openFaqIndex === i
              return (
                <div key={i} className="border-b border-gray-200">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="flex items-center justify-between w-full py-4 text-left group"
                  >
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {item.q}
                      {item.badge && (
                        <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 mt-10">
            <span className="text-sm text-gray-600">Still have questions?</span>
            <button className="bg-purple-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-purple-700 transition-colors">
              Contact Sales
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
