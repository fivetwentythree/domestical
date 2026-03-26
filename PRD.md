**VERY IMPORTANT**
make sure the user interface is elegant and not stock ai slop 

# PRD — Master Airbnb Calendar via iCal 
## Working title
**Atlas Calendar**  
(A clean internal codename; rename later)

---

# 1) Product goal

Create a fast, elegant master calendar for multiple Airbnb properties using iCal feeds, with a UI that makes it effortless to:  

- see all properties in one place
- scan availability quickly
- navigate through time fluidly
- spot vacancies, back-to-backs, and blocked dates
- jump between portfolios/properties without friction

This is **not** a reservation CRM.  
This is an **availability command center**.

---

# 2) Scope

## In scope
- Import multiple Airbnb iCal feeds
- Normalize them into one master calendar
- Show one row per property
- Show booked / blocked / available states
- Fast timeline navigation
- Search, filter, group, zoom
- Manual refresh + background sync
- Clean, premium UX
- Responsive desktop-first web app

## Out of scope
- Guest messaging
- Payment data
- Revenue analytics
- Editable reservations via Airbnb API
- Deep reservation metadata
- Channel manager features
- Complex operations workflows

---

# 3) Core product philosophy

This app should feel like:

- **faster than a PMS**
- **cleaner than Google Calendar**
- **more intuitive than a spreadsheet**
- **more elegant than a stock SaaS dashboard**

The UX should prioritize:
1. **scanability**
2. **speed**
3. **spatial memory**
4. **minimal cognitive load**
5. **fluid interaction**

---

# 4) Primary UX model

## Main view = horizontal timeline
This is the core experience.

- **Rows** = properties
- **Columns** = days
- **Bars** = reservations / blocked ranges
- **Empty space** = available dates

This is the most intuitive model for multi-property availability.

## Default zoom
**14-day view** should be the default.

Why:
- 7 days is too narrow
- 30 days is too dense for multi-property scanning
- 14 days is the sweet spot for planning and turnover awareness

## Additional zoom levels
- 7 days
- 14 days
- 30 days
- 90 days

---

# 5) Key user jobs

The app should make these tasks instant:

1. **What’s available this weekend?**
2. **Which properties are occupied right now?**
3. **Where are the gaps between bookings?**
4. **Which listings have same-day turnover?**
5. **Can I jump to next month without losing orientation?**
6. **Can I quickly focus on one property or one city?**

---

# 6) Information architecture

## Main app sections
### A. Master Timeline
Primary screen. Most-used view.

### B. Property Directory / Settings
Manage properties, feed URLs, grouping, labels.

### C. Sync Center
Feed health, last sync, manual refresh, errors.

That’s it for MVP.  
Do **not** overcomplicate with 8 dashboard tabs.

---

# 7) Master Timeline screen spec

## Layout

### Top toolbar
Left to right:
- App title / logo
- Search properties
- Group filter
- Date controls
- Zoom controls
- View options
- Sync status
- Manual refresh button

### Left sticky column
For each property row:
- thumbnail or simple icon
- property name
- short location / group label
- optional source badge
- “focus” action

### Top sticky date header
- day name
- day number
- month separators
- weekend shading
- current day highlight

### Main timeline grid
- horizontal day columns
- booking bars spanning date ranges
- availability shown by whitespace
- blocked dates in a different style from booked dates
- turnover indicators on check-out/check-in boundaries

### Right-side drawer
Opens on click of a bar:
- property name
- source feed
- start / end dates
- event type
- optional raw summary from iCal
- last synced timestamp

No full-page navigation for this.  
Use a drawer so context stays intact.

---

# 8) Navigation design requirements

This part matters most.

## Navigation must feel fluid
The user should never feel “stuck” in one month grid.

### Required controls
- **Today**
- **Previous / Next**
- **Jump to date**
- **Zoom switcher**: 7 / 14 / 30 / 90 days
- **Quick jumps**:
  - This weekend
  - Next weekend
  - This month
  - Next 30 days

## Scroll behavior
- Vertical scroll = properties
- Horizontal scroll = time
- Sticky property labels stay visible
- Sticky date header stays visible
- Smooth trackpad and mouse-wheel support
- High-FPS panning behavior

## Keyboard shortcuts
Required:
- `T` = jump to today
- `← / →` = move timeline backward/forward
- `1 / 2 / 3 / 4` = zoom levels
- `/` = focus search
- `Esc` = close drawer / clear focus

## Fast focus modes
- Click property name → expand/focus single property
- Filter by group/city/portfolio
- “Available only” mode
- “Turnovers only” highlight mode

---

# 9) Visual design principles

## Overall tone
- premium
- restrained
- operational
- elegant
- not playful
- not generic SaaS

## Visual rules
- mostly neutral palette
- one accent color for actions
- semantic colors only where useful
- subtle borders
- compact but breathable spacing
- tabular numerals for dates
- quiet grid lines
- no giant empty cards

