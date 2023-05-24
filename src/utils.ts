type Point = { x: number; y: number }

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function getIntersection(a: Point, b: Point, c: Point, d: Point) {
  const tTop = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)
  const uTop = (c.y - a.y) * (a.x - b.x) - (c.x - a.x) * (a.y - b.y)
  const bottom = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y)

  if (bottom != 0) {
    const t = tTop / bottom
    const u = uTop / bottom
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        offset: t,
      }
    }
  }

  return null
}

export function polyIntersect(a: Point[], b: Point[]) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const intersection = getIntersection(
        a[i],
        a[(i + 1) % a.length],
        b[j],
        b[(j + 1) % b.length]
      )
      if (intersection) {
        return true
      }
    }
  }
  return false
}

export function getRGBA(value: number) {
  const alpha = Math.abs(value)
  const R = value < 0 ? 0 : 255
  const G = R
  const B = value > 0 ? 0 : 255
  return 'rgba(' + R + ',' + G + ',' + B + ',' + alpha + ')'
}
