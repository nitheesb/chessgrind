/**
 * Structured chess lessons with interactive positions.
 * Each lesson is a course with chapters; each chapter has steps.
 * Steps can be: 'text' (explanation), 'position' (show a board), or 'task' (user must play a move).
 */

export interface LessonStep {
  type: 'text' | 'position' | 'task'
  /** Markdown-lite text shown to the user */
  text: string
  /** FEN to display (for 'position' and 'task') */
  fen?: string
  /** For 'task': expected move in SAN */
  expectedMove?: string
  /** For 'task': hint shown after wrong attempt */
  hint?: string
  /** Arrows to draw: [[from, to], ...] */
  arrows?: [string, string][]
  /** Highlighted squares */
  highlights?: string[]
}

export interface LessonChapter {
  id: string
  title: string
  steps: LessonStep[]
}

export interface Lesson {
  id: string
  title: string
  description: string
  category: 'tactics' | 'endgame' | 'strategy' | 'fundamentals'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  chapters: LessonChapter[]
  xpReward: number
}

// =============================================
// COURSE 1: TACTICS 101
// =============================================

const tactics101: Lesson = {
  id: 'tactics-101',
  title: 'Tactics 101',
  description: 'Learn the fundamental tactical patterns that win games.',
  category: 'tactics',
  difficulty: 'beginner',
  xpReward: 50,
  chapters: [
    {
      id: 'forks',
      title: 'The Fork',
      steps: [
        {
          type: 'text',
          text: 'A **fork** is when one piece attacks two or more enemy pieces simultaneously. The opponent can only save one, so you win material.',
        },
        {
          type: 'position',
          text: 'Here the knight on e5 forks the king on d7 and rook on f3. Black must move the king, and White wins the rook.',
          fen: '8/3k4/8/4N3/8/5r2/8/4K3 w - - 0 1',
          arrows: [['e5', 'd7'], ['e5', 'f3']],
        },
        {
          type: 'text',
          text: 'Knights are the best forking pieces because they can attack in 8 directions and cannot be blocked. But any piece can fork!',
        },
        {
          type: 'position',
          text: 'Queens are powerful forkers. This queen attacks both the king and the undefended rook.',
          fen: '4k3/8/8/8/8/1Q6/8/4K3 w - - 0 1',
          arrows: [['b3', 'e6'], ['b3', 'b8']],
        },
        {
          type: 'task',
          text: 'Your turn! Find the knight fork that attacks the king and queen.',
          fen: 'r1bqk2r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
          expectedMove: 'Qxf7+',
          hint: 'The queen can land on a square attacking both the king and another piece.',
        },
        {
          type: 'task',
          text: 'Find the knight fork!',
          fen: '5k2/8/8/3N4/8/8/5q2/4K3 w - - 0 1',
          expectedMove: 'Ne7',
          hint: 'Move the knight to attack both the king and the queen.',
        },
      ],
    },
    {
      id: 'pins',
      title: 'The Pin',
      steps: [
        {
          type: 'text',
          text: 'A **pin** occurs when a piece cannot move because it would expose a more valuable piece behind it to attack. The pinned piece is stuck.',
        },
        {
          type: 'position',
          text: 'The bishop on g5 pins the knight on f6 to the queen on d8. If the knight moves, the queen is lost.',
          fen: 'r1bqkb1r/pppppppp/2n2n2/6B1/4P3/5N2/PPPP1PPP/RN1QKB1R b KQkq - 0 1',
          arrows: [['g5', 'f6'], ['g5', 'd8']],
        },
        {
          type: 'text',
          text: 'An **absolute pin** is against the king — the pinned piece literally cannot move (it would be illegal). A **relative pin** is against another piece — moving is legal but loses material.',
        },
        {
          type: 'task',
          text: 'Pin the knight to the king with your bishop.',
          fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/2B1P1b1/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
          expectedMove: 'Bg5',
          hint: 'Place the bishop on a diagonal that skewers the knight and the queen.',
        },
      ],
    },
    {
      id: 'skewers',
      title: 'The Skewer',
      steps: [
        {
          type: 'text',
          text: 'A **skewer** is the reverse of a pin. You attack a valuable piece, and when it moves, you capture the less valuable piece behind it.',
        },
        {
          type: 'position',
          text: 'The rook attacks the king. When the king moves, the rook captures the queen behind it.',
          fen: '8/8/8/8/8/4k3/8/R3K2q w Q - 0 1',
          arrows: [['a1', 'e1']],
        },
        {
          type: 'task',
          text: 'Find the skewer! Attack the king to win the queen behind it.',
          fen: '8/8/2k5/8/8/8/5q2/2R1K3 w - - 0 1',
          expectedMove: 'Rc6+',
          hint: 'Place the rook on the same line as the king and queen.',
        },
      ],
    },
    {
      id: 'discovered-attacks',
      title: 'Discovered Attack',
      steps: [
        {
          type: 'text',
          text: 'A **discovered attack** happens when you move one piece to reveal an attack by another piece behind it. The moving piece can also create its own threat, making it a double attack.',
        },
        {
          type: 'position',
          text: 'When the knight moves, it reveals a bishop attack on the rook. If the knight also gives check, the opponent loses the rook for free.',
          fen: '4k3/8/1r6/8/3N4/2B5/8/4K3 w - - 0 1',
          arrows: [['d4', 'e6'], ['c3', 'b2']],
        },
        {
          type: 'task',
          text: 'Find the discovered attack! Move a piece to reveal an attack on the queen.',
          fen: '4k3/8/4q3/8/3B4/4N3/8/4K3 w - - 0 1',
          expectedMove: 'Nf5',
          hint: 'Move the knight to discover an attack from the bishop.',
        },
      ],
    },
    {
      id: 'back-rank-mate',
      title: 'Back Rank Mate',
      steps: [
        {
          type: 'text',
          text: 'A **back rank mate** happens when a rook or queen delivers checkmate on the last rank because the king is trapped by its own pawns.',
        },
        {
          type: 'position',
          text: 'The white rook delivers checkmate. The black king cannot escape because its own pawns block the second rank.',
          fen: '6k1/5ppp/8/8/8/8/8/R3K3 w Q - 0 1',
          arrows: [['a1', 'a8']],
        },
        {
          type: 'task',
          text: 'Deliver the back rank checkmate!',
          fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
          expectedMove: 'Ra8#',
          hint: 'Move the rook to the 8th rank.',
        },
        {
          type: 'text',
          text: 'To prevent back rank mates, create a **luft** (escape square) by advancing one pawn (like h3 or g3). This gives your king an escape route.',
        },
      ],
    },
  ],
}

