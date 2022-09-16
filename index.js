
let instructionsOriginal = ""
let instructionsLocal = ""
let instructionsCopy = ""
let switched = true
let getOriginal = true
let localMeals = []
const searchField = document.getElementById("search-field")
const searchFieldBtn = document.getElementById("search-field-btn")

document.querySelectorAll(".btn").forEach(btn => btn.addEventListener("mouseup", () => btn.blur()))
document.getElementById("food-categories-btn").addEventListener("click", getCategories)
document.getElementById("random-recipe-btn").addEventListener("click", getRandomMeal)
document.getElementById("filter-by-letter-btn").addEventListener("click", () => {
    getLetters()
    filterByLetter()
})

searchFieldBtn.addEventListener("click", () => {
    searchMeal(searchField.value)
})

if(localStorage.getItem("editedMeals")) {
    localMeals = JSON.parse(localStorage.getItem("editedMeals"))
} else {
    localMeals = []
}

async function getCategories() {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
    const data = await response.json()

    document.querySelector(".slogan").style.marginBottom = 0
    document.body.style.backgroundImage = "url('images/img8.jpg')"

    document.querySelector(".meal-btn-container").innerHTML = ""
    document.getElementById("letters-container").innerHTML = ""
    document.querySelector(".meal-container").innerHTML = ""

    for (const category of data.categories) {
        const categoryBtn = document.createElement("button")
        categoryBtn.innerHTML = `<img src=${category.strCategoryThumb}><div class="meal-btn-title">${category.strCategory}</div>`
        categoryBtn.classList.add("category-btn")
        categoryBtn.addEventListener("click", () => filterByCategory(category.strCategory))
        document.querySelector(".meal-btn-container").append(categoryBtn)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function filterByCategory(foodCategory) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${foodCategory}`)
    const data = await response.json()

    document.querySelector(".meal-btn-container").innerHTML = ""
    document.getElementById("letters-container").innerHTML = ""
    document.querySelector(".meal-container").innerHTML = ""

    for (const recipe of data.meals) {
        const recipeBtn = document.createElement("button")
        recipeBtn.innerHTML = `<img src=${recipe.strMealThumb}><div class="meal-btn-title">${recipe.strMeal}</div>`
        recipeBtn.classList.add("meal-btn")
        recipeBtn.addEventListener("click", () => getMeal(recipe.strMeal))
        document.querySelector(".meal-btn-container").append(recipeBtn)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function getMeal(searchTerm) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`)
    const data = await response.json()
    getMealHtml(data)
}

async function getRandomMeal() {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
    const data = await response.json()
    getMealHtml(data)
}

