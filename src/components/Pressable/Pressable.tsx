import { motion, type HTMLMotionProps } from 'motion/react';
import { transition } from '../../tokens/motion';

/**
 * Base for every tappable element: press feedback (Figma "press" = 0.1s).
 * Use instead of <button> so press feel stays consistent.
 */
export function Pressable({ className, children, ...rest }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      type="button"
      className={className}
      whileTap={{ scale: 0.92, opacity: 0.7 }}
      transition={transition.press}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
