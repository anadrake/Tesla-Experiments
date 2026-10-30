import card from '../../../assets/settings/photo/card.svg';
import info from '../../../assets/settings/photo/info.svg';
import car from '../../../assets/settings/photo/software-car.png';
import wordmark from '../../../assets/settings/photo/model3-wordmark.svg?raw';
import { Icon } from '../../../components/Icon/Icon';
import { ThemedSvg } from '../../../components/ThemedSvg/ThemedSvg';
import { Stack, Text } from '../photo/Photo';
import styles from './pages.module.css';

const WORDMARK_COLORS = { '#303234': 'var(--photo-content-primary)' };

/** Title (Photo / Setting label) + info, as Figma's "… ⓘ info" rows. */
const InfoTitle = ({ children }: { children: string }) => (
  <div className={styles.inlineTitle} style={{ gap: 8 }}>
    <Text as="label">{children}</Text>
    <Icon src={info} size={24} color="var(--photo-icon)" />
  </div>
);

/** Figma Settings 2026 / Software (4934:1506): generated wrapped Model 3 art, appearance shortcuts, vehicle info. Static (Q41). */
export function SoftwarePage() {
  return (
    <Stack gap={24}>
      <img className={styles.softwareCar} src={car} alt="" />
      <div className={styles.appearance}>
        <span className={styles.paintSwatch} />
        <Icon src={card} size={32} color="var(--photo-icon)" />
      </div>
      <div className={styles.modelRow}>
        <ThemedSvg svg={wordmark} colors={WORDMARK_COLORS} className={styles.wordmark} />
        <Text tone="accent">Edgerunner</Text>
      </div>
      <Text as="label">26,468 mi</Text>
      <Text>VIN 5YJ3E1EA8PF385888</Text>
      <Text>AI Computer: Full Self-Driving Computer 3</Text>
      <Text tone="accent">Additional Vehicle Information</Text>
      <InfoTitle>Full Self-Driving Capability</InfoTitle>
      <Text as="caption">Auto renewal Nov 5, 2026</Text>
      <InfoTitle>Premium Connectivity</InfoTitle>
    </Stack>
  );
}
