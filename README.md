# FORMA — Modern Homeware E-commerce

**A full-stack demo portfolio project for Ziad Tareek.**

A responsive homeware storefront featuring a searchable product catalog, category filters, price sorting, dynamic shopping bag, quantity controls, and demo order submission. Product data and orders are stored in SQLite through a Node.js REST API.

## Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), accessible UI, responsive layout
- **Backend:** Node.js 22.16+ (native `node:http`)
- **Database:** SQLite via Node.js built-in `node:sqlite`
- **Architecture:** REST endpoints, prepared SQL statements, server-verified pricing
- **Dependencies:** Zero npm packages required

## Run locally
1. Install **Node.js 22.16 or newer**.
2. Open a terminal in this folder.
3. Run `node server.js` or `npm start`.
4. Open **http://localhost:3001**.

For Windows: double-click `RUN_WINDOWS.bat` after installing Node.js.

## API
- `GET /api/products` — list items (optional `?category=Decor&q=vase`)
- `POST /api/orders` — submit demo cart with `{ "items": [{ "id": 1, "quantity": 2 }] }`

## Deployment
Deploy as a **Node.js web service**, with `node server.js` as the start command, **Node.js 22.16+** as the runtime, and a **persistent writable volume** for the SQLite database. The server reads `PORT` and `HOST` environment variables. Set `DB_PATH=/path/on/persistent/volume/forma.sqlite` for reliable data retention.

## Important
This is a **portfolio demo**. Checkout does not charge money, send receipts or fulfill deliveries. There is no authentication, payment gateway or production-grade fraud/rate controls. Do not present this as a live commercial store without adding those features.

**Portfolio credit:** Ziad Tareek — Full Stack Developer.
