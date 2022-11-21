export function useTextPostProcessing(text: string, name: string) {
  return text.trim().replace('{name}', name)
}
