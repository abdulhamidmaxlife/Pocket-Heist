import styles from "./Avatar.module.css"

interface AvatarProps {
  name: string
}

function getInitials(name: string): string {
  const upperChars = name.match(/[A-Z]/g) ?? []
  if (upperChars.length >= 2) return upperChars.slice(0, 2).join("")
  return name.charAt(0).toUpperCase()
}

export default function Avatar({ name }: AvatarProps) {
  return <div className={styles.avatar}>{getInitials(name)}</div>
}