// =============================================
// COURSE 2: ENDGAME ESSENTIALS
// =============================================

const endgameEssentials: Lesson = {
  id: 'endgame-essentials',
  title: 'Endgame Essentials',
  description: 'Master the critical endgame techniques every player must know.',
  category: 'endgame',
  difficulty: 'beginner',
  xpReward: 50,
  chapters: [
    {
      id: 'king-activity',
      title: 'King Activity',
      steps: [
        {
          type: 'text',
          text: 'In the endgame, the king transforms from a piece needing protection into a powerful attacker. **Centralizing your king** is usually the first priority.',
        },
        {
          type: 'position',
          text: 'The centralized king on d4 controls key squares and supports pawn advances. The black king on h8 is far from the action.',
          fen: '7k/8/8/8/3K4/8/4P3/8 w - - 0 1',
          highlights: ['d4', 'c5', 'd5', 'e5', 'c3', 'd3', 'e3'],
        },
        {
          type: 'task',
          text: 'Bring your king towards the center!',
          fen: '8/8/8/3p4/8/8/8/4K3 w - - 0 1',
          expectedMove: 'Kd2',
          hint: 'Move the king towards the center and the passed pawn.',
        },
      ],
    },
    {
      id: 'opposition',
      title: 'The Opposition',
      steps: [
        {
          type: 'text',
          text: 'The **opposition** is when two kings face each other with one square between them. The player NOT to move has the opposition and can block the enemy king.',
        },
        {
          type: 'position',
          text: 'White has the opposition (Black to move). Black must give way, and White can advance the pawn.',
          fen: '8/8/4k3/8/4K3/4P3/8/8 b - - 0 1',
          arrows: [['e4', 'e6']],
        },
        {
          type: 'text',
          text: 'When your king is in front of your pawn with the opposition, you can force promotion. Without it, the game is typically drawn.',
        },
        {
          type: 'task',
          text: 'Take the opposition to control the queening square.',
          fen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1',
          expectedMove: 'Kf3',
          hint: 'Move your king directly in front of the enemy king, one square apart.',
        },
      ],
    },
    {
      id: 'kp-vs-k',
      title: 'King + Pawn vs King',
      steps: [
        {
          type: 'text',
          text: 'This is the most fundamental endgame. The key rule: **if the attacking king is in front of the pawn with the opposition, it wins. Otherwise, it draws.**',
        },
        {
          type: 'position',
          text: 'White wins because the king is in front of the pawn and has the opposition.',
          fen: '8/8/3k4/8/3K4/3P4/8/8 w - - 0 1',
          highlights: ['d4'],
        },
        {
          type: 'task',
          text: 'Advance your king to get in front of the pawn.',
          fen: '8/8/8/8/4k3/8/3PK3/8 w - - 0 1',
          expectedMove: 'Ke3',
          hint: 'Your king needs to get ahead of the pawn.',
        },
        {
          type: 'text',
          text: 'Special case: **rook pawns** (a/h file) often draw even with the king in front, because the defending king can hide in the corner.',
        },
      ],
    },
    {
      id: 'rook-endgames',
      title: 'Rook Endgame Basics',
      steps: [
        {
          type: 'text',
          text: 'Rook endgames are the most common endgames. Key principle: **rooks belong behind passed pawns** — your own or your opponent\'s.',
        },
        {
          type: 'position',
          text: 'White\'s rook is behind its passed pawn. As the pawn advances, the rook\'s activity increases. Black\'s rook is passive, forced to block.',
          fen: '8/8/8/8/3Pr3/8/8/R3K2k w Q - 0 1',
          arrows: [['a1', 'a8'], ['d4', 'd8']],
        },
        {
          type: 'text',
          text: 'The **Lucena position** is a winning technique when your pawn is on the 7th rank with the king in front. Build a "bridge" with your rook to shield the king from checks.',
        },
        {
          type: 'text',
          text: 'The **Philidor position** is the key defensive technique: keep your rook on the 6th rank until the pawn advances, then move to the 1st rank to give checks from behind.',
        },
      ],
    },
    {
      id: 'pawn-promotion',
      title: 'Pawn Race',
      steps: [
        {
          type: 'text',
          text: 'When both sides have passed pawns racing to promote, **count the moves**. Whoever queens first with check (or can stop the opponent\'s pawn) wins.',
        },
        {
          type: 'position',
          text: 'Both pawns race to promote. White\'s pawn is closer. Count: White queens in 4 moves, Black in 5.',
          fen: '8/p7/8/8/8/8/4P3/8 w - - 0 1',
        },
        {
          type: 'task',
          text: 'Start the pawn race! Push your pawn forward.',
          fen: '8/p7/8/8/8/8/4P3/4K3 w - - 0 1',
          expectedMove: 'e4',
          hint: 'Push the pawn two squares to start the race.',
        },
        {
          type: 'text',
          text: 'Remember: a pawn on the 2nd rank needs 5 moves to queen (if it can start with a double push). A pawn on the 3rd rank needs 5. On the 4th, 4 moves. On the 5th, 3 moves, etc.',
        },
      ],
    },
  ],
}

