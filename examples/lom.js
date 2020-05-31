import * as THREE from "three"
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import WebXRPolyfill from 'webxr-polyfill'

new WebXRPolyfill()

let playerLocation = 41*64+12
let oldPlayerLocation = 0
let lastTime

const worldDirection = new THREE.Vector3()
const PI_8 = Math.PI/8
const PI_2 = Math.PI/2
const PI_4 = Math.PI/4
const FRONT_OFFSET = 0.1
const MAP_WIDTH = 64
const CELL_SCALE = 25
const atlasMesh = {}
const textureLoader = new THREE.TextureLoader()
const ASSETS = ["assets/terrain-0.png", "assets/terrain-1.png", "assets/people.png"]
const SCALES = [500/CELL_SCALE, 500/CELL_SCALE, 2000/CELL_SCALE]

const MAP_TERRAIN = {
  "S": "t_snowhall0",
  "N": "t_cavern0",
  "C": "t_citadel0",
  "H": "t_henge0",
  "T": "t_tower0",
  "K": "t_keep0",
  "R": "t_ruin0",
  "V": "t_village0",
  "L": "t_lith0",
  "W": "t_lake0",
  "M": "t_mountain0",
  "F": "t_forest0",
  "I": "t_frozenwaste0",
  "D": "t_downs0",
  " ": "t_plane0",
  ".": "t_army0",
}

