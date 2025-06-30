if (typeof window.duneAssistantInjected === 'undefined') {
    window.duneAssistantInjected = true;

// Log that the content script has been injected and is running.
console.log("Dune Assistant has been activated.");

let cancelExportFlag = false;
let mainProgressBarContainer = null;
let mainProgressBar = null;
let mainProgressBarText = null;

const injectGlobalStyles = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .dune-assistant-button {
            margin-left: 4px;
            padding: 6px 12px;
            border-radius: .3rem;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
            transition: all 0.2s ease-in-out;
            border: 1px solid transparent;
        }
        .dune-assistant-button:disabled {
            cursor: not-allowed;
            opacity: 0.65;
        }
        .dune-assistant-button:focus,
        .dune-assistant-button:active {
            outline: none;
            box-shadow: none;
        }

        /* Primary Button (View Data) */
        .btn-primary {
            background-color: #eaf2ff;
            color: #4e73df;
            border-color: #eaf2ff;
        }
        .btn-primary:hover:not(:disabled) {
            background-color: #668cff;
            color: #fff;
        }
        .btn-primary:focus:not(:disabled),
        .btn-primary:active:not(:disabled) {
            background-color: #eaf2ff; /* Revert to default primary background */
            color: #4e73df; /* Revert to default primary color */
            outline: none;
            box-shadow: none;
        }

        /* Secondary Button (Export CSV) */
        .btn-secondary {
            background-color: #e6f9f1;
            color: #1cc88a;
            border-color: #e6f9f1;
        }
        .btn-secondary:hover:not(:disabled) {
            background-color: #1cc88a;
            color: #fff;
        }
        .btn-secondary:focus:not(:disabled),
        .btn-secondary:active:not(:disabled) {
            background-color: #e6f9f1; /* Revert to default secondary background */
            color: #1cc88a; /* Revert to default secondary color */
            outline: none;
            box-shadow: none;
        }

        /* Pagination Buttons */
        .btn-pagination {
            background-color: #eaf2ff; /* Light Blue */
            color: #4e73df; /* Blue */
            border-color: #eaf2ff;
        }
        .btn-pagination:hover:not(:disabled) {
            background-color: #4e73df; /* Darker Blue */
            color: #fff;
        }
        .btn-pagination:disabled {
            background-color: #f8f9fa; /* Keep neutral disabled color */
            color: #b7b9cc;
            border-color: #d1d3e2;
        }

        /* Close Button */
        .btn-close {
            background-color: #fdeeee;
            color: #e74a3b;
            border-color: #fdeeee;
        }
        .btn-close:hover:not(:disabled) {
            background-color: #e74a3b;
            color: #fff;
        }

        #dune-assistant-modal table tbody tr:hover {
            background-color: #f0f2f5;
        }
        .dune-assistant-tooltip {
            position: absolute;
            background-color: #333;
            color: white;
            padding: 8px;
            border-radius: 4px;
            z-index: 10001;
            max-width: 400px;
            word-wrap: break-word;
            pointer-events: auto;
            user-select: text;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .cell-content-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .copy-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 2px 5px;
            margin-left: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        }
        .copy-btn:hover {
            background-color: #e9ecef;
        }
        .copy-btn svg {
            width: 14px;
            height: 14px;
            color: #6c757d;
        }
        .dune-assistant-progress-container {
            position: relative; /* Added for absolute positioning of text */
            width: 100%;
            background-color: #f3f3f3;
            border-radius: 5px;
            overflow: hidden;
            margin-top: 0px; /* Set margin-top to 0 */
            height: 20px; /* Reverted height */
            box-sizing: border-box; /* Ensure padding/border are included in height */
        }
        .dune-assistant-progress-bar {
            height: 100%;
            width: 0%;
            background-color: #4CAF50;
            transition: width 0.3s ease-in-out;
        }
        .dune-assistant-progress-text {
            position: absolute;
            width: 100%;
            text-align: center;
            color: #8B0000; /* Dark Red color for text */
            font-weight: bold; /* Added bold for better visibility */
            line-height: 20px; /* Match container height */
            font-size: 12px;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none; /* Allow clicks to pass through to the bar */
        }
        .dune-assistant-notification {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: #eaf2ff; /* Light blue from btn-primary */
            color: #4e73df; /* Blue text from btn-primary */
            padding: 10px 20px;
            border-radius: 5px;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            z-index: 10000;
            font-size: 14px;
        }
        .dune-assistant-notification.show {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
};

const createButton = (text, classNames = [], onClick) => {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = ['dune-assistant-button', ...classNames].join(' ');
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  // Stop propagation for mouseover and mouseenter to prevent triggering Dune's native tooltips
  button.addEventListener('mouseover', (e) => e.stopPropagation());
  button.addEventListener('mouseenter', (e) => e.stopPropagation());
  return button;
};

