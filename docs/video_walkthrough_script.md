# StaySpot: recording script for the Assignment 2 demo

**Target length: 4 minutes 50 seconds. Assignment limit: 5 minutes.**

Send this file to the teammate recording the video. Read only the quoted narration aloud; the other text gives screen actions and preparation steps. Use the actual guest, booking ID, audit ID and balances shown during your recording.

## Before recording

1. Use the completed `StaySpot_A1B` project with all four member folders present. Start Docker Desktop and wait for its engine to be ready. With dependencies installed and this project's databases already initialized, run:

   ```bash
   cd StaySpot_A1B
   docker compose up -d --wait
   npm run build
   npm start
   ```

   Keep that terminal open. Open `http://127.0.0.1:3000`. If another instance already serves the updated build on port 3000, use that instance. Initialization and dependency installation belong before the timed recording; do not rerun setup or seeders on an initialized database.

2. Select a seeded guest using **Switch demo guest** in the header. Choose someone with enough wallet balance for two inexpensive one-night stays and no current `CHECKED_IN` booking. Around ₹50,000 is suitable. Check this through **Browse → Bookings → Selected guest only → CHECKED_IN**. Ananya Rao is an example, provided her current state meets these conditions.

3. Identify an inexpensive property. For the insufficient-funds demonstration, confirm that its displayed price multiplied by 365 exceeds this guest's wallet balance. Reset to one night for the successful demonstration. Do not edit wallet balances or database rows to stage the demo.

4. Prepare a second browser tab on **Search map**, at latitude `19.071971` and longitude `72.872308`. Click **Explore this area**. Keep the same origin in the main tab when demonstrating the map. The second tab will add a real demo search pin while the first tab demonstrates automatic polling.

5. Check that map tiles load. Search sessions have a two-hour TTL index, so old seeded pins may have expired. If necessary, use **Add a search pin** to create a few current demo pins before recording. Nearby origins such as `19.081971, 72.872308` and `19.091971, 72.872308` can give the distance list and hotspots something to show. Return the prepared second tab to `19.071971, 72.872308`. These are newly generated demo sessions; do not describe them as original seeded records.

6. Open `docs/design/wireframes-overview.png` and the `members/` folder in advance for the closing shot. Replace member-number credits with your real names and actual contributions. One person may narrate the complete video, or each member may record their assigned section.

7. Rehearse once. Speak at roughly 130–140 words per minute and leave brief pauses for results. Trim installation/download time and unrelated pauses; keep the actual booking outcomes and map polling visible. Avoid notifications and private terminal/environment contents.

## 00:00–00:15 — Introduction · Member 1

**Show:** Browse landing screen, StaySpot branding and the sidebar.

**Say:**

> Hello, we are Team [team number]. This is StaySpot, our Assignment 2 frontend for Project 3. It connects the inherited PostgreSQL and MongoDB workflows to six browser screens.

## 00:15–00:30 — Startup · Member 1

**Show:** Briefly switch to the prepared terminal. Show `docker compose ps` in a second terminal if desired, then return to the app and point to **Live databases**. Installation and seeding are already complete.

**Say:**

> Docker runs PostgreSQL and MongoDB. We build the React frontend and serve it through Express. The live badge checks both database connections.

## 00:30–00:55 — Browse and property details · Member 1

**Do:**

1. On **Properties**, use the next-page arrow and return to page one.
2. Search for the property selected during preparation. Open its card and show its price and location.
3. Close the dialog, briefly open **Guests**, then return to **Properties** and reopen the chosen property.
4. Click **Book this stay** to carry that property into the booking form.

**Say:**

> Browse provides properties, guests and bookings, with search, pagination and record details. Here are this property's price and location. Book this stay carries the selected property directly into the transaction form.

## 00:55–01:25 — Successful booking · Member 2

**Do:**

1. Point to the selected guest and available wallet balance.
2. Set **Number of nights** to `1` and **Starting status** to **Reserve for later**.
3. Point to the estimated total. Click **Confirm booking** once.
4. Show the success receipt, **Balance before**, **Balance after**, and **Trigger-created audit**.
5. Copy the new booking ID and note its audit ID for the next scenes.

**Say:**

> The guest reserves one night. The database procedure calculates the authoritative price and debits the wallet. The receipt shows the new booking, balances before and after, and the audit entry created automatically by the PostgreSQL trigger.

## 01:25–01:40 — Insufficient funds · Member 2

**Do:** In the same form, set nights to `365`, keep **Reserve for later**, and click **Confirm booking**. Show the insufficient-funds message and unchanged wallet balance. Reset nights to `1` afterward.

**Say:**

> A larger booking exceeds the wallet balance. The application shows a friendly error, and the failed transaction leaves the wallet unchanged.

## 01:40–02:15 — Status transitions and active-stay constraint · Member 2

**Do:**

1. Open **Browse → Bookings** and immediately search for the saved booking ID. You can type while the list is loading.
2. Show its `CONFIRMED` status and click **Check in**. Show `CHECKED_IN`.
3. Return to **Book a stay**. Select the prepared inexpensive property if needed, set nights to `1`, choose **Check in now**, and click **Confirm booking**.
4. Show the error that the guest already has a checked-in stay. The remaining wallet must be sufficient for this attempt, so the failure demonstrates the active-stay constraint rather than insufficient funds.
5. Return to **Browse → Bookings**, search the original booking ID again, and click **Complete stay**. Show `COMPLETED`.

