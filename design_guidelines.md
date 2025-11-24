# Design Guidelines: AI Language Evaluation Platform

## Design Approach

**Selected System:** Material Design 3 with educational platform adaptations
**Rationale:** Content-rich application requiring clear hierarchy, data visualization, and role-based interfaces. Material Design provides excellent patterns for forms, data tables, progress indicators, and feedback systems essential for educational platforms.

**Key Principles:**
- Clarity and efficiency over decoration
- Consistent information architecture across all three user roles
- Strong visual hierarchy for test-taking focus
- Data visualization clarity for progress tracking

## Typography

**Font Family:** Inter (via Google Fonts CDN)
- Primary: Inter (400, 500, 600, 700)
- Monospace: JetBrains Mono for code/scores (400, 500)

**Hierarchy:**
- Dashboard Headers: text-3xl font-bold
- Section Titles: text-2xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base font-normal
- Secondary/Meta: text-sm font-normal
- Captions: text-xs font-medium

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Dashboard margins: m-8, m-12

**Grid Structure:**
- Admin Dashboard: 3-column grid (lg:grid-cols-3) for stat cards
- Teacher Assignment Grid: 2-column (lg:grid-cols-2) for assignment cards
- Student Test Library: 2-3 column (md:grid-cols-2 lg:grid-cols-3) for test cards
- All dashboards: Single column mobile, expand on tablet/desktop

**Container Widths:**
- Main content area: max-w-7xl mx-auto
- Forms/Test interfaces: max-w-4xl mx-auto
- Narrow content (feedback): max-w-3xl

## Core Components

### Navigation
**Top App Bar:** Fixed header with platform logo, role indicator, user menu
- Height: h-16
- Structure: Logo left, navigation center, user avatar/menu right
- Mobile: Hamburger menu, drawer navigation

**Role-Based Sidebar (Desktop):**
- Width: w-64
- Teacher: Assignments, Students, Resources, Analytics
- Student: My Tests, Mock Tests, Results, Resources
- Admin: Dashboard, Users, Reports, Settings
- Mobile: Bottom navigation or drawer

### Dashboard Cards
**Stat Cards (Admin/Teacher):**
- Elevated cards with rounded-lg
- Icon + metric + label layout
- Grid layout: 3 cards per row desktop, stack mobile
- Padding: p-6

**Assignment Cards (Teacher):**
- Test type badge, title, description
- Student count, due date
- Action buttons (Edit, View Submissions, Delete)
- Border-l-4 accent for test type

**Test Cards (Student):**
- Test type icon, title, duration, difficulty badge
- Description preview
- "Start Test" primary button
- Completed tests: Show score badge

### Test-Taking Interface
**Speaking Test Layout:**
- Full-width container with max-w-4xl
- Top: Progress indicator (step 1 of 3)
- Center: Question prompt in large text-xl
- Audio recorder component with waveform visualization
- Record/Stop/Play controls as icon buttons
- Bottom: Skip/Submit navigation buttons
- Timer display in corner

**Audio Recorder Component:**
- Large circular record button (w-20 h-20)
- Recording indicator: pulsing red dot
- Waveform visualization during recording
- Playback controls post-recording
- Duration counter
- Delete/Re-record option

### Results & Feedback Display
**Score Breakdown:**
- Overall score: Large display (text-5xl font-bold) centered at top
- Category scores in 2-column grid:
  - Pronunciation
  - Fluency
  - Vocabulary
  - Grammar
- Each category: Score badge + progress bar + label
- AI feedback in expandable sections below each category

**Feedback Cards:**
- Teacher feedback: Quote-style with teacher avatar
- AI feedback: Expandable accordion sections
- Strengths/Areas for Improvement as bulleted lists
- Code-style blocks for specific examples

### Admin Analytics
**Dashboard Grid:**
- 3 stat cards: Total Students, Active Tests, Avg Score
- Line chart: Performance trends (h-64)
- Bar chart: Test completion rates
- Recent activity table

**Charts:**
- Use Chart.js or Recharts via CDN
- Consistent height: h-64 for main charts, h-48 for secondary
- Responsive: Stack on mobile

### File Upload Component
**Upload Interface:**
- Drag-and-drop zone with dashed border
- File type icons (PDF, PPT, Video)
- Upload progress bar
- File list with thumbnails/icons, name, size, delete button
- Max file size indicator

## Forms
**Consistency:**
- Input fields: Outlined style, rounded-md, p-3
- Labels: text-sm font-medium, mb-2
- Error messages: text-sm, mt-1
- Required asterisk: Shown on labels
- Button groups: flex gap-4, justify-end

**Assignment Creation (Teacher):**
- Test type selector: Radio button cards with icons
- Title, description: Full-width inputs
- Due date: Date picker
- Instructions: Rich text editor placeholder
- Resource attachments: File upload component
- Submit/Save Draft buttons

## Icons
**Library:** Heroicons via CDN
- Navigation: outline style
- Actions: outline style, solid on active
- Status indicators: solid style
- Size: w-5 h-5 for UI, w-6 h-6 for prominent actions

## Responsive Behavior
**Breakpoints:**
- Mobile: Stack all grids to single column
- Tablet (md:): 2-column layouts where appropriate
- Desktop (lg:): Full multi-column layouts, show sidebar

**Mobile Adaptations:**
- Hide sidebar, show bottom nav or drawer
- Stack dashboard cards vertically
- Reduce padding: p-4 instead of p-8
- Larger touch targets for buttons (min-h-12)

## Images
No hero images needed. This is a productivity application focused on functionality. Use:
- Icon-based visual hierarchy
- Data visualizations (charts/graphs)
- User avatars for personalization
- Test type illustrations as small icons/badges

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for all functions
- Focus indicators on all interactive elements
- Screen reader announcements for recording states
- Sufficient contrast ratios throughout
- Error messages linked to form fields