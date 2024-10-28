let items = []; // Array to store items data

// Load the JSON file and initialize items on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    fetch('items.json')
        .then(response => response.json())
        .then(data => {
            items = data; // Store data in the global items array
            applyFilters(); // Apply default sorting and display items
        });
});

// Function to display items on the grid
function displayItems(filteredItems) {
    const itemGrid = document.getElementById("itemGrid");
    itemGrid.innerHTML = ''; // Clear existing items

    filteredItems.forEach(item => {
        const itemCard = document.createElement("div");
        itemCard.className = "item-card";

        itemCard.innerHTML = `
            <div class="item-info">
              <p>${item.rarity} / ${item.level}%</p>
              <p>Energy: ${item.energy}</p>
              <img src="${item.image}" alt="Item Image">
              <p class='item_id'>#${item.id}</p>
            </div>
            <div class="btnPrice">
            <div class="price">${item.price} Legs</div>
            <button>Buy</button>
            </div>
        `;

        itemGrid.appendChild(itemCard);
    });
}

// Function to apply filters and sorting based on user selection
function applyFilters() {
    const typeFilter = document.getElementById("typeFilter").value;
    const priceSort = document.getElementById("priceSort").value;

    let filteredItems = items;

    // Filter items by selected type
    if (typeFilter !== "all") {
        filteredItems = filteredItems.filter(item => item.rarity === typeFilter);
    }

    // Always sort items by "Low to High" by default
    if (priceSort === "highToLow") {
        filteredItems.sort((a, b) => b.price - a.price);
    } else {
        // Default sorting (Low to High)
        filteredItems.sort((a, b) => a.price - b.price);
    }

    // Display the filtered and sorted items
    displayItems(filteredItems);
}
