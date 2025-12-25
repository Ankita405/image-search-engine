// ------------------ LOGIN ------------------
const loginBox = document.getElementById('loginBox');
const container = document.querySelector('.container');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Hide main container initially
container.style.display = 'none';

// Auto-login if already saved
window.addEventListener('load', () => {
    if (localStorage.getItem('phone') && localStorage.getItem('password')) {
        loginBox.style.display = 'none';
        container.style.display = 'block';
    }
});

// Login button
loginBtn.addEventListener('click', () => {
    const phone = document.getElementById('phoneInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    if (!phone || !password) return alert('Enter phone and password');
    localStorage.setItem('phone', phone);
    localStorage.setItem('password', password);
    loginBox.style.display = 'none';
    container.style.display = 'block';
});

// Logout button
logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

// ------------------ IMAGE SEARCH ------------------
// ✅ FIXED: API_BASE relative path works both locally and live
const API_BASE = ""; 
const grid = document.getElementById("imageResults");

// Recent searches
const recentSearchesDiv = document.getElementById('recentSearches');
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

function displayRecentSearches() {
    recentSearchesDiv.innerHTML = '';
    recentSearches.slice(-5).reverse().forEach(term => {
        const btn = document.createElement('button');
        btn.textContent = term;
        btn.addEventListener('click', () => {
            document.getElementById('searchInput').value = term;
            searchImage();
        });
        recentSearchesDiv.appendChild(btn);
    });
}

displayRecentSearches();

// Favorites
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
const showFavoritesBtn = document.getElementById('showFavoritesBtn');

showFavoritesBtn.addEventListener('click', () => {
    grid.innerHTML = '';
    if (favorites.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; padding:20px; color:white; text-align:center;">
            No favorite images yet.
        </div>`;
        return;
    }
    favorites.forEach(photo => {
        const img = document.createElement("img");
        img.src = photo.thumb;
        img.alt = photo.alt || "Favorite";
        img.classList.add("photo");
        img.dataset.full = photo.full;
        grid.appendChild(img);
    });
});

async function searchImage() {
    const input = document.getElementById("searchInput");
    const query = input.value.trim();
    if (!query) return alert("Enter a search term!");

    grid.innerHTML = `<div style="grid-column:1/-1; padding:20px; color:white; text-align:center;">
        Searching images for "<strong>${query}</strong>"...
    </div>`;

    try {
        const res = await fetch(`${API_BASE}/api/images?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        grid.innerHTML = "";
        if (!Array.isArray(data) || data.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; padding:20px; color:white; text-align:center;">
                No images found.
            </div>`;
            return;
        }

        // Save recent searches
        if (!recentSearches.includes(query)) {
            recentSearches.push(query);
            if (recentSearches.length > 10) recentSearches.shift();
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
            displayRecentSearches();
        }

        // Display images with favorite button
        data.forEach(photo => {
            const img = document.createElement("img");
            img.src = photo.thumb;
            img.alt = photo.alt || query;
            img.classList.add("photo");
            img.dataset.full = photo.full;

            // Favorite button
            const favBtn = document.createElement("button");
            favBtn.textContent = "♥";
            favBtn.classList.add("favBtn");
            favBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (!favorites.find(f => f.id === photo.id)) {
                    favorites.push(photo);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    alert("Added to favorites!");
                } else {
                    alert("Already in favorites");
                }
            });

            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.appendChild(img);
            wrapper.appendChild(favBtn);
            grid.appendChild(wrapper);
        });

    } catch (err) {
        console.error(err);
        grid.innerHTML = `<div style="grid-column:1/-1; padding:20px; color:white; text-align:center;">
            Error loading images. Make sure backend is running.
        </div>`;
    }
}

// ------------------ PREVIEW & DOWNLOAD ------------------
const previewBox = document.getElementById("previewBox");
const previewImg = document.getElementById("previewImg");
const downloadBtn = document.getElementById("downloadBtn");

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("photo")) return;
    previewImg.src = e.target.dataset.full || e.target.src;
    previewBox.style.display = "flex";
});

document.getElementById("closePreview").addEventListener("click", () => {
    previewBox.style.display = "none";
});

// Download image
downloadBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const url = previewImg.src;
    const filename = url.split("/").pop().split("?")[0];

    try {
        const res = await fetch(url, { mode: "cors" });
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        alert("Download failed. Please try again.");
        console.error(err);
    }
});

// Search on Enter
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement.id === "searchInput") {
        searchImage();
    }
});
