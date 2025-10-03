# DB Folder

This folder contains the SQLite database file used by the billing software.

## Files

- **billing.db**  
  The main database file storing all customer and billing information.

## Database Structure

### Tables & Fields

#### 1. `customers`
| Field Name   | Type     | Description                |
|--------------|----------|----------------------------|
| id           | INTEGER  | Primary key (auto-increment) |
| name         | TEXT     | Customer name              |
| phone        | TEXT     | Customer phone number      |
| address      | TEXT     | Customer address           |

#### 2. `bills`
| Field Name   | Type     | Description                |
|--------------|----------|----------------------------|
| id           | INTEGER  | Primary key (auto-increment) |
| customer_id  | INTEGER  | References `customers(id)` |
| date         | TEXT     | Bill date                  |
| total        | REAL     | Total bill amount          |
| tax          | REAL     | Tax amount                 |

#### 3. `bill_items`
| Field Name   | Type     | Description                |
|--------------|----------|----------------------------|
| id           | INTEGER  | Primary key (auto-increment) |
| bill_id      | INTEGER  | References `bills(id)`     |
| item_name    | TEXT     | Name of the item           |
| quantity     | INTEGER  | Quantity of the item       |
| price        | REAL     | Price per item             |
| amount       | REAL     | Total amount for the item  |

## Usage

- Place `billing.db` in this folder.
- The application will automatically connect to this database when started.

## Backup & Restore

- To backup your data, copy the `billing.db` file to a safe location.
- To restore, replace the existing `billing.db` with your backup copy.

## Notes

- Do not delete or rename `billing.db` while the application is running.
- If you need to reset the database, you can delete `billing.db` (all data will be lost).