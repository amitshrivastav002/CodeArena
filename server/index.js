import { createApp } from './app.js'
import { openDb } from './db.js'

const port = process.env.PORT ?? 4100
createApp(openDb()).listen(port, () => console.log(`CodeArena API on http://localhost:${port}`))
