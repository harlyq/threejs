import * as THREE from "three"
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import WebXRPolyfill from 'webxr-polyfill'

let lastTime

function animate() {
  const time = performance.now() * .001
  const dt = lastTime ? time - lastTime : 0

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
const object = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 20, 10 ), new THREE.MeshStandardMaterial() )
object.position.set( 0, 0, -4 )
scene.add( object )

