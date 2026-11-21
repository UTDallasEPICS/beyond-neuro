import { db } from '~~/server/utils/db'

type LyricLine = { time: number; text: string }

function parseLrc(lrcText: string): LyricLine[] {
  const lineRegex = /\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\](.*)/
  const result: LyricLine[] = []

  for (const rawLine of lrcText.split(/\r?\n/)) {
    const match = rawLine.match(lineRegex)
    if (!match) continue

    const text = (match[4] ?? '').trim()
    if (!text) continue

    const fraction = match[3] ? Number(`0.${match[3]}`) : 0
    result.push({
      time: Number(match[1]) * 60 + Number(match[2]) + fraction,
      text,
    })
  }

  return result.sort((a, b) => a.time - b.time)
}

async function loadLyrics(path: string, origin: string): Promise<LyricLine[]> {
  try {
    const lrcText = await $fetch<string>(path, {
      baseURL: origin,
      responseType: 'text',
    })
    return parseLrc(lrcText)
  } catch {
    return []
  }
}

export default defineEventHandler(async (event) => {
  const rows = await db.query.singAlongSong.findMany({
    orderBy: (song, { asc }) => asc(song.sortOrder),
  })

  const origin = getRequestURL(event).origin

  return await Promise.all(
    rows.map(async (song) => ({
      id: song.id,
      slug: song.slug,
      title: song.title,
      level: song.level,
      audioPath: song.audioPath,
      lyricsPath: song.lyricsPath,
      lyrics: await loadLyrics(song.lyricsPath, origin),
    }))
  )
})
