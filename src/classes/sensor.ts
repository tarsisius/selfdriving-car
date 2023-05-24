import { getIntersection, lerp } from '../utils'
import type Car from './car'

export default class Sensor {
  rayCount: number
  rayLength: number
  raySpread: number
  rays: {
    x: number
    y: number
  }[][]
  readings: {
    x: number
    y: number
    offset: number
  }[]

  constructor(public car: Car) {
    this.car = car
    this.rayCount = 5
    this.rayLength = 150
    this.raySpread = Math.PI / 2

    this.rays = []
    this.readings = []
  }

  #castRays() {
    this.rays = []
    for (let i = 0; i < this.rayCount; i++) {
      const angle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle

      this.rays.push([
        { x: this.car.x, y: this.car.y },
        {
          x: this.car.x - Math.sin(angle) * this.rayLength,
          y: this.car.y - Math.cos(angle) * this.rayLength,
        },
      ])
    }
  }

  #getReading(
    ray: { x: number; y: number }[],
    roadBorders: { x: number; y: number }[][],
    traffic: Car[]
  ) {
    let touches: { x: number; y: number; offset: number }[] = []

    for (let i = 0; i < roadBorders.length; i++) {
      const intersection = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      )
      if (intersection) {
        touches.push(intersection)
      }
    }

    for (let i = 0; i < traffic.length; i++) {
      const poly = traffic[i].polygon
      for (let i = 0; i < poly.length; i++) {
        const intersection = getIntersection(
          ray[0],
          ray[1],
          poly[i],
          poly[(i + 1) % poly.length]
        )
        if (intersection) {
          touches.push(intersection)
        }
      }
    }
    if (touches.length == 0) {
      return null
    } else {
      const offsets = touches.map((reading) => reading.offset)
      const minOffset = Math.min(...offsets)

      return touches[offsets.indexOf(minOffset)]
    }
  }

  update(roadBorders: { x: number; y: number }[][], traffic: Car[]) {
    this.#castRays()
    this.readings = []
    for (let i = 0; this.rays.length > i; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic)!)
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1]
      if (this.readings[i]) {
        end = this.readings[i]
      }
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'yellow'
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'black'
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
  }
}
