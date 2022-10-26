import CanvasRenderer from './engine/canvasRenderer'
import { Resource, AssetLoader, AssetLoadStatus } from './engine/resource'
import './style.css'

const renderer = new CanvasRenderer('core')

const mapKey = 'world_map.png'
const resource = new Resource()
const mapPromise = resource
  .loadSprite(mapKey)
  .then((image) => console.log(image.naturalHeight))

const assetLoader = new AssetLoader().addAssets(mapPromise)
assetLoader.assetEvent.addListener((status) => {
  if (status == AssetLoadStatus.SUCCESS) {
    console.log(resource.hasSprite(mapKey))
    renderer.render(() => {
      renderer.drawSprite(resource.getSprite(mapKey) as Sprite, 1, 0, 0)
    })
  }
})

assetLoader.load()
