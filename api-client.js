(function (global) {
  const API_BASE_STORAGE_KEY = "apiBaseUrl";
  const AUTH_SESSION_KEY = "evalogotorAuthSession";

  function normalizeBaseUrl(url) {
    return (url || "").trim().replace(/\/+$/, "");
  }

  function persistApiBaseOverride() {
    try {
      const params = new URLSearchParams(window.location.search);
      const override = normalizeBaseUrl(params.get("api") || "");
      if (override) {
        localStorage.setItem(API_BASE_STORAGE_KEY, override);
      }
    } catch (error) {
      // Ignore storage/query parsing issues and fall back to runtime detection.
    }
  }

  persistApiBaseOverride();

  function getApiBaseCandidates() {
    const params = new URLSearchParams(window.location.search);
    const override = normalizeBaseUrl(
      params.get("api") || localStorage.getItem(API_BASE_STORAGE_KEY) || ""
    );

    const candidates = [];
    const addCandidate = (value) => {
      const normalized = normalizeBaseUrl(value);
      if (!normalized || candidates.includes(normalized)) return;
      candidates.push(normalized);
    };

    const isLocalFrontend =
      window.location.protocol === "file:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const isFlaskServedFrontend =
      !isLocalFrontend &&
      (window.location.pathname === "/frontend" ||
        window.location.pathname === "/frontend/" ||
        window.location.pathname.startsWith("/frontend/"));

    addCandidate(override);

    if (isFlaskServedFrontend) {
      addCandidate(window.location.origin);
    }

    if (isLocalFrontend) {
      addCandidate("http://127.0.0.1:5000");
      addCandidate("http://localhost:5000");
    }

    return candidates;
  }

  async function fetchFromBackend(path, options = {}) {
    const candidates = getApiBaseCandidates();
    let lastError = null;

    for (const baseUrl of candidates) {
      const url = `${baseUrl}${path}`;
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }

        const body = await response.text();
        lastError = new Error(`HTTP ${response.status} from ${url}: ${body || response.statusText}`);
      } catch (error) {
        lastError = new Error(`${error.message} (${url})`);
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error(
      "No backend URL configured. Set localStorage.apiBaseUrl or pass ?api=https://your-cloudflared-url."
    );
  }

  function getAuthSession() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function setAuthSession(payload) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
  }

  function clearAuthSession() {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  function getCurrentUser() {
    const session = getAuthSession();
    return session && session.user ? session.user : null;
  }

  function getFriendlyErrorMessage(error) {
    const raw = error && error.message ? String(error.message) : "Request failed";
    const jsonStart = raw.indexOf("{");

    if (jsonStart !== -1) {
      const possibleJson = raw.slice(jsonStart);
      try {
        const parsed = JSON.parse(possibleJson);
        if (parsed && typeof parsed === "object") {
          return parsed.error || parsed.message || raw;
        }
      } catch (parseError) {
        // Fall through to prefix stripping below.
      }
    }

    const httpPrefix = raw.match(/^HTTP \d+ from .*?:\s*(.+)$/);
    if (httpPrefix && httpPrefix[1]) {
      return httpPrefix[1];
    }

    return raw;
  }

  async function apiRequest(path, config = {}) {
    const {
      method = "GET",
      body,
      auth = true,
      headers = {},
    } = config;

    const finalHeaders = { ...headers };
    if (body !== undefined && !finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }

    if (auth) {
      const session = getAuthSession();
      if (session && session.token && !finalHeaders["Authorization"]) {
        finalHeaders["Authorization"] = `Bearer ${session.token}`;
      }
    }

    const response = await fetchFromBackend(path, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  }

  function formatDateTime(isoString) {
    try {
      return new Date(isoString).toLocaleString();
    } catch (error) {
      return isoString;
    }
  }

  global.EvalogotorApi = {
    AUTH_SESSION_KEY,
    API_BASE_STORAGE_KEY,
    fetchFromBackend,
    apiRequest,
    getAuthSession,
    getCurrentUser,
    setAuthSession,
    clearAuthSession,
    getFriendlyErrorMessage,
    formatDateTime,
  };
})(window);