const waitForElement = async (selector, parentElement = document, maxAttempts = 20, delay = 250) => {
    let element = null;
    let attempts = 0;
    while (!element && attempts < maxAttempts) {
        element = parentElement.querySelector(selector);
        if (element) {
            // console.log(`Found element with selector "${selector}" on attempt ${attempts + 1}.`);
            return element;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    // console.error(`Could not find element with selector "${selector}" after ${attempts} attempts.`);
    return null;
};

const getTableElement = async () => {
    const resultsSection = await waitForElement('section[id="results"]');
    if (!resultsSection) {
        console.error("Could not find #results section.");
        return null;
    }
    const tableContainer = await waitForElement('div.visual_result__6q0xu', resultsSection);
    if (tableContainer) {
        return await waitForElement('table', tableContainer);
    }
    return null;
};

const extractData = async () => {
  const table = await getTableElement();
  if (!table) {
      console.error("Could not find the main table element for data extraction.");
      return [];
  }
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  if (rows.length === 0) {
      console.error("No data rows found within <tbody><tr>.");
      return [];
  }
  return rows.map(row => 
    Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
  );
};

const getHeaders = async () => {
    const table = await getTableElement();
    if (!table) {
        console.error("Could not find the main table element for headers.");
        return [];
    }
    const headerElements = Array.from(table.querySelectorAll('thead th'));
    if (headerElements.length === 0) {
        console.error("No headers found within <thead><th>.");
    }
    return headerElements.map(h => h.textContent.trim()).filter(h => h);
};

let currentTooltip = null; // Global variable to hold the current tooltip element

function showCustomTooltip(event) {
    const target = event.currentTarget;
    const fullText = target.dataset.fullText; // Retrieve full text from data attribute

    if (!fullText) return;

    // Remove existing tooltip if any
    if (currentTooltip) {
        currentTooltip.remove();
    }

    currentTooltip = document.createElement('div');
    currentTooltip.className = 'dune-assistant-tooltip';
    currentTooltip.textContent = fullText;

    // Position the tooltip
    const rect = target.getBoundingClientRect();
    currentTooltip.style.left = `${rect.left + window.scrollX}px`;
    currentTooltip.style.top = `${rect.bottom + window.scrollY + 5}px`; // 5px below the cell

    document.body.appendChild(currentTooltip);
}

function hideCustomTooltip() {
    if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
    }
}

// Function to find Dune's pagination buttons
// Function to find Dune's pagination buttons
const findDunePaginationButtons = async () => {
    const footer = await waitForElement('div.visual_vizFooter__vCe59');
    if (!footer) {
        console.error("[Dune Assistant] Could not find footer.");
        return { first: null, prev: null, next: null, last: null, pageInfoElement: null, pageInfoType: null };
    }

    const ul = await waitForElement('ul.table_footer__Ky_k2', footer);
    if (!ul) {
        console.error("[Dune Assistant] Could not find ul element in footer.");
        return { first: null, prev: null, next: null, last: null, pageInfoElement: null, pageInfoType: null };
    }

    let firstButton, prevButton, nextButton, lastButton, pageInfoElement, pageInfoType;

    const listItems = Array.from(ul.querySelectorAll('li'));

    // Try to find the page info element first, as it's the pivot
    let pageInfoLi = listItems.find(li => li.querySelector('select'));
    pageInfoType = 'select';
    
    if (pageInfoLi) {
        pageInfoElement = pageInfoLi.querySelector('select');
    } else {
        // If no select, try to find the text-based info
        pageInfoLi = listItems.find(li => li.textContent.includes('of') && !li.querySelector('button'));
        if(pageInfoLi) {
            pageInfoElement = pageInfoLi;
            pageInfoType = 'text';
        }
    }

    if (pageInfoLi) {
        // Find buttons relative to the page info LI
        const pageInfoIndex = listItems.indexOf(pageInfoLi);
        if (pageInfoIndex > 1) {
            prevButton = listItems[pageInfoIndex - 1]?.querySelector('button');
            firstButton = listItems[pageInfoIndex - 2]?.querySelector('button');
        }
        if (pageInfoIndex < listItems.length - 1) {
            nextButton = listItems[pageInfoIndex + 1]?.querySelector('button');
            if (nextButton) {
                lastButton = listItems[pageInfoIndex + 2]?.querySelector('button');
            }
        }
    } else {
        // Fallback if we can't find a page info pivot
        const buttons = ul.querySelectorAll('button');
        if (buttons.length >= 4) {
            firstButton = buttons[0];
            prevButton = buttons[1];
            nextButton = buttons[2];
            lastButton = buttons[3];
        }
    }
    
    return { first: firstButton, prev: prevButton, next: nextButton, last: lastButton, pageInfoElement, pageInfoType };
};

const getCurrentPageText = async () => {
    const duneBtns = await findDunePaginationButtons();
    if (duneBtns.pageInfo && duneBtns.pageInfo.options.length > 0) {
        return duneBtns.pageInfo.options[duneBtns.pageInfo.selectedIndex].textContent.trim();
    }
    return "unknown_page"; // Default if page info not found
};

const awaitTableUpdate = (tableElement) => {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            observer.disconnect();
            console.warn("[Dune Assistant] Timeout waiting for table update. Proceeding anyway.");
            resolve(); // Resolve instead of reject to make it more robust
        }, 5000); // 5-second timeout as a fallback

        const observer = new MutationObserver((mutationsList, obs) => {
            // We only care that a change happened, not what it was.
            // As soon as the table changes, we know the new data is in.
            clearTimeout(timeout);
            obs.disconnect(); // Stop observing to avoid unnecessary processing
            resolve();
        });

        // Observe the table element itself for child list and subtree changes.
        // This is more robust as React might replace the entire <tbody>.
        observer.observe(tableElement, { childList: true, subtree: true });
    });
};

