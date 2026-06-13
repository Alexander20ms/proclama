export const ANIMALS = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
  "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐙", "🦋",
  "🐧", "🦄", "🐺", "🦝",
] as const;

export function hashAnimal(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  }
  return ANIMALS[Math.abs(h) % ANIMALS.length];
}

export function getAnimal(name: string, savedAnimal?: string | null): string {
  return savedAnimal || hashAnimal(name);
}
