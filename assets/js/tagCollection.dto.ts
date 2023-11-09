export interface ITagCollection {
  name: string
  tags: string[]
}

// For default values
export class TagCollectionDTO implements ITagCollection {
  name: string = ''
  tags: string[] = []
}

export class TagCollection extends TagCollectionDTO {
  constructor(dto: TagCollectionDTO) {
    super()
    Object.assign(this, dto)
  }
}
