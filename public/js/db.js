const indexedDB = 
window.indexedDB ||
window.mozIndexedDB ||
window.webkitIndexedDB ||
window.msIndexedDB ||
window.shimIndexedDB; 

let db; 

//indexeddb open/create db to work with
const request = indexedDB.open("<your db name here>", 1); 

//object store
request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("<object store name here>", { autoIncrement: true }); 
}; 

request.onsuccess = ({ target }) => {
    db = target.result; 
    //check for web connectivity before reading from db\
    if (navigator.onLine) {
        checkDatabase(); 
    }
}; 

request.onerror = function(event) {
    console.log("Oops!" + event.target.errorCode); 
}; 

//call when time to save to indexeddb
function saveRecord(record) {
    const transaction = db.transaction(["budget"], "readwrite"); 
    const store = transaction.objectStore("budget"); 
    store.add(record); 
}

//runs when internet connection restores
function checkDatabase() {
    const transaction = db.transaction(["budget"], "readwrite"); 
    const store = transaction.objectStore("budget"); 
    const getAll = store.getAll(); 
    if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
            method: "POST", 
            body: JSON.stringify(getAll.result), 
            headers: {
                Accept: "application/json, text/plain, */*", 
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            return response.json(); 
        })
        .then(() => {
            //delete records if successful
            const transaction = db.transaction(["<object store name here>"], "readwrite"); 
            const store = transaction.objectStore("<object store name here>"); 
            store.clear(); 
        });
    }
};

window.addEventListener("online", checkDatabase);