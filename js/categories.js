// SELECT ELEMENTS
const categoriesGrid = document.getElementById("categoriesGrid");
const categoriesStatus = document.getElementById("categoriesStatus");

const categoryMealsSection = document.getElementById(
  "categoryMealsSection",
);
const selectedCategoryTitle = document.getElementById(
  "selectedCategoryTitle",
);
const categoryMealsStatus = document.getElementById(
  "categoryMealsStatus",
);
const categoryMealsGrid = document.getElementById("categoryMealsGrid");
const backToCategories = document.getElementById("backToCategories");

// LOAD CATEGORIES
async function loadCategories() {
  categoriesStatus.innerHTML = `
    <div class="recipe-loading">
      <span class="loading-spinner" aria-hidden="true"></span>
      <p>Loading recipes...</p>
    </div>
  `;
  try {
    const data = await getCategories();

    if (!data.categories || data.categories.length === 0) {
      categoriesStatus.textContent = "No categories are available.";
      return;
    }

    categoriesStatus.textContent = "";
    renderCategories(data.categories);
  } catch (error) {
    console.error("Categories loading error:", error);
    categoriesStatus.textContent =
      "Unable to load categories. Please try again.";
  }
}

// DISPLAY CATEGORIES
function renderCategories(categories) {
  categoriesGrid.innerHTML = "";

  categories.forEach((category, index) => {
    const card = document.createElement("article");

    card.className = "category-card";
    card.style.animationDelay = `${Math.min(index, 8) * 50}ms`;

    const image = document.createElement("img");
    image.className = "category-image";
    image.src = category.strCategoryThumb;
    image.alt = category.strCategory;
    image.loading = "lazy";
    image.decoding = "async";

    const content = document.createElement("div");
    content.className = "category-card-content";

    const title = document.createElement("h3");
    title.textContent = category.strCategory;

    const description = document.createElement("p");
    description.textContent =
      category.strCategoryDescription || "Explore delicious recipes.";

    const button = document.createElement("button");
    button.className = "category-explore-btn";
    button.type = "button";
    button.textContent = "Explore Recipes →";

    button.addEventListener("click", () => {
      loadCategoryMeals(category.strCategory);
    });

    content.append(title, description, button);
    card.append(image, content);
    categoriesGrid.appendChild(card);
  });
}

// LOAD RECIPES FOR A CATEGORY
async function loadCategoryMeals(category) {
  categoryMealsSection.hidden = false;

  selectedCategoryTitle.textContent = `${category} Recipes`;
  categoryMealsStatus.innerHTML = `
    <div class="recipe-loading">
      <span class="loading-spinner" aria-hidden="true"></span>
      <p>Loading recipes...</p>
    </div>
  `;
  
  categoryMealsGrid.innerHTML = "";

  categoryMealsSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  try {
    const data = await getMealsByCategory(category);

    if (!data.meals || data.meals.length === 0) {
      categoryMealsStatus.textContent =
        "No recipes were found in this category.";
      return;
    }

    categoryMealsStatus.textContent =
      `${data.meals.length} recipes found`;

    renderCategoryMeals(data.meals);
  } catch (error) {
    console.error("Category recipes loading error:", error);

    categoryMealsStatus.textContent =
      "Unable to load recipes. Please try again.";
  }
}

// DISPLAY CATEGORY RECIPES
function renderCategoryMeals(meals) {
  categoryMealsGrid.innerHTML = "";

  meals.forEach((meal, index) => {
    const card = document.createElement("article");

    card.className = "meal-card";
    card.style.animationDelay = `${Math.min(index, 8) * 50}ms`;

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "meal-image-wrapper";

    const image = document.createElement("img");
    image.className = "meal-image";
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.loading = "lazy";
    image.decoding = "async";

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-btn";
    favoriteButton.type = "button";

    function updateFavoriteButton() {
      const saved = isFavorite(meal.idMeal);

      favoriteButton.textContent = saved ? "♥" : "♡";
      favoriteButton.classList.toggle("is-favorite", saved);
      favoriteButton.setAttribute("aria-pressed", saved);
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

    const footer = document.createElement("div");
    footer.className = "meal-card-footer";

    const mealId = document.createElement("span");
    mealId.className = "meal-area";
    mealId.textContent = `Meal ID: ${meal.idMeal}`;

    const recipeLink = document.createElement("a");
    recipeLink.className = "view-recipe";
    recipeLink.href = `recipe.html?id=${encodeURIComponent(meal.idMeal)}`;
    recipeLink.textContent = "View Recipe →";

    footer.append(mealId, recipeLink);
    content.append(categoryLabel, title, description, footer);
    card.append(imageWrapper, content);

    categoryMealsGrid.appendChild(card);
  });
}

// BACK TO CATEGORIES
backToCategories.addEventListener("click", () => {
  categoryMealsSection.hidden = true;

  categoriesGrid.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// INITIALIZE
loadCategories();