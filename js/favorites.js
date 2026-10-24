// GET SAVED FAVORITES
function getFavorites() {
  return JSON.parse(localStorage.getItem("mealFavorites")) || [];
}

// CHECK IF A MEAL IS FAVORITED
function isFavorite(mealId) {
  const favorites = getFavorites();

  return favorites.some((meal) => meal.idMeal === String(mealId));
}

// ADD OR REMOVE A FAVORITE
function toggleFavorite(meal) {
  let favorites = getFavorites();

  if (isFavorite(meal.idMeal)) {
    favorites = favorites.filter(
      (favorite) => favorite.idMeal !== String(meal.idMeal),
    );
  } else {
    favorites.push({
      idMeal: String(meal.idMeal),
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
    });
  }

  localStorage.setItem("mealFavorites", JSON.stringify(favorites));

  return isFavorite(meal.idMeal);
}

// SELECT ELEMENTS
const favoritesGrid = document.getElementById("favoritesGrid");
const favoritesStatus = document.getElementById("favoritesStatus");

// DISPLAY SAVED FAVORITES
// DISPLAY SAVED FAVORITES
function renderFavorites() {
  if (!favoritesGrid || !favoritesStatus) return;

  // SHOW LOADER
  const loader = document.createElement("div");

  loader.className = "recipe-loading";

  loader.innerHTML = `
    <span class="loading-spinner" aria-hidden="true"></span>
    <p>Loading your favorites...</p>
  `;

  favoritesGrid.replaceChildren(loader);
  favoritesStatus.textContent = "";

  // READ SAVED FAVORITES
  const favorites = getFavorites();

  // EMPTY STATE
  if (favorites.length === 0) {
    favoritesStatus.textContent = "You haven't saved any recipes yet.";

    favoritesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">♡</div>

        <h3>No favorite recipes yet</h3>

        <p>
          Explore delicious meals and save the ones you'd love to try.
        </p>

        <a href="index.html" class="view-recipe">
          Explore Recipes →
        </a>
      </div>
    `;

    return;
  }

  favoritesStatus.textContent =
    `${favorites.length} saved recipe${favorites.length === 1 ? "" : "s"}`;

  // CREATE MEAL CARDS
  const fragment = document.createDocumentFragment();

  favorites.forEach((meal, index) => {
    const card = document.createElement("article");

    card.className = "meal-card";
    card.style.animationDelay = `${Math.min(index, 8) * 50}ms`;

    // IMAGE WRAPPER
    const imageWrapper = document.createElement("div");

    imageWrapper.className = "meal-image-wrapper";

    // MEAL IMAGE
    const image = document.createElement("img");

    image.className = "meal-image";
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 300;
    image.height = 200;

    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.classList.add("image-error");
      image.alt = "Recipe image unavailable";
    });

    // FAVORITE BUTTON
    const favoriteButton = document.createElement("button");

    favoriteButton.className = "favorite-btn is-favorite";
    favoriteButton.type = "button";
    favoriteButton.textContent = "♥";
    favoriteButton.setAttribute(
      "aria-label",
      `Remove ${meal.strMeal} from favorites`,
    );
    favoriteButton.setAttribute("aria-pressed", "true");
    favoriteButton.title = "Remove from favorites";

    favoriteButton.addEventListener("click", () => {
      toggleFavorite(meal);
      renderFavorites();
    });

    imageWrapper.append(image, favoriteButton);

    // CARD CONTENT
    const content = document.createElement("div");

    content.className = "meal-card-content";

    const categoryLabel = document.createElement("span");

    categoryLabel.className = "meal-category";
    categoryLabel.textContent = "Recipe";

    const title = document.createElement("h3");

    title.className = "favorite-meal-title";
    title.textContent = meal.strMeal;

    const description = document.createElement("p");

    description.className = "meal-card-description";
    description.textContent =
      "Discover how to prepare this delicious meal.";

    // CARD FOOTER
    const footer = document.createElement("div");

    footer.className = "meal-card-footer";

    const savedLabel = document.createElement("span");

    savedLabel.className = "meal-area";
    savedLabel.textContent = "Saved Recipe";

    const recipeLink = document.createElement("a");

    recipeLink.className = "view-recipe";
    recipeLink.href =
      `recipe.html?id=${encodeURIComponent(meal.idMeal)}`;
    recipeLink.textContent = "View Recipe →";

    footer.append(savedLabel, recipeLink);

    content.append(
      categoryLabel,
      title,
      description,
      footer,
    );

    card.append(imageWrapper, content);

    fragment.appendChild(card);
  });

  // DISPLAY ALL FAVORITES
  favoritesGrid.replaceChildren(fragment);
}

// INITIALIZE FAVORITES PAGE
renderFavorites();