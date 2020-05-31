import * as THREE from "three"
import { createParticleMesh, setMaterialTime } from '../src/particle-mesh.js'
import { createParticleEmitter } from '../src/particle-emitter.js'
import { randomize } from '../src/pseudo-random.js'
import { createKeyframes, updateKeyframes } from '../../harlyq-helpers/src/setter.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import WebXRPolyfill from 'webxr-polyfill'

let lastTime

function animate() {
  const time = performance.now() * .001
  const dt = lastTime ? time - lastTime : 0

  setMaterialTime(particleMesh.material, time)
  
  keyframes.forEach(k => updateKeyframes(k, dt))
  renderer.render( scene, camera )

  lastTime = time
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}


new WebXRPolyfill()

const scene = new THREE.Scene()

// to teleport in VR, move the cameraRig
const cameraRig = new THREE.Group()
cameraRig.position.z = 4
scene.add(cameraRig)

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 )
cameraRig.add(camera)

// rendering
const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.xr.enabled = true
renderer.setAnimationLoop( animate )

document.body.appendChild( renderer.domElement )
document.body.appendChild( VRButton.createButton( renderer ) )

window.addEventListener( 'resize', onWindowResize, false )

// lights
const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 )
scene.add( ambientLight )

const pointLight = new THREE.PointLight( 0xffffff, 0.8 )
pointLight.position.set(0, 4, -4)
scene.add( pointLight )

// objects
const group = new THREE.Group()
scene.add( group )

const object = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 20, 10 ), new THREE.MeshStandardMaterial() )
object.position.set( 0, 0, -4 )
group.add( object )

const geo = new THREE.PlaneBufferGeometry(4, 4)
/**@type {any}*/const reflector = new Reflector(geo, {textureWidth: 1024, textureHeight: 1024})
reflector.rotation.x = -Math.PI/2
reflector.position.y = -1
scene.add( reflector )

const keyframes = []
keyframes.push( createKeyframes( {object: group.rotation, values: [{y:-Math.PI/2},{y:Math.PI/2}], direction: 'alternate', duration: 10 } ) )

const particleMesh = createParticleMesh({
  texture: './assets/spritesheet.png',
  atlas: './assets/spritesheet.json',
  alphaTest: .5,
})
particleMesh.position.set(0,0,-1)
scene.add( particleMesh )

createParticleEmitter({
  particleMesh,
  atlasIndex: 'blob.png',
  count: 200,
  repeatTime: 2.5,
  get velocity() { return randomize({x:-1,y:1,z:-1}, {x:1,y:1.5,z:1}) },
  get colors() { return randomize([{r:1,g:1,b:1}], [{r:0,g:0,b:0}])},
  scales: [20,0],
  worldAcceleration: {x:0,y:-5,z:0}
})

renderer.setAnimationLoop(animate)

