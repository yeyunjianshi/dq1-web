const fileRegex = /\.tmj$/

function find(arr, property, value) {
  return arr.find((o) => o[property] && o[property] === value)
}

function property(obj, name) {
  if (!obj.properties) return undefined
  const prop = find(obj.properties, 'name', name)
  if (!prop) return undefined

  return prop.type === 'float' || prop.type === 'int'
    ? parseInt(prop.value)
    : prop.type === 'bool'
    ? prop.value === 'true'
      ? true
      : false
    : prop.value
}

const DefaultGameObject = {
  x: 0,
  y: 0,
  width: -2,
  height: -2,
  active: true,
  children: [],
  components: [],
}
const DefaultTileSize = 32

function convert({ src, tileSize = DefaultTileSize }) {
  const jsonData = JSON.parse(src)

  const layersData = jsonData.layers ? jsonData.layers : []
  const mapData = find(layersData, 'name', 'Map')
  const tileData = find(layersData, 'name', 'Tiles')

  const scene = {}
  ;[
    'name',
    'bgm',
    'width',
    'height',
    'loadType',
    'priority',
    'hasCamera',
    'isCave',
    'isMeetEnemy',
  ].forEach((prop) => {
    scene[prop] = property(mapData, prop)

    if (prop === 'width' && !scene[prop])
      scene['width'] = jsonData.width * tileSize
    else if (prop === 'height' && !scene[prop])
      scene['height'] = jsonData.height * tileSize
  })

  const getGameObjectData = (src) => {
    const ret = {}
    ;[
      'name',
      'x',
      'y',
      'width',
      'height',
      'layout',
      'active',
      'background',
      'alpha',
      'components',
      'layoutGravity',
      'pivot',
      'useScreenPosition',
      'renderLayer',
      'components',
    ].forEach((prop) => {
      const value = property(src, prop)
      if (!value) return
      ret[prop] = value
    })
    return ret
  }

  const root = {
    ...DefaultGameObject,
    ...getGameObjectData(mapData),
    width: property(mapData, 'rootWidth') ?? scene['width'],
    height: property(mapData, 'rootHeight') ?? scene['height'],
  }
  root.components.push({
    type: 'SceneComponent',
    mapData: {
      name: 'Tiles',
      data: tileData.data ?? [],
      width: tileData.width,
      height: tileData.height,
    },
  })
  scene.root = root

  const getChildren = (layers, name) => {
    const data = find(layers, 'name', name)?.layers ?? []
    return data.map((d) => {
      const ret = {
        ...DefaultGameObject,
        ...getGameObjectData(d),
        _ori: d,
      }
      return ret
    })
  }

  // const npcs = getChildren(layersData, 'NPC').map((npc) => {
  //   npc.components.push({
  //     ...JSON.parse(property(npc._ori, 'npcComponent')),
  //     type: 'NPCControllerComponent',
  //   })
  // })
  // root.children.push(npcs)

  return JSON.stringify(scene)
}

export default function plugin() {
  return {
    name: 'tmj',
    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: `export default ${convert({ src })}`,
          map: null,
        }
      }
    },
  }
}
