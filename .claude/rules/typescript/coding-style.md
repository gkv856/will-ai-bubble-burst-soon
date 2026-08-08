---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with TypeScript/JavaScript specific content.

## Function Parameters

Any function or component taking 2+ parameters gets a single typed params/props object instead of a long parameter list. Single-parameter functions and React event handlers (the framework-mandated single event argument) are exempt.

```typescript
// WRONG: multiple positional parameters
export async function createUser(name: string, email: string, age?: number): Promise<void> { ... }

// CORRECT: single typed object, destructured with defaults in the body
interface CreateUserParams {
  name: string
  email: string
  age?: number
}

export const createUser = async (params: CreateUserParams): Promise<void> => {
  const { name, email, age = 0 } = params
  // ...
}
```

- Lines must not break in the function signature
- Destructure with defaults in the function body, not in the signature
- Internal hot-path/positional-arg code (e.g. AST evaluators) may be exempted deliberately — see project-level `AGENT.md` for where this applies

## Declaration Style

Declare functions and components as `const` arrow functions, not `function` declarations. Named exports stay inline (`export const Foo = ...`); a default export is declared as a plain `const`, then `export default` goes on its own line at the end of the file.

```typescript
// WRONG: function declaration, default export inlined
export default function Page(props: PageProps) {
  const { id } = props
  return id
}

// CORRECT: const arrow function; export default on its own line at the bottom
const Page = (props: PageProps) => {
  const { id } = props
  return id
}

export default Page

// CORRECT: named (non-default) export stays inline
export const formatUser = (user: User): string => {
  return `${user.firstName} ${user.lastName}`
}
```

This applies everywhere, including Next.js `page.tsx`/`layout.tsx` — the required lowercase file name is unaffected, only the declaration/export style changes.

## Types and Interfaces

Use types to make public APIs, shared models, and component props explicit, readable, and reusable.

### Public APIs

- Add parameter and return types to exported functions, shared utilities, and public class methods
- Let TypeScript infer obvious local variable types
- Extract repeated inline object shapes into named types or interfaces

```typescript
// WRONG: Exported function without explicit types
export const formatUser = (user) => {
  return `${user.firstName} ${user.lastName}`
}

// CORRECT: Explicit types on public APIs
interface User {
  firstName: string
  lastName: string
}

export const formatUser = (user: User): string => {
  return `${user.firstName} ${user.lastName}`
}
```

### Interfaces vs. Type Aliases

- Use `interface` for object shapes that may be extended or implemented
- Use `type` for unions, intersections, tuples, mapped types, and utility types
- Prefer string literal unions over `enum` unless an `enum` is required for interoperability

```typescript
interface User {
  id: string
  email: string
}

type UserRole = 'admin' | 'member'
type UserWithRole = User & {
  role: UserRole
}
```

### Interface Naming

Plain PascalCase, no Hungarian-notation prefix (`User`, not `IUser`) — this is the current TypeScript/React ecosystem default and what most style guides (including TypeScript's own) recommend against prefixing.

- Component props: `<Component>Props` (`UserCardProps`)
- Function parameter objects: `<Function>Params` or `<Function>Options` when the plain name would be ambiguous
- Everything else: a plain descriptive noun phrase (`User`, `CreateUserRequest`)

### Avoid `any`

- Avoid `any` in application code
- Use `unknown` for external or untrusted input, then narrow it safely
- Use generics when a value's type depends on the caller

```typescript
// WRONG: any removes type safety
const getErrorMessage = (error: any) => {
  return error.message
}

// CORRECT: unknown forces safe narrowing
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
```

### React Props

- Component props with 2+ fields get a named `interface` (see [Interface Naming](#interface-naming)) — not an inline `type`
- Type callback props explicitly
- Do not use `React.FC` unless there is a specific reason to do so

```typescript
interface User {
  id: string
  email: string
}

interface UserCardProps {
  user: User
  onSelect: (id: string) => void
}

const UserCard = ({ user, onSelect }: UserCardProps) => {
  return <button onClick={() => onSelect(user.id)}>{user.email}</button>
}
```

### JavaScript Files

- In `.js` and `.jsx` files, use JSDoc when types improve clarity and a TypeScript migration is not practical
- Keep JSDoc aligned with runtime behavior

```javascript
/**
 * @param {{ firstName: string, lastName: string }} user
 * @returns {string}
 */
export const formatUser = (user) => {
  return `${user.firstName} ${user.lastName}`
}
```

## Immutability

Use spread operator for immutable updates:

```typescript
interface User {
  id: string
  name: string
}

// WRONG: Mutation
const updateUser = (user: User, name: string): User => {
  user.name = name // MUTATION!
  return user
}

// CORRECT: Immutability
const updateUser = (user: Readonly<User>, name: string): User => {
  return {
    ...user,
    name
  }
}
```

## Error Handling

Use async/await with try-catch and narrow unknown errors safely. Extract the narrowed error into an `err` variable before logging or setting state — don't inline the ternary at every call site.

```typescript
interface User {
  id: string
  email: string
}

declare function riskyOperation(userId: string): Promise<User>

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}

const logger = {
  error: (message: string, error: unknown) => {
    // Replace with your production logger (for example, pino or winston).
  }
}

const loadUser = async (userId: string): Promise<User> => {
  try {
    const result = await riskyOperation(userId)
    return result
  } catch (error: unknown) {
    const err = getErrorMessage(error)
    logger.error('Operation failed', err)
    throw new Error(err)
  }
}
```

## Input Validation

Use Zod for schema-based validation and infer types from the schema:

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

type UserInput = z.infer<typeof userSchema>

const validated: UserInput = userSchema.parse(input)
```

Keep schemas in a dedicated `validation.ts` next to the code that uses them, rather than inlined at each call site — one place to update when the shape changes.

## Naming Conventions

- Descriptive names: `intentData`, `chatData`, not single letters
- Consistent patterns: `data` for pre-built object arguments, `err` for a narrowed/processed error (see [Error Handling](#error-handling))
- Avoid abbreviations except well-known ones: `res`, `req`, `err`

## File Naming

| Type | Convention | Example |
|---|---|---|
| React component | `PascalCase.tsx` | `Social.tsx` |
| Next.js page/layout | `PascalCase.tsx` (framework-mandated lowercase filenames like `page.tsx` are the exception — see [react/coding-style.md](../react/coding-style.md)) | `Dashboard.tsx` |
| Hook | `camelCase.ts` | `useAuth.ts` |
| Utility | `camelCase.ts` | `formatDate.ts` |
| Context | `PascalCase.tsx` | `AuthContext.tsx` |
| Types | `PascalCase.ts` or `types.ts` | `UserTypes.ts` |
| Constants | `UPPER_SNAKE_CASE.ts` or `constants.ts` | `API_ROUTES.ts` |

## Console.log

- No `console.log` statements in production code — use a proper logging library
- When logging is warranted (dev tooling, server-side logs), follow [common/coding-style.md](../common/coding-style.md)'s `[ServiceName]` prefix and pre-built data object conventions
- See hooks for automatic detection
