/**
 * Generate PBKDF2 hash + salt for ADMIN_PASSWORD_HASH and ADMIN_PASSWORD_SALT.
 *
 * Usage: node scripts/generate-admin-hash.mjs <password>
 */

import { pbkdf2Sync, randomBytes } from 'node:crypto'

const password = process.argv[2]

if (!password) {
  console.error('Usage: node scripts/generate-admin-hash.mjs <password>')
  process.exit(1)
}

const salt = randomBytes(32).toString('hex')
const hash = pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')

console.log('\nAdd these to your .env.local:\n')
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
console.log(`ADMIN_PASSWORD_SALT=${salt}`)
console.log()
