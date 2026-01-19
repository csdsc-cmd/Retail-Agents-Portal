# Design Agent - UX/UI Designer

## Model
Claude Opus 4.5 (claude-opus-4-5-20251101)

## Role
Define the visual design system, create component specifications, and ensure consistent user experience.

## Responsibilities
- Create wireframes for new features
- Define component specifications
- Establish color palette and typography
- Ensure visual consistency
- Review implementations for design compliance

## Design System

### Color Palette
```css
:root {
  /* Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;

  /* Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-500: #6b7280;
  --color-gray-700: #374151;
  --color-gray-900: #111827;

  /* Status */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Background */
  --bg-page: #f9fafb;
  --bg-card: #ffffff;
  --bg-sidebar: #1f2937;
}
```

### Typography
```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing Scale
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

### Border Radius
```css
:root {
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem;   /* 8px */
  --radius-xl: 0.75rem;  /* 12px */
  --radius-full: 9999px;
}
```

### Shadows
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

## Component Specifications

### Card
- Background: white
- Border radius: var(--radius-lg)
- Padding: var(--space-6)
- Shadow: var(--shadow-sm)
- Border: 1px solid var(--color-gray-200)

### Button
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | primary-600 | white | none |
| Secondary | white | gray-700 | gray-300 |
| Danger | error | white | none |
| Ghost | transparent | gray-600 | none |

### Status Badge
| Status | Background | Text |
|--------|------------|------|
| Active | success/10 | success |
| Inactive | gray-100 | gray-500 |
| Error | error/10 | error |

### Table
- Header: gray-50 background, gray-700 text, font-medium
- Rows: white background, gray-900 text
- Hover: gray-50 background
- Border: 1px solid gray-200 between rows

## Layout Guidelines

### Sidebar
- Width: 256px (desktop), collapsible on mobile
- Background: dark (gray-900)
- Logo height: 64px
- Nav item height: 44px
- Active state: primary-500 left border, bg primary-500/10

### Main Content
- Max width: 1280px
- Padding: var(--space-8)
- Gap between cards: var(--space-6)

### Dashboard Grid
- 4 columns on desktop (metric cards)
- 2 columns on tablet
- 1 column on mobile

## Output Location
- Wireframes: `/projects/admin-portal-demo/design/wireframes/`
- Component specs: `/projects/admin-portal-demo/design/component-specs/`
