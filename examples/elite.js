import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import WebXRPolyfill from 'webxr-polyfill'


let lastTime

function animate() {
  const time = performance.now() * .001
  const dt = lastTime ? time - lastTime : 0

  renderer.render( scene, camera )

  controls.update()
  lastTime = time
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


new WebXRPolyfill()

const scene = new THREE.Scene()

// // to teleport in VR, move the cameraRig
// const cameraRig = new THREE.Group()
// cameraRig.position.z = 4
// scene.add(cameraRig)

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 )
camera.position.z = 4
scene.add(camera)

// rendering
const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.xr.enabled = true
renderer.setAnimationLoop( animate )

document.body.appendChild( renderer.domElement )
document.body.appendChild( VRButton.createButton( renderer ) )

window.addEventListener( 'resize', onWindowResize, false )

let objects = []

const controls = new OrbitControls(camera, renderer.domElement)

// lights
const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 )
scene.add( ambientLight )

const pointLight = new THREE.PointLight( 0xffffff, 0.8 )
pointLight.position.set(4, 4, -4)
scene.add( pointLight )

// objects
// const group = new THREE.Group()
// scene.add( group )

// const object = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 20, 10 ), new THREE.MeshStandardMaterial() )
// object.position.set( 0, 0, -4 )
// group.add( object )

const geo = new THREE.BufferGeometry()
const {verts, indices} = anaconda()
geo.setIndex(indices)
geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))

const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({flatShading: true, color: 0}))
const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial())
scene.add(mesh)
scene.add(edges)

objects.push(mesh)
objects.push(edges)

function tumble(obj3D, dt) {
  obj3D.rotation.x += 1*dt
  obj3D.rotation.y += .5*dt
}

function simpleDecals(verts, indices, decals, direction) {
  const newDecals = []
  const ray = new THREE.Ray()
  const target = new THREE.Vector3()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const numVerts = verts.length

  ray.direction.set(direction[0], direction[1], direction[2])

  for (let i = 0; i < decals.length; i+=3) {
    ray.origin.set(decals[i], decals[i+1], decals[i+2])
    let found = false

    for (let j = 0; j < indices.length && !found; j+=3) {
      const ai = indices[j]*3
      const bi = indices[j+1]*3
      const ci = indices[j+2]*3

      if (ai < numVerts && bi < numVerts && ci < numVerts) {
        a.fromArray(verts, ai)
        b.fromArray(verts, indices[j+1]*3)
        c.fromArray(verts, indices[j+2]*3)
  
        if (ray.intersectTriangle(a,b,c, true, target)) {
          newDecals.push(target.x, target.y, target.z)
          found = true
        }
      }
    }

    console.assert(found, `decal ${i} (${i/3}) does not hit the object`)
  }

  return newDecals
}

function thargoid() {
  const numSides = 8
  const delta = 2*Math.PI/numSides
  const innerRadius = .55
  const innerHeight = .2

  const verts = [0,0,0, 0,innerHeight,0]
  const indices = []

  for (let i = 0, angle = delta/2; i < numSides; i++, angle += delta) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const j = verts.length/3

    verts.push(c, 0, s)
    verts.push(innerRadius*c, innerHeight, innerRadius*s)

    if (i < numSides-1) {
      indices.push(0,j,j+2) // bottom
      indices.push(1,j+3,j+1) // top
      indices.push(j,j+1,j+3) // side1
      indices.push(j,j+3,j+2) // side2
  
    } else {
      indices.push(0,j,2) // bottom
      indices.push(1,3,j+1) // top
      indices.push(j,j+1,3) // side1
      indices.push(j,3,2) // side2

    }
  }

  return { verts, indices }
}

function ferDeLance() {
  const hulls = [
    0,0,1, 0,.3,-.15, .4,.25,0, -.4,.25,0,  .2,.25,-.3, -.2,.25,-.3, .4,0,0, -.4,0,0,  .2,0,-.3, -.2,0,-.3,
  ]
  const windows = [ // index 10+
    .05,1,0, .3,1,.1, .05,1,.7,
    -.05,1,0, -.3,1,.1, -.05,1,.7,
  ]

  const indices = [
    1,0,2, 1,2,4, 1,4,5, 1,5,3, 1,3,0, // top
    3,7,0, 2,0,6, 2,6,8, 2,8,4, 3,9,7, 3,5,9, 4,9,5, 4,8,9, // sides
    7,9,0, 9,8,0, 8,6,0, // bottom
    10,12,11, 13,15,14, // windows
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, windows, [0,-1,0]) ]

  return { verts, indices }
}

