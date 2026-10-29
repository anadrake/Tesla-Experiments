import { motion } from 'motion/react';
import { useState } from 'react';
import backspaceIcon from '../../assets/keyboard/backspace.svg';
import shiftIcon from '../../assets/keyboard/shift.svg';
import micIcon from '../../assets/keyboard/mic.svg';
import leftIcon from '../../assets/keyboard/cursor-left.svg';
import rightIcon from '../../assets/keyboard/cursor-right.svg';
import { Icon } from '../../components/Icon/Icon';
import { Key } from '../../components/Key/Key';
import { useHud } from '../../state/store';
import { transition } from '../../tokens/motion';
import styles from './Keyboard.module.css';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm,.-'];
const NUMPAD = ['123', '456', '789', ',0.'];
const ICON = 'var(--color-icon-strong)';

/**
 * Figma "Keyboard" (52:32037): 1920×500 overlay over the lower stage.
 * Opens with Move in, duration/slow + easing/enter (component spec; read-me says 0.25s — see WORKLOG).
 * Shift = one-shot capital. ?#&, mic and cursor keys give press feedback only (not designed further).
 * Types into Navigate (Enter starts the trip) or Settings search (Enter closes the keyboard).
 */
export function Keyboard() {
  const { typeText, backspace, startTrip, closeKeyboard, settingsTyping } = useHud();
  const [shift, setShift] = useState(false);

  const type = (ch: string) => {
    typeText(shift ? ch.toUpperCase() : ch);
    setShift(false);
  };

  return (
    <motion.div
      className={styles.keyboard}
      // `transform` (not `y`) so motion runs the slide on the compositor — full frame rate on iPad (perf, 9.5)
      initial={{ transform: 'translateY(100%)' }}
      animate={{ transform: 'translateY(0%)', transition: transition.sheetOpen }}
      exit={{ transform: 'translateY(100%)', transition: transition.sheetClose }}
      role="group"
      aria-label="Keyboard"
    >
      <div className={styles.letters}>
        <div className={styles.row}>
          {[...ROWS[0]].map((ch) => (
            <Key key={ch} label={shift ? ch.toUpperCase() : ch} onPress={() => type(ch)} />
          ))}
          <Key type="action" width={160} ariaLabel="Backspace" label={<Icon src={backspaceIcon} size={40} color={ICON} />} onPress={backspace} />
        </div>
        <div className={`${styles.row} ${styles.indent}`}>
          {[...ROWS[1]].map((ch) => (
            <Key key={ch} label={shift ? ch.toUpperCase() : ch} onPress={() => type(ch)} />
          ))}
          <Key type="action" width={228} label="Enter" onPress={() => (settingsTyping ? closeKeyboard() : startTrip())} />
        </div>
        <div className={styles.row}>
          <Key
            type="action"
            width={160}
            ariaLabel="Shift"
            label={<Icon src={shiftIcon} size={48} color={shift ? 'var(--color-action-primary-bg-default)' : ICON} />}
            onPress={() => setShift((v) => !v)}
          />
          {[...ROWS[2]].map((ch) => (
            <Key key={ch} label={shift ? ch.toUpperCase() : ch} onPress={() => type(ch)} />
          ))}
        </div>
        <div className={`${styles.row} ${styles.fill}`}>
          <Key type="action" width={160} label="?#&" />
          <Key type="action" width={104} ariaLabel="Dictate" label={<Icon src={micIcon} size={40} color={ICON} />} />
          <Key type="action" width="fill" ariaLabel="Space" onPress={() => typeText(' ')} />
          <Key type="action" width={104} ariaLabel="Cursor left" label={<Icon src={leftIcon} size={40} color={ICON} />} />
          <Key type="action" width={104} ariaLabel="Cursor right" label={<Icon src={rightIcon} size={40} color={ICON} />} />
        </div>
      </div>
      <div className={styles.letters}>
        {NUMPAD.map((row) => (
          <div key={row} className={styles.row}>
            {[...row].map((ch) => (
              <Key key={ch} label={ch} onPress={() => typeText(ch)} />
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
