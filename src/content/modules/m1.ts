import type { Lesson } from "../types";

/** Module 1 lesson: Counting and complements. */
export const lesson: Lesson = {
  intro: String.raw`Almost every probability question on a trading assessment is a counting question wearing a disguise. "What is the chance the panel has at least three quants?" is really "how many panels are there, and how many of them have at least three quants?" Get the two counts right and the probability is a division. Get one of them wrong and no amount of probability theory will rescue you. That is why this module comes first.

The toolkit is small. You multiply options when a choice happens in stages. You count ordered selections with permutations and unordered ones with combinations, and you learn to ask the one question that decides between them. You spread identical items into bins with stars and bars. Then come the three moves that turn hard problems into easy ones: counting the complement when you see "at least one", inclusion-exclusion when events overlap, and the derangement and birthday patterns that keep reappearing with new names.

By the end you will be able to look at a counting question, name which of these tools it needs within a few seconds, and carry out the count under a clock without double counting. The practice set is built so that every tool appears in at least two framings, and the hard problems combine two tools at once, the way interviewers do.`,

  cards: [
    {
      title: "The multiplication rule",
      body: String.raw`When a choice is made in stages and the number of options at each stage does not depend on which options were taken earlier, the total number of outcomes is the product of the stage counts.

- Repeats allowed: $k$ slots with $n$ options each give $n^k$ (a 4-digit PIN: $10^4$).
- Repeats forbidden: the options shrink by one each stage, $n(n-1)(n-2)\cdots$.

The rule fails when a later stage depends on an earlier choice in a way that changes the *number* of options. If that happens, split into cases first and add the case counts.`,
      formula: String.raw`N = n_1 \cdot n_2 \cdots n_k`,
      example: "A letter followed by two digits, repeats allowed: 26 times 10 times 10 = 2600 handles.",
    },
    {
      title: "Permutations: when order matters",
      body: String.raw`An ordered selection of $k$ items from $n$ distinct items is a permutation: $P(n,k) = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}$. All $n$ items in a row: $n!$.

- **Round table.** Rotations are the same seating, so pin one person and arrange the rest: $(n-1)!$. Do not halve for reflections unless the problem says mirror images are identical.
- **Identical items.** Repeated items make $n!$ overcount; divide by the factorial of each repeat count: $\frac{n!}{n_1!\,n_2!\cdots}$. Four buys, two sells, one cancel: $\frac{7!}{4!\,2!} = 105$.
- **Blocks and gaps.** Items that must be adjacent are glued into one block (then multiply by the block's internal orders). Items that must *not* be adjacent go into distinct gaps between the free items: arrange the free items, choose gaps, order the restricted items.`,
      formula: String.raw`P(n,k) = \frac{n!}{(n-k)!}, \qquad \text{circular: } (n-1)!, \qquad \text{multiset: } \frac{n!}{n_1!\,n_2!\cdots n_r!}`,
      example: "Seven in a row with three new hires never adjacent: 4! (free people) times C(5,3) (gaps) times 3! (order the hires) = 1440.",
    },
    {
      title: "Combinations: when order does not",
      body: String.raw`An unordered selection of $k$ items from $n$ is a combination: $\binom{n}{k} = \frac{n!}{k!\,(n-k)!}$. It is the permutation count divided by the $k!$ orderings of the chosen set.

- Symmetry: $\binom{n}{k} = \binom{n}{n-k}$. Choosing the 4 who go is the same as choosing the 6 who stay.
- Know the small ones cold: $\binom{5}{2} = 10$, $\binom{6}{3} = 20$, $\binom{8}{3} = 56$, $\binom{9}{4} = 126$, $\binom{10}{3} = 120$, $\binom{12}{2} = 66$, $\binom{13}{3} = 286$.
- **Constraints first.** Must-include members take a seat before you count; must-exclude members leave the pool. "At least $k$ of a type" is a sum over the exact counts, each a product of two binomials.
- **Lattice paths.** A shortest route with $a$ east and $b$ north steps is a word with $a$ E's and $b$ N's: $\binom{a+b}{a}$ routes. Routes through a point multiply the two legs; routes avoiding a point are the total minus those through it.`,
      formula: String.raw`\binom{n}{k} = \frac{n!}{k!\,(n-k)!} = \frac{P(n,k)}{k!}`,
      example: "Four-person team from 10 with the lead forced in and one person out: C(8,3) = 56.",
    },
    {
      title: "Order or not? The one decision",
      body: String.raw`Ask: *if I swap two of the chosen items, do I get a different outcome?* If yes, order matters, use permutations. If no, use combinations. Positions, codes, rankings and sequences care about order. Teams, hands, subsets and sets of winners do not.

- **Labelled versus unlabelled groups.** Splitting 12 people into three teams of four gives $\frac{12!}{(4!)^3}$ if the teams have names, and that divided by $3!$ if they do not. Named people can label the groups for you: if Priya and Tom are in different teams, "Priya's team" and "Tom's team" are already distinguishable.
- **Pairings.** Matching $2n$ people into $n$ unordered pairs: $\frac{(2n)!}{2^n\, n!} = (2n-1)(2n-3)\cdots 1$. Match the lowest unmatched person first and the count falls out.
- **Probability shortcut.** When all outcomes are equally likely, pick whichever model (ordered or unordered) is easier and use it for *both* numerator and denominator. Mixing the two is the classic error.`,
      formula: String.raw`\text{unlabelled equal groups: } \frac{n!}{(k!)^{m}\, m!}, \qquad \text{pairings: } \frac{(2n)!}{2^n\, n!}`,
      example: "Ten players into five unordered matches: 9 times 7 times 5 times 3 times 1 = 945.",
    },
    {
      title: "Stars and bars",
      body: String.raw`Distributing $k$ identical items into $n$ distinct bins is the same as counting non-negative integer solutions of $x_1 + \cdots + x_n = k$. Write the items as $k$ stars and separate the bins with $n - 1$ bars; the count is the number of ways to place the bars among $k + n - 1$ symbols.

- Empty bins allowed: $\binom{k + n - 1}{n - 1}$.
- Each bin at least $m$: hand out $m$ per bin first, then distribute $k - mn$ freely. "Each at least one" gives $\binom{k - 1}{n - 1}$.
- Upper bounds (no bin above $c$): count without the cap, subtract the allocations where a bin holds $c + 1$ or more (pre-load it), add back the double overflows. That is inclusion-exclusion on the bins.

Check the word *identical*. If the items are distinct, the answer is $n^k$, not stars and bars.`,
      formula: String.raw`\#\{x_1 + \cdots + x_n = k,\ x_i \ge 0\} = \binom{k + n - 1}{n - 1}`,
      example: "Ten identical lots across four desks, empty desks allowed: C(13,3) = 286; each desk at least one: C(9,3) = 84.",
    },
    {
      title: "Complements: count what you do not want",
      body: String.raw`"At least one" is the loudest signal in counting. The event has many cases; its opposite, "none", has one. Count the complement and subtract from the total, or from 1 for a probability.

- Independent trials: $P(\text{at least one}) = 1 - (1 - p)^n$. Five rolls with no 5: $(5/6)^5$.
- Drawing without replacement: the complement is a ratio of combinations, $1 - \binom{\text{bad}}{k}/\binom{\text{all}}{k}$, or a product of shrinking fractions.
- Also use the complement for "not all the same", "at least two different", and "avoids a point".

Trap: "at least one 7 **and** at least one 0" has a complement that is a union ("no 7 **or** no 0"), which needs inclusion-exclusion, not a single subtraction.`,
      formula: String.raw`P(\text{at least one}) = 1 - P(\text{none})`,
      example: "Three tokens from 5 red and 7 blue, at least one red: 1 - C(7,3)/C(12,3) = 37/44.",
    },
    {
      title: "Inclusion-exclusion",
      body: String.raw`To count a union, add the single sets, subtract the pairwise overlaps, add back the triple overlaps, and keep alternating. Elements in several sets are then counted exactly once.

- Two sets: $|A \cup B| = |A| + |B| - |A \cap B|$.
- Three sets: add three singles, subtract three pairs, add the triple.
- **Symmetric events** collapse to a binomial sum: if every $k$-fold intersection has the same size $N_k$, then $|A_1 \cup \cdots \cup A_n| = \sum_{k \ge 1} (-1)^{k+1}\binom{n}{k} N_k$.
- **Every type appears** (surjections): the complement is "some bin is empty". Assignments avoiding $j$ given bins number $(n-j)^m$, so the good count is $\sum_j (-1)^j \binom{n}{j}(n-j)^m$.

Keep a running sign and write every term before you add; the arithmetic is where this goes wrong under time pressure.`,
      formula: String.raw`|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|`,
      example: "Six keys into four buckets, none empty: 4^6 - 4 times 3^6 + 6 times 2^6 - 4 = 1560 of 4096.",
    },
    {
      title: "Derangements",
      body: String.raw`A derangement is a permutation with no fixed point: nobody gets their own tag, no parcel reaches its own address. Inclusion-exclusion on the events "item $i$ is fixed" gives $D_n = n!\sum_{k=0}^{n}\frac{(-1)^k}{k!}$, so the probability that a random permutation is a derangement is that alternating sum, which converges to $1/e \approx 0.368$ almost immediately.

- The sequence to memorise: $D_1 = 0$, $D_2 = 1$, $D_3 = 2$, $D_4 = 9$, $D_5 = 44$, $D_6 = 265$, $D_7 = 1854$.
- Recurrence: $D_n = (n-1)(D_{n-1} + D_{n-2})$; also $D_n$ is $n!/e$ rounded to the nearest integer.
- **Exactly $k$ fixed points:** $\binom{n}{k} D_{n-k}$. The word "exactly" forces the rest to be deranged; using $(n-k)!$ instead is the standard error.`,
      formula: String.raw`D_n = n!\sum_{k=0}^{n}\frac{(-1)^k}{k!} \approx \frac{n!}{e}`,
      example: "Five name tags handed back at random, nobody gets their own: 44/120 = 11/30.",
    },
    {
      title: "Birthday collisions",
      body: String.raw`Draw $n$ times, uniformly and independently, from $N$ categories (days, hash buckets, order codes, lockers). The chance that all $n$ draws are different is a product of shrinking fractions, because each new draw must avoid everything before it.

- Exact: $P(\text{no collision}) = \prod_{i=0}^{n-1}\left(1 - \frac{i}{N}\right) = \frac{N(N-1)\cdots(N-n+1)}{N^n}$.
- Estimate: there are $\binom{n}{2}$ pairs, each colliding with chance $1/N$, so $P(\text{no collision}) \approx e^{-n(n-1)/(2N)}$.
- Rule of thumb: about $\sqrt{2N\ln 2} \approx 1.18\sqrt{N}$ draws give a 50% collision chance. For $N = 365$ that is 23; for $N = 100$ it is about 12 to 13.

The exact product is always a little smaller than the exponential estimate, so the true collision probability is slightly higher than the estimate.`,
      formula: String.raw`P(\text{collision}) = 1 - \prod_{i=0}^{n-1}\left(1 - \frac{i}{N}\right) \approx 1 - e^{-n(n-1)/(2N)}`,
      example: "Twelve orders with random two-digit codes: 66 pairs, each 1 in 100; collision chance about 0.50 (exact 0.497).",
    },
  ],

  workedExamples: [
    {
      title: "A team with at least one researcher",
      prompt: String.raw`A four-person project team is chosen from 7 traders and 5 researchers, with no roles. How many teams contain at least one researcher?`,
      steps: [
        {
          text: "\"At least one researcher\" has four cases (1, 2, 3 or 4 researchers). Its complement, \"no researcher\", has one. Count the complement.",
        },
        {
          text: "Count all possible teams: choose any 4 of the 12 people.",
          math: String.raw`\binom{12}{4} = 495`,
        },
        {
          text: "Count the teams with no researcher: all 4 members come from the 7 traders.",
          math: String.raw`\binom{7}{4} = 35`,
        },
        {
          text: "Subtract. Every team either has no researcher or has at least one, so the difference is the count we want.",
          math: String.raw`495 - 35 = 460`,
        },
        {
          text: "Sanity check by the direct sum over the exact number of researchers: 1, 2, 3 or 4 researchers with the rest traders.",
          math: String.raw`\binom{5}{1}\binom{7}{3} + \binom{5}{2}\binom{7}{2} + \binom{5}{3}\binom{7}{1} + \binom{5}{4} = 175 + 210 + 70 + 5 = 460`,
        },
      ],
      answer: "460 teams",
    },
    {
      title: "Every colour appears",
      prompt: String.raw`A machine prints each of 5 tickets in one of 3 colours, chosen independently and uniformly at random. What is the probability that all three colours appear among the 5 tickets?`,
      steps: [
        {
          text: "The sample space has $3^5 = 243$ equally likely colourings. \"All three colours appear\" is a surjection; count its complement, \"at least one colour is missing\".",
        },
        {
          text: "Let $M_c$ be the event that colour $c$ is missing. A colouring missing colour $c$ uses only the other two colours.",
          math: String.raw`|M_c| = 2^5 = 32 \quad \text{for each of the 3 colours}`,
        },
        {
          text: "Two colours missing means every ticket has the one remaining colour: exactly one colouring. All three missing is impossible.",
          math: String.raw`|M_a \cap M_b| = 1^5 = 1 \quad \text{for each of the 3 pairs}, \qquad |M_a \cap M_b \cap M_c| = 0`,
        },
        {
          text: "Inclusion-exclusion for the union of the three bad events.",
          math: String.raw`|M_a \cup M_b \cup M_c| = 3 \cdot 32 - 3 \cdot 1 + 0 = 93`,
        },
        {
          text: "Subtract from the total and divide by the size of the sample space.",
          math: String.raw`P(\text{all three colours}) = \frac{243 - 93}{243} = \frac{150}{243} = \frac{50}{81} \approx 0.617`,
        },
      ],
      answer: String.raw`\frac{50}{81} \approx 0.617`,
    },
  ],

  tryIt: {
    prompt: String.raw`Four colleagues hang four identical-looking coats on a rack. At the end of the day each takes one coat at random, every assignment of coats to people being equally likely. What is the probability that nobody ends up with their own coat?`,
    answer: { type: "numeric", value: 3 / 8, exact: String.raw`\frac{D_4}{4!} = \frac{9}{24} = \frac{3}{8}` },
    solution: String.raw`A random assignment of 4 coats to 4 people is a uniformly random permutation, so all $4! = 24$ assignments are equally likely. We want the number with no fixed point, the derangement number $D_4$.

By inclusion-exclusion, $D_4 = 4!\left(1 - 1 + \frac{1}{2} - \frac{1}{6} + \frac{1}{24}\right) = 24 - 24 + 12 - 4 + 1 = 9$. The recurrence agrees: $D_4 = 3(D_3 + D_2) = 3(2 + 1) = 9$.

So the probability is $\frac{9}{24} = \frac{3}{8} = 0.375$, already close to the limiting value $1/e \approx 0.368$. For contrast, the independent-trials guess $(3/4)^4 \approx 0.316$ is wrong because the assignments are a permutation, not four independent draws.`,
  },

  checkIds: ["m1-lc1", "m1-lc2", "m1-lc3", "m1-lc4"],

  formulas: [
    {
      name: "Multiplication rule",
      latex: String.raw`N = n_1 \cdot n_2 \cdots n_k`,
      note: "Choices in stages with option counts that do not depend on earlier picks; with repeats, k slots of n options give n^k.",
    },
    {
      name: "Permutations",
      latex: String.raw`P(n,k) = \frac{n!}{(n-k)!}`,
      note: "Ordered selection of k from n distinct items without repetition; all n in a row is n!.",
    },
    {
      name: "Combinations",
      latex: String.raw`\binom{n}{k} = \frac{n!}{k!\,(n-k)!}`,
      note: "Unordered selection of k from n; also counts lattice paths with k steps of one kind among n.",
    },
    {
      name: "Multiset permutations",
      latex: String.raw`\frac{n!}{n_1!\, n_2! \cdots n_r!}`,
      note: "Arrangements of n items where n_i are identical of type i.",
    },
    {
      name: "Circular arrangements",
      latex: String.raw`(n-1)!`,
      note: "n distinct people around a round table when rotations are the same seating; halve again only if reflections are identified.",
    },
    {
      name: "Unlabelled groups and pairings",
      latex: String.raw`\frac{n!}{(k!)^m\, m!}, \qquad \frac{(2n)!}{2^n\, n!}`,
      note: "Split n people into m unlabelled groups of k; the second form is the number of ways to pair up 2n people.",
    },
    {
      name: "Stars and bars",
      latex: String.raw`\binom{k + n - 1}{n - 1} \ (\text{empty ok}), \qquad \binom{k - 1}{n - 1} \ (\text{each} \ge 1)`,
      note: "k identical items into n distinct bins; for lower bounds hand out the minimums first, for upper bounds use inclusion-exclusion.",
    },
    {
      name: "Complement",
      latex: String.raw`P(\text{at least one}) = 1 - P(\text{none}) = 1 - (1-p)^n \ \text{(independent trials)}`,
      note: "Any 'at least one'; without replacement, P(none) is a ratio of combinations.",
    },
    {
      name: "Inclusion-exclusion",
      latex: String.raw`\Bigl|\bigcup_i A_i\Bigr| = \sum_i |A_i| - \sum_{i<j} |A_i \cap A_j| + \sum_{i<j<l} |A_i \cap A_j \cap A_l| - \cdots`,
      note: "Unions of overlapping events; for symmetric events the k-th term is (-1)^(k+1) C(n,k) N_k.",
    },
    {
      name: "Surjections (every bin used)",
      latex: String.raw`\sum_{j=0}^{n} (-1)^j \binom{n}{j} (n-j)^m = n!\, S(m,n)`,
      note: "m distinct items into n distinct bins with no bin empty; S(m,n) is a Stirling number of the second kind.",
    },
    {
      name: "Derangements",
      latex: String.raw`D_n = n!\sum_{k=0}^{n}\frac{(-1)^k}{k!} \approx \frac{n!}{e}, \qquad D_n = (n-1)(D_{n-1} + D_{n-2})`,
      note: "Permutations with no fixed point; exactly k fixed points is C(n,k) D_(n-k). Sequence 0, 1, 2, 9, 44, 265, 1854.",
    },
    {
      name: "Birthday collisions",
      latex: String.raw`P(\text{collision}) = 1 - \prod_{i=0}^{n-1}\left(1 - \frac{i}{N}\right) \approx 1 - e^{-n(n-1)/(2N)}`,
      note: "n independent uniform draws from N categories; about 1.18 sqrt(N) draws give a 50% collision chance.",
    },
  ],

  outro: String.raw`On the timed test, counting questions are the ones you are expected to finish quickly, which is exactly why they are dangerous: a one-word detail ("identical", "unordered", "without replacement", "at least") changes the formula, and the test does not warn you. Read the question twice, decide ordered-or-not out loud in your head, and write the denominator before the numerator so that both use the same model. If a count is bigger than the total, you have double counted; if a probability comes out above one or an inclusion-exclusion sum goes negative, a term is missing.

In a live interview the counting question is rarely the end. The interviewer gives you a clean version, you answer, and then they change one assumption: the table becomes round, two people refuse to sit together, the draws are now without replacement, the bins get a cap. That is what the variations attached to each problem are for. Practise saying the first answer and the follow-up in the same breath, and name the tool you are switching to ("that is now stars and bars with an upper bound, so inclusion-exclusion on the bins").

Next: Module 2 takes these counts and turns them into probability proper, with sample spaces, independence and symmetry. If the complement and inclusion-exclusion problems in this module still feel slow, redo the difficulty 3 set before moving on; the Bayes and expectation modules assume that counting is automatic.`,
};