function mamba() {
  const hulls = [
    0,0,1, .3,.2,-.3, -.3,.2,-.3, .6,0,-.3, -.6,0,-.3, 
  ]
  const windows = [ // index 5+
    .05,1,.5, -.05,1,.5, .06,1,.57, -.06,1,.57, 
  ]
  const thrusters = [ // index 9+
    .4,.05,-1, .3,.15,-1, .3,.05,-1, 
    .2,.05,-1, .2,.15,-1, -.2,.05,-1, -.2,.15,-1, 
    -.4,.05,-1, -.3,.15,-1, -.3,.05,-1, 
  ]
  const indices = [
    0,1,2, 0,3,1, 0,2,4, // top
    3,4,1, 1,4,2, // back
    4,3,0, // bottom
    5,8,7, 5,6,8, // windows
    9,11,10, 13,12,14, 13,14,15, 17,18,16, // thrusters
  ]
  
  const verts = [ ...hulls, ...simpleDecals(hulls, indices, windows, [0,-1,0]), ...simpleDecals(hulls, indices, thrusters, [0,0,1]) ]
  return {verts, indices}
}

function sideWinder() {
  const hulls = [
    0,.15,-.5, .3,0,.5, -.3,0,.5, .6,0,-.5, -.6,0,-.5, 0,-.15,-.5,
  ]
  const thrusters = [
    .13,-.025,-1, .13,.025,-1, -.13,-.025,-1, -.13,.025,-1,
  ]
  const indices = [
    0,2,1, 0,1,3, 0,4,2, // top
    3,1,5, 5,1,2, 5,2,4, // bottom
    3,5,0, 0,5,4, // back,
    7,6,9, 6,8,9, // thusters
  ]
  const verts = [ ...hulls, ...simpleDecals(hulls, indices, thrusters, [0,0,1]) ]

  return {verts, indices}
}

function adder() {
  const hulls = [
    .4,.1,-.4, -.4,.1,-.4, .4,.1,.2, -.4,.1,.2, .4,0,.6, -.4,0,.6, .5,0,-.4, -.5,0,-.4, .5,0,-.2, -.5,0,-.2, .4,-.1,-.4, -.4,-.1,-.4, .4,-.1,.2, -.4,-.1,.2,
  ]
  const windows = [ // index 14+
    .22,1,.35, -.22,1,.35, .22,1,.45, -.22,1,.45,
  ]
  const hatches = [ // index 18+
    .05,1,-.3, .15,1,-.2, .05,1,0, -.05,1,-.3, -.15,1,-.2, -.05,1,0, 
  ]
  const thrusters = [ // index 24+
    .17,.05,-1, -.17,.05,-1, .17,-.05,-1, -.17,-.05,-1,
  ]
  const indices = [
    0,3,2, 0,1,3, 2,5,4, 2,3,5, 6,0,2, 6,2,8, 8,2,4, 1,7,9, 1,9,3, 3,9,5, // top
    10,12,13, 10,13,11, 12,4,5, 12,5,13, 6,12,10, 6,8,12, 8,4,12, 11,9,7, 11,13,9, 13,5,9, // bottom
    6,10,0, 0,10,11, 0,11,1, 1,11,7, // back
    14,15,17, 14,17,16, // windows
    18,20,19, 21,23,22, // hatches
    24,26,27, 24,27,25, // thrusters
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, windows, [0,-1,0]), ...simpleDecals(hulls, indices, hatches, [0,-1,0]), ...simpleDecals(hulls, indices, thrusters, [0,0,1]) ]

  return {verts, indices}
}

function krait() {
  const hulls = [
    0,.12,-.4, 0,0,.6, .4,.05,-.1, -.4,.05,-.1, .4,-.05,-.1, -.4,-.05,-.1, 0,-.12,-.4, -.4,0,.6, .4,0,.6,
  ]
  const thrusters = [ // index 9+
    .2,0,-1, 0,.08,-1, 0,-.08,-1, -.2,0,-1,
  ]
  const indices = [
    0,1,2, 0,3,1, // top
    6,4,1, 6,1,5, // bottom
    1,4,2, 1,3,5, // front
    4,6,0, 2,4,0, 0,6,5, 0,5,3, // back
    4,2,8, 4,8,2, 5,3,7, 5,7,3, // lasers
    9,11,10, 10,11,12 // thrusters
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, thrusters, [0,0,1]) ]

  return {verts, indices}
}

