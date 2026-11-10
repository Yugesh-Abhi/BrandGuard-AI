// BrandGuard AI - Mock Data & Starter Presets

export const MOCK_BRANDS = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Acme Global Cloud',
    slug: 'acme-global',
    industry: 'Enterprise Software & Cloud',
    description: 'Mission-critical cloud infrastructure and developer observability platforms.',
    healthScore: 94.2,
    activeSubmissions: 24,
    flaggedViolations: 3,
    pendingReviews: 5,
    logoInitial: 'AG',
    primaryColor: '#8B5CF6',
  },
  {
    id: 'b-apex-fintech',
    name: 'Apex Wealth & Capital',
    slug: 'apex-wealth',
    industry: 'Fintech & Investment Banking',
    description: 'Algorithmic wealth management and global custodial trading solutions.',
    healthScore: 82.7,
    activeSubmissions: 38,
    flaggedViolations: 12,
    pendingReviews: 8,
    logoInitial: 'AW',
    primaryColor: '#06B6D4',
  },
  {
    id: 'b-nova-health',
    name: 'Nova BioHealth AI',
    slug: 'nova-biohealth',
    industry: 'Healthcare & Biotech',
    description: 'Patient outcome optimization and clinical trials intelligence platform.',
    healthScore: 91.0,
    activeSubmissions: 17,
    flaggedViolations: 2,
    pendingReviews: 1,
    logoInitial: 'NB',
    primaryColor: '#10B981',
  },
];

export const MOCK_GUIDELINES = [
  {
    id: 'g-acme-main-2026',
    brandId: 'b0000000-0000-0000-0000-000000000001',
    name: 'Acme Global 2026 Core Brand Identity',
    version: 'v2.4',
    isActive: true,
    toneTraits: [
      { trait: 'Authoritative', rating: 85, description: 'Direct, expert, data-backed insights without pomposity' },
      { trait: 'Empathetic', rating: 75, description: 'Focus on developer pain points and team productivity' },
      { trait: 'Innovative', rating: 90, description: 'Forward-looking, clear about technological breakthroughs' },
      { trait: 'Clarity / Plain Language', rating: 95, description: 'Zero fluff, active verbs, concise clauses' }
    ],
    readingLevel: 'Grade 8 - 10 (Flesch-Kincaid)',
    taglines: [
      'Every piece of content. One consistent brand.',
      'Infrastructure at the speed of thought.',
      'Precision cloud systems for mission-critical teams.'
    ],
    bannedWords: [
      { word: 'revolutionary', reason: 'Overused hyperbole. Explain the tangible metric instead.' },
      { word: 'synergy', reason: 'Vague corporate buzzword. State the actual integration or workflow benefit.' },
      { word: 'game-changer', reason: 'Cliché. Detail what technical barrier was eliminated.' },
      { word: 'foolproof', reason: 'Engineering inaccuracies. Use "fault-tolerant" or "resilient".' },
      { word: 'cheap', reason: 'Degrades brand equity. Use "cost-effective" or "optimized TCO".' }
    ],
    requiredDisclaimers: [
      'For promotional emails: "Unsubscribe anytime. Acme Global Cloud is SOC2 Type II and ISO 27001 certified."',
      'For benchmark claims: "Internal benchmarks measured against v3.2 workloads. Individual customer results may vary."'
    ],
    formattingRules: [
      'Always capitalize "Acme Global Cloud" in full on first mention, "Acme" subsequently.',
      'Never hyphenate "micro services" — always write "microservices".',
      'Oxford commas must be used in all lists of three or more items.'
    ]
  }
];

