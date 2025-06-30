// This script is injected into the page to access React component props.
(function() {
    // Function to find the react fiber instance for a given DOM element
    function findFiber(dom) {
        const key = Object.keys(dom).find(key => key.startsWith('__reactFiber$'));
        return dom[key];
    }

    // Function to find a component's props by traversing up the fiber tree
    function findProps(fiber) {
        let current = fiber;
        while (current) {
            if (current.memoizedProps && typeof current.memoizedProps.pageIndex === 'number' && typeof current.memoizedProps.pageCount === 'number' && typeof current.memoizedProps.total === 'number') {
                return current.memoizedProps;
            }
            current = current.return;
        }
        return null;
    }

    // Helper function to wait for an element to appear in the DOM
    const waitForElement = async (selector, parentElement = document, maxAttempts = 20, delay = 250) => {
        let element = null;
        let attempts = 0;
        while (!element && attempts < maxAttempts) {
            element = parentElement.querySelector(selector);
            if (element) {
                return element;
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return null;
    };

    // Listen for a request from the content script
    window.addEventListener('DuneAssistant_GetPageInfo', async () => { // Make the event listener async
        try {
            // Start search from a known element in the results section
            const footerElement = await waitForElement('div.visual_vizFooter__vCe59 ul.table_footer__Ky_k2'); // Use waitForElement
            if (!footerElement) {
                window.postMessage({ type: 'DuneAssistant_PageInfoResponse', error: 'Could not find footer element after waiting.' }, '*');
                return;
            }

            const fiber = findFiber(footerElement);
            if (!fiber) {
                window.postMessage({ type: 'DuneAssistant_PageInfoResponse', error: 'Could not find React Fiber for footer.' }, '*');
                return;
            }

            const props = findProps(fiber);

            if (props) {
                window.postMessage({
                    type: 'DuneAssistant_PageInfoResponse',
                    data: {
                        pageIndex: props.pageIndex,
                        pageCount: props.pageCount,
                        total: props.total
                    }
                }, '*');
            } else {
                window.postMessage({ type: 'DuneAssistant_PageInfoResponse', error: 'Could not find pagination props in component tree.' }, '*');
            }
        } catch (e) {
            window.postMessage({ type: 'DuneAssistant_PageInfoResponse', error: e.toString() }, '*');
        }
    });
})();