function dodecStation() {
  const t = ( 1 + Math.sqrt(5) )/2
  const r = 1/t

  // dodecahedron
  const hulls = [
    // (±1, ±1, ±1)
    -1, -1, -1,  -1, -1, 1,
    -1, 1, -1, -1, 1, 1,
    1, -1, -1, 1, -1, 1,
    1, 1, -1, 1, 1, 1,

    // (0, ±1/φ, ±φ)
     0, -r, -t, 0, -r, t,
     0, r, -t, 0, r, t,

    // (±1/φ, ±φ, 0)
    -r, -t, 0, -r, t, 0,
     r, -t, 0, r, t, 0,

    // (±φ, 0, ±1/φ)
    -t, 0, -r, t, 0, -r,
    -t, 0, r, t, 0, r
  ]
  
  const entries = [ // index 20+
    -.3,-.1,2, .3,-.1,2, -.3,.1,2, .3,.1,2, 
  ]

  const rot45 = new THREE.Matrix4().makeRotationX(-Math.PI/3)
  const pos = new THREE.Vector3()
  for (let i = 0; i < hulls.length; i+=3) {
    pos.fromArray(hulls, i)
    pos.applyMatrix4(rot45)
    pos.toArray(hulls, i)
  }

  const indices = [
    3, 11, 7,   3, 7, 15,   3, 15, 13,
    7, 19, 17,   7, 17, 6,   7, 6, 15,
    17, 4, 8,   17, 8, 10,   17, 10, 6,
    8, 0, 16,   8, 16, 2,   8, 2, 10,
    0, 12, 1,   0, 1, 18,   0, 18, 16,
    6, 10, 2,   6, 2, 13,   6, 13, 15,
    2, 16, 18,   2, 18, 3,   2, 3, 13,
    18, 1, 9,   18, 9, 11,   18, 11, 3,
    4, 14, 12,   4, 12, 0,   4, 0, 8,
    11, 9, 5,   11, 5, 19,   11, 19, 7,
    19, 5, 14,   19, 14, 4,   19, 4, 17,
    1, 12, 14,   1, 14, 5,   1, 5, 9, // hull
    
    21,22,20, 21,23,22, // entry
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, entries, [0,0,-1]) ]

  return {verts, indices}
}

function coriolisStation() {
  const hulls = [
    0,1,1, 1,0,1, 0,-1,1, -1,0,1,
    -1,1,0, 1,1,0, 1,-1,0, -1,-1,0,
    0,1,-1, 1,0,-1, 0,-1,-1, -1,0,-1,
  ]
  
  const entries = [ // index 12+
    -.3,-.1,1, .3,-.1,1, -.3,.1,1, .3,.1,1, 
  ]

  const indices = [
    0,2,1, 0,3,2,
    8,9,10, 8,10,11,
    1,6,9, 5,1,9,
    0,5,8, 0,8,4,
    10,6,2, 10,2,7,
    4,11,7, 4,7,3, // hull sides

    1,2,6, 6,10,9, 11,10,7, 7,2,3, 0,1,5, 5,9,8, 4,8,11, 3,0,4, // hull corners

    13,14,12, 13,15,14, // entry
  ]

  const verts = [ ...hulls, ...entries ]

  return {verts, indices}
}

function hognose() {
  const hulls = [
    0,.4,-.2, 0,0,.6, .4,.2,-.2, -.4,.2,-.2, 0,0,-.4
  ]

  const thrusters = [ // index 5+
    .05,.3,-1, .3,.2,-1, .05,.1,-1, -.05,.3,-1, -.3,.2,-1, -.05,.1,-1, 
  ]

  const indices= [
    0,1,2, 0,3,1, // top
    4,0,2, 4,3,0, // back
    4,1,3, 2,1,4, // bottom
    5,6,7, 8,10,9, // thrusters
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, thrusters, [0,0,1]) ]

  return {verts, indices}
}

function cobraMkI() {
  const hulls = [
    0,.15,0, .15,0,.3, -.15,0,.3, .45,0,.14, -.45,0,.14, .45,0,-.25, -.45,0,-.25, .3,.08,-.3, -.3,.08,-.3, .3,-.08,-.3, -.3,-.08,-.3, 
  ]

  const windows = [ // index 11+
    .07,1,.18, -.07,1,.18, .07,1,.22, -.07,1,.22, 
  ]

  const thrusters = [ // index 15+
    .05,.06,-1, .25,.06,-1, .15,-.06,-1, -.05,.06,-1, -.25,.06,-1, -.15,-.06,-1, 
  ]

  const indices = [
    0,2,1, 0,1,3, 0,3,7, 7,3,5, 0,7,8, 0,8,4, 8,6,4, 0,4,2, // top
    10,4,6, 5,3,9, 10,2,4, 3,1,9, 1,2,10, 1,10,9, // bottom
    5,9,7, 7,10,8, 7,9,10, 8,10,6, // back

    11,12,14, 11,14,13, // windows
    15,16,17, 18,19,20, // thrusters
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, windows, [0,-1,0]), ...simpleDecals(hulls, indices, thrusters, [0,0,1]) ]

  return {verts, indices}
}

