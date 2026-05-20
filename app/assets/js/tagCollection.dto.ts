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
  constructor(dto: ITagCollection) {
    super()
    this.name = dto.name
    this.tags = [...dto.tags]
  }
}
