chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('https://dune.com/')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).then(() => {
    }).catch(err => {
      console.error('Failed to inject content script:', err);
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exportCSV") {
    const data = request.data;
    const pageInfo = request.pageInfo || ""; // Get page info, default to empty string if not provided

    // Ensure data is an array of arrays before processing
    if (Array.isArray(data) && data.every(Array.isArray)) {
        const csv = data.map(row => 
            row.map(cell => {
                // Escape quotes by doubling them and wrap the cell in quotes if it contains a comma or a quote.
                const strCell = String(cell);
                if (strCell.includes(',') || strCell.includes('"')) {
                    return `"${strCell.replace(/"/g, '""')}"`;
                }
                return strCell;
            }).join(',')
        ).join('\n');

        const blob = new Blob(["\uFEFF" + csv], {type: 'text/csv;charset=utf-8;'}); // Add BOM for Excel compatibility
        const reader = new FileReader();
        reader.onloadend = function() {
            // Generate filename with current date and time
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
            
            let filename = `dune_export`;
            if (pageInfo) {
                filename += `_${pageInfo.replace(/\s/g, '_')}`;
            }
            filename += `_${timestamp}.csv`;

            chrome.downloads.download({
                url: reader.result,
                filename: filename
            }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("Download failed:", chrome.runtime.lastError.message);
                sendResponse({status: "failed", error: chrome.runtime.lastError.message});
            } else {
                // Send message to content script to show notification
                chrome.tabs.sendMessage(sender.tab.id, { action: "showExportNotification", message: "CSV export completed!" });
                sendResponse({status: "success"});
            }
        });
        };
        reader.readAsDataURL(blob);

        return true; // Indicates that the response is sent asynchronously
    } else {
        console.error("Invalid data format received for CSV export.");
        sendResponse({status: "failed", error: "Invalid data format"});
    }
  }
});