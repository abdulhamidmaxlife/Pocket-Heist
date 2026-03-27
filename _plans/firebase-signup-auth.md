# Implementation Plan: Firebase Signup Authentication

## Overview
Integrate Firebase Authentication into the SignupForm component to enable user registration with automatic codename generation. When users sign up, they receive a unique PascalCase codename (e.g., "SilentFoxRuns") as their displayName, and their profile data is stored in Firestore's `users` collection.

## Spec Reference
- Link to spec: `_specs/firebase-signup-auth.md`
- Branch: `claude/feature/firebase-signup-auth`

## Architectural Considerations

### Firebase Integration Strategy

**Four-step signup flow:**
1. Create Firebase Auth user with `createUserWithEmailAndPassword`
2. Generate random codename (3 words in PascalCase)
3. Update user's `displayName` with codename via `updateProfile`
4. Create Firestore document in `users` collection

**Error Handling:**
- If Firestore write fails after auth creation, delete the auth user to prevent orphaned accounts
- Map Firebase error codes to user-friendly messages
- Display errors inline within the form

**State Management:**
- Component-level state for loading/error (no global state needed)
- Auth context automatically picks up new user via `onAuthStateChanged`
- Navigation occurs after successful completion using Next.js `useRouter`

### File Structure

**New files:**
```
lib/
  utils/
    codename.ts              # Codename generation with word sets
  auth/
    signup.ts                # Signup orchestration function
tests/
  lib/
    utils/
      codename.test.ts       # Codename generation tests
  components/
    SignupForm.test.tsx      # SignupForm integration tests
```

**Modified files:**
```
lib/auth/index.ts            # Add signupUser export
components/SignupForm/
  SignupForm.tsx             # Add Firebase integration
  SignupForm.module.css      # Add error message styling
```

### User Object Shape

Firebase User after signup:
```typescript
{
  uid: string                 // Firebase UID
  email: string              // User's email
  displayName: string        // Generated codename (e.g., "SilentFoxRuns")
  // ... other Firebase User properties
}
```

Firestore `users` collection document:
```typescript
{
  id: string,                // Firebase UID (same as document ID)
  codename: string           // Same as displayName (e.g., "SilentFoxRuns")
}
```

**Note:** Email is NOT stored in Firestore per spec requirements.

## Implementation Steps

### 1. Create Codename Generation Utility

Create `lib/utils/codename.ts` with three word sets (20 words each):
- **ADJECTIVES**: Silent, Sneaky, Quick, Clever, Swift, Stealthy, Crafty, Nimble, Sharp, Cunning, Bold, Daring, Sly, Agile, Smooth, Phantom, Shadow, Ghost, Mystic, Cosmic
- **NOUNS**: Fox, Wolf, Raven, Tiger, Eagle, Panther, Hawk, Cobra, Dragon, Lion, Falcon, Viper, Lynx, Puma, Shark, Jaguar, Badger, Coyote, Owl, Bear
- **VERBS**: Runs, Strikes, Leaps, Dashes, Soars, Hunts, Prowls, Glides, Pounces, Races, Climbs, Dives, Stalks, Charges, Springs, Swoops, Bounds, Flies, Moves, Roams

```typescript
export function generateCodename(): string {
  const adjective = getRandomElement(ADJECTIVES)
  const noun = getRandomElement(NOUNS)
  const verb = getRandomElement(VERBS)
  return `${adjective}${noun}${verb}`
}
```

This creates 8,000 possible combinations (20³).

### 2. Create Signup Orchestration Function

Create `lib/auth/signup.ts`:

```typescript
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  User
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateCodename } from "@/lib/utils/codename"

export interface SignupResult {
  user: User
  codename: string
}

export async function signupUser(
  email: string,
  password: string
): Promise<SignupResult> {
  // Step 1: Create auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Step 2: Generate codename
  const codename = generateCodename()

  try {
    // Step 3: Update displayName
    await updateProfile(user, { displayName: codename })

    // Step 4: Create Firestore document
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      codename: codename
    })

    return { user, codename }

  } catch (firestoreError) {
    // Cleanup: Delete auth user if Firestore fails
    try {
      await deleteUser(user)
    } catch (deleteError) {
      console.error("Failed to cleanup auth user:", deleteError)
    }
    throw firestoreError
  }
}
```

