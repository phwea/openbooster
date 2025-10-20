declare module 'howler' {
  export class Howl {
    constructor(options: { src: string[]; volume?: number })
    play(id?: string | number): number
    stop(id?: string | number): void
  }
}
