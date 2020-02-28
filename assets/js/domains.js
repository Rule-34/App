const domains = [
  { name: 'rule34.xxx', short: 'xxx', pid: 0 },
  { name: 'rule34.paheal.net', short: 'paheal', pid: 0 },
  { name: 'danbooru.donmai.us', short: 'danbooru', pid: 1 },
  { name: 'gelbooru.com', short: 'gelbooru', pid: 0 },
  { name: 'lolibooru.moe', short: 'loli', pid: 1 },
  { name: 'e621.net', short: 'e621', pid: 1 }
]

function findDomainByShort(domainToSearch) {
  return domains.find((domain) => domain.short === domainToSearch)
}

export { domains, findDomainByShort }