Update `lib/auth/index.ts`:
```typescript
export { signupUser } from "./signup"
```

### 3. Update SignupForm Component

Modify `components/SignupForm/SignupForm.tsx`:

**Add imports:**
```typescript
import { useRouter } from "next/navigation"
import { FirebaseError } from "firebase/app"
import { signupUser } from "@/lib/auth"
```

**Add state:**
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
const router = useRouter()
```

**Update handleSubmit:**
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
    await signupUser(email, password)
    router.push("/heists")
  } catch (err) {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists")
          break
        case "auth/weak-password":
          setError("Password should be at least 6 characters")
          break
        case "auth/invalid-email":
          setError("Invalid email address")
          break
        default:
          setError("Failed to create account. Please try again.")
      }
    } else {
      setError("An unexpected error occurred. Please try again.")
    }
  } finally {
    setLoading(false)
  }
}
```

**Add error display and update button:**
```typescript
<form className={styles.form} onSubmit={handleSubmit}>
  {error && <div className={styles.error}>{error}</div>}
  {/* ... existing inputs with disabled={loading} ... */}
  <Button type="submit" disabled={loading}>
    {loading ? "Creating Account..." : "Sign Up"}
  </Button>
</form>
```

### 4. Add Error Styling

Add to `components/SignupForm/SignupForm.module.css`:
```css
.error {
  @apply text-[--color-error] text-sm;
  margin-bottom: 1rem;
}
```

### 5. Create Tests

**Codename tests** (`tests/lib/utils/codename.test.ts`):
- Valid PascalCase format
- Randomness check (>15 unique from 20 calls)
- Exactly three parts (3 uppercase letters)

**SignupForm tests** (`tests/components/SignupForm.test.tsx`):
```typescript
vi.mock("next/navigation")
vi.mock("@/lib/auth/signup")
```
- Loading state during submission
- Redirect to `/heists` on success
- Error messages for Firebase error codes
- Disabled state during loading

## Testing Plan

**Unit tests:**
- `tests/lib/utils/codename.test.ts` - Codename format, randomness, structure

**Integration tests:**
- `tests/components/SignupForm.test.tsx` - UI states, error handling, navigation

**Commands:**
```bash
npm test -- tests/lib/utils/codename.test.ts
npm test -- tests/components/SignupForm.test.tsx
npm test  # All tests
```

## Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| Email already in use | Display "An account with this email already exists" |
| Weak password | Display "Password should be at least 6 characters" |
| Invalid email format | Display "Invalid email address" |
| Network failure | Display "Failed to create account. Please try again." |
| Firestore write fails | Delete auth user, log cleanup errors, show error |
| Codename collision | Impossible - UID is document ID (guaranteed unique) |
| Browser close during signup | Firebase handles persistence automatically |
| Unknown errors | Display generic error message |

## Critical Files

| File Path | Purpose |
|-----------|---------|
| `lib/utils/codename.ts` | Codename generation (8,000 combinations) |
| `lib/auth/signup.ts` | Orchestrates auth, profile, Firestore with cleanup |
| `components/SignupForm/SignupForm.tsx` | UI integration with states |
| `lib/auth/index.ts` | Export signupUser |
| `tests/lib/utils/codename.test.ts` | Unit tests |
| `tests/components/SignupForm.test.tsx` | Integration tests |

## Verification Steps

**Automated:**
1. `npm test` - all tests pass
2. `npm test -- tests/lib/utils/codename.test.ts`
3. `npm test -- tests/components/SignupForm.test.tsx`

**Manual:**
1. `npm run dev` → navigate to `/signup`
2. Fill form, click "Sign Up"
3. Verify loading state appears
4. Verify redirect to `/heists`
5. Check Firebase Console → `users` collection has document
6. Verify document: `{ id: <uid>, codename: <PascalCase> }`
7. Verify Firebase Auth user has `displayName` set
8. Test error cases (duplicate email, weak password)

## Out of Scope

- Login functionality
- Logout functionality
- Password reset/recovery
- Email verification
- Profile editing
- Social auth providers
- Security rules updates
- Offensive word filtering