## Status colors
Keep this minimal:
- **Booked** = solid calm color
- **Blocked / maintenance** = muted gray or striped fill
- **Today** = vertical accent line
- **Turnover** = subtle marker, not screaming red everywhere

## Motion rules
- only small transitions
- 120–180ms interactions
- no bouncy animations
- no heavy parallax
- no animation framework driving scroll

The interface should feel **precise**, not decorative.

---

# 10) MVP feature set

## Property management
- Add property name
- Add iCal URL
- Assign group / portfolio / city
- Enable / disable feed
- Reorder properties manually

## Calendar display
- Multi-property master timeline
- Day-based grid
- 7 / 14 / 30 / 90-day zoom
- Sticky rows + sticky header
- Current day marker
- Weekend shading
- Month separators

## Search and filtering
- Search by property name
- Filter by group
- Filter by availability status
- Show only selected properties

## Event display
- Imported occupancy blocks from iCal
- Different visual styles for:
  - booked
  - blocked
  - unavailable
- Click event → details drawer

## Sync
- Background refresh on interval
- Manual refresh
- Last synced timestamp
- Feed error state

## Utility views
- “Available gaps” highlight
- “Turnovers” highlight

---

# 11) Nice-to-have after MVP

## Phase 2
- Collapsible groups
- Saved views
- Drag-to-select date range for inspection
- Bottom minimap for long-range navigation
- Pin favorite properties
- Color by portfolio or status
- Read-only share link for team

## Phase 3
- Apple/Google calendar export
- Slack/email feed failure alerts
- Notes per property/date
- Maintenance overlays
- Basic occupancy summary

---

# 12) Data model

Because this is iCal-only, keep the model simple.

## Entities

### Property
- id
- name
- group_id
- location_label
- thumbnail_url
- is_active
- sort_order
- created_at
- updated_at

### CalendarFeed
- id
- property_id
- provider_type (`airbnb_ical`)
- feed_url
- sync_status
- last_synced_at
- last_success_at
- last_error_at
- error_message

### CalendarEvent
- id
- property_id
- feed_id
- external_uid
- title_raw
- starts_at
- ends_at
- event_type (`booked`, `blocked`, `unknown`)
- checksum
- first_seen_at
- last_seen_at

### Group
- id
- name
- color_token
- sort_order

---

# 13) iCal sync behavior

## Import method
Each property gets one Airbnb iCal URL.

## Sync cadence
- Auto-sync every **10–15 minutes**
- Manual refresh available
- On first import, fetch immediately

## Parsing rules
- Normalize all feed dates into property/account timezone
- Parse `VEVENT` ranges
- Deduplicate using `UID` + checksum
- Update events when feeds change
- Soft-remove stale events if no longer present after repeated syncs

## Important constraint
Airbnb iCal is **not real-time guaranteed**.

So the UI must always show:
- last synced timestamp
- feed health
- refresh action

Do not imply instant two-way sync.

---

# 14) Performance requirements

This is a major part of the PRD.

## UX performance targets
- Initial timeline render should feel instant after data is loaded
- Horizontal navigation should feel smooth at all zoom levels
- Scrolling should target **60fps**
- Property switching and filters should feel sub-100ms
- Drawer opening should feel immediate
- No layout thrash on scroll

## Scale target for MVP
Handle comfortably:
- 25–150 properties
- 90 days visible
- several thousand imported events total

## Required technical tactics
- virtualized rows
- efficient date-column rendering
- memoized event layout
- precomputed visible ranges
- optimistic UI for filters
- cached feed responses
- background sync jobs

---

# 15) Technical architecture recommendation

## Frontend recommendation
For this specific product, I would recommend:

- **React**
- **Vite**
- **TypeScript**
- **TanStack Router**
- **TanStack Query**
- **TanStack Virtual**
- **custom timeline grid**
- **headless UI primitives only**
- **custom design system**

### Why this stack
Because this app is:
- authenticated
- interaction-heavy
- dashboard-like
- not SEO-dependent
- dependent on smooth client-side state and virtualization

A Vite-based React app is a very strong fit here.

## Why not a stock calendar package
Do **not** use FullCalendar as the core UX.

Reason:
- it will look generic
- interaction model is wrong for this use case
- customization becomes awkward
- performance suffers once you force it into a property timeline pattern

Use a **custom-built timeline** instead.

---

# 16) Up-to-date / non-deprecated framework policy

This should be part of the engineering brief.

## Rules
- Use **latest stable** versions at project kickoff
- No deprecated packages
- No abandoned drag/drop libraries
- No legacy React scaffolds
- No old date libraries if modern alternatives exist
- No beta/RC in production unless explicitly approved

## Specifically avoid
- **Create React App**
- **Moment.js** for primary date handling
- **react-beautiful-dnd**
- heavy legacy calendar widgets as the main UI

