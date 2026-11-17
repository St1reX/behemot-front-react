import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main>
      <h1>Nie znaleziono strony</h1>
      <Link to="/">Wróć na stronę główną</Link>
    </main>
  )
}
