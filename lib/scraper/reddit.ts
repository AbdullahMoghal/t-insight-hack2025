/**
 * Reddit Scraper
 * Fetches posts from r/tmobile and r/tmobileisp using JSON endpoints
 */

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url: string;
  subreddit: string;
}

export interface RedditScraperResult {
  posts: RedditPost[];
  source: string;
  fetched_at: string;
}

const SUBREDDITS = ['tmobile', 'tmobileisp'];
const USER_AGENT = 'Mozilla/5.0 (compatible; T-Insight/1.0)';

/**
 * Fetch posts from a single subreddit
 */
async function fetchSubreddit(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}.json?limit=25`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract posts from Reddit's data structure
    const posts: RedditPost[] = data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      selftext: child.data.selftext || '',
      author: child.data.author,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      permalink: `https://www.reddit.com${child.data.permalink}`,
      url: child.data.url,
      subreddit: child.data.subreddit,
    }));

    return posts;
  } catch (error) {
    console.error(`Error fetching r/${subreddit}:`, error);
    throw error;
  }
}

/**
 * Scrape all configured subreddits
 */
export async function scrapeReddit(): Promise<RedditScraperResult> {
  const allPosts: RedditPost[] = [];

  for (const subreddit of SUBREDDITS) {
    try {
      const posts = await fetchSubreddit(subreddit);
      allPosts.push(...posts);

      // Be polite: wait 1 second between requests
      if (SUBREDDITS.indexOf(subreddit) < SUBREDDITS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to fetch r/${subreddit}, continuing...`);
    }
  }

  return {
    posts: allPosts,
    source: 'reddit',
    fetched_at: new Date().toISOString(),
  };
}
