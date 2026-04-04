import styles from './Card.module.css';

export const Card = ({ children, footer, className = '' }) => (
  <article className={`${styles.card} ${className}`}>
    <div className={styles.body}>{children}</div>
    {footer && <div className={styles.footer}>{footer}</div>}
  </article>
);