**Say:**

> The booking moves from confirmed to checked in. A second simultaneous check-in is rejected by the partial unique index. That failure rolls back the attempted booking and debit. We can then complete the original stay, demonstrating the full status transition.

## 02:15–02:35 — Wallet audit trail · Member 2

**Do:** Open **Audit trail** with the same guest selected. Point to the successful booking's saved audit ID near the top, the debit amount and recorded running balance. Apply a date range that includes the demonstration transaction; API date bounds use UTC. If time permits, open the next page and return.

**Say:**

> Audit trail is a read-only wallet history, with the latest entries first. This entry matches our successful booking. Date filters narrow the history, and each row preserves the balance recorded when that wallet change occurred.

## 02:35–03:10 — Analytics and materialized totals · Member 3

**Do:**

1. Open **Analytics**. Show the summary cards, seven-day moving-average chart and ranked property table.
2. Point to the date controls and choose a valid period if a change is needed; the inclusive limit is 90 days.
3. Click **Refresh totals** and point to the updated **Last refreshed** time.

**Say:**

> Analytics uses the PostgreSQL window query for seven-day moving averages. The table displays daily DENSE_RANK results, so equal averages share a rank. The summary cards come from the materialized view. Refresh totals updates that view and its timestamp while the previous results remain visible.

## 03:10–04:00 — Search map and live updates · Member 4

**Do:**

1. Open **Search map**. Enter latitude `19.071971` and longitude `72.872308`, then click **Explore this area**. If the time dropdown is present, choose **Last 2 hours**.
2. Point to the origin marker, five-kilometre circle, nearby searches in distance order, and hotspot circles.
3. Switch briefly to the prepared second tab and click **Add a search pin** once at the same origin. Return to the first tab without refreshing it or pressing another control there.
4. Keep the first tab visible until its next polling update, normally within about 15 seconds plus request time. Point to the newly updated results.

**Say:**

> The map runs MongoDB's geoNear pipeline around a selectable origin, within five kilometres. Nearby sessions appear in distance order, and hotspot circles group local search activity. I will add a real search pin from a second tab. The original map picks up that change through polling, without a page reload. Search sessions also have a two-hour TTL index.

## 04:00–04:30 — Reviews and flexible amenities · Member 4

**Do:** Open **Reviews**. Show the current property's average rating, rating distribution, frequent tags and amenities. Open the property selector and choose another property with reviews. Point to nested amenities or house rules.

**Say:**

> Reviews uses MongoDB's facet pipeline to calculate the rating distribution, common location tags and overall average. The page also renders the property's flexible amenities document, including nested amenities and house rules. Selecting another property loads its own results.

## 04:30–04:50 — Design, contributions and closing · Member 1 or all members

**Show:** Briefly display the prepared wireframe overview and four member folders. Return to the app and narrow the window to show its mobile layout. Keep this shot short enough to finish before five minutes.

**Say:**

> Our wireframes and shared components guide the interface. Member one covers Browse and foundations; member two handles booking and audit; member three handles analytics; and member four handles maps and reviews. This completes the StaySpot walkthrough. Thank you.

Use your actual names/contributions in the final take. If any responsibility changed, update the spoken credits accordingly.

## Recorder's reference — do not read aloud

| Demonstration | Evidence to keep visible |
| --- | --- |
| Browse | Property/guest tabs, search, page controls, detail dialog |
| Workflow 1 | Successful booking ID, wallet before/after, trigger audit ID |
| Failure handling | Insufficient-funds message and active-stay error |
| Status transitions | CONFIRMED → CHECKED_IN → COMPLETED |
| Audit | Same guest and audit ID, date controls, stored running balance |
| Workflow 2 | Moving-average chart, DENSE_RANK table, refreshed materialized totals |
| Workflow 3 | Chosen origin, 5 km radius, distance list, hotspots, cross-tab polling |
| Workflow 4 | Rating buckets, tags, average and flexible PropertyAmenities |
| Design | Actual wireframes, member organization, small-screen layout |

**Important implementation correction:** the recently added frontend-only booking sorter currently fetches all matching API pages before sorting. This conflicts with Assignment 2's instruction not to load all 50,000+ rows into the browser at once. It needs correction before final submission. Do not claim that the current Bookings list fetches only one display page, or that this video proves compliance with that scale requirement. Searching the saved booking ID keeps the demonstrated lookup small but does not fix the unfiltered-list issue.

**Keep the narration accurate:** transaction boundaries are currently owned by the API; do not say the procedure starts REPEATABLE READ or commits internally. Do not claim today's test counts, a current total of 500,000 live map pins, or specific performance numbers without checking them. The existing README includes historical reference-project statements; show the current team's actual state and contributions.

**After recording:** check that the exported video is at most five minutes, that success/error messages and monetary values are legible, and that the map update is visible. Upload it to your chosen share location, test viewing access, and put the actual video link in the README. Keep real IDs and balances from the recording; do not replace them with invented values.
