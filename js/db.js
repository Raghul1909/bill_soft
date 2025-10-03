const DB_NAME = 'BillingDB';
const DB_VERSION = 1;
let db;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = function (event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains('customers')) {
                db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('bills')) {
                db.createObjectStore('bills', { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = function (event) {
            db = event.target.result;
            resolve(db);
        };
        request.onerror = function (event) {
            reject('Database error: ' + event.target.errorCode);
        };
    });
}

function addCustomer(customer) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction('customers', 'readwrite');
            const store = tx.objectStore('customers');
            const request = store.add(customer);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
}

function getCustomers() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction('customers', 'readonly');
            const store = tx.objectStore('customers');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
}

function addBill(bill) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction('bills', 'readwrite');
            const store = tx.objectStore('bills');
            const request = store.add(bill);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
}

function getBills() {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction('bills', 'readonly');
            const store = tx.objectStore('bills');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
}