## Preferred modern tooling families
- React + Vite
- TypeScript
- TanStack ecosystem
- `date-fns` or similarly modern date utilities
- `dnd-kit` if drag interactions are added later
- Radix UI / React Aria style headless primitives for accessibility

## Runtime / backend
- **Node.js current LTS**
- **PostgreSQL**
- **Redis** for queues/cache if needed
- **Fastify** or similarly modern high-performance API layer

---

# 17) Backend recommendation

## API layer
Use:
- **Fastify + TypeScript**

Why:
- very fast
- stable
- low overhead
- good fit for feed ingestion + dashboard API

## Database
- **PostgreSQL**

## Jobs / sync
- scheduled fetch jobs for iCal feeds
- queue for retries and backoff
- store normalized event ranges

## Cache
- Redis optional but recommended for:
  - sync queue
  - rate limiting
  - short-lived API caching

---

# 18) Frontend implementation notes

## Core timeline rendering
Use:
- CSS Grid for date columns
- absolute-positioned or grid-positioned booking bars
- sticky header and sticky first column
- virtualization for property rows
- careful memoization so only visible rows rerender

## Avoid
- rerendering the whole grid on every scroll
- giant nested DOM trees
- JS-driven layout for every frame
- expensive animation wrappers around all cells

## UI primitives
Use headless primitives for:
- drawer
- popover
- tooltip
- select
- command palette

But styling must be fully custom.

---

# 19) UX details that make it feel intuitive

## Default state
When the user lands:
- timeline centered around today
- 14-day zoom
- all active properties visible
- subtle today line
- weekends shaded
- bookings clearly visible

## Good interaction patterns
- click a row → highlight it
- double click a property → focus mode
- hover date column → subtle column highlight
- click a booking → side drawer
- search instantly filters visible rows
- group sections can collapse
- zoom preserves center date so user doesn’t lose place

## Helpful visual cues
- faint line every 7 days
- month labels on transitions
- row hover for orientation
- compact property cards with good truncation
- no overwhelming legend if colors are self-explanatory

---

# 20) Accessibility requirements

Even though this is ops software, accessibility still matters.

## Requirements
- full keyboard navigation
- visible focus states
- sufficient color contrast
- color is not the only status signal
- tooltips/drawers are screen-reader friendly
- reduced-motion support

---

# 21) Security / product constraints

## Security
- authenticated access only
- encrypted feed URLs at rest if possible
- role-based access later if team expands

## Constraints from iCal
- feed freshness is external
- event metadata is limited
- different feeds may represent blocks slightly differently
- timezone handling must be explicit and tested

---

# 22) MVP success criteria

The product is successful if a user can:

- add 20+ Airbnb iCal feeds in under 15 minutes
- see all properties in one timeline
- jump across weeks/months without confusion
- instantly tell which properties are available
- inspect any reservation block in one click
- trust the freshness of the displayed data
- use the app without training

---

# 23) Acceptance criteria

## Calendar rendering
- Rows represent properties
- Columns represent dates
- Event bars render correctly across ranges
- Today marker is always visible when in range
- Sticky row labels and sticky date header work reliably

## Navigation
- Today / Prev / Next / Jump to date work
- Zoom changes do not reset context unexpectedly
- Search/filter updates the timeline immediately
- Keyboard shortcuts function correctly

## Sync
- Feed imports succeed for valid Airbnb iCal URLs
- Invalid URLs show actionable error states
- Last synced timestamp updates correctly
- Manual refresh works per feed and globally

## Performance
- Timeline remains smooth with at least 100 properties
- Scrolling does not stutter on modern laptops
- Filters/search feel instant
- No major hydration or rendering lag

---

# 24) Recommended build sequence

## Phase 1
- data model
- iCal ingestion
- property setup
- basic timeline rendering

## Phase 2
- sticky layout
- zoom modes
- filters/search
- drawer details
- sync status

## Phase 3
- performance pass
- virtualization
- keyboard shortcuts
- available-gap and turnover highlights

## Phase 4
- visual polish
- animation tuning
- empty/error states
- responsive refinement

---

# 25) Final opinionated stack recommendation

If I were handing this to a team today, I would spec:

## Frontend
- React
- Vite
- TypeScript
- TanStack Router
- TanStack Query
- TanStack Virtual
- `date-fns`
- headless primitives (Radix UI or React Aria)
- custom CSS system / design tokens
- no stock admin template

## Backend
- Fastify
- TypeScript
- Node.js LTS
- PostgreSQL
- Redis + job queue for syncs
- reliable iCal parser

## Deployment
- frontend on Vercel or similar
- API/workers on a modern platform with cron/job support
- managed Postgres

---

# 26) One critical product decision

The biggest UX win here is:

## Do not make the month view the default.
Make the **timeline** the default.

Month view can exist later as a secondary option, but the timeline is what will make this feel intuitive and premium.

