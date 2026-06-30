import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, className, type = 'button', ...rest }: ButtonProps) {
  const classes = className ? `${styles.button} ${className}` : styles.button;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
