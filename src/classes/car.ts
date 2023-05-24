import Controls from './controls'
import Sensor from './sensor'
import { Brain } from './network'
import { polyIntersect } from '../utils'

export default class Car {
  speed: number
  maxSpeed: number
  acceleration: number
  friction: number
  angle: number
  controls: Controls
  sensor: Sensor | undefined
  brain: Brain 
  polygon: { x: number; y: number }[]
  damaged: boolean
  useBrain: boolean

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public type: 'PLAYER' | 'AI' | 'OBSTACLE'
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = 0
    this.acceleration = 0.2
    this.maxSpeed = type === 'OBSTACLE' ? 2 : 3
    this.friction = 0.05
    this.angle = 0
    this.damaged = false
    this.polygon = []
    this.useBrain = type === 'AI'
    this.brain = new Brain([0, 0, 0])
    if (type !== 'OBSTACLE') {
      this.sensor = new Sensor(this)
      this.brain = new Brain([this.sensor.rayCount, 6, 4])
    }
    this.controls = new Controls(type)
  }

  #move() {
    if (this.controls.up) {
      this.speed += this.acceleration
    }
    if (this.controls.down) {
      this.speed -= this.acceleration
    }
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2
    }
    if (this.speed > 0) {
      this.speed -= this.friction
    }
    if (this.speed < 0) {
      this.speed += this.friction
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0
    }
    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1
      if (this.controls.left) {
        this.angle += 0.03 * flip
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip
      }
    }

    this.x -= Math.sin(this.angle) * this.speed
    this.y -= Math.cos(this.angle) * this.speed
  }

  #createPolygon() {
    const points = []
    const rad = Math.hypot(this.width / 2, this.height / 2)
    const alpha = Math.atan2(this.width, this.height)
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    })
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    })
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    })
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    })
    return points
  }

  #assessDamage(roadBorders: { x: number; y: number }[][], traffic: Car[]) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polyIntersect(this.polygon, roadBorders[i])) {
        return true
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polyIntersect(this.polygon, traffic[i].polygon)) {
        return true
      }
    }
    return false
  }

  update(roadBorders: { x: number; y: number }[][], traffic: Car[]) {
    if (!this.damaged) {
      this.#move()
      this.polygon = this.#createPolygon()
      this.damaged = this.#assessDamage(roadBorders, traffic)
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic)
      const offsets = this.sensor.readings.map((r) =>
        r == null ? 0 : 1 - r.offset
      )
      const outputs = Brain.feedForward(offsets, this.brain!)
      if (this.useBrain) {
        this.controls.up = Boolean(outputs[0])
        this.controls.down = Boolean(outputs[1])
        this.controls.left = Boolean(outputs[2])
        this.controls.right = Boolean(outputs[3])
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, drawSensor: boolean) {
    if (this.damaged) {
      ctx.fillStyle = '#fff'
    } else {
      ctx.fillStyle = this.type !== 'OBSTACLE' ? 'blue' : 'red'
    }
    ctx.beginPath()
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
    for (let i = 1; i < this.polygon.length; i++) {
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
    }
    ctx.fill()
    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx)
    }
  }
}
