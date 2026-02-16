// Comprehensive chess learning data: openings, puzzles, traps

export interface Opening {
  id: string
  name: string
  eco: string
  moves: string[]
  fen: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'e4' | 'd4' | 'other'
  popularity: number
  winRate: { white: number; draw: number; black: number }
  keyIdeas: string[]
  variations: { name: string; moves: string[]; description: string }[]
  learned?: boolean
}

export interface Puzzle {
  id: string
  fen: string
  moves: string[] // alternating: opponent move, your move, opponent response, your move...
  rating: number
  themes: string[]
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  xpReward: number
  solved?: boolean
}

export interface Trap {
  id: string
  name: string
  opening: string
  moves: string[]
  fen: string
  description: string
  explanation: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  side: 'white' | 'black'
  xpReward: number
  learned?: boolean
}

export const OPENINGS: Opening[] = [
  {
    id: 'italian-game',
    name: 'Italian Game',
    eco: 'C50',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    description: 'One of the oldest and most popular openings. White develops the bishop to c4 targeting the f7 square, the weakest point in Black\'s position.',
    difficulty: 'beginner',
    category: 'e4',
    popularity: 92,
    winRate: { white: 38, draw: 30, black: 32 },
    keyIdeas: [
      'Control the center with e4 and d4',
      'Target the weak f7 pawn',
      'Rapid piece development',
      'Prepare for kingside castling'
    ],
    variations: [
      { name: 'Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'], description: 'The quiet game - solid and classical' },
      { name: 'Evans Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'], description: 'Aggressive pawn sacrifice for rapid development' },
      { name: 'Two Knights Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'], description: 'Black counterattacks the e4 pawn immediately' },
    ]
  },
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    eco: 'B20',
    moves: ['e4', 'c5'],
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    description: 'The most popular and best-scoring response to e4. Black fights for the center asymmetrically, leading to sharp tactical play.',
    difficulty: 'intermediate',
    category: 'e4',
    popularity: 97,
    winRate: { white: 35, draw: 28, black: 37 },
    keyIdeas: [
      'Asymmetrical pawn structure creates imbalance',
      'Black gains a queenside pawn majority',
      'Rich tactical and strategic possibilities',
      'Multiple sharp variations to study'
    ],
    variations: [
      { name: 'Najdorf', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'], description: 'The king of Sicilian variations - Bobby Fischer\'s weapon' },
      { name: 'Dragon', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'], description: 'Fianchetto the bishop for a fire-breathing attack' },
      { name: 'Classical', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6'], description: 'Solid development with piece pressure' },
    ]
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    eco: 'C00',
    moves: ['e4', 'e6'],
    fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    description: 'A solid defense where Black builds a strong pawn chain. It leads to strategic positions with clear plans for both sides.',
    difficulty: 'intermediate',
    category: 'e4',
    popularity: 78,
    winRate: { white: 37, draw: 32, black: 31 },
    keyIdeas: [
      'Solid pawn structure with e6-d5',
      'Counter-attack on the queenside with c5',
      'The light-squared bishop can be problematic',
      'Strategic maneuvering and pawn breaks'
    ],
    variations: [
      { name: 'Winawer', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'], description: 'Sharp and double-edged - pins the knight' },
      { name: 'Advance', moves: ['e4', 'e6', 'd4', 'd5', 'e5'], description: 'White grabs space, Black attacks the chain' },
      { name: 'Tarrasch', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2'], description: 'Flexible system avoiding the Winawer pin' },
    ]
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    eco: 'C60',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    description: 'The Spanish Opening - one of the most respected and played openings at all levels. It creates long-term strategic pressure.',
    difficulty: 'intermediate',
    category: 'e4',
    popularity: 90,
    winRate: { white: 39, draw: 31, black: 30 },
    keyIdeas: [
      'Pressure on the e5 pawn through the c6 knight',
      'Long-term strategic advantage for White',
      'Rich middlegame plans',
      'Can lead to both open and closed positions'
    ],
    variations: [
      { name: 'Morphy Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'], description: 'The main line - challenging the bishop immediately' },
      { name: 'Berlin Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'], description: 'The Berlin Wall - ultra-solid endgame approach' },
      { name: 'Marshall Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5'], description: 'A brilliant pawn sacrifice for a devastating attack' },
    ]
  },
  {
    id: 'queens-gambit',
    name: 'Queen\'s Gambit',
    eco: 'D06',
    moves: ['d4', 'd5', 'c4'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    description: 'One of the oldest known openings. White offers a pawn to gain control of the center. It\'s not a true gambit as the pawn can usually be recovered.',
    difficulty: 'beginner',
    category: 'd4',
    popularity: 88,
    winRate: { white: 40, draw: 32, black: 28 },
    keyIdeas: [
      'Control the center with d4 and c4',
      'Open lines for piece development',
      'Create pressure on d5',
      'Strategic middlegame with clear plans'
    ],
    variations: [
      { name: 'Accepted', moves: ['d4', 'd5', 'c4', 'dxc4'], description: 'Black takes the pawn but must be careful not to hold it too long' },
      { name: 'Declined', moves: ['d4', 'd5', 'c4', 'e6'], description: 'Solid and reliable - the classical response' },
      { name: 'Slav Defense', moves: ['d4', 'd5', 'c4', 'c6'], description: 'Supports d5 while keeping the light-squared bishop active' },
    ]
  },
  {
    id: 'kings-indian',
    name: 'King\'s Indian Defense',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6'],
    fen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    description: 'A hypermodern defense where Black allows White to build a large center, then strikes back with devastating counterattacks.',
    difficulty: 'advanced',
    category: 'd4',
    popularity: 82,
    winRate: { white: 37, draw: 28, black: 35 },
    keyIdeas: [
      'Let White build the center, then destroy it',
      'Kingside attack with f5 and g5 pushes',
      'Dynamic piece play and tactical fireworks',
      'Rich strategic and tactical possibilities'
    ],
    variations: [
      { name: 'Classical', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5'], description: 'The main battleground with opposite-side attacks' },
      { name: 'Samisch', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3'], description: 'White builds a massive pawn center' },
      { name: 'Four Pawns Attack', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4'], description: 'Aggressive - White pushes all four center pawns' },
    ]
  },
  {
    id: 'london-system',
    name: 'London System',
    eco: 'D02',
    moves: ['d4', 'd5', 'Bf4'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2',
    description: 'A solid, easy-to-learn system where White develops the dark-squared bishop before playing e3. Great for beginners who want a reliable setup.',
    difficulty: 'beginner',
    category: 'd4',
    popularity: 75,
    winRate: { white: 38, draw: 33, black: 29 },
    keyIdeas: [
      'Develop bishop to f4 before playing e3',
      'Build a solid pyramid structure',
      'Flexible - works against most Black setups',
      'Simple plans with minimal theory required'
    ],
    variations: [
      { name: 'Main Line', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3'], description: 'The standard setup with a solid center' },
      { name: 'Jobava London', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'Nc3'], description: 'More aggressive with Nc3 instead of e3' },
    ]
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    eco: 'B10',
    moves: ['e4', 'c6'],
    fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    description: 'A very solid defense that avoids the typical problems of the French Defense. Black keeps the light-squared bishop active.',
    difficulty: 'intermediate',
    category: 'e4',
    popularity: 76,
    winRate: { white: 36, draw: 33, black: 31 },
    keyIdeas: [
      'Solid pawn structure with d5 support',
      'Light-squared bishop remains active',
      'Less cramped than the French Defense',
      'Reliable at all levels of play'
    ],
    variations: [
      { name: 'Advance', moves: ['e4', 'c6', 'd4', 'd5', 'e5'], description: 'White grabs space with e5' },
      { name: 'Exchange', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5'], description: 'Symmetrical but White has a slight edge' },
      { name: 'Fantasy', moves: ['e4', 'c6', 'd4', 'd5', 'f3'], description: 'Aggressive and unorthodox approach' },
    ]
  },
  {
    id: 'english-opening',
    name: 'English Opening',
    eco: 'A10',
    moves: ['c4'],
    fen: 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1',
    description: 'A flexible flank opening that can transpose into many other openings. Named after Howard Staunton who employed it in 1843.',
    difficulty: 'intermediate',
    category: 'other',
    popularity: 70,
    winRate: { white: 37, draw: 34, black: 29 },
    keyIdeas: [
      'Control d5 from the flank',
      'Flexible - can transpose into many systems',
      'Often leads to strategic positions',
      'Good for players who like variety'
    ],
    variations: [
      { name: 'Symmetrical', moves: ['c4', 'c5'], description: 'Black mirrors White\'s approach' },
      { name: 'Reversed Sicilian', moves: ['c4', 'e5'], description: 'Black takes the center while White plays a reversed Sicilian' },
    ]
  },
  {
    id: 'scotch-game',
    name: 'Scotch Game',
    eco: 'C45',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3',
    description: 'An aggressive opening where White immediately challenges the center. Garry Kasparov revived this opening in the 1990s.',
    difficulty: 'beginner',
    category: 'e4',
    popularity: 72,
    winRate: { white: 39, draw: 29, black: 32 },
    keyIdeas: [
      'Immediate central confrontation',
      'Open lines for rapid development',
      'Active piece play for both sides',
      'Leads to dynamic middlegames'
    ],
    variations: [
      { name: 'Classical', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5'], description: 'Black develops actively against the knight' },
      { name: 'Scotch Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4'], description: 'White sacrifices a pawn for rapid development' },
    ]
  },
]

export const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    moves: ['Qxf7#'],
    rating: 400,
    themes: ['mate', 'scholarsMate'],
    title: 'Scholar\'s Mate',
    description: 'Find the checkmate in one move! This is the famous Scholar\'s Mate pattern.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p2',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    moves: ['Qxf7#'],
    rating: 450,
    themes: ['mate', 'backRank'],
    title: 'Quick Strike',
    description: 'Exploit the weak f7 square to deliver checkmate.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p3',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['Re8#'],
    rating: 500,
    themes: ['mate', 'backRank'],
    title: 'Back Rank Mate',
    description: 'The king is trapped behind its own pawns. Find the back rank checkmate!',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p4',
    fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 4 5',
    moves: ['O-O'],
    rating: 550,
    themes: ['development', 'castling'],
    title: 'Castle to Safety',
    description: 'What is the best move to get your king to safety while connecting your rooks?',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p5',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq g3 0 2',
    moves: ['Qh4#'],
    rating: 400,
    themes: ['mate', 'foolsMate'],
    title: 'Fool\'s Mate',
    description: 'White has weakened the kingside terribly. Find the instant checkmate!',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p6',
    fen: 'r1bqr1k1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7',
    moves: ['Bg5', 'h6', 'Bxf6', 'Qxf6'],
    rating: 800,
    themes: ['pin', 'exchange'],
    title: 'Pin and Win',
    description: 'Use a pin to win material. Find the best sequence of moves.',
    difficulty: 'medium',
    xpReward: 20,
  },
  {
    id: 'p7',
    fen: 'r2qk2r/ppp1bppp/2n2n2/3pp1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QK2R w KQkq - 4 6',
    moves: ['Bxf6', 'Bxf6', 'Bxd5'],
    rating: 900,
    themes: ['tactic', 'discovery'],
    title: 'Discovered Attack',
    description: 'Use a discovered attack to win a pawn and open lines.',
    difficulty: 'medium',
    xpReward: 20,
  },
  {
    id: 'p8',
    fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 6 5',
    moves: ['b4', 'Bb6', 'a4', 'a5', 'b5'],
    rating: 1000,
    themes: ['strategy', 'pawnStorm'],
    title: 'Pawn Storm',
    description: 'Launch a queenside pawn storm to push back the enemy bishop.',
    difficulty: 'medium',
    xpReward: 25,
  },
  {
    id: 'p9',
    fen: 'r1b1k2r/ppppqppp/2n5/2b1p1N1/2B1P3/3P4/PPP2PPP/RNBQK2R w KQkq - 5 6',
    moves: ['Nxf7', 'Kxf7', 'Bg5'],
    rating: 1100,
    themes: ['sacrifice', 'fork'],
    title: 'Knight Sacrifice',
    description: 'Sacrifice the knight on f7 to expose the enemy king!',
    difficulty: 'hard',
    xpReward: 35,
  },
  {
    id: 'p10',
    fen: '2r3k1/pp3ppp/3p4/3Pp3/2P1n1q1/1PB3P1/P4PBP/R2Q2K1 b - - 0 1',
    moves: ['Nf2', 'Qe2', 'Nh3+', 'Kh1', 'Qg1+', 'Rxg1', 'Nf2#'],
    rating: 1500,
    themes: ['mate', 'smotheredMate'],
    title: 'Smothered Mate',
    description: 'Execute the beautiful smothered mate pattern! This requires precise calculation.',
    difficulty: 'hard',
    xpReward: 50,
  },
  {
    id: 'p11',
    fen: 'r4rk1/ppp2ppp/2n5/3qp1B1/3P4/2P2N2/PP3PPP/R2QR1K1 w - - 0 12',
    moves: ['dxe5', 'Qd1', 'Raxd1'],
    rating: 1200,
    themes: ['tactic', 'removal'],
    title: 'Remove the Defender',
    description: 'Capture a key defender to win material.',
    difficulty: 'hard',
    xpReward: 35,
  },
  {
    id: 'p12',
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 w - - 0 7',
    moves: ['d5', 'Nb8', 'Bg5'],
    rating: 1300,
    themes: ['strategy', 'space'],
    title: 'Space Advantage',
    description: 'Push d5 to gain a commanding space advantage in the center.',
    difficulty: 'hard',
    xpReward: 40,
  },
]

export const TRAPS: Trap[] = [
  {
    id: 'legal-trap',
    name: 'Legal\'s Trap',
    opening: 'Italian Game',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'd6', 'Nc3', 'Bg4', 'h3', 'Bh5', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'],
    fen: 'r2qkbnr/ppp2ppp/2np4/4p2b/2B1P3/2N2N1P/PPPP1PP1/R1BQK2R w KQkq - 1 6',
    description: 'A classic trap where White sacrifices the queen to deliver a stunning checkmate.',
    explanation: [
      'White plays Nxe5 seemingly losing the queen to Bxd1',
      'But after Bxf7+ the king is forced to e7',
      'Then Nd5# delivers a beautiful checkmate',
      'The knight on e5, bishop on f7, and knight on d5 create an inescapable net'
    ],
    difficulty: 'beginner',
    side: 'white',
    xpReward: 30,
  },
  {
    id: 'stafford-gambit',
    name: 'Stafford Gambit',
    opening: 'Petrov Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6', 'Nxc6', 'dxc6', 'd3', 'Bc5', 'Bg5', 'Nxe4', 'Bxd8', 'Bxf2+', 'Ke2', 'Bg4#'],
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    description: 'A trappy gambit where Black sacrifices a pawn for a vicious attack. Eric Rosen made this famous online.',
    explanation: [
      'Black plays Nc6 instead of the normal dxc6, offering a piece',
      'After dxc6, Black develops rapidly with Bc5 and sets up tactics',
      'The key idea is Bxf2+ forcing the king to e2',
      'Then Bg4# is a stunning checkmate - the bishop and knight coordinate perfectly'
    ],
    difficulty: 'intermediate',
    side: 'black',
    xpReward: 40,
  },
  {
    id: 'fried-liver',
    name: 'Fried Liver Attack',
    opening: 'Italian Game - Two Knights',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3'],
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4',
    description: 'A devastating attack where White sacrifices a knight on f7 to drag the Black king into the center of the board.',
    explanation: [
      'White plays the aggressive Ng5 targeting f7',
      'After d5 exd5 Nxd5, White strikes with Nxf7!',
      'The king is forced to take and enters a danger zone',
      'Qf3+ followed by Nc3 creates an overwhelming attack with the king exposed'
    ],
    difficulty: 'beginner',
    side: 'white',
    xpReward: 30,
  },
  {
    id: 'elephant-trap',
    name: 'Elephant Trap',
    opening: 'Queen\'s Gambit Declined',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'cxd5', 'exd5', 'Nxd5', 'Nxd5', 'Bxd8', 'Bb4+', 'Qd2', 'Bxd2+', 'Kxd2', 'Kxd8'],
    fen: 'r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKB1R w KQkq - 3 5',
    description: 'A classic trap in the Queen\'s Gambit where Black wins material after White greedily captures the d5 pawn.',
    explanation: [
      'White plays cxd5 exd5, then greedily takes Nxd5',
      'Black responds Nxd5, and after Bxd8, plays the shocking Bb4+!',
      'White must block with Qd2, then Bxd2+ Kxd2 Kxd8',
      'Black has won a full piece - the bishop on d8 is trapped!'
    ],
    difficulty: 'intermediate',
    side: 'black',
    xpReward: 40,
  },
  {
    id: 'lasker-trap',
    name: 'Lasker Trap',
    opening: 'Queen\'s Gambit Accepted',
    moves: ['d4', 'd5', 'c4', 'dxc4', 'e3', 'b5', 'a4', 'c6', 'axb5', 'cxb5', 'Qf3', 'Nc6', 'Qxc6+', 'Bd7', 'Qc7', 'Qxc7'],
    fen: 'rnbqkbnr/p1p1pppp/8/1p6/P1pP4/4P3/1P3PPP/RNBQKBNR w KQkq b6 0 4',
    description: 'Named after Emanuel Lasker, this trap punishes White for being too aggressive in the Queen\'s Gambit Accepted.',
    explanation: [
      'Black plays the tricky b5 trying to hold the c4 pawn',
      'White attacks with a4, and after the exchanges, plays Qf3',
      'This leads to sharp tactical play on the queenside',
      'The key lesson is understanding pawn tension in the QGA'
    ],
    difficulty: 'intermediate',
    side: 'black',
    xpReward: 35,
  },
  {
    id: 'magnus-smith-trap',
    name: 'Magnus Smith Trap',
    opening: 'Sicilian Defense',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6', 'Bc4', 'g6', 'Nxc6', 'bxc6', 'e5', 'Ng4'],
    fen: 'r1bqkbnr/pp3ppp/2np4/2p1p3/2B1P3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
    description: 'A sneaky trap in the Sicilian where White wins material with a powerful central thrust.',
    explanation: [
      'White develops naturally and then plays the strong e5!',
      'This move attacks the d6 pawn and the f6 knight simultaneously',
      'Black is forced into an awkward position',
      'White gains a significant advantage in material or position'
    ],
    difficulty: 'advanced',
    side: 'white',
    xpReward: 50,
  },
]

export const AI_LEVELS = [
  { level: 1, name: 'Beginner Bot', rating: 400, description: 'Makes random moves, perfect for learning', depth: 1, icon: 'P', color: '#4ade80' },
  { level: 2, name: 'Casual Player', rating: 600, description: 'Knows basic tactics but misses a lot', depth: 2, icon: 'P', color: '#4ade80' },
  { level: 3, name: 'Club Player', rating: 800, description: 'Understands basic strategy and openings', depth: 3, icon: 'N', color: '#60a5fa' },
  { level: 4, name: 'Tournament Player', rating: 1000, description: 'Solid player with good tactical vision', depth: 5, icon: 'N', color: '#60a5fa' },
  { level: 5, name: 'Expert', rating: 1200, description: 'Strong player who rarely blunders', depth: 7, icon: 'B', color: '#a78bfa' },
  { level: 6, name: 'Master', rating: 1400, description: 'Plays at a master level with deep calculation', depth: 9, icon: 'R', color: '#f59e0b' },
  { level: 7, name: 'Grandmaster', rating: 1600, description: 'Near-perfect play with devastating attacks', depth: 12, icon: 'Q', color: '#f59e0b' },
  { level: 8, name: 'Stockfish Beast', rating: 2000, description: 'Maximum engine strength. Good luck!', depth: 15, icon: 'K', color: '#ef4444' },
]

export const PUZZLE_THEMES = [
  'All Puzzles',
  'Checkmate',
  'Tactics',
  'Forks',
  'Pins',
  'Back Rank',
  'Sacrifice',
  'Endgame',
  'Strategy',
]

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
    case 'easy':
      return 'text-green-400'
    case 'intermediate':
    case 'medium':
      return 'text-yellow-400'
    case 'advanced':
    case 'hard':
      return 'text-orange-400'
    case 'expert':
      return 'text-red-400'
    default:
      return 'text-muted-foreground'
  }
}

export function getDifficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
    case 'easy':
      return 'bg-green-400/10 text-green-400 border-green-400/20'
    case 'intermediate':
    case 'medium':
      return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
    case 'advanced':
    case 'hard':
      return 'bg-orange-400/10 text-orange-400 border-orange-400/20'
    case 'expert':
      return 'bg-red-400/10 text-red-400 border-red-400/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-400 border-gray-400/20'
    case 'rare':
      return 'text-blue-400 border-blue-400/30'
    case 'epic':
      return 'text-purple-400 border-purple-400/30'
    case 'legendary':
      return 'text-yellow-400 border-yellow-400/30'
    default:
      return 'text-muted-foreground border-border'
  }
}
