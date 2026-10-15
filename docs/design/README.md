# StaySpot designs and wireframes

The [offline gallery](preview.html) contains **15 UI frames and 14 wireframes**, with member filters and SVG/PNG downloads. Open it locally without starting the app or databases. These are design artifacts; [application screenshots](../screenshots/) document the running UI separately.

The [Figma design](https://www.figma.com/design/0D2LeVzcuIvgOIi6pzxWED/StaySpot?node-id=6-3138) is the editable online source. The checked-in exports preserve the supplied screen names and the four-member allocation. [Users and design decisions](users_and_style.md) describes the guest and manager/analyst journeys.

## Complete board exports

| Board      | SVG                                                | PNG                                             |
| ---------- | -------------------------------------------------- | ----------------------------------------------- |
| UI mockups | [Full UI board](ui-mockups/figma_board.svg)        | [UI preview](ui-mockups/figma_board.png)        |
| Wireframes | [Full wireframe board](wireframes/figma_board.svg) | [Wireframe preview](wireframes/figma_board.png) |

The [UI overview](ui-reference-overview.png) and [wireframe overview](wireframes-overview.png) provide smaller contact sheets. Import an SVG into Figma to inspect vector groups; an SVG import does not recreate native components or prototype links.

## Screen ownership

Each linked SVG has a PNG with the same filename in the same folder.

| Screen                         | Member | UI                                             | Wireframe                                  |
| ------------------------------ | ------ | ---------------------------------------------- | ------------------------------------------ |
| 00 Foundations & Users         | 1      | [SVG](ui-mockups/00_foundations.svg)           | [SVG](wireframes/00_foundations.svg)       |
| 00b User Flows                 | 1      | [SVG](ui-mockups/00b_user_flows.svg)           | [SVG](wireframes/00b_user_flows.svg)       |
| 01 Browse Properties           | 1      | [SVG](ui-mockups/01_browse.svg)                | [SVG](wireframes/01_browse.svg)            |
| 01b Browse Guests              | 1      | [SVG](ui-mockups/01b_browse_guests.svg)        | [SVG](wireframes/01b_browse_guests.svg)    |
| 02 Property Details            | 1      | [SVG](ui-mockups/02_property_details.svg)      | [SVG](wireframes/02_property_details.svg)  |
| 03 Transaction / Book Stay     | 2      | [SVG](ui-mockups/03_book_stay.svg)             | [SVG](wireframes/03_book_stay.svg)         |
| 03b Booking Failures           | 2      | [SVG](ui-mockups/03b_booking_failures.svg)     | [SVG](wireframes/03b_booking_failures.svg) |
| 04 Booking Status & Constraint | 2      | [SVG](ui-mockups/04_booking_status.svg)        | [SVG](wireframes/04_booking_status.svg)    |
| 05 Wallet Audit Trail          | 2      | [SVG](ui-mockups/05_wallet_audit.svg)          | [SVG](wireframes/05_wallet_audit.svg)      |
| 06 Analytics                   | 3      | [SVG](ui-mockups/06_analytics.svg)             | [SVG](wireframes/06_analytics.svg)         |
| 07 Map / Search Hotspots       | 4      | [SVG](ui-mockups/07_search_map.svg)            | [SVG](wireframes/07_search_map.svg)        |
| 08 Reviews & Amenities         | 4      | [SVG](ui-mockups/08_reviews.svg)               | [SVG](wireframes/08_reviews.svg)           |
| 09 Shared States               | Shared | [SVG](ui-mockups/09_shared_states.svg)         | [SVG](wireframes/09_shared_states.svg)     |
| 10 Phone Layout                | Shared | [SVG](ui-mockups/10_phone_layout.svg)          | [SVG](wireframes/10_phone_layout.svg)      |
| Extra Interaction States       | Shared | [SVG](ui-mockups/extra_interaction_states.svg) | UI board only                              |

Property Details is a modal over Browse. Booking Status is part of Browse → Bookings. The source mapping is in the [member guide](../members/README.md).

## Error and edge cases

The [design review](review/README.md) records loading, empty results, retryable errors, invalid dates/coordinates/nights, missing records, insufficient funds, active-stay conflicts, guest switching and mobile recovery. The [review gallery](review/preview.html) and its complete [UI](review/StaySpot_ALL_UI_Updated.svg) / [wireframe](review/StaySpot_ALL_Wireframes_Updated.svg) boards are also retained.

## Original sketches

The original six early wireframes remain available: [Browse](01_browse.svg), [Transaction](02_transaction.svg), [Audit](03_audit.svg), [Analytics](04_analytics.svg), [Map](05_map.svg) and [Reviews](06_reviews.svg). The current presentation exports are in `ui-mockups/` and `wireframes/`. The older Excalidraw files and generation scripts are not required to view these SVG/PNG deliverables.
