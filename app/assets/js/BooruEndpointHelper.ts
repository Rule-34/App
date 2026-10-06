/**
 * Booru domains whose API lives on a different host than the one users see.
 *
 * rule34.xxx serves its API from api.rule34.xxx. The bare host answers non-browser clients with a
 * Cloudflare 403, which the API cannot tell apart from a banned credential — so a request must
 * never be sent there. Requests therefore carry the API host, while routes, labels and SEO keep
 * the friendly domain the user recognises.
 */
const booruApiEndpointOverrides: Record<string, string> = {
  'rule34.xxx': 'api.rule34.xxx'
}

export function resolveBooruApiEndpoint(domain: string) {
  return booruApiEndpointOverrides[domain] ?? domain
}
