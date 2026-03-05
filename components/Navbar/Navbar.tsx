<<<<<<< HEAD
import { Clock8 } from "lucide-react"
=======
import { Clock8, Plus } from "lucide-react"
>>>>>>> 4952352 (first Commit)
import Link from "next/link"
import styles from "./Navbar.module.css"

export default function Navbar() {
  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          <li>
<<<<<<< HEAD
            <Link href="/heists/create" className="btn">Create Heist</Link>
=======
            <Link href="/heists/create" className="btn"><Plus size={16} strokeWidth={2.5} />Create Heist</Link>
>>>>>>> 4952352 (first Commit)
          </li>
        </ul>
      </nav>
    </div>
  )
}
