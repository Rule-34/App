/** Whether the CSP should add `upgrade-insecure-requests` (off in dev and for http preview deployments). */
export function shouldUpgradeInsecureRequests(nodeEnv?: string, disableUpgradeEnv?: string): boolean {
  return nodeEnv === 'production' && disableUpgradeEnv !== 'true'
}
