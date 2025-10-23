# shadcn/ui Setup Complete ✅

## What was installed

### Dependencies
- `@radix-ui/react-dialog` - Modal/dialog primitives
- `@radix-ui/react-dropdown-menu` - Dropdown menu primitives
- `@radix-ui/react-select` - Select/dropdown primitives
- `@radix-ui/react-checkbox` - Checkbox primitives
- `class-variance-authority` - CVA for component variants
- `tailwind-merge` - Merge Tailwind classes intelligently
- `clsx` - Conditional class names utility

### Files Created

1. **`src/lib/utils.ts`** - Utility function for merging class names
2. **`src/components/ui/card.tsx`** - Card component with Header, Title, Description, Content, Footer
3. **`src/components/ui/button.tsx`** - Button with variants (default, destructive, outline, secondary, ghost, link)
4. **`src/components/ui/input.tsx`** - Input component
5. **`src/components/ui/select.tsx`** - Select/dropdown component with full Radix UI integration

### Configuration Updates

1. **`tailwind.config.js`** - Added shadcn/ui theme variables and dark mode support
2. **`src/index.css`** - Added CSS custom properties for light/dark themes

## How to Use

### Card Component
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Total Merchants</CardTitle>
    <CardDescription>Active merchants in the system</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">1,234</p>
  </CardContent>
</Card>
```

### Button Component
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Input Component
```tsx
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Search..." />
<Input type="email" placeholder="Email" />
```

### Select Component
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
  </SelectContent>
</Select>
```

## Next Steps

### Recommended Components to Add

1. **Dialog** - For modals (detail view, confirmations)
2. **Table** - For data tables (merchants, payments, activity)
3. **Badge** - For status indicators (KYC status, payment status)
4. **Tabs** - For switching between views
5. **Dropdown Menu** - For action menus
6. **Checkbox** - For bulk selection
7. **Toast** - For notifications (already using react-hot-toast, can keep or replace)
8. **Avatar** - For user profiles
9. **Separator** - For dividing sections
10. **Skeleton** - For loading states

### Migration Strategy

**Phase 1: Admin Dashboard Only** (Recommended)
- Replace custom Tailwind components in `AdminDashboard.tsx` with shadcn/ui
- Update `MerchantsPage.tsx` to use Table component
- Update `PaymentManagementPage.tsx` to use Card + Table
- Keep MUI for merchant-facing pages (POS, inventory, etc.)

**Phase 2: Gradual Merchant UI Migration** (Optional)
- Migrate one module at a time (e.g., Settings page first)
- Test thoroughly before moving to next module
- Keep MUI and shadcn/ui coexisting during transition

## Theme Customization

The theme is configured in `src/index.css` with CSS variables. You can customize:

- **Colors**: Edit HSL values in `:root` and `.dark`
- **Border radius**: Change `--radius` value
- **Spacing**: Use Tailwind's built-in spacing scale

## Dark Mode

Dark mode is enabled by default for the admin dashboard. Toggle by adding/removing the `dark` class on the root element:

```tsx
document.documentElement.classList.add('dark'); // Enable dark mode
document.documentElement.classList.remove('dark'); // Disable dark mode
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com)
