# Security Training Traceability Platform - Design Guidelines

## Design Approach

**System Selected**: Material Design with enterprise refinements
**Justification**: This utility-focused platform prioritizes data clarity, efficient workflows, and professional credibility. Material Design provides robust patterns for complex tables, forms, and status indicators while maintaining accessibility and scalability.

**Key Principles**:
- Professional authority and trust
- Data clarity over decoration
- Efficient administrative workflows
- Public verification page balances accessibility with credibility

---

## Typography System

**Font Families**:
- Primary: Inter (headings, UI elements, data tables)
- Secondary: System UI fonts for optimal performance

**Hierarchy**:
- Page titles: text-3xl font-bold (admin) / text-4xl font-bold (public verification)
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base font-normal
- Table headers: text-sm font-semibold uppercase tracking-wide
- Table data: text-sm font-normal
- Labels: text-sm font-medium
- Helper text: text-xs
- Stats/metrics: text-2xl font-bold (numbers) + text-sm font-medium (labels)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Component internal padding: p-4, p-6
- Section spacing: py-8, py-12
- Card spacing: p-6
- Form field gaps: gap-4, gap-6
- Grid gaps: gap-6 (cards), gap-4 (compact data)

**Grid System**:
- Admin dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Stats metrics: grid-cols-2 md:grid-cols-4 gap-4
- Form layouts: Single column max-w-2xl for clarity
- Training detail page: Full-width data tables with horizontal scroll on mobile

**Container Widths**:
- Admin pages: max-w-7xl mx-auto px-6
- Public verification: max-w-3xl mx-auto px-6
- Forms: max-w-2xl

---

## Component Library

### Admin Dashboard
**Layout**: Sidebar navigation (collapsed on mobile) + main content area
- **Sidebar**: Fixed width 256px (desktop), drawer overlay (mobile)
  - Logo at top (h-16 flex items-center px-6)
  - Navigation items: py-3 px-6 with hover states
  - Active state: border-l-4 indicator
  
- **Top Bar**: h-16 flex items-center justify-between px-6
  - Breadcrumbs on left
  - Admin profile dropdown on right

- **Stats Cards**: Elevated cards with icon, metric number, label, trend indicator
  - Structure: p-6 rounded-lg shadow-sm
  - Icon: w-12 h-12 rounded-full p-3 (top-left or left-aligned)
  - Metric: text-2xl font-bold
  - Label: text-sm below metric

### Training Management
**Training Cards**: 
- Grid layout with image placeholder (if needed) or icon
- Title: text-lg font-semibold
- Metadata: date, duration, trainee count
- Stats bar: Mini progress visualization (passed/failed ratio)
- Action buttons: Primary CTA + secondary menu (3-dot)

**Training Detail View**:
- Hero section: Training name, description, key stats (total trainees, pass rate)
- Action bar: Search input (w-full md:w-96), filter dropdowns, "Upload Excel" button, "Export CSV" button
- Trainee table: Full-width responsive table with sticky header
  - Columns: Name, Email, Company, Status (badge), Actions (icon buttons)
  - Status badges: px-3 py-1 rounded-full text-xs font-medium
  - Row hover: Subtle background change
  - Checkbox column for bulk selection

### Forms & Inputs
**Excel Upload**:
- Drag-and-drop zone: border-2 border-dashed rounded-lg p-12 text-center
- Upload icon + "Drop Excel file or click to browse"
- File info display after selection
- Validation error list: Scrollable max-h-96 with individual error items

**Trainee Form**:
- Field groups with labels above inputs
- Input fields: h-10 px-4 rounded-md border
- Phone input: Country code dropdown + number field
- Status radio buttons: Horizontal layout with visual indicators
- Submit area: Sticky bottom bar (mobile) or standard button group (desktop)

### Certificate Components
**Certificate Preview** (admin):
- A4 aspect ratio container (max-w-2xl)
- Visual representation with placeholder content
- Download PDF button

**Digital Certificate** (actual PDF, described for reference):
- Professional header with logo
- Certificate title centered
- Body text with trainee/training details
- QR code: bottom-right (80x80px)
- Footer: Certificate ID, issue date

