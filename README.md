# Billing Software

A simple web-based billing and customer management system built with Node.js, Express, SQLite, and jQuery.

## Features

- Add, view, and delete customers
- Generate bills with multiple items, tax calculation, and customer details
- View, search, sort, and delete bills
- Print bill summaries
- Customer name suggestions for quick entry
- Responsive UI with Bootstrap

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

1. Clone the repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the server:

   ```sh
   node js/server.js
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Usage

- **Home Page:** Add customer details and bill items, then generate and print bills.
- **Customer List:** View and delete customers.
- **Bill List:** View, search, sort, print, and delete bills.

## Database

- Uses SQLite for persistent storage (`DB/billing.db`).
- Tables: `customers`, `bills`.

## Technologies Used

- Node.js, Express, SQLite
- jQuery, Bootstrap
- IndexedDB (for optional local storage, not used in server mode)

## License

MIT

---

For any issues or suggestions, please open an issue or contact the rithiragul2020@gmail.com.
