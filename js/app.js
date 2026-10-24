// =========================
// 1. SELECT HTML ELEMENTS
// =========================

const categoryList = document.getElementById("categoryList");
const mealGrid = document.getElementById("mealGrid");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const mealsHeading = document.getElementById("mealsHeading");
const statusMessage = document.getElementById("statusMessage");

// Track the latest meal request
let latestMealRequest = 0;


// =========================
// 2. IMAGE FALLBACK
// =========================

function handleImageError(image) {
  image.removeAttribute("src");
  image.classList.add("image-error");
  image.alt = "Recipe image unavailable";
  image.removeAttribute("loading");
}


// =========================
// 3. LOAD CATEGORIES
// =========================

async function loadCategories() {
  try {
    const data = await getCategories();

    if (!data.categories || data.categories.length === 0) {
      categoryList.textContent = "No categories available.";
      return;
    }

    const fragment = document.createDocumentFragment();

    data.categories.forEach((category) => {
      const button = document.createElement("button");

      button.className = "category-chip";
      button.type = "button";

      const image = document.createElement("img");

      image.src = category.strCategoryThumb;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";

      image.addEventListener("error", () => {
        handleImageError(image);
      });

      const label = document.createElement("span");

      label.textContent = category.strCategory;

      button.append(image, label);

      button.addEventListener("click", () => {
        loadMealsByCategory(category.strCategory);
      });

      fragment.appendChild(button);
    });

    categoryList.replaceChildren(fragment);
  } catch (error) {
    categoryList.textContent =
      "Unable to load categories. Please try again.";

    console.error("Category loading error:", error);
  }
}


// =========================
// 4. LOAD INITIAL MEALS
// =========================

async function loadInitialMeals() {
  const requestId = ++latestMealRequest;

  try {
    const data = await getRandomMeal();

    // Ignore outdated requests
    if (requestId !== latestMealRequest) {
      return;
    }

    if (!data.meals || data.meals.length === 0) {
      throw new Error("No meal data received.");
    }

    renderMeals(data.meals);
  } catch (error) {
    if (requestId !== latestMealRequest) {
      return;
    }

    showError("Unable to load meals. Please try again.");

    console.error("Meal loading error:", error);
  }
}


// =========================
// 5. SEARCH MEALS
// =========================

async function handleSearch(query) {
  const searchTerm = query.trim();

  if (!searchTerm) {
    return;
  }

  const requestId = ++latestMealRequest;

  mealsHeading.textContent = `Search Results: ${searchTerm}`;

  mealGrid.innerHTML = `
    <div class="recipe-loading">
      <span class="loading-spinner" aria-hidden="true"></span>
      <p>Searching for meals...</p>
    </div>
  `;

  statusMessage.textContent = "";

  try {
    const data = await searchMeals(searchTerm);

    // Ignore outdated search results
    if (requestId !== latestMealRequest) {
      return;
    }

    if (!data.meals || data.meals.length === 0) {
      showEmptyState(
        "No meals found",
        `We couldn't find recipes matching "${searchTerm}".`,
      );

      return;
    }

    renderMeals(data.meals);
  } catch (error) {
    if (requestId !== latestMealRequest) {
      return;
    }

    showError(
      "Search failed. Please check your connection and try again.",
    );

    console.error("Search error:", error);
  }
}


// =========================
// 6. LOAD MEALS BY CATEGORY
// =========================

async function loadMealsByCategory(category) {
  const requestId = ++latestMealRequest;

  mealsHeading.textContent = `${category} Recipes`;

  mealGrid.innerHTML = `
    <div class="recipe-loading">
      <span class="loading-spinner" aria-hidden="true"></span>
      <p>Loading ${category} recipes...</p>
    </div>
  `;

  statusMessage.textContent = "";

  try {
    const data = await getMealsByCategory(category);

    // Ignore outdated category results
    if (requestId !== latestMealRequest) {
      return;
    }

    if (!data.meals || data.meals.length === 0) {
      showEmptyState(
        "No meals found",
        `There are currently no recipes available for ${category}.`,
      );

      return;
    }

    renderMeals(data.meals);
  } catch (error) {
    if (requestId !== latestMealRequest) {
      return;
    }

    showError("Unable to load category meals. Please try again.");

    console.error("Category meal error:", error);
  }
}


