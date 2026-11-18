import { Link } from 'react-router'

export function ForbiddenPage() {
  return (
    <main>
      <h1>Brak dostępu</h1>
      <p>Nie masz uprawnień do wyświetlenia tej strony.</p>
      <Link to="/">Wróć na stronę główną</Link>
    </main>
  )
}
