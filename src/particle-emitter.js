import * as THREE from 'three'
import * as ParticleMesh from './particle-mesh.js'

const error = console.error
const FRAME_STYLES = ["sequence", "randomsequence", "random"]
const DEG2RAD = THREE.MathUtils.DEG2RAD

export function createParticleEmitter(options = {}, matrixWorld = new THREE.Matrix4(), time = 0) {
  const config = {
    particleMesh: null,
    enabled: true,
    count: -1, // use all available particles
    textureFrame: undefined,
    lifeTime: 1, // may also be [min,max]
    repeatTime: 0, // if 0, use the maximum lifeTime
    burst: 0, // if 1 all particles are spawned at once
    seed: undefined, // a number between 0 and 1
    worldUp: false, // particles relative to world UP (they will get rotated if the camera tilts)

    // per particle values
    atlasIndex: 0,
    frames: [],
    colors: [{r:1,g:1,b:1}],
    orientations: [0],
    scales: [1],
    opacities: [1],
    frameStyle: 'sequence',
    offset: {x:0,y:0,z:0},
    velocity: {x:0,y:0,z:0},
    acceleration: {x:0,y:0,z:0},
    radialVelocity: 0,
    radialAcceleration: 0,
    angularVelocity: {x:0,y:0,z:0},
    angularAcceleration: {x:0,y:0,z:0},
    orbitalVelocity: 0,
    orbitalAcceleration: 0,
    worldAcceleration: {x:0,y:0,z:0},
    brownianSpeed: 0,
    brownianScale: 0,
    velocityScale: 0,
    velocityScaleMin: .1,
    velocityScaleMax: 1,
  }

  Object.defineProperties(config, Object.getOwnPropertyDescriptors(options)) // preserves getters

  const mesh = config.particleMesh
  const geometry = mesh.geometry
  const startTime = time
  const startIndex = mesh.userData.nextIndex
  const meshParticleCount = mesh.userData.meshConfig.particleCount
  const count = config.count
  const burst = config.burst
  const lifeTime = config.lifeTime

  let particleRepeatTime = config.repeatTime
  let textureFrame = config.textureFrame

  const effectRepeatTime = Math.max( particleRepeatTime, Array.isArray(lifeTime) ? Math.max(...lifeTime) : lifeTime )
  textureFrame = config.textureFrame ? config.textureFrame : mesh.userData.meshConfig.textureFrame

  if (config.count > 0 && startIndex + config.count > meshParticleCount) {
    error(`run out of particles, increase the particleCount for this ThreeParticleMesh`)
  }

  const numParticles = count >= 0 ? count : meshParticleCount - mesh.userData.nextIndex
  mesh.userData.nextIndex += numParticles

  const endIndex = Math.min(meshParticleCount, startIndex + numParticles)

  const spawnDelta = effectRepeatTime/numParticles*(1 - burst)
  // const vertices = model3D && typeof config.offset === "function" && model3D.isMesh ? calcSpawnOffsetsFromGeometry(model3D.geometry) : undefined

  for (let i = startIndex; i < endIndex; i++) {
    const spawnTime = time + (i - startIndex)*spawnDelta
    spawn(mesh, matrixWorld, config, i, spawnTime, lifeTime, particleRepeatTime, textureFrame)
  }

  ParticleMesh.needsUpdate(geometry)

  if (typeof config.atlasIndex === 'string') {
    ParticleMesh.setAtlasIndexByFilename(mesh, config.atlasIndex, startIndex, endIndex)
  }

  return {startTime, startIndex, endIndex, mesh}
}

export function setEmitterTime(emitter, time) {
  ParticleMesh.setMaterialTime(emitter.mesh.material, time)
}

export function setEmitterMatrixWorld(emitter, matrixWorld, time, deltaTime) {
  const geometry = emitter.mesh.geometry
  const endIndex = emitter.endIndex
  const startIndex = emitter.startIndex
  const timings = geometry.getAttribute("timings")
  let isMoved = false

  for (let i = startIndex; i < endIndex; i++) {
    const startTime = timings.getX(i)
    const lifeTime = timings.getY(i)
    const repeatTime = timings.getZ(i)
    const age = (time - startTime) % Math.max(repeatTime, lifeTime)
    if (age > 0 && age < deltaTime) {
      ParticleMesh.setMatrixAt(geometry, i, matrixWorld)
      isMoved = true
    }
  }

  if (isMoved) {
    ParticleMesh.needsUpdate(geometry, ["row1", "row2", "row3"])
  }
}


