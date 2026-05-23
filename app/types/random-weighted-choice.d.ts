declare module 'random-weighted-choice' {
  export interface WeightedChoice<T> {
    id: T
    weight: number
  }

  export default function randomWeightedChoice<T>(choices: WeightedChoice<T>[]): T
}
