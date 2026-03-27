# Family Footy Tips

Simple AFL family tipping site for Mum, Dad, Ben, and Lucy.

## Features

- Mobile-first tipping flow
- No passwords, just choose your family member
- Current round lockout once the first game starts
- Weekly leaderboard only
- First-game margin bonus point
- Previous winners archive
- Live AFL fixtures and results from Squiggle

## Local setup

1. Copy the env file:

```bash
cp .env.example .env
```

2. Start Postgres and the app:

```bash
docker compose up -d --build
```

3. Open:

```text
http://localhost
```

## VPS deploy

1. Clone the repo onto your VPS.
2. Copy `.env.example` to `.env`.
3. Set `APP_URL=http://YOUR_SERVER_IP`.
4. Run:

```bash
docker compose up -d --build
```

5. Open:

```text
http://YOUR_SERVER_IP
```

## Update deploy

```bash
git pull
docker compose up -d --build
```

## Data source

- Squiggle API: [https://squiggle.com.au/the-squiggle-api/](https://squiggle.com.au/the-squiggle-api/)