function spawn(particleMesh, matrixWorld, config, index, spawnTime, lifeTime, repeatTime, textureFrame) {
  const geometry = particleMesh.geometry
  const velocity = config.velocity
  const acceleration = config.acceleration
  const angularVelocity = config.angularVelocity
  const angularAcceleration = config.angularAcceleration
  const worldAcceleration = config.worldAcceleration

  const particleLifeTime = Array.isArray(lifeTime) ? Math.random()*(lifeTime[1] - lifeTime[0]) + lifeTime[0] : lifeTime
  const orientations = config.orientations.map(o => o*DEG2RAD)
  const frames = config.frames

  const startFrame = frames.length > 0 ? frames[0] : 0
  const endFrame = frames.length > 1 ? frames[1] : frames.length > 0 ? frames[0] : textureFrame.cols*textureFrame.rows - 1
  const frameStyleIndex = FRAME_STYLES.indexOf(config.frameStyle) >= 0 ? FRAME_STYLES.indexOf(config.frameStyle) : 0
  const atlasIndex = typeof config.atlasIndex === 'number' ? config.atlasIndex : 0 // non-number's will be configured with loadTexturePackerJSON()

  ParticleMesh.setMatrixAt(geometry, index, matrixWorld)
  ParticleMesh.setOffsetAt(geometry, index, config.offset)
  ParticleMesh.setScalesAt(geometry, index, config.scales)
  ParticleMesh.setColorsAt(geometry, index, config.colors)
  ParticleMesh.setOrientationsAt(geometry, index, orientations, config.worldUp ? 1 : 0)
  ParticleMesh.setOpacitiesAt(geometry, index, config.opacities)
  ParticleMesh.setFrameAt(geometry, index, atlasIndex, frameStyleIndex, startFrame, endFrame, textureFrame.cols, textureFrame.rows)

  ParticleMesh.setTimingsAt(geometry, index, spawnTime, particleLifeTime, repeatTime, config.seed)
  ParticleMesh.setVelocityAt(geometry, index, velocity.x, velocity.y, velocity.z, config.radialVelocity)
  ParticleMesh.setAccelerationAt(geometry, index, acceleration.x, acceleration.y, acceleration.z, config.radialAcceleration)
  ParticleMesh.setAngularVelocityAt(geometry, index, angularVelocity.x*DEG2RAD, angularVelocity.y*DEG2RAD, angularVelocity.z*DEG2RAD, config.orbitalVelocity*DEG2RAD)
  ParticleMesh.setAngularAccelerationAt(geometry, index, angularAcceleration.x*DEG2RAD, angularAcceleration.y*DEG2RAD, angularAcceleration.z*DEG2RAD, config.orbitalAcceleration*DEG2RAD)
  ParticleMesh.setWorldAccelerationAt(geometry, index, worldAcceleration.x, worldAcceleration.y, worldAcceleration.z)
  ParticleMesh.setBrownianAt(geometry, index, config.brownianSpeed, config.brownianScale)
  ParticleMesh.setVelocityScaleAt(geometry, index, config.velocityScale, config.velocityScaleMin, config.velocityScaleMax)
}

function calcSpawnOffsetsFromGeometry(geometry) {
  if (!geometry || !geometry.object3D) {
    return undefined
  }

  let worldPositions = []
  const pos = new THREE.Vector3()
  const inverseObjectMatrix = new THREE.Matrix4()
  const mat4 = new THREE.Matrix4()

  geometry.object3D.updateMatrixWorld()
  inverseObjectMatrix.getInverse(geometry.object3D.matrixWorld)

  geometry.object3D.traverse(node => {
    if (!node.geometry || !node.geometry.getAttribute) {
      return
    }

    const position = node.geometry.getAttribute("position")
    if (!position || position.itemSize !== 3) {
      return
    }

    for (let i = 0; i < position.count; i++) {
      mat4.copy(node.matrixWorld).multiply(inverseObjectMatrix)
      pos.fromBufferAttribute(position, i).applyMatrix4(mat4)
      worldPositions.push(pos.x, pos.y, pos.z)
    }
  })

  return Float32Array.from(worldPositions)
}
