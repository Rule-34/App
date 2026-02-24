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
  formbricksEnvironmentId?: string
  formbricksAppUrl?: string
}

export interface Sentry {
  applicationKey: string
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

export interface Imgproxy {
  baseUrl: string
  internalProxyUrl: string
}

export interface DiscordOauth {
  clientId: string
  redirectUri: string
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
  imgproxy: Imgproxy
  sentry: Sentry
  seo: SEO
  social: Social
  discordOauth: DiscordOauth
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
    formbricksEnvironmentId: 'cm6gbkjeq0008l7036ckdvtnm',
    formbricksAppUrl: 'https://app.formbricks.com'
  },
  imgproxy: {
    baseUrl: 'https://imgproxy2.r34.app',
    internalProxyUrl: 'http://nginx-proxy/proxy?url='
  },
  sentry: {
    applicationKey: 'r34-app'
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
  },
  discordOauth: {
    clientId: '1475457445747884124',
    redirectUri: 'https://n8n.akbal.dev/webhook/b731e0f9-b13e-475f-80ae-09a86b6706ca'
  }
}
