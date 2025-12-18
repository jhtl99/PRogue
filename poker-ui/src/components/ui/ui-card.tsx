import * as React from "react";
import { cn } from "../../lib/utils";

type DivProps = React.ComponentPropsWithoutRef<"div">;

const UiCard = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => {
    return (
        
      <div
        ref={ref}
        data-slot="ui-card"
        className={cn(
          "bg-slate-900/60 text-slate-100 flex flex-col gap-6 rounded-xl border border-slate-700",
          className,
        )}
        {...props}
      />
    );
  },
);
UiCard.displayName = "UiCard";

const UiCardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="ui-card-header"
        className={cn(
          "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=ui-card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
          className,
        )}
        {...props}
      />
    );
  },
);
UiCardHeader.displayName = "UiCardHeader";

const UiCardTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h4">>(
  ({ className, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        data-slot="ui-card-title"
        className={cn("leading-none", className)}
        {...props}
      />
    );
  },
);
UiCardTitle.displayName = "UiCardTitle";

const UiCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      data-slot="ui-card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
});
UiCardDescription.displayName = "UiCardDescription";

const UiCardAction = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="ui-card-action"
        className={cn(
          "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
          className,
        )}
        {...props}
      />
    );
  },
);
UiCardAction.displayName = "UiCardAction";

const UiCardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="ui-card-content"
        className={cn("px-6 [&:last-child]:pb-6", className)}
        {...props}
      />
    );
  },
);
UiCardContent.displayName = "UiCardContent";

const UiCardFooter = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="ui-card-footer"
        className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
        {...props}
      />
    );
  },
);
UiCardFooter.displayName = "UiCardFooter";

export {
  UiCard,
  UiCardHeader,
  UiCardFooter,
  UiCardTitle,
  UiCardAction,
  UiCardDescription,
  UiCardContent,
};
