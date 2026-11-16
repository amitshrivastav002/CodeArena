// Usage: node promote.js <username>  (makes an existing user an admin)
import { openDb } from './db.js'

const username = process.argv[2]
const r = openDb().prepare("UPDATE users SET role='admin' WHERE username=?").run(username ?? '')
console.log(r.changes ? `${username} is now an admin` : 'No such user')