const MAP = [
'IIR S MMC           S   IIL   H       IIL  R S   I S   S  III T ',
'I   D MMM    S FF      IIIIDD     S    S   DDDWDD   H     NIIW S',
'   DMMMMMMM   FFFF  L IIMMMMDDDD          DDDDDDDDDN  L DD  IS I',
'  DDNMMMMMFF   FF H  NMMMMMMMRM    W S  DDDDDDKDDDDD        I II',
' FFW  MMMMFFF  FF  DD MMNFTFKMMMMR        DSDDDDDNDDD  D S  LIII',
' FFFF  MFFFFF   L  MM CFFFFF  VMMMMMMM     DDDDDDDDDDD       III',
'  FFFF  FFFFF      RMMDDR       KMMMMMMM    NDDDDDDR   L   D  II',
' S  FF  FFFFFFF     LMMKDD V C       C   R     DD      MMM N TW ',
'    S  FFFFH VFFF    WMMMM L  MMMMMMMMDDK   SFW W H   MMMKM     ',
'  LLLLLFFFN TR FF      MMMMMD MMMMMMTMMK L  FF         MMMMWMMW ',
' H     NFFDKWL FF R     MMMMM MMMMWMMMMMR   FFFF L L   NMMWMMW  ',
'  LLLLL FFDDD FF     K   KDMM MMDDDDDDMDDDNFFTFFF     W MMMM W  ',
'     DD FFFFFFF      MM  DDMMCM     KDDDD FFFFFFFFFK  DDMMM   K ',
'    DDDDDFFFF   K   MMDDD DD      L   L  FFWFFFFFFF  DDKW  D    ',
'   DDDLDDR    S   MMMDDR     .    FFFFFFFFFFFFF RF   DD   D VV  ',
'   RDDDDD N L    MMM       .  .   FFFFFFFFFFFFFV       L C     N',
'  DDDNDDDD    K MVM  L   W K      KFFFFFFFFFFFFF    KV    VRF S ',
'S DDDDDRDW     MMMMK        .       FFFFFFFFFNFFR    VV W  FFF  ',
'  DDDDDDDD      MMMD  K FF       L   FFFMMFFFFFF  WLL KRFFFLFFFF',
' MMDDDRDD   FF  WMMD   FFFF  L  L L   FFFFF  WFF     MMMMFFFFFFF',
'  MM        MMK    DD FFFWFF     L LDR FFF   W   K MMMMMFKFFVFFF',
' RMMM  L    MMM   CDDFFVFFFF      LDDD  F K H    MMMMMMFFFFFFFFF',
'   MM    MMM MMMM    FFFFFF    KV DDDD  DDDDDDKDMMMMM HFFFTFFLFF',
'  HMM    MMMRVMMMM W FFFFF   .    DDL  K   VMMMMMMMMW    FFFFF V',
'  MM   W MMMTWMMM    MMMMMM      DN L    L MMMMM RF   V K FFV R ',
' FMMW  M  MMMMMM   VMMMMMMMMM   KMM RR  WMMMM      V L       N  ',
' MMM  FMM   MMMFLD MMMMMMMMMMMMMMMM ..  MMMMM MMMMM   K R  L  RF',
' MMM   TMM FMMMMD MMMMFRVDDMMMMMMMK  TMMMMM R WMMMMMMMMMMMV D  F',
'  MM  MMMM FMMMR K   DDD  WDMMMM    MMMMMMK T    VMMMMMMMMV RDDF',
' SFF  MMMM FMMM   MMMD  C     K    MMMMMR   MMFFD  K     C      ',
'  TT  MNMM  MMMWL MMMMR  RMMMMMMMMMMMMM  V MMMMMMMMMMMMM    TT  ',
'   M  MMMM  MM MMM MMM   MMMMMMMMMMMM N WDDRMMMMMMMMMMMK  R   LW',
'   MM MMMM    MMMMM  K KMMMMMMMMMMMMR     DC      V        FV W ',
'  SMM  MMMM  KMMMMM               K    F       V    N  V L    F ',
'  MMMM MMMR    R           H  K    LR    L  DD H           K    ',
'  MMMM           L               FFF   V W  VDDDDD V  W       V ',
'  MMMM    FFF  MM    K          FFFFFFFFF R DDDDDDDDDR   V      ',
'   MM L  FFFFFF           W    FFFFFFFFFF   DDNDVDDDDDDD        ',
'I  DD   FFFFFFFFF            VFFFVW FFF      DDDDDDWDDKDDD   RFF',
'I W DD FFFF D  FF  R       K FFFF  NF   F F   DDDDDDDVDD  L FFFF',
'I   DDDRFFFDT  F      K  K   FFFFFFFFR V        KDDDDDD    FFFFF',
'   MMD   FFDDD F  L VDDDD    R FFFFR    H K NV     DRDDK FFFFFFF',
'   MMN    FF  F  K  DDDDDDR C   FFF      L   D D V  D   FFFFFFFF',
'  MMMM     FFF N DDFDDWDVDDDF V  L   K  W D D L R      FFFFCFNFF',
'   MMMM DD  FF   DDDDDDDDDDDD         D  V        VD FFFFFF DFFF',
' R MMMMM DD         DDDDDDVDD WV  V    R   MCMW      FFFFFFFLFFF',
'  S MMMMM     L  MML  VDDDDD KMM    L   M K MMMMM   L VFFFFFWFFF',
'     MMKMMK     HMM     DDD   MM R   VWMM MMRMM W      FFFFF TFF',
'    WMMMMMM   L  MM      L   MM    VW  MM MM MR K  W FFFFFFFFV F',
'   RMMMMMMMM     MM  K VD F MM    N MMTMM MM K MML DV FF  FFFF F',
' N MMMMMMMMMW L MMMNDDDDDFMMMD    MMMMMMR MM  MWM   R K  VFFFF F',
'   MM FFFMMMM   MMMDDV   FMMD V  MMM FFKD KMM  MMMKVLDD L FFFHFF',
'   MM  V WMMM L MMVD    VMMMD   MM W RWV MMMM KMMMMMMT  DD F  FF',
'  MMMV W  MMM   MMDD    MMMD   MM   D  MMMMMM MMMMMMMMMM   L   F',
'D MMM T  VMMK L MMD   FDDKD V     MMMMMMMMMMK MMMMMMMMMKMMM  VN ',
'D MMMV K  CH    MM     MDDD   FMMMMMMMMMMMMMM MRMMMMMMMMMMMM  R ',
'D MMMF V  MM  FMMK   KMMDDW   FMMMMMDKV F  MM MMMDDWMMMMMHMMML  ',
'D WMM WFKMMMK FMM   FMMML  RFFFMMMNDDD  V F M MM R   VW MMMMM  F',
' L MMMMMMMM   MM V  FMM      FFMMFV VDDKD DD   WV   D VLK MMD FK',
'    MMMMMM    MM    MMMW   F   M  DH V RDDK  C  D DF R  W D L   ',
'IW  K         KR   RRM K FFFFF   K  T W  LD V  F    V D D  KD V '
].join("")

