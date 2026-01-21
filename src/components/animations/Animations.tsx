import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimationProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    staggerChildren?: number;
}

export const StaggeredContainer = ({ children, className, delay = 0, staggerChildren = 0.05 }: AnimationProps) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerChildren,
                        delayChildren: delay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggeredItem = ({ children, className }: AnimationProps) => {
    return (
        <motion.div
            variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const FadeIn = ({ children, className, delay = 0 }: AnimationProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const SlideIn = ({ children, className, delay = 0 }: AnimationProps) => {
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
