import domains from '~/assets/lib/rule-34-shared-resources/domains.json'

function findDomainByShort(domainToSearch) {
  return domains.find((domain) => domain.short === domainToSearch)
}

export { domains, findDomainByShort }