const MAP_HEIGHT = MAP.length/MAP_WIDTH
console.assert(MAP.length % MAP_WIDTH === 0, `each MAP row must have ${MAP_WIDTH} cells`)

const LORDS = {
  "Luxor the Moonprince": {location: 40*64+12, asset: "c_freeh.png"},
  "Morkin": {location: 40*64+12, asset: "c_morkinh.png"},
  "Corleth the Fey": {location: 40*64+12, asset: "c_feyh.png"},
  "Rothron The Wise": {location: 40*64+12, asset: "c_wiseh.png"},
  "The Lord of Gard": {location: 55*64+10, asset: "c_freeh.png"},
  "The Lord of Marakith": {location: 32*64+43, asset: "c_freeh.png"},
  "The Lord of Xajorkith": {location: 59*64+45, asset: "c_freeh.png"},
  "The Lord of Gloom": {location: 0*64+8, asset: "c_freeh.png"},
  "The Lord of Shimeril": {location: 42*64+28, asset: "c_freeh.png"},
  "The Lord of Kumar": {location: 29*64+57, asset: "c_freeh.png"},
  "The Lord of Ithrorn": {location: 15*64+57, asset: "c_freeh.png"},
  "The Lord of Dawn": {location: 45*64+44, asset: "c_freeh.png"},
  "The Lord of Dreams": {location: 16*64+42, asset: "c_feyh.png"},
  "The Lord of Degrim": {location: 43*64+59, asset: "c_feyh.png"},
  "Thimrath the Fey": {location: 60*64+33, asset: "c_feyh.png"},
  "The Lord of Whispers": {location: 20*64+57, asset: "c_feyh.png"},
  "The Lord of Shadows": {location: 37*64+11, asset: "c_fey.png"},
  "The Lord of Lothoril": {location: 10*64+11, asset: "c_feyh.png"},
  "Korinel the Fey": {location: 21*64+23, asset: "c_fey.png"},
  "The Lord of Thrall": {location: 38*64+33, asset: "c_feyh.png"},
  "Lord Brith": {location: 49*64+21, asset: "c_freeh.png"},
  "Lord Rorath": {location: 60*64+23, asset: "c_freeh.png"},
  "Lord Trorn": {location: 50*64+54, asset: "c_freeh.png"},
  "The Lord of Morning": {location: 51*64+39, asset: "c_freeh.png"},
  "Lord Athoril": {location: 38*64+54, asset: "c_freeh.png"},
  "Lord Blood": {location: 36*64+21, asset: "c_freeh.png"},
  "Lord Herath": {location: 26*64+45, asset: "c_freeh.png"},
  "Lord Mitharg": {location: 46*64+29, asset: "c_freeh.png"},
  "The Utarg of Utarg": {location: 34*64+59, asset: "c_targh.png"},
  "Fawkrin the Skulkrin": {location: 10*64+1, asset: "c_skulkrin.png"},
  "Lorgrim the Wise": {location: 0*64+62, asset: "c_wiseh.png"},
  "Farflame the DragonLord": {location: 23*64+12, asset: "c_dragon.png"},
}

