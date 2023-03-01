import { PropertyAnimationData } from '@engine/components/PropertyAnimationComponent'
import { Animation } from '@engine/animations/animation'

const SpriteWidth = 130
const SpriteHeight = 110

const offset = (x: number, y: number): Vector2 => {
  return [x * (SpriteWidth + 1) + 1, y * (SpriteHeight + 1) + 1]
}

const generateBackgroundSprites = (spriteFrameCount: number, row: number) => {
  return Array.from({ length: spriteFrameCount }).map((_, i) => ({
    frame: i * 10,
    value: {
      name: 'weapon_animations.png',
      spriteWidth: SpriteWidth,
      spriteHeight: SpriteHeight,
      pivotOffset: offset(i, row),
    },
  }))
}

const generateAnimationData = ({
  name,
  duration,
  spriteFrameCount,
  row,
}: {
  name: string
  duration?: number
  spriteFrameCount: number
  row: number
}) => {
  return {
    name,
    type: '',
    keys: {
      backgroundSprite: generateBackgroundSprites(spriteFrameCount, row),
    },
    frameCount: (spriteFrameCount - 1) * 10,
    times: -1,
    reverse: false,
    duration: duration ?? (spriteFrameCount - 1) * 200,
    auto: false,
    fillEnd: false,
  }
}

const animations: PropertyAnimationData[] = [
  { name: 'attack1', spriteFrameCount: 5, row: 0 },
  { name: 'attack2', spriteFrameCount: 5, row: 6 },
  { name: 'fire1', spriteFrameCount: 5, row: 12 },
  { name: 'fire2', spriteFrameCount: 6, row: 10 },
  { name: 'heal', spriteFrameCount: 6, row: 15 },
].map(generateAnimationData)

// [
//   {
//     name: 'attack',
//     type: '',
//     keys: {
//       backgroundSprite: [
//         {
//           frame: 0,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(0, 6),
//           },
//         },
//         {
//           frame: 10,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(1, 6),
//           },
//         },
//         {
//           frame: 20,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(2, 6),
//           },
//         },
//         {
//           frame: 30,
//           value: {
//             name: 'weapon_animations.png',
//             sriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(3, 6),
//           },
//         },
//         {
//           frame: 40,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(4, 6),
//           },
//         },
//       ],
//     },
//     frameCount: 40,
//     times: 1,
//     reverse: false,
//     duration: 800,
//     auto: false,
//     fillEnd: false,
//   },
//   {
//     name: 'fire1',
//     type: '',
//     keys: {
//       backgroundSprite:
//       generateBackgroundSprites()
//       [
//         {
//           frame: 0,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(0, 12),
//           },
//         },
//         {
//           frame: 10,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(1, 12),
//           },
//         },
//         {
//           frame: 20,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(2, 12),
//           },
//         },
//         {
//           frame: 30,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(3, 12),
//           },
//         },
//         {
//           frame: 40,
//           value: {
//             name: 'weapon_animations.png',
//             spriteWidth: SpriteWidth,
//             spriteHeight: SpriteHeight,
//             pivotOffset: offset(4, 12),
//           },
//         },
//       ],
//     },
//     frameCount: 40,
//     times: 1,
//     reverse: false,
//     duration: 800,
//     auto: true,
//     fillEnd: false,
//   },
//   {
//     name: 'fire2',
//     type: '',
//     keys: {
//       backgroundSprite: generateBackgroundSprites(6, 10),
//     },
//     frameCount: 50,
//     times: -1,
//     reverse: false,
//     duration: 800,
//     auto: true,
//     fillEnd: false,
//   },
//   {
//     name: 'heal',
//     type: '',
//     keys: {
//       backgroundSprite: generateBackgroundSprites(5, 15),
//     },
//     frameCount: 40,
//     times: -1,
//     reverse: false,
//     duration: 800,
//     auto: true,
//     fillEnd: false,
//   },
// ]

export function init(resource: IResource) {
  const spriteAssets = animations.reduce((ret, cur) => {
    const sprites = cur.keys?.backgroundSprite.map((sprite) =>
      typeof sprite.value === 'string' ? sprite.value : sprite.value.name
    )
    ret.push(...sprites)
    return ret
  }, [] as string[])

  return Promise.allSettled(
    Array.from(new Set(spriteAssets)).map((v) => resource.loadSprite(v))
  )
}

export function getAnimation(name: string): Animation | undefined {
  const data = animations.find((anim) => anim.name === name)
  return data
    ? new Animation({
        ...data,
        keys: new Map(Object.entries(data.keys)),
      })
    : undefined
}

export default animations
