import { MathText } from "@/components/Math";
import { Breadcrumbs } from "@/components/shell/AppShell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const TRICKS: Array<{ title: string; body: string; example: string }> = [
  {
    title: "Multiply by 5: halve and shift",
    body: "Five is ten over two. Halve the number, then multiply by ten (move the decimal one place). If the number is odd, you get a .5 that becomes a trailing 5.",
    example: String.raw`$86 \times 5$: half of 86 is 43, shift to get $430$. $37 \times 5$: half is 18.5, shift to get $185$.`,
  },
  {
    title: "Multiply by 25 and by 50",
    body: "Twenty-five is 100 over 4, fifty is 100 over 2. Divide, then append two zeros.",
    example: String.raw`$48 \times 25 = (48 / 4) \times 100 = 1200$. $38 \times 50 = 19 \times 100 = 1900$.`,
  },
  {
    title: "Multiply by 9: ten minus one",
    body: "Multiply by ten and subtract the number once. For the one-digit table, the digits of $9k$ always sum to 9 and the tens digit is $k - 1$.",
    example: String.raw`$9 \times 47 = 470 - 47 = 423$. Table check: $9 \times 7 = 63$, tens digit 6 = 7 − 1, digits sum to 9.`,
  },
  {
    title: "Multiply by 11: spread the digits",
    body: "For a two-digit number $ab$, the answer is $a$, then $a + b$, then $b$. Carry when the middle sum passes nine.",
    example: String.raw`$11 \times 52 = 5\,(5+2)\,2 = 572$. $11 \times 78 = 7\,(15)\,8 = 858$ after carrying.`,
  },
  {
    title: "Multiply by 12: the rung method",
    body: "Twelve is ten plus two. Take ten times the number and add double the number. Think of it as two rungs: the tens rung and the doubles rung.",
    example: String.raw`$12 \times 37 = 370 + 74 = 444$. $12 \times 85 = 850 + 170 = 1020$.`,
  },
  {
    title: "Divide by 12: split into 4 and 3",
    body: "Divide by 4 (halve twice), then by 3. Or divide by 3 first if the number is an obvious multiple of 3. Check: a number divides by 12 exactly when it divides by 4 (last two digits) and by 3 (digit sum).",
    example: String.raw`$732 / 12$: $732 / 4 = 183$, $183 / 3 = 61$. $516 / 12$: $516/3 = 172$, $172/4 = 43$.`,
  },
  {
    title: "Divide by 9: the digit-sum check",
    body: "A number is divisible by 9 exactly when its digit sum is. For the quotient, work from the left: how many nines fit, carry the remainder down. The remainder on division by 9 equals the digit sum mod 9, which makes a fast sanity check of any answer.",
    example: String.raw`$567 / 9$: digit sum 18, so it divides. $5 \to 0$ r5; $56 \to 6$ r2; $27 \to 3$: answer $63$.`,
  },
  {
    title: "Divide by 11: alternating digit sum",
    body: "A number is divisible by 11 when the alternating sum of its digits (right to left: plus, minus, plus...) is a multiple of 11. For two-digit quotients, undo the spread-the-digits trick.",
    example: String.raw`$847$: $7 - 4 + 8 = 11$, divisible. $847 / 11 = 77$ because $7\,(14)\,7 \to 7\,(4+1\text{ carry})\,7$.`,
  },
  {
    title: "Squares near a round number",
    body: String.raw`$(a+b)^2 = a^2 + 2ab + b^2$. Take $a$ as the nearest round number. For numbers ending in 5, square the tens digit times the next integer and append 25.`,
    example: String.raw`$23^2 = 400 + 2 \cdot 20 \cdot 3 + 9 = 529$. $65^2$: $6 \times 7 = 42$, append 25: $4225$.`,
  },
  {
    title: "Difference of squares for products",
    body: String.raw`$(a-b)(a+b) = a^2 - b^2$. When two numbers straddle a round number, square the middle and subtract the square of the half-gap.`,
    example: String.raw`$47 \times 53 = 50^2 - 3^2 = 2491$. $18 \times 22 = 400 - 4 = 396$.`,
  },
  {
    title: "Subtraction across 100: add up, not down",
    body: "Count from the smaller number up to the next hundred, then on to the larger number. Two easy hops replace a borrow.",
    example: String.raw`$143 - 68$: 68 to 100 is 32, 100 to 143 is 43, total $75$.`,
  },
  {
    title: "Percentages: build from 10% and 1%",
    body: "Ten percent is a decimal shift. Five percent is half of that, one percent is a shift of two. Assemble any percentage from these pieces.",
    example: String.raw`$15\%$ of 80: $8 + 4 = 12$. $17\%$ of 300: $30 + 15 + 6 = 51$.`,
  },
  {
    title: "Fractions to decimals worth memorising",
    body: String.raw`Sevenths cycle through 142857: $1/7 \approx 0.1429$, $2/7 \approx 0.2857$, $3/7 \approx 0.4286$. Eighths step by 0.125. Ninths repeat the numerator: $4/9 = 0.444\ldots$ Elevenths repeat two digits: $3/11 = 0.2727\ldots$`,
    example: String.raw`$5/8 = 0.625$. $5/7 \approx 0.714$. $7/11 \approx 0.636$.`,
  },
  {
    title: "Estimation first, precision second",
    body: "Before computing, bound the answer: round both numbers, multiply, and note whether you rounded up or down. In an interview, saying 'about 2,400, slightly less' in two seconds beats a silent ten-second exact answer.",
    example: String.raw`$48 \times 52$: about $50 \times 50 = 2500$, one up and one down, so a little less: $2496$.`,
  },
];

export default function CheatsheetPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ href: "/mental-math", label: "Mental math" }, { label: "Speed tricks" }]} />
      <PageHeader eyebrow="Cheat sheet" title="Speed tricks" description="Fourteen techniques that cover most of what the sprint and the 80-in-8 format throw at you. Each one is a tool; the skill is noticing which tool fits in under a second." />
      <div className="grid gap-4">
        {TRICKS.map((t, i) => (
          <Card key={t.title}>
            <CardHeader title={<span><span className="mr-2 font-mono text-sm text-faint">{String(i + 1).padStart(2, "0")}</span>{t.title}</span>} />
            <CardBody>
              <MathText className="text-[15px] text-fg">{t.body}</MathText>
              <div className="mt-3 rounded-xl border border-border bg-surface-2/60 px-4 py-3">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Example</div>
                <MathText className="text-sm text-fg">{t.example}</MathText>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
