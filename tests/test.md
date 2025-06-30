$env:HTTP_PROXY="http://127.0.0.1:15236"
$env:HTTPS_PROXY="http://127.0.0.1:15236"

cd D:\VisulSpace\dune-assistant\
npx gemini


cd E:\VisualCodeWorkspace\dune-assistant
npx gemini

select * from dex_solana.trades where block_slot = 349653413


了解当前项目, 再帮忙修改bug

在 view data 按钮进去 ，点击 export all csv . 理论上 会触发下一页 下一页 逐页 采集数据，同时显示采集数进度条，然后导出csv 文件。bug是 已经触发 dune 采集 第一页 第二页的数据，插件的分页器还是显示第一页，同时进度条还是显示第一页进度，并没有下一步去采集下一页数据。