function racer() {
  const hulls = [
    0,.15,0, .12,0,.4, -.12,0,.4, .4,-.15,.15, -.4,-.15,.15, 0,0,-.6,
  ]

  const windows = [ // index 6+
    0,1,.12, .04,1,.21, -.04,1,.21, 0,1,.3, 
  ]

  const thrusters = [ // index 10+
    0,-1,-.4, .1,-1,0, -.1,-1,0, 
  ]

  const indices = [
    0,2,1, 0,5,2, 0,1,5, 2,5,4, 1,3,5, // top
    1,2,4, 1,4,3, 3,4,5, // bottom
    6,9,7, 6,8,9, // windows
    10,11,12, // thrusters
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, windows, [0,-1,0]), ...simpleDecals(hulls, indices, thrusters, [0,1,0]) ]

  return {verts, indices}
}

function anaconda() {
  const hulls = [
    0,0,.5, .25,.15,-.5, -.25,.15,-.5, .35,.05,-.35, -.35,.05,-.35, .30,-.2,-.35, -.30,-.2,-.35, .19,-.15,-.5, -.19,-.15,-.5,
  ]

  const windows = [ // index 9+
    .057,1,.17, -.057,1,.17, .057,1,.2, -.057,1,.2, .05,1,.24, -.05,1,.24, .05,1,.26, -.05,1,.26, 
  ]

  const thrusters = [ // index 17+
    .1,.05,-1, -.1,.05,-1, .1,-.05,-1, -.1,-.05,-1, 
  ]

  const indices = [
    1,2,0, 1,0,3, 2,4,0,  // top
    1,8,2, 8,1,7, 2,6,4, 2,8,6, 3,5,1, 1,5,7, // back
    6,0,4, 5,3,0, // sides
    5,0,6, 7,5,6, 7,6,8,  // bottom
    9,10,12, 9,12,11, 13,14,16, 13,16,15, // windows
    17,18,20, 17,20,19, // thrusters
  ]

  const verts = [ ...hulls, ...simpleDecals(hulls, indices, windows, [0,-1,0]), ...simpleDecals(hulls, indices, thrusters, [0,0,1]) ]

  return {verts, indices}
}

// flocking

const seek = (function () {
  const steer = new THREE.Vector3()

  return function seek(boid, target, speed) {
    steer.subVectors(target.position, boid.position)
    steer.normalize()
    steer.multiplyScalar(speed)
    steer.sub(boid.velocity)
    return steer
  }  
})()

const flee = (function () {
  const steer = new THREE.Vector3()

  return function flee(boid, agressor, speed) {
    steer.subVectors(boid.position, agressor.position)
    steer.normalize()
    steer.multiplyScalar(speed)
    steer.sub(boid.velocity)
    return steer
  }
})()

const cohesion = (function() {
  const centroid = new THREE.Vector3()

  return function cohesion(boid, boids, speed) {
    const n = boids.length
    centroid.set(0,0,0)
  
    for (let i = 0; i < n; i++) {
      centroid.add(boids[i].position)
    }
  
    if (centroid.length() > 0) {
      centroid.multiplyScalar(1/n)
      return seek(boid, centroid, speed)
    } else {
      return centroid
    }
  }
  
})()

const align = (function () {
  const steer = new THREE.Vector3()

  return function align(boid, boids, speed) {
    const n = boids.length
    steer.set(0,0,0)
  
    for (let i = 0; i < n; i++) {
      steer.add(boids[i].velocity)
    }
  
    if (steer.length() > 0) {
      steer.normalize().multiplyScalar(speed).sub(boid.velocity)
    }
  
    return steer
  }
  
})()

const separate = (function() {
  const steer = new THREE.Vector3()
  const avoid = new THREE.Vector3()

  return function(boid, boids, speed) {
    const n = boids.length
    steer.set(0,0,0)
  
    for (let i = 0; i < n; i++) {
      avoid.subVectors(boid.position, boids[i].position)
      const d = avoid.length()
      if (d > 0) {
        avoid.multiplyScalar(1/d/d)
        steer.add(avoid)
      }
    }
  
    if (steer.length() > 0) {
      steer.normalize().multiplyScalar(speed).sub(boid.velocity)
    }
  
    return steer
  }
})()

function applyForce(boid, force) {
  boid.acceleration.add(force)
}

const tick = (function () {
  const temp = new THREE.Vector3()

  return function tick(boid, dt) {
    temp.copy(boid.acceleration).multiplyScalar(dt)
    boid.velocity.add(temp)
    temp.copy(boid.velocity).multiplyScalar(dt)
    boid.position.add(temp)

    boid.acceleration.set(0,0,0) // reset each tick
  }
})()

function setup(boid) {
  boid.velocity = boid.velocity.set(0,0,0) || new THREE.Vector3()
  boid.acceleration = boid.acceleration.set(0,0,0) || new THREE.Vector3()
}

