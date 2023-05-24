export default class Controls {
  public up: boolean
  public down: boolean
  public left: boolean
  public right: boolean

  constructor(public type: string) {
    this.up = false
    this.down = false
    this.left = false
    this.right = false

    switch (type) {
      case 'PLAYER':
        this.#addKeyboardListeners()
        break
      case 'OBSTACLE':
        this.up = true
        break
    }
  }

  #addKeyboardListeners() {
    document.onkeydown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          this.up = true
          break
        case 'ArrowDown':
          this.down = true
          break
        case 'ArrowLeft':
          this.left = true
          break
        case 'ArrowRight':
          this.right = true
          break
      }
    }
    document.onkeyup = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          this.up = false
          break
        case 'ArrowDown':
          this.down = false
          break
        case 'ArrowLeft':
          this.left = false
          break
        case 'ArrowRight':
          this.right = false
          break
      }
    }
  }
}