export const MOCK_SUBMISSIONS = [
  {
    id: 'sub-101',
    brandId: 'b0000000-0000-0000-0000-000000000001',
    guidelineId: 'g-acme-main-2026',
    title: 'Enterprise Cloud Migration: 5 Traps to Avoid in 2026',
    channel: 'Blog Post',
    audience: 'VP of Engineering, Cloud Architects',
    authorName: 'Sarah Jenkins',
    authorRole: 'Senior Tech Evangelist',
    department: 'Developer Marketing',
    submittedAt: '2026-11-06T14:22:00Z',
    status: 'needs_revision', // 'approved', 'needs_revision', 'in_review', 'action_required'
    complianceScore: 74,
    version: 'v1.1',
    wordCount: 840,
    readingTime: '3 min read',
    contentBody: `Migrating legacy enterprise applications to modern distributed cloud infrastructure is often touted as a revolutionary game-changer for cost reduction. However, without rigorous governance, engineering organizations rapidly experience bill shock and architecture drift.

First, beware of lift-and-shift illusions. Simply porting bare-metal virtual machines into Kubernetes containers without refactoring creates synergy problems between legacy databases and stateless pods. This cheap approach inevitably backfires when auto-scaling triggers unexpected compute spikes.

Second, ensure end-to-end telemetry is configured before cutover. Acme guarantees foolproof uptime during migrations if telemetry is actively streaming. 

To learn more about how Acme Global can eliminate your technical debt, schedule an engineering consultation today.`,
    violationsCount: {
      critical: 1,
      warning: 3,
      suggestion: 2,
    },
    latestReportId: 'rep-101'
  },
  {
    id: 'sub-102',
    brandId: 'b0000000-0000-0000-0000-000000000001',
    guidelineId: 'g-acme-main-2026',
    title: 'Q4 Product Showcase & Next-Gen Observability Announcement',
    channel: 'LinkedIn Social',
    audience: 'Software Engineers, DevOps Leads',
    authorName: 'Marcus Vance',
    authorRole: 'Product Marketing Manager',
    department: 'Growth Marketing',
    submittedAt: '2026-11-05T09:15:00Z',
    status: 'approved',
    complianceScore: 96,
    version: 'v1.2',
    wordCount: 165,
    readingTime: '1 min read',
    contentBody: `Modern engineering teams shouldn't spend hours diagnosing transient microservices latency. Today, Acme Global Cloud is launching Real-Time Trace Analytics.

With distributed kernel-level sampling, teams cut mean time to resolution by 42% across multi-region clusters. 

Key enhancements:
• Automated root-cause clustering
• Zero-overhead telemetry collectors
• Direct integration with your incident response stack

Explore the technical overview and benchmark metrics via the link below.
Acme Global Cloud is SOC2 Type II and ISO 27001 certified.`,
    violationsCount: {
      critical: 0,
      warning: 0,
      suggestion: 1,
    },
    latestReportId: 'rep-102'
  },
  {
    id: 'sub-103',
    brandId: 'b0000000-0000-0000-0000-000000000001',
    guidelineId: 'g-acme-main-2026',
    title: 'Acme Partner Ecosystem Incentive Program Launch',
    channel: 'Press Release',
    audience: 'Industry Analysts, System Integrators',
    authorName: 'Elena Rostova',
    authorRole: 'Global PR Director',
    department: 'Corporate Communications',
    submittedAt: '2026-11-04T16:40:00Z',
    status: 'in_review',
    complianceScore: 88,
    version: 'v1.0',
    wordCount: 520,
    readingTime: '2 min read',
    contentBody: `SAN FRANCISCO — Acme Global Cloud today announced a $25M co-investment fund dedicated to certifying enterprise systems integrators across North America and EMEA.

The initiative equips technology partners with direct architectural guidance, specialized migration sandboxes, and dedicated escalation engineering support.

"Enterprise cloud modernization demands specialized practitioner expertise," stated Jordan Lee, Chief Executive Officer at Acme. "By expanding our verified partner network, we are accelerating reliable modernization outcomes for our joint Fortune 500 customers."`,
    violationsCount: {
      critical: 0,
      warning: 2,
      suggestion: 1,
    },
    latestReportId: 'rep-103'
  },
  {
    id: 'sub-104',
    brandId: 'b0000000-0000-0000-0000-000000000001',
    guidelineId: 'g-acme-main-2026',
    title: 'Special Black Friday Enterprise License Discount Blast',
    channel: 'Email Newsletter',
    audience: 'Self-Serve Tier Developers',
    authorName: 'Dave K.',
    authorRole: 'Lifecycle Marketing Specialist',
    department: 'Growth Marketing',
    submittedAt: '2026-11-03T11:00:00Z',
    status: 'action_required',
    complianceScore: 58,
    version: 'v1.0',
    wordCount: 210,
    readingTime: '1 min read',
    contentBody: `Don't miss our dirt-cheap annual sale! For 48 hours only, get our revolutionary foolproof cloud cluster for 70% off. It's a guaranteed game-changer for your team. Click now to claim your discount before supplies run out!`,
    violationsCount: {
      critical: 2,
      warning: 4,
      suggestion: 1,
    },
    latestReportId: 'rep-104'
  }
];