### Public Verification Page
**Hero Section**: 
- Centered layout (text-center)
- Large checkmark icon or certificate illustration
- "Certificate Verified" heading (text-4xl font-bold)
- Trainee name (text-2xl)

**Certificate Details Card**:
- Elevated card (shadow-lg rounded-lg p-8)
- Two-column layout (md:grid-cols-2):
  - Left: Trainee details, training info
  - Right: QR code (for re-verification), certificate ID
- Download button: Full-width primary button

**Invalid/Pending State**:
- Warning icon
- "Certificate Not Issued or Invalid" message
- Helper text explaining possible reasons

### Navigation & Headers
**Primary Navigation** (admin sidebar):
- Dashboard (home icon)
- Trainings (grid icon)
- Analytics (chart icon)
- Settings (gear icon)

**Breadcrumbs**: text-sm with separators (chevron-right icons)

### Data Visualization
**Stats Dashboard**:
- Stat cards in grid
- Simple bar charts for pass/fail ratios (using CSS or minimal charting library)
- Trend indicators: Arrow icons + percentage change

**Table Enhancements**:
- Sortable headers (with arrow indicators)
- Pagination: Numbers + prev/next (bottom-center)
- Empty states: Centered illustration + message + CTA
- Loading states: Skeleton loaders matching table structure

### Buttons & Actions
**Button Hierarchy**:
- Primary actions: Solid fill, px-6 py-2.5 rounded-md
- Secondary: Outline style
- Tertiary: Text-only with hover background
- Icon buttons: w-10 h-10 rounded-md (hover background)
- Danger actions: Distinct treatment for delete operations

**Action Patterns**:
- Bulk actions: Appear when rows selected (sticky bar at bottom of table)
- Dropdown menus: Align to trigger, shadow-lg
- Confirmation dialogs: Centered modal with backdrop blur

### Modals & Dialogs
- Backdrop: Fixed overlay with blur effect
- Content: max-w-lg rounded-lg shadow-xl p-6
- Header: text-xl font-semibold mb-4
- Body: Scrollable if needed (max-h-96)
- Footer: Button group (justify-end gap-3)

### Status Indicators
**Badges**:
- Pending: Neutral treatment (text-xs px-3 py-1 rounded-full)
- Passed: Success treatment
- Failed: Error treatment

**Progress Indicators**:
- Linear progress bars for upload/processing
- Percentage displays for completion rates

---

## Responsive Behavior

**Breakpoints**:
- Mobile-first approach
- Sidebar → drawer (< md)
- Multi-column grids → stack (< md)
- Table → horizontal scroll or stacked cards (< sm)
- Action buttons → bottom sheet (mobile)

**Mobile Optimizations**:
- Larger touch targets (min 44px height)
- Bottom navigation bar alternative to sidebar
- Floating action button for primary action
- Simplified table views (show essential columns only, tap to expand)

---

## Animations

**Minimal, purposeful animations**:
- Page transitions: None (instant navigation)
- Modal appearance: Fade in backdrop + scale content (200ms)
- Dropdown menus: Slide down (150ms)
- Status updates: Fade between states
- Loading states: Pulse animation on skeletons
- Success confirmations: Brief checkmark animation

Avoid: Scroll animations, parallax, decorative motion

---

## Images & Icons

**Icons**: Heroicons (outline for navigation, solid for status indicators)
**Illustrations**: 
- Empty states: Simple line illustrations
- Public verification page: Certificate/checkmark illustration (hero)
- Error states: Alert/warning illustrations

**Photos**: Not required for this application (data-focused admin tool)

---

## Special Considerations

**Excel Upload Feedback**: 
- Real-time validation display
- Success/error summary with counts
- Downloadable error report (CSV)

**QR Code Display**:
- Sufficient size for scanning (minimum 200x200px on screen)
- High contrast background
- Instructions near QR code

**Print-Friendly Certificate**:
- A4 dimensions respected
- High-resolution QR code in PDF
- Professional typography suitable for printing

**Accessibility**:
- ARIA labels on all interactive elements
- Keyboard navigation for tables and forms
- Focus indicators on all focusable elements
- Status changes announced to screen readers
- Sufficient contrast ratios throughout