import * as webxr from "../src/webxr.js"
import * as THREE from "three"
import * as pseudoRandom from "../src/pseudo-random.js"

const VEC3_ZERO = {x:0, y:0, z:0}
const AXIS = ['x','y','z']


const {scene, camera, renderer} = webxr.init()

renderer.setAnimationLoop(animate)

let motions = []
let lastTime

function animate() {
  const time = performance.now() * .001
  const dt = lastTime ? time - lastTime : 0

  for (let motion of motions) {
    motion(time)
  }

  renderer.render( scene, camera )

  lastTime = time
}


// lights
const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 )
scene.add( ambientLight )

const pointLight = new THREE.PointLight( 0xffffff, 0.8 )
pointLight.position.set(0, 4, -4)
scene.add( pointLight )

// objects
const objects = []

for (let i = 0; i < 10; i++) {
  const sphere = new THREE.Mesh( new THREE.SphereBufferGeometry( .1, 20, 10 ), new THREE.MeshStandardMaterial() )
  scene.add(sphere)
  objects.push(sphere)
}

// motions.push((t) => rotation(group.rotation, {velocity:{x:0,y:.5,z:0}}, t))
motions.push((t) => {
  const rndFn = pseudoRandom.createPseudoRandom(187261)
  for (let i = 0, n = objects.length; i < n; i++) {
    const obj = objects[i]
    // zero(obj.position)
    // linear({x:0,y:0,z:-4}, pseudoRandom.randomize({x:.1,y:.4,z:.1},{x:-.1,y:.8,z:-.1}, rndFn), {x:0,y:-.2,z:0}, t, obj.position)
    // const isSphere = rndFn() < .5
    // if (isSphere) {
    //   randomSphere(1, rndFn, obj.position)
    //   obj.material.color.setHex(0xff0000)
    // } else {
    //   randomCube(1, rndFn, obj.position)
    //   obj.material.color.setHex(0x00ff00)
    // }
    // randomCube(1, rndFn, obj.position)
    grid3D(1, i, n, obj.position)
    // orbital(randomDirection({}, rndFn), linear(0, 2, 0, t), obj.position)
    angular(linear(VEC3_ZERO, {x:0, y:.5, z:0}, VEC3_ZERO, t), obj.position)
  }
})

function linear(offset, velocity, acceleration, t, out) {
  if (typeof offset === "object") {
    out = out || {x:0, y:0, z:0}
    for (let k of AXIS) {
      out[k] += offset[k] + velocity[k]*t + .5*acceleration[k]*t*t
    }
  } else {
    out = out || 0
    out += offset + velocity*t + .5*acceleration*t*t
  }
  return out
}

const cross = new THREE.Vector3()
const euler = new THREE.Euler(0,0,0,'YXZ')

function angular(angles, out = {x:1, y:0, z:0}) {
  THREE.Vector3.prototype.copy.call(euler, angles)
  return THREE.Vector3.prototype.applyEuler.call(out, euler)
}

function orbital(axis, angle, out = {x:1, y:0, z:0}) {
  THREE.Vector3.prototype.crossVectors.call(cross, axis, out)
  THREE.Vector3.prototype.normalize.call(cross)
  return THREE.Vector3.prototype.applyAxisAngle.call(out, cross, angle)
}

function zero(out) {
  out.x = out.y = out.z = 0
  return out
}

function spherical(r, phi, theta, out={}) {
  return THREE.Vector3.prototype.setFromSphericalCoords.call(out, r, phi, theta)
}

function randomDirection(rndFn = Math.random, out = {}) {
  const x = rndFn() - .5
  const y = rndFn() - .5
  const z = rndFn() - .5
  const len = Math.hypot(x, y, z) // assume it is non-zero
  out.x = x/len
  out.y = y/len
  out.z = z/len
  return out
}

function randomCube(halfWidth, rndFn = Math.random, out = {}) {
  const r = halfWidth
  const face = ~~(rndFn()*6)
  const rnd1 = r*(2*rndFn() - 1)
  const rnd2 = r*(2*rndFn() - 1)
  switch (face) {
    case 0: out.x =  r; out.y = rnd1; out.z = rnd2; break
    case 1: out.x = -r; out.y = rnd1; out.z = rnd2; break
    case 2: out.x = rnd1; out.y =  r; out.z = rnd2; break
    case 3: out.x = rnd1; out.y = -r; out.z = rnd2; break
    case 4: out.x = rnd1; out.y = rnd2; out.z =  r; break
    case 5: out.x = rnd1; out.y = rnd2; out.z = -r; break
  }
  return out
}

function randomSphere(r, rndFn = Math.random, out = {}) {
  const phi = rndFn()*Math.PI*2
  const theta = rndFn()*Math.PI
  return THREE.Vector3.prototype.setFromSphericalCoords.call(out, r, phi, theta)
}

function grid3D(halfWidth, i, n, out = {}) {
  const cols = Math.ceil( Math.pow(n, 1/3) )
  const mid = (cols - 1)/2
  const x = i % cols - mid
  const y = Math.floor(i/cols) % cols - mid
  const z = Math.floor(i/cols/cols) - mid
  out.x = x*halfWidth
  out.y = y*halfWidth
  out.z = z*halfWidth
  return out
}