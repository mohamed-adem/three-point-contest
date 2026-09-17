# Lucky and bad luck charms — proposal

Status: placement version implemented in player profiles as Lucky charm and Jinx.

The implementation uses finish percentile (0 last, 100 winner, ties share
placement), averaged per contest. Both groups require three contests and picks
use the n / (n + 5) discount described below. Contests 15 and 17 are excluded
until the identity discrepancy and missing Majdi result are resolved. Visible
cards show raw differences and sample counts. The FG% design below is retained
as the original alternative, not the implemented metric.

For each player A, compare A's shooting in contests attended by player B with
A's shooting in contests where B was absent. Only contests A played count.
Attendance means a recorded contest entry, not spectators, which we do not track.

Use the average of A's per-contest FG percentages in each group, so longer
contests do not dominate. Exclude byes and unknown shots from attempts; exclude
contests with no recorded attempts. Keep sudden death separate because the
historical formats differ. The difference is reported in percentage points.

Require at least three contests with B and three without B. Otherwise show
"Not enough shared history". To reduce small-sample extremes, multiply the raw
difference by n / (n + 5), where n is the smaller group size. This is a product
heuristic, not a statistical confidence calculation. Choose the largest positive
adjusted difference as lucky charm and the most negative as bad luck charm.
If there is no positive or negative candidate, leave that label unassigned.
Show tied candidates together.

Player profile cards should show the person, FG% with and without them, the raw
percentage-point difference, both contest counts, and an expandable contest list.
Use "Played better together" and "Off nights together" as explanatory subtitles.
Include: "A fun correlation, not proof that someone changes your performance."

Before launch, inspect every eligible pair and compare recent-period results.
Attendance groups can line up with different eras, opponents, or a player's
improvement over time. Do not feed these labels into power rankings. A later
version could show uncertainty intervals and recent-only comparisons once enough
history exists.
