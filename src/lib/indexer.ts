import { Post, SubBuvaki, User } from '../types';

export type IndexContentType = 'page' | 'subBuvaki' | 'post' | 'short' | 'long';

export interface IndexedContent {
  id: string;
  type: IndexContentType;
  title: string;
  description: string;
  content?: string;
  canonicalUrl: string;
  path: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: string;
  authorName?: string;
  authorHandle?: string;
  subBuvakiName?: string;
  subBuvakiId?: string;
  tags: string[];
  keywords: string[];
  tokens: string[];
  score?: number;
  viewsCount?: number;
  commentsCount?: number;
  publishedTime: string;
  indexedAt: string;
  schemaOrg: Record<string, any>;
}

export interface IndexStats {
  totalPages: number;
  totalSubBuvakis: number;
  totalPosts: number;
  totalShorts: number;
  totalLongs: number;
  totalIndexedItems: number;
  lastAutoIndexed: string;
}

const DOMAIN = 'https://buvaki.com';

// Static base pages
export const STATIC_PAGES: Array<{ path: string; title: string; description: string; type: IndexContentType }> = [
  {
    path: '/',
    title: 'Buvaki - Social Media, Sub-Buvakis & Community Discussions',
    description: 'Explore trending discussions, community sub-buvakis, short-form and long-form videos, and real-time live chat on Buvaki.',
    type: 'page',
  },
  {
    path: '/shorts',
    title: 'Buvaki Shorts - Vertical Short Videos & Trends',
    description: 'Watch fast-paced short-form creative videos, tutorials, and community highlights on Buvaki Shorts.',
    type: 'page',
  },
  {
    path: '/longs',
    title: 'Buvaki Longs - Full Length Video Content & Deep Dives',
    description: 'Immerse in full-length high-definition video productions, documentaries, and long-form creator content on Buvaki.',
    type: 'page',
  },
  {
    path: '/chat',
    title: 'Buvaki Live Chat - Real-Time Community Audio & Text Lounges',
    description: 'Connect instantly with like-minded creators and community members across themed voice and text chat channels.',
    type: 'page',
  },
  {
    path: '/explore',
    title: 'Explore Sub-Buvakis - Discover Global Communities on Buvaki',
    description: 'Discover specialized Sub-Buvakis across technology, photography, design, gaming, cyber, and lifestyle niches.',
    type: 'page',
  },
];

