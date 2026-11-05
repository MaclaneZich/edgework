import type { Lesson } from "../types";

/** Module 3 lesson: conditional probability and Bayes. Original text written for Edgework. */
export const lesson: Lesson = {
  intro: String.raw`Almost every probability question an interviewer asks after the warm-up is really a conditioning question. "Given that the first card was an ace", "given that the host opened door 3", "given that the test came back positive": the phrase *given that* tells you the sample space has shrunk, and the whole skill is knowing how to shrink it correctly and then count what is left.

On a trading desk the same move runs all day. A counterparty lifts your offer: given that, what do you now believe about the fair price? A model flags a transaction: given the flag, how likely is fraud? You start with a prior, you receive a signal, you update. The arithmetic is a ratio; the judgement is in deciding what the signal actually tells you.

This module gives you three ways to do that arithmetic (the definition, tables of counts, and Bayes' rule in odds form) and one question to ask every time: *how was this information generated?* That question is what separates a 1/3 from a 1/2 in the two-children family and a 2/3 from a 1/2 in the Monty Hall family. After the lesson you should be able to update on a single signal in under a minute, chain several signals by multiplying likelihood ratios, and spot the base-rate and swapped-conditional traps before you step in them.`,
  cards: [
    {
      title: "Conditioning shrinks the sample space",
      body: String.raw`The conditional probability of $A$ given $B$ is the share of $B$'s probability that also lies in $A$. Operationally: throw away every outcome outside $B$, then measure $A$ inside what remains and divide by the total that remains.

If the outcomes were equally likely before conditioning, they stay equally likely inside $B$. So for dice and cards you simply list the outcomes consistent with the information and count. Two dice with sum at least 9: ten ordered outcomes survive, two are doubles, so the conditional probability of doubles is $2/10$.

- Always decide what the equally likely outcomes are before you count (ordered pairs for two dice, unordered hands for cards).
- Conditioning on $B$ can raise or lower $P(A)$; it leaves it unchanged exactly when $A$ and $B$ are independent.`,
      formula: String.raw`P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \qquad P(B) > 0`,
      example: "Given at least one die is even, the sum is even only if both are even: 9 of the 27 surviving outcomes, so 1/3.",
    },
    {
      title: "The multiplication rule and trees",
      body: String.raw`Rearranging the definition gives the multiplication rule: the probability of two things both happening is the probability of the first times the probability of the second *given* the first. Chains extend it: $P(A \cap B \cap C) = P(A)\,P(B \mid A)\,P(C \mid A \cap B)$.

A probability tree is the multiplication rule drawn out. Each branch carries a conditional probability, you multiply along a path to get the probability of that path, and you add the paths that make up the event you care about. Two-stage experiments (pick an urn, then draw; pick a coin, then flip) are trees with two levels.

- Drawing without replacement is the classic use: $P(\text{two aces}) = \frac{4}{52}\cdot\frac{3}{51}$.
- When a path's probability is tiny, the tree shows you exactly which branch made it so.`,
      formula: String.raw`P(A \cap B) = P(B)\,P(A \mid B) = P(A)\,P(B \mid A)`,
      example: "Pick urn A with probability 1/3 then draw red with probability 3/5: that path has probability 1/5.",
    },
    {
      title: "Tables of counts: the fastest Bayes",
      body: String.raw`For any screening-style problem (a test, a filter, a scanner, a fraud model) skip the formula and build a table for a round population, usually 10,000. Split the population by the hidden truth (sick or healthy, fraud or legitimate), then apply the test's rates within each group to get four counts: true positives, false negatives, false positives, true negatives.

The answer to "given a positive, what is the probability of the condition?" is then a ratio of two counts you can see: true positives over all positives. No algebra, no chance of swapping a conditional.

- Choose the population so the counts are integers: 10,000 works for percentages with one decimal.
- The same table answers the negative-result question too: false negatives over all negatives.`,
      formula: String.raw`P(D \mid +) = \frac{\text{true positives}}{\text{true positives} + \text{false positives}}`,
      example: "1% prevalence, 90% sensitivity, 10% false-positive rate: 90 true positives against 990 false ones, so a positive means the condition only 1/12 of the time.",
    },
    {
      title: "Bayes' rule in odds form",
      body: String.raw`Bayes' rule is easiest to carry in your head as odds. Write your prior belief as odds between two hypotheses, then multiply by the **likelihood ratio**: how much more probable the evidence is under the first hypothesis than under the second. The result is the posterior odds; convert back to a probability with $p = \text{odds}/(1 + \text{odds})$.

Several pieces of evidence that are independent given the hypothesis each contribute their own ratio, and the ratios multiply. The order in which signals arrive does not matter, and updating all at once gives the same answer as updating one signal at a time and feeding the posterior forward as the next prior.

- A ratio above 1 moves you toward the first hypothesis; below 1 moves you away. Unremarkable observations have ratios near 1, but rarely exactly 1.
- Watch the prior: a strong signal (ratio 100) against a rare hypothesis (odds 1:10,000) still leaves it unlikely.`,
      formula: String.raw`\frac{P(H_1 \mid E)}{P(H_2 \mid E)} = \frac{P(H_1)}{P(H_2)} \times \frac{P(E \mid H_1)}{P(E \mid H_2)}`,
      example: "One biased coin (heads 3/4) among nine fair ones: prior odds 1:9, four heads multiply by (3/2)^4 = 81/16, posterior odds 9:16, probability 9/25.",
    },
    {
      title: "The law of total probability",
      body: String.raw`When the thing you want depends on an unknown that comes first (which urn, which coin, whether the applicant is strong), split on that unknown. The probability of the event is the weighted average of its conditional probabilities, with the weights being the probabilities of the cases. The cases must be exclusive and together cover everything.

Total probability is also the denominator of Bayes' rule: $P(E) = \sum_i P(E \mid H_i)P(H_i)$ is how likely the evidence was overall, which is what you divide by. And it is how you *predict* after updating: the probability of the next observation is the posterior-weighted average of the per-hypothesis probabilities.

- The answer must land between the smallest and largest conditional probability. If it does not, a weight is wrong.
- Pooling the urns (counting all marbles together) is the classic error; it uses urn sizes as weights instead of the chance of reaching each urn.`,
      formula: String.raw`P(A) = \sum_{i} P(A \mid B_i)\,P(B_i), \qquad B_1, B_2, \ldots \text{ a partition}`,
      example: "Two fair coins and one 0.8 coin in a bag: P(heads) = (2/3)(1/2) + (1/3)(0.8) = 3/5.",
    },
    {
      title: "How was the information generated?",
      body: String.raw`Two statements can carry the same words and different evidence. "At least one child is a girl", learned by asking that exact question, leaves BG, GB and GG equally likely, so both girls has probability 1/3. "The child who happened to come along is a girl" is information about one specific child; the sibling is independent, and the answer is 1/2. The difference is the *protocol* that produced the sentence, not the sentence.

Monty Hall is the same lesson. A host who knows where the car is and must open a goat door leaks information through his constraint: switching wins 2/3. A stand-in host who opens a random door and happens to show a goat leaks nothing about which closed door is better: switching wins 1/2. A host who breaks ties with a known preference changes the number again. Before computing anything, write down the host's rule, including how he chooses when he has a choice.

- Enumerate the joint space (truth, your pick, the host's action with its probability) and condition on the exact action you observed.
- A rare extra detail ("a son born in March") matters under an at-least-one protocol and is irrelevant under a random-child protocol.`,
      formula: String.raw`P(\text{truth} \mid \text{action}) \propto P(\text{truth}) \times P(\text{action} \mid \text{truth})`,
      example: "Knowing host, you pick door 1, he opens door 3: P(opens 3 | car at 1) = 1/2 but P(opens 3 | car at 2) = 1, so door 2 is twice as likely as door 1.",
    },
    {
      title: "Base rates and false positives",
      body: String.raw`When the condition you are testing for is rare, the healthy majority generates most of the positive results even with a good test. The test's accuracy figures ($P(+ \mid D)$ and $P(- \mid D^c)$) are not the number you want; you want $P(D \mid +)$, and the base rate sits between the two.

Base-rate neglect has a courtroom cousin, the prosecutor's fallacy: "only 1 in 1,000 innocent people would match, so he is 99.9% guilty." That swaps $P(\text{match} \mid \text{innocent})$ for $P(\text{innocent} \mid \text{match})$. In a city of 500,000 the 1-in-1,000 marker belongs to about 500 innocent people, and a suspect with no other evidence against him is one of about 501 matches.

- Rule of thumb for rare conditions: when prevalence is below the false-positive rate, most positives are false (true positives are at most the prevalence, false positives are nearly the full false-positive rate).
- Independent evidence that raises the prior (the suspect was seen nearby) changes the conclusion completely; the same likelihood ratio applied to different prior odds gives a different posterior.`,
      formula: String.raw`P(D \mid +) = \frac{P(+ \mid D)\,P(D)}{P(+ \mid D)\,P(D) + P(+ \mid D^c)\,P(D^c)}`,
      example: "2% defective parts, scanner catches 95% and false-flags 8%: per 10,000, 190 true flags versus 784 false, so a flag means defective only 19.5% of the time.",
    },
    {
      title: "Independence versus conditional independence",
      body: String.raw`$A$ and $B$ are independent when learning one tells you nothing about the other: $P(A \mid B) = P(A)$, equivalently $P(A \cap B) = P(A)P(B)$. They are *conditionally* independent given $C$ when that factorisation holds inside each value of $C$.

The two are different, and interviewers love the gap. Two reviewers who judge an applicant separately are independent *given the applicant's quality*, but unconditionally their decisions are positively correlated: reviewer A's yes is evidence the applicant is strong, and strong applicants are the ones B tends to accept. The shared hidden cause creates the dependence. Multiplying $P(A)P(B)$ in that situation is wrong; multiplying within each quality group and then averaging is right.

- Conditional independence is exactly the assumption that lets likelihood ratios multiply in sequential updating.
- The reverse failure also exists: events can be independent overall yet dependent once you condition on something (two dice are independent, but given that their sum is 7 the second die is fixed by the first).`,
      formula: String.raw`P(A \cap B \mid C) = P(A \mid C)\,P(B \mid C) \;\not\Rightarrow\; P(A \cap B) = P(A)\,P(B)`,
      example: "Strong 30%, each reviewer says yes to 80% of strong and 20% of weak applicants: P(both yes) = 0.22, but P(yes)² = 0.144.",
    },
  ],
  workedExamples: [
    {
      title: "A flagged transaction, by table of counts",
      prompt: String.raw`At a card issuer, 0.5% of transactions are fraudulent. A model flags 96% of fraudulent transactions and 2% of legitimate ones. A transaction has been flagged. What is the probability that it is fraudulent?`,
      steps: [
        {
          text: "Pick a round population and split it by the hidden truth. Out of 10,000 transactions, 0.5% are fraudulent.",
          math: String.raw`10{,}000 \times 0.005 = 50 \text{ fraudulent}, \qquad 9{,}950 \text{ legitimate}`,
        },
        {
          text: "Apply the model's catch rate to the fraudulent group to get the true flags.",
          math: String.raw`50 \times 0.96 = 48 \text{ true flags}`,
        },
        {
          text: "Apply the false-flag rate to the legitimate group. This is where the base rate bites: a small rate on a big group.",
          math: String.raw`9{,}950 \times 0.02 = 199 \text{ false flags}`,
        },
        {
          text: "The flagged pile mixes both. The probability that a flagged transaction is fraudulent is true flags over all flags.",
          math: String.raw`P(\text{fraud} \mid \text{flag}) = \frac{48}{48 + 199} = \frac{48}{247} \approx 0.194`,
        },
        {
          text: "Sanity-check with odds: prior odds 1:199, likelihood ratio 0.96/0.02 = 48, posterior odds 48:199, the same ratio. A model that is right 96% of the time on fraud still produces four false flags for every true one.",
        },
      ],
      answer: String.raw`\frac{48}{247} \approx 0.194`,
    },
    {
      title: "Which coin, and what about the next flip?",
      prompt: String.raw`A drawer holds two fair coins and one coin that lands heads with probability 0.9. You take one at random and flip it twice: heads, heads. What is the probability that you hold the 0.9 coin? Then the coin is flipped a third time and shows tails; what is the probability now?`,
      steps: [
        {
          text: "Start with prior odds. One biased coin against two fair ones.",
          math: String.raw`\text{prior odds (biased : fair)} = 1 : 2`,
        },
        {
          text: "Compute the likelihood ratio of two heads. Flips are independent given the coin, so square the per-flip ratio.",
          math: String.raw`\frac{P(HH \mid \text{biased})}{P(HH \mid \text{fair})} = \frac{0.9^2}{0.5^2} = \frac{0.81}{0.25} = 3.24`,
        },
        {
          text: "Multiply prior odds by the likelihood ratio and convert to a probability.",
          math: String.raw`\text{odds} = 3.24 : 2 = 81 : 50, \qquad P(\text{biased} \mid HH) = \frac{81}{131} \approx 0.618`,
        },
        {
          text: "Now the third flip is tails. Update again, using the posterior as the new prior. Tails is far less likely from the biased coin, so the ratio is below 1.",
          math: String.raw`\frac{P(T \mid \text{biased})}{P(T \mid \text{fair})} = \frac{0.1}{0.5} = \frac{1}{5}, \qquad \text{odds} = 81 : 250, \qquad P(\text{biased} \mid HHT) = \frac{81}{331} \approx 0.245`,
        },
        {
          text: "Check: updating on HHT in one go gives the same odds, 1 × (0.9 × 0.9 × 0.1)/(0.5 × 0.5 × 0.5) : 2 = 0.648 : 2 = 81 : 250. One disappointing observation undid most of two encouraging ones because the biased coin almost never shows tails.",
        },
      ],
      answer: String.raw`\frac{81}{131} \approx 0.618 \text{ after } HH; \quad \frac{81}{331} \approx 0.245 \text{ after } HHT`,
    },
  ],
  tryIt: {
    prompt: String.raw`A bag holds five coins: four are fair and one has heads on both sides. You take a coin at random and flip it once; it shows heads. What is the probability that you took the two-headed coin?`,
    answer: { type: "numeric", value: (1 / 5) / (1 / 5 + (4 / 5) * (1 / 2)), exact: String.raw`\frac{\frac{1}{5}\cdot 1}{\frac{1}{5}\cdot 1 + \frac{4}{5}\cdot\frac{1}{2}} = \frac{1}{3}` },
    solution: String.raw`Two hypotheses: two-headed (prior $1/5$) and fair (prior $4/5$). The evidence is one head, with likelihood $1$ under the two-headed coin and $1/2$ under a fair coin.

Bayes' rule: $P(\text{two-headed} \mid H) = \dfrac{\frac{1}{5}\cdot 1}{\frac{1}{5}\cdot 1 + \frac{4}{5}\cdot\frac{1}{2}} = \dfrac{1/5}{1/5 + 2/5} = \dfrac{1}{3}$.

In odds: prior odds $1:4$, likelihood ratio $1/(1/2) = 2$, posterior odds $2:4 = 1:2$, probability $1/3$. By counts: imagine 10 trials of the experiment; two use the two-headed coin and both show heads, eight use a fair coin and four show heads; of the six heads, two came from the two-headed coin.`,
  },
  checkIds: ["m3-lc1", "m3-lc2", "m3-lc3", "m3-lc4"],
  formulas: [
    {
      name: "Conditional probability",
      latex: String.raw`P(A \mid B) = \frac{P(A \cap B)}{P(B)}`,
      note: "Restrict to B and renormalise; with equally likely outcomes it is a ratio of counts.",
    },
    {
      name: "Multiplication rule",
      latex: String.raw`P(A \cap B) = P(B)\,P(A \mid B)`,
      note: "Multiply along a tree path; drawing without replacement is the standard use.",
    },
    {
      name: "Law of total probability",
      latex: String.raw`P(A) = \sum_i P(A \mid B_i)\,P(B_i)`,
      note: "Average over an exclusive, exhaustive set of cases; also the denominator of Bayes' rule.",
    },
    {
      name: "Bayes' rule",
      latex: String.raw`P(H \mid E) = \frac{P(E \mid H)\,P(H)}{P(E)}`,
      note: "Posterior is prior times likelihood, normalised by the overall probability of the evidence.",
    },
    {
      name: "Bayes in odds form",
      latex: String.raw`\frac{P(H_1 \mid E)}{P(H_2 \mid E)} = \frac{P(H_1)}{P(H_2)} \cdot \frac{P(E \mid H_1)}{P(E \mid H_2)}`,
      note: "Prior odds times likelihood ratio; convert back with p = odds / (1 + odds).",
    },
    {
      name: "Several independent signals",
      latex: String.raw`\text{posterior odds} = \text{prior odds} \times \prod_{k} \mathrm{LR}_k`,
      note: "Valid when the signals are independent given the hypothesis; order does not matter.",
    },
    {
      name: "Positive predictive value by counts",
      latex: String.raw`P(D \mid +) = \frac{N \cdot \pi \cdot s}{N \cdot \pi \cdot s + N(1 - \pi)\,f}`,
      note: "Prevalence π, sensitivity s, false-positive rate f; the N cancels, so pick N = 10,000 and count.",
    },
    {
      name: "Predictive probability",
      latex: String.raw`P(\text{next} = x \mid \text{data}) = \sum_i P(x \mid H_i)\,P(H_i \mid \text{data})`,
      note: "Average the per-hypothesis probability over the posterior, not over the prior.",
    },
    {
      name: "Independence",
      latex: String.raw`P(A \cap B) = P(A)\,P(B) \iff P(A \mid B) = P(A)`,
      note: "Learning B does not move A; check it by computing both sides, never by intuition alone.",
    },
    {
      name: "Conditional independence",
      latex: String.raw`P(A \cap B \mid C) = P(A \mid C)\,P(B \mid C)`,
      note: "Independence inside each value of C; it does not imply unconditional independence.",
    },
    {
      name: "Two children with a rare detail",
      latex: String.raw`P(\text{both boys} \mid \text{at least one boy with a 1-in-}n\text{ detail}) = \frac{2n - 1}{4n - 1}`,
      note: "At-least-one protocol only; n = 1 gives 1/3, large n approaches 1/2. A random-child protocol gives 1/2 regardless.",
    },
    {
      name: "Monty Hall with k doors",
      latex: String.raw`P(\text{stay wins}) = \frac{1}{k}, \qquad P(\text{a given closed unpicked door}) = \frac{k - 1}{k\,(k - 1 - m)}`,
      note: "Knowing host opens m goat doors uniformly among the eligible ones; k = 3, m = 1 gives 2/3.",
    },
  ],
  outro: String.raw`Interviewers rarely ask Bayes straight. They start with the version you know and then change the mechanism: the host no longer knows where the car is, or opens two doors, or prefers the door on the right; the mother volunteers the information instead of answering your question; the test is run twice; the witness who disagrees is added to the two who agree. Each change alters a likelihood, and they are watching whether you recompute or recite. The habit that protects you is to write the generating process explicitly (truth, action, probability of that action given the truth) before touching the numbers.

The second favourite is "one more observation". After you give a posterior, they add a tail, a non-six, a second flag, and ask again. Work in odds and this is one multiplication; work in probabilities and it is a mess under pressure. Practise converting between odds and probability until it is automatic (odds 16:11 is 16/27; probability 0.6 is odds 3:2), and practise saying the likelihood ratio of an observation out loud before you use it.

Finally, keep the base-rate reflex. Any time a problem states a small prevalence and an impressive accuracy, build the 10,000-row table in your head and look at the false positives first. Next, in the practice set, make sure you can do the knowing host, the random host, the biased host and the many-door versions back to back, then the three two-children protocols, then a chain of likelihood ratios with at least one piece of contrary evidence. Module 4 turns to expectation, where conditioning returns as the law of total expectation.`,
};
