import {
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Eye,
  AudioLines,
  Brain,
  Layers,
  DollarSign,
  Zap,
  Heart,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export interface ModalityOption {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

export const MODALITIES: ModalityOption[] = [
  { id: 'text', label: 'Text', icon: MessageSquare, desc: 'Text-only prompts' },
  { id: 'image', label: 'Vision', icon: ImageIcon, desc: 'Image analysis' },
  { id: 'voice', label: 'Voice', icon: Mic, desc: 'Audio processing' },
  { id: 'text+image', label: 'Text+Vision', icon: Eye, desc: 'Combined text and image' },
  { id: 'text+voice', label: 'Text+Voice', icon: AudioLines, desc: 'Combined text and audio' },
];

export const MOODS = ['happy', 'neutral', 'stressed', 'frustrated', 'excited', 'tired', 'anxious', 'calm'];
export const ENERGY_LEVELS = ['low', 'moderate', 'high'];
export const RESPONSE_STYLES = ['default', 'professional', 'friendly', 'candid', 'quirky', 'efficient', 'cynical'];
export const RESPONSE_LENGTHS = ['short', 'medium', 'long'];
export const WEATHER_OPTIONS = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'hot', 'cold'];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'South Korea',
  'China', 'India', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Finland', 'Switzerland', 'Austria', 'Belgium', 'Poland', 'Portugal', 'Ireland', 'New Zealand',
  'Singapore', 'Hong Kong', 'Taiwan', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines',
  'Russia', 'Ukraine', 'Turkey', 'Israel', 'United Arab Emirates', 'Saudi Arabia', 'South Africa',
  'Egypt', 'Nigeria', 'Kenya', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Czech Republic', 'Romania',
  'Hungary', 'Greece', 'Other',
].sort();

export interface ExamplePrompt {
  label: string;
  prompt: string;
  category: string;
}

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  { label: 'Code Review', prompt: 'Review this Python function for performance issues and suggest improvements', category: 'coding' },
  { label: 'Data Analysis', prompt: 'Analyze quarterly sales data and identify trends, anomalies, and actionable insights', category: 'analysis' },
  { label: 'Creative Writing', prompt: 'Write a short story about an AI that discovers the meaning of friendship', category: 'creative' },
  { label: 'Simple Question', prompt: 'What is the capital of France?', category: 'factual' },
  { label: 'Complex Research', prompt: 'Explain the implications of quantum computing on current cryptographic systems and propose mitigation strategies', category: 'analysis' },
  { label: 'Translation', prompt: 'Translate this technical documentation from English to Spanish while maintaining accuracy', category: 'translation' },
  { label: 'Web Search', prompt: 'What are the latest news about AI regulation today?', category: 'web' },
  { label: 'Stock Price', prompt: 'What is the current stock price of Tesla?', category: 'web' },
];

