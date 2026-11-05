import type { Lesson } from "../types";

/** Module 2 lesson: probability basics. */
export const lesson: Lesson = {
  intro: String.raw`Almost every probability question on the SIG test and in a trading interview is, underneath, a question about dice, coins, cards or balls in an urn. The surface changes (a trade that fills or does not, a client who shows up or does not), but the machinery is the same: write down what can happen, decide which outcomes are equally likely, and count. People who get these questions wrong rarely lack a formula. They skipped the first step and started multiplying.

This module gives you a small set of habits. Name the sample space before touching a number. Say out loud whether two events are independent, mutually exclusive, or neither, and know that these are not the same thing. Decide whether you are drawing with or without replacement. Look for a symmetry that lets you skip the arithmetic entirely. And when the randomness is continuous, turn the question into an area.

By the end you should be able to take any dice, coin, card or urn question, set it up in under a minute, and answer it by one of three routes: a direct count, a complement, or a symmetry. You should also be able to catch yourself when an answer cannot be right, which is worth more under time pressure than any single technique.`,
  cards: [
    {
      title: "Sample spaces and equally likely outcomes",
      body: String.raw`A sample space is the list of everything that can happen, written at a level of detail where each outcome is equally likely. For two dice that is 36 ordered pairs, not 11 totals and not 21 unordered pairs. For three coins it is 8 strings, not 4 head counts.

Once the outcomes are equally likely, probability is just a ratio: favourable outcomes over total outcomes. All the real work is in choosing the level of detail correctly.

- Dice rolled together are still distinguishable; label them.
- A biased coin breaks equal likelihood; then multiply per-flip probabilities instead of counting strings.
- If you cannot say why your outcomes are equally likely, they probably are not.`,
      formula: String.raw`P(E) = \frac{|E|}{|\Omega|} \quad \text{when every outcome in } \Omega \text{ is equally likely}`,
      example: "The pair {2, 5} is twice as likely as the pair {6, 6}: two ordered outcomes versus one.",
    },
    {
      title: "The three rules you actually use",
      body: String.raw`Probability has three axioms, and in plain words they are: every probability is between 0 and 1; something in the sample space happens, so the whole space has probability 1; and if two events cannot both happen, the probability that one or the other happens is the sum.

Everything else is derived. In practice you use three consequences constantly: the complement rule, the union rule for two events, and the fact that probabilities of a partition add to 1 (which is how you sanity-check a table of cases).

- Complement: $P(\text{not } A) = 1 - P(A)$.
- Union: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; the subtraction disappears only when $A$ and $B$ are disjoint.
- Partition: if the cases cover everything exactly once, their probabilities sum to 1.`,
      formula: String.raw`P(A \cup B) = P(A) + P(B) - P(A \cap B)`,
      example: "Face card or spade: 12/52 + 13/52 - 3/52, because three cards are both.",
    },
    {
      title: "Complements and 'at least one'",
      body: String.raw`The words "at least one" are an instruction to compute the probability of "none" and subtract from 1. Direct counting of "one or two or three ..." is slow and error-prone; "none" is a single event, and for independent trials it is a product.

The same trick handles "at most" versus "more than" and any event whose opposite is simpler. Before counting anything, ask which side of the fence is smaller.

- At least one six in four dice: $1 - (5/6)^4$.
- At least one double in three throws of a pair: $1 - (5/6)^3$.
- Both a 1 and a 6 among three dice: the complement is "no 1 or no 6", a union of two easy events.`,
      formula: String.raw`P(\text{at least one}) = 1 - P(\text{none}) = 1 - \prod_i (1 - p_i)`,
      example: "Three flips of a coin with P(H) = 0.3: at least one head is 1 - 0.7^3 = 0.657.",
    },
    {
      title: "Independence is not the same as disjointness",
      body: String.raw`Two events are **independent** when knowing one happened does not change the probability of the other: $P(A \cap B) = P(A)P(B)$. Two events are **mutually exclusive** (disjoint) when they cannot both happen: $P(A \cap B) = 0$. People conflate these because both sound like "unrelated", but they are close to opposites. Disjoint events with positive probability are always dependent, since one happening rules the other out.

Independence is a numerical test, not a feeling. "Total is 7" is independent of "first die is even"; "total is 8" is not. You cannot tell by looking; you multiply and compare.

For three or more events, pairwise independence is not enough. Mutual independence requires every sub-collection to factor, including the full set. "Total is 7", "red die is 3" and "blue die is 4" are independent in pairs, yet knowing two of them fixes the third.`,
      formula: String.raw`A \perp B \iff P(A \cap B) = P(A)\,P(B) \qquad A, B \text{ disjoint} \iff P(A \cap B) = 0`,
      example: "Sum is 5 and sum is 9: disjoint, both positive, therefore dependent.",
    },
    {
      title: "With versus without replacement",
      body: String.raw`With replacement, every draw sees the same population and the draws are independent: multiply identical fractions. Without replacement, the population shrinks and shifts: multiply fractions whose numerators and denominators both change, or count subsets directly with binomial coefficients.

The two versions differ in a predictable direction. Without replacement makes repeating a colour or a rank harder (the matching items are gone) and makes mixtures easier. The numerators often coincide; it is the denominators that separate them.

- Both green from 4 red and 6 green: $(6/10)^2$ with, $(6/10)(5/9)$ without.
- Three distinct ranks from a deck: $\frac{48}{51}\cdot\frac{44}{50}$ without, $\frac{48}{52}\cdot\frac{44}{52}$ with.
- Hypergeometric form for a without-replacement count: $\binom{g}{k}\binom{n - g}{m - k} / \binom{n}{m}$.`,
      formula: String.raw`P(\text{all } m \text{ draws green}) = \left(\frac{g}{n}\right)^m \text{ (with)} \qquad = \frac{\binom{g}{m}}{\binom{n}{m}} \text{ (without)}`,
      example: "Removing a green token makes the next green less likely, so two greens are rarer without replacement.",
    },
    {
      title: "The symmetry principle",
      body: String.raw`When a question depends only on the relative order of a few items, and the randomness treats those items alike, every relative order is equally likely. Then the probability that a given item is first among $k$ is $1/k$, and the probability that it sits in any particular relative slot is also $1/k$.

Drawing without replacement until an urn is empty is the same as laying all the items in a random row. That single picture answers a whole family of questions: the $k$-th ball is red with the same probability as the first; the last ball is blue with probability (blue count)/(total); the first white ball's position has an explicit distribution.

- Ace of spades before all four kings: five relevant cards, $1/5$.
- Ninth ball red from 5 red and 7 blue: $5/12$, same as the first.
- Players drawing alternately: the first player wins when the first marked item sits at an odd position in the row.`,
      formula: String.raw`P(\text{item } i \text{ is first among } k \text{ exchangeable items}) = \frac{1}{k}`,
      example: "Eight runners, uniformly random finish: Maya beats both Noor and Omar with probability 1/3.",
    },
    {
      title: "Geometric probability is area",
      body: String.raw`When a point is chosen uniformly on a segment, probabilities are lengths. When two independent uniform choices are made, the pair is a uniform point in a rectangle and probabilities are areas. Draw the square, shade the event, measure.

Conditions like "they arrive within 15 minutes of each other" become a band around the diagonal; "the distance exceeds $d$" leaves two corner triangles; "three pieces form a triangle" becomes a set of half-plane cuts. Asymmetric conditions give triangles of different sizes, so compute each corner from its own leg length.

When one coordinate is chosen first and the second depends on it, slice: fix the first coordinate, solve the one-dimensional problem, and integrate against the right density.`,
      formula: String.raw`P(|X - Y| \le d) = 1 - \left(1 - \frac{d}{L}\right)^2 \quad \text{for independent } X, Y \sim U[0, L]`,
      example: "Two points on a rod of length 10 are more than 4 apart with probability (6/10)^2 = 0.36.",
    },
    {
      title: "Sanity-check your answer",
      body: String.raw`Before you say a number, spend ten seconds attacking it. Is it between 0 and 1? Does it move the right way when you nudge a parameter (more dice should make "at least one six" more likely)? Does a limiting case agree (zero wait time should give zero meeting probability)?

Then do one of three cheap cross-checks: compute the complement and see that the two add to 1; redo the count in the other order (ordered versus unordered, both numerator and denominator); or check a tiny case by hand (two flips instead of eight).

- A probability above 1/2 for an event that needs several rare things to happen is suspicious.
- If "with replacement" and "without replacement" came out identical, you probably forgot to update the urn.
- If a symmetry argument and a direct count disagree, the direct count usually has a double-counting error, but check both.`,
      formula: String.raw`P(A) + P(\text{not } A) = 1`,
      example: "Longest run exactly 3 in eight flips came out as 47/128; at most 2 (68/256) plus at least 4 (94/256) plus exactly 3 (94/256) must sum to 1. It does.",
    },
  ],
  workedExamples: [
    {
      title: "Exactly one pair from a custom deck",
      prompt: String.raw`A deck has nine cards: three ranks, each in three colours. You draw three without replacement. What is the probability that exactly two cards share a rank and the third has a different rank?`,
      steps: [
        {
          text: "Choose the sample space: unordered three-card hands, all equally likely because the draws are uniform without replacement.",
          math: String.raw`|\Omega| = \binom{9}{3} = 84`,
        },
        {
          text: "Construct a favourable hand step by step: pick the paired rank, pick two of its three cards, pick the odd card from the other two ranks.",
          math: String.raw`3 \cdot \binom{3}{2} \cdot 6 = 54`,
        },
        {
          text: "Divide and reduce.",
          math: String.raw`P = \frac{54}{84} = \frac{9}{14} \approx 0.643`,
        },
        {
          text: "Sanity check with a partition of all hands: three of a kind (3) plus all-different ranks (27) plus one pair (54) must give 84.",
          math: String.raw`3 + 27 + 54 = 84 \checkmark`,
        },
      ],
      answer: String.raw`\frac{9}{14} \approx 0.643`,
    },
    {
      title: "Taking turns for a gold coin",
      prompt: String.raw`A pouch holds 2 gold and 6 copper coins. Two players alternate drawing without replacement; the first to draw gold wins. What is the first player's winning probability?`,
      steps: [
        {
          text: "Reframe: drawing everything without replacement is a uniformly random row of eight coins, and the first player owns the odd positions.",
        },
        {
          text: "The two gold positions are a uniformly random pair; the first gold is at position k when the other gold is one of the 8 - k later positions.",
          math: String.raw`P(\text{first gold at } k) = \frac{8 - k}{\binom{8}{2}} = \frac{8 - k}{28}`,
        },
        {
          text: "Sum over the first player's positions 1, 3, 5, 7.",
          math: String.raw`\frac{7 + 5 + 3 + 1}{28} = \frac{16}{28} = \frac{4}{7}`,
        },
        {
          text: "Check: the second player's even positions give (6 + 4 + 2)/28 = 3/7, and the two add to 1. Moving first is worth about 14 percentage points here.",
        },
      ],
      answer: String.raw`\frac{4}{7} \approx 0.571`,
    },
  ],
  tryIt: {
    prompt: String.raw`A point is chosen uniformly at random inside a square of side 2. What is the probability that it lies within distance 1 of the centre of the square?`,
    answer: { type: "numeric", value: Math.PI / 4, exact: String.raw`\frac{\pi \cdot 1^2}{2^2} = \frac{\pi}{4} \approx 0.785` },
    solution: String.raw`Uniform in a region means probability is proportional to area. The square has area $2 \times 2 = 4$. The points within distance 1 of the centre form a disc of radius 1, which fits exactly inside the square (it touches the midpoint of each side), so none of it is cut off. Its area is $\pi \cdot 1^2 = \pi$.

The probability is $\frac{\pi}{4} \approx 0.785$.

Sanity check: the disc misses only the four corners of the square, and the corners look small, so an answer a bit under 0.8 is reasonable. Had the radius been larger than 1, parts of the disc would fall outside the square and you would need to subtract the clipped segments; always check the inscribed shape actually fits.`,
  },
  checkIds: ["m2-lc1", "m2-lc2", "m2-lc3", "m2-lc4"],
  formulas: [
    { name: "Equally likely outcomes", latex: String.raw`P(E) = \frac{|E|}{|\Omega|}`, note: "Only after you have chosen outcomes that really are equally likely (ordered dice, flip strings)." },
    { name: "Complement", latex: String.raw`P(A^c) = 1 - P(A)`, note: "The route for 'at least one', 'at most', and anything whose opposite is a single event." },
    { name: "Union of two events", latex: String.raw`P(A \cup B) = P(A) + P(B) - P(A \cap B)`, note: "Drop the last term only when the events are disjoint." },
    { name: "Independence", latex: String.raw`P(A \cap B) = P(A)\,P(B)`, note: "A test, not a feeling. For three events, every pair and the triple must factor." },
    { name: "At least one success in n independent trials", latex: String.raw`1 - \prod_{i=1}^{n} (1 - p_i)`, note: "Equal p: 1 - (1 - p)^n. Equal expected counts do not mean equal 'at least one' probabilities." },
    { name: "Exactly k of n", latex: String.raw`\binom{n}{k} p^k (1 - p)^{n - k}`, note: "Pattern probability times the number of positions for the k successes." },
    { name: "Maximum and minimum of n dice", latex: String.raw`P(\max \le k) = \left(\frac{k}{6}\right)^n, \quad P(\min \ge k) = \left(\frac{7 - k}{6}\right)^n`, note: "Exactly k: subtract consecutive values, e.g. P(max = k) = P(max <= k) - P(max <= k - 1)." },
    { name: "Two-dice totals", latex: String.raw`P(\text{total} = s) = \frac{6 - |s - 7|}{36}`, note: "Totals 2..12 have counts 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1." },
    { name: "Without replacement (hypergeometric)", latex: String.raw`P(k \text{ marked in } m \text{ draws}) = \frac{\binom{g}{k}\binom{n - g}{m - k}}{\binom{n}{m}}`, note: "g marked items among n; or multiply the changing fractions draw by draw." },
    { name: "Symmetry of positions", latex: String.raw`P(\text{item is first among } k) = \frac{1}{k}, \quad P(k\text{-th draw is red}) = P(\text{first draw is red})`, note: "Drawing without replacement is a random row; position labels carry no information." },
    { name: "First marked item at position k", latex: String.raw`P(\text{first of } g \text{ marked at position } k) = \frac{\binom{n - k}{g - 1}}{\binom{n}{g}}`, note: "n items in a random row, g marked. Decreasing in k: position 1 is the single most likely spot." },
    { name: "Meeting within a window", latex: String.raw`P(|X - Y| \le d) = 1 - \left(1 - \frac{d}{L}\right)^2`, note: "X, Y independent uniform on [0, L]. Asymmetric waits a and b: 1 - ((L - a)^2 + (L - b)^2) / (2 L^2)." },
  ],
  outro: String.raw`On the SIG-style test these ideas appear as fast, clean questions: a two-dice total, a run in a few flips, two cards with a shared property, an urn drawn with or without replacement. The time pressure is the real difficulty. Your edge is the setup habit: say the sample space, decide between count, complement and symmetry, and move. Aim to recognise which route a question wants within ten seconds.

In a live interview the same material arrives with a follow-up attached. You give 5/12 for the ninth ball and the interviewer asks what changes if you also know the first ball was blue; you give 1/5 for the ace before the kings and they ask for the probability it lands between the second and third king. They are checking whether your answer came from understanding or from a memorised number. Explain the symmetry or the sample space as you go, state the independence assumption you are using, and do the one sanity check out loud.

Next, practise the module's problems in order of difficulty, then redo the ones you missed with the fast path only. Module 3 builds directly on this: conditional probability is nothing more than shrinking the sample space to the outcomes consistent with what you learned, and the people who are fast at Bayes are the people who are fast at writing down sample spaces.`,
};