function createWorld() {
  // @ts-ignore
  const terrainFilenames = Object.values(MAP_TERRAIN).map(x => x + ".png")

  for (let filename of terrainFilenames) {
    const mesh = atlasMesh[filename] = new THREE.InstancedMesh( new THREE.BoxBufferGeometry(), new THREE.MeshBasicMaterial({color: 0xff0000}), 1000) // will be replaced when json loaded
    mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage )
    scene.add(mesh)
  }

  // @ts-ignore
  const lordFilenames = Object.values(LORDS).map(data => data.asset).sort().filter((x,i,list) => i === 0 || list[i-1] !== x)

  for (let filename of lordFilenames) {
    const mesh = atlasMesh[filename] = new THREE.InstancedMesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial({color: 0xffff00}), 20) // will be replaced when json loaded
    scene.add(mesh)
  }

  const groundWidth = (MAP_WIDTH + 4)*CELL_SCALE
  const groundHeight = (MAP_HEIGHT + 4)*CELL_SCALE
  const groundGeometry = new THREE.PlaneBufferGeometry( groundWidth, groundHeight )
  groundGeometry.rotateX(-Math.PI/2)
  groundGeometry.translate((MAP_WIDTH/2 - .5)*CELL_SCALE, 0, (MAP_HEIGHT/2 - .5)*CELL_SCALE)

  const ground = new THREE.Mesh( groundGeometry, new THREE.MeshBasicMaterial() )
  scene.add(ground)
}

function updateAtlas(baseTexture, atlas, pixelScale) {
  const material = new THREE.MeshBasicMaterial( {map: baseTexture, side: THREE.DoubleSide, alphaTest: .5} )

  for (let filename in atlas.frames) {
    if (atlasMesh[filename]) {
      const entry = atlas.frames[filename]
      const frame = entry.frame

      const textureWidth = atlas.meta.size.w
      const textureHeight = atlas.meta.size.h

      let geometry
      if (entry.triangles) {
        geometry = new THREE.BufferGeometry()

        console.assert(entry.verticesUV.length === entry.vertices.length, `frame '${filename}', vertices and verticesUV lengths differ`)
        const positions = new Float32Array(entry.vertices.length/2*3)
        const uvs = new Float32Array(entry.verticesUV)

        for (let i = 0, j = 0; i < entry.vertices.length; i+=2, j+=3) {
          positions[j] = entry.vertices[i]/pixelScale - frame.w/pixelScale/2
          positions[j+1] = frame.h/pixelScale - entry.vertices[i+1]/pixelScale
          positions[j+2] = 0
          uvs[i] = entry.verticesUV[i]/textureWidth
          uvs[i+1] = 1 - entry.verticesUV[i+1]/textureHeight
        }

        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
        geometry.setIndex(entry.triangles)

      } else {
        const h = frame.h/pixelScale
        const x0 = frame.x/atlas.meta.size.w
        const y0 = 1 - (frame.y + frame.h)/atlas.meta.size.h
        const x1 = x0 + frame.w/atlas.meta.size.w
        const y1 = y0 + frame.h/atlas.meta.size.h

        geometry = new THREE.PlaneBufferGeometry(frame.w/pixelScale, h)
        const uvs = geometry.getAttribute("uv")

        for (let i = 0; i < uvs.count; i++) {
          uvs.setX(i, uvs.getX(i) === 0 ? x0 : x1)
          uvs.setY(i, uvs.getY(i) === 0 ? y0 : y1)
        }

        geometry.translate(0, h/2, 0)
      }

      atlasMesh[filename].material.dispose()
      atlasMesh[filename].geometry.dispose()

      atlasMesh[filename].material = material
      atlasMesh[filename].geometry = geometry
    }
  }
}

