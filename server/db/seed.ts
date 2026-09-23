import 'dotenv/config'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!.replace('file:', '')
const sqlite = new Database(connectionString)
const db = drizzle(sqlite, { schema })

async function main() {
  console.log('Start seeding...')

  const existingUser = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.email, 'busyluis205@gmail.com'),
  })

  if (!existingUser) {
    const [created] = await db
      .insert(schema.user)
      .values({
        email: 'busyluis205@gmail.com',
        name: 'Luis',
      })
      .returning()
    console.log({ user: created })
  } else {
    console.log({ user: existingUser })
  }

  console.log('Seeding finished.')
}

main()
  .then(() => {
    sqlite.close()
  })
  .catch((e) => {
    console.error(e)
    sqlite.close()
    process.exit(1)
  })
