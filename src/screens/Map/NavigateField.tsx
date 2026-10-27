import { motion } from 'motion/react';
import search from '../../assets/icons/search.svg';
import { Icon } from '../../components/Icon/Icon';
import { useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import styles from './Map.module.css';

/**
 * Figma "Navigate Field" (4307:23243). Default: floating card, "Navigate" placeholder; tap → Keyboard.
 * Focused (keyboard open): glass + 2px focus ring, typed text and a blinking caret.
 */
export function NavigateField() {
  const nav = useHud((s) => s.nav);
  const query = useHud((s) => s.query);
  const openKeyboard = useHud((s) => s.openKeyboard);
  const focused = nav === 'typing';

  return (
    <motion.button
      type="button"
      className={styles.navigateField}
      data-focused={focused || undefined}
      onClick={() => !focused && openKeyboard()}
      whileTap={focused ? undefined : { scale: 0.99 }}
      transition={transition.toggle}
      aria-label={focused ? `Navigate: ${query}` : 'Navigate'}
    >
      <Icon src={search} color={focused ? 'var(--color-content-primary)' : 'var(--color-content-secondary)'} />
      {focused ? (
        <span className={`text-title-l ${styles.query}`}>
          {query}
          <span className={styles.caret} />
        </span>
      ) : (
        <span className="text-title-l">Navigate</span>
      )}
    </motion.button>
  );
}
