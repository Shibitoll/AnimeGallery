import styles from './Input.module.css';

export const Input = ({ label, ...rest }) => (
  <div className={styles.wrapper}>
    {label && <label className={styles.label}>{label}</label>}
    <input className={styles.input} {...rest} />
  </div>
);