"use client";

import * as React from "react";
import {
  Pyramid,
  Castle,
  Mountain,
  TowerControl,
  Building,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion"; 

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc?: string;
  iframeUrl?: string;
  icon?: React.ReactNode;
  linkHref?: string;
  category?: string;
}

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<
  HTMLUListElement,
  ExpandingCardsProps
>(({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(
    defaultActiveIndex,
  );
  const [activeIframe, setActiveIframe] = React.useState<number | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set initial iframe if defaultActiveIndex is provided
  React.useEffect(() => {
    if (defaultActiveIndex !== undefined && items[defaultActiveIndex]?.iframeUrl) {
      timeoutRef.current = setTimeout(() => {
        setActiveIframe(defaultActiveIndex);
      }, 600);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [defaultActiveIndex, items]);

  const gridStyle = React.useMemo(() => {
    if (activeIndex === null) return {};
    
    if (isDesktop) {
      const columns = items
        .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
        .join(" ");
      return { gridTemplateColumns: columns };
    } else {
      const rows = items
        .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
        .join(" ");
      return { gridTemplateRows: rows };
    }
  }, [activeIndex, items.length, isDesktop]);

  const handleInteraction = (index: number) => {
    if (activeIndex === index) return;
    
    setActiveIndex(index);
    setActiveIframe(null); // Unmount old iframe
    
    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Only mount new iframe after grid animation completes
    if (items[index].iframeUrl) {
      timeoutRef.current = setTimeout(() => {
        setActiveIframe(index);
      }, 600); // 600ms buffer for the 500ms grid transition
    }
  };

  return (
    <ul
      className={cn(
        "w-full gap-2",
        "grid",
        "h-[600px] md:h-[600px]",
        "transition-[grid-template-columns,grid-template-rows] duration-500 ease-out",
        className,
      )}
      style={{
        ...gridStyle,
        ...(isDesktop 
          ? { gridTemplateRows: '1fr' }
          : { gridTemplateColumns: '1fr' }
        )
      }}
      ref={ref}
      {...props}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm",
            "md:min-w-[80px]",
            "min-h-0 min-w-0",
            "border-white/10 hover:border-white/20 transition-colors"
          )}
          onMouseEnter={() => handleInteraction(index)}
          onFocus={() => handleInteraction(index)}
          onClick={() => handleInteraction(index)}
          tabIndex={0}
          data-active={activeIndex === index}
        >
          {/* Always render the image as the base background */}
          <img
            src={item.imgSrc}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-data-[active=true]:scale-100 group-data-[active=true]:grayscale-0 scale-110 grayscale"
          />

          {/* Iframe overlay - Delayed load to prevent UI freezing */}
          <AnimatePresence>
            {item.iframeUrl && activeIframe === index && (
              <motion.div 
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 h-full w-full bg-[#080a0f] z-10"
              >
                {/* Loading Spinner */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/50">
                  <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                  <span className="font-arabic text-sm">جاري تحميل الموقع...</span>
                </div>
                
                {/* Actual Iframe */}
                <iframe
                  src={item.iframeUrl}
                  className="relative z-10 w-full h-full border-0 pointer-events-auto"
                  loading="lazy"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent pointer-events-none z-20" />

          {/* Vertical Title for Collapsed State */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 opacity-100 transition-opacity duration-300 md:group-data-[active=true]:opacity-0">
            <div className="flex flex-col items-center gap-2 transform -rotate-90 whitespace-nowrap">
              {item.category && (
                <span className="text-xs font-arabic text-primary px-3 py-1 rounded-full border border-primary/20 bg-black/50 backdrop-blur-sm tracking-wider">
                  {item.category}
                </span>
              )}
              <h3 className="text-xl font-arabic font-bold text-white tracking-wider">
                {item.title}
              </h3>
            </div>
          </div>

          {/* Expanded Content */}
          <article
            className="absolute inset-0 flex flex-col justify-end gap-2 p-6 pointer-events-none z-30"
          >
            <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 w-fit opacity-0 transition-all duration-300 delay-150 ease-out group-data-[active=true]:opacity-100 translate-y-4 group-data-[active=true]:translate-y-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-white/90">
                  {item.icon}
                </div>
                {item.category && (
                  <span className="text-xs font-arabic text-primary/90 px-2 py-0.5 rounded border border-primary/20 bg-primary/10">
                    {item.category}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-arabic font-bold text-white mb-1">
                {item.title}
              </h3>

              <p className="w-full max-w-sm text-sm font-arabic text-white/80 line-clamp-2">
                {item.description}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
});
ExpandingCards.displayName = "ExpandingCards";
