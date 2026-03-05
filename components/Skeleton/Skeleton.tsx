import styles from "./Skeleton.module.css"

type SkeletonVariant = "circle" | "text" | "rect"

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: string
  height?: string
  className?: string
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  className = ""
}: SkeletonProps) {
  const variantClass = styles[variant] || styles.text

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={{
        width: width || undefined,
        height: height || undefined
      }}
    />
  )
}

// Compose skeleton patterns
export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton variant="circle" width="80px" height="80px" />
        <div className={styles.headerText}>
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>
      <Skeleton height="16px" />
      <Skeleton height="16px" />
      <Skeleton width="70%" height="16px" />
    </div>
  )
}