function getMealHtml(data) {
    document.querySelector(".slogan").style.marginBottom = 0
    document.querySelector(".meal-btn-container").innerHTML = ""
    document.getElementById("letters-container").innerHTML = ""

    const foodArray = data.meals[0]

    let mealInstructions = foodArray.strInstructions
    mealInstructions = mealInstructions.replace(/(?:\r\n|\r|\n)/g, '<br/>')
    
    document.querySelector(".meal-container").innerHTML = `
    <div class="meal-recipe" id="${foodArray.strMeal}">
        <div class="title-container">
            <h2 class="food-name-title">
                ${foodArray.strMeal}
            </h2>
        </div>
        <div class="food-image">
            <img src="${foodArray.strMealThumb}">
        </div>
        <div class="extra-info">
            <p class="nationality">Nationality: ${foodArray.strArea}</p>
            <p class="yt-link">YouTube link: <a href="${foodArray.strYoutube}" target="_blank">click here</a></p>
        </div>       
        <div class="ingredients">
            <h3>Ingredients:</h3>
            <ul class="ingredients-list"></ul>
        </div>
        <div class="instructions-container">
            <h3>Instructions:</h3>
            <button class="instructions-edit-btn instructions-btn">Edit instructions</button>
            <button class="instructions-cancel-btn instructions-btn">Cancel</button>
            <button class="instructions-save-btn instructions-btn">Save instructions</button>
            <button class="instructions-switch-btn instructions-btn">Switch between original/edited instructions</button>
            <div class="instructions" id="${foodArray.strMeal}">${mealInstructions}</div>
        </div>
    </div>`

    document.querySelector(".instructions-edit-btn").addEventListener("click", () => {editInstructions()})
    document.querySelector(".instructions-cancel-btn").addEventListener("click", () => {cancelEdit(foodArray.strMeal)})
    document.querySelector(".instructions-save-btn").addEventListener("click", () => {saveInstructions(foodArray.strMeal)})
    document.querySelector(".instructions-switch-btn").addEventListener("click", () => {switchInstructions(foodArray.strMeal)})
    document.querySelector(".instructions-switch-btn").addEventListener("mouseup", () => document.querySelector(".instructions-switch-btn").blur())

    instructionsOriginal = mealInstructions
    switched = false

    if(localMeals.length > 0) {
        for(const meal of localMeals) {
            if(meal.name === foodArray.strMeal) {
                document.querySelector(".instructions-switch-btn").style.display = "inline-block"
            }
        }
    }

    if(!foodArray.strYoutube || foodArray.strYoutube === "" || foodArray.strYoutube === " ") {
        document.querySelector(".yt-link").innerHTML = "YouTube link: not available"
    }

    const measuresArr = []

    for(const measure in foodArray) {
        if(measure.slice(0, 10) === "strMeasure" && foodArray[measure] && foodArray[measure] != "" && foodArray[measure] != " ") {
            measuresArr.push(foodArray[measure])
        }
    }

    const ingredientsArr = []

    for(const ingredient in foodArray) {
        if(ingredient.slice(0, 13) === "strIngredient" && foodArray[ingredient] && foodArray[ingredient] != "" && foodArray[ingredient] != " ") {
            ingredientsArr.push(foodArray[ingredient])
        }
    }

    for(let i=0; i<measuresArr.length; i++) {
        const ingredientInfo = document.createElement("li")
        ingredientInfo.innerHTML = `${measuresArr[i]} <span class="accent">${ingredientsArr[i]}</span>`
        document.querySelector(".ingredients-list").append(ingredientInfo)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function searchMeal(searchTerm) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`)
    const data = await response.json()

    document.querySelector(".slogan").style.marginBottom = 0

    document.querySelector(".meal-btn-container").innerHTML = ""
    document.getElementById("letters-container").innerHTML = ""
    document.querySelector(".meal-container").innerHTML = ""

    if(data.meals) {
        for (const recipe of data.meals) {
            const recipeBtn = document.createElement("button")
            recipeBtn.innerHTML = `<img src=${recipe.strMealThumb}><div class="meal-btn-title">${recipe.strMeal}</div>`
            recipeBtn.classList.add("meal-btn")
            recipeBtn.addEventListener("click", () => getMeal(recipe.strMeal))
            document.querySelector(".meal-btn-container").append(recipeBtn)
        }
    } else {
        document.querySelector(".meal-btn-container").innerHTML = `<p class="notFoundmsg">No recipes found. Try another word</p>`
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function getLetters() {
    const alpha = Array.from(Array(26)).map((e, i) => i + 65)
    const alphabet = alpha.map((x) => String.fromCharCode(x))
    document.getElementById("letters-container").innerHTML = ""
    for(const letter of alphabet) {
        const letterBtn = document.createElement("button")
        letterBtn.textContent = letter
        letterBtn.classList.add("btn", "letterBtn")
        letterBtn.addEventListener("click", () => {
            filterByLetter(letter)
        })
        document.getElementById("letters-container").append(letterBtn)
    }
    document.querySelector(".slogan").style.marginBottom = 0
}

async function filterByLetter(letter = "a") {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`)
    const data = await response.json()

    document.querySelector(".meal-btn-container").innerHTML = ""
    document.querySelector(".meal-container").innerHTML = ""

    if(data.meals) {
    for(const meal of data.meals) {
        const mealBtn = document.createElement("button")
        mealBtn.innerHTML = `<img src=${meal.strMealThumb}><div class="meal-btn-title">${meal.strMeal}</div>`
        mealBtn.addEventListener("click", () => getMeal(meal.strMeal))
        mealBtn.classList.add("meal-btn")
        document.querySelector(".meal-btn-container").append(mealBtn)
    }
    } else {
        document.querySelector(".meal-btn-container").innerHTML = `<p class="notFoundMsg">No recipes found for this letter</p>`
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function editInstructions() {
    instructionsCopy = document.querySelector(".instructions").innerHTML
    instructionsCopy = instructionsCopy.replace(/<br>/g, '\n')
    document.querySelector(".instructions").innerHTML = `
    <textarea name="instructions-input" class="instructions-input" ></textarea>`
    document.querySelector(".instructions-input").value = instructionsCopy
    document.querySelector(".instructions-cancel-btn").style.display = "inline-block"
    document.querySelector(".instructions-save-btn").style.display = "inline-block"
    document.querySelector(".instructions-edit-btn").style.display = "none"
    document.querySelector(".instructions-switch-btn").style.display = "none"  
}

function saveInstructions(mealName) {
    instructionsCopy = document.querySelector('.instructions-input').value
    instructionsCopy = instructionsCopy.replace(/\n/g, '<br>')
    document.querySelector(".instructions").innerHTML = instructionsCopy
    document.querySelector(".instructions-cancel-btn").style.display = "none"
    document.querySelector(".instructions-save-btn").style.display = "none"
    document.querySelector(".instructions-edit-btn").style.display = "inline-block"

    let localMeal = {
        name: `${mealName}`,
        instructions: `${instructionsCopy}`
    }

    if(localMeals.length > 0) {
        let wasModified = false
        for(let i=0; i<localMeals.length; i++) {
            if(localMeals[i].name === mealName) {
                localMeals[i] = localMeal
                wasModified = true
            } 
        }
        if(!wasModified) {
            localMeals.push(localMeal)
        }
    } else {
        localMeals.push(localMeal)
    }

    console.log(localMeals)

    localStorage.setItem(`editedMeals`, JSON.stringify( localMeals))
    document.querySelector(".instructions-switch-btn").style.display = "inline-block" //sa caut inainte cand afisez mealul si daca e salvat deja sa il fac sa apara de atunci
    switched = true
}

function switchInstructions(mealName) {
    for(let i=0; i<localMeals.length; i++) {
        if(localMeals[i].name === mealName) {
            instructionsLocal = localMeals[i].instructions
        }
    }

    if(switched) {
        document.querySelector(".instructions").innerHTML = instructionsOriginal
        switched = false
    } else {
        document.querySelector(".instructions").innerHTML = instructionsLocal
        switched = true
    }

}

function cancelEdit(foodName) {
    document.querySelector(".instructions-save-btn").style.display = "none"
    instructionsCopy = instructionsCopy.replace(/\n/g, '<br>')
    document.querySelector(".instructions").innerHTML = instructionsCopy
    document.querySelector(".instructions-cancel-btn").style.display = "none"
    document.querySelector(".instructions-edit-btn").style.display = "inline-block"
    for(const meal of localMeals) {
        if(meal.name === foodName) {
            document.querySelector(".instructions-switch-btn").style.display = "inline-block"
        }
    }
}