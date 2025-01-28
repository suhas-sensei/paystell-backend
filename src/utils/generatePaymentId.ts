import { customAlphabet } from "nanoid"

// Create a custom alphabet for Base62 encoding (A-Z, a-z, 0-9)
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// Create a nanoid function with our custom alphabet
const nanoid = customAlphabet(alphabet, 8)

export function generatePaymentId(): string {
  // Get current timestamp (in milliseconds)
  const timestamp = Date.now()

  // Generate a random string
  const randomPart = nanoid()

  // Combine timestamp and random part
  const combined = `${timestamp}${randomPart}`

  // Convert to Base62
  const base62 = BigInt(combined).toString(62)

  return base62
}

// Example usage (can be removed in production)
for (let i = 0; i < 5; i++) {
  console.log(`Payment ID ${i + 1}: ${generatePaymentId()}`)
}

// Demonstrate uniqueness
const id1 = generatePaymentId()
const id2 = generatePaymentId()

console.log("\nDemonstrating uniqueness:")
console.log(`ID 1: ${id1}`)
console.log(`ID 2: ${id2}`)
console.log(`Are IDs different? ${id1 !== id2}`)

