import { Chess } from 'chess.js'
import fs from 'fs'

const content = fs.readFileSync('lib/chess-data.ts', 'utf-8')

// Extract puzzle array more carefully
const puzzleSection = content.match(/export const PUZZLES: Puzzle\[\] = \[([\s\S]*?)\n\]/)?.[1]
if (!puzzleSection) {
  console.log('Could not find PUZZLES array')
  process.exit(1)
}

// Parse each puzzle object
const puzzleRegex = /{\s*id:\s*['"]([^'"]+)['"],\s*fen:\s*['"]([^'"]+)['"],\s*moves:\s*\[([^\]]+)\][^}]*title:\s*['"]([^'"]+)['"]/gs
const puzzles = []
let match
while ((match = puzzleRegex.exec(puzzleSection)) !== null) {
  const id = match[1]
  const fen = match[2]
  const movesStr = match[3]
  const title = match[4]
  const moves = movesStr.split(',').map(m => m.trim().replace(/['"]/g, ''))
  puzzles.push({ id, fen, moves, title })
}

console.log('Found', puzzles.length, 'puzzles\n')

let errors = []
let valid = 0
for (const puzzle of puzzles) {
  const game = new Chess(puzzle.fen)
  let isValid = true
  let errorMsg = ''
  
  for (let i = 0; i < puzzle.moves.length; i++) {
    try {
      const result = game.move(puzzle.moves[i])
      if (!result) {
        isValid = false
        errorMsg = `Move ${i} (${puzzle.moves[i]}) returned null. Legal: ${game.moves().slice(0,10).join(', ')}`
        break
      }
    } catch (e) {
      isValid = false
      errorMsg = `Move ${i} (${puzzle.moves[i]}) error: ${e.message}`
      break
    }
  }
  
  if (isValid) {
    valid++
  } else {
    errors.push({ ...puzzle, error: errorMsg })
  }
}

console.log(`Valid: ${valid}/${puzzles.length}\n`)

if (errors.length > 0) {
  console.log('BROKEN PUZZLES:')
  for (const e of errors) {
    console.log(`\n=== ${e.id}: ${e.title} ===`)
    console.log('FEN:', e.fen)
    console.log('Moves:', e.moves.join(', '))
    console.log('Error:', e.error)
  }
}