export const MOCK_REPORTS = {
  'rep-101': {
    id: 'rep-101',
    submissionId: 'sub-101',
    overallScore: 74,
    grade: 'C+',
    verdict: 'Needs Revision Before Publishing',
    analyzedAt: '2026-11-06T14:23:45Z',
    executionTimeMs: 1420,
    categoryScores: {
      tone: 72,
      terminology: 65,
      legal: 68,
      formatting: 92
    },
    summary: 'The article contains multiple prohibited buzzwords ("revolutionary", "game-changer", "cheap"), violates the policy against making unsupported absolute guarantees ("Acme guarantees foolproof uptime"), and omits required benchmark disclaimers.',
    violations: [
      {
        id: 'v-1',
        category: 'terminology',
        severity: 'warning',
        flaggedText: 'revolutionary game-changer',
        location: 'Paragraph 1, Line 1',
        rule: 'Prohibited Buzzwords & Hyperbole',
        explanation: 'Both "revolutionary" and "game-changer" are explicitly banned in the 2026 Brand Guidelines. Acme brand voice mandates concrete data and architectural precision rather than marketing hype.',
        suggestedFix: 'transformational catalyst for efficiency'
      },
      {
        id: 'v-2',
        category: 'terminology',
        severity: 'warning',
        flaggedText: 'synergy problems',
        location: 'Paragraph 2, Line 2',
        rule: 'Banned Corporate Jargon',
        explanation: '"Synergy" is flagged as vague corporate jargon. State the technical integration reality directly.',
        suggestedFix: 'architectural friction between stateful databases and ephemeral pods'
      },
      {
        id: 'v-3',
        category: 'tone',
        severity: 'suggestion',
        flaggedText: 'cheap approach',
        location: 'Paragraph 2, Line 3',
        rule: 'Brand Equity Degradation',
        explanation: 'The word "cheap" degrades perception of engineering value. Guidelines recommend "cost-effective" or "unoptimized".',
        suggestedFix: 'unoptimized tactical approach'
      },
      {
        id: 'v-4',
        category: 'legal',
        severity: 'critical',
        flaggedText: 'Acme guarantees foolproof uptime',
        location: 'Paragraph 3, Line 1',
        rule: 'Absolute Uptime & Reliability Claims',
        explanation: 'Legal policy strictly forbids the phrase "guarantees foolproof uptime" as it conflicts with the Master Service Agreement SLA terms (99.99%) and exposes the company to breach of warranty liability.',
        suggestedFix: 'Acme provides engineered high-availability architectures backed by industry-standard SLAs'
      },
      {
        id: 'v-5',
        category: 'formatting',
        severity: 'suggestion',
        flaggedText: 'Acme Global can eliminate your technical debt',
        location: 'Paragraph 4, Line 1',
        rule: 'Brand Name Usage on First Mention',
        explanation: 'First mention in closing CTA should read "Acme Global Cloud" in full.',
        suggestedFix: 'Acme Global Cloud can help your team remediate technical debt'
      }
    ],
    improvedVersion: `Migrating legacy enterprise applications to modern distributed cloud infrastructure is often positioned as an effective driver of cost reduction. However, without rigorous governance, engineering organizations rapidly experience bill shock and architecture drift.

First, beware of lift-and-shift illusions. Simply porting bare-metal virtual machines into Kubernetes containers without refactoring creates architectural friction between stateful databases and ephemeral pods. This unoptimized approach inevitably backfires when auto-scaling triggers unexpected compute spikes.

Second, ensure end-to-end telemetry is configured before cutover. Acme provides engineered high-availability architectures backed by strict 99.99% SLAs when telemetry is actively streaming.

To learn more about how Acme Global Cloud can help remediate technical debt, schedule an engineering consultation today.`
  }
};

