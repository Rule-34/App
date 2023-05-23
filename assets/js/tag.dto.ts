export interface ITag {
  name: string
  count?: number
}

// For default values
export class TagDTO implements ITag {
  name: string = ''
  count?: number
}

export default class Tag extends TagDTO {
  constructor(dto: TagDTO) {
    super()
    Object.assign(this, dto)
  }
}
