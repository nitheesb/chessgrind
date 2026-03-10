// Opening name detection from move sequences
// Maps first N moves to opening names and ECO codes

interface OpeningEntry {
  name: string
  eco: string
}

// Map of move sequences (space-separated SAN) to opening names
const OPENING_BOOK: Record<string, OpeningEntry> = {
  'e4 e5': { name: 'Open Game', eco: 'C20' },
  'e4 e5 Nf3': { name: 'King\'s Knight Opening', eco: 'C40' },
  'e4 e5 Nf3 Nc6': { name: 'Four Knights Game', eco: 'C44' },
  'e4 e5 Nf3 Nc6 Bb5': { name: 'Ruy López', eco: 'C60' },
  'e4 e5 Nf3 Nc6 Bb5 a6': { name: 'Ruy López: Morphy Defense', eco: 'C65' },
  'e4 e5 Nf3 Nc6 Bc4': { name: 'Italian Game', eco: 'C50' },
  'e4 e5 Nf3 Nc6 Bc4 Bc5': { name: 'Giuoco Piano', eco: 'C53' },
  'e4 e5 Nf3 Nc6 Bc4 Nf6': { name: 'Two Knights Defense', eco: 'C55' },
  'e4 e5 Nf3 Nc6 d4': { name: 'Scotch Game', eco: 'C45' },
  'e4 e5 Nf3 Nf6': { name: 'Petrov\'s Defense', eco: 'C42' },
  'e4 e5 Nf3 d6': { name: 'Philidor Defense', eco: 'C41' },
  'e4 e5 f4': { name: 'King\'s Gambit', eco: 'C30' },
  'e4 e5 d4': { name: 'Center Game', eco: 'C21' },
  'e4 e5 Nc3': { name: 'Vienna Game', eco: 'C25' },
  'e4 c5': { name: 'Sicilian Defense', eco: 'B20' },
  'e4 c5 Nf3': { name: 'Sicilian Defense: Open', eco: 'B27' },
  'e4 c5 Nf3 d6': { name: 'Sicilian: Najdorf/Classical', eco: 'B50' },
  'e4 c5 Nf3 d6 d4': { name: 'Sicilian: Open Variation', eco: 'B52' },
  'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6': { name: 'Sicilian Najdorf', eco: 'B90' },
  'e4 c5 Nf3 Nc6': { name: 'Sicilian: Old Sicilian', eco: 'B30' },
  'e4 c5 Nf3 e6': { name: 'Sicilian: French Variation', eco: 'B40' },
  'e4 c5 c3': { name: 'Sicilian: Alapin Variation', eco: 'B22' },
  'e4 e6': { name: 'French Defense', eco: 'C00' },
  'e4 e6 d4': { name: 'French Defense', eco: 'C00' },
  'e4 e6 d4 d5': { name: 'French Defense', eco: 'C01' },
  'e4 e6 d4 d5 Nc3': { name: 'French: Classical', eco: 'C11' },
  'e4 e6 d4 d5 e5': { name: 'French: Advance Variation', eco: 'C02' },
  'e4 e6 d4 d5 Nd2': { name: 'French: Tarrasch Variation', eco: 'C03' },
  'e4 c6': { name: 'Caro-Kann Defense', eco: 'B10' },
  'e4 c6 d4 d5': { name: 'Caro-Kann Defense', eco: 'B12' },
  'e4 c6 d4 d5 Nc3': { name: 'Caro-Kann: Classical', eco: 'B18' },
  'e4 c6 d4 d5 e5': { name: 'Caro-Kann: Advance', eco: 'B12' },
  'e4 d5': { name: 'Scandinavian Defense', eco: 'B01' },
  'e4 d6': { name: 'Pirc Defense', eco: 'B07' },
  'e4 d6 d4 Nf6 Nc3': { name: 'Pirc Defense: Classical', eco: 'B08' },
  'e4 Nf6': { name: 'Alekhine\'s Defense', eco: 'B02' },
  'e4 g6': { name: 'Modern Defense', eco: 'B06' },
  'd4 d5': { name: 'Closed Game', eco: 'D00' },
  'd4 d5 c4': { name: 'Queen\'s Gambit', eco: 'D06' },
  'd4 d5 c4 dxc4': { name: 'Queen\'s Gambit Accepted', eco: 'D20' },
  'd4 d5 c4 e6': { name: 'Queen\'s Gambit Declined', eco: 'D30' },
  'd4 d5 c4 c6': { name: 'Slav Defense', eco: 'D10' },
  'd4 d5 Nf3': { name: 'Queen\'s Pawn Game', eco: 'D02' },
  'd4 d5 Bf4': { name: 'London System', eco: 'D00' },
  'd4 d5 Nf3 Nf6 Bf4': { name: 'London System', eco: 'D00' },
  'd4 Nf6': { name: 'Indian Defense', eco: 'A45' },
  'd4 Nf6 c4': { name: 'Indian Defense', eco: 'A50' },
  'd4 Nf6 c4 g6': { name: 'King\'s Indian Defense', eco: 'E60' },
  'd4 Nf6 c4 g6 Nc3 Bg7': { name: 'King\'s Indian Defense', eco: 'E70' },
  'd4 Nf6 c4 e6': { name: 'Nimzo/Queen\'s Indian', eco: 'E00' },
  'd4 Nf6 c4 e6 Nc3 Bb4': { name: 'Nimzo-Indian Defense', eco: 'E20' },
  'd4 Nf6 c4 e6 Nf3 b6': { name: 'Queen\'s Indian Defense', eco: 'E15' },
  'd4 Nf6 c4 c5': { name: 'Benoni Defense', eco: 'A56' },
  'd4 f5': { name: 'Dutch Defense', eco: 'A80' },
  'Nf3': { name: 'Réti Opening', eco: 'A04' },
  'Nf3 d5': { name: 'Réti Opening', eco: 'A06' },
  'Nf3 Nf6': { name: 'Réti Opening', eco: 'A05' },
  'Nf3 d5 c4': { name: 'Réti Opening', eco: 'A09' },
  'c4': { name: 'English Opening', eco: 'A10' },
  'c4 e5': { name: 'English Opening: Reversed Sicilian', eco: 'A20' },
  'c4 c5': { name: 'English: Symmetrical', eco: 'A30' },
  'c4 Nf6': { name: 'English: Anglo-Indian', eco: 'A15' },
  'g3': { name: 'Hungarian Opening', eco: 'A00' },
  'b3': { name: 'Nimzo-Larsen Attack', eco: 'A01' },
  'f4': { name: 'Bird\'s Opening', eco: 'A02' },
}

/**
 * Detect the opening name from a list of SAN moves.
 * Returns the most specific match (longest move sequence).
 */
export function detectOpening(moves: string[]): OpeningEntry | null {
  let bestMatch: OpeningEntry | null = null

  // Try from longest to shortest prefix
  for (let i = moves.length; i >= 1; i--) {
    const key = moves.slice(0, i).join(' ')
    if (OPENING_BOOK[key]) {
      bestMatch = OPENING_BOOK[key]
      break
    }
  }

  return bestMatch
}
