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
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Parse Reddit RSS feed as fallback when JSON API is blocked
 */
async function fetchSubredditRSS(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}.rss`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`RSS feed returned ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();

    // Parse RSS XML (simplified parser for Reddit's RSS format)
    const posts: RedditPost[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const entries = xml.match(entryRegex) || [];

    for (const entry of entries.slice(0, 100)) {
      try {
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const linkMatch = entry.match(/<link href="([^"]+)"/);
        const authorMatch = entry.match(/<name>(.*?)<\/name>/);
        const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/);
        const contentMatch = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/);
        const idMatch = entry.match(/\/comments\/([^/]+)\//);

        if (titleMatch && linkMatch && idMatch) {
          // Extract text content from HTML (remove tags)
          let selftext = '';
          if (contentMatch) {
            selftext = contentMatch[1]
              .replace(/<[^>]+>/g, '') // Remove HTML tags
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .substring(0, 500); // Limit length
          }

          posts.push({
            id: idMatch[1],
            title: titleMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
            selftext,
            author: authorMatch?.[1] || 'unknown',
            score: 0, // RSS doesn't provide score
            num_comments: 0, // RSS doesn't provide comment count
            created_utc: updatedMatch ? Math.floor(new Date(updatedMatch[1]).getTime() / 1000) : 0,
            permalink: linkMatch[1],
            url: linkMatch[1],
            subreddit,
          });
        }
      } catch (parseError) {
        console.error('Error parsing RSS entry:', parseError);
        // Continue to next entry
      }
    }

    console.log(`📡 Fetched ${posts.length} posts from r/${subreddit} via RSS`);
    return posts;
  } catch (error) {
    console.error(`Error fetching RSS for r/${subreddit}:`, error);
    throw error;
  }
}

/**
 * Fetch posts from a single subreddit with retry logic
 * Falls back to RSS if JSON API is blocked
 */
async function fetchSubreddit(subreddit: string, retries: number = 3): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}.json?limit=100`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        // If it's a 403 (blocked), immediately fall back to RSS
        if (response.status === 403) {
          console.log(`🚫 JSON API blocked (403) for r/${subreddit}, falling back to RSS feed...`);
          return await fetchSubredditRSS(subreddit);
        }

        // If it's a rate limit (429) or server error (5xx), retry
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
          console.log(`⏳ Rate limited or server error, retrying r/${subreddit} in ${waitTime}ms (attempt ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data?.data?.children) {
        throw new Error('Invalid Reddit API response structure');
      }

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
      // If it's the last attempt, try RSS fallback before giving up
      if (attempt === retries) {
        console.error(`❌ Error fetching r/${subreddit} after ${retries} attempts, trying RSS fallback...`);
        try {
          return await fetchSubredditRSS(subreddit);
        } catch (rssError) {
          console.error(`❌ RSS fallback also failed for r/${subreddit}`);
          throw error; // Throw original error
        }
      }

      // Otherwise, log and retry
      const waitTime = attempt * 2000;
      console.log(`⚠️  Error on attempt ${attempt}/${retries} for r/${subreddit}, retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error(`Failed to fetch r/${subreddit} after ${retries} attempts`);
}

/**
 * Scrape all configured subreddits
 */
export async function scrapeReddit(): Promise<RedditScraperResult> {
  const allPosts: RedditPost[] = [];
  const errors: string[] = [];

  for (const subreddit of SUBREDDITS) {
    try {
      const posts = await fetchSubreddit(subreddit);
      allPosts.push(...posts);
      console.log(`✅ Successfully fetched ${posts.length} posts from r/${subreddit}`);

      // Be polite: wait 1 second between requests
      if (SUBREDDITS.indexOf(subreddit) < SUBREDDITS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to fetch r/${subreddit}: ${errorMsg}`);
      errors.push(`r/${subreddit}: ${errorMsg}`);
    }
  }

  // If ALL subreddits failed, throw an error instead of returning empty array
  if (allPosts.length === 0 && errors.length > 0) {
    throw new Error(`Failed to fetch any Reddit posts. Errors: ${errors.join(', ')}`);
  }

  console.log(`📊 Reddit scraper completed: ${allPosts.length} posts from ${SUBREDDITS.length - errors.length}/${SUBREDDITS.length} subreddits`);

  return {
    posts: allPosts,
    source: 'reddit',
    fetched_at: new Date().toISOString(),
  };
}
