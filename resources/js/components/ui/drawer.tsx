import * as React from 'react';
import * as DrawerPrimitives from '@radix-ui/react-dialog';
import { RiCloseLine } from '@remixicon/react';
import { cn, focusRing } from '@/lib/utils';

/* -----------------------------------------------------------------------------
 * Root + Trigger + Close
 * -------------------------------------------------------------------------- */

const Drawer = (
    props: React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Root>,
) => <DrawerPrimitives.Root tremor-id="tremor-raw" {...props} />;
Drawer.displayName = 'Drawer';

const DrawerTrigger = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitives.Trigger>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Trigger>
>(({ className, ...props }, ref) => (
    <DrawerPrimitives.Trigger ref={ref} className={cn(className)} {...props} />
));
DrawerTrigger.displayName = 'Drawer.Trigger';

const DrawerClose = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitives.Close>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Close>
>(({ className, ...props }, ref) => (
    <DrawerPrimitives.Close ref={ref} className={cn(className)} {...props} />
));
DrawerClose.displayName = 'Drawer.Close';

/* -----------------------------------------------------------------------------
 * Portal + Overlay + Content (corrected structure)
 * -------------------------------------------------------------------------- */

const DrawerPortal = DrawerPrimitives.Portal;
DrawerPortal.displayName = 'DrawerPortal';

const DrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitives.Overlay>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Overlay>
>(({ className, ...props }, forwardedRef) => (
    <DrawerPrimitives.Overlay
        ref={forwardedRef}
        className={cn(
            'fixed inset-0 z-50 bg-black/5 ',
            'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out',
            'transition-opacity duration-300 ease-out',
            className,
        )}
        {...props}
    />
));
DrawerOverlay.displayName = 'DrawerOverlay';

const DrawerContent = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitives.Content>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Content>
>(({ className, children, ...props }, forwardedRef) => (
    <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitives.Content
            ref={forwardedRef}
            className={cn(
                // fit-content height, vertically centered
                "fixed right-2 top-1/2 -translate-y-1/2 z-50 flex w-[95vw] max-w-lg flex-col overflow-hidden rounded-md border p-6 shadow-lg focus:outline-hidden",
                // colors
                "border-gray-200 bg-white dark:border-gray-900 dark:bg-[#090E1A]",
                // motion
                "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
                "transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                focusRing,
                className,
            )}
            {...props}
        >
            {children}
        </DrawerPrimitives.Content>
    </DrawerPortal>
));

DrawerContent.displayName = 'DrawerContent';

/* -----------------------------------------------------------------------------
 * Header + Title + Description + Body + Footer
 * -------------------------------------------------------------------------- */

const DrawerHeader = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<'div'>
>(({ children, className, ...props }, ref) => (
    <div
        ref={ref}
        className="flex items-start justify-between gap-x-4 border-b border-gray-200 pb-4 dark:border-gray-900"
        {...props}
    >
        <div className={cn('mt-1 flex flex-col gap-y-1', className)}>
            {children}
        </div>

        {/* ✅ Native close button (Radix safe) */}
        <DrawerPrimitives.Close asChild>
            <button
                type="button"
                className="aspect-square rounded-md p-2 hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-800"
                aria-label="Close drawer"
            >
                <RiCloseLine className="size-6 text-gray-600 dark:text-gray-300" />
            </button>
        </DrawerPrimitives.Close>
    </div>
));
DrawerHeader.displayName = 'Drawer.Header';

const DrawerTitle = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitives.Title>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Title>
>(({ className, ...props }, forwardedRef) => (
    <DrawerPrimitives.Title
        ref={forwardedRef}
        className={cn(
            'text-base font-semibold text-gray-900 dark:text-gray-50',
            className,
        )}
        {...props}
    />
));
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitives.Description>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitives.Description>
>(({ className, ...props }, forwardedRef) => (
    <DrawerPrimitives.Description
        ref={forwardedRef}
        className={cn('text-gray-500 dark:text-gray-500', className)}
        {...props}
    />
));
DrawerDescription.displayName = 'DrawerDescription';

const DrawerBody = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex-1 space-y-6 py-4', className)}
        {...props}
    />
));
DrawerBody.displayName = 'Drawer.Body';

const DrawerFooter = ({
                          className,
                          ...props
                      }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'flex flex-col-reverse border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-gray-900',
            'bg-white px-6 pb-4 dark:bg-[#090E1A]',
            className,
        )}
        {...props}
    />
);
DrawerFooter.displayName = 'DrawerFooter';

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
    Drawer,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerPortal,
    DrawerTitle,
    DrawerTrigger,
};