// Helper to simulate a click on Dune's pagination buttons and wait for data change
const simulateDunePaginationClick = async (duneButtonName) => {
    try {
        const table = await getTableElement();
        if (!table) {
            console.error("[Dune Assistant] Could not find table to observe for pagination.");
            return false;
        }

        let duneBtns = await findDunePaginationButtons();
        const buttonToClick = duneBtns[duneButtonName];

        if (buttonToClick && !buttonToClick.disabled) {
            // Start waiting for the DOM change *before* the click
            // We pass the whole table element, which is more stable than its tbody.
            const tableUpdatePromise = awaitTableUpdate(table);
            
            buttonToClick.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            await tableUpdatePromise; // Wait for the observer to fire
            await new Promise(resolve => setTimeout(resolve, 50)); // A tiny delay for any final rendering
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`Error simulating ${duneButtonName} button click or waiting for data:`, error);
        return false;
    }
};

// This function will be called by both the modal's "Export All CSV" and the main page's "Export CSV"
const performFullExport = async (exportButton, otherButton, progressBarContainer, progressBar, progressBarText, pageInfoPrefix = "all") => {
    cancelExportFlag = false;
    const originalButtonText = exportButton.textContent;
    const originalButtonClasses = Array.from(exportButton.classList);

    // Store the original click handler function reference
    let originalClickHandlerRef = exportButton.onclick;

    // Function to handle cancellation and reset UI
    const cancelAndReset = () => {
        cancelExportFlag = true;
        exportButton.textContent = originalButtonText;
        exportButton.classList.remove('btn-close');
        originalButtonClasses.forEach(cls => exportButton.classList.add(cls));
        exportButton.onclick = originalClickHandlerRef; // Restore original handler
        if (otherButton) otherButton.disabled = false;
        progressBarContainer.style.display = 'none';
    };

    exportButton.textContent = 'Cancel Export';
    exportButton.classList.remove('btn-secondary', 'btn-primary');
    exportButton.classList.add('btn-close');
    exportButton.onclick = cancelAndReset; // Set the cancel handler

    if (otherButton) otherButton.disabled = true;
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBarText.textContent = '0%';

    const startTime = Date.now(); // Record start time

    try {
        let allPagesData = [];
        let duneBtns = await findDunePaginationButtons();
        let totalPages = 1;

        if (duneBtns.pageInfoElement) {
            if (duneBtns.pageInfoType === 'select') {
                totalPages = duneBtns.pageInfoElement.options.length;
            } else if (duneBtns.pageInfoType === 'text') {
                const textContent = duneBtns.pageInfoElement.textContent.trim();
                const parts = textContent.split('of').map(p => p.trim().replace(/,/g, ''));
                if (parts.length === 2) {
                    totalPages = parseInt(parts[1], 10);
                }
            }
        } else {
            // Fallback calculation if page info element is not found
            const totalRowsElement = await waitForElement('span.table_total__eti_u');
            if (totalRowsElement) {
                const totalRowsText = totalRowsElement.textContent || "";
                const totalRows = parseInt(totalRowsText.replace(/,/g, '').replace(/\s*rows/i, '').trim(), 10);
                const firstPageData = await extractData();
                const pageSize = firstPageData.length;
                if (pageSize > 0 && !isNaN(totalRows)) {
                    totalPages = Math.ceil(totalRows / pageSize);
                }
            }
        }

        if (duneBtns.first && !duneBtns.first.disabled) {
            await simulateDunePaginationClick('first');
        }

        let currentPage = 0;
        while (true) {
            if (cancelExportFlag) {
                alert("Export cancelled.");
                break;
            }

            currentPage++;
            const pageData = await extractData();
            allPagesData.push(...pageData);

            const progress = Math.min(100, Math.round((currentPage / totalPages) * 100));
            let progressText = `${progress}%`;

            // Calculate and display Estimated Time of Completion (ETC)
            if (currentPage > 0 && totalPages > 1) {
                const elapsedTime = Date.now() - startTime;
                const averagePageTime = elapsedTime / currentPage;
                const remainingPages = totalPages - currentPage;
                const estimatedRemainingTimeMs = averagePageTime * remainingPages;

                let etcText = '';
                if (estimatedRemainingTimeMs < 60000) { // Less than 1 minute
                    etcText = `${Math.ceil(estimatedRemainingTimeMs / 1000)}s remaining`;
                } else { // Minutes
                    etcText = `${Math.ceil(estimatedRemainingTimeMs / 60000)}m remaining`;
                }
                progressText += ` (${etcText})`;
            }

            progressBar.style.width = `${progress}%`;
            progressBarText.textContent = progressText;

            if (exportButton.id === 'dune-assistant-export-all-csv-button') {
                const modalTableEl = document.getElementById('dune-assistant-modal-table');
                const modalFirstBtn = document.getElementById('dune-assistant-modal-first-button');
                const modalPrevBtn = document.getElementById('dune-assistant-modal-prev-button');
                const modalNextBtn = document.getElementById('dune-assistant-modal-next-button');
                const modalLastBtn = document.getElementById('dune-assistant-modal-last-button');
                const modalPageInfoSpan = document.getElementById('dune-assistant-modal-page-info');

                renderTable(modalTableEl, pageData);
                duneBtns = await findDunePaginationButtons();
                updatePaginationControls(modalFirstBtn, modalPrevBtn, modalNextBtn, modalLastBtn, modalPageInfoSpan, duneBtns);
            }

            duneBtns = await findDunePaginationButtons(); // Re-fetch buttons after potential UI update
            if (!duneBtns.next || duneBtns.next.disabled) {
                break;
            }

            await simulateDunePaginationClick('next');
        }

        // Ensure progress bar shows 100% before completing the export
        progressBar.style.width = '100%';
        progressBarText.textContent = '100% (Completed)'; // Indicate completion
        // Add a small delay to allow the user to see 100% before the bar disappears
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

        if (!cancelExportFlag) {
            chrome.runtime.sendMessage({ action: "exportCSV", data: allPagesData, pageInfo: pageInfoPrefix });
        }

    } catch (error) {
        console.error("Error exporting all data:", error);
        alert("An error occurred while exporting all data. Please check the console.");
    } finally {
        // Reset button and UI if not already reset by cancel handler
        if (!cancelExportFlag) {
            exportButton.textContent = originalButtonText;
            exportButton.classList.remove('btn-close');
            originalButtonClasses.forEach(cls => exportButton.classList.add(cls));
            exportButton.onclick = originalClickHandlerRef; // Restore original handler
            if (otherButton) otherButton.disabled = false;
            progressBarContainer.style.display = 'none';
        }
    }
};

