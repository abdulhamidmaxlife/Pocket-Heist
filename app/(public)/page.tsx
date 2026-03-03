// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />cket Heist
        </h1>
        <div>Tiny missions. Big office mischief.</div>

        <p>
          Welcome to Pocket Heist, where the daily grind meets delightful chaos.
          Execute perfectly timed micro-missions in the modern workplace—from the
          strategic repositioning of office supplies to orchestrating elaborate
          break room pranks.
        </p>

        <p>
          Each heist is a carefully crafted operation requiring timing, stealth,
          and a healthy disregard for corporate monotony. Assemble your crew,
          plan your moves, and pull off the impossible: making Monday mornings
          actually interesting.
        </p>        
      </div>
    </div>
  )
}
