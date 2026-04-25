(function () {
  const PAGE_DEFINITIONS = {
    Peti: { route: "Peti.html", category: "5r" },
    Sesti: { route: "Sesti.html", category: "6r" },
    Sedmi: { route: "Sedmi.html", category: "7r" },
    Osmi: { route: "Osmi.html", category: "8r" },
    HLL: { route: "hll.html", category: "HLL" },
    HLOZ: { route: "HLOZ.html", category: "HLOZ" },
  };

  const PAGE_TITLES = {
    en: {
      Peti: "Fifth Grade",
      Sesti: "Sixth Grade",
      Sedmi: "Seventh Grade",
      Osmi: "Eighth Grade",
      HLL: "HLL",
      HLOZ: "HLOŽ",
    },
    hr: {
      Peti: "Peti razred",
      Sesti: "Šesti razred",
      Sedmi: "Sedmi razred",
      Osmi: "Osmi razred",
      HLL: "HLL",
      HLOZ: "HLOŽ",
    },
  };

  const UI_TRANSLATIONS = {
    en: {
      home: "Home",
      tasks: "Tasks",
      scoreboard: "Scoreboard",
      login: "Login",
      themeDark: "Dark",
      themeLight: "Light",
      pageIntro: "Browse the full hierarchy or jump straight to a task with search.",
      globalIntro: "Search every task across 5th, 6th, 7th, 8th grade, HLL and HLOŽ.",
      searchLabel: "Search tasks",
      searchPlaceholder: "Start typing a task name...",
      searchHint: "Same-name matches are sorted from most popular to least popular.",
      noResults: "No matching tasks yet.",
      years: "Years",
      levels: "Rounds",
      tasksHeading: "Tasks",
      selectedTask: "Selected task",
      chooseTask: "Choose a task to see details and open it for evaluation.",
      openTask: "Open task",
      evaluate: "Evaluate",
      evaluatorMissing: "This task is not in the evaluator yet.",
      points: "Points",
      attempts: "attempts",
      openHierarchy: "Open hierarchy",
      chooseHierarchy: "Choose hierarchy",
      globalSearchTitle: "Task Search",
      categoriesTitle: "Competition Categories",
      openPage: "Open page",
      unavailable: "Unavailable",
    },
    hr: {
      home: "Home",
      tasks: "Zadaci",
      scoreboard: "Ljestvica",
      login: "Prijava",
      themeDark: "Tamno",
      themeLight: "Svijetlo",
      pageIntro: "Pregledaj hijerarhiju ili odmah pronađi zadatak kroz pretragu.",
      globalIntro: "Pretraži sve zadatke za 5., 6., 7., 8. razred, HLL i HLOŽ.",
      searchLabel: "Pretraži zadatke",
      searchPlaceholder: "Počni upisivati naziv zadatka...",
      searchHint: "Zadaci istog imena sortirani su od najpopularnijeg prema manje popularnima.",
      noResults: "Nema odgovarajućih zadataka.",
      years: "Godine",
      levels: "Kola",
      tasksHeading: "Zadaci",
      selectedTask: "Odabrani zadatak",
      chooseTask: "Odaberi zadatak kako bi vidio detalje i otvorio evaluaciju.",
      openTask: "Otvori zadatak",
      evaluate: "Evaluiraj",
      evaluatorMissing: "Ovaj zadatak još nije dodan u evaluator.",
      points: "Bodovi",
      attempts: "pokušaja",
      openHierarchy: "Otvori hijerarhiju",
      chooseHierarchy: "Odaberi hijerarhiju",
      globalSearchTitle: "Pretraga zadataka",
      categoriesTitle: "Kategorije natjecanja",
      openPage: "Otvori stranicu",
      unavailable: "Nedostupno",
    },
  };

  function getLanguage() {
    return localStorage.getItem("lang") || "en";
  }

  function tr(lang, key) {
    return (
      (UI_TRANSLATIONS[lang] && UI_TRANSLATIONS[lang][key]) ||
      (UI_TRANSLATIONS.en && UI_TRANSLATIONS.en[key]) ||
      key
    );
  }

  function pageTitle(pageKey, lang) {
    return (
      (PAGE_TITLES[lang] && PAGE_TITLES[lang][pageKey]) ||
      (PAGE_TITLES.en && PAGE_TITLES.en[pageKey]) ||
      pageKey
    );
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeGroupKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function buildHierarchyLabel(item, includePage, lang) {
    const bits = [];
    if (includePage) {
      bits.push(pageTitle(item.page_key, lang));
    }
    if (item.display_year) {
      bits.push(item.display_year);
    }
    if (item.display_level) {
      bits.push(item.display_level);
    }
    if (typeof item.submission_count === "number") {
      bits.push(`${item.submission_count} ${tr(lang, "attempts")}`);
    }
    return bits.join(" · ");
  }

  function groupSearchResults(items) {
    const grouped = new Map();

    items.forEach((item) => {
      const key = normalizeGroupKey(item.display_task);
      if (!grouped.has(key)) {
        grouped.set(key, {
          title: item.display_task,
          items: [],
        });
      }
      grouped.get(key).items.push(item);
    });

    return Array.from(grouped.values());
  }

  function applyTheme({ body, navbar, themeToggle, themeIcon, themeLabel, loginBtn, langSelect, lang }) {
    let darkMode = localStorage.getItem("theme");
    if (!darkMode) {
      darkMode = "dark";
      localStorage.setItem("theme", darkMode);
    }
    const isDark = darkMode === "dark";

    if (window.clearThemePreloadStyle) {
      window.clearThemePreloadStyle();
    }

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
    body.classList.toggle("bg-gray-900", isDark);
    body.classList.toggle("text-white", isDark);
    body.classList.toggle("bg-gray-50", !isDark);
    body.classList.toggle("text-gray-900", !isDark);
    body.classList.toggle("dark", isDark);
    body.classList.toggle("light", !isDark);

    navbar.classList.toggle("bg-gray-800", isDark);
    navbar.classList.toggle("bg-white", !isDark);

    [themeToggle, loginBtn].forEach((button) => {
      button.classList.toggle("bg-gray-900", isDark);
      button.classList.toggle("text-white", isDark);
      button.classList.toggle("border-gray-600", isDark);
      button.classList.toggle("hover:bg-gray-700", isDark);
      button.classList.toggle("hover:text-gray-200", isDark);

      button.classList.toggle("bg-white", !isDark);
      button.classList.toggle("text-gray-900", !isDark);
      button.classList.toggle("border-gray-300", !isDark);
      button.classList.toggle("hover:bg-gray-100", !isDark);
      button.classList.toggle("hover:text-blue-600", !isDark);
    });

    langSelect.classList.toggle("text-white", isDark);
    langSelect.classList.toggle("text-gray-900", !isDark);
    langSelect.parentElement.classList.toggle("bg-gray-800", isDark);
    langSelect.parentElement.classList.toggle("border-gray-600", isDark);
    langSelect.parentElement.classList.toggle("bg-white", !isDark);
    langSelect.parentElement.classList.toggle("border-gray-300", !isDark);

    themeIcon.setAttribute("data-lucide", isDark ? "sun" : "moon");
    themeLabel.textContent = isDark ? tr(lang, "themeLight") : tr(lang, "themeDark");

    if (window.EvalogotorApi && window.EvalogotorApi.syncNavbarTheme) {
      window.EvalogotorApi.syncNavbarTheme(isDark);
    }
    lucide.createIcons();
  }

  function createHeaderBindings() {
    return {
      body: document.getElementById("body"),
      navbar: document.getElementById("navbar"),
      themeToggle: document.getElementById("themeToggle"),
      themeIcon: document.getElementById("themeIcon"),
      themeLabel: document.getElementById("themeLabel"),
      langSelect: document.getElementById("langSelect"),
      loginBtn: document.getElementById("loginBtn"),
    };
  }

  function setupChrome(options) {
    const elements = createHeaderBindings();
    const lang = getLanguage();

    elements.langSelect.value = lang;

    function refreshChrome() {
      const currentLang = getLanguage();
      const homeLabel = document.getElementById("home");
      const tasksLabel = document.getElementById("tasksNav");
      const scoreboardLabel = document.getElementById("scoreboard");
      if (homeLabel) {
        homeLabel.textContent = tr(currentLang, "home");
      }
      if (tasksLabel) {
        tasksLabel.textContent = tr(currentLang, "tasks");
      }
      if (scoreboardLabel) {
        scoreboardLabel.textContent = tr(currentLang, "scoreboard");
      }
      if (window.EvalogotorApi && window.EvalogotorApi.syncLoginButton) {
        window.EvalogotorApi.syncLoginButton(tr(currentLang, "login"));
      }
      applyTheme({ ...elements, lang: currentLang });
      if (typeof options.onLanguageChanged === "function") {
        options.onLanguageChanged(currentLang);
      }
    }

    elements.themeToggle.addEventListener("click", () => {
      const nextTheme = localStorage.getItem("theme") === "dark" ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      refreshChrome();
    });

    elements.langSelect.addEventListener("change", (event) => {
      localStorage.setItem("lang", event.target.value);
      refreshChrome();
    });

    refreshChrome();
  }

  async function loadTaskInfo(item) {
    if (!item.has_local_task) {
      return {
        max_points: item.max_points || null,
        user_progress: null,
      };
    }

    const params = new URLSearchParams({
      category: item.category,
      year: item.year,
      level: item.level,
      task: item.task,
      _: Date.now().toString(),
    });
    return window.EvalogotorApi.apiRequest(`/api/task_info?${params.toString()}`, {
      cache: "no-store",
    });
  }

  function setSelectedTaskStorage(item, pageKey) {
    localStorage.setItem("kategorija", item.category);
    localStorage.setItem("god", item.year);
    localStorage.setItem("kolo", item.level || "");
    localStorage.setItem("zadatak", item.task);
    localStorage.setItem("taskSourcePage", PAGE_DEFINITIONS[pageKey].route);
  }

  function createSearchResultMarkup(groups, includePage, lang) {
    if (!groups.length) {
      return `<div class="rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500">${escapeHtml(tr(lang, "noResults"))}</div>`;
    }

    return groups
      .map((group, groupIndex) => {
        const options = group.items
          .map((item, itemIndex) => {
            const label = buildHierarchyLabel(item, includePage, lang);
            return `<option value="${groupIndex}:${itemIndex}">${escapeHtml(label)}</option>`;
          })
          .join("");

        return `
          <div class="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
            <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div class="text-lg font-semibold text-gray-900">${escapeHtml(group.title)}</div>
                <div class="text-sm text-gray-500">${escapeHtml(tr(lang, "searchHint"))}</div>
              </div>
              <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                <select class="task-search-select min-w-[280px] rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" data-group-index="${groupIndex}">
                  ${options}
                </select>
                <button class="task-search-open rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" data-group-index="${groupIndex}">
                  ${escapeHtml(tr(lang, "openHierarchy"))}
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function initPageBrowser(config) {
    let lang = getLanguage();
    let payload = null;
    let selectedYear = "";
    let selectedLevel = "";
    let selectedTaskKey = "";
    let renderToken = 0;
    const searchContainer = document.getElementById("taskSearchResults");

    const elements = {
      pageTitle: document.getElementById("pageTitle"),
      pageIntro: document.getElementById("pageIntro"),
      searchLabel: document.getElementById("searchLabel"),
      searchInput: document.getElementById("taskSearch"),
      searchHint: document.getElementById("taskSearchHint"),
      yearsHeading: document.getElementById("yearsHeading"),
      levelsHeading: document.getElementById("levelsHeading"),
      tasksHeading: document.getElementById("tasksHeading"),
      selectedHeading: document.getElementById("selectedHeading"),
      yearButtons: document.getElementById("yearButtons"),
      levelButtons: document.getElementById("levelButtons"),
      taskButtons: document.getElementById("taskButtons"),
      selectedTask: document.getElementById("selectedTask"),
    };

    function selectedTaskIdentity(item) {
      return [item.year, item.level, item.task].join("|");
    }

    function currentYearEntry() {
      return (payload && payload.years.find((entry) => entry.value === selectedYear)) || null;
    }

    function currentLevelEntry() {
      const yearEntry = currentYearEntry();
      if (!yearEntry) {
        return null;
      }
      return yearEntry.levels.find((entry) => entry.value === selectedLevel) || null;
    }

    function currentTaskEntry() {
      const levelEntry = currentLevelEntry();
      if (!levelEntry) {
        return null;
      }
      return levelEntry.tasks.find((item) => selectedTaskIdentity(item) === selectedTaskKey) || null;
    }

    function updateText() {
      lang = getLanguage();
      elements.pageTitle.textContent = pageTitle(config.pageKey, lang);
      elements.pageIntro.textContent = tr(lang, "pageIntro");
      elements.searchLabel.textContent = tr(lang, "searchLabel");
      elements.searchInput.placeholder = tr(lang, "searchPlaceholder");
      elements.searchHint.textContent = tr(lang, "searchHint");
      elements.yearsHeading.textContent = tr(lang, "years");
      elements.levelsHeading.textContent = tr(lang, "levels");
      elements.tasksHeading.textContent = tr(lang, "tasksHeading");
      elements.selectedHeading.textContent = tr(lang, "selectedTask");
      renderAll();
    }

    function renderYears() {
      if (!payload || !payload.years.length) {
        elements.yearButtons.innerHTML = "";
        return;
      }

      elements.yearButtons.innerHTML = payload.years
        .map((entry) => `
          <button class="catalog-chip ${entry.value === selectedYear ? "catalog-chip-active" : ""}" data-year="${escapeHtml(entry.value)}">
            ${escapeHtml(entry.label)}
          </button>
        `)
        .join("");

      elements.yearButtons.querySelectorAll("[data-year]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedYear = button.dataset.year;
          const levels = currentYearEntry() ? currentYearEntry().levels : [];
          selectedLevel = levels[0] ? levels[0].value : "";
          const levelEntry = currentLevelEntry();
          if (levelEntry && levelEntry.tasks.length) {
            selectedTaskKey = selectedTaskIdentity(levelEntry.tasks[0]);
          } else {
            selectedTaskKey = "";
          }
          renderAll();
        });
      });
    }

    function renderLevels() {
      const yearEntry = currentYearEntry();
      if (!yearEntry) {
        elements.levelButtons.innerHTML = "";
        return;
      }

      const levels = yearEntry.levels;
      if (levels.length === 1 && !levels[0].label) {
        selectedLevel = levels[0].value;
        elements.levelButtons.innerHTML = "";
        return;
      }

      if (!selectedLevel && levels[0]) {
        selectedLevel = levels[0].value;
      }

      elements.levelButtons.innerHTML = levels
        .map((entry) => `
          <button class="catalog-chip ${entry.value === selectedLevel ? "catalog-chip-active" : ""}" data-level="${escapeHtml(entry.value)}">
            ${escapeHtml(entry.label || tr(lang, "levels"))}
          </button>
        `)
        .join("");

      elements.levelButtons.querySelectorAll("[data-level]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedLevel = button.dataset.level;
          const levelEntry = currentLevelEntry();
          if (levelEntry && levelEntry.tasks.length) {
            selectedTaskKey = selectedTaskIdentity(levelEntry.tasks[0]);
          } else {
            selectedTaskKey = "";
          }
          renderAll();
        });
      });
    }

    function renderTasks() {
      const levelEntry = currentLevelEntry();
      if (!levelEntry) {
        elements.taskButtons.innerHTML = "";
        return;
      }

      if (!selectedTaskKey && levelEntry.tasks[0]) {
        selectedTaskKey = selectedTaskIdentity(levelEntry.tasks[0]);
      }

      elements.taskButtons.innerHTML = levelEntry.tasks
        .map((item) => `
          <button class="catalog-chip ${selectedTaskIdentity(item) === selectedTaskKey ? "catalog-chip-active" : ""}" data-task-key="${escapeHtml(selectedTaskIdentity(item))}">
            ${escapeHtml(item.display_task)}
          </button>
        `)
        .join("");

      elements.taskButtons.querySelectorAll("[data-task-key]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedTaskKey = button.dataset.taskKey;
          renderAll();
        });
      });
    }

    async function renderSelectedTask() {
      const item = currentTaskEntry();
      if (!item) {
        elements.selectedTask.innerHTML = `
          <div class="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-sm text-gray-500">
            ${escapeHtml(tr(lang, "chooseTask"))}
          </div>
        `;
        return;
      }

      const token = ++renderToken;
      elements.selectedTask.innerHTML = `
        <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
          <div class="mb-3 text-2xl font-bold text-gray-900">${escapeHtml(item.display_task)}</div>
          <div class="mb-6 text-sm text-gray-500">${escapeHtml(buildHierarchyLabel(item, false, lang))}</div>
          <div class="flex flex-wrap gap-3">
            ${
              item.source_url
                ? `<button id="openTaskBtn" class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">${escapeHtml(tr(lang, "openTask"))}</button>`
                : `<button class="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400" disabled>${escapeHtml(tr(lang, "openTask"))}</button>`
            }
            ${
              item.has_local_task
                ? `<button id="evaluateTaskBtn" class="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">${escapeHtml(tr(lang, "evaluate"))}</button>`
                : `<button class="rounded-xl bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600" disabled>${escapeHtml(tr(lang, "unavailable"))}</button>`
            }
          </div>
          <div id="selectedTaskMeta" class="mt-5 text-sm text-gray-600">${escapeHtml(tr(lang, "chooseTask"))}</div>
        </div>
      `;

      if (item.source_url) {
        elements.selectedTask.querySelector("#openTaskBtn").addEventListener("click", () => {
          window.open(item.source_url, "_blank", "noopener,noreferrer");
        });
      }

      if (item.has_local_task) {
        elements.selectedTask.querySelector("#evaluateTaskBtn").addEventListener("click", () => {
          setSelectedTaskStorage(item, config.pageKey);
          window.location.href = "evaluation";
        });
      }

      try {
        const info = await loadTaskInfo(item);
        if (token !== renderToken) {
          return;
        }
        const maxPoints = info && info.max_points != null ? info.max_points : item.max_points;
        const bestPoints = info && info.user_progress ? info.user_progress.best_points : 0;
        if (maxPoints != null) {
          localStorage.setItem("taskPoints", String(maxPoints));
        } else {
          localStorage.removeItem("taskPoints");
        }
        const meta = item.has_local_task
          ? `${tr(lang, "points")}: ${bestPoints} / ${maxPoints != null ? maxPoints : "?"}`
          : tr(lang, "evaluatorMissing");
        const metaEl = document.getElementById("selectedTaskMeta");
        if (metaEl) {
          metaEl.textContent = meta;
        }
      } catch (_error) {
        if (token !== renderToken) {
          return;
        }
        const metaEl = document.getElementById("selectedTaskMeta");
        if (metaEl) {
          metaEl.textContent = item.has_local_task ? `${tr(lang, "points")}: ?` : tr(lang, "evaluatorMissing");
        }
      }
    }

    function renderAll() {
      renderYears();
      renderLevels();
      renderTasks();
      renderSelectedTask();
      lucide.createIcons();
    }

    function selectHierarchy(item) {
      selectedYear = item.year;
      selectedLevel = item.level;
      selectedTaskKey = selectedTaskIdentity(item);
      renderAll();
      elements.selectedTask.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    let searchTimer = null;
    elements.searchInput.addEventListener("input", () => {
      const query = elements.searchInput.value.trim();
      clearTimeout(searchTimer);

      if (query.length < 2) {
        searchContainer.innerHTML = "";
        return;
      }

      searchTimer = setTimeout(async () => {
        const params = new URLSearchParams({
          page_key: config.pageKey,
          q: query,
          limit: "80",
        });
        const response = await window.EvalogotorApi.apiRequest(`/api/catalog/search?${params.toString()}`, {
          cache: "no-store",
        });
        const groups = groupSearchResults(response.items || []);
        searchContainer.innerHTML = createSearchResultMarkup(groups, false, lang);
        searchContainer.querySelectorAll(".task-search-open").forEach((button) => {
          button.addEventListener("click", () => {
            const groupIndex = Number(button.dataset.groupIndex);
            const select = searchContainer.querySelector(`select[data-group-index="${groupIndex}"]`);
            if (!select) {
              return;
            }
            const [resolvedGroupIndex, itemIndex] = select.value.split(":").map(Number);
            const item = groups[resolvedGroupIndex] && groups[resolvedGroupIndex].items[itemIndex];
            if (item) {
              selectHierarchy(item);
            }
          });
        });
      }, 180);
    });

    async function init() {
      payload = await window.EvalogotorApi.apiRequest(`/api/catalog/page/${encodeURIComponent(config.pageKey)}`, {
        cache: "no-store",
      });

      if (payload.years && payload.years.length) {
        selectedYear = payload.years[0].value;
        selectedLevel = payload.years[0].levels[0] ? payload.years[0].levels[0].value : "";
        selectedTaskKey =
          payload.years[0].levels[0] && payload.years[0].levels[0].tasks[0]
            ? selectedTaskIdentity(payload.years[0].levels[0].tasks[0])
            : "";
      }

      const params = new URLSearchParams(window.location.search);
      const requestedYear = params.get("year");
      const requestedLevel = params.get("level");
      const requestedTask = params.get("task");

      if (requestedYear && requestedTask) {
        for (const yearEntry of payload.years || []) {
          for (const levelEntry of yearEntry.levels || []) {
            const match = (levelEntry.tasks || []).find(
              (item) =>
                item.year === requestedYear &&
                item.level === (requestedLevel || item.level) &&
                item.task === requestedTask,
            );
            if (match) {
              selectedYear = match.year;
              selectedLevel = match.level;
              selectedTaskKey = selectedTaskIdentity(match);
            }
          }
        }
      }

      updateText();
    }

    setupChrome({
      onLanguageChanged: updateText,
    });

    init().catch((error) => {
      elements.selectedTask.innerHTML = `
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          ${escapeHtml(String(error && error.message ? error.message : error))}
        </div>
      `;
    });
  }

  function initTasksLanding() {
    let lang = getLanguage();
    const elements = {
      pageTitle: document.getElementById("globalSearchTitle"),
      pageIntro: document.getElementById("globalSearchIntro"),
      searchLabel: document.getElementById("globalSearchLabel"),
      searchInput: document.getElementById("globalTaskSearch"),
      searchHint: document.getElementById("globalSearchHint"),
      searchResults: document.getElementById("globalSearchResults"),
      categoriesTitle: document.getElementById("categoriesTitle"),
      cardsWrap: document.getElementById("categoryCards"),
    };

    function updateLandingText() {
      lang = getLanguage();
      elements.pageTitle.textContent = tr(lang, "globalSearchTitle");
      elements.pageIntro.textContent = tr(lang, "globalIntro");
      elements.searchLabel.textContent = tr(lang, "searchLabel");
      elements.searchInput.placeholder = tr(lang, "searchPlaceholder");
      elements.searchHint.textContent = tr(lang, "searchHint");
      elements.categoriesTitle.textContent = tr(lang, "categoriesTitle");
      renderCards();
    }

    function renderCards() {
      elements.cardsWrap.innerHTML = Object.entries(PAGE_DEFINITIONS)
        .map(([pageKey, definition], index) => {
          const barColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500", "bg-indigo-500"];
          return `
            <a href="${escapeHtml(definition.route)}" class="overflow-hidden rounded-2xl shadow-md transition hover:shadow-lg">
              <div class="bg-white p-6 text-center text-gray-900">
                <h3 class="text-lg font-semibold">${escapeHtml(pageTitle(pageKey, lang))}</h3>
              </div>
              <div class="h-2 ${barColors[index % barColors.length]}"></div>
            </a>
          `;
        })
        .join("");
    }

    let searchTimer = null;
    elements.searchInput.addEventListener("input", () => {
      const query = elements.searchInput.value.trim();
      clearTimeout(searchTimer);

      if (query.length < 2) {
        elements.searchResults.innerHTML = "";
        return;
      }

      searchTimer = setTimeout(async () => {
        const params = new URLSearchParams({
          q: query,
          limit: "120",
        });
        const response = await window.EvalogotorApi.apiRequest(`/api/catalog/search?${params.toString()}`, {
          cache: "no-store",
        });
        const groups = groupSearchResults(response.items || []);
        elements.searchResults.innerHTML = createSearchResultMarkup(groups, true, lang);
        elements.searchResults.querySelectorAll(".task-search-open").forEach((button) => {
          button.addEventListener("click", () => {
            const groupIndex = Number(button.dataset.groupIndex);
            const select = elements.searchResults.querySelector(`select[data-group-index="${groupIndex}"]`);
            if (!select) {
              return;
            }
            const [resolvedGroupIndex, itemIndex] = select.value.split(":").map(Number);
            const item = groups[resolvedGroupIndex] && groups[resolvedGroupIndex].items[itemIndex];
            if (!item) {
              return;
            }
            const params = new URLSearchParams({
              year: item.year,
              level: item.level,
              task: item.task,
            });
            window.location.href = `${item.route}?${params.toString()}`;
          });
        });
      }, 180);
    });

    setupChrome({
      onLanguageChanged: updateLandingText,
    });
    updateLandingText();
  }

  window.TaskBrowser = {
    initPageBrowser,
    initTasksLanding,
  };
})();
