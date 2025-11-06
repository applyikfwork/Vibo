/**
 * SEO Utility Functions for Vibe OS Lite
 * Provides helpers for optimizing content for search engines
 */

/**
 * Generate SEO-friendly slugs from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a specific length for meta descriptions
 */
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Extract keywords from text content
 */
export function extractKeywords(text: string, count: number = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Generate structured data for a blog post or vibe
 */
export function generateVibeStructuredData(vibe: {
  id: string;
  text: string;
  emotion: string;
  timestamp: Date;
  username: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibeos-lite.repl.co';
  
  return {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "headline": truncateText(vibe.text, 110),
    "articleBody": vibe.text,
    "datePublished": vibe.timestamp.toISOString(),
    "author": {
      "@type": "Person",
      "name": vibe.username
    },
    "publisher": {
      "@type": "Organization",
      "name": "Vibe OS Lite",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/vibe/${vibe.id}`
    },
    "keywords": [vibe.emotion, "emotional wellness", "mood sharing", "feelings"],
  };
}

/**
 * Generate Open Graph tags for dynamic content
 */
export function generateOgTags(params: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibeos-lite.repl.co';
  
  return {
    title: params.title,
    description: params.description,
    url: params.url || baseUrl,
    siteName: 'Vibe OS Lite',
    type: params.type || 'website',
    images: [
      {
        url: params.image || `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: params.title,
      }
    ],
  };
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Validate and clean meta description
 */
export function cleanMetaDescription(description: string): string {
  // Remove extra whitespace
  let cleaned = description.replace(/\s+/g, ' ').trim();
  
  // Ensure it's within optimal length (150-160 chars)
  if (cleaned.length > 160) {
    cleaned = truncateText(cleaned, 160);
  }
  
  // Ensure it starts with a capital letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  // Ensure it ends with proper punctuation
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }
  
  return cleaned;
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vibeos-lite.repl.co';
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };
}

/**
 * SEO constants and recommendations
 */
export const SEO_CONSTANTS = {
  META_TITLE_MIN: 30,
  META_TITLE_MAX: 60,
  META_TITLE_OPTIMAL: 55,
  META_DESCRIPTION_MIN: 120,
  META_DESCRIPTION_MAX: 160,
  META_DESCRIPTION_OPTIMAL: 155,
  KEYWORDS_MIN: 3,
  KEYWORDS_MAX: 10,
  H1_COUNT: 1, // Only one H1 per page
  READING_TIME_WPM: 200,
};

/**
 * Validate SEO compliance
 */
export function validateSEO(params: {
  title: string;
  description: string;
  keywords: string[];
  h1Count: number;
}) {
  const issues: string[] = [];
  
  // Title validation
  if (params.title.length < SEO_CONSTANTS.META_TITLE_MIN) {
    issues.push(`Title too short (${params.title.length} chars, min ${SEO_CONSTANTS.META_TITLE_MIN})`);
  }
  if (params.title.length > SEO_CONSTANTS.META_TITLE_MAX) {
    issues.push(`Title too long (${params.title.length} chars, max ${SEO_CONSTANTS.META_TITLE_MAX})`);
  }
  
  // Description validation
  if (params.description.length < SEO_CONSTANTS.META_DESCRIPTION_MIN) {
    issues.push(`Description too short (${params.description.length} chars, min ${SEO_CONSTANTS.META_DESCRIPTION_MIN})`);
  }
  if (params.description.length > SEO_CONSTANTS.META_DESCRIPTION_MAX) {
    issues.push(`Description too long (${params.description.length} chars, max ${SEO_CONSTANTS.META_DESCRIPTION_MAX})`);
  }
  
  // Keywords validation
  if (params.keywords.length < SEO_CONSTANTS.KEYWORDS_MIN) {
    issues.push(`Too few keywords (${params.keywords.length}, min ${SEO_CONSTANTS.KEYWORDS_MIN})`);
  }
  if (params.keywords.length > SEO_CONSTANTS.KEYWORDS_MAX) {
    issues.push(`Too many keywords (${params.keywords.length}, max ${SEO_CONSTANTS.KEYWORDS_MAX})`);
  }
  
  // H1 validation
  if (params.h1Count !== SEO_CONSTANTS.H1_COUNT) {
    issues.push(`Incorrect H1 count (${params.h1Count}, should be ${SEO_CONSTANTS.H1_COUNT})`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}