function drawMap(look, map) {
  const matrix = new THREE.Matrix4()
  const indices = {}
  const lookIndex = positionToCell(look)
  const cellPosition = new THREE.Vector3()

  for (let i = 0; i < map.length; i++) {
    if (i === lookIndex || map[i] == " ") {
      continue
    }

    const filename = MAP_TERRAIN[ map[i] ] + ".png"

    if (filename && atlasMesh[filename]) {
      cellToPosition(i, cellPosition)  
      place(matrix, cellPosition, look, 0, 0)
      indices[filename] = (indices[filename] || 0) + 1
      atlasMesh[filename].setMatrixAt(indices[filename], matrix)
    }
  }

  const lordsAtLocations = {}
  for (let lord in LORDS) {
    const lordData = LORDS[lord]
    const location = lordData.location
    lordsAtLocations[location] = lordsAtLocations[location] || []
    lordsAtLocations[location].push(lord)
  }

  for (let location in lordsAtLocations) {
    const lords = lordsAtLocations[location]

    for (let i = 0; i < lords.length; i++) {
      const lord = lords[i]
      const lordData = LORDS[lord]
      const filename = lordData.asset
      if (filename && atlasMesh[filename]) {
        const sideOffset = ((i%2)*2 - 1) * Math.floor((i + 1)/2) / 8

        cellToPosition(lordData.location, cellPosition)  
        place(matrix, cellPosition, look, sideOffset, FRONT_OFFSET)
        indices[filename] = (indices[filename] || 0) + 1
        atlasMesh[filename].setMatrixAt(indices[filename], matrix)
      }
    }
  }

  const iceFilename = MAP_TERRAIN["I"] + ".png"
  
  for (let x = -2; x < MAP_WIDTH + 2; x++) {
    cellPosition.x = x*CELL_SCALE

    for (let z of [-2,-1,MAP_HEIGHT,MAP_HEIGHT+1]) {
      cellPosition.z = z*CELL_SCALE
      place(matrix, cellPosition, look, 0, 0)
      indices[iceFilename] = (indices[iceFilename] || 0) + 1
      atlasMesh[iceFilename].setMatrixAt(indices[iceFilename], matrix)
    }
  }

  for (let z = 0; z < MAP_HEIGHT; z++) {
    cellPosition.z = z*CELL_SCALE

    for (let z of [-2,-1,MAP_WIDTH,MAP_WIDTH+1]) {
      cellPosition.x = z*CELL_SCALE
      place(matrix, cellPosition, look, 0, 0)
      indices[iceFilename] = (indices[iceFilename] || 0) + 1
      atlasMesh[iceFilename].setMatrixAt(indices[iceFilename], matrix)
    }
  }

  for (let filename in atlasMesh) {
    atlasMesh[filename].instanceMatrix.needsUpdate = true
  }
}

// North = (0,0,-1), East = (1,0,0) South = (0,0,1) West = (-1,0,0)
const place = (function() {
  const translation = new THREE.Vector3()
  const euler = new THREE.Euler(0,0,0,"YXZ")
  const quaternion = new THREE.Quaternion()
  const scale = new THREE.Vector3(1,1,1)

  return function place(matrix, cellPosition, center, offsetX, offsetXZ) {
    const angle = Math.atan2(cellPosition.x - center.x, cellPosition.z - center.z)
    const cosAngle = Math.cos(angle)
    const sinAngle = Math.sin(angle)
    const x = cellPosition.x + offsetX*CELL_SCALE*cosAngle - offsetXZ*sinAngle
    const z = cellPosition.z - offsetX*CELL_SCALE*sinAngle - offsetXZ*cosAngle
  
    translation.set(x, 0, z) // bottom of the plane is at y=0
    quaternion.setFromEuler( euler.set(0, angle, 0) )
    matrix.compose(translation, quaternion, scale)

    return matrix
  }
  
})()

function positionToCell(position) {
  return Math.max(0, Math.min(MAP_WIDTH, Math.floor(position.x/CELL_SCALE))) + 
    MAP_WIDTH*Math.max(0, Math.min(MAP_HEIGHT, Math.floor(position.z/CELL_SCALE)))
}

