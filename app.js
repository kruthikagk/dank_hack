const loginPage = document.getElementById('login-page');
const homePage = document.getElementById('home-page');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

// 1. CHECK STATUS ON LOAD
window.onload = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        showHome();
    } else {
        showLogin();
    }
};

// 2. LOGIN ACTION
loginBtn.addEventListener('click', () => {
    // Save to localStorage so it persists after refresh
    localStorage.setItem('isLoggedIn', 'true');
    showHome();
});

// 3. LOGOUT ACTION
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    showLogin();
});

// Helper functions to swap views
function showHome() {
    loginPage.style.display = 'none';
    homePage.style.display = 'block';
}

function showLogin() {
    loginPage.style.display = 'block';
    homePage.style.display = 'none';
}
