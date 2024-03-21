import type { IPostTags } from "./post.dto"

export interface ITag {
  name: string
  type?: keyof IPostTags
  count?: number
}

// For default values
export class TagDTO implements ITag {
  name: ITag['name'] = ''
  type?: ITag['type']
  count?: ITag['count']
}

export default class Tag extends TagDTO {
  constructor(dto: TagDTO) {
    super()
    Object.assign(this, dto)
  }
}