export const MOCK_REVISIONS = [
  {
    version: 'v1.1',
    timestamp: '2026-11-06T14:22:00Z',
    author: 'Sarah Jenkins',
    role: 'Author',
    score: 74,
    changesDescription: 'Second draft submitted with telemetry section added.',
    isCurrent: true
  },
  {
    version: 'v1.0',
    timestamp: '2026-11-06T10:14:00Z',
    author: 'Sarah Jenkins',
    role: 'Author',
    score: 62,
    changesDescription: 'Initial draft import from Google Docs.',
    isCurrent: false
  }
];

export const MOCK_REVIEWS_QUEUE = [
  {
    id: 'rev-01',
    submissionId: 'sub-101',
    title: 'Enterprise Cloud Migration: 5 Traps to Avoid in 2026',
    author: 'Sarah Jenkins',
    channel: 'Blog Post',
    complianceScore: 74,
    status: 'In Review',
    submittedAgo: '3 hours ago',
    pendingWith: 'Brand Governance Committee',
    priority: 'High',
    commentsCount: 3
  },
  {
    id: 'rev-02',
    submissionId: 'sub-103',
    title: 'Acme Partner Ecosystem Incentive Program Launch',
    author: 'Elena Rostova',
    channel: 'Press Release',
    complianceScore: 88,
    status: 'In Review',
    submittedAgo: '1 day ago',
    pendingWith: 'Alex Rivera (VP Brand)',
    priority: 'Urgent',
    commentsCount: 1
  },
  {
    id: 'rev-03',
    submissionId: 'sub-104',
    title: 'Special Black Friday Enterprise License Discount Blast',
    author: 'Dave K.',
    channel: 'Email Newsletter',
    complianceScore: 58,
    status: 'Needs Revisions',
    submittedAgo: '2 days ago',
    pendingWith: 'Marketing Copy Lead',
    priority: 'Critical',
    commentsCount: 5
  }
];

export const MOCK_ANALYTICS = {
  monthlyTrend: [
    { month: 'Jun', score: 81.2, volume: 110, violations: 42 },
    { month: 'Jul', score: 84.5, volume: 135, violations: 37 },
    { month: 'Aug', score: 87.0, volume: 168, violations: 31 },
    { month: 'Sep', score: 89.4, volume: 210, violations: 28 },
    { month: 'Oct', score: 92.1, volume: 245, violations: 22 },
    { month: 'Nov (Current)', score: 94.2, volume: 182, violations: 14 },
  ],
  topViolations: [
    { rule: 'Unsubstantiated Guarantee Claims', category: 'Legal', count: 48, percentage: 34, severity: 'Critical' },
    { rule: 'Prohibited Corporate Buzzwords', category: 'Terminology', count: 39, percentage: 28, severity: 'Warning' },
    { rule: 'Informal / Hyperbolic Tone', category: 'Tone & Voice', count: 26, percentage: 19, severity: 'Warning' },
    { rule: 'Omitted Mandatory Disclaimers', category: 'Legal', count: 18, percentage: 13, severity: 'Critical' },
    { rule: 'Brand Name Capitalization Inconsistency', category: 'Formatting', count: 9, percentage: 6, severity: 'Suggestion' }
  ],
  departmentBreakdown: [
    { department: 'Developer Marketing', score: 95.8, items: 340, passingRate: '98%' },
    { department: 'Corporate Communications', score: 94.1, items: 210, passingRate: '96%' },
    { department: 'Growth & Social', score: 88.5, items: 560, passingRate: '89%' },
    { department: 'Sales Enablement', score: 86.2, items: 290, passingRate: '84%' },
    { department: 'Customer Success', score: 92.4, items: 180, passingRate: '95%' }
  ],
  channelDistribution: [
    { channel: 'Blog Posts', share: 32, avgScore: 92 },
    { channel: 'Social Media', share: 28, avgScore: 89 },
    { channel: 'Email Campaigns', share: 22, avgScore: 86 },
    { channel: 'Landing Pages', share: 12, avgScore: 94 },
    { channel: 'Press Releases', share: 6, avgScore: 97 }
  ]
};
