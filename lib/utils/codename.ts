const ADJECTIVES = [
  "Silent", "Sneaky", "Quick", "Clever", "Swift",
  "Stealthy", "Crafty", "Nimble", "Sharp", "Cunning",
  "Bold", "Daring", "Sly", "Agile", "Smooth",
  "Phantom", "Shadow", "Ghost", "Mystic", "Cosmic",
]

const NOUNS = [
  "Fox", "Wolf", "Raven", "Tiger", "Eagle",
  "Panther", "Hawk", "Cobra", "Dragon", "Lion",
  "Falcon", "Viper", "Lynx", "Puma", "Shark",
  "Jaguar", "Badger", "Coyote", "Owl", "Bear",
]

const VERBS = [
  "Runs", "Strikes", "Leaps", "Dashes", "Soars",
  "Hunts", "Prowls", "Glides", "Pounces", "Races",
  "Climbs", "Dives", "Stalks", "Charges", "Springs",
  "Swoops", "Bounds", "Flies", "Moves", "Roams",
]

function getRandomElement(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateCodename(): string {
  const adjective = getRandomElement(ADJECTIVES)
  const noun = getRandomElement(NOUNS)
  const verb = getRandomElement(VERBS)
  return `${adjective}${noun}${verb}`
}
