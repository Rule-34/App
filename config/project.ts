// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ProjectUrls {
  production: URL
  development: URL
}

export interface BrandingColors {
  primary: string
  secondary: string
  background: string
}

export interface Branding {
  colors: BrandingColors
}

export interface Analytics {
  clarityId?: string
  formbricksEnvironmentId?: string
  formbricksAppUrl?: string
  googleAnalyticsId?: string
}

export interface Sentry {
  dsn: string
}

export interface SEO {
  title: string
  description: string
  keywords: string[]
}

export interface Social {
  twitter: string
  discord: string
  github: string
}

/**
 * Main project configuration interface
 * This defines the complete structure of the project configuration
 */
export interface ProjectConfig {
  name: string
  shortName: string
  description: string
  version: string
  email: string
  urls: ProjectUrls
  branding: Branding
  analytics: Analytics
  sentry: Sentry
  seo: SEO
  social: Social
}

// =============================================================================
// CONFIGURATION DATA
// =============================================================================

/**
 * Main project configuration constant
 */
export const project: ProjectConfig = {
  name: 'Rule 34 App',
  shortName: 'R34 App',
  description:
    'Stream and download Rule 34 porn videos, GIFs, and images from multiple Boorus in a mobile-first web app',
  version: '3.2.0',
  email: 'contact@r34.app',
  urls: {
    production: new URL('https://r34.app'),
    development: new URL('http://localhost:3000')
  },
  branding: {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      background: '#000000'
    }
  },
  analytics: {
    clarityId: 'rbnkjz06ip',
    formbricksEnvironmentId: 'cm6gbkjeq0008l7036ckdvtnm',
    formbricksAppUrl: 'https://app.formbricks.com'
  },
  seo: {
    title: 'Rule 34 porn videos, GIFs and images at R34.app',
    description:
      'Stream and download Rule 34 porn videos, GIFs, and images from multiple Boorus in a mobile-first web app',
    keywords: ['rule34', 'hentai', 'porn', 'booru', 'anime', 'manga', 'xxx', 'nsfw', 'adult']
  },
  social: {
    twitter: 'https://twitter.com/Rule34App',
    discord: 'https://discord.gg/fUhYHSZ',
    github: 'https://github.com/Rule-34/App'
  }
}
