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
  
  const existingSongs = await db.query.singAlongSong.findFirst()

  if (!existingSongs) {
    const songs = [
      {
        title: 'Row, Row, Row Your Boat',
        slug: 'rowBoat',
        level: 1,
        audioPath:
          '/activities/music/rowBoat/BeyondNeuro_SingAlong_Level1_Row-Row-Row-Your-Boat.mp3',
        lyricsPath: '/activities/music/rowBoat/rowBoat.lrc',
        sortOrder: 1,
      },
      {
        title: 'When the Saints Go Marching In',
        slug: 'saintsMarching',
        level: 2,
        audioPath:
          '/activities/music/saintsMarching/BeyondNeuro_SingAlong_Level2_When-the-Saints-Go-Marching-In.mp3',
        lyricsPath: '/activities/music/saintsMarching/saintsMarching.lrc',
        sortOrder: 2,
      },
      {
        title: 'Swing Low, Sweet Chariot',
        slug: 'swingLow',
        level: 3,
        audioPath:
          '/activities/music/swingLow/BeyondNeuro_SingAlong_Level3_Swing-Low-Sweet-Chariot.mp3',
        lyricsPath: '/activities/music/swingLow/swingLow.lrc',
        sortOrder: 3,
      },
      {
        title: 'Take Me Out to the Ball Game',
        slug: 'takeMeOutTheBallGame',
        level: 4,
        audioPath:
          '/activities/music/takeMeOutTheBallGame/BeyondNeuro_SingAlong_Level4_Take-Me-Out-to-the-Ball-Game.mp3',
        lyricsPath: '/activities/music/takeMeOutTheBallGame/takeMeOutTheBallGame.lrc',
        sortOrder: 4,
      },
      {
        title: 'Daisy Bell',
        slug: 'daisyBell',
        level: 5,
        audioPath:
          '/activities/music/daisyBell/BeyondNeuro_SingAlong_Level5_Daisy-Bell.mp3',
        lyricsPath: '/activities/music/daisyBell/daisyBell.lrc',
        sortOrder: 5,
      },
      {
        title: 'Amazing Grace',
        slug: 'amazingGrace',
        level: 6,
        audioPath:
          '/activities/music/amazingGrace/BeyondNeuro_SingAlong_Level6_Amazing-Grace.mp3',
        lyricsPath: '/activities/music/amazingGrace/amazingGrace.lrc',
        sortOrder: 6,
      },
      {
        title: 'Auld Lang Syne',
        slug: 'langSyne',
        level: 7,
        audioPath:
          '/activities/music/langSyne/BeyondNeuro_SingAlong_Level7_Auld-Lang-Syne.mp3',
        lyricsPath: '/activities/music/langSyne/langSyne.lrc',
        sortOrder: 7,
      },
    ]
  
    await db.insert(schema.singAlongSong).values(songs)
    console.log(`Seeded ${songs.length} sing-along songs`)
  } else {
    console.log('Sing-along songs already seeded, skipping')
  }

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
