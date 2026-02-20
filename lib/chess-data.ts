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
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6', 'O-O', 'O-O', 'c3', 'd6', 'Bb3', 'Be6', 'Nbd2', 'Bxb3', 'Qxb3'],
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
      { name: 'Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6', 'O-O', 'O-O', 'Re1', 'a6', 'a4', 'Ba7', 'Nbd2', 'd6', 'Nf1'], description: 'The quiet game - solid and classical development' },
      { name: 'Evans Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O', 'Nf6', 'cxd4'], description: 'Aggressive pawn sacrifice for rapid development and open lines' },
      { name: 'Two Knights Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Be7', 'O-O', 'O-O', 'Re1', 'd6', 'c3', 'Na5', 'Bb5', 'c6', 'Bc4', 'Nxc4', 'dxc4'], description: 'Black counterattacks the e4 pawn immediately, leading to sharp play' },
      { name: 'Fried Liver Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3'], description: 'Sacrificing a knight for a devastating attack on the exposed king' },
    ]
  },
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    eco: 'B20',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7', 'Qd2', 'O-O', 'O-O-O'],
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
      { name: 'Najdorf', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'h5', 'Qd2', 'Nbd7', 'O-O-O', 'Rc8'], description: 'The king of Sicilian variations - Bobby Fischer\'s weapon of choice' },
      { name: 'Dragon', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4', 'Bd7', 'O-O-O', 'Rc8'], description: 'Fianchetto the bishop for a fire-breathing kingside attack' },
      { name: 'Classical', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6', 'Bg5', 'e6', 'Qd2', 'a6', 'O-O-O', 'Bd7', 'f4', 'Be7'], description: 'Solid development with piece pressure on the center' },
      { name: 'Sveshnikov', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5', 'Ndb5', 'd6', 'Bg5', 'a6', 'Na3', 'b5', 'Nd5', 'Be7', 'Bxf6', 'Bxf6'], description: 'Modern aggressive system accepting a backward d6 pawn for active play' },
    ]
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    eco: 'C00',
    moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e5', 'Nfd7', 'Bxe7', 'Qxe7', 'f4', 'a6', 'Nf3', 'c5', 'dxc5', 'Nc6'],
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
      { name: 'Winawer', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7', 'Qg4', 'Qc7', 'Qxg7', 'Rg8', 'Qxh7', 'cxd4'], description: 'Sharp and double-edged - pins the knight and provokes weaknesses' },
      { name: 'Advance', moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'a3', 'c4', 'Nbd2', 'Na5', 'Be2', 'Bd7', 'O-O', 'Ne7'], description: 'White grabs space with e5, Black attacks the pawn chain' },
      { name: 'Tarrasch', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nf6', 'e5', 'Nfd7', 'Bd3', 'c5', 'c3', 'Nc6', 'Ne2', 'cxd4', 'cxd4', 'f6', 'exf6', 'Nxf6'], description: 'Flexible system avoiding the Winawer pin, maintains pawn tension' },
      { name: 'Classical', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e5', 'Nfd7', 'Bxe7', 'Qxe7', 'f4', 'O-O', 'Nf3', 'c5', 'Qd2', 'Nc6', 'O-O-O', 'a6'], description: 'The main line - strategic battle over the pawn chain' },
    ]
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    eco: 'C60',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4'],
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
      { name: 'Morphy Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Na5', 'Bc2', 'c5', 'd4'], description: 'The main line - challenging the bishop immediately, leading to complex play' },
      { name: 'Berlin Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4', 'd4', 'Nd6', 'Bxc6', 'dxc6', 'dxe5', 'Nf5', 'Qxd8+', 'Kxd8', 'Nc3', 'Ke8'], description: 'The Berlin Wall - ultra-solid endgame approach favored by Kramnik' },
      { name: 'Marshall Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5', 'exd5', 'Nxd5', 'd4', 'exd4', 'Re1', 'Be6'], description: 'A brilliant pawn sacrifice for a devastating attack - Black gives up a pawn for initiative' },
      { name: 'Closed Ruy Lopez', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Na5', 'Bc2', 'c5', 'd4', 'Qc7', 'Nbd2', 'Bd7'], description: 'Strategic maneuvering with slow buildup - a chess marathon' },
    ]
  },
  {
    id: 'queens-gambit',
    name: 'Queen\'s Gambit',
    eco: 'D06',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6', 'Bd3', 'dxc4', 'Bxc4', 'Nd5'],
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
      { name: 'Accepted', moves: ['d4', 'd5', 'c4', 'dxc4', 'Nf3', 'Nf6', 'e3', 'e6', 'Bxc4', 'c5', 'O-O', 'a6', 'Qe2', 'b5', 'Bb3', 'Bb7', 'Rd1', 'Nbd7'], description: 'Black takes the pawn but must return it for solid development' },
      { name: 'Declined', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6', 'Bd3', 'dxc4', 'Bxc4'], description: 'The classical solid response - Black maintains the center' },
      { name: 'Slav Defense', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'e3', 'e6', 'Bxc4', 'Bb4', 'O-O', 'O-O'], description: 'Supports d5 while keeping the light-squared bishop active on f5' },
      { name: 'Semi-Slav', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'e3', 'Nbd7', 'Bd3', 'dxc4', 'Bxc4', 'b5', 'Bd3', 'Bb7'], description: 'Flexible setup allowing both ...c5 and ...e5 breaks' },
      { name: 'Ragozin Defense', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Bb4', 'Bg5', 'dxc4', 'e4', 'c5', 'Bxc4', 'cxd4', 'Nxd4', 'Qa5'], description: 'Nimzo-Indian style with ...Bb4 creating tactical possibilities' },
    ]
  },
  {
    id: 'kings-indian',
    name: 'King\'s Indian Defense',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'f3', 'f5'],
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
      { name: 'Classical', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'Nd3', 'f5', 'f3', 'f4'], description: 'The main battleground with opposite-side attacks and closed center' },
      { name: 'Samisch', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'e5', 'd5', 'Nh5', 'Qd2', 'f5', 'O-O-O', 'Nd7'], description: 'White builds a massive pawn center and often castles queenside' },
      { name: 'Four Pawns Attack', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4', 'O-O', 'Nf3', 'c5', 'd5', 'e6', 'Be2', 'exd5', 'cxd5', 'Bg4'], description: 'Aggressive - White pushes all four center pawns but can become overextended' },
      { name: 'Fianchetto System', moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'Bg7', 'Bg2', 'O-O', 'Nc3', 'd6', 'Nf3', 'Nbd7', 'O-O', 'e5', 'e4', 'c6', 'h3', 'Qb6'], description: 'Calm approach where White also fianchettoes, leading to strategic battles' },
    ]
  },
  {
    id: 'london-system',
    name: 'London System',
    eco: 'D02',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'e6', 'Ngf3', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'Qe7', 'Ne5', 'Nd7'],
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
      { name: 'Main Line', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'e6', 'Ngf3', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'b6', 'Qe2', 'Bb7'], description: 'The standard setup with a solid center - plans h3, Ne5' },
      { name: 'Jobava London', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'Nc3', 'e6', 'e3', 'c5', 'Nb5', 'Na6', 'c3', 'Bd6', 'Bxd6', 'Qxd6', 'Qa4', 'O-O'], description: 'More aggressive with Nc3 instead of e3 - leads to sharper play' },
      { name: 'London vs King\'s Indian', moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nf3', 'O-O', 'Be2', 'd6', 'O-O', 'Nbd7', 'h3', 'Qe8', 'c3', 'e5', 'Bh2', 'Nh5'], description: 'Handling Black\'s fianchetto setup with a solid structure' },
    ]
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    eco: 'B10',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7', 'h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3'],
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
      { name: 'Classical (Bf5)', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7', 'h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3', 'e6'], description: 'Main line where Black develops the bishop to f5 before e6' },
      { name: 'Advance', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5', 'Be3', 'Nd7', 'O-O', 'Ne7', 'c3', 'Nc6'], description: 'White grabs space with e5, Black counterattacks the chain' },
      { name: 'Exchange', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'Bd3', 'Nc6', 'c3', 'Nf6', 'Bf4', 'Bg4', 'Qb3', 'Qd7'], description: 'Symmetrical but White has a slight edge with more active pieces' },
      { name: 'Fantasy (f3)', moves: ['e4', 'c6', 'd4', 'd5', 'f3', 'dxe4', 'fxe4', 'e5', 'Nf3', 'Bg4', 'Bc4', 'Nd7', 'O-O', 'Ngf6'], description: 'Aggressive and unorthodox - White builds a big center' },
      { name: 'Panov-Botvinnik Attack', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'Be7', 'cxd5', 'Nxd5', 'Bd3'], description: 'Creates an IQP position with attacking chances' },
    ]
  },
  {
    id: 'english-opening',
    name: 'English Opening',
    eco: 'A10',
    moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'Bb4', 'Bg2', 'O-O', 'O-O', 'e4', 'Ng5', 'Bxc3', 'bxc3', 'Re8', 'd3', 'exd3', 'Qxd3'],
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
      { name: 'Symmetrical', moves: ['c4', 'c5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nf3', 'Nf6', 'O-O', 'O-O', 'd3', 'd6', 'a3', 'a6', 'Rb1', 'Rb8'], description: 'Black mirrors White\'s approach leading to complex strategic battles' },
      { name: 'Reversed Sicilian', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'd3', 'Bb4', 'g3', 'O-O', 'Bg2', 'Re8', 'O-O', 'd6', 'Nd5', 'Bc5'], description: 'White plays a reversed Sicilian with an extra tempo' },
      { name: 'Four Knights', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3', 'd5', 'cxd5', 'Nxd5', 'Bg2', 'Nb6', 'O-O', 'Be7', 'd3', 'O-O'], description: 'Solid setup often reaching Sicilian-type positions' },
    ]
  },
  {
    id: 'scotch-game',
    name: 'Scotch Game',
    eco: 'C45',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'e5', 'Qe7', 'Qe2', 'Nd5', 'c4', 'Ba6', 'b3', 'g6', 'Ba3'],
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
      { name: 'Classical', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Be3', 'Qf6', 'c3', 'Nge7', 'Bc4', 'Ne5', 'Be2', 'Qg6', 'O-O', 'd6'], description: 'Black develops actively against the knight with Bc5' },
      { name: 'Scotch Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4', 'Nf6', 'e5', 'd5', 'Bb5', 'Ne4', 'Nxd4', 'Bd7', 'Bxc6', 'bxc6', 'O-O'], description: 'White sacrifices a pawn for rapid development and attacking chances' },
      { name: 'Mieses Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nxc6', 'bxc6', 'e5', 'Qe7', 'Qe2', 'Nd5', 'c4', 'Ba6', 'Nd2'], description: 'Main line exchange on c6 leading to endgame-type positions' },
    ]
  },
  {
    id: 'nimzo-indian',
    name: 'Nimzo-Indian Defense',
    eco: 'E20',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O', 'a3', 'Bxc3+', 'Qxc3', 'd5', 'Nf3', 'dxc4', 'Qxc4', 'b6', 'Bg5', 'Ba6', 'Qa4', 'h6', 'Bh4'],
    fen: 'rnbqkb1r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    description: 'One of the most respected defenses against 1.d4. Black pins the knight and is ready to double White\'s pawns.',
    difficulty: 'advanced',
    category: 'd4',
    popularity: 85,
    winRate: { white: 36, draw: 34, black: 30 },
    keyIdeas: [
      'Pin the c3 knight with Bb4',
      'Double White\'s pawns after Bxc3',
      'Control e4 square',
      'Flexible pawn structure choices'
    ],
    variations: [
      { name: 'Classical', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O', 'a3', 'Bxc3+', 'Qxc3', 'b6', 'Bg5', 'Bb7', 'e3', 'd6', 'Nf3', 'Nbd7'], description: 'Main line with Qc2 preventing doubled pawns' },
      { name: 'Samisch', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'a3', 'Bxc3+', 'bxc3', 'c5', 'e3', 'Nc6', 'Bd3', 'O-O', 'Ne2', 'b6', 'e4', 'Ne8'], description: 'White accepts doubled pawns for the bishop pair' },
      { name: 'Rubinstein', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3', 'O-O', 'Bd3', 'd5', 'Nf3', 'c5', 'O-O', 'dxc4', 'Bxc4', 'Nbd7'], description: 'Solid setup with e3 and normal development' },
    ]
  },
  {
    id: 'grunfeld-defense',
    name: 'Grünfeld Defense',
    eco: 'D80',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Nf3', 'c5', 'Be3', 'Qa5', 'Qd2', 'O-O', 'Rc1'],
    fen: 'rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4',
    description: 'A hypermodern defense where Black allows White a big center, then attacks it with pieces and the fianchettoed bishop.',
    difficulty: 'advanced',
    category: 'd4',
    popularity: 78,
    winRate: { white: 38, draw: 30, black: 32 },
    keyIdeas: [
      'Allow White a large pawn center',
      'Attack the center with Bg7 and c5',
      'Dynamic piece play',
      'Sharp theoretical battles'
    ],
    variations: [
      { name: 'Exchange', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Nf3', 'c5', 'Rb1', 'O-O', 'Be2', 'cxd4', 'cxd4', 'Qa5+', 'Bd2', 'Qxa2'], description: 'Main line with White\'s massive center under constant pressure' },
      { name: 'Russian System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7', 'Qb3', 'dxc4', 'Qxc4', 'O-O', 'e4', 'a6', 'Be2', 'b5', 'Qb3', 'c5'], description: 'Early Qb3 prevents Black from easily winning back the pawn' },
    ]
  },
  {
    id: 'dutch-defense',
    name: 'Dutch Defense',
    eco: 'A80',
    moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6', 'Nf3', 'Be7', 'O-O', 'O-O', 'c4', 'd6', 'Nc3', 'Qe8', 'Qc2', 'Qh5', 'b3', 'Nc6'],
    fen: 'rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq f6 0 2',
    description: 'An aggressive defense where Black stakes a claim on the kingside with f5. It leads to unbalanced positions.',
    difficulty: 'intermediate',
    category: 'd4',
    popularity: 65,
    winRate: { white: 40, draw: 28, black: 32 },
    keyIdeas: [
      'Control e4 with f5',
      'Kingside attacking chances',
      'Stonewall or Leningrad structures',
      'Dynamic imbalanced positions'
    ],
    variations: [
      { name: 'Stonewall', moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6', 'Nf3', 'd5', 'O-O', 'c6', 'c4', 'Bd6', 'b3', 'Qe7', 'Bb2', 'O-O', 'Qc1', 'b6'], description: 'Solid pawn structure with d5-e6-f5, good for attacking' },
      { name: 'Leningrad', moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'g6', 'Nf3', 'Bg7', 'O-O', 'O-O', 'c4', 'd6', 'Nc3', 'Nc6', 'd5', 'Ne5', 'Nxe5', 'dxe5'], description: 'Fianchetto setup resembling King\'s Indian with attacking chances' },
    ]
  },
  {
    id: 'vienna-game',
    name: 'Vienna Game',
    eco: 'C25',
    moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4', 'Nf3', 'Bg4', 'Qe2', 'Nc6', 'd3', 'Nxc3', 'bxc3', 'Be7'],
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2',
    description: 'A romantic opening where White prepares f4 to attack the center. It can lead to sharp tactical positions.',
    difficulty: 'intermediate',
    category: 'e4',
    popularity: 68,
    winRate: { white: 37, draw: 30, black: 33 },
    keyIdeas: [
      'Prepare f4 pawn push',
      'Attack the e5 pawn',
      'Rapid piece activity',
      'Can transpose to King\'s Gambit'
    ],
    variations: [
      { name: 'Vienna Gambit', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4', 'Qf3', 'Nc6', 'Bb5', 'Nxc3', 'dxc3', 'Qh4+', 'g3', 'Qe4+'], description: 'Aggressive pawn sacrifice for attacking chances' },
      { name: 'Frankenstein-Dracula', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nxe4', 'Qh5', 'Nd6', 'Bb3', 'Nc6', 'Nb5', 'g6', 'Qf3', 'f5', 'Qd5', 'Qe7'], description: 'Wild tactical variation with early Qh5' },
    ]
  },
  {
    id: 'pirc-defense',
    name: 'Pirc Defense',
    eco: 'B07',
    moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'f4', 'Bg7', 'Nf3', 'O-O', 'Bd3', 'Nc6', 'O-O', 'e5', 'fxe5', 'dxe5', 'd5'],
    fen: 'rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    description: 'A flexible hypermodern defense where Black develops the kingside bishop to g7 and attacks the center from afar.',
    difficulty: 'intermediate',
    category: 'e4',
    popularity: 70,
    winRate: { white: 38, draw: 29, black: 33 },
    keyIdeas: [
      'Fianchetto the dark-squared bishop',
      'Flexible pawn structure',
      'Counter-attack the center',
      'Can transpose to many systems'
    ],
    variations: [
      { name: 'Austrian Attack', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'f4', 'Bg7', 'Nf3', 'c5', 'Bb5+', 'Bd7', 'e5', 'Ng4', 'e6', 'fxe6', 'Ng5'], description: 'Aggressive f4 system with attacking intentions' },
      { name: 'Classical', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Nf3', 'Bg7', 'Be2', 'O-O', 'O-O', 'c6', 'a4', 'Nbd7', 'h3', 'e5'], description: 'Solid development allowing Black counterplay with ...e5' },
    ]
  },
]

