export function useTextPostProcessing(
  text: string,
  name: string,
  args: [string, string][] = []
) {
  let postText = text.trim().replaceAll('{name}', name)
  args.forEach((arg) => {
    if (arg[0].trim().length === 0) return
    postText = postText.replaceAll(arg[0], arg[1])
  })
  return postText
}
