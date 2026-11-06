# Sets: how sets are counted and what the zones mean

This is the science behind the **Sets** body graph on Statistics, the muscle distribution radar and
Set count. Code: `lib/training/effort.ts` (`setEfforts`, `hardSets`), `ZONES` in
`constants/training.ts`. Written 2026-10-31 from a
literature search: every rule below names the study it comes from, and the gaps are marked.

## 1. What counts as a set

Muscle growth follows the number of **hard sets**: sets that end at or close to failure. It does
not follow the kilos lifted. A heavy set of 6 to failure counts as much as a set of 12 to failure.

- **Schoenfeld, Ogborn & Krieger 2017**, *J Sports Sci* (PMID 27433992). This meta-analysis counts
  sets that end at or near failure.
- **Robinson et al. 2024**, *Sports Med* (PMID 38970765). Growth rises as sets end closer to
  failure.

How the app scores each set. It uses only what you logged and never guesses:

| Set | Counts as | Why |
|---|---|---|
| **F** (failure) | 1 | a hard set by definition |
| **Reps left** 0–3 | 1 | within ~3 reps of failure = a hard set (Robinson 2024) |
| **Reps left** 4+ | 0.86 at 4, down to 0.3 at 8+ | further from failure, less stimulus (Robinson 2024) |
| **Nothing logged** | 1 | taken as a working set close to failure |
| **W** (warm-up) | 0.3 | a small credit; see the gap below |

Earlier versions guessed how hard a set was by comparing it with the best of the last 90
days. That marked failure sets done on a tired day, or late in a workout, as easy (chest fly 66×10
scored 0.3). The guess is gone.

**Gap:** no study tests whether warm-up sets add growth. The research suggests counting them as
0. Hevier uses 0.3 as a small credit.

## 2. Main muscle and helper muscles

Each set counts **1** for its main muscle and **0.5** for each helper muscle. For example, an
incline press counts 1 for chest and 0.5 for shoulders and triceps.

- **Pelland et al. 2024** (preprint, full text read; published in *Sports Med* 2026, PMID
  41343037). They tried three ways to count helper-muscle sets on 67 studies. Counting them as
  half a set ("fractional") fit the data best.

At most 12 sets per muscle in one workout count. Sets past that add little ("junk volume").

## 3. The zones (hard sets per muscle per week)

| Zone | Weekly sets | Where it comes from |
|---|---|---|
| Below maintenance | under 3 | nothing lower than 3 a week has been tested for keeping muscle |
| Maintenance | 3 | **Bickel et al. 2011**, *Med Sci Sports Exerc* (PMID 21131862): after 16 weeks of training, 3 quad sets a week (one set of 3 exercises, once a week) kept the muscle size for 32 weeks in adults aged 20–35 |
| Growth | 4+ | **Pelland 2024**: 4 sets a week is the smallest weekly dose that grew muscle measurably |

Supporting studies:

- **Schoenfeld 2017.** All three volume groups grew: under 5 sets a week about 5.4%, 5–9 sets
  6.6%, 10+ sets 9.8%. More sets grew more, but low volumes grew too.
- **Pelland 2024.**
  - Growth keeps rising with more sets, but each extra set adds less. There is no clear ceiling.
  - 5–10 sets a week is the most efficient range.
  - How many sessions you split them over makes almost no difference.
- **Spiering et al. 2021**, *J Strength Cond Res* (PMID 33629972), a review. In young people, one
  session a week with one set per exercise kept muscle size for up to 32 weeks, as long as the
  weights stayed heavy.
- **Schoenfeld et al. 2019**, *Med Sci Sports Exerc* (PMC6303131), and **Aube et al. 2022**, *J
  Strength Cond Res* (PMID 32058362). Trained men grew on 6–9 and 12 sets a week split over
  sessions.

So about 8 hard sets a week over 2 sessions grows muscle in trained lifters. It's in Pelland's
efficient range, though below the maximum.

The radar's outer edge is 10 a week: past that, Pelland finds each extra set clearly gives less.
There is no "High" zone.

**Not used:** Barbalho et al. 2019/2020 (5–20 sets a week). Both papers were **retracted** for
problems in their data.

**Gaps:**

- The maintenance number comes from one study, on people who were untrained before it, mostly
  on the quads. Older adults (60–75) needed more.
- Pelland's 4 sets is a model estimate, not a measured threshold.
- 1–2 sets a week has not been tested.

## Sources

Read on 2026-10-31. "Abstract" means only the abstract was available; full texts are marked.

- Schoenfeld, Ogborn & Krieger 2017, J Sports Sci: PMID 27433992 (abstract; the percentages from the
  author's summary at https://lookgreatnaked.com/blog/how-many-sets-do-you-need-to-perform-to-maximize-muscle-gains)
- Pelland 2024 preprint: https://sportrxiv.org/index.php/server/preprint/download/460/967/908 (full
  text); Sports Med 2026: PMID 41343037 (abstract)
- Robinson 2024, Sports Med: PMID 38970765 (abstract)
- Bickel 2011, Med Sci Sports Exerc: PMID 21131862 (abstract and a full-text copy)
- Spiering 2021, J Strength Cond Res: PMID 33629972 (abstract)
- Schoenfeld 2019, Med Sci Sports Exerc: PMC6303131 (full text)
- Aube 2022, J Strength Cond Res: PMID 32058362 (abstract)
- Barbalho 2019/2020 (retracted, not used): PMID 30779716, 32804467

Abstracts by PMID: `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:<PMID>`