// =============================================
// COURSE 3: STRATEGIC THINKING
// =============================================

const strategicThinking: Lesson = {
  id: 'strategic-thinking',
  title: 'Strategic Thinking',
  description: 'Develop positional understanding and long-term planning.',
  category: 'strategy',
  difficulty: 'intermediate',
  xpReward: 60,
  chapters: [
    {
      id: 'pawn-structure',
      title: 'Pawn Structure',
      steps: [
        {
          type: 'text',
          text: 'Pawns are the soul of chess. Your **pawn structure** determines which squares are strong, which pieces are good, and where to attack.',
        },
        {
          type: 'position',
          text: 'White has an **isolated d-pawn**. It cannot be defended by other pawns. But it controls key central squares (c5, e5) and the pieces are active.',
          fen: 'r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2PBPN2/PP3PPP/R1BQ1RK1 w - - 0 1',
          highlights: ['d4', 'c5', 'e5'],
        },
        {
          type: 'text',
          text: '**Doubled pawns** are on the same file. They can be weak (hard to defend) but also control more squares. **Backward pawns** cannot advance without being captured.',
        },
        {
          type: 'text',
          text: 'A **passed pawn** has no opposing pawns that can block or capture it. Passed pawns must be pushed! In the endgame, they are often decisive.',
        },
      ],
    },
    {
      id: 'piece-activity',
      title: 'Piece Activity',
      steps: [
        {
          type: 'text',
          text: 'A piece is "active" when it controls important squares or has many available moves. An active piece is worth more than a passive one.',
        },
        {
          type: 'text',
          text: '**Good bishop vs bad bishop**: A bishop is "good" when most of your pawns are on the opposite color. A "bad" bishop is blocked by its own pawns.',
        },
        {
          type: 'position',
          text: 'White\'s bishop is "good" (pawns on dark squares, bishop on light). Black\'s bishop is "bad" (pawns on same color, blocking its own bishop).',
          fen: '8/pp2bppp/2p5/4p3/4P3/2P5/PP2BPPP/8 w - - 0 1',
          highlights: ['e2'],
        },
        {
          type: 'text',
          text: '**Knights love outposts**: A knight is strongest on a central square where it cannot be attacked by enemy pawns. Knights on the 5th rank supported by a pawn are very powerful.',
        },
      ],
    },
    {
      id: 'weak-squares',
      title: 'Weak Squares',
      steps: [
        {
          type: 'text',
          text: 'A **weak square** is one that cannot be defended by a pawn. Once a pawn moves, the squares it used to control become weak. Occupy weak squares with pieces!',
        },
        {
          type: 'position',
          text: 'After ...f5, the e6 and g6 squares became weak because no black pawn can guard them. White should aim to occupy these squares.',
          fen: 'rnbqkbnr/pppp2pp/8/4pp2/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
          highlights: ['e6', 'g6'],
        },
        {
          type: 'text',
          text: 'The square **f7** (and f2 for White) is naturally weak at the start of the game because it is only defended by the king. Many tactical motifs exploit this weakness.',
        },
      ],
    },
  ],
}

