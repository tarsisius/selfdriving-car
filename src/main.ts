import './styles/app.css'
import Car from './classes/car'
import Road from './classes/road'
import Visualizer from './classes/visualizer'
import { Brain } from './classes/network'

document.querySelector<HTMLDivElement>('body')!.innerHTML = `
<canvas id="carCanvas"></canvas>
<div id="verticalButtons">
  <button id="save">💾</button>
  <button id="discard">🗑️</button>
</div>
<canvas id="networkCanvas"></canvas>
`
const saveButton = document.getElementById('save') as HTMLButtonElement
const discardButton = document.getElementById('discard') as HTMLButtonElement

const carCanvas = document.getElementById('carCanvas') as HTMLCanvasElement
carCanvas.width = 200
const networkCanvas = document.getElementById(
  'networkCanvas'
) as HTMLCanvasElement
networkCanvas.width = 300

const carContext = carCanvas.getContext('2d')!
const networkContext = networkCanvas.getContext('2d')!

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3)

const traffic = [
  new Car(road.getInLane(2), -100, 30, 50, 'OBSTACLE'),
  new Car(road.getInLane(1), -300, 30, 50, 'OBSTACLE'),
  new Car(road.getInLane(3), -300, 30, 50, 'OBSTACLE'),
  new Car(road.getInLane(1), -500, 30, 50, 'OBSTACLE'),
  new Car(road.getInLane(2), -500, 30, 50, 'OBSTACLE'),
  new Car(road.getInLane(2), -700, 30, 50, 'OBSTACLE'),
  new Car(road.getInLane(3), -700, 30, 50, 'OBSTACLE'),
]
const cars = generateCar(1000)

let bestCar = cars[0]
if (localStorage.getItem('bestBrain')) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem('bestBrain')!)
    if (i !== 0) {
      Brain.mutate(cars[i].brain, 0.1)
    }
  }
  bestCar.brain = JSON.parse(localStorage.getItem('bestBrain')!)
}

animate()

saveButton.addEventListener('click', () => {
  localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain))
})

discardButton.addEventListener('click', () => {
  localStorage.removeItem('bestBrain')
})

function generateCar(N: number) {
  const cars = []
  for (let i = 1; i < N; i++) {
    cars.push(new Car(road.getInLane(2), 100, 30, 50, 'AI'))
  }
  return cars
}

function animate() {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, [])
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic)
  }

  bestCar = cars.find((car) => car.y === Math.min(...cars.map((car) => car.y)))!

  carCanvas.height = window.innerHeight
  networkCanvas.height = window.innerHeight

  carContext.save()
  carContext.translate(0, -bestCar.y + carCanvas.height * 0.7)

  road.draw(carContext)
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carContext, false)
  }
  carContext.globalAlpha = 0.2
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carContext, false)
  }
  carContext.globalAlpha = 1
  bestCar.draw(carContext, true)
  carContext.restore()

  Visualizer.drawNetwork(networkContext, bestCar.brain)
  requestAnimationFrame(animate)
}
