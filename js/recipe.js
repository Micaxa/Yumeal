// =========================
// 1. SELECT HTML ELEMENTS
// =========================

const recipeLoading = document.getElementById("recipeLoading");
const recipeContent = document.getElementById("recipeContent");
const recipeError = document.getElementById("recipeError");

const recipeTitle = document.getElementById("recipeTitle");
const recipeImage = document.getElementById("recipeImage");

const recipeCategory = document.getElementById("recipeCategory");
const recipeArea = document.getElementById("recipeArea");

const breadcrumbMeal = document.getElementById("breadcrumbMeal");
const recipeIntro = document.getElementById("recipeIntro");

const ingredientList = document.getElementById("ingredientList");
const ingredientCount = document.getElementById("ingredientCount");

const instructionList = document.getElementById("instructionList");

const recipeVideo = document.getElementById("recipeVideo");
const recipeSource = document.getElementById("recipeSource");
const favoriteRecipeBtn = document.getElementById("favoriteRecipeBtn");

// =========================
// 2. GET MEAL ID FROM URL
// =========================

const urlParams = new URLSearchParams(window.location.search);
const mealId = urlParams.get("id");


// =========================
// 3. LOAD RECIPE
// =========================

async function loadRecipe() {
  if (!mealId || !/^\d+$/.test(mealId)) {
    showRecipeError();
    return;
  }

  try {
    const data = await getMealById(mealId);

    if (!data.meals || data.meals.length === 0) {
      showRecipeError();
      return;
    }

    const meal = data.meals[0];

    renderRecipe(meal);
  } catch (error) {
    console.error("Recipe loading error:", error);

    showRecipeError();
  }
}


// =========================
// 4. RENDER RECIPE DETAILS
// =========================

function renderRecipe(meal) {
  document.title = `${meal.strMeal} | Yumeal`;

  recipeTitle.textContent = meal.strMeal;
  breadcrumbMeal.textContent = meal.strMeal;

  recipeImage.src = meal.strMealThumb;
  recipeImage.alt = meal.strMeal;

  recipeCategory.textContent = meal.strCategory || "Meal";
  recipeArea.textContent = meal.strArea || "International";

  recipeIntro.textContent =
    `Discover how to prepare ${meal.strMeal}, ` +
    "with ingredients and step-by-step cooking instructions.";

  renderIngredients(meal);
  renderInstructions(meal.strInstructions);

  setupRecipeLinks(meal);
  setupFavoriteButton(meal);
  recipeLoading.hidden = true;
  recipeContent.hidden = false;
}


// =========================
// 5. RENDER INGREDIENTS
// =========================

function renderIngredients(meal) {
  ingredientList.innerHTML = "";

  let count = 0;

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const measure = meal[`strMeasure${i}`]?.trim();

    if (!ingredient) {
      continue;
    }

    count++;

    const item = document.createElement("li");

    item.className = "ingredient-item";

    item.innerHTML = `
      <input
        type="checkbox"
        class="ingredient-checkbox"
        id="ingredient-${i}"
      >

      <label class="ingredient-text" for="ingredient-${i}">
        <span class="ingredient-name"></span>
        <span class="ingredient-measure"></span>
      </label>
    `;

    item.querySelector(".ingredient-name").textContent = ingredient;

    item.querySelector(".ingredient-measure").textContent =
      measure || "As needed";

    ingredientList.appendChild(item);
  }

  ingredientCount.textContent =
    `${count} ingredient${count === 1 ? "" : "s"}`;
}


// =========================
// 6. RENDER INSTRUCTIONS
// =========================

function renderInstructions(instructions) {
  instructionList.innerHTML = "";

  const steps = instructions
    ? instructions
        .replace(/\r\n/g, "\n")
        .split(/\n+|(?<=[.!?])\s+(?=[A-Z])/)
        .map((step) => step.trim())
        .filter(Boolean)
    : [];

  if (steps.length === 0) {
    instructionList.textContent =
      "No cooking instructions are available for this recipe.";

    return;
  }

  steps.forEach((step, index) => {
    const article = document.createElement("article");

    article.className = "instruction-step";

    article.innerHTML = `
      <div class="step-number">${index + 1}</div>

      <div class="step-content">
        <h3>Step ${index + 1}</h3>
        <p></p>
      </div>
    `;

    article.querySelector("p").textContent = step;

    instructionList.appendChild(article);
  });
}


// =========================
// 7. RECIPE LINKS
// =========================

function setupRecipeLinks(meal) {
  if (meal.strYoutube) {
    recipeVideo.href = meal.strYoutube;
    recipeVideo.hidden = false;
  } else {
    recipeVideo.hidden = true;
  }

  if (meal.strSource) {
    recipeSource.href = meal.strSource;
    recipeSource.hidden = false;
  } else {
    recipeSource.hidden = true;
  }
}


// =========================
// 8. ERROR STATE
// =========================

function showRecipeError() {
  recipeLoading.hidden = true;
  recipeContent.hidden = true;
  recipeError.hidden = false;
}

// FAVORITE BUTTON
function setupFavoriteButton(meal) {
  function updateButton() {
    const saved = isFavorite(meal.idMeal);

    favoriteRecipeBtn.textContent = saved ? "♥" : "♡";

    favoriteRecipeBtn.classList.toggle("is-favorite", saved);

    favoriteRecipeBtn.setAttribute("aria-pressed", saved);

    favoriteRecipeBtn.setAttribute(
      "aria-label",
      saved ? "Remove from favorites" : "Add to favorites",
    );

    favoriteRecipeBtn.title = saved
      ? "Remove from favorites"
      : "Add to favorites";
  }

  updateButton();

  favoriteRecipeBtn.addEventListener("click", () => {
    toggleFavorite(meal);
    updateButton();
  });
}

// =========================
// 9. INITIALIZE PAGE
// =========================

loadRecipe();