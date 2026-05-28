type BooruDomainLike = {
  domain?: string
}

export function hasDuplicateBooruDomain(
  boorus: readonly BooruDomainLike[],
  domain: string | undefined,
  ignoredIndex: number | null = null
) {
  if (!domain) {
    return false
  }

  return boorus.some((booru, index) => index !== ignoredIndex && booru.domain === domain)
}