// Helper to extract clean searchable tokens
function extractTokens(...strings: (string | undefined | null)[]): string[] {
  const tokenSet = new Set<string>();
  for (const str of strings) {
    if (!str) continue;
    const words = str
      .toLowerCase()
      .replace(/[^\w\s#@]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);
    for (const w of words) {
      tokenSet.add(w);
      if (w.startsWith('#') || w.startsWith('@')) {
        tokenSet.add(w.slice(1));
      }
    }
  }
  return Array.from(tokenSet);
}

// Convert ISO/duration into ISO 8601 duration format (e.g. PT1M30S)
function formatIsoDuration(durationStr?: string): string {
  if (!durationStr) return 'PT1M00S';
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2) {
    return `PT${parts[0]}M${parts[1]}S`;
  } else if (parts.length === 3) {
    return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  }
  return 'PT2M00S';
}

class BuvakiAutoIndexer {
  private index: Map<string, IndexedContent> = new Map();
  private isInitialized = false;
  private listeners: Array<(stats: IndexStats) => void> = [];

  constructor() {
    this.indexStaticPages();
  }

  private indexStaticPages() {
    for (const page of STATIC_PAGES) {
      const id = `page_${page.path.replace(/\//g, '_') || 'home'}`;
      const canonicalUrl = `${DOMAIN}${page.path}`;
      const tokens = extractTokens(page.title, page.description, page.path);
      const schemaOrg = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        description: page.description,
        url: canonicalUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Buvaki',
          url: DOMAIN,
        },
      };

      this.index.set(id, {
        id,
        type: 'page',
        title: page.title,
        description: page.description,
        canonicalUrl,
        path: page.path,
        tags: ['buvaki', 'social', 'community'],
        keywords: ['buvaki', 'social media', 'discussions', 'shorts', 'longs'],
        tokens,
        publishedTime: '2026-08-20T00:00:00Z',
        indexedAt: new Date().toISOString(),
        schemaOrg,
      });
    }
  }

  // 1. AUTO-INDEX POSTS (Text, Image, Poll, Link, Feed)
  public indexPost(post: Post): IndexedContent {
    const isShort = post.isShort === true || post.type === 'short';
    const isLong = post.isLong === true || post.type === 'long';
    const type: IndexContentType = isShort ? 'short' : isLong ? 'long' : 'post';
    const path = isShort ? `/short/${post.id}` : isLong ? `/long/${post.id}` : `/post/${post.id}`;
    const canonicalUrl = `${DOMAIN}${path}`;
    const publishedTime = post.createdAt || post.timestamp || new Date().toISOString();
    const subName = post.subBuvakiName || (post.subBuvakiId ? `b/${post.subBuvakiId}` : 'b/general');

    const cleanTitle = post.title || (isShort ? 'Buvaki Short Video' : isLong ? 'Buvaki Long Video' : 'Community Discussion');
    const cleanDesc = (post.content || '').slice(0, 200) || `${cleanTitle} - Shared on ${subName} on Buvaki.`;
    const tokens = extractTokens(
      post.title,
      post.content,
      subName,
      post.author?.username,
      post.author?.handle,
      ...(post.tags || [])
    );

    let schemaOrg: Record<string, any>;

    if (isShort || isLong) {
      // Schema.org VideoObject for Google & Video Indexing
      schemaOrg = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: cleanTitle,
        description: cleanDesc,
        thumbnailUrl: post.imageUrl || `${DOMAIN}/og-image.png`,
        uploadDate: publishedTime,
        duration: formatIsoDuration(post.duration),
        contentUrl: post.videoUrl || canonicalUrl,
        embedUrl: post.videoUrl || canonicalUrl,
        author: {
          '@type': 'Person',
          name: post.author?.username || 'Buvaki Creator',
          url: `${DOMAIN}/u/${post.author?.handle?.replace(/^u\//, '') || 'creator'}`,
        },
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'LikeAction' },
            userInteractionCount: post.score || 0,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'CommentAction' },
            userInteractionCount: post.commentCount || 0,
          },
        ],
      };
    } else {
      // Schema.org DiscussionForumPosting for standard posts
      schemaOrg = {
        '@context': 'https://schema.org',
        '@type': 'DiscussionForumPosting',
        headline: cleanTitle,
        articleBody: post.content || cleanTitle,
        url: canonicalUrl,
        datePublished: publishedTime,
        dateModified: publishedTime,
        author: {
          '@type': 'Person',
          name: post.author?.username || 'Buvaki Member',
          url: `${DOMAIN}/u/${post.author?.handle?.replace(/^u\//, '') || 'member'}`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Buvaki',
          logo: {
            '@type': 'ImageObject',
            url: `${DOMAIN}/og-image.png`,
          },
        },
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'UpvoteAction' },
            userInteractionCount: post.score || 0,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'CommentAction' },
            userInteractionCount: post.commentCount || 0,
          },
        ],
      };
    }

    const indexedItem: IndexedContent = {
      id: post.id,
      type,
      title: cleanTitle,
      description: cleanDesc,
      content: post.content,
      canonicalUrl,
      path,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      duration: post.duration,
      authorName: post.author?.username,
      authorHandle: post.author?.handle,
      subBuvakiName: subName,
      subBuvakiId: post.subBuvakiId,
      tags: post.tags || [],
      keywords: [subName, ...(post.tags || []), 'buvaki', type],
      tokens,
      score: post.score || 0,
      viewsCount: post.viewsCount || 0,
      commentsCount: post.commentCount || 0,
      publishedTime,
      indexedAt: new Date().toISOString(),
      schemaOrg,
    };

    this.index.set(post.id, indexedItem);
    this.notifyListeners();
    return indexedItem;
  }

  // 2. AUTO-INDEX SUB-BUVAKIS
  public indexSubBuvaki(sub: SubBuvaki): IndexedContent {
    const path = `/b/${sub.id}`;
    const canonicalUrl = `${DOMAIN}${path}`;
    const title = `${sub.displayName} - Buvaki Community`;
    const description = sub.description || `Join the ${sub.displayName} community on Buvaki. Discuss topics, share media, and connect with members.`;
    const tokens = extractTokens(sub.displayName, sub.name, sub.description, sub.category);

    const schemaOrg = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonicalUrl,
      about: {
        '@type': 'Thing',
        name: sub.name,
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'Buvaki',
        url: DOMAIN,
      },
    };

    const indexedItem: IndexedContent = {
      id: `sub_${sub.id}`,
      type: 'subBuvaki',
      title,
      description,
      canonicalUrl,
      path,
      imageUrl: sub.imageUrl,
      subBuvakiName: sub.displayName,
      subBuvakiId: sub.id,
      tags: [sub.category, sub.name, 'community'],
      keywords: [sub.displayName, sub.name, sub.category, 'community', 'buvaki'],
      tokens,
      publishedTime: '2026-08-20T00:00:00Z',
      indexedAt: new Date().toISOString(),
      schemaOrg,
    };

    this.index.set(`sub_${sub.id}`, indexedItem);
    this.notifyListeners();
    return indexedItem;
  }

  // 3. AUTO-INDEX BATCH OF POSTS & SUB-BUVAKIS
  public autoIndexAll(posts: Post[], subs: SubBuvaki[]) {
    for (const sub of subs) {
      this.indexSubBuvaki(sub);
    }
    for (const post of posts) {
      this.indexPost(post);
    }
    this.isInitialized = true;
    this.notifyListeners();
    this.debouncedServerSync();
  }

  private syncTimeout: any = null;
  private debouncedServerSync() {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      try {
        const items = this.getAllIndexedItems();
        fetch('/api/autoindex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        }).catch(() => {});
      } catch (e) {}
    }, 1500);
  }

  // 4. GET STATS
  public getStats(): IndexStats {
    let totalPages = 0;
    let totalSubBuvakis = 0;
    let totalPosts = 0;
    let totalShorts = 0;
    let totalLongs = 0;

    for (const item of this.index.values()) {
      if (item.type === 'page') totalPages++;
      else if (item.type === 'subBuvaki') totalSubBuvakis++;
      else if (item.type === 'post') totalPosts++;
      else if (item.type === 'short') totalShorts++;
      else if (item.type === 'long') totalLongs++;
    }

    return {
      totalPages,
      totalSubBuvakis,
      totalPosts,
      totalShorts,
      totalLongs,
      totalIndexedItems: this.index.size,
      lastAutoIndexed: new Date().toISOString(),
    };
  }

  // 5. GET ALL INDEXED ITEMS
  public getAllIndexedItems(): IndexedContent[] {
    return Array.from(this.index.values());
  }

  // 6. SEARCH ACROSS INDEXED POSTS, SHORTS, LONGS, SUB-BUVAKIS
  public search(queryStr: string, filterType?: IndexContentType): IndexedContent[] {
    if (!queryStr || !queryStr.trim()) {
      return filterType
        ? this.getAllIndexedItems().filter((item) => item.type === filterType)
        : this.getAllIndexedItems();
    }

    const queryTokens = extractTokens(queryStr);
    const results: Array<{ item: IndexedContent; relevance: number }> = [];

    for (const item of this.index.values()) {
      if (filterType && item.type !== filterType) continue;

      let score = 0;
      const lowerTitle = item.title.toLowerCase();
      const lowerDesc = item.description.toLowerCase();
      const lowerSub = (item.subBuvakiName || '').toLowerCase();

      for (const token of queryTokens) {
        if (lowerTitle.includes(token)) score += 10;
        if (lowerSub.includes(token)) score += 8;
        if (item.tags.some((t) => t.toLowerCase().includes(token))) score += 7;
        if (lowerDesc.includes(token)) score += 4;
        if (item.tokens.includes(token)) score += 2;
      }

      if (score > 0) {
        results.push({ item, relevance: score });
      }
    }

    results.sort((a, b) => b.relevance - a.relevance);
    return results.map((r) => r.item);
  }

  // 7. SYNC LIVE DOM HEAD WITH ACTIVE VIEW (Dynamic SEO / Social Meta Tags)
  public syncHead(activeItem?: {
    type: 'page' | 'post' | 'short' | 'long' | 'subBuvaki';
    title?: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    canonicalUrl?: string;
    subBuvakiName?: string;
    tags?: string[];
    schemaOrg?: Record<string, any>;
  }) {
    if (typeof document === 'undefined') return;

    const title = activeItem?.title || 'Buvaki - Social Media & Community Discussions';
    const description = activeItem?.description || 'Buvaki is a modern social media and community platform featuring sub-buvakis, interactive threads, live chat channels, and real-time discussions.';
    const canonical = activeItem?.canonicalUrl || `${DOMAIN}/`;
    const image = activeItem?.imageUrl || `${DOMAIN}/og-image.png`;
    const video = activeItem?.videoUrl;

    // Document title
    document.title = title;

    // Meta description & keywords
    this.setMetaTag('name', 'description', description);
    this.setMetaTag('name', 'keywords', ['buvaki', activeItem?.subBuvakiName || '', ...(activeItem?.tags || []), 'community', 'discussion'].filter(Boolean).join(', '));
    this.setMetaTag('name', 'robots', 'index, follow');

    // Canonical link
    let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonical;

    // OpenGraph
    this.setMetaTag('property', 'og:title', title);
    this.setMetaTag('property', 'og:description', description);
    this.setMetaTag('property', 'og:url', canonical);
    this.setMetaTag('property', 'og:image', image);
    this.setMetaTag('property', 'og:type', video ? 'video.other' : 'website');

    if (video) {
      this.setMetaTag('property', 'og:video', video);
      this.setMetaTag('property', 'og:video:type', 'video/mp4');
      this.setMetaTag('property', 'og:video:width', '1280');
      this.setMetaTag('property', 'og:video:height', '720');
      this.setMetaTag('name', 'twitter:card', 'player');
      this.setMetaTag('name', 'twitter:player', video);
      this.setMetaTag('name', 'twitter:player:width', '1280');
      this.setMetaTag('name', 'twitter:player:height', '720');
    } else {
      this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    }

    // Twitter
    this.setMetaTag('name', 'twitter:title', title);
    this.setMetaTag('name', 'twitter:description', description);
    this.setMetaTag('name', 'twitter:image', image);

    // Schema.org JSON-LD injection
    if (activeItem?.schemaOrg) {
      let script = document.getElementById('buvaki-jsonld') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'buvaki-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(activeItem.schemaOrg, null, 2);
    }
  }

  private setMetaTag(attrName: 'name' | 'property', attrVal: string, content: string) {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  // 8. EXPORT XML SITEMAP (compliant with Google Video & News standards)
  public generateSitemapXml(): string {
    const items = this.getAllIndexedItems();
    const now = new Date().toISOString().split('T')[0];

    const urlEntries = items.map((item) => {
      const priority = item.type === 'page' ? '1.0' : item.type === 'subBuvaki' ? '0.8' : '0.7';
      const changefreq = item.type === 'page' ? 'daily' : 'weekly';
      const date = item.publishedTime.split('T')[0] || now;

      let videoBlock = '';
      if (item.videoUrl && (item.type === 'short' || item.type === 'long')) {
        const thumb = item.imageUrl || `${DOMAIN}/og-image.png`;
        const durSeconds = item.duration ? parseDurationToSeconds(item.duration) : 90;
        videoBlock = `
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumb)}</video:thumbnail_loc>
      <video:title>${escapeXml(item.title)}</video:title>
      <video:description>${escapeXml(item.description)}</video:description>
      <video:content_loc>${escapeXml(item.videoUrl)}</video:content_loc>
      <video:publication_date>${date}</video:publication_date>
      <video:duration>${durSeconds}</video:duration>
      <video:uploader info="${DOMAIN}/u/${escapeXml(item.authorHandle || 'creator')}">${escapeXml(item.authorName || 'Buvaki Creator')}</video:uploader>
    </video:video>`;
      }

      return `  <url>
    <loc>${escapeXml(item.canonicalUrl)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${videoBlock}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlEntries}
</urlset>`;
  }

  // Subscribe to index updates
  public onIndexUpdate(cb: (stats: IndexStats) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    const stats = this.getStats();
    for (const listener of this.listeners) {
      try {
        listener(stats);
      } catch (err) {
        console.error('Error in index listener:', err);
      }
    }
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function parseDurationToSeconds(durStr?: string): number {
  if (!durStr) return 90;
  const parts = durStr.split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  } else if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  return 120;
}

// Global Singleton Auto-Indexer Instance
export const autoIndexer = new BuvakiAutoIndexer();
