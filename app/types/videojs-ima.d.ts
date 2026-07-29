declare module 'videojs-contrib-ads'
declare module 'videojs-ima'

interface GoogleImaGlobal {
  ImaSdkSettings: {
    VpaidMode: {
      DISABLED: number
    }
  }
}

interface Window {
  google?: {
    ima?: GoogleImaGlobal
  }
}
