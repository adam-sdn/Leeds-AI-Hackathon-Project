You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
stock-category-list.tsx
import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

// Define the type for a single stock
interface Stock {
  name: string;
  ticker: string;
  price: number;
  change: number; // Can be positive or negative
}

// Define the type for a stock category, including an optional icon
export interface StockCategory {
  title: string;
  icon: React.ElementType;
  stocks: Stock[];
}

// Define the props for the main component
interface StockCategoryListProps {
  categories: StockCategory[];
}

/**
 * A reusable accordion component to display a list of stock categories.
 * @param {StockCategoryListProps} props - The props for the component.
 * @param {StockCategory[]} props.categories - An array of category objects to display.
 */
export const StockCategoryList = ({ categories }: StockCategoryListProps) => {
  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
      {categories.map((category, index) => (
        <AccordionItem value={`item-${index}`} key={category.title}>
          <AccordionTrigger className="text-lg font-medium hover:no-underline">
            <div className="flex items-center gap-3">
              <category.icon className="h-5 w-5 text-muted-foreground" />
              <span>{category.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4 pt-2">
              {category.stocks.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{stock.ticker}</p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium">${stock.price.toFixed(2)}</p>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        stock.change >= 0 ? 'text-green-500' : 'text-red-500',
                      )}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

demo.tsx
import { StockCategoryList, StockCategory } from '@/components/ui/stock-category-list';
import {
  Cpu,
  HeartPulse,
  Landmark,
  ShoppingBasket,
  Flame,
} from 'lucide-react';

// Demo data for 5 stock categories
const stockData: StockCategory[] = [
  {
    title: 'Technology',
    icon: Cpu,
    stocks: [
      { name: 'Apple Inc.', ticker: 'AAPL', price: 172.25, change: 1.12 },
      { name: 'Microsoft Corp.', ticker: 'MSFT', price: 340.54, change: -0.45 },
      { name: 'NVIDIA Corp.', ticker: 'NVDA', price: 470.61, change: 2.33 },
    ],
  },
  {
    title: 'Healthcare',
    icon: HeartPulse,
    stocks: [
      { name: 'Johnson & Johnson', ticker: 'JNJ', price: 165.78, change: -0.89 },
      { name: 'Pfizer Inc.', ticker: 'PFE', price: 35.12, change: 0.21 },
    ],
  },
  {
    title: 'Financials',
    icon: Landmark,
    stocks: [
      { name: 'JPMorgan Chase & Co.', ticker: 'JPM', price: 150.44, change: 0.55 },
      { name: 'Bank of America', ticker: 'BAC', price: 29.88, change: -1.02 },
      { name: 'Visa Inc.', ticker: 'V', price: 245.91, change: 0.15 },
    ],
  },
  {
    title: 'Consumer Staples',
    icon: ShoppingBasket,
    stocks: [
      { name: 'Procter & Gamble', ticker: 'PG', price: 155.60, change: 0.05 },
      { name: 'Coca-Cola Co.', ticker: 'KO', price: 60.10, change: -0.30 },
    ],
  },
  {
    title: 'Energy',
    icon: Flame,
    stocks: [
      { name: 'Exxon Mobil Corp.', ticker: 'XOM', price: 112.76, change: 1.78 },
      { name: 'Chevron Corp.', ticker: 'CVX', price: 164.21, change: 1.51 },
    ],
  },
];

// The demo component that renders the StockCategoryList
const StockCategoryListDemo = () => {
  return (
    <div className="p-4 md:p-8 bg-background">
        <StockCategoryList categories={stockData} />
    </div>
  );
};

export default StockCategoryListDemo;
```

Copy-paste these files for dependencies:
```tsx
originui/accordion
"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@radix-ui/react-icons";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b border-border", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-left font-semibold transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        width={16}
        height={16}
        strokeWidth={2}
        className="shrink-0 opacity-60 transition-transform duration-200"
        aria-hidden="true"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

```

Install NPM dependencies:
```bash
@radix-ui/react-icons, @radix-ui/react-accordion
```

Extend existing Tailwind 4 index.css with this code (or if project uses Tailwind 3, extend tailwind.config.js or globals.css):
```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}


@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
