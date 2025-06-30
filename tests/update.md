
    1 feat: Enhance Dune Assistant stability and user experience
    2
    3 This commit addresses several bugs and improves the overall functionality and user experience of the Dune Assistant Chrome extension.
    4
    5 Key changes include:
    6
    7 - **Improved "View Data" Modal Refresh:**
    8     - Enhanced `injected.js` to wait for the React DOM to fully load before attempting to extract page information, preventing "Page Info N/A" errors.
    9     - Increased timeout for React page info extraction in `content.js` for better robustness.
   10     - Corrected parameter passing in `updatePaginationControls` for the "Refresh" button, ensuring accurate page and row count display.
   11
   12 - **Robust "Export All CSV" Button Functionality:**
   13     - Fixed an issue where the "Export All CSV" button (both in the main page and modal) would become unresponsive after cancellation. This was achieved by correctly
      managing event listeners using `addEventListener` and `removeEventListener` instead of direct `onclick` assignments.
   14     - Ensured the button correctly reverts to its original "Export All CSV" state after cancellation or completion.
   15
   16 - **Accurate Progress Bar and Estimated Time of Completion (ETC):**
   17     - Refined the ETC calculation and display in `performFullExport` to show both minutes and seconds (e.g., "2m 30s remaining"), providing more precise feedback during
      large exports.
   18
   19 - **Graceful Export Cancellation:**
   20     - Implemented logic to refresh the "View Data" modal's UI (table data and pagination) immediately upon export cancellation, ensuring the displayed data reflects the
      current state of the Dune page.
   21     - Added a condition to prevent `TypeError` when cancelling exports initiated directly from the Dune page (not through the modal), by only attempting modal UI refresh
      if the export originated from the modal.
   22
   23 - **Cleaned Up Debugging Logs:**
   24     - Removed excessive `console.log` and `console.error` statements prefixed with `[Dune Assistant]` from `content.js` and `injected.js` to reduce console clutter.
   25
   26 - **Enhanced Data Extraction Robustness:**
   27     - Modified `getTableElement` to explicitly wait for the actual `<table>` element to appear and for any "Loading..." messages to disappear before attempting data
      extraction, preventing empty data displays when Dune is still loading.
   28
   29 These changes significantly improve the reliability and user-friendliness of the Dune Assistant extension.

  请确认此提交信息是否符合你的要求。