// =============================================
// COURSE 4: CHESS FUNDAMENTALS
// =============================================

const chessFundamentals: Lesson = {
  id: 'chess-fundamentals',
  title: 'Chess Fundamentals',
  description: 'The essential principles every chess player needs.',
  category: 'fundamentals',
  difficulty: 'beginner',
  xpReward: 40,
  chapters: [
    {
      id: 'opening-principles',
      title: 'Opening Principles',
      steps: [
        {
          type: 'text',
          text: 'The opening has three goals: **control the center**, **develop your pieces**, and **castle for king safety**. Follow these principles and you will start every game well.',
        },
        {
          type: 'text',
          text: '1. **Control the center** with pawns (e4, d4) or pieces. Central pieces have more mobility and influence.',
        },
        {
          type: 'task',
          text: 'Open the game by controlling the center.',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          expectedMove: 'e4',
          hint: 'Push a central pawn to take control.',
        },
        {
          type: 'text',
          text: '2. **Develop pieces quickly**. Move each piece once before moving any piece twice. Knights before bishops is a common guideline.',
        },
        {
          type: 'text',
          text: '3. **Castle early** to tuck the king to safety and connect the rooks. Keeping the king in the center is dangerous.',
        },
        {
          type: 'text',
          text: 'Avoid these common mistakes: moving the same piece twice in the opening, bringing the queen out too early, making too many pawn moves, neglecting development.',
        },
      ],
    },
    {
      id: 'piece-values',
      title: 'Piece Values',
      steps: [
        {
          type: 'text',
          text: 'Each piece has an approximate value: **Pawn = 1**, **Knight = 3**, **Bishop = 3**, **Rook = 5**, **Queen = 9**. The king is invaluable.',
        },
        {
          type: 'text',
          text: 'Use these values to evaluate exchanges. Trading a knight (3) for a rook (5) gains 2 points of material. This is called "winning the exchange".',
        },
        {
          type: 'text',
          text: 'Two bishops together (the "bishop pair") are slightly stronger than bishop + knight in open positions. In closed positions, knights may be better.',
        },
        {
          type: 'text',
          text: 'Material is important, but not everything. A piece with no moves (trapped) is worth less. A well-placed knight can be better than a passive rook.',
        },
      ],
    },
    {
      id: 'checkmate-patterns',
      title: 'Basic Checkmates',
      steps: [
        {
          type: 'text',
          text: 'Knowing basic checkmate patterns is essential. Let\'s learn the most common ones.',
        },
        {
          type: 'position',
          text: '**Scholar\'s Mate** (4-move checkmate): Qh5, Bc4, Qxf7#. While easy to defend against, it teaches about the f7 weakness.',
          fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1',
        },
        {
          type: 'task',
          text: 'Deliver checkmate with the queen and bishop!',
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
          expectedMove: 'Qxf7#',
          hint: 'The f7 square is only defended by the king.',
        },
        {
          type: 'text',
          text: '**Smothered Mate**: A knight delivers checkmate when the king is surrounded by its own pieces and cannot escape. Beautiful and common in blitz!',
        },
        {
          type: 'position',
          text: 'The knight on f7 delivers smothered mate. The king has no escape squares.',
          fen: '5rk1/5pNp/8/8/8/8/8/4K3 b - - 0 1',
          highlights: ['g8', 'f7'],
        },
      ],
    },
  ],
}

export const LESSONS: Lesson[] = [
  chessFundamentals,
  tactics101,
  endgameEssentials,
  strategicThinking,
]

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find(l => l.id === id)
}
