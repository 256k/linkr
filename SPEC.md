# Linkr - URL Tag Manager

## Concept & Vision

Linkr is a sleek, minimalist link management dashboard where users can organize and quickly find URLs using tags. The experience should feel like a personal bookmark library—fast, focused, and satisfying to use. The interface emphasizes speed of access and tag-based discovery over complex organization.

## Design Language

### Aesthetic Direction
Clean, modern utility design inspired by developer tools and productivity apps. High contrast with subtle depth through shadows and layering.

### Color Palette
**Dark Theme (default):**
- **Background**: `#0f0f0f` (deep black)
- **Surface**: `#1a1a1a` (card background)
- **Surface Elevated**: `#252525` (modals, hover states)
- **Primary**: `#6366f1` (indigo-500, action buttons)
- **Primary Hover**: `#4f46e5` (indigo-600)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a1a1aa` (zinc-400)
- **Text Muted**: `#71717a` (zinc-500)
- **Border**: `#27272a` (zinc-800)
- **Tag Background**: `#27272a`
- **Tag Text**: `#a1a1aa`

**Light Theme:**
- **Background**: `#ffffff`
- **Surface**: `#f5f5f5`
- **Surface Elevated**: `#ffffff`
- **Text Primary**: `#18181b`
- **Text Secondary**: `#71717a`
- **Text Muted**: `#a1a1aa`
- **Border**: `#e4e4e7`
- **Tag Background**: `#e4e4e7`
- **Tag Text**: `#52525b`

- **Error**: `#ef4444`

### Typography
- **Font Family**: Inter (Google Fonts) with system fallbacks
- **Headings**: 600 weight, tracking tight
- **Body**: 400 weight
- **Monospace for URLs**: JetBrains Mono

### Spatial System
- Base unit: 4px
- Card padding: 16px
- Gap between cards: 12px
- Border radius: 8px (cards), 6px (buttons), 16px (modals)

### Motion Philosophy
- Subtle, functional animations
- Modal: fade in + scale from 95% to 100%, 200ms ease-out
- Cards: fade in on load, 150ms stagger
- Hover: background color transition 150ms
- Button press: scale 98% on active

### Visual Assets
- Icons: Lucide React (minimal stroke icons)
- No images required
- Subtle gradient accent on primary button

## Layout & Structure

### Page Structure
1. **Header Bar** (fixed top)
   - App title "Linkr" (left)
   - Search input (center, expands on focus)
   - Add button "+" (right)
   - Theme toggle button (sun/moon icon)

2. **Sidebar** (left side)
   - List of all used tags as clickable buttons
   - Active state for tags currently in search
   - "Clear all" button when tags are selected
   - Hidden on mobile

3. **Main Content** (scrollable)
   - URL cards in a single column, max-width 800px
   - Cards display URL and associated tags
   - Empty state when no URLs exist

### Responsive Strategy
- Mobile-first
- Max-width container for readability
- Full-width search on mobile
- Touch-friendly tap targets (min 44px)

## Features & Interactions

### Core Features

**1. URL List Display**
- Shows all saved URLs with their tags
- Each card shows: Title (or URL if no title), tags as pills
- Click on URL opens in new tab
- Click on tag filters the list to show only URLs with that tag

**2. Search/Filter**
- Search input in header
- Filters URLs in real-time as user types
- Searches through tags (not URL text)
- Case-insensitive matching
- Shows match count
- Clear button when search has text

**3. Add New URL**
- "+" button opens modal
- Modal contains:
  - URL input (required)
  - Title input (optional) - if empty, uses first tag as title
  - Tags input (comma-separated, e.g., "react, typescript, frontend")
  - Tags are trimmed and deduplicated automatically
  - Save button (disabled until URL is provided)
  - Cancel button
  - Keyboard: Escape closes, Enter submits if valid

**4. Delete URL**
- Each card has a delete icon (appears on hover)
- Click shows confirmation or deletes directly
- URL is removed from list with fade-out

**5. Edit Tags**
- Edit icon on each card
- Opens modal pre-filled with current URL and tags
- Save updates the entry

### Edge Cases
- Empty URL list: Show friendly empty state with prompt to add first URL
- Empty title: Use first tag as the title (or URL if no tags)
- Duplicate URL: Allow (users may want same URL with different tag sets)
- Empty tags: Allow (URL without tags, title will be empty)
- Very long title: Wrap to multiple lines
- Very long tag list: Wrap to multiple lines

## Component Inventory

### SearchBar
- **Default**: Placeholder "Search by tags...", search icon
- **Focused**: Expanded width, subtle glow
- **With text**: Clear button appears on right
- **Empty results**: Shows "No URLs match your search"

### URLCard
- **Default**: Surface background, URL text, tag pills below
- **Hover**: Elevated background, delete/edit icons appear
- **Tags**: Rounded pills with tag background color
- **Tag hover**: Slight brightness increase, cursor pointer

### AddModal
- **Overlay**: Semi-transparent black backdrop
- **Modal**: Elevated surface, rounded corners, shadow
- **Form fields**: Dark inputs with focus ring
- **Buttons**: Primary for Save, ghost for Cancel
- **Error state**: Red border on invalid input, error message below

### Button
- **Primary**: Indigo background, white text
- **Ghost**: Transparent, text only
- **Icon**: Square aspect ratio, centered icon
- **Hover**: Darken background
- **Active**: Scale 98%
- **Disabled**: 50% opacity, no pointer events

### EmptyState
- Centered content
- Icon (bookmark or link icon)
- Text: "No URLs saved yet"
- Subtext: "Click + to add your first link"

## Technical Approach

### Stack
- React 18+ with TypeScript
- Vite for build tooling
- Supabase for backend (PostgreSQL + Auth)
- CSS for styling

### State Management
- React useState for URL list and UI state
- Supabase for persistent storage
- Supabase Auth for user authentication

### Data Model
```typescript
interface URLItem {
  id: string;          // UUID
  url: string;         // URL string
  title?: string;     // Optional page title (user-provided)
  tags: string[];      // Array of tag strings
  created_at: string;  // Timestamp from Supabase
  user_id: string;     // Supabase user ID
}
```

### Key Implementation Details
- Filter tags case-insensitively
- Data persisted to Supabase PostgreSQL
- User authentication via Supabase Auth
- If no title provided, use first tag as title fallback