const renderTable = (tableElement, dataToRender) => {
    // Clear existing table body
    const existingBody = tableElement.querySelector('tbody');
    if (existingBody) {
      existingBody.remove();
    }

    const body = document.createElement('tbody');
    dataToRender.forEach(rowData => {
      const row = document.createElement('tr');
      rowData.forEach(cellData => {
        const td = document.createElement('td');
        td.style.border = '1px solid #e7eaf3';
        td.style.padding = '10px 15px';
        td.style.textAlign = 'left';

        const wrapper = document.createElement('div');
        wrapper.className = 'cell-content-wrapper';

        const textSpan = document.createElement('span');

        const prefixLength = 10; // Show first 10 chars
        const suffixLength = 8;  // Show last 8 chars
        const ellipsis = '...';

        if (cellData.length > prefixLength + suffixLength + ellipsis.length) {
          textSpan.textContent = cellData.substring(0, prefixLength) + ellipsis + cellData.substring(cellData.length - suffixLength);
          textSpan.dataset.fullText = cellData; // Store full text for tooltip
          textSpan.addEventListener('mouseover', showCustomTooltip);
          textSpan.addEventListener('mouseout', hideCustomTooltip);

          const copyButton = document.createElement('button');
          copyButton.className = 'copy-btn';
          const copyIconSVG = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4H18C19.1046 4 20 4.89543 20 6V16C20 17.1046 19.1046 18 18 18H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 8H14C15.1046 8 16 8.89543 16 10V20C16 21.1046 15.1046 22 14 22H6C4.89543 22 4 21.1046 4 20V10C4 8.89543 4.89543 8 6 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
          const checkIconSVG = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
          copyButton.innerHTML = copyIconSVG;

          copyButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent tooltip from showing on click
            navigator.clipboard.writeText(cellData).then(() => {
              copyButton.innerHTML = checkIconSVG;
              setTimeout(() => {
                copyButton.innerHTML = copyIconSVG;
              }, 1500);
            }).catch(err => {
              console.error('Failed to copy text: ', err);
            });
          });
          wrapper.appendChild(textSpan);
          wrapper.appendChild(copyButton);
        } else {
          textSpan.textContent = cellData;
          wrapper.appendChild(textSpan);
        }
        td.appendChild(wrapper);
        row.appendChild(td);
      });
      body.appendChild(row);
    });
    tableElement.appendChild(body);
  };

