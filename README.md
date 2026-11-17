# Behemot

Frontend w React, TypeScript i Vite.

```sh
npm ci
npm run dev
```

W trybie deweloperskim Vite przekazuje żądania z `/api` do
`http://localhost:4000`. Ustaw `API_PROXY_TARGET` w `.env.local`, jeśli
backend działa na innym adresie. Na wdrożeniu udostępnij API pod `/api`
lub ustaw `VITE_API_BASE_URL` na adres serwera z CORS dla frontendu
i obsługą credentials. Serwer statyczny powinien kierować ścieżki React
Routera do `index.html`.

Logowanie i wylogowanie wykorzystują sesję cookie backendu. Serwer
udostępnia `POST /auth/login` i `POST /auth/logout`. Do odczytania
użytkownika po przeładowaniu potrzebny jest endpoint sesji.

Kod widoku trzymaj w `src/pages/<widok>/` razem z jego komponentami, hookami,
obsługą socketów, funkcjami pomocniczymi i typami. Komponenty używane przez
wiele widoków trafiają do `src/components/`. Klient HTTP i wywołania API
trzymaj w `src/api/`.
