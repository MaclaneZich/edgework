import { ExternalLink, Library } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

interface Book {
  title: string;
  author: string;
  note: string;
  map: Array<{ modules: string; chapters: string }>;
}

const BOOKS: Book[] = [
  {
    title: "A Practical Guide to Quantitative Finance Interviews",
    author: "Xinfeng Zhou (the \"Green Book\")",
    note: "The closest thing to a syllabus for these interviews. Read the probability and brainteaser chapters actively: cover the solution, attempt, then compare.",
    map: [
      { modules: "9 Logic and brainteasers", chapters: "Chapter 2, Brain Teasers" },
      { modules: "1 to 4 Counting, basics, Bayes, expectation", chapters: "Chapter 4, Probability Theory (basic principles, conditional probability, discrete and continuous distributions, expected value)" },
      { modules: "5 Distributions and approximations", chapters: "Chapter 4 continued (distributions, order statistics) and the statistics material" },
      { modules: "6 First-step analysis and recursion", chapters: "Chapter 5, Stochastic Process (Markov chains, martingales, random walks)" },
      { modules: "7 and 8 Games, market-making, options", chapters: "Chapter 6, Finance (option pricing intuition, put-call parity) and the betting problems in Chapter 4" },
      { modules: "10 Coding", chapters: "Chapter 7, Algorithms and Numerical Methods" },
    ],
  },
  {
    title: "Fifty Challenging Problems in Probability with Solutions",
    author: "Frederick Mosteller",
    note: "Short, classic, and cheap. Work the problems in order; each is a family that still appears in interviews with new numbers.",
    map: [
      { modules: "1 Counting, 2 Basics", chapters: "Problems 1 to 10 (dice, socks, matching, coin flips)" },
      { modules: "3 Conditional probability", chapters: "The two-children, prisoner and selection problems in the middle of the collection" },
      { modules: "4 Expectation, 6 Recursion", chapters: "The waiting-time, gambler's ruin and random-walk problems later in the book" },
      { modules: "9 Brainteasers", chapters: "The geometric and 'clever argument' problems (sticks, points on a circle, tournaments)" },
    ],
  },
  {
    title: "Heard on the Street: Quantitative Questions from Wall Street Job Interviews",
    author: "Timothy Falcon Crack",
    note: "Broader than the test: includes derivatives and non-quantitative questions. Use it for interview breadth after the assessment.",
    map: [
      { modules: "1 to 6 Probability and statistics", chapters: "The purely quantitative and logic questions chapter, and the statistics chapter" },
      { modules: "7 and 8 Games and markets", chapters: "The derivatives chapter (payoffs, parity) and the betting questions" },
      { modules: "9 Logic", chapters: "The logic and 'thinking' questions" },
    ],
  },
  {
    title: "Introduction to Probability (free online text and lectures)",
    author: "Joseph Blitzstein and Jessica Hwang (Harvard Stat 110)",
    note: "If you have never taken a probability course, this is the gentlest rigorous path. The lecture videos are free. Two chapters a day covers the test material in four days.",
    map: [
      { modules: "1 Counting", chapters: "Chapter 1, Probability and Counting" },
      { modules: "3 Conditional probability and Bayes", chapters: "Chapter 2, Conditional Probability" },
      { modules: "2 and 5 Random variables and distributions", chapters: "Chapters 3 and 5 (discrete and continuous random variables)" },
      { modules: "4 Expectation", chapters: "Chapter 4, Expectation (linearity, indicators, tail sums)" },
      { modules: "5 Covariance and LLN", chapters: "Chapter 7, Joint Distributions, and Chapter 10, Inequalities and Limit Theorems" },
      { modules: "6 Markov chains", chapters: "Chapter 11, Markov Chains" },
    ],
  },
];

export default function ReadingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Further reading"
        title="Books that match the modules"
        description="Edgework&apos;s lessons and problems are original. These are the classic references the curriculum is designed to be compatible with; read them for extra practice on the same ideas."
      />
      <Card className="mb-5 border-accent-fill/40">
        <CardHeader title="The one thing this app cannot do" action={<ExternalLink size={16} className="text-faint" />} />
        <CardBody className="text-sm text-muted">
          Take the official HackerRank sample test linked from your Susquehanna invite at least twice: once in the first two days, to see the exact interface, timer and question style, and once two or three days before the real test, to confirm your pacing. The planner schedules both passes; tick them off on the dashboard. Nothing here replicates HackerRank&apos;s environment exactly.
        </CardBody>
      </Card>
      <div className="space-y-4">
        {BOOKS.map((b) => (
          <Card key={b.title}>
            <CardHeader title={b.title} subtitle={b.author} action={<Library size={18} className="text-faint" />} />
            <CardBody>
              <p className="mb-4 text-sm text-muted">{b.note}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-faint">
                    <th className="pb-2 pr-4 font-medium">Edgework module</th>
                    <th className="pb-2 font-medium">Where to read</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {b.map.map((row) => (
                    <tr key={row.modules}>
                      <td className="py-2 pr-4 align-top text-fg">{row.modules}</td>
                      <td className="py-2 align-top text-muted">{row.chapters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-xs text-faint">Chapter titles are given from memory of the published editions; check your edition&apos;s table of contents, since numbering shifts between printings.</p>
    </div>
  );
}
