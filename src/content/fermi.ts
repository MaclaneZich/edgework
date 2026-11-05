/**
 * Fermi estimation drill. Each item has an approximate true value (order-of-magnitude
 * accuracy is what matters), the unit, and a short decomposition showing one honest route
 * to the number. Values are rounded reference figures, good to within about 20%.
 */

export interface FermiQuestion {
  id: string;
  prompt: string;
  unit: string;
  truth: number;
  decomposition: string;
}

export const FERMI_QUESTIONS: FermiQuestion[] = [
  { id: "f-seconds-year", prompt: "How many seconds are there in a year?", unit: "seconds", truth: 3.15e7, decomposition: "365 days × 24 hours × 3600 seconds ≈ 365 × 86,400 ≈ 31.5 million. The shortcut: a year is about π × 10^7 seconds." },
  { id: "f-heartbeats", prompt: "How many times does a human heart beat in an 80-year life?", unit: "beats", truth: 3e9, decomposition: "About 70 beats a minute × 60 × 24 ≈ 100,000 a day; × 365 × 80 ≈ 2.9 billion." },
  { id: "f-us-trading-days", prompt: "How many minutes is the US stock market open in a year, counting only regular hours?", unit: "minutes", truth: 98280, decomposition: "6.5 hours × 60 = 390 minutes a day × about 252 trading days ≈ 98,000." },
  { id: "f-breaths", prompt: "How many breaths does a person take in a day?", unit: "breaths", truth: 20000, decomposition: "About 14 breaths a minute × 1,440 minutes ≈ 20,000." },
  { id: "f-words-book", prompt: "How many words are in a typical 300-page novel?", unit: "words", truth: 90000, decomposition: "About 300 words a page × 300 pages ≈ 90,000." },
  { id: "f-cards-shuffles", prompt: "How many distinct orderings does a standard 52-card deck have? Give the order of magnitude.", unit: "orderings", truth: 8.07e67, decomposition: "52! ≈ 8 × 10^67. Stirling: log10(52!) ≈ 52 log10(52/e) + 0.5 log10(2π·52) ≈ 67.9." },
  { id: "f-earth-circumference", prompt: "What is the circumference of the Earth?", unit: "kilometres", truth: 40000, decomposition: "By the original definition of the metre, pole to equator is 10,000 km, so around the planet is 40,000 km." },
  { id: "f-hairs", prompt: "How many hairs are on a typical human head?", unit: "hairs", truth: 100000, decomposition: "Scalp about 600 cm², roughly 150-200 hairs per cm² ≈ 100,000." },
  { id: "f-piano-notes", prompt: "How many keys does a standard piano have?", unit: "keys", truth: 88, decomposition: "Seven and a bit octaves × 12 notes ≈ 88: 52 white, 36 black." },
  { id: "f-nyc-pop", prompt: "What is the population of New York City (the five boroughs)?", unit: "people", truth: 8.3e6, decomposition: "About 8 million; Manhattan alone is about 1.6 million." },
  { id: "f-us-pop", prompt: "What is the population of the United States?", unit: "people", truth: 3.35e8, decomposition: "About 335 million, roughly 4% of the world's 8 billion." },
  { id: "f-world-pop", prompt: "What is the population of the world?", unit: "people", truth: 8.1e9, decomposition: "Passed 8 billion in late 2022." },
  { id: "f-grains-rice", prompt: "How many grains of rice are in a one-kilogram bag?", unit: "grains", truth: 45000, decomposition: "A grain weighs about 20-25 mg, so 1 kg / 22 mg ≈ 45,000." },
  { id: "f-light-second", prompt: "How far does light travel in one millisecond?", unit: "kilometres", truth: 300, decomposition: "300,000 km per second, so 300 km per millisecond. A round trip New York to Chicago takes about 8 ms at light speed in fibre, longer in practice." },
  { id: "f-sp500-shares", prompt: "Roughly how many shares of the largest US stocks trade per day across the whole US equity market?", unit: "shares", truth: 1.1e10, decomposition: "US consolidated volume runs about 10-12 billion shares a day." },
  { id: "f-cells-body", prompt: "How many cells are in the human body?", unit: "cells", truth: 3.7e13, decomposition: "About 37 trillion; red blood cells alone are about 25 trillion." },
  { id: "f-days-life", prompt: "How many days does an 80-year life last?", unit: "days", truth: 29220, decomposition: "80 × 365.25 ≈ 29,200. About 30,000 days." },
  { id: "f-nyc-pizza", prompt: "How many pizza restaurants are there in New York City?", unit: "restaurants", truth: 2000, decomposition: "8 million people, one pizza place per 3,000-4,000 residents ≈ 2,000-2,500." },
  { id: "f-moon-distance", prompt: "How far is the Moon from the Earth?", unit: "kilometres", truth: 384000, decomposition: "About 384,000 km, roughly 30 Earth diameters; light takes 1.3 seconds." },
  { id: "f-atoms-water", prompt: "How many molecules are in a glass (250 mL) of water?", unit: "molecules", truth: 8.4e24, decomposition: "250 g / 18 g per mole ≈ 14 moles × 6 × 10^23 ≈ 8 × 10^24." },
  { id: "f-tennis-balls-747", prompt: "How many tennis balls fit inside a Boeing 747's passenger cabin?", unit: "balls", truth: 2.2e7, decomposition: "Cabin volume ≈ 70 m long × 6 m wide × 2.5 m high ≈ 1,000 m³; a ball is 150 cm³ with ~65% packing ≈ 4,300 per m³ → about 4 million if treated as empty; with seats and structure removed only partly, estimates from 2 to 20 million are defensible. Reference used: 2 × 10^7 for the bare cabin." },
  { id: "f-flights-air", prompt: "How many commercial aircraft are in the air worldwide at a typical moment?", unit: "aircraft", truth: 10000, decomposition: "About 100,000 flights a day, each about 2.5 hours in the air: 100,000 × 2.5 / 24 ≈ 10,000." },
  { id: "f-gdp-us", prompt: "What is the annual GDP of the United States in dollars?", unit: "dollars", truth: 2.8e13, decomposition: "About 28 trillion dollars, roughly 80,000 dollars per person." },
  { id: "f-coin-flips-10-heads", prompt: "If you flip a fair coin once a second, how many seconds on average until you see 10 heads in a row?", unit: "seconds", truth: 2046, decomposition: "Expected flips to a run of n heads is 2^(n+1) − 2 = 2,046 for n = 10." },
  { id: "f-amazon-packages", prompt: "How many packages does Amazon deliver per day in the United States?", unit: "packages", truth: 1.5e7, decomposition: "About 5-6 billion a year / 365 ≈ 15 million a day." },
  { id: "f-steps-mile", prompt: "How many steps does a person take walking a mile?", unit: "steps", truth: 2100, decomposition: "A stride is about 0.75 m; 1,609 m / 0.75 ≈ 2,100." },
];
