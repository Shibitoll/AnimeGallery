import styles from './Button.module.css';

export const Button = ({ variant = 'primary', children, className = '', ...rest }) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${className}`} 
      {...rest}
    >
      {children}
    </button>
  );
};