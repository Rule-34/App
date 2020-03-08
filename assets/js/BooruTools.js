import booruList from '~/assets/lib/rule-34-shared-resources/booru-list.json'

// Returns only one
function findBooruByShort(short) {
  return booruList.find((booru) => booru.short === short)
}

// Returns an array
function removeBooruByShort(shortArray) {
  return booruList.filter((booru) => !shortArray.includes(booru.short))
}

// Returns an array
function returnSafeBoorus() {
  return booruList.filter((booru) => !booru.nsfw)
}

export { booruList, findBooruByShort, removeBooruByShort, returnSafeBoorus }