function cellToPosition(cell, outPosition) {
  outPosition.x = (cell % MAP_WIDTH)*CELL_SCALE
  outPosition.z = Math.floor(cell/MAP_WIDTH)*CELL_SCALE
  return outPosition
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  const time = performance.now() * .001
  const dt = lastTime ? time - lastTime : 0

  if (playerLocation !== oldPlayerLocation) {
    drawMap(cameraRig.position, MAP)
    oldPlayerLocation = playerLocation
  }

  renderer.render( scene, camera )

  lastTime = time
}

function calcCellMove() {
  let cellMove = 0

  const elements = camera.matrixWorld.elements
  worldDirection.set(elements[8], 0, elements[10])
  worldDirection.normalize()

  const angle = Math.atan2(-worldDirection.x, worldDirection.z)
  // console.log(angle)

  if (Math.abs(angle) < PI_8) {
    cellMove = -MAP_WIDTH
  } else if (Math.abs(angle) > 7*PI_8) {
    cellMove = MAP_WIDTH
  } else if (Math.abs(angle-PI_2) < PI_8) {
    cellMove = 1
  } else if (Math.abs(angle+PI_2) < PI_8) {
    cellMove = -1
  } else if (Math.abs(angle-PI_4) < PI_8) {
    cellMove = -MAP_WIDTH + 1
  } else if (Math.abs(angle+PI_4) < PI_8) {
    cellMove = -MAP_WIDTH - 1
  } else if (Math.abs(angle-3*PI_4) < PI_8) {
    cellMove = MAP_WIDTH + 1
  } else if (Math.abs(angle+3*PI_4) < PI_8) {
    cellMove = MAP_WIDTH - 1
  }

  return cellMove
}

function onKeyDown(event) {
  switch ( event.keyCode ) {
    case 32: /*space*/
    case 38: /*up*/
    case 87: /*W*/
    case 40: /*down*/
    case 83: /*S*/
      const multiplier = event.keyCode == 40 || event.keyCode == 83 ? -1 : 1
      playerLocation += multiplier*calcCellMove()
      cellToPosition(playerLocation, cameraRig.position)
      break

    case 37: /*left*/
    case 65: /*A*/
      cameraRig.rotation.y += PI_4
      break

    case 39: /*right*/
    case 68: /*D*/
      cameraRig.rotation.y -= PI_4
      break
  }

}

function onSelectStart() {
  playerLocation += calcCellMove()
  cellToPosition(playerLocation, cameraRig.position)
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000073)

const cameraRig = new THREE.Group()
cellToPosition(playerLocation, cameraRig.position)
scene.add(cameraRig)

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
camera.position.set(0, 1.5, 0)
cameraRig.add(camera)

// rendering
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.xr.enabled = true
renderer.setAnimationLoop( animate );

document.body.appendChild( renderer.domElement );
document.body.appendChild( VRButton.createButton( renderer ) );

window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener( 'keydown', onKeyDown, false );

const controller0 = renderer.xr.getController(0)
const controller1 = renderer.xr.getController(1)

controller0.addEventListener('selectstart', onSelectStart)
controller1.addEventListener('selectstart', onSelectStart)

// lights
const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 )
scene.add( ambientLight )

const pointLight = new THREE.PointLight( 0xffffff, 0.8 )
pointLight.position.set(0, 4, -4)
scene.add( pointLight )

// assets
for (let i = 0; i < ASSETS.length; i++) {
  const asset = ASSETS[i]
  textureLoader.load(asset, (texture) => {
    const jsonFile = asset.replace(/(.*)\.png/, "$1.json")

    fetch(jsonFile).then( response => response.json() ).then( json => { 
      updateAtlas(texture, json, SCALES[i]) 
    } )
  })  
}

createWorld()
