const fileRegex = /\.tmj$/

function clamp(value, min = -Infinity, max = Infinity) {
  return Math.min(max, Math.max(min, value))
}

function find(arr, property, value) {
  return arr.find((o) => o[property] && o[property] === value)
}

function deepParseJSON(json) {
  if (typeof json !== 'string') return json

  try {
    const data = JSON.parse(json)
    for (const prop in data) {
      data[prop] = deepParseJSON(data[prop])
    }
    return data
  } catch (error) {
    return json
  }
}

function property(obj, name) {
  if (!obj.properties) return undefined
  const prop = find(obj.properties, 'name', name)
  if (!prop) return undefined

  return prop.type === 'float' || prop.type === 'int' || prop.type === 'bool'
    ? prop.value
    : deepParseJSON(prop.value)
}

const DefaultGameObject = {
  x: 0,
  y: 0,
  width: -2,
  height: -2,
  active: true,
}
const DefaultTileSize = 32
const DefaultDoor = 'map/door.png'

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
      const value = !property(src, prop)
        ? prop === 'x'
          ? Math.round(src.offsetx / 32) * 32
          : prop === 'y'
          ? Math.round(src.offsety / 32) * 32
          : prop === 'name'
          ? src.name
          : undefined
        : property(src, prop)

      if (!value) return
      ret[prop] = value
    })
    return ret
  }

  const root = {
    children: [],
    components: [],
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

  const npcLayersData = find(layersData, 'name', 'NPC')?.layers ?? []
  const npcs = npcLayersData.map((d) => {
    const ret = {
      components: [],
      ...DefaultGameObject,
      width: DefaultTileSize,
      height: DefaultTileSize,
      ...getGameObjectData(d),
    }
    return ret
  })

  const entrancesLayersData =
    find(layersData, 'name', 'Entrances')?.layers ?? []
  const entrances = entrancesLayersData.map((d) => {
    const ret = {
      components: [],
      ...DefaultGameObject,
      ...getGameObjectData(d),
    }

    const coordX = property(d, 'coordX')
    const coordY = property(d, 'coordY')
    if (coordX) ret.x = coordX * tileSize
    if (coordY) ret.y = coordY * tileSize

    if (property(d, 't_nextScene')) {
      ret.components.push({
        type: 'SceneTransition',
        tag: property(d, 't_tag'),
        nextScene: property(d, 't_nextScene'),
        playAudio: property(d, 't_playAudio'),
      })
    }
    if (property(d, 'd_tag')) {
      ret.components.push({
        type: 'SceneTransitionDestination',
        tag: property(d, 'd_tag'),
        direction: property(d, 'd_direction'),
        isPremutation: property(d, 'd_isPremutation'),
      })
    }
    return ret
  })

  const doorsData = find(layersData, 'name', 'Doors')?.layers ?? []
  const doors = doorsData.map((d) => {
    const ret = {
      components: [],
      ...DefaultGameObject,
      width: DefaultTileSize,
      height: DefaultTileSize,
      background: DefaultDoor,
      ...getGameObjectData(d),
    }
    ret.components.push({
      type: 'Door',
      id: property(d, 'door_id'),
      colliderSize: [
        property(d, 'door_collider_width') ?? DefaultTileSize,
        property(d, 'door_collider_height') ?? DefaultTileSize,
      ],
    })
    return ret
  })

  const mapChestsData = find(layersData, 'name', 'MapChests')?.layers ?? []
  const mapChests = mapChestsData.map((d) => {
    const ret = {
      components: [],
      ...DefaultGameObject,
      width: DefaultTileSize,
      height: DefaultTileSize,
      background: DefaultDoor,
      ...getGameObjectData(d),
    }
    ret.components.push({
      type: 'MapChest',
      id: property(d, 'id'),
      colliderSize: [
        property(d, 'collider_width') ?? DefaultTileSize,
        property(d, 'collider_height') ?? DefaultTileSize,
      ],
      money: property(d, 'money'),
      items: property(d, 'items'),
      hidden: property(d, 'hidden'),
      important: property(d, 'important'),
    })
    return ret
  })

  const envsData = find(layersData, 'name', 'Environments')?.layers ?? []
  const envs = envsData.map((d) => {
    const ret = {
      components: [],
      ...DefaultGameObject,
      ...getGameObjectData(d),
    }
    return ret
  })

  const objectsData = find(layersData, 'name', 'Objects')?.layers ?? []
  const objects = objectsData.map((d) => {
    const ret = {
      components: [],
      ...DefaultGameObject,
      ...getGameObjectData(d),
    }
    return ret
  })

  const bornPointData = find(layersData, 'name', 'BornPoint')
  const bornPoint = bornPointData
    ? {
        ...DefaultGameObject,
        ...getGameObjectData(bornPointData),
        name: 'bornPoint',
        components: [
          {
            type: 'BornPointComponent',
            position: [
              clamp(Math.floor(bornPointData.offsetx / tileSize) * tileSize, 0),
              clamp(Math.floor(bornPointData.offsety / tileSize) * tileSize, 0),
            ],
            direciton: property(bornPointData, 'direction') ?? 0,
            isPremutation: property(bornPointData, 'isPremutation'),
          },
        ],
      }
    : null

  root.children.push(
    {
      ...DefaultGameObject,
      name: 'npcs',
      children: npcs,
    },
    {
      ...DefaultGameObject,
      name: 'entrances',
      children: entrances,
    },
    {
      ...DefaultGameObject,
      name: 'doors',
      children: doors,
    },
    {
      ...DefaultGameObject,
      name: 'mapChests',
      children: mapChests,
    },
    {
      ...DefaultGameObject,
      name: 'objects',
      children: objects,
    },
    {
      ...DefaultGameObject,
      name: 'enviroments',
      children: envs,
    },
    ...(bornPoint ? [bornPoint] : [])
  )
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