// =========================
// 7. RENDER MEAL CARDS
// =========================

function renderMeals(meals) {
  const fragment = document.createDocumentFragment();

  meals.forEach((meal, index) => {
    const card = document.createElement("article");

    card.className = "meal-card";
    card.style.animationDelay = `${Math.min(index, 8) * 50}ms`;

    // Image wrapper
    const imageWrapper = document.createElement("div");

    imageWrapper.className = "meal-image-wrapper";

    // Meal image
    const image = document.createElement("img");

    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.loading = "lazy";
    image.decoding = "async";
    

    image.addEventListener("error", () => {
      handleImageError(image);
    });

    // Favorite button
    const favoriteButton = document.createElement("button");

    favoriteButton.type = "button";
    favoriteButton.className = "favorite-btn";

    function updateFavoriteButton() {
      const saved = isFavorite(meal.idMeal);

      favoriteButton.textContent = saved ? "♥" : "♡";

      favoriteButton.classList.toggle("is-favorite", saved);

      favoriteButton.setAttribute("aria-pressed", String(saved));

      favoriteButton.setAttribute(
        "aria-label",
        `${saved ? "Remove" : "Add"} ${meal.strMeal} ${
          saved ? "from" : "to"
        } favorites`,
      );

      favoriteButton.title = saved
        ? "Remove from favorites"
        : "Add to favorites";
    }

    updateFavoriteButton();

    favoriteButton.addEventListener("click", () => {
      toggleFavorite(meal);
      updateFavoriteButton();
    });

    imageWrapper.append(image, favoriteButton);

    // Card content
    const content = document.createElement("div");

    content.className = "meal-card-content";

    const categoryLabel = document.createElement("span");

    categoryLabel.className = "meal-category";
    categoryLabel.textContent = "Recipe";

    const title = document.createElement("h3");

    title.textContent = meal.strMeal;

    const description = document.createElement("p");

    description.className = "meal-card-description";
    description.textContent =
      "Discover how to prepare this delicious meal.";

    // Card footer
    const footer = document.createElement("div");

    footer.className = "meal-card-footer";

    const mealId = document.createElement("span");

    mealId.className = "meal-area";
    mealId.textContent = `Meal ID: ${meal.idMeal}`;

    const recipeLink = document.createElement("a");

    recipeLink.className = "view-recipe";
    recipeLink.href =
      `recipe.html?id=${encodeURIComponent(meal.idMeal)}`;

    recipeLink.textContent = "View Recipe →";

    // Assemble the card
    footer.append(mealId, recipeLink);

    content.append(
      categoryLabel,
      title,
      description,
      footer,
    );

    card.append(imageWrapper, content);

    fragment.appendChild(card);
  });

  // Insert all cards together
  mealGrid.replaceChildren(fragment);
}


// =========================
// 8. EMPTY STATE
// =========================

function showEmptyState(title, message) {
  const container = document.createElement("div");

  container.className = "empty-state";

  const heading = document.createElement("h3");

  heading.textContent = title;

  const description = document.createElement("p");

  description.textContent = message;

  container.append(heading, description);

  mealGrid.replaceChildren(container);
}


// =========================
// 9. ERROR MESSAGE
// =========================

function showError(message) {
  const container = document.createElement("div");

  container.className = "empty-state";

  const heading = document.createElement("h3");

  heading.textContent = "Something went wrong";

  const description = document.createElement("p");

  description.textContent = message;

  container.append(heading, description);

  mealGrid.replaceChildren(container);
}


// =========================
// 10. SEARCH FORM EVENT
// =========================

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  handleSearch(searchInput.value);
});


// =========================
// 11. SUGGESTED SEARCHES
// =========================

const searchTags = document.querySelectorAll(".search-tag");

searchTags.forEach((tag) => {
  tag.addEventListener("click", () => {
    const query = tag.dataset.search;

    searchInput.value = query;

    handleSearch(query);
  });
});


// =========================
// 12. INITIALIZE HOMEPAGE
// =========================

loadCategories();
loadInitialMeals();