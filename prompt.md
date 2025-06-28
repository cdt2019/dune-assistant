1. 难点：由于dune 执行sql结果后，结果数据显示组件通常是被遮盖或者无法全部显示数据。导出cvs文件需要积分。
如图：
![结果数据无法显示](./imags/dune_result.png)
![无法导出csv](./imags/export_csv.png)

2. 需求：构建一个chrome插件 dune assistant，协助用户查看 [dune](https://dune.com/queries) queriy 结果数据和导出csv文件。
  2.1. 协助用户查看结果，当用户选择选定 结果section 时，以弹出框形式显示完整的数据.

  dune SectionResults组件(XPATH: //*[@id="results"]:) 显示数据，参考下面的SectionResults组件显示html数据。由于查询sql不一样，显示结果列是有差异的，需要兼容相关情况。

  **结果数据弹出框页面显示，需求美观简洁**
  
  ```html
<section class="SectionResults_results__vPGZw" id="results"><div class="SectionResults_panels__jh3PA"><div class="SectionResults_header__3Xw_E"><div class="SectionResults_rightPanel__5hJ2p"><div><button class="IconButton_iconButton__bWEeL buttonThemes_button__dGQts buttonThemes_theme-tertiary___ECCn IconButton_size-M__BKA_b"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.75 11.5L12 14.5L13.25 11.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 14.1562C4.76078 14.3749 4.44911 14.4974 4.125 14.5C3.3625 14.5 2.75 13.8313 2.75 13C2.75 12.1687 3.3625 11.5 4.125 11.5C4.44911 11.5026 4.76078 11.6251 5 11.8438" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 14.25C7.27088 14.452 7.59957 14.5616 7.9375 14.5625C8.5 14.5625 9 14.375 9 13.75C9 12.75 7 13.1875 7 12.25C7 11.75 7.375 11.4375 7.9375 11.4375C8.27543 11.4384 8.60412 11.548 8.875 11.75" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 9V1.5C3 1.36739 3.05268 1.24021 3.14645 1.14645C3.24021 1.05268 3.36739 1 3.5 1H9.5L13 4.5V9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.5 1V4.5H13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M0.5 7L3 9.5L5.5 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div></div><nav class="SectionResults_vizList__AwiwL"><button class="Button_button__uOc7h buttonThemes_button__dGQts buttonThemes_theme-primary-light__C1NvW Button_size-S__nNc6_ ClickPopover_trigger__Lv0sw">New<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.64645 4.64645C1.84171 4.45118 2.15829 4.45118 2.35355 4.64645L8 10.2929L13.6464 4.64645C13.8417 4.45118 14.1583 4.45118 14.3536 4.64645C14.5488 4.84171 14.5488 5.15829 14.3536 5.35355L8.35355 11.3536C8.15829 11.5488 7.84171 11.5488 7.64645 11.3536L1.64645 5.35355C1.45118 5.15829 1.45118 4.84171 1.64645 4.64645Z" fill="currentColor"></path></svg></button><button class="Button_button__uOc7h buttonThemes_button__dGQts active buttonThemes_theme-tertiary___ECCn Button_size-S__nNc6_ ClickPopover_trigger__Lv0sw"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Table</title><rect x="1.5" y="2.5" width="13" height="11" rx="0.5" stroke="currentColor"></rect><path d="M2 7.5H14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 10.5H14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.5 7.5V13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10.5 7.5V13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>Query results<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9.5C2.17157 9.5 1.5 8.82843 1.5 8C1.5 7.17157 2.17157 6.5 3 6.5C3.82843 6.5 4.5 7.17157 4.5 8C4.5 8.82843 3.82843 9.5 3 9.5ZM8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8C9.5 8.82843 8.82843 9.5 8 9.5ZM13 9.5C12.1716 9.5 11.5 8.82843 11.5 8C11.5 7.17157 12.1716 6.5 13 6.5C13.8284 6.5 14.5 7.17157 14.5 8C14.5 8.82843 13.8284 9.5 13 9.5Z" fill="currentColor"></path></svg></button><a class="Button_button__uOc7h buttonThemes_button__dGQts buttonThemes_theme-tertiary___ECCn Button_size-S__nNc6_" data-state="closed" href="/queries/5361959/lineage"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 12.75C3.7165 12.75 4.5 11.9665 4.5 11C4.5 10.0335 3.7165 9.25 2.75 9.25C1.7835 9.25 1 10.0335 1 11C1 11.9665 1.7835 12.75 2.75 12.75Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.5 2.5L15 5L12.5 7.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4.5 11H5C5.79565 11 6.55871 10.6839 7.12132 10.1213C7.68393 9.55871 8 8.79565 8 8C8 7.20435 8.31607 6.44129 8.87868 5.87868C9.44129 5.31607 10.2044 5 11 5H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>Lineage</a></nav></div><div class="SectionResults_results__vPGZw Layout_results__3PJ5z"><div class="visual_wrap__0siae visual_theme-orange__5eW1v visual_table__LER0F"><header class="header_header__ovdBi"><div class="header_details__TEZlM"><div class="header_title__m8c3F" style="color: var(--text--primary);"><a class="header_link__NKrbV" href="/queries/5361959/8778990"><span>Query results</span><span>New Query</span></a></div></div></header><div class="visual_result__6q0xu"><table class="table_table__FDV2P"><thead><tr><th aria-sort="none"><button type="button" class="">blockchain</button></th><th aria-sort="none"><button type="button" class="">project</button></th><th aria-sort="none"><button type="button" class="">version</button></th><th aria-sort="none"><button type="button" class="">block_month</button></th><th aria-sort="none"><button type="button" class="">block_date</button></th><th aria-sort="none"><button type="button" class="">block_time</button></th><th aria-sort="none"><button type="button" class="">block_slot</button></th><th aria-sort="none"><button type="button" class="">trade_source</button></th><th aria-sort="none"><button type="button" class="">token_bought_symbol</button></th><th aria-sort="none"><button type="button" class="">token_sold_symbol</button></th><th aria-sort="none"><button type="button" class="">token_pair</button></th><th aria-sort="none"><button type="button" class="">token_bought_amount</button></th><th aria-sort="none"><button type="button" class="">token_sold_amount</button></th><th aria-sort="none"><button type="button" class="">token_bought_amount_raw</button></th><th aria-sort="none"><button type="button" class="">token_sold_amount_raw</button></th><th aria-sort="none"><button type="button" class="">amount_usd</button></th><th aria-sort="none"><button type="button" class="">fee_tier</button></th><th aria-sort="none"><button type="button" class="">fee_usd</button></th><th aria-sort="none"><button type="button" class="">token_bought_mint_address</button></th><th aria-sort="none"><button type="button" class="">token_sold_mint_address</button></th><th aria-sort="none"><button type="button" class="">token_bought_vault</button></th><th aria-sort="none"><button type="button" class="">token_sold_vault</button></th><th aria-sort="none"><button type="button" class="">project_program_id</button></th><th aria-sort="none"><button type="button" class="">project_main_id</button></th><th aria-sort="none"><button type="button" class="">trader_id</button></th><th aria-sort="none"><button type="button" class="">tx_id</button></th><th aria-sort="none"><button type="button" class="">outer_instruction_index</button></th><th aria-sort="none"><button type="button" class="">inner_instruction_index</button></th><th aria-sort="none"><button type="button" class="">tx_index</button></th></tr></thead><tbody><tr><td><div class=""><div>solana</div></div></td><td><div class=""><div>raydium</div></div></td><td><div class="">4</div></td><td><div class="">2025-06-01 00:00</div></td><td><div class="">2025-06-27 00:00</div></td><td><div class="">2025-06-27 16:13</div></td><td><div class="">349572044</div></td><td><div class=""><div>JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4</div></div></td><td><div class=""><div>USDC</div></div></td><td><div class=""><div>SOL</div></div></td><td><div class=""><div>USDC-SOL</div></div></td><td><div class="">223.107027</div></td><td><div class="">1.557354109</div></td><td><div class="">223107027</div></td><td><div class="">1557354109</div></td><td><div class="">223.21634944323</div></td><td><div class=""><span class="visual_empty__uR3Nb" aria-hidden="true"></span></div></td><td><div class=""><span class="visual_empty__uR3Nb" aria-hidden="true"></span></div></td><td><div class=""><div>EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</div></div></td><td><div class=""><div>So11111111111111111111111111111111111111112</div></div></td><td><div class=""><div>HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz</div></div></td><td><div class=""><div>DQyrAcCrDXQ7NeoqGgDCZwBvWDcYmFCjSb9JtteuvPpz</div></div></td><td><div class=""><div>58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2</div></div></td><td><div class=""><div>675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8</div></div></td><td><div class=""><div>H9fEJwjHBcK1xcS9kGRDeoXCnHjbxEBqMw5NJkFTH4ng</div></div></td><td><div class=""><div>55WFK94rN4sjreDbfq1V1PTx2TmvcaT6qi4cswqGvcmZVXgnnsLZUwr3cVtg1cEZ2d17B4wHM1XrstnrixdTW5Re</div></div></td><td><div class="">8</div></td><td><div class="">1</div></td><td><div class="">1163</div></td></tr></tbody></table></div><div class="visual_vizFooter__vCe59"><ul class="table_footer__Ky_k2 table_footer-defaults__fFoLi"><li data-min-parent-width="380"><span class="table_total__eti_u">120 rows</span></li><li><input aria-label="Search" placeholder="Search..." value="H9fEJwjHBcK1xcS9kGRDeoXCnHjbxEBqMw5NJkFTH4ng"></li><li><button type="button" disabled=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.35355 14.3536C8.15829 14.5488 7.84171 14.5488 7.64645 14.3536L1.64645 8.35355C1.45118 8.15829 1.45118 7.84171 1.64645 7.64645L7.64645 1.64645C7.84171 1.45118 8.15829 1.45118 8.35355 1.64645C8.54881 1.84171 8.54881 2.15829 8.35355 2.35355L2.70711 8L8.35355 13.6464C8.54882 13.8417 8.54882 14.1583 8.35355 14.3536Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M14.3536 14.3536C14.1583 14.5488 13.8417 14.5488 13.6464 14.3536L7.64645 8.35355C7.45118 8.15829 7.45118 7.84171 7.64645 7.64645L13.6464 1.64645C13.8417 1.45118 14.1583 1.45118 14.3536 1.64645C14.5488 1.84171 14.5488 2.15829 14.3536 2.35355L8.70711 8L14.3536 13.6464C14.5488 13.8417 14.5488 14.1583 14.3536 14.3536Z" fill="currentColor"></path></svg></button></li><li><button type="button" disabled=""><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.3536 1.64645C11.5488 1.84171 11.5488 2.15829 11.3536 2.35355L5.70711 8L11.3536 13.6464C11.5488 13.8417 11.5488 14.1583 11.3536 14.3536C11.1583 14.5488 10.8417 14.5488 10.6464 14.3536L4.64645 8.35355C4.45118 8.15829 4.45118 7.84171 4.64645 7.64645L10.6464 1.64645C10.8417 1.45118 11.1583 1.45118 11.3536 1.64645Z" fill="currentColor"></path></svg></button></li><li data-min-parent-width="520"><select aria-label="Select page"><option value="0">Page 1</option><option value="1">Page 2</option><option value="2">Page 3</option><option value="3">Page 4</option><option value="4">Page 5</option></select></li><li><button type="button"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.64645 14.3536C4.45118 14.1583 4.45118 13.8417 4.64645 13.6464L10.2929 8L4.64645 2.35355C4.45118 2.15829 4.45118 1.84171 4.64645 1.64645C4.84171 1.45118 5.15829 1.45118 5.35355 1.64645L11.3536 7.64645C11.5488 7.84171 11.5488 8.15829 11.3536 8.35355L5.35355 14.3536C5.15829 14.5488 4.84171 14.5488 4.64645 14.3536Z" fill="currentColor"></path></svg></button></li><li><button type="button"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.64645 1.64645C7.84171 1.45118 8.15829 1.45118 8.35355 1.64645L14.3536 7.64645C14.5488 7.84171 14.5488 8.15829 14.3536 8.35355L8.35355 14.3536C8.15829 14.5488 7.84171 14.5488 7.64645 14.3536C7.45118 14.1583 7.45118 13.8417 7.64645 13.6464L13.2929 8L7.64645 2.35355C7.45118 2.15829 7.45118 1.84171 7.64645 1.64645Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M1.64645 1.64645C1.84171 1.45118 2.15829 1.45118 2.35355 1.64645L8.35355 7.64645C8.54882 7.84171 8.54882 8.15829 8.35355 8.35355L2.35355 14.3536C2.15829 14.5488 1.84171 14.5488 1.64645 14.3536C1.45118 14.1583 1.45118 13.8417 1.64645 13.6464L7.29289 8L1.64645 2.35355C1.45118 2.15829 1.45118 1.84171 1.64645 1.64645Z" fill="currentColor"></path></svg></button></li></ul><div class="visual_ownerStatuses__tEKua"><div class="header_owner__AZzF0"><span style="color: var(--gray-600);"><a href="/chendatong"><img alt="@chendatong" loading="lazy" width="12" height="12" decoding="async" data-nimg="1" srcset="/_next/image?url=%2Fassets%2Favatar-fallback%2Fanon-green.png&amp;w=16&amp;q=75 1x, /_next/image?url=%2Fassets%2Favatar-fallback%2Fanon-green.png&amp;w=32&amp;q=75 2x" src="/_next/image?url=%2Fassets%2Favatar-fallback%2Fanon-green.png&amp;w=32&amp;q=75" style="color: transparent; border-radius: 100%;"></a></span><span class="header_owner-label__YfHsE"><span style="color: var(--text--secondary);"><a href="/chendatong">@chendatong</a></span></span></div><div class="visual_statuses__06E9n hide-in-screenshots"><button class="IconButton_iconButton__bWEeL buttonThemes_button__dGQts buttonThemes_theme-ghost__CJplz IconButton_size-XS__GjcgM VisualMenu_button__o_Tqp ClickPopover_trigger__Lv0sw"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9.5C2.17157 9.5 1.5 8.82843 1.5 8C1.5 7.17157 2.17157 6.5 3 6.5C3.82843 6.5 4.5 7.17157 4.5 8C4.5 8.82843 3.82843 9.5 3 9.5ZM8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8C9.5 8.82843 8.82843 9.5 8 9.5ZM13 9.5C12.1716 9.5 11.5 8.82843 11.5 8C11.5 7.17157 12.1716 6.5 13 6.5C13.8284 6.5 14.5 7.17157 14.5 8C14.5 8.82843 13.8284 9.5 13 9.5Z" fill="currentColor"></path></svg></button> <span class="status_status__Td79J"><button><span class="Badge_badge__Q7Wge Badge_size-M__H8BV7 Badge_color-success__dx14I Badge_filled__BuEyy">20min<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.55469 9.44531C2.12344 9.01406 2.40938 8.10937 2.18906 7.57969C1.96875 7.05 1.125 6.58594 1.125 6C1.125 5.41406 1.95938 4.96875 2.18906 4.42031C2.41875 3.87188 2.12344 2.98594 2.55469 2.55469C2.98594 2.12344 3.89063 2.40938 4.42031 2.18906C4.95 1.96875 5.41406 1.125 6 1.125C6.58594 1.125 7.03125 1.95938 7.57969 2.18906C8.12812 2.41875 9.01406 2.12344 9.44531 2.55469C9.87656 2.98594 9.59063 3.89063 9.81094 4.42031C10.0313 4.95 10.875 5.41406 10.875 6C10.875 6.58594 10.0406 7.03125 9.81094 7.57969C9.58125 8.12812 9.87656 9.01406 9.44531 9.44531C9.01406 9.87656 8.10937 9.59063 7.57969 9.81094C7.05 10.0313 6.58594 10.875 6 10.875C5.41406 10.875 4.96875 10.0406 4.42031 9.81094C3.87188 9.58125 2.98594 9.87656 2.55469 9.44531Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.0625 4.875L5.31094 7.5L3.9375 6.1875" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></button></span></div></div></div></div></div></div></section>

  ```

  2.2. 导出csv文件：由于SectionResults组件是按页显示数据，查询结果可能是有多页。导出csv的数据是要完整的数据，所以需要动态执行一页一页得采集数据，然后导出完整的csv文件。具体按钮显示位置在 SectionResults html。请自行分析

3. 编码规范:

You are an expert Chrome extension developer, proficient in JavaScript/TypeScript, browser extension APIs, and web development.

Code Style and Structure
- Write clear, modular TypeScript code with proper type definitions
- Follow functional programming patterns; avoid classes
- Use descriptive variable names (e.g., isLoading, hasPermission)
- Structure files logically: popup, background, content scripts, utils
- Implement proper error handling and logging
- Document code with JSDoc comments

Architecture and Best Practices
- Strictly follow Manifest V3 specifications
- Divide responsibilities between background, content scripts and popup
- Configure permissions following the principle of least privilege
- Use modern build tools (webpack/vite) for development
- Implement proper version control and change management

Chrome API Usage
- Use chrome.* APIs correctly (storage, tabs, runtime, etc.)
- Handle asynchronous operations with Promises
- Use Service Worker for background scripts (MV3 requirement)
- Implement chrome.alarms for scheduled tasks
- Use chrome.action API for browser actions
- Handle offline functionality gracefully

Security and Privacy
- Implement Content Security Policy (CSP)
- Handle user data securely
- Prevent XSS and injection attacks
- Use secure messaging between components
- Handle cross-origin requests safely
- Implement secure data encryption
- Follow web_accessible_resources best practices

Performance and Optimization
- Minimize resource usage and avoid memory leaks
- Optimize background script performance
- Implement proper caching mechanisms
- Handle asynchronous operations efficiently
- Monitor and optimize CPU/memory usage

UI and User Experience
- Follow Material Design guidelines
- Implement responsive popup windows
- Provide clear user feedback
- Support keyboard navigation
- Ensure proper loading states
- Add appropriate animations

Internationalization
- Use chrome.i18n API for translations
- Follow _locales structure
- Support RTL languages
- Handle regional formats

Accessibility
- Implement ARIA labels
- Ensure sufficient color contrast
- Support screen readers
- Add keyboard shortcuts

Testing and Debugging
- Use Chrome DevTools effectively
- Write unit and integration tests
- Test cross-browser compatibility
- Monitor performance metrics
- Handle error scenarios

Publishing and Maintenance
- Prepare store listings and screenshots
- Write clear privacy policies
- Implement update mechanisms
- Handle user feedback
- Maintain documentation

Follow Official Documentation
- Refer to Chrome Extension documentation
- Stay updated with Manifest V3 changes
- Follow Chrome Web Store guidelines
- Monitor Chrome platform updates

Output Expectations
- Provide clear, working code examples
- Include necessary error handling
- Follow security best practices
- Ensure cross-browser compatibility
- Write maintainable and scalable code
