/**
 * T-Mobile Community Mock Data Generator
 * Generates realistic sample data since T-Mobile Community requires OAuth
 */

export interface CommunityDiscussion {
  id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  views: number;
  timestamp: string;
  excerpt: string;
  tags: string[];
}

export interface CommunityResult {
  discussions: CommunityDiscussion[];
  source: string;
  fetched_at: string;
}

const CATEGORIES = [
  'Network & Coverage',
  'Devices',
  'Billing & Account',
  'Home Internet',
  'Postpaid',
  'Prepaid',
  'International',
  'Technical Support',
];

const SAMPLE_DISCUSSIONS = [
  {
    title: '5G not working in downtown area',
    category: 'Network & Coverage',
    tags: ['5g', 'coverage', 'network'],
    excerpt: 'Has anyone else noticed 5G connection dropping frequently in the downtown area? It keeps falling back to LTE.',
  },
  {
    title: 'Bill shows extra charges I did not authorize',
    category: 'Billing & Account',
    tags: ['billing', 'charges', 'account'],
    excerpt: 'My latest bill has $25 in charges I never authorized. How do I dispute this?',
  },
  {
    title: 'T-Mobile app crashes on iPhone 15',
    category: 'Technical Support',
    tags: ['app', 'iphone', 'crash'],
    excerpt: 'The T-Mobile app keeps crashing when I try to view my usage. Anyone else experiencing this?',
  },
  {
    title: 'Home Internet gateway constantly rebooting',
    category: 'Home Internet',
    tags: ['home-internet', 'gateway', 'wifi'],
    excerpt: 'My 5G gateway reboots itself every few hours. I\'ve tried factory reset but issue persists.',
  },
  {
    title: 'Upgrading to new plan - questions about pricing',
    category: 'Postpaid',
    tags: ['plan', 'upgrade', 'pricing'],
    excerpt: 'Thinking of switching to the Magenta Max plan. Does the $85/month include all taxes and fees?',
  },
  {
    title: 'International roaming not working in Europe',
    category: 'International',
    tags: ['roaming', 'international', 'europe'],
    excerpt: 'I\'m in France and my phone shows no service. I thought international data was included?',
  },
  {
    title: 'Cannot receive verification codes via SMS',
    category: 'Technical Support',
    tags: ['sms', 'verification', 'messaging'],
    excerpt: 'Not receiving any SMS verification codes from banks or other services. Regular texts work fine.',
  },
  {
    title: 'Tower maintenance schedule for my area?',
    category: 'Network & Coverage',
    tags: ['tower', 'maintenance', 'coverage'],
    excerpt: 'Service has been spotty for 3 days. Is there tower maintenance happening in the Seattle area?',
  },
  {
    title: 'AutoPay discount not applied to my bill',
    category: 'Billing & Account',
    tags: ['autopay', 'discount', 'billing'],
    excerpt: 'Enrolled in AutoPay but didn\'t get the $10 discount. Customer service says it takes 2 billing cycles?',
  },
  {
    title: 'Switching from Verizon - port number question',
    category: 'Technical Support',
    tags: ['port', 'switch', 'number'],
    excerpt: 'Want to bring my number from Verizon. How long does the porting process usually take?',
  },
  {
    title: 'T-Mobile Tuesday rewards not loading',
    category: 'Technical Support',
    tags: ['tmobile-tuesday', 'app', 'rewards'],
    excerpt: 'The T-Mobile Tuesday app shows a blank screen where the deals should be. Tried reinstalling.',
  },
  {
    title: 'Best plan for 4 lines with unlimited data?',
    category: 'Postpaid',
    tags: ['plan', 'family', 'unlimited'],
    excerpt: 'Looking for recommendations on best family plan for 4 lines with true unlimited data.',
  },
  {
    title: 'Home Internet speed slower than advertised',
    category: 'Home Internet',
    tags: ['speed', 'home-internet', 'performance'],
    excerpt: 'Was promised 100+ Mbps but only getting 30-40. Is this normal? What can I do to improve speed?',
  },
  {
    title: 'Device unlock request taking too long',
    category: 'Devices',
    tags: ['unlock', 'device', 'support'],
    excerpt: 'Submitted device unlock request 5 days ago, still no response. How long should this take?',
  },
  {
    title: 'Prepaid refill not reflecting in my account',
    category: 'Prepaid',
    tags: ['prepaid', 'refill', 'account'],
    excerpt: 'Added $50 to my prepaid account 2 hours ago but balance still shows $0.',
  },
];

const AUTHOR_NAMES = [
  'MobileUser123',
  'TechGuy89',
  'BillingQuestion',
  'NetworkWatcher',
  'HomeInternetUser',
  'SwitchingCarriers',
  'PowerUser2024',
  'CustomerConcern',
  'PhoneEnthusiast',
  'DataHungry',
];

/**
 * Generate mock community discussions
 */
export function generateCommunityData(): CommunityResult {
  const now = new Date();
  const discussions: CommunityDiscussion[] = [];

  // Generate 50 recent discussions
  const count = 50;

  for (let i = 0; i < count; i++) {
    const sample = SAMPLE_DISCUSSIONS[Math.floor(Math.random() * SAMPLE_DISCUSSIONS.length)];

    // Random timestamp within last 24 hours
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

    discussions.push({
      id: `discussion-${Date.now()}-${i}`,
      title: sample.title,
      category: sample.category,
      author: AUTHOR_NAMES[Math.floor(Math.random() * AUTHOR_NAMES.length)],
      replies: Math.floor(Math.random() * 50),
      views: Math.floor(Math.random() * 500) + 10,
      timestamp,
      excerpt: sample.excerpt,
      tags: sample.tags,
    });
  }

  // Sort by timestamp (newest first)
  discussions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    discussions,
    source: 'tmobile-community',
    fetched_at: new Date().toISOString(),
  };
}
