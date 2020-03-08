import booruList from '~/assets/lib/rule-34-shared-resources/domains.json'

function findBooruByShort(short) {
  return booruList.find((booru) => booru.short === short)
}


export { booruList, findBooruByShort, removeBooruByShort }
