'use client';

import Script from 'next/script';

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vibe OS Lite",
    "description": "The social network that feels you. Share emotions, track moods, and find your vibe.",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://vibeos-lite.repl.co",
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL || "https://vibeos-lite.repl.co"}/logo.png`,
    "sameAs": [
      "https://twitter.com/vibeos",
      "https://facebook.com/vibeos",
      "https://instagram.com/vibeos"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@vibeos.com"
    }
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Vibe OS Lite",
    "description": "Emotional wellness social platform with AI-powered mood tracking",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://vibeos-lite.repl.co",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://vibeos-lite.repl.co"}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Vibe OS Lite",
    "description": "Share your emotions, track your mood, and connect with others on Vibe OS Lite. AI-powered emotional wellness platform.",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://vibeos-lite.repl.co",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Mood Tracking",
      "AI-Powered Personalization",
      "Emotional Wellness Community",
      "Mood History Analytics",
      "Smart Feed",
      "Weekly AI Reflections",
      "Anonymous Sharing",
      "Emotion-Based Connection"
    ],
    "screenshot": `${process.env.NEXT_PUBLIC_BASE_URL || "https://vibeos-lite.repl.co"}/screenshot.png`
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_BASE_URL || "https://vibeos-lite.repl.co"
      }
    ]
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <Script
        id="web-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