const getPageInfoFromReact = () => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for page info from React component'));
        }, 2000); // 2-second timeout

        const listener = (event) => {
            if (event.source === window && event.data.type === 'DuneAssistant_PageInfoResponse') {
                clearTimeout(timeout);
                window.removeEventListener('message', listener);
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.data);
                }
            }
        };

        window.addEventListener('message', listener);
        window.dispatchEvent(new CustomEvent('DuneAssistant_GetPageInfo'));
    });
};

const updatePaginationControls = async (modalFirstBtn, modalPrevBtn, modalNextBtn, modalLastBtn, pageInfoSpn, totalRowsSpn, duneBtns, modalState) => {
    console.log("[Dune Assistant] Updating pagination controls with:", duneBtns, "and state:", modalState);
    modalFirstBtn.disabled = !duneBtns.first || duneBtns.first.disabled;
    modalPrevBtn.disabled = !duneBtns.prev || duneBtns.prev.disabled;
    modalNextBtn.disabled = !duneBtns.next || duneBtns.next.disabled;
    modalLastBtn.disabled = !duneBtns.last || duneBtns.last.disabled;

    try {
        const reactPageInfo = await getPageInfoFromReact();
        console.log("[Dune Assistant] Received page info from React:", reactPageInfo);

        const currentPageNum = reactPageInfo.pageIndex + 1; // Convert 0-indexed to 1-indexed
        const totalPages = reactPageInfo.pageCount;
        const totalRows = reactPageInfo.total;

        modalState.currentPage = currentPageNum;
        modalState.totalPages = totalPages;

        pageInfoSpn.textContent = `Page ${currentPageNum} of ${totalPages}`;
        totalRowsSpn.textContent = `(${totalRows.toLocaleString()} rows)`;

    } catch (error) {
        console.error("[Dune Assistant] Could not get page info from React, falling back to calculation:", error);
        // Fallback logic from previous implementation
        try {
            const totalRowsElement = await waitForElement('span.table_total__eti_u');
            if (!totalRowsElement) {
                pageInfoSpn.textContent = 'Page Info N/A';
                totalRowsSpn.textContent = '';
                return;
            }

            const totalRowsText = totalRowsElement.textContent || "";
            const totalRows = parseInt(totalRowsText.replace(/,/g, '').replace(/\s*rows/i, '').trim(), 10);

            if (isNaN(totalRows)) {
                pageInfoSpn.textContent = 'Page Info N/A';
                totalRowsSpn.textContent = '';
                return;
            }

            totalRowsSpn.textContent = `(${totalRows.toLocaleString()} rows)`;
            const currentPageData = await extractData();
            const pageSize = currentPageData.length;

            if (pageSize > 0) {
                const totalPages = Math.ceil(totalRows / pageSize);
                modalState.totalPages = totalPages;

                if (duneBtns.first && duneBtns.first.disabled) {
                    modalState.currentPage = 1;
                } else if (duneBtns.last && duneBtns.last.disabled) {
                    modalState.currentPage = totalPages;
                }
                
                pageInfoSpn.textContent = `Page ${modalState.currentPage} of ${totalPages}`;
            } else {
                pageInfoSpn.textContent = 'Page Info N/A';
            }
        } catch (calcError) {
            pageInfoSpn.textContent = 'Page Info N/A';
            totalRowsSpn.textContent = '';
            console.error("[Dune Assistant] Error in fallback calculation:", calcError);
        }
    }
};

const showNotification = (message) => {
    let notification = document.getElementById('dune-assistant-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'dune-assistant-notification';
        notification.className = 'dune-assistant-notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500); // Wait for fade-out transition to complete before removing
    }, 1000); // Display for 1 second
};

