# BloodLink: Blood Donor Finder & Management System

An Analysis and Design of Algorithms classroom project. BloodLink keeps a small donor directory in the browser, filters available red-cell donors by compatibility, calculates shortest demo routes across a Delhi locality graph with Dijkstra’s algorithm, then demonstrates greedy selection with a backtracking fallback when the requested set would repeat a location.

## Run the demo

1. Install Python 3 if needed.
2. From this folder, run `python -m http.server 8000`.
3. Open `http://localhost:8000` in a browser.

No package installation, account, server database, or network connection is required. The app uses fictional sample records and stores edits in the current browser's local storage. **Do not enter real donor contact details.**

## Features

- Add, edit, remove, filter, and update availability for donor records; donor IDs must be unique.
- Filter by red-cell compatibility and availability.
- Store a Delhi area/locality and optional six-digit PIN for each donor; enter a supported request area or PIN.
- Automatically run Dijkstra from the requested locality over a weighted Delhi demo graph. Rank compatible available donors by shortest route distance, then registration order and donor ID.
- Show each selected donor’s route and distance. Edge weights are illustrative teaching values, not live road distances or navigation guidance.
- Try the first `k` ranked candidates greedily. When the one-donor-per-location constraint is violated, backtracking searches ranked alternatives.
- Export the directory as CSV; reset to the bundled fictional sample data.
- Display the selected donor set, selection strategy, search states explored, and elapsed time.

## Inputs and outputs

Inputs: donor ID, name, optional contact, blood group, Delhi area/locality, optional PIN, availability, requested area/PIN, recipient blood group, donor count, and location-diversity constraint. Registration order is assigned automatically and retained when a record is edited.

Outputs: compatible available donors, ranked candidate list, selected donors, selection strategy, search states explored, and elapsed time.

## Algorithms and complexity

Let `N` be the donor count, `M` the compatible and available candidates, and `k` the requested donor count.

| Stage | Method | Time | Extra space |
| --- | --- | --- | --- |
| Compatibility and availability | Linear scan | `O(N)` | `O(M)` |
| Dijkstra route distances | Binary min-heap + adjacency list | `O((V + E) log V)` | `O(V + E)` |
| Candidate ranking | Merge sort | `O(M log M)` | `O(M)` buffers and `O(log M)` recursion stack |
| Greedy attempt | Take the first `k` ranked candidates | `O(k)` | `O(k)` |
| Constraint fallback | Depth-first combination search | `O(2^M)` worst case | `O(M)` recursion and selection state |

Here `V` is the number of locality nodes and `E` the number of graph edges. The main path is `O(N + (V + E) log V + M log M)`. In this classroom graph, `V` and `E` are small constants, so donor scanning and sorting dominate as the donor directory grows. Backtracking may dominate when it must explore many combinations. The program returns the first feasible combination in ranked order, so the fallback favors shorter routes while enforcing one donor per location.

## Benchmark

Run `node benchmark.mjs` to recreate `results/benchmark.csv`. The script uses deterministic synthetic records and the same Dijkstra-based matching function, warms up each input, and reports the median per-query time across 15 runs of 50 queries each. The scenario makes the first 12 ranked candidates share Rohini to trigger fallback search. Timings depend on the computer and runtime; they are observations, not guarantees. The benchmark measures execution time only, not memory.

## Manual verification cases

- Empty directory or no compatible donor: show a clear no-match message.
- Unavailable compatible donor: exclude it.
- Duplicate donor ID: reject the record.
- Top `k` donors from one location with alternatives elsewhere: invoke backtracking and return a location-diverse set.
- Fewer than `k` distinct eligible locations: return a location-diverse partial set and state the shortfall.
- Editing and deleting a donor: update counts and search results.
- CSV export: include the current records and header row.

## Scope and safety

This is an educational matching demo, not a clinical service. The compatibility table represents simplified red-cell ABO/Rh rules. A qualified transfusion service must verify blood type, crossmatch, donation eligibility, component type, and all clinical decisions. The browser-only app is not a secure system for real personal data. A production version would need authenticated roles, secure storage, audit logs, consent, and hospital/blood-bank integration.

## Course

Analysis and Design of Algorithms (ADA)

The sample Delhi locality/PIN pairs are Rohini (110085), Connaught Place (110001), Laxmi Nagar (110092), Dwarka Sector 6 (110075), and Lajpat Nagar (110024). Graph edge weights are invented for demonstrating shortest-path calculations and are not real route measurements. PINs are illustrative; verify any real PIN independently. PIN references: [India Post PIN Code List](https://www.indiapost.gov.in/rti/pincodelist).

