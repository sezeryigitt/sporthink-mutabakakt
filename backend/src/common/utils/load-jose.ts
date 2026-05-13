export async function loadJose(): Promise<typeof import('jose')> {
  const loader = Function('return import("jose")') as () => Promise<typeof import('jose')>;
  return loader();
}
