import styles from "./Input.module.css"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
}

export default function Input({ label, icon, ...props }: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        <input className={styles.input} {...props} />
        {icon && <div className={styles.iconButton}>{icon}</div>}
      </div>
    </div>
  )
}