// Helper function to create progress bar elements
const createProgressBarElements = (idPrefix) => {
    const container = document.createElement('div');
    container.id = `${idPrefix}-progress-container`;
    container.className = 'dune-assistant-progress-container';
    container.style.display = 'none';
    container.style.width = '100%';
    container.style.marginTop = '0px';

    const bar = document.createElement('div');
    bar.id = `${idPrefix}-progress-bar`;
    bar.className = 'dune-assistant-progress-bar';

    const text = document.createElement('div');
    text.id = `${idPrefix}-progress-bar-text`;
    text.className = 'dune-assistant-progress-text';
    text.textContent = ''; // Initial text

    container.appendChild(bar);
    container.appendChild(text);

    return { container, bar, text };
};

  const showModal = async () => {
  const headers = await getHeaders();
  let currentPageData = await extractData(); // Get data for the current page

  // Check if a modal already exists and remove it.
  const existingModal = document.getElementById('dune-assistant-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'dune-assistant-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
  overlay.style.zIndex = '9999'; // Below modal, above page content
  overlay.addEventListener('click', () => {
    modal.remove();
    overlay.remove();
    hideCustomTooltip(); // Hide tooltip if overlay is clicked
  });

  const modal = document.createElement('div');
  modal.id = 'dune-assistant-modal';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = 'white';
  modal.style.padding = '0'; // Remove padding from modal itself, add to internal elements
  modal.style.border = '1px solid #ccc';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  modal.style.zIndex = '10000'; // High z-index to be on top
  modal.style.maxHeight = '80vh';
  modal.style.maxWidth = '90vw'; // Set max-width to 90% of viewport width
  modal.style.display = 'flex'; // Use flexbox for layout
  modal.style.flexDirection = 'column'; // Stack children vertically
  modal.style.overflow = 'hidden'; // Hide modal's own scrollbars

  const modalState = { currentPage: 1, totalPages: 1, isInitial: true };

  // Create Toolbar
  const toolbar = document.createElement('div');
  toolbar.id = 'dune-assistant-toolbar';
  toolbar.style.padding = '10px 20px';
  toolbar.style.borderBottom = '1px solid #e7eaf3';
  toolbar.style.display = 'flex';
  toolbar.style.justifyContent = 'space-between';
  toolbar.style.alignItems = 'center';
  toolbar.style.backgroundColor = '#f8f9fa'; // Match header background

  // Left side of toolbar (Close Button and Refresh Button)
  const toolbarLeft = document.createElement('div');
  const closeButton = createButton('Close', ['btn-close'], () => {
    modal.remove();
    overlay.remove();
    hideCustomTooltip();
  });
  toolbarLeft.appendChild(closeButton);

  const refreshButton = createButton('Refresh', ['btn-primary'], async function() {
    const btn = this; // Store reference to the button

    const currentData = await extractData(); // Get data from Dune
    const modalTableEl = document.getElementById('dune-assistant-modal-table');
    const modalFirstBtn = document.getElementById('dune-assistant-modal-first-button');
    const modalPrevBtn = document.getElementById('dune-assistant-modal-prev-button');
    const modalNextBtn = document.getElementById('dune-assistant-modal-next-button');
    const modalLastBtn = document.getElementById('dune-assistant-modal-last-button');
    const modalPageInfoSpan = document.getElementById('dune-assistant-modal-page-info');

    renderTable(modalTableEl, currentData); // Update modal table

    const duneBtns = await findDunePaginationButtons(); // Get latest Dune pagination state
    updatePaginationControls(modalFirstBtn, modalPrevBtn, modalNextBtn, modalLastBtn, modalPageInfoSpan, duneBtns, modalState);
    showNotification("Refresh completed!"); // Show notification after refresh
    btn.blur(); // Remove focus from the button

    // Force reset styles after a very short delay to ensure it overrides Dune's potential re-rendering
    setTimeout(() => {
      btn.style.backgroundColor = '#eaf2ff'; // Default btn-primary background
      btn.style.color = '#4e73df'; // Default btn-primary color
    }, 50); // A very short delay
  });
  toolbarLeft.appendChild(refreshButton);
  toolbar.appendChild(toolbarLeft);

  // Center of toolbar (Export Buttons)
  const toolbarCenter = document.createElement('div');
  const exportPageButton = createButton('Export Page CSV', ['btn-secondary'], function() {
      const btn = this; // Store reference to the button
      chrome.runtime.sendMessage({ action: "exportCSV", data: currentPageData, pageInfo: pageInfoSpan.textContent });
      btn.blur(); // Remove focus from the button

      // Force reset styles after a very short delay
      setTimeout(() => {
        btn.style.backgroundColor = '#e6f9f1'; // Default btn-secondary background
        btn.style.color = '#1cc88a'; // Default btn-secondary color
      }, 50);
  });
  exportPageButton.id = 'dune-assistant-export-page-csv-button'; // Add ID

  const exportAllButton = createButton('Export All CSV', ['btn-secondary'], async () => {
    const exportPageButton = document.getElementById('dune-assistant-export-page-csv-button');
    const exportAllButton = document.getElementById('dune-assistant-export-all-csv-button');
    const modalProgressBarContainer = document.getElementById('dune-assistant-modal-progress-container');
    const modalProgressBar = document.getElementById('dune-assistant-modal-progress-bar');
    const modalProgressBarText = document.getElementById('dune-assistant-modal-progress-bar-text');
    await performFullExport(exportAllButton, exportPageButton, modalProgressBarContainer, modalProgressBar, modalProgressBarText, "all");
  });
  exportAllButton.id = 'dune-assistant-export-all-csv-button'; // Add ID
  toolbarCenter.appendChild(exportPageButton);
  toolbarCenter.appendChild(exportAllButton);
  toolbar.appendChild(toolbarCenter);

  // Progress bar elements for the modal
  const modalProgressBarElements = createProgressBarElements('dune-assistant-modal');
  const modalProgressBarContainer = modalProgressBarElements.container;
  const modalProgressBar = modalProgressBarElements.bar;
  const modalProgressBarText = modalProgressBarElements.text;

  toolbarCenter.appendChild(modalProgressBarContainer);

  // Right side of toolbar (Pagination Controls)
  const toolbarRight = document.createElement('div');
  toolbarRight.style.display = 'flex';
  toolbarRight.style.alignItems = 'center';

  const firstButton = createButton('First', ['btn-pagination']);
  firstButton.id = 'dune-assistant-modal-first-button';
  const prevButton = createButton('<', ['btn-pagination']);
  prevButton.id = 'dune-assistant-modal-prev-button';
  const nextButton = createButton('>', ['btn-pagination']);
  nextButton.id = 'dune-assistant-modal-next-button';
  const lastButton = createButton('Last', ['btn-pagination']);
  lastButton.id = 'dune-assistant-modal-last-button';
  const pageInfoSpan = document.createElement('span');
  pageInfoSpan.id = 'dune-assistant-modal-page-info';
  pageInfoSpan.style.margin = '0 10px';
  pageInfoSpan.style.color = '#6c757d';

  const totalRowsSpan = document.createElement('span');
  totalRowsSpan.id = 'dune-assistant-modal-total-rows';
  totalRowsSpan.style.margin = '0 10px';
  totalRowsSpan.style.color = '#6c757d';
  totalRowsSpan.style.fontSize = '12px';

  firstButton.addEventListener('click', async () => {
    if (await simulateDunePaginationClick('first')) {
        currentPageData = await extractData();
        renderTable(tableEl, currentPageData);
        const duneBtns = await findDunePaginationButtons();
        updatePaginationControls(firstButton, prevButton, nextButton, lastButton, pageInfoSpan, totalRowsSpan, duneBtns, modalState);
    }
  });
  prevButton.addEventListener('click', async () => {
    if (await simulateDunePaginationClick('prev')) {
        currentPageData = await extractData();
        renderTable(tableEl, currentPageData);
        const duneBtns = await findDunePaginationButtons();
        updatePaginationControls(firstButton, prevButton, nextButton, lastButton, pageInfoSpan, totalRowsSpan, duneBtns, modalState);
    }
  });
  nextButton.addEventListener('click', async () => {
    if (await simulateDunePaginationClick('next')) {
        currentPageData = await extractData();
        renderTable(tableEl, currentPageData);
        const duneBtns = await findDunePaginationButtons();
        updatePaginationControls(firstButton, prevButton, nextButton, lastButton, pageInfoSpan, totalRowsSpan, duneBtns, modalState);
    }
  });
  lastButton.addEventListener('click', async () => {
    if (await simulateDunePaginationClick('last')) {
        currentPageData = await extractData();
        renderTable(tableEl, currentPageData);
        const duneBtns = await findDunePaginationButtons();
        updatePaginationControls(firstButton, prevButton, nextButton, lastButton, pageInfoSpan, totalRowsSpan, duneBtns, modalState);
    }
  });

  toolbarRight.appendChild(firstButton);
  toolbarRight.appendChild(prevButton);
  toolbarRight.appendChild(pageInfoSpan);
  toolbarRight.appendChild(nextButton);
  toolbarRight.appendChild(lastButton);
  toolbarRight.appendChild(totalRowsSpan);

  toolbar.appendChild(toolbarRight);

  // Create Table Container (for fixed header and scrollable body)
  const tableContainer = document.createElement('div');
  tableContainer.id = 'dune-assistant-table-container';
  tableContainer.style.flexGrow = '1'; // Take remaining vertical space
  tableContainer.style.overflow = 'auto'; // Enable scrolling for the entire table content (both horizontal and vertical)
  tableContainer.style.padding = '0 20px 20px 20px'; // Add padding to the table content area

  const tableEl = document.createElement('table');
  tableEl.id = 'dune-assistant-modal-table'; // Add ID
  tableEl.style.width = '100%'; // Table takes full width of its container
  tableEl.style.minWidth = 'max-content'; // Ensure table doesn't shrink below content
  tableEl.style.borderCollapse = 'collapse';
  tableEl.style.border = 'none';

  const headerEl = document.createElement('thead');
  headerEl.style.position = 'sticky'; // Make header sticky
  headerEl.style.top = '0'; // Stick to the top of its scrollable parent
  headerEl.style.zIndex = '1'; // Ensure it's above scrolling content
  headerEl.style.backgroundColor = '#f8f9fa'; // Ensure background for sticky header

  const headerRow = document.createElement('tr');
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.border = '1px solid #e7eaf3';
    th.style.padding = '12px 15px';
    th.style.whiteSpace = 'nowrap';
    th.style.fontWeight = 'bold';
    th.style.textAlign = 'left';
    th.style.backgroundColor = 'inherit'; // Inherit from thead's sticky background
    headerRow.appendChild(th);
  });
  headerEl.appendChild(headerRow);
  tableEl.appendChild(headerEl);

  // Initial render of the table with the current page of data from Dune
  if (currentPageData.length === 0) {
      alert("Could not extract any data from the current Dune page. The table might not be loaded yet or the selectors are incorrect.");
      modal.remove();
      overlay.remove();
      return;
  }
  renderTable(tableEl, currentPageData);

  tableContainer.appendChild(tableEl); // Append table to its container

  modal.appendChild(toolbar); // Add toolbar first
  modal.appendChild(tableContainer); // Then add table container

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Update pagination controls after modal is appended and elements are in DOM
  const initialDuneButtons = await findDunePaginationButtons();
  updatePaginationControls(firstButton, prevButton, nextButton, lastButton, pageInfoSpan, totalRowsSpan, initialDuneButtons, modalState);
};

