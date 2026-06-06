// Supabase Initialization & Constants
const SUPABASE_URL = 'https://ngoywknktovkkhewsbos.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nb3l3a25rdG92a2toZXdzYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDQ0ODQsImV4cCI6MjA5NjE4MDQ4NH0.rF0agK0jBdS1cRFqR1wYVijgKxcgeVnfgrA8fpdCJDs';
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1/platform_data`; 

const fallbackMainLogo = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

let siteData = {
    profile: {
        displayName: "Agent Simulator",
        logo: "https://yt3.googleusercontent.com/NxjNxhlX0QDBRtSTjRJqiffCqwzax8loTghklPC2EonxxebiUmHtbgAKugoSDsKJyCmPs07J_T4=s160-c-k-c0x00ffffff-no-rj",
        age: "24",
        email: "contact@agentsimulator.com",
        desc: "Welcome to my operational hub. I specialize in building, testing, and scaling advanced AI agents to solve complex automation challenges. The goal is to bridge the gap between human intent and machine execution.",
        inspired: "Innovation isn't just simulated, it's executed flawlessly.",
        discord: "https://discord.com/invite/8BGb8jFKn7",
        youtube: "https://youtube.com/@agentsimulator?si=l5pJIzSEy23vAitT",
        support: "https://discord.com/invite/8BGb8jFKn7"
    },
    homeSettings: {
        badge1: 'Developer Hub',
        title1: 'Build Epic',
        title2: 'Roblox Games',
        desc: 'Download advanced Lua scripts, share your game milestones, watch tutorials, and grow your player base.',
        btnText: 'Browse Assets!',
        badge2: 'System Online',
        imgUrl: 'https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=1200&q=80',
        stat1Title: '10M+', stat1Desc: 'Place Visits',
        stat2Title: '50K+', stat2Desc: 'Active Players',
        stat3Title: '1,200+', stat3Desc: 'Lua Scripts',
        stat4Title: '200K+', stat4Desc: 'Subscribers'
    },
    'studio-assets': [],
    achievement: [],
    youtube: [],
    reviews: [],
    messages: []
};

let registeredUsers = [];
let currentUser = null;
let isRegistering = false;
let currentCategoryFilter = 'All';
let currentlyViewedAsset = ''; 

function updateCharCounter(fieldId, counterId, maxLength) {
    const currentLength = document.getElementById(fieldId).value.length;
    document.getElementById(counterId).innerText = `${currentLength} / ${maxLength}`;
}

function togglePasswordReveal(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.className = "fa-solid fa-eye-slash";
    } else {
        passwordInput.type = "password";
        eyeIcon.className = "fa-solid fa-eye";
    }
}

window.addEventListener('scroll', () => {
    const topBtn = document.getElementById('btn-back-to-top');
    if (window.scrollY > 400) topBtn.classList.add('visible');
    else topBtn.classList.remove('visible');
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadSiteData() {
    const localFallback = localStorage.getItem('agentSimSiteData');
    if(localFallback) {
        try {
            const parsed = JSON.parse(localFallback);
            if(parsed && parsed.homeSettings) siteData = {...siteData, ...parsed};
        } catch(e) { console.error("Local sync parsing error:", e); }
    }

    try {
        const res = await fetch(`${SUPABASE_REST_URL}?id=eq.1&select=payload`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if(res.ok) {
            const data = await res.json();
            if(data && data.length > 0 && data[0].payload) {
                siteData = {...siteData, ...data[0].payload};
                localStorage.setItem('agentSimSiteData', JSON.stringify(siteData)); 
            }
        }
    } catch(err) {
        console.warn('Supabase fetch returned offline. Safely retaining standard local storage fallback.', err);
    }
    
    const savedUsers = localStorage.getItem('agentSimRegisteredUsers');
    if(savedUsers) {
        try { registeredUsers = JSON.parse(savedUsers); } catch(e) { console.error(e); }
    }
}

async function saveSiteData() {
    localStorage.setItem('agentSimSiteData', JSON.stringify(siteData));
    
    try {
        await fetch(SUPABASE_REST_URL, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ id: 1, payload: siteData })
        });
    } catch(err) {
        console.warn('Supabase transmission blocked. Execution backed up firmly to Local Storage status.', err);
    }
}

// Persistent Login Logic is Executed Below
window.onload = async () => {
    if (localStorage.getItem('themeMode') === 'light') {
        document.documentElement.classList.remove('dark');
        document.getElementById('dark-icon').className = 'fa-solid fa-moon';
    } else {
        document.documentElement.classList.add('dark');
        document.getElementById('dark-icon').className = 'fa-solid fa-sun';
    }

    await loadSiteData();

    // Long Login Handler - Restores active user from localStorage immediately
    const savedUser = localStorage.getItem('agentSimUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (currentUser && currentUser.role === 'admin') {
                const adminNav = document.getElementById('nav-admin');
                if (adminNav) adminNav.classList.remove('hidden');
                const mobileAdminNav = document.getElementById('nav-admin-mobile');
                if (mobileAdminNav) mobileAdminNav.classList.remove('hidden');
            }
        } catch(e) { currentUser = null; }
    }
    
    updateUserUI();
    renderData();
};

function toggleDarkMode() {
    const doc = document.documentElement;
    const icon = document.getElementById('dark-icon');
    if (doc.classList.contains('dark')) {
        doc.classList.remove('dark');
        icon.className = 'fa-solid fa-moon';
        localStorage.setItem('themeMode', 'light');
    } else {
        doc.classList.add('dark');
        icon.className = 'fa-solid fa-sun';
        localStorage.setItem('themeMode', 'dark');
    }
}

function toggleMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const icon = document.getElementById('mobile-menu-icon');
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
        icon.className = 'fa-solid fa-xmark';
    } else {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
        icon.className = 'fa-solid fa-bars';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = message;
    
    if (type === 'success') {
        toast.className = 'fixed bottom-10 right-10 px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-3 z-[300] bg-green-50/90 border border-green-200 text-green-800 backdrop-blur-md show';
        document.getElementById('toast-icon').className = 'fa-solid fa-circle-check text-green-500 text-xl';
    } else {
        toast.className = 'fixed bottom-10 right-10 px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-3 z-[300] bg-red-50/90 border border-red-200 text-red-800 backdrop-blur-md show';
        document.getElementById('toast-icon').className = 'fa-solid fa-triangle-exclamation text-red-500 text-xl';
    }
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('opacity-100');
        tab.classList.add('opacity-0');
    });
    
    const targetedTab = document.getElementById(tabId);
    if(targetedTab) {
        targetedTab.classList.remove('hidden');
        setTimeout(() => {
            targetedTab.classList.remove('opacity-0');
            targetedTab.classList.add('opacity-100');
        }, 50);
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(!btn.id || !btn.id.includes('nav-admin')) {
            btn.classList.remove('active-tab', 'text-black', 'dark:text-white');
            btn.classList.add('text-gray-600', 'dark:text-gray-300');
        }
    });
    const activeNav = document.querySelector(`.nav-btn[data-target="${tabId}"]`);
    if(activeNav && (!activeNav.id || !activeNav.id.includes('nav-admin'))) {
        activeNav.classList.remove('text-gray-600', 'dark:text-gray-300');
        activeNav.classList.add('active-tab', 'text-black', 'dark:text-white');
    }
    document.getElementById('profile-dropdown').classList.add('hidden');
}

function toggleReg() {
    isRegistering = !isRegistering;
    document.getElementById('standard-fields').classList.toggle('hidden');
    document.getElementById('auth-title').innerText = isRegistering ? "Sign Up" : "Login";
    document.getElementById('auth-btn').innerText = isRegistering ? "Register" : "Login";
    document.getElementById('toggle-reg-text').innerText = isRegistering ? "Have an account? Login" : "Create new account";
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('auth-user').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();

    if (isRegistering) {
        const exists = registeredUsers.find(u => u.username.toLowerCase() === user.toLowerCase());
        if (exists) { showToast('Username taken!', 'error'); return; }
        const first = document.getElementById('reg-first').value.trim() || user;
        const age = document.getElementById('reg-age').value || 'Unknown';
        
        const fileInput = document.getElementById('reg-pic-file');
        
        const proceedRegistration = (avatarData) => {
            const newUser = { role: 'user', name: first, username: user, password: pass, img: avatarData, age: age, email: 'user@agentsim.com' };
            registeredUsers.push(newUser);
            localStorage.setItem('agentSimRegisteredUsers', JSON.stringify(registeredUsers));
            currentUser = newUser;
            finalizeLoginSequence(first);
        };

        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) { proceedRegistration(event.target.result); };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            proceedRegistration(fallbackMainLogo);
        }
    } else {
        if (user === 'Agent' && pass === 'AgentisAdmin') {
            currentUser = { role: 'admin', name: 'Admin', username: 'Agent', img: fallbackMainLogo, age: '30', email: 'admin@agentsimulator.com' };
            const adminNav = document.getElementById('nav-admin');
            if (adminNav) adminNav.classList.remove('hidden');
            const mobileAdminNav = document.getElementById('nav-admin-mobile');
            if (mobileAdminNav) mobileAdminNav.classList.remove('hidden');
            finalizeLoginSequence('Admin');
        } else {
            const foundUser = registeredUsers.find(u => u.username === user && u.password === pass);
            if (foundUser) {
                currentUser = foundUser;
                finalizeLoginSequence(foundUser.name);
            } else {
                showToast('Invalid Username or Password.', 'error');
            }
        }
    }
}

function finalizeLoginSequence(name) {
    // Write state to Browser persistence mechanism
    localStorage.setItem('agentSimUser', JSON.stringify(currentUser));
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('login-form').reset();
    showToast(`Welcome ${name}!`, 'success');
    updateUserUI();
    renderData();
}

function toggleProfileMenu(e) {
    e.stopPropagation();
    document.getElementById('profile-dropdown').classList.toggle('hidden');
}

window.addEventListener('click', () => {
    document.getElementById('profile-dropdown').classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
        closeAssetView();
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('account-modal').classList.add('hidden');
        document.getElementById('profile-dropdown').classList.add('hidden');
    }
});

function openAccountModal() {
    document.getElementById('profile-dropdown').classList.add('hidden');
    if (currentUser) {
        document.getElementById('acc-display-name').value = currentUser.name || '';
        document.getElementById('acc-age').value = currentUser.age || '';
        document.getElementById('acc-email').value = currentUser.email || '';
    } else {
        showToast('Please login to edit your account.', 'error');
        return;
    }
    document.getElementById('account-modal').classList.remove('hidden');
}

function handleAccountUpdate(e) {
    e.preventDefault();
    if(!currentUser) return;

    const dName = document.getElementById('acc-display-name').value;
    const dAge = document.getElementById('acc-age').value;
    const dEmail = document.getElementById('acc-email').value;
    const logoFile = document.getElementById('acc-logo-file').files[0];

    const executeUpdate = (logoBase64) => {
        currentUser.name = dName;
        currentUser.age = dAge;
        currentUser.email = dEmail;
        if (logoBase64) currentUser.img = logoBase64;
        
        if (currentUser.role !== 'admin') {
            const uIndex = registeredUsers.findIndex(u => u.username === currentUser.username);
            if (uIndex !== -1) {
                registeredUsers[uIndex].name = dName;
                registeredUsers[uIndex].age = dAge;
                registeredUsers[uIndex].email = dEmail;
                if (logoBase64) registeredUsers[uIndex].img = logoBase64;
                localStorage.setItem('agentSimRegisteredUsers', JSON.stringify(registeredUsers));
            }
        }
        
        localStorage.setItem('agentSimUser', JSON.stringify(currentUser));
        updateUserUI();
        renderData();
        document.getElementById('account-modal').classList.add('hidden');
        showToast('Account Info updated successfully!', 'success');
    };

    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function(evt) { executeUpdate(evt.target.result); };
        reader.readAsDataURL(logoFile);
    } else {
        executeUpdate(null);
    }
}

function updateUserUI() {
    let activeName = currentUser ? currentUser.name : "Guest User";
    let activeImg = currentUser ? (currentUser.img || fallbackMainLogo) : fallbackMainLogo;
    let activeMeta = currentUser ? `Age: ${currentUser.age || 'N/A'}` : "Guest Profile";
    
    const contentStructure = `
        <div class="flex items-center gap-2 select-none w-full md:w-auto">
            <div onclick="toggleProfileMenu(event)" class="w-full flex items-center justify-between gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-slate-700 shadow-sm px-4 py-2 rounded-2xl hover-pop cursor-pointer pop-in">
                <div class="flex items-center gap-3">
                    <img src="${activeImg}" class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm" onerror="this.src='${fallbackMainLogo}'">
                    <div class="flex flex-col text-left">
                        <span class="font-bold text-sm text-gray-900 dark:text-white leading-tight">${activeName}</span>
                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">${activeMeta}</span>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-down text-xs text-gray-400 ml-1"></i>
            </div>
        </div>
    `;
    
    const uc = document.getElementById('user-controls');
    if (uc) uc.innerHTML = contentStructure;
    
    const ucm = document.getElementById('user-controls-mobile');
    if (ucm) ucm.innerHTML = contentStructure;
    
    const authBlock = document.getElementById('review-auth-block');
    const reviewForm = document.getElementById('review-form');
    const logoutBtn = document.getElementById('logout-btn-container');

    if (currentUser) {
        if(authBlock) authBlock.classList.add('hidden');
        if(reviewForm) reviewForm.classList.remove('hidden');
        if(logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if(authBlock) authBlock.classList.remove('hidden');
        if(reviewForm) reviewForm.classList.add('hidden');
        if(logoutBtn) logoutBtn.classList.add('hidden');
    }
}

function logout() {
    // Purges localStorage user state to end the persistent login.
    currentUser = null;
    localStorage.removeItem('agentSimUser');
    
    const adminNav = document.getElementById('nav-admin');
    if (adminNav) adminNav.classList.add('hidden');
    
    const adminNavMobile = document.getElementById('nav-admin-mobile');
    if (adminNavMobile) adminNavMobile.classList.add('hidden');
    
    const profileDrop = document.getElementById('profile-dropdown');
    if (profileDrop) profileDrop.classList.add('hidden');
    
    switchTab('home');
    showToast('Logged out successfully.');

    const standardButton = `<button onclick="document.getElementById('auth-modal').classList.remove('hidden')" class="w-full md:w-auto btn-cartoon px-6 py-2 pop-in">Login / Join</button>`;
    
    const uc = document.getElementById('user-controls');
    if (uc) uc.innerHTML = standardButton;
    
    const ucm = document.getElementById('user-controls-mobile');
    if (ucm) ucm.innerHTML = standardButton;

    const authBlock = document.getElementById('review-auth-block');
    const reviewForm = document.getElementById('review-form');
    const logoutBtn = document.getElementById('logout-btn-container');
    
    if(authBlock) authBlock.classList.remove('hidden');
    if(reviewForm) reviewForm.classList.add('hidden');
    if(logoutBtn) logoutBtn.classList.add('hidden');
    
    renderData();
}

function setAssetFilter(category) {
    currentCategoryFilter = category;
    document.querySelectorAll('.asset-filter-btn').forEach(btn => {
        btn.classList.remove('bg-brand-primary', 'text-white');
        btn.classList.add('bg-white/50', 'dark:bg-slate-800', 'text-gray-600', 'dark:text-gray-300');
    });
    const activeBtn = document.getElementById(`filter-${category}`);
    if(activeBtn) {
        activeBtn.classList.remove('bg-white/50', 'dark:bg-slate-800', 'text-gray-600', 'dark:text-gray-300');
        activeBtn.classList.add('bg-brand-primary', 'text-white');
    }
    renderData();
}

function renderData() {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const h = siteData.homeSettings || {};
    const p = siteData.profile || {};

    document.getElementById('nav-logo').src = p.logo || fallbackMainLogo;
    document.getElementById('nav-display-name').innerText = p.displayName || 'Agent Simulator';
    document.getElementById('about-display-logo').src = p.logo || fallbackMainLogo;
    document.getElementById('about-display-title').innerText = p.displayName || 'Agent Simulator';
    document.getElementById('about-display-age').innerText = p.age || '';
    document.getElementById('about-display-email').innerText = p.email || '';
    document.getElementById('about-display-desc').innerText = p.desc || '';
    document.getElementById('about-display-inspired').innerText = p.inspired || '';
    document.getElementById('about-link-discord').href = p.discord || 'https://discord.com/invite/8BGb8jFKn7';
    document.getElementById('about-link-youtube').href = p.youtube || '#';
    
    if (p.support && p.support !== '#') {
        document.getElementById('about-link-support').onclick = null;
        document.getElementById('about-link-support').href = p.support;
    } else {
        document.getElementById('about-link-support').href = 'https://discord.com/invite/8BGb8jFKn7';
        document.getElementById('about-link-support').onclick = function(e){ e.preventDefault(); switchTab('support'); };
    }

    document.getElementById('display-home-badge1').innerText = h.badge1 || '';
    document.getElementById('display-home-title1').innerText = h.title1 || '';
    document.getElementById('display-home-title2').innerText = h.title2 || '';
    document.getElementById('display-home-desc').innerText = h.desc || '';
    document.getElementById('display-home-btn').innerText = h.btnText || '';
    document.getElementById('display-home-badge2').innerText = h.badge2 || '';
    
    const mainImg = document.getElementById('display-home-img');
    mainImg.src = h.imgUrl || 'https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=1200&q=80';
    mainImg.onerror = function() { 
        this.onerror=null; 
        this.src='https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=1200&q=80'; 
    };

    document.getElementById('display-stat1-title').innerText = h.stat1Title || '';
    document.getElementById('display-stat1-desc').innerText = h.stat1Desc || '';
    document.getElementById('display-stat2-title').innerText = h.stat2Title || '';
    document.getElementById('display-stat2-desc').innerText = h.stat2Desc || '';
    document.getElementById('display-stat3-title').innerText = h.stat3Title || '';
    document.getElementById('display-stat3-desc').innerText = h.stat3Desc || '';
    document.getElementById('display-stat4-title').innerText = h.stat4Title || '';
    document.getElementById('display-stat4-desc').innerText = h.stat4Desc || '';

    if(!siteData['studio-assets']) siteData['studio-assets'] = [];
    
    const assetSearchVal = document.getElementById('asset-search-input').value.toLowerCase().trim();
    const filteredAssets = siteData['studio-assets'].filter(item => {
        const matchesCategory = (currentCategoryFilter === 'All' || item.category === currentCategoryFilter);
        const matchesSearch = (!assetSearchVal || item.title.toLowerCase().includes(assetSearchVal) || item.desc.toLowerCase().includes(assetSearchVal));
        return matchesCategory && matchesSearch;
    });

    const assetsContainer = document.getElementById('assets-container');
    if(assetsContainer) {
        if(filteredAssets.length === 0) {
            assetsContainer.innerHTML = `<p class="text-gray-500 font-medium col-span-full py-4 text-center">No items found matching criteria.</p>`;
        } else {
            // Re-attached and fixed original incomplete Javascript loop structure 
            assetsContainer.innerHTML = filteredAssets.map((item, index) => {
                const actualIndex = siteData['studio-assets'].indexOf(item);
                return `
                <div class="glass-card overflow-hidden hover-pop pop-in delay-${(index % 3) + 1} relative group flex flex-col cursor-pointer" onclick="expandAssetView('${item.img}', '${item.title}', '${item.desc}', '${item.category}')">
                    ${isAdmin ? `<button onclick="event.stopPropagation(); deleteItem('studio-assets', ${actualIndex})" class="absolute top-3 right-3 bg-red-500/90 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-sm z-10 hover:bg-red-600 transition backdrop-blur-sm"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                    <div class="relative w-full h-48 overflow-hidden">
                        <img src="${item.img || fallbackMainLogo}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${item.title}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-2">${item.desc}</p>
                    </div>
                </div>`;
            }).join('');
        }
    }
}