export const LONG_EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    label: 'Full-Stack App',
    prompt: 'I need to build a complete full-stack web application for a restaurant reservation system. The app should have a React frontend with a calendar view for available time slots, a Node.js backend with Express, PostgreSQL database for storing reservations, user authentication with JWT tokens, email notifications when a reservation is confirmed or cancelled, and an admin dashboard where restaurant staff can manage tables, view upcoming reservations, and block out dates. Please provide the complete architecture, database schema, API endpoints, and key implementation details for each component.',
    category: 'coding',
  },
  {
    label: 'Research Paper',
    prompt: 'Write a comprehensive research analysis comparing the environmental impact of electric vehicles versus traditional internal combustion engine vehicles across their entire lifecycle. Include manufacturing emissions (battery production, rare earth mining), operational emissions across different electricity grid mixes worldwide, end-of-life recycling challenges, infrastructure requirements (charging stations vs gas stations), and projected improvements over the next decade. Consider economic factors for consumers in developing vs developed nations, government subsidies, and the role of hydrogen fuel cells as a potential alternative. Cite specific studies and provide data-backed conclusions.',
    category: 'analysis',
  },
  {
    label: 'Debug Complex Issue',
    prompt: 'I have a distributed microservices architecture where intermittent failures are occurring. Service A (user authentication, Node.js) calls Service B (order processing, Python/FastAPI) which calls Service C (inventory management, Go). The issue: approximately 2% of requests fail with a timeout error, but only during peak hours (10am-2pm). The timeout happens between Service B and Service C. Service C health checks always pass. We use Kubernetes with horizontal pod autoscaling, gRPC for inter-service communication, and Redis for caching. Database is PostgreSQL with connection pooling via PgBouncer. What systematic debugging approach should I take, what metrics should I collect, and what are the most likely root causes?',
    category: 'coding',
  },
  {
    label: 'Business Strategy',
    prompt: 'Our SaaS startup (B2B project management tool) has 500 paying customers, $80K MRR, and is growing 12% month-over-month. We have $2M in runway. Our churn rate is 4.5% monthly, with most churn happening in the first 30 days. Our acquisition channels are content marketing (40%), paid ads (35%), and referrals (25%). The product has strong engagement among power users but onboarding completion rate is only 35%. We are considering three strategic directions: (1) invest heavily in reducing churn through better onboarding and customer success, (2) expand into the enterprise segment with SOC2 compliance and SSO, or (3) build AI-powered features to differentiate from competitors. Provide a detailed analysis of each option with financial projections, risks, and a recommended prioritization framework.',
    category: 'analysis',
  },
  {
    label: 'Creative Worldbuilding',
    prompt: 'Create a detailed science fiction world set 300 years in the future where humanity has colonized three star systems but faster-than-light travel does not exist. Communication between systems takes 4-15 years. Design the political systems, economic models, cultural evolution, and technological landscape. How do these isolated but connected civilizations govern themselves? What new religions or philosophies have emerged? How has language diverged? What are the major conflicts? Include at least three distinct factions with compelling motivations, a brewing interstellar crisis, and three key characters (a diplomat, a scientist, and a smuggler) whose stories intersect.',
    category: 'creative',
  },
  {
    label: 'Math Problem',
    prompt: 'Solve the following optimization problem step by step: A manufacturing company produces two products, A and B. Product A requires 3 hours of machining time, 2 hours of assembly time, and yields a profit of $50 per unit. Product B requires 2 hours of machining time, 4 hours of assembly time, and yields a profit of $60 per unit. The company has 240 hours of machining time available per week and 200 hours of assembly time. Additionally, due to market demand, they cannot produce more than 60 units of Product A or 50 units of Product B per week. Formulate this as a linear programming problem, solve it using the simplex method, perform sensitivity analysis on the constraints, and explain what the shadow prices mean in practical business terms.',
    category: 'analysis',
  },
];

export const FRIENDLY_REASON_MAP: Record<string, string> = {
  'Task Fitness': 'How well this model understands and handles your type of request',
  'Specialization': 'Whether this model has specific expertise in your area',
  'Modality Fitness': 'How capable this model is with your input type (text, images, audio)',
  'Cost Efficiency': 'How affordable this model is compared to alternatives',
  'Speed': 'How quickly this model responds to your request',
  'Conversation Coherence': 'How well this model maintains the flow of your conversation',
  'User Preference': 'Whether this model matches your personal preferences',
  'Human Context Fit': 'How well this model adapts to your current mood, time of day, and situation',
};

export interface ScoringFactorMeta {
  key: string;
  label: string;
  weight: number;
  icon: LucideIcon;
  color: string;
  desc: string;
}

export const SCORING_FACTORS: ScoringFactorMeta[] = [
  { key: 'taskFitness', label: 'Task Fitness', weight: 40, icon: Brain, color: '#8B5CF6', desc: 'How well the model handles the detected intent, domain, and complexity' },
  { key: 'modalityFitness', label: 'Modality Fit', weight: 15, icon: Layers, color: '#6366F1', desc: 'Capability match for vision/audio requirements' },
  { key: 'costEfficiency', label: 'Cost Efficiency', weight: 15, icon: DollarSign, color: '#10B981', desc: 'Normalized cost comparison (cheaper = higher score)' },
  { key: 'speed', label: 'Speed', weight: 10, icon: Zap, color: '#F59E0B', desc: 'Latency comparison (faster = higher score)' },
  { key: 'userPreference', label: 'User Preference', weight: 10, icon: Heart, color: '#EC4899', desc: 'Boost/penalty based on preferred/avoided models' },
  { key: 'conversationCoherence', label: 'Coherence', weight: 10, icon: TrendingUp, color: '#3B82F6', desc: 'Consistency with previous model in conversation' },
];

export const MODELS_PER_PAGE = 8;
