# 饼饼定制报价表资料包
生成时间：2026-06-09
## 核心入口
- 流程梳理文档：`流程文档.md`
- 本地图片/OCR库：http://127.0.0.1:8765/image_library.html
- 原始主表：`source/饼饼定制报价表（513更新）.xlsx`
- 主表 CSV：`extracted/csv/`
- 底部 Tab 点击截图：`extracted/tab_click_screenshots/`
- 主表嵌入图片：`extracted/images/`
- 二级页面截图/资产：`extracted/secondary_pages/`
- OCR 文本：`extracted/ocr/`
- 结构化元数据：`extracted/metadata/`

## 已保存内容
- 主表工作表：11 个
- 底部 Tab 点击截图：11 张
- 主表单元格超链接：51 条，其中外部腾讯文档/表格 10 个
- 主表嵌入图片：29 张
- 图片库可浏览图片：116 张，全部提供打开、复制图片、保存到本地、复制 OCR
- OCR 文件：116 个，总识别字符 72246

## 工作表
- 汇总表: 25 行 x 11 列，非空单元格 47，CSV `extracted/csv/汇总表.csv`
- 吧唧（uv: 46 行 x 5 列，非空单元格 43，CSV `extracted/csv/吧唧（uv.csv`
- 吧唧（柯）: 46 行 x 11 列，非空单元格 170，CSV `extracted/csv/吧唧（柯）.csv`
- 亚克力制品: 74 行 x 15 列，非空单元格 351，CSV `extracted/csv/亚克力制品.csv`
- 普通厚亚克力&贝母麻将: 66 行 x 13 列，非空单元格 352，CSV `extracted/csv/普通厚亚克力&贝母麻将.csv`
- durst印亚克力: 51 行 x 10 列，非空单元格 161，CSV `extracted/csv/durst印亚克力.csv`
- 冷烫亚克力: 83 行 x 23 列，非空单元格 366，CSV `extracted/csv/冷烫亚克力.csv`
- 冷烫双闪吧唧（表印）: 48 行 x 10 列，非空单元格 186，CSV `extracted/csv/冷烫双闪吧唧（表印）.csv`
- 贝壳光pet透卡: 50 行 x 16 列，非空单元格 138，CSV `extracted/csv/贝壳光pet透卡.csv`
- 折扇: 23 行 x 10 列，非空单元格 66，CSV `extracted/csv/折扇.csv`
- 鼠标垫: 15 行 x 9 列，非空单元格 30，CSV `extracted/csv/鼠标垫.csv`

## 已打开的二级页面
- 1. 定制须知&售后条款 (doc) - https://docs.qq.com/doc/DQkJIWUVOcGFDb2Rv
  - 本地目录：`extracted/secondary_pages/01_doc_DQkJIWUVOcGFDb2Rv`；图片资产 80 个
- 2. 饼饼发货单号表 (sheet) - https://docs.qq.com/sheet/DSWtOY0h5cEF4Ym5Z?tab=bh0hhn
  - 本地目录：`extracted/secondary_pages/02_sheet_DSWtOY0h5cEF4Ym5Z_bh0hhn`；图片资产 5 个
- 3. 吧唧白墨 (sheet) - https://docs.qq.com/sheet/DSWF4b3dOcUJ2cVVm?tab=fbhqzh
  - 本地目录：`extracted/secondary_pages/03_sheet_DSWF4b3dOcUJ2cVVm_fbhqzh`；图片资产 23 个
- 4. 车况表 (sheet) - https://docs.qq.com/sheet/DQmNic0Vzb3ZKeXZX?tab=BB08J2
  - 本地目录：`extracted/secondary_pages/04_sheet_DQmNic0Vzb3ZKeXZX_BB08J2`；图片资产 3 个
- 5. 闪底图册 (sheet) - https://docs.qq.com/sheet/DSUp3ZEFJR0dLYWhV?tab=BB08J2
  - 本地目录：`extracted/secondary_pages/05_sheet_DSUp3ZEFJR0dLYWhV_BB08J2`；图片资产 16 个
- 6. 吧唧工艺文件规范 (doc) - https://docs.qq.com/doc/DQm5GTWVhTG5jV1BP
  - 本地目录：`extracted/secondary_pages/06_doc_DQm5GTWVhTG5jV1BP`；图片资产 78 个
- 7. 饼饼定制冷烫膜色号 (sheet) - https://docs.qq.com/sheet/DSWFTTktzZXdkUVRj?tab=BB08J2
  - 本地目录：`extracted/secondary_pages/07_sheet_DSWFTTktzZXdkUVRj_BB08J2`；图片资产 20 个
- 8. 云母板常备色号 (sheet) - https://docs.qq.com/sheet/DSWxPUmhPaURLZmRt?tab=BB08J2
  - 本地目录：`extracted/secondary_pages/08_sheet_DSWxPUmhPaURLZmRt_BB08J2`；图片资产 8 个
- 9. 烫色亚克力工艺文件规范 (doc) - https://docs.qq.com/doc/DQk1oc2FWbUNCZmZs
  - 本地目录：`extracted/secondary_pages/09_doc_DQk1oc2FWbUNCZmZs`；图片资产 78 个
- 10. 透卡工艺文件规范 (doc) - https://docs.qq.com/doc/DQkVUU05qZGNxeHdB
  - 本地目录：`extracted/secondary_pages/10_doc_DQkVUU05qZGNxeHdB`；图片资产 78 个

## 系统化建议
- `products/categories`: 来源于 11 个工作表和汇总表跳转关系。
- `price_rules`: 从各 CSV 中抽取尺寸、单双面、数量阶梯、工艺、打样费、交期等字段。
- `process_specs`: 二级文档 OCR 文本和截图，按工艺类型关联到产品。
- `media_assets`: 每张图片保存本地路径、来源页面/单元格、OCR 文本、尺寸和标签。
- `external_refs`: 保存二级页面 URL、标题、页面类型、截图目录，后续可做定时刷新。

## Web 系统部署
- 技术栈：Next.js App Router + NestJS 风格 service 层 + Prisma + Supabase Postgres。
- Vercel Supabase Storage 集成需要提供：`POSTGRES_PRISMA_URL`、`POSTGRES_URL_NON_POOLING`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。
- Vercel 构建命令：`npm run vercel-build`，会先 `prisma generate`，再 `prisma migrate deploy`，最后 `next build`。
- 首次导入报价/素材元数据：部署环境变量可用后运行 `npm run db:seed`。
- 为控制部署体积，Git 只跟踪 `extracted/csv/` 和 `extracted/metadata/`；本地大图、OCR、截图和原始 Excel 保留在工作目录，不进入 Vercel 部署包。

## 注意
- 腾讯文档里不能直接复制的正文已通过截图 OCR 保存；OCR 可能有错字，重要价格/工艺仍建议以 Excel 原始数据和截图交叉校验。
- `image_library.html` 的复制图片功能需要通过本地服务访问；当前服务为 `http://127.0.0.1:8765/`。
