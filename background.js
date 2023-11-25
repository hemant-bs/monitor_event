var requestsData = [];

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    var filterURL = 'https://edsstaging.bsstag.com/send_event';

    if (details.url === filterURL) {
      console.log('Request intercepted:', details.method, details.url);
      var postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
      var decodedString = decodeURIComponent(postedString);
      var jsonStartIndex = decodedString.indexOf('{');
      var jsonEndIndex = decodedString.lastIndexOf('}');
      var jsonSubstring = decodedString.substring(jsonStartIndex, jsonEndIndex + 1);

      try {
        var jsonObject = JSON.parse(jsonSubstring);
        requestsData.push({
          method: details.method,
          url: details.url,
          jsonObject: jsonObject,
          eventName: jsonObject.data.event_name  
        });
        console.log(jsonObject);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestBody']
);

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.action === 'getRequests') {
      port.postMessage({ action: 'updateRequests', data: requestsData });
    } else if (msg.action === 'clearRequests') {
      requestsData = [];
      port.postMessage({ action: 'updateRequests', data: requestsData });
    } else if (msg.action === 'getRequestDetails') {
      var index = msg.index;
      var details = requestsData[index];
      port.postMessage({ action: 'updateDetails', data: details });
    }
  });
});
