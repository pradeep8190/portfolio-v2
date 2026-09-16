export interface Project {
  id: string
  index: string
  title: string
  subtitle: string
  category: string
  description: string
  image: string
  tags: string[]
  accentColor: string
  accentGlow: string
  year: string
  status: string
  demoUrl?: string
  githubUrl?: string
}

export const PROJECTS: Project[] = [
  {
    id: 'horizon',
    index: '01',
    title: 'Horizon AI',
    subtitle: 'All AI. One Horizon.',
    category: 'AI PLATFORM // MULTI-MODEL',
    description:
      'A unified workspace to compare, create, and collaborate across the world’s most advanced AI models in real time, featuring parallel generation and cross-model synthesis.',
    image: '/project_images/horizon.png',
    tags: ['React', 'TypeScript', 'LLM Routing', 'Multimodal API', 'Vite'],
    accentColor: '#e11d48',
    accentGlow: 'rgba(225, 29, 72, 0.16)',
    year: '2025',
    status: 'LIVE PRODUCT',
  },
  {
    id: 'jarvis',
    index: '02',
    title: 'JARVIS v2.2',
    subtitle: 'Autonomous Neural Core & System Orchestrator',
    category: 'AGENTIC CORE // TELEMETRY',
    description:
      'Local-first autonomous system orchestrator capable of monitoring hardware telemetry, executing terminal instructions, and self-healing agent pipelines.',
    image: '/project_images/jarvis.png',
    tags: ['Python', 'Local LLMs', 'LangGraph', 'Hardware Telemetry', 'SHA-256'],
    accentColor: '#06b6d4',
    accentGlow: 'rgba(6, 182, 212, 0.16)',
    year: '2025',
    status: 'SYS.ACTIVE',
  },
  {
    id: 'protron',
    index: '03',
    title: 'Protron X',
    subtitle: 'The Complete Sovereign Stack for AI',
    category: 'INFRASTRUCTURE // VECTOR DB',
    description:
      'High-performance developer infrastructure unifying multi-model AI gateways, vector storage, real-time token streaming, and drop-in UI components into a single SDK.',
    image: '/project_images/protron.png',
    tags: ['TypeScript', 'Vector DB', 'AI Gateway', 'Streaming SDK', 'Tailwind'],
    accentColor: '#8b5cf6',
    accentGlow: 'rgba(139, 92, 246, 0.16)',
    year: '2024',
    status: 'v2.0 INFRA',
  },
  {
    id: 'zeox',
    index: '04',
    title: 'ZEOX Protocol',
    subtitle: 'Access Your Personal Agent From Everywhere',
    category: 'BRIDGE PROTOCOL // WEBSOCKETS',
    description:
      'Encrypted remote agent bridge protocol that connects your local machine AI agent to any mobile browser or tablet with sub-millisecond telemetry feedback.',
    image: '/project_images/zeox.png',
    tags: ['WebSockets', 'Agent Bridge', 'E2E Encryption', 'React', 'Node.js'],
    accentColor: '#64748b',
    accentGlow: 'rgba(100, 116, 139, 0.16)',
    year: '2024',
    status: 'PROTOCOL',
  },
  {
    id: 'heptron',
    index: '05',
    title: 'Heptron AI',
    subtitle: 'Automate Smarter. Work Faster.',
    category: 'ENTERPRISE AI // PIPELINES',
    description:
      'Intelligent workflow orchestration engine eliminating repetitive enterprise operations through multi-agent collaboration, document understanding, and smart triggers.',
    image: '/project_images/heptron.png',
    tags: ['Python', 'Enterprise AI', 'Agentic Workflows', 'FastAPI', 'Docker'],
    accentColor: '#4f46e5',
    accentGlow: 'rgba(79, 70, 229, 0.16)',
    year: '2024',
    status: 'BETA RELEASE',
  },
]
