import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

import { HTMLMotionProps } from "framer-motion";

interface PhotoStackCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  images: string[];
  category: string;
  title: string;
  subtitle: string;
  isActive?: boolean;
}

const imageContainerVariants: Variants = {
  initial: {},
  hover: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const imageVariants: Variants = {
  initial: { scale: 1, rotate: 0, y: 0 },
  hover: (i: number) => ({
    scale: 1.05,
    rotate: (i - 1) * 10,
    y: -20,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  }),
};

const cardVariants: Variants = {
  inactive: {
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  active: {
    scale: 1.05,
    y: -15,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export const PhotoStackCard = React.forwardRef<HTMLDivElement, PhotoStackCardProps>(
  ({ className, images, category, title, subtitle, isActive, ...props }, ref) => {
    const displayImages = images.slice(0, 3);

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative flex min-h-[500px] w-[350px] cursor-pointer flex-col justify-start rounded-4xl bg-[#111319] border border-white/5 p-10 shadow-xl",
          "transition-colors duration-300 ease-in-out hover:bg-[#151820]",
          className
        )}
        variants={cardVariants}
        animate={isActive ? "active" : "inactive"}
        {...props}
      >
        <div className="z-10 bg-black/40 p-6 rounded-2xl backdrop-blur-md border border-white/5 inline-block w-fit">
          <p className="text-[10px] font-display tracking-[0.2em] uppercase text-white/50">
            {category}
          </p>
          <h2 className="mt-2 text-2xl font-bold font-arabic text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm font-arabic text-white/40">{subtitle}</p>
        </div>

        <motion.div
          className="absolute bottom-0 right-0 h-48 w-full"
          variants={imageContainerVariants}
          initial="initial"
          whileHover="hover"
        >
          <AnimatePresence>
            {displayImages.map((src, i) => (
              <motion.img
                key={src}
                src={src}
                alt={`${title} image ${i + 1}`}
                custom={i}
                variants={imageVariants}
                className="absolute bottom-[-10px] right-8 h-40 w-auto origin-bottom-center rounded-xl border-4 border-[#0c0e13] object-cover shadow-2xl"
                style={{
                  transform: `rotate(${(i - 1) * 6}deg)`,
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }
);
PhotoStackCard.displayName = "PhotoStackCard";
