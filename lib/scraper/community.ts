/**
 * T-Mobile Community Mock Data Generator
 * Generates realistic sample data since T-Mobile Community requires OAuth
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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

interface CommunitySampleData {
  categories: string[];
  sampleDiscussions: Array<{
    title: string;
    category: string;
    tags: string[];
    excerpt: string;
  }>;
  authorNames: string[];
}

// Load sample data from JSON file
let sampleData: CommunitySampleData;
try {
  const dataPath = join(process.cwd(), 'lib/scraper/data/community-sample.json');
  const fileContent = readFileSync(dataPath, 'utf-8');
  sampleData = JSON.parse(fileContent);
} catch (error) {
  console.error('Failed to load community sample data:', error);
  throw new Error('Sample data file not found');
}

const CATEGORIES = sampleData.categories;
const SAMPLE_DISCUSSIONS = sampleData.sampleDiscussions;
const AUTHOR_NAMES = sampleData.authorNames;

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
