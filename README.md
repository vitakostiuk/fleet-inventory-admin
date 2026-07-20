# Fleet Inventory Admin

A client -> location -> device inventory explorer, built around the same
grouping shape as a production Lambda job that reconciles gym equipment
records across locations from an external API into a cached, structured
format.

## What it demonstrates

1. **Filter-aware grouping.** Filtering runs against the flat device list
   first, then the result is re-grouped into client -> location -> devices.
   This keeps group headers and counts accurate to what's actually visible,
   rather than filtering rows inside groups built from unfiltered data
   (which silently shows stale counts).
2. **Three-level data shape.** Mirrors a real reconciliation workflow:
   organization names get consolidated, location names get normalized
   (e.g. "Club #14"), and device serials get associated with a specific
   location.
3. **Collapsible groups with live counts.** Each client section can be
   collapsed independently while still reflecting the current filter set.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4. Data is a static mock
dataset shaped like the real grouped output.

## Running locally

```bash
npm install
npm run dev
```