let isInitializing = false;

// Function to inject the script that can access the page's JS context
const injectScript = (filePath) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(filePath);
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
};

const init = async () => {
  if (isInitializing || document.getElementById('dune-assistant-view-data-button')) {
    return;
  }
  isInitializing = true;

  try {
    injectGlobalStyles(); // Inject styles once
    injectScript('injected.js'); // Inject the script to access React props

    const resultsSection = await waitForElement('section[id="results"]');
    if (!resultsSection) {
      return;
    }

    // Double-check after finding the section, in case another process finished
    if (document.getElementById('dune-assistant-view-data-button')) {
        return;
    }

    let targetElement = await waitForElement('div[class*="header__"] div[class*="rightPanel__"]', resultsSection);
    if (!targetElement) {
        console.error("Could not find target element for buttons.");
        return;
    }
    targetElement.addEventListener('mouseover', (e) => e.stopPropagation());
    targetElement.addEventListener('mouseenter', (e) => e.stopPropagation());

    const viewDataButton = createButton('View Data', ['btn-primary'], showModal);
    viewDataButton.id = 'dune-assistant-view-data-button';

    const exportCsvButton = createButton('Export CSV', ['btn-secondary'], async () => {
      const exportButton = document.getElementById('dune-assistant-export-csv-button');
      const viewDataButton = document.getElementById('dune-assistant-view-data-button');
      // Pass the globally declared progress bar elements
      await performFullExport(exportButton, viewDataButton, mainProgressBarContainer, mainProgressBar, mainProgressBarText, "all");
    });
    exportCsvButton.id = 'dune-assistant-export-csv-button';

    const mainProgressBarElements = createProgressBarElements('dune-assistant-main');
    mainProgressBarContainer = mainProgressBarElements.container;
    mainProgressBar = mainProgressBarElements.bar;
    mainProgressBarText = mainProgressBarElements.text;

    // Find the Lineage button to insert after it for consistent placement
    let lineageButton = null;
    const buttonsInTarget = targetElement.querySelectorAll('button');
    for (const btn of buttonsInTarget) {
        if (btn.textContent.includes('Lineage')) {
            lineageButton = btn;
            break;
        }
    }

    if (lineageButton) {
        lineageButton.after(viewDataButton);
        viewDataButton.after(exportCsvButton);
    } else {
        // Fallback to appending if Lineage button not found
        targetElement.appendChild(viewDataButton);
        targetElement.appendChild(exportCsvButton);
    }

    // Insert the progress bar after the header element (parent of targetElement)
    if (targetElement.parentElement) {
        targetElement.parentElement.after(mainProgressBarContainer);
    } else {
        // Fallback if parentElement is not found (shouldn't happen if targetElement is found)
        resultsSection.appendChild(mainProgressBarContainer);
    }
  } finally {
    isInitializing = false;
  }
};

// Use a MutationObserver to detect when the target element is available
const observer = new MutationObserver((mutationsList, observer) => {
  // The observer callback now simply triggers init.
  // The logic to check if the button exists is inside init itself.
  init();
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial attempt in case the element is already present
init();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showExportNotification") {
    showNotification(request.message);
  }
});

}