var port = chrome.runtime.connect({ name: 'popup' });
var requestsData = [];
var detailsVisible = false; // Variable to track if details are currently visible

port.onMessage.addListener(function (msg) {
  if (msg.action === 'updateRequests') {
    updateRequestsTable(msg.data);
  } else if (msg.action === 'updateDetails') {
    updateDetails(msg.data);
  }
});

document.getElementById('clearButton').addEventListener('click', function () {
  port.postMessage({ action: 'clearRequests' });
});

port.postMessage({ action: 'getRequests' });

function updateRequestsTable(requestsData) {
  var tableBody = document.querySelector('#requestsTable tbody');
  tableBody.innerHTML = ''; // Clear the existing table

  if (requestsData.length === 0) {
    var noRequestsMessage = document.createElement('p');
    noRequestsMessage.textContent = 'No network requests intercepted.';
    tableBody.appendChild(noRequestsMessage);
  } else {
    requestsData.forEach(function (request, index) {
      var row = tableBody.insertRow();

      var cellIndex = row.insertCell(0);
      var cellMethod = row.insertCell(1);
      var cellURL = row.insertCell(2);
      var cellEventName = row.insertCell(3);
      var cellShowMore = row.insertCell(4);

      cellIndex.textContent = index + 1;
      cellMethod.textContent = request.method;
      cellURL.textContent = request.url;
      cellEventName.textContent = request.eventName;

      var showMoreButton = document.createElement('button');
      showMoreButton.textContent = 'Show More';
      showMoreButton.className = 'showMoreButton';
      showMoreButton.addEventListener('click', function () {
        // Toggle details visibility for the clicked request
        detailsVisible = !detailsVisible;
      
        if (detailsVisible) {
          // Send a message to the background to get details for the clicked request
          // port.postMessage({ action: 'getRequestDetails', index: index });
          updateDetails(request.jsonObject);
        } else {
          // Hide details
          var detailsDiv = document.getElementById('details');
          detailsDiv.innerHTML = '';
        }
      });
      
      cellShowMore.appendChild(showMoreButton);
    });
  }
}

function updateDetails(details) {
  var detailsDiv = document.getElementById('details');
  detailsDiv.innerHTML = ''; // Clear the existing details

  if (details) {
    var table = document.createElement('table');
    table.style.overflowX = 'auto'; // Add this line to make the table horizontally scrollable
    table.innerHTML = '<tr><th>Key</th><th>Value</th></tr>';

    // Recursive function to add rows for nested objects
    function addRows(obj, parentKey) {
      Object.keys(obj).forEach(function (key) {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var currentKey = parentKey ? `${parentKey}.${key}` : key;

        cell1.textContent = currentKey;

        // Check if the value is an object and recursively add rows
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          cell2.textContent = ''; // Clear the cell content for nested objects
          addRows(obj[key], currentKey);
        } else {
          cell2.textContent = obj[key];
        }

        // Set a minimum width for the cells
        cell1.style.minWidth = '150px';
        cell2.style.minWidth = '150px';
      });
    }

    addRows(details);

    detailsDiv.appendChild(table);
  }
}




