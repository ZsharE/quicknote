
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
else
{
    var noteForm = document.getElementById('note-form');
    var noteValue = document.getElementById('addnote')
    var noteList = document.getElementById('note-list');
    var db;
    var request  = window.indexedDB.open('quicknote',1)
    request.onerror = function(event) {
        alert("Got error ....");
    };

    request.onupgradeneeded = function(event){
        db = event.target.result;
        var os = db.createObjectStore("quicknote",{ keyPath: "id", autoIncrement: true })
        os.createIndex("note", "note", { unique: false });
        os.createIndex("date", "date", { unique: false });       
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log(db);
        displayNote()
    };
    
    function displayNote(){
        noteList.innerHTML = "";
        var objectStore = db.transaction('quicknote').objectStore('quicknote');
        objectStore.openCursor(null, 'prev').onsuccess = function(){
            var cursor = event.target.result;
            if(cursor){
                var listItem = document.createElement('li');
                listItem.setAttribute('class', 'note');
                listItem.innerHTML = cursor.value.note + ' ( Added - ' + cursor.value.date + ')';
                noteList.appendChild(listItem);
                
                var deleteButton = document.createElement('button');
                listItem.appendChild(deleteButton);
                deleteButton.innerHTML = 'x';
                deleteButton.setAttribute('data-task', cursor.value.id);
                deleteButton.setAttribute('class', 'del');
                deleteButton.onclick = function(event) {
                    deleteItem(event);
                }
                cursor.continue();
            }
        };
    };
    



    noteForm.addEventListener('submit',addNotes,false);
    function addNotes(e){
        e.preventDefault();
        dt = new Date().toLocaleString();
        var currendate =  dt;
        var addnote = document.getElementById('addnote').value;
        var itemData = {note : addnote, date : currendate};
        var transaction = db.transaction(["quicknote"], "readwrite");
        var store = transaction.objectStore("quicknote");
        var request = store.add(itemData);
        document.getElementById('addnote').value ='';
        displayNote();
    } 
    
    function deleteItem(event) {
        
        var keyTask = event.target.getAttribute('data-task');
        var transaction = db.transaction('quicknote', 'readwrite');
        var store = transaction.objectStore('quicknote').delete(parseInt(keyTask));
        
        transaction.oncomplete = function() {
        displayNote();
        };
      };
}