export const PUZZLES: Puzzle[] = [
  // === EASY PUZZLES (Rating 400-600) ===
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
    id: 'p3',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['Re8#'],
    rating: 450,
    themes: ['mate', 'backRank'],
    title: 'Back Rank Mate',
    description: 'The king is trapped behind its own pawns. Find the back rank checkmate!',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p4',
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
    id: 'p5',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['Re8#'],
    rating: 500,
    themes: ['mate', 'backRank'],
    title: 'Simple Back Rank',
    description: 'Deliver checkmate on the back rank.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p6',
    fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 4 5',
    moves: ['O-O'],
    rating: 500,
    themes: ['development', 'castling'],
    title: 'Castle to Safety',
    description: 'What is the best move to get your king to safety while connecting your rooks?',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p7',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['Ng5'],
    rating: 550,
    themes: ['attack', 'threat'],
    title: 'Attack f7',
    description: 'Find the aggressive move that threatens the weak f7 pawn.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p8',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    moves: ['Bc4'],
    rating: 550,
    themes: ['development', 'opening'],
    title: 'Italian Opening',
    description: 'Find the best developing move that targets Black\'s weakness.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p9',
    fen: '4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1',
    moves: ['Qe7#'],
    rating: 500,
    themes: ['mate', 'queenMate'],
    title: 'Queen Mate',
    description: 'Use your queen to deliver checkmate.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p10',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1',
    moves: ['Qe8#'],
    rating: 550,
    themes: ['mate', 'backRank'],
    title: 'Queen Back Rank',
    description: 'Use your queen to exploit the back rank weakness.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p11',
    fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq d6 0 3',
    moves: ['Nxe5'],
    rating: 600,
    themes: ['tactic', 'capture'],
    title: 'Free Pawn',
    description: 'Capture the undefended pawn in the center.',
    difficulty: 'easy',
    xpReward: 10,
  },
  {
    id: 'p12',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    moves: ['a6'],
    rating: 600,
    themes: ['defense', 'kickBishop'],
    title: 'Kick the Bishop',
    description: 'Find the move that challenges White\'s strong bishop.',
    difficulty: 'easy',
    xpReward: 10,
  },

  // === MEDIUM PUZZLES (Rating 700-1000) ===
  {
    id: 'p13',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['Ng5', 'd5', 'exd5', 'Na5'],
    rating: 700,
    themes: ['attack', 'fried liver'],
    title: 'Fried Liver Setup',
    description: 'Begin the famous Fried Liver attack against Black.',
    difficulty: 'medium',
    xpReward: 15,
  },
  {
    id: 'p14',
    fen: 'r1bqr1k1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7',
    moves: ['Bg5', 'h6', 'Bxf6', 'Qxf6'],
    rating: 750,
    themes: ['pin', 'exchange'],
    title: 'Pin and Win',
    description: 'Use a pin to win material. Find the best sequence of moves.',
    difficulty: 'medium',
    xpReward: 15,
  },
  {
    id: 'p15',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
    moves: ['Bg5', 'h6', 'Bh4', 'g5', 'Bg3'],
    rating: 800,
    themes: ['development', 'pin'],
    title: 'Pin the Knight',
    description: 'Develop your bishop with a pin on the knight.',
    difficulty: 'medium',
    xpReward: 15,
  },
  {
    id: 'p16',
    fen: 'r2qk2r/ppp1bppp/2n2n2/3pp1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QK2R w KQkq - 4 6',
    moves: ['Bxf6', 'Bxf6', 'Bxd5'],
    rating: 850,
    themes: ['tactic', 'discovery'],
    title: 'Discovered Attack',
    description: 'Use a discovered attack to win a pawn and open lines.',
    difficulty: 'medium',
    xpReward: 20,
  },
  {
    id: 'p17',
    fen: 'r1bqk2r/ppp2ppp/2n2n2/3pp3/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 2 5',
    moves: ['a3', 'Bxc3+', 'bxc3'],
    rating: 850,
    themes: ['pawnStructure', 'exchange'],
    title: 'Bishop for Knight',
    description: 'Force Black to give up the bishop pair.',
    difficulty: 'medium',
    xpReward: 20,
  },
  {
    id: 'p18',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['d3', 'Nf6', 'Nc3', 'Be7', 'O-O'],
    rating: 750,
    themes: ['development', 'opening'],
    title: 'Quiet Development',
    description: 'Find the solid developing move in the Italian Game.',
    difficulty: 'medium',
    xpReward: 15,
  },
  {
    id: 'p19',
    fen: 'r1b1kb1r/ppppqppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 5',
    moves: ['O-O', 'd6', 'Re1'],
    rating: 800,
    themes: ['development', 'initiative'],
    title: 'Castle and Attack',
    description: 'Get your king to safety and prepare an attack.',
    difficulty: 'medium',
    xpReward: 15,
  },
  {
    id: 'p20',
    fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 6 5',
    moves: ['b4', 'Bb6', 'a4', 'a5', 'b5'],
    rating: 950,
    themes: ['strategy', 'pawnStorm'],
    title: 'Pawn Storm',
    description: 'Launch a queenside pawn storm to push back the enemy bishop.',
    difficulty: 'medium',
    xpReward: 20,
  },
  {
    id: 'p21',
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 0 7',
    moves: ['d4', 'exd4', 'cxd4', 'Bb4'],
    rating: 900,
    themes: ['center', 'pawnBreak'],
    title: 'Central Break',
    description: 'Open the center with a pawn break.',
    difficulty: 'medium',
    xpReward: 20,
  },
  {
    id: 'p22',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
    moves: ['d4', 'exd4', 'Nxd4', 'Bb4'],
    rating: 850,
    themes: ['opening', 'center'],
    title: 'Scotch Game',
    description: 'Play the aggressive Scotch Game opening.',
    difficulty: 'medium',
    xpReward: 15,
  },
  {
    id: 'p23',
    fen: 'r2qkb1r/ppp2ppp/2np1n2/4pb2/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w kq - 0 7',
    moves: ['Qe2', 'Be7', 'Rd1'],
    rating: 900,
    themes: ['development', 'preparation'],
    title: 'Prepare d4',
    description: 'Prepare the central pawn break d4.',
    difficulty: 'medium',
    xpReward: 20,
  },
  {
    id: 'p24',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
    moves: ['Nxe5', 'Nxe5', 'd4'],
    rating: 750,
    themes: ['tactic', 'fork'],
    title: 'Fork Trick',
    description: 'Win a pawn with a tactical trick.',
    difficulty: 'medium',
    xpReward: 15,
  },

  // === HARD PUZZLES (Rating 1100-1400) ===
  {
    id: 'p25',
    fen: 'r1b1k2r/pppp1ppp/2n2q2/2b1p1N1/2B1P3/3P4/PPP2PPP/RNBQK2R w KQkq - 5 6',
    moves: ['Nxh7', 'Qg6', 'Nf8', 'Kxf8', 'Bxf7'],
    rating: 1100,
    themes: ['sacrifice', 'attack'],
    title: 'Knight Sacrifice',
    description: 'Sacrifice the knight on h7 to win material!',
    difficulty: 'hard',
    xpReward: 30,
  },
  {
    id: 'p26',
    fen: 'r4rk1/ppp2ppp/2n5/3qp1B1/3P4/2P2N2/PP3PPP/R2QR1K1 w - - 0 12',
    moves: ['dxe5', 'Qd1', 'Raxd1', 'Nxe5', 'Nxe5'],
    rating: 1150,
    themes: ['tactic', 'removal'],
    title: 'Remove the Defender',
    description: 'Capture a key defender to win material.',
    difficulty: 'hard',
    xpReward: 30,
  },
  {
    id: 'p27',
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2BPP3/2N2N2/PPP2PPP/R1BQ1RK1 w - - 0 7',
    moves: ['d5', 'Nb8', 'Bg5', 'h6', 'Bh4'],
    rating: 1200,
    themes: ['strategy', 'space'],
    title: 'Space Advantage',
    description: 'Push d5 to gain a commanding space advantage in the center.',
    difficulty: 'hard',
    xpReward: 35,
  },
  {
    id: 'p28',
    fen: 'r1bq1rk1/pp1n1ppp/2pbpn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 8',
    moves: ['e4', 'dxe4', 'Nxe4', 'Nxe4', 'Bxe4'],
    rating: 1200,
    themes: ['center', 'opening'],
    title: 'Central Pawn Break',
    description: 'Find the thematic pawn break in the Queen\'s Gambit.',
    difficulty: 'hard',
    xpReward: 35,
  },
  {
    id: 'p29',
    fen: 'r2qk2r/ppp1bppp/2n1bn2/3p4/3P4/2N1BN2/PPPQBPPP/R3K2R w KQkq - 4 7',
    moves: ['O-O', 'O-O', 'Rac1', 'a6', 'Rfd1'],
    rating: 1250,
    themes: ['development', 'preparation'],
    title: 'Complete Development',
    description: 'Castle and develop your rooks to the center.',
    difficulty: 'hard',
    xpReward: 35,
  },
  {
    id: 'p30',
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 7',
    moves: ['a3', 'Ba5', 'b4', 'Bb6', 'c5'],
    rating: 1300,
    themes: ['strategy', 'queenside'],
    title: 'Queenside Expansion',
    description: 'Expand on the queenside to gain space.',
    difficulty: 'hard',
    xpReward: 40,
  },
  {
    id: 'p31',
    fen: 'r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 2 8',
    moves: ['Ne5', 'Nxe5', 'dxe5', 'Nd7', 'f4'],
    rating: 1300,
    themes: ['outpost', 'strategy'],
    title: 'Knight Outpost',
    description: 'Place your knight on a powerful outpost.',
    difficulty: 'hard',
    xpReward: 40,
  },
  {
    id: 'p32',
    fen: 'r1b2rk1/pp1nqppp/2p1pn2/3p4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8',
    moves: ['b3', 'b6', 'Bb2', 'Bb7', 'Qc2'],
    rating: 1250,
    themes: ['fianchetto', 'development'],
    title: 'Bishop Fianchetto',
    description: 'Fianchetto your bishop for long-term pressure.',
    difficulty: 'hard',
    xpReward: 35,
  },
  {
    id: 'p33',
    fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPPQBPPP/R3K2R w KQ - 0 9',
    moves: ['O-O-O', 'a6', 'f3', 'b5', 'g4'],
    rating: 1350,
    themes: ['attack', 'oppositeСastling'],
    title: 'Opposite Side Castling',
    description: 'Castle queenside and launch a kingside attack.',
    difficulty: 'hard',
    xpReward: 40,
  },
  {
    id: 'p34',
    fen: 'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/3PBN2/PPP2PPP/RN1QK2R w KQkq - 5 6',
    moves: ['Nbd2', 'd6', 'O-O', 'O-O', 'Re1'],
    rating: 1150,
    themes: ['development', 'prophylaxis'],
    title: 'Complete Development',
    description: 'Complete your development before attacking.',
    difficulty: 'hard',
    xpReward: 30,
  },
  {
    id: 'p35',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4',
    moves: ['d3', 'd6', 'O-O', 'O-O', 'Bg5'],
    rating: 1100,
    themes: ['opening', 'italianGame'],
    title: 'Italian Giuoco Piano',
    description: 'Play the quiet Italian Game setup.',
    difficulty: 'hard',
    xpReward: 30,
  },
  {
    id: 'p36',
    fen: 'rn1qkb1r/ppp1pppp/5n2/3p1b2/3P4/2N2N2/PPP1PPPP/R1BQKB1R w KQkq - 4 4',
    moves: ['Ne5', 'e6', 'g4', 'Bg6', 'h4'],
    rating: 1400,
    themes: ['attack', 'trompowsky'],
    title: 'Aggressive Trompowsky',
    description: 'Launch an aggressive kingside attack.',
    difficulty: 'hard',
    xpReward: 45,
  },

  // === EXPERT PUZZLES (Rating 1500+) ===
  {
    id: 'p37',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R3R1K1 w - - 0 1',
    moves: ['Re8#'],
    rating: 1500,
    themes: ['mate', 'backRank'],
    title: 'Back Rank Mate',
    description: 'Find the simple checkmate!',
    difficulty: 'expert',
    xpReward: 50,
  },
  {
    id: 'p38',
    fen: 'r1b2rk1/2q1bppp/p2p1n2/npp1p3/3PP3/2P2N1P/PPBN1PP1/R1BQR1K1 w - - 0 12',
    moves: ['d5', 'Nb7', 'Nf1', 'Bd7', 'Ne3', 'a5', 'Bd3'],
    rating: 1600,
    themes: ['strategy', 'maneuver'],
    title: 'Knight Maneuver',
    description: 'Find the best piece maneuver to improve your position.',
    difficulty: 'expert',
    xpReward: 55,
  },
  {
    id: 'p39',
    fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9',
    moves: ['O-O-O', 'a6', 'g4', 'b5', 'h4', 'h5', 'g5'],
    rating: 1650,
    themes: ['attack', 'yugoslav'],
    title: 'Yugoslav Attack',
    description: 'Execute the famous Yugoslav Attack in the Dragon.',
    difficulty: 'expert',
    xpReward: 60,
  },
  {
    id: 'p40',
    fen: 'r2qk2r/pp1nbppp/2p1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQkq - 2 8',
    moves: ['Qc2', 'O-O', 'O-O', 'dxc4', 'Bxc4', 'b5', 'Bd3'],
    rating: 1550,
    themes: ['opening', 'qgd'],
    title: 'QGD Mainline',
    description: 'Navigate the Queen\'s Gambit Declined mainline.',
    difficulty: 'expert',
    xpReward: 50,
  },
  {
    id: 'p41',
    fen: 'r1bqk2r/ppp2ppp/2n2n2/2bpp3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 5',
    moves: ['b4', 'Bb6', 'a4', 'a6', 'O-O', 'O-O', 'a5'],
    rating: 1700,
    themes: ['tactic', 'queenside'],
    title: 'Queenside Attack',
    description: 'Launch a queenside attack to trap the bishop.',
    difficulty: 'expert',
    xpReward: 65,
  },
  {
    id: 'p42',
    fen: 'r2q1rk1/pp1bbppp/2n1pn2/3p4/3P4/2NBPN2/PP2BPPP/R1BQ1RK1 w - - 4 9',
    moves: ['Ne5', 'Nxe5', 'dxe5', 'Bc5', 'Qc2', 'Qe7', 'f4'],
    rating: 1750,
    themes: ['strategy', 'outpost'],
    title: 'Central Control',
    description: 'Dominate the center with a strong knight.',
    difficulty: 'expert',
    xpReward: 70,
  },
  {
    id: 'p43',
    fen: 'r1b1k2r/pp1pqppp/2n1pn2/2p5/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 2 7',
    moves: ['d5', 'exd5', 'cxd5', 'Nb8', 'e4', 'Na6', 'O-O'],
    rating: 1600,
    themes: ['center', 'nimzo'],
    title: 'Nimzo Breakthrough',
    description: 'Execute the central break in the Nimzo-Indian.',
    difficulty: 'expert',
    xpReward: 55,
  },
  {
    id: 'p44',
    fen: 'r1bq1rk1/pppn1pbp/3p1np1/4p3/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 8',
    moves: ['d5', 'Nc5', 'Qc2', 'a5', 'Be3', 'Na6', 'Nd2'],
    rating: 1800,
    themes: ['strategy', 'kingsIndian'],
    title: 'King\'s Indian Plan',
    description: 'Find the correct plan against the King\'s Indian.',
    difficulty: 'expert',
    xpReward: 75,
  },
  {
    id: 'p45',
    fen: 'r2qr1k1/pp1nbppp/2p2n2/3p4/3P4/P1NBPN2/1P3PPP/R1BQR1K1 w - - 0 11',
    moves: ['Ne5', 'Nxe5', 'dxe5', 'Ng4', 'f4', 'f6', 'h3'],
    rating: 1650,
    themes: ['strategy', 'center'],
    title: 'Central Domination',
    description: 'Establish a strong center and push back enemy pieces.',
    difficulty: 'expert',
    xpReward: 60,
  },
  {
    id: 'p46',
    fen: 'rn1qkb1r/pp2pppp/2p2n2/3p1b2/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5',
    moves: ['cxd5', 'cxd5', 'Qb3', 'Qc7', 'Bf4', 'Qb6', 'Qxb6'],
    rating: 1550,
    themes: ['opening', 'slav'],
    title: 'Slav Exchange',
    description: 'Navigate the Exchange Slav correctly.',
    difficulty: 'expert',
    xpReward: 50,
  },
  {
    id: 'p47',
    fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2QK2R w KQ - 0 8',
    moves: ['Qd2', 'a6', 'O-O-O', 'b5', 'Bb3', 'Na5', 'Bh6'],
    rating: 1900,
    themes: ['attack', 'dragon'],
    title: 'Anti-Dragon',
    description: 'Launch a devastating attack against the Dragon.',
    difficulty: 'expert',
    xpReward: 80,
  },
  {
    id: 'p48',
    fen: 'r1bqk2r/pp1pppbp/2n2np1/2p5/2P5/2N2NP1/PP1PPPBP/R1BQK2R w KQkq - 4 5',
    moves: ['O-O', 'O-O', 'd3', 'd6', 'a3', 'a6', 'Rb1'],
    rating: 1500,
    themes: ['opening', 'english'],
    title: 'English Opening',
    description: 'Navigate the English Opening with proper development.',
    difficulty: 'expert',
    xpReward: 50,
  },
  {
    id: 'p49',
    fen: 'r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 2 8',
    moves: ['b3', 'Na5', 'Bb2', 'c5', 'Qc2', 'Rc8', 'Rac1'],
    rating: 1700,
    themes: ['fianchetto', 'qgd'],
    title: 'Catalan Setup',
    description: 'Play the Catalan-style fianchetto.',
    difficulty: 'expert',
    xpReward: 65,
  },
  {
    id: 'p50',
    fen: 'r1bq1rk1/pp1nppbp/2np2p1/2p5/2P1P3/2NP1NP1/PP3PBP/R1BQ1RK1 w - - 0 8',
    moves: ['d4', 'cxd4', 'Nxd4', 'Nxd4', 'Qxd4', 'Nc5', 'b3'],
    rating: 1850,
    themes: ['maroczy', 'center'],
    title: 'Maroczy Bind',
    description: 'Maintain the Maroczy Bind pawn structure.',
    difficulty: 'expert',
    xpReward: 75,
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
