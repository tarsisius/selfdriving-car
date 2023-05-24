import { lerp } from '../utils'

export default class Road {
  left: number
  right: number
  top: number
  bottom: number
  borders: {
    x: number
    y: number
  }[][]

  constructor(
    public x: number,
    public width: number,
    public laneCount: number
  ) {
    this.x = x
    this.width = width
    this.laneCount = laneCount

    this.left = x - width / 2
    this.right = x + width / 2

    this.top = -1000000
    this.bottom = 1000000

    this.borders = [
      [
        { x: this.left, y: this.top },
        { x: this.left, y: this.bottom },
      ],
      [
        { x: this.right, y: this.top },
        { x: this.right, y: this.bottom },
      ],
    ]
  }

  getInLane(lane: number) {
    const laneWidth = this.width / this.laneCount
    return (
      this.left +
      laneWidth / 2 +
      Math.min(lane - 1, this.laneCount - 1) * laneWidth
    )
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 5
    ctx.strokeStyle = 'white'

    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount)
      ctx.setLineDash([20, 20])

      ctx.beginPath()
      ctx.moveTo(x, this.top)
      ctx.lineTo(x, this.bottom)
      ctx.stroke()
    }

    ctx.setLineDash([])
    this.borders.forEach((border) => {
      ctx.beginPath()
      ctx.moveTo(border[0].x, border[0].y)
      ctx.lineTo(border[1].x, border[1].y)
      ctx.stroke()
    })
  }
}
