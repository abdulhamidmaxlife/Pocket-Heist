// preview page for newly created UI components

import Skeleton, { SkeletonCard } from "@/components/Skeleton"
import Avatar from "@/components/Avatar"
import styles from "./preview.module.css"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Skeleton Components Preview</h2>

      <div className={styles.grid}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <h3 className={styles.sectionTitle}>Individual Variants</h3>
      <div className={styles.variants}>
        <Skeleton variant="circle" width="60px" height="60px" />
        <Skeleton variant="text" />
        <Skeleton variant="rect" height="100px" />
      </div>
      <h2>Avatar Component Preview</h2>
      <div className={styles.variants}>
        <Avatar name="Alice" />
        <Avatar name="bob" />
        <Avatar name="PocketHeist" />
        <Avatar name="JohnDoe" />
      </div>
    </div>
  )
}
