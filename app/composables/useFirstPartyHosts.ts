import { project } from '~~/config/project'

/**
 * Hostnames that count as first party: the production site, the origin serving this request (so mirror domains
 * and dev hosts work without listing them) and the image proxy. Subdomains of each are first party too.
 */
export function useFirstPartyHosts() {
  const requestHostname = useRequestURL().hostname
  const imgproxyHostname = URL.parse(project.imgproxy.baseUrl)?.hostname

  return [project.urls.production.hostname, requestHostname, imgproxyHostname].filter((host): host is string => !!host)
}
