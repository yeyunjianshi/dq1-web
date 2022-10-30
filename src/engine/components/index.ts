export const container = new Map<string, ComponentConstruct>()

export function GameComponent(isInner = true) {
  return function (component: ComponentConstruct) {
    container.set((isInner ? '$' : '') + component.name, component)
  }
}

export const InnerGameComponent = GameComponent(true)
export const GameplayComponent = GameComponent(false)

export default container
