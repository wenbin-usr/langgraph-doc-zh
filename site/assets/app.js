/* LangGraph 中文文档 —— 交互脚本 */
(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "lg-docs-theme";

  /* ------------------------------------------------------------ 主题切换 */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("themeBtn");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (!saved) {
    saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  applyTheme(saved);

  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      document.querySelectorAll(".code-block[data-lang='mermaid']").forEach(function (el) {
        delete el.dataset.rendered;
      });
      renderMermaid();
    });
  }

  /* ------------------------------------------------------------ 移动端导航 */
  var sidebar = document.getElementById("sidebar");
  var backdrop = document.getElementById("backdrop");
  var menuBtn = document.getElementById("menuBtn");

  function closeNav() {
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("show");
    document.body.classList.remove("nav-open");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      backdrop.classList.toggle("show");
      document.body.classList.toggle("nav-open");
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeNav);
  if (sidebar) {
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth <= 900) closeNav();
    });
  }
  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeNav();
  });

  /* ------------------------------------------------------------ 标签页 */
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    // 只取本组的按钮/面板，避免与外层或嵌套标签页互相干扰
    var buttons = group.querySelectorAll(":scope > .tab-list > .tab-btn");
    var panels = group.querySelectorAll(":scope > .tab-panels > .tab-panel");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var target = btn.getAttribute("data-target");
        buttons.forEach(function (b) { b.classList.toggle("active", b === btn); });
        panels.forEach(function (panel) {
          panel.classList.toggle("active", panel.id === target);
        });
      });
    });
  });

  /* 通过 #锚点 直接定位到某个标签面板时，自动切换到该面板 */
  function activateTabFromHash() {
    var hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return;
    var el = document.getElementById(hash);
    if (!el) return;
    var panel = el.closest ? el.closest(".tab-panel") : null;
    if (!panel || panel.classList.contains("active")) return;
    var group = panel.closest("[data-tabs]");
    if (!group) return;
    group.querySelectorAll(".tab-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-target") === panel.id);
    });
    group.querySelectorAll(".tab-panel").forEach(function (p) {
      p.classList.toggle("active", p === panel);
    });
    setTimeout(function () {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 60);
  }
  window.addEventListener("hashchange", activateTabFromHash);
  activateTabFromHash();

  /* ------------------------------------------------------------ 复制代码 */
  document.querySelectorAll(".code-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var block = btn.closest(".code-block");
      var code = block ? block.querySelector("code") : null;
      if (!code) return;
      var text = code.innerText;
      var done = function () {
        btn.textContent = "已复制";
        btn.classList.add("done");
        setTimeout(function () { btn.textContent = "复制"; btn.classList.remove("done"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ------------------------------------------------------------ 阅读进度 */
  var progress = document.getElementById("progress");
  var toTop = document.getElementById("toTop");

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (toTop) toTop.classList.toggle("show", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------ 右侧目录高亮 */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if (tocLinks.length) {
    var map = {};
    tocLinks.forEach(function (a) {
      map[decodeURIComponent(a.getAttribute("href").slice(1))] = a;
    });
    var headings = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var setActive = function (id) {
      tocLinks.forEach(function (a) { a.classList.remove("active"); });
      if (map[id]) map[id].classList.add("active");
    };

    // 初始状态：默认高亮第一条，避免顶部时目录没有任何选中项
    if (tocLinks[0]) tocLinks[0].classList.add("active");

    if ("IntersectionObserver" in window) {
      var visible = {};
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });
        var best = null;
        var bestVal = 0;
        Object.keys(visible).forEach(function (id) {
          if (visible[id] > bestVal) { bestVal = visible[id]; best = id; }
        });
        if (best) setActive(best);
      }, { rootMargin: "-90px 0px -65% 0px", threshold: [0, 0.2, 0.6, 1] });

      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  /* ------------------------------------------------------------ 搜索 */
  var index = window.__SEARCH_INDEX__ || [];
  var overlay = null;
  var input = null;
  var results = null;
  var activeIndex = 0;
  var flat = [];

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.innerHTML =
      '<div class="search-panel" role="dialog" aria-modal="true" aria-label="搜索文档">' +
      '<input class="search-input" id="searchInput" type="search" placeholder="搜索页面、章节或关键词…" autocomplete="off" spellcheck="false">' +
      '<div class="search-results" id="searchResults"></div>' +
      '<div class="search-hint"><span>↑ ↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></div>' +
      "</div>";
    document.body.appendChild(overlay);
    input = overlay.querySelector("#searchInput");
    results = overlay.querySelector("#searchResults");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeSearch();
    });
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (flat[activeIndex]) window.location.href = flat[activeIndex].url;
      } else if (e.key === "Escape") { closeSearch(); }
    });
  }

  function score(text, q) {
    if (!text) return 0;
    var t = text.toLowerCase();
    var idx = t.indexOf(q);
    if (idx === -1) return 0;
    return idx === 0 ? 3 : 1;
  }

  function render(query) {
    var q = (query || "").trim().toLowerCase();
    flat = [];
    if (!q) {
      // 默认展示全部页面
      index.forEach(function (page) {
        flat.push({ url: page.url, title: page.title, path: page.group, snip: "" });
      });
    } else {
      index.forEach(function (page) {
        var ps = score(page.title, q);
        if (ps) {
          flat.push({ url: page.url, title: page.title, path: page.group, snip: "", s: ps + 4 });
        }
        page.sections.forEach(function (sec) {
          var ss = score(sec.h, q);
          var ts = score(sec.t, q);
          if (ss || ts) {
            flat.push({
              url: page.url + "#" + sec.id,
              title: sec.h,
              path: page.title + " · " + page.group,
              snip: highlight(sec.t, q),
              s: (ss ? 3 : 0) + (ts ? 1 : 0),
            });
          }
        });
      });
      flat.sort(function (a, b) { return (b.s || 0) - (a.s || 0); });
    }
    flat = flat.slice(0, 40);
    activeIndex = 0;

    if (!flat.length) {
      results.innerHTML = '<div class="search-empty">没有找到与「' + escapeHtml(query) + '」相关的内容</div>';
      return;
    }
    results.innerHTML = flat
      .map(function (item, i) {
        return (
          '<a class="search-item' + (i === 0 ? " active" : "") + '" href="' + item.url + '">' +
          '<div class="si-title">' + escapeHtml(item.title) + "</div>" +
          '<div class="si-path">' + escapeHtml(item.path || "") + "</div>" +
          (item.snip ? '<div class="si-snip">' + item.snip + "</div>" : "") +
          "</a>"
        );
      })
      .join("");
  }

  function highlight(text, q) {
    var idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return escapeHtml(text.slice(0, 120));
    var start = Math.max(0, idx - 40);
    var raw = (start > 0 ? "…" : "") + text.slice(start, idx + q.length + 80);
    var safe = escapeHtml(raw);
    return safe.replace(new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function move(delta) {
    var items = results.querySelectorAll(".search-item");
    if (!items.length) return;
    items[activeIndex].classList.remove("active");
    activeIndex = (activeIndex + delta + items.length) % items.length;
    items[activeIndex].classList.add("active");
    items[activeIndex].scrollIntoView({ block: "nearest" });
  }

  function openSearch() {
    if (!overlay) buildOverlay();
    overlay.classList.add("open");
    render("");
    setTimeout(function () { input.focus(); input.select(); }, 20);
  }

  function closeSearch() {
    if (overlay) overlay.classList.remove("open");
  }

  var searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.addEventListener("click", openSearch);

  document.addEventListener("keydown", function (e) {
    var mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (overlay && overlay.classList.contains("open")) closeSearch();
      else openSearch();
    }
    if (e.key === "Escape") closeSearch();
    if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });

  /* ------------------------------------------------------------ Mermaid */
  var mermaidLoading = false;

  function renderMermaid() {
    var blocks = document.querySelectorAll('.code-block[data-lang="mermaid"]');
    if (!blocks.length || mermaidLoading) return;
    mermaidLoading = true;
    import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")
      .then(function (mod) {
        var mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: root.getAttribute("data-theme") === "dark" ? "dark" : "neutral",
          fontFamily: "inherit",
          flowchart: { curve: "basis" },
        });
        blocks.forEach(function (block, i) {
          if (block.dataset.rendered === "1") return;
          var codeEl = block.querySelector("code");
          if (!codeEl) return;
          var src = codeEl.textContent;
          mermaid
            .render("mmd-" + i + "-" + Date.now())
            .then(function () {})
            .catch(function () {});
          mermaid.render("m-" + i + "-" + Math.random().toString(36).slice(2), src)
            .then(function (result) {
              var wrap = document.createElement("div");
              wrap.className = "mermaid";
              wrap.innerHTML = result.svg;
              block.parentNode.replaceChild(wrap, block);
            })
            .catch(function () { /* 保留原始代码块作为降级 */ });
        });
      })
      .catch(function () { mermaidLoading = false; });
  }

  renderMermaid();
})();
