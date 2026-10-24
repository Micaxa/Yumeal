// =========================
// 1. API CONFIGURATION
// =========================

const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const apiCache = new Map();
const pendingRequests = new Map();


// =========================
// 2. FETCH AND CACHE DATA
// =========================

async function fetchData(endpoint) {
  const now = Date.now();

  // CHECK MEMORY CACHE
  const memoryCache = apiCache.get(endpoint);

  if (memoryCache && now - memoryCache.timestamp < CACHE_DURATION) {
    return memoryCache.data;
  }

  // CHECK FOR AN EXISTING REQUEST
  if (pendingRequests.has(endpoint)) {
    return pendingRequests.get(endpoint);
  }

  // CHECK PERSISTENT CACHE
  const cacheKey = `mealApiCache_${endpoint}`;

  try {
    const storedData = localStorage.getItem(cacheKey);

    if (storedData) {
      const cached = JSON.parse(storedData);

      if (
        cached.timestamp &&
        now - cached.timestamp < CACHE_DURATION
      ) {
        apiCache.set(endpoint, cached);

        return cached.data;
      }

      // REMOVE EXPIRED CACHE
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.warn("Unable to read API cache:", error);
  }

  // REQUEST DATA FROM THE API
  const request = (async () => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);

    if (!response.ok) {
      throw new Error("Unable to retrieve meal data.");
    }

    const data = await response.json();

    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };

    // SAVE TO MEMORY CACHE
    apiCache.set(endpoint, cacheEntry);

    // SAVE TO PERSISTENT CACHE
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
      // The application still works if storage is unavailable.
      console.warn("Unable to save API cache:", error);
    }

    return data;
  })();

  pendingRequests.set(endpoint, request);

  try {
    return await request;
  } finally {
    pendingRequests.delete(endpoint);
  }
}


// =========================
// 3. API FUNCTIONS
// =========================

async function getCategories() {
  return fetchData("categories.php");
}

async function searchMeals(query) {
  return fetchData(`search.php?s=${encodeURIComponent(query)}`);
}

async function getMealById(id) {
  return fetchData(`lookup.php?i=${encodeURIComponent(id)}`);
}

async function getMealsByCategory(category) {
  return fetchData(`filter.php?c=${encodeURIComponent(category)}`);
}

async function getRandomMeal() {
  return fetchData("random.php");
}