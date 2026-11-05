# LangGraph 中文文档

LangGraph 官方文档（<https://docs.langchain.com/oss/python/langgraph/overview>）的完整简体中文翻译，
共 **45 个页签**，输出为可直接双击打开的静态 HTML 站点。

## 快速开始

```bash
open site/index.html          # macOS
# 或在项目根目录起一个本地服务（搜索、锚点体验更好）
python3 -m http.server 8000 --directory site
```

打开 `site/index.html` 是站点首页，左侧导航与官方文档的页签一一对应。

## 目录结构

```
site/                  生成好的中文文档站点（交付物）
  index.html           首页：章节导览 + 全部页面
  overview.html        每个页签对应一个 HTML
  assets/style.css     主题样式（模仿官方 Mintlify 外观，含深色模式）
  assets/app.js        交互：标签页、代码复制、目录高亮、⌘K 搜索、阅读进度
  assets/search-index.js  全文搜索索引（内联 JS，file:// 下也能用）
en/                    抓取到的英文原文（.md，来自官方 .md 导出）
chunks/                按 H2 切分后的翻译分块
zh_chunks/             逐块中文译文
zh/                    合并后的整页中文 Markdown
tools/                 构建与校验脚本
```

## 重建

```bash
python3 tools/chunk.py      # 英文原文 -> chunks/
python3 tools/assemble.py   # zh_chunks/ -> zh/
python3 tools/build.py      # zh/ + 模板 -> site/
python3 tools/verify.py     # 校验代码块/链接/结构是否被翻译破坏
python3 tools/qa.py         # 校验站内链接、锚点、页面完整性
```

## 功能特性

- **页面覆盖**：概览、快速开始、核心能力（持久化/检查点/流式输出/中断/时间旅行/记忆/子图）、
  模式与案例、Graph API 全系列、Functional API 全系列、部署、前端、进阶运行时。
- **样式与官方一致**：左侧分组导航 + 正文 + 右侧本页目录，深蓝主色与青柠强调色取自官方站点；
  代码块使用 Catppuccin Mocha 配色（与官方相同的主题族）。
- **增强样式**：卡片网格、彩色提示框、可折叠面板、标签页、表格悬浮、阅读进度条、
  平滑的目录高亮、移动端抽屉导航、深色模式（跟随系统并可手动切换）。
- **搜索**：`⌘K` / `Ctrl+K` / `/` 唤出，检索全部页面标题、二级/三级标题与正文摘要。
- **代码**：服务端 Pygments 高亮，代码块带语言标签与一键复制。
- **图片**：沿用官方 CDN 原图链接嵌入，不复制到本地。
- **Mermaid**：图表示例在联网时渲染为 SVG，离线时自动降级为原始代码块。

## 翻译约定

- 只翻译自然语言，代码块、命令、URL、图片地址保持原样。
- 术语表：agent→智能体，graph→图，node→节点，edge→边，state→状态，checkpoint→检查点，
  thread→线程，store→存储，entrypoint→入口点，task→任务，interrupt→中断，
  streaming→流式输出，subgraph→子图，persistence→持久化，human-in-the-loop→人在回路，
  time travel→时间旅行，durable execution→持久执行，workflow→工作流。
- 产品名 LangGraph / LangChain / LangSmith / Deep Agents / Studio / Python / TypeScript 保留英文。

## 页面范围

左侧导航的 9 个分组对应官方 LangGraph 文档的页签结构。此外官方站点还收录了
`case-studies`、`agentic-rag`、`sql-agent` 三篇不在侧栏出现的实践页面，本站一并翻译，
放在「案例与实践」分组中。

## 已知偏差

- 原文中 `#pending-writes`、`#async`、`#configuration-file-concepts` 三个锚点在官方文档里也没有对应标题，
  本站为它们添加了隐藏别名锚点，指向语义最接近的小节，点击可正常跳转。
- 站内 HTML 之间的互相跳转已改写为本地链接；指向其他 LangChain 文档（LangChain、LangSmith 等）
  的链接保留官方地址，因此需要联网访问。
