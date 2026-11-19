# BloodLink — Delhi Blood Donor Finder

BloodLink is an educational Analysis and Design of Algorithms project. It demonstrates finding compatible donor records, ranking them by shortest route in a small Delhi locality graph, and selecting donors while avoiding repeated locations where possible.

## Submission links

- **Source code repository:** [Blood-Donor-Finder-ADA](https://github.com/anaysixty6/Blood-Donor-Finder-ADA)
- **Live application:** [Open BloodLink](https://anaysixty6.github.io/Blood-Donor-Finder-ADA/)

## Tech stack

- HTML, CSS, and JavaScript (ES modules)
- Browser local storage for donor records
- GitHub Pages for the live static site
- No server, database, package installation, or API keys are required

## Run locally

1. Install Python 3.
2. Download or clone this repository and open a terminal in the project folder.
3. Start a local web server:
   `python -m http.server 8000`
4. Open [http://localhost:8000](http://localhost:8000).

You can also serve the folder with another local static web server. Opening `index.html` directly may prevent JavaScript modules from loading.

## Demo sign-in

There is no real user account or authentication backend. Select **Continue as guest** to enter the app. The sign-in form is a classroom interface only; it does not verify or securely store credentials. Do not enter a real password.

## What the project demonstrates

- 30 fictional donor records across five Delhi localities, with illustrative PIN codes
- ABO/Rh red-cell compatibility filtering and availability checks
- Dijkstra's shortest-path algorithm over a weighted locality graph
- Merge sort to rank candidates by route distance, registration order, and donor ID
- Greedy donor selection, with backtracking when the location-diversity constraint makes the initial selection infeasible
- Donor registration stored only in the current browser's local storage

The graph distances are illustrative teaching values, not real road distances or navigation guidance. Sample donor details are fictional. This site is not for real donor coordination or clinical decisions.

## Algorithms and complexity

Let `N` be the number of donor records, `M` the number of compatible and available candidates, `V` the number of locality nodes, `E` the number of graph edges, and `k` the number of donors requested.

| Stage | Method | Time complexity | Extra space |
| --- | --- | --- | --- |
| Compatibility and availability filtering | Linear scan | `O(N)` | `O(M)` |
| Shortest locality routes | Dijkstra with binary min-heap and adjacency list | `O((V + E) log V)` | `O(V + E)` |
| Candidate ranking | Merge sort | `O(M log M)` | `O(M)` buffers and `O(log M)` recursion stack |
| Initial selection | Greedy choice from ranked candidates | `O(k)` | `O(k)` |
| Location-diversity fallback | Depth-first backtracking | `O(2^M)` worst case | `O(M)` |

The usual path is `O(N + (V + E) log V + M log M)`. The backtracking fallback can take exponential time in the worst case.

## Security and configuration

This static classroom project has no secrets or environment variables, so an `.env.example` file is not needed. Donor changes remain in browser local storage and are not shared with other users or devices. Do not enter real personal, medical, or contact information. A production service would need secure authentication, protected storage, consent, audit logging, and clinical oversight.

## Sample locality mapping

| Area | Illustrative PIN |
| --- | --- |
| Rohini | 110085 |
| Connaught Place | 110001 |
| Laxmi Nagar | 110092 |
| Dwarka Sector 6 | 110075 |
| Lajpat Nagar | 110024 |

These are sample inputs for the demonstration. Route edge weights are invented for algorithm teaching and are not measured travel distances.
