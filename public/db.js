let db;
let budgetDatabaseVersion;

const request = indexedDB.open('BudgetDB', budgetDatabaseVersion || 28);

request.onupgradeneeded = function (e) {
    console.log('Upgrade to IndexDB');

    const { oldVersion } = e;
    const newDatabaseVersion = e.newVersion || db.version;
  
    console.log(`Database Updated from version ${oldVersion} to ${newDatabaseVersion}`);
  
    db = e.target.result;
  
    if (db.objectStoreNames.length === 0) {
      db.createObjectStore('BudgetStore', { autoIncrement: true });
    }
  };

  request.onerror = function (e) {
    console.log(`Error: ${e.target.errorCode}`);
  };

  function checkDB() {
    console.log("Checking database")

    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    const allStoreRecords = store.getAll();

    allStoreRecords.onsuccess = function() {
        if (allStoreRecords.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(allStoreRecords.result),
                headers: {
                  Accept: 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
                },
              })
              .then((response) => response.json())
              .then((res) => {
                  if (res.length !== 0 ) {
                    transaction = db.transaction(['BudgetStore'], 'readwrite');

                    const currentStore = transaction.objectStore('BudgetStore');

                    currentStore.clear();
                    console.log("Store has been cleared")
                  }
              })
        }
    };

  }

  request.onsuccess = function(e) {
      console.log("success")
      db = e.target.result;

      if (navigator.onLine) {
          console.log("Internet connection established")

          checkDB()
      }
  }

  function saveRecord(record) {
      console.log("record save triggered")

      const transaction = db.transaction(['BudgetStore'], 'readwrite')

      const store = transaction.objectStore("BudgetStore")

      store.add(record)

  }

  window.addEventListener("online", checkDB)