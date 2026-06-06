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

// SCROLL SAFETY CHECK ADDED HERE
window.addEventListener('scroll', () => {
    const topBtn = document.getElementById('btn-back-to-top');
    if (!topBtn) return; 
    if (window.scrollY > 400) {
        topBtn.classList.add('visible');
    } else {
        topBtn.classList.remove('visible');
    }
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

window.onload = async () => {
    if (localStorage.getItem('themeMode') === 'light') {
        document.documentElement.classList.remove('dark');
        document.getElementById('dark-icon').className = 'fa-solid fa-moon';
    } else {
        document.documentElement.classList.add('dark');
        document.getElementById('dark-icon').className = 'fa-solid fa-sun';
    }

    await loadSiteData();

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
    populateHomeEditorFields();
    populateProfileEditorFields();
    adjustAdminFormView();
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

// TOAST MSG SAFETY CHECK ADDED HERE
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast || !toastMsg || !toastIcon) return; 

    toastMsg.innerText = message;
    
    if (type === 'success') {
        toast.className = 'fixed bottom-10 right-10 px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-3 z-[300] bg-green-50/90 border border-green-200 text-green-800 backdrop-blur-md show';
        toastIcon.className = 'fa-solid fa-circle-check text-green-500 text-xl';
    } else {
        toast.className = 'fixed bottom-10 right-10 px-5 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-3 z-[300] bg-red-50/90 border border-red-200 text-red-800 backdrop-blur-md show';
        toastIcon.className = 'fa-solid fa-triangle-exclamation text-red-500 text-xl';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => { 
        toast.classList.remove('show'); 
    }, 3500);
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
    
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileDropdown) profileDropdown.classList.add('hidden');
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
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
        closeAssetView();
        
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.classList.add('hidden');
        
        const accModal = document.getElementById('account-modal');
        if (accModal) accModal.classList.add('hidden');
        
        const profileDrop = document.getElementById('profile-dropdown');
        if (profileDrop) profileDrop.classList.add('hidden');
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

function toggleAdminPanel(panel) {
    document.getElementById('admin-upload-section').classList.add('hidden');
    document.getElementById('admin-edit-home-section').classList.add('hidden');
    document.getElementById('admin-edit-profile-section').classList.add('hidden');
    document.getElementById('admin-inbox-section').classList.add('hidden');
    
    ['btn-admin-upload', 'btn-admin-edit', 'btn-admin-profile', 'btn-admin-inbox'].forEach(id => {
        document.getElementById(id).className = "font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-white/50 rounded-xl px-5 py-2 transition whitespace-nowrap";
    });

    if(panel === 'upload') {
        document.getElementById('admin-upload-section').classList.remove('hidden');
        document.getElementById('btn-admin-upload').className = "font-bold text-white bg-green-500 rounded-xl px-5 py-2 shadow-sm transition whitespace-nowrap";
    } else if (panel === 'edit-home') {
        document.getElementById('admin-edit-home-section').classList.remove('hidden');
        document.getElementById('btn-admin-edit').className = "font-bold text-white bg-brand-primary rounded-xl px-5 py-2 shadow-sm transition whitespace-nowrap";
        populateHomeEditorFields();
    } else if (panel === 'edit-profile') {
        document.getElementById('admin-edit-profile-section').classList.remove('hidden');
        document.getElementById('btn-admin-profile').className = "font-bold text-white bg-amber-500 rounded-xl px-5 py-2 shadow-sm transition whitespace-nowrap";
        populateProfileEditorFields();
    } else {
        document.getElementById('admin-inbox-section').classList.remove('hidden');
        document.getElementById('btn-admin-inbox').className = "font-bold text-white bg-blue-500 rounded-xl px-5 py-2 shadow-sm transition whitespace-nowrap";
        renderMessages();
    }
}

function adjustAdminFormView() {
    const dest = document.getElementById('upload-dest').value;
    const imgBox = document.getElementById('field-image-file');
    const vidBox = document.getElementById('field-video-link');
    const fileBox = document.getElementById('field-download-file');
    const catBox = document.getElementById('field-category');

    if (dest === 'youtube') {
        imgBox.classList.add('hidden'); fileBox.classList.add('hidden'); catBox.classList.add('hidden'); vidBox.classList.remove('hidden');
    } else if (dest === 'achievement') {
        imgBox.classList.remove('hidden'); fileBox.classList.add('hidden'); catBox.classList.add('hidden'); vidBox.classList.add('hidden');
    } else if (dest === 'studio-assets') {
        imgBox.classList.remove('hidden'); fileBox.classList.remove('hidden'); catBox.classList.remove('hidden'); vidBox.classList.add('hidden');
    }
}

function populateHomeEditorFields() {
    const h = siteData.homeSettings;
    if(!h) return;
    document.getElementById('edit-badge1').value = h.badge1 || '';
    document.getElementById('edit-title1').value = h.title1 || '';
    document.getElementById('edit-title2').value = h.title2 || '';
    document.getElementById('edit-desc').value = h.desc || '';
    document.getElementById('edit-btn-text').value = h.btnText || '';
    document.getElementById('edit-badge2').value = h.badge2 || '';
    
    document.getElementById('edit-stat1-title').value = h.stat1Title || '';
    document.getElementById('edit-stat1-desc').value = h.stat1Desc || '';
    document.getElementById('edit-stat2-title').value = h.stat2Title || '';
    document.getElementById('edit-stat2-desc').value = h.stat2Desc || '';
    document.getElementById('edit-stat3-title').value = h.stat3Title || '';
    document.getElementById('edit-stat3-desc').value = h.stat3Desc || '';
    document.getElementById('edit-stat4-title').value = h.stat4Title || '';
    document.getElementById('edit-stat4-desc').value = h.stat4Desc || '';
}

function populateProfileEditorFields() {
    const p = siteData.profile;
    if(!p) return;
    document.getElementById('edit-profile-name').value = p.displayName || '';
    document.getElementById('edit-profile-age').value = p.age || '';
    document.getElementById('edit-profile-email').value = p.email || '';
    document.getElementById('edit-profile-desc').value = p.desc || '';
    document.getElementById('edit-profile-inspired').value = p.inspired || '';
    document.getElementById('edit-profile-discord').value = p.discord || '';
    document.getElementById('edit-profile-youtube').value = p.youtube || '';
    document.getElementById('edit-profile-support').value = p.support || '';
}

async function handleProfileEdit(e) {
    e.preventDefault();
    const logoInput = document.getElementById('edit-profile-logo-file');
    
    const finalizeProfileSave = async (logoBase64) => {
        siteData.profile = {
            displayName: document.getElementById('edit-profile-name').value,
            logo: logoBase64 || siteData.profile.logo,
            age: document.getElementById('edit-profile-age').value,
            email: document.getElementById('edit-profile-email').value,
            desc: document.getElementById('edit-profile-desc').value,
            inspired: document.getElementById('edit-profile-inspired').value,
            discord: document.getElementById('edit-profile-discord').value,
            youtube: document.getElementById('edit-profile-youtube').value,
            support: document.getElementById('edit-profile-support').value
        };
        await saveSiteData();
        renderData();
        showToast('Global Profile Settings Updated!', 'success');
    };

    if (logoInput.files && logoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(evt) { finalizeProfileSave(evt.target.result); };
        reader.readAsDataURL(logoInput.files[0]);
    } else {
        await finalizeProfileSave(null);
    }
}

async function handleHomeEdit(e) {
    e.preventDefault();
    const fileInput = document.getElementById('edit-home-img-file');
    
    const finalizeHomeEdit = async (imgData) => {
        siteData.homeSettings = {
            badge1: document.getElementById('edit-badge1').value,
            title1: document.getElementById('edit-title1').value,
            title2: document.getElementById('edit-title2').value,
            desc: document.getElementById('edit-desc').value,
            btnText: document.getElementById('edit-btn-text').value,
            badge2: document.getElementById('edit-badge2').value,
            imgUrl: imgData || siteData.homeSettings.imgUrl || 'https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=1200&q=80',
            stat1Title: document.getElementById('edit-stat1-title').value,
            stat1Desc: document.getElementById('edit-stat1-desc').value,
            stat2Title: document.getElementById('edit-stat2-title').value,
            stat2Desc: document.getElementById('edit-stat2-desc').value,
            stat3Title: document.getElementById('edit-stat3-title').value,
            stat3Desc: document.getElementById('edit-stat3-desc').value,
            stat4Title: document.getElementById('edit-stat4-title').value,
            stat4Desc: document.getElementById('edit-stat4-desc').value
        };

        await saveSiteData();
        renderData();
        showToast('Home Page Configuration Updated!', 'success');
    };

    if (fileInput.files && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(evt) { finalizeHomeEdit(evt.target.result); };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        await finalizeHomeEdit(null);
    }
}

async function handleSupportMail(e) {
    e.preventDefault();
    if(!siteData.messages) siteData.messages = [];
    siteData.messages.push({ 
        name: document.getElementById('sup-name').value, 
        email: document.getElementById('sup-email').value, 
        msg: document.getElementById('sup-msg').value, 
        time: new Date().toLocaleTimeString() 
    });
    await saveSiteData();
    showToast('Sent to Admin!', 'success');
    document.getElementById('support-form').reset();
    document.getElementById('msg-char-counter').innerText = '0 / 500';
    renderMessages();
}

async function clearAllMails() {
    if(confirm("Are you sure you want to delete all messages permanently?")) {
        siteData.messages = [];
        await saveSiteData();
        renderMessages();
        showToast('All messages deleted!', 'success');
    }
}

function renderMessages() {
    const container = document.getElementById('admin-messages-container');
    if(!container) return;
    if(!siteData.messages || siteData.messages.length === 0) {
        container.innerHTML = `<p class="font-medium text-gray-500 text-center py-8">Inbox is empty!</p>`;
        return;
    }
    container.innerHTML = siteData.messages.slice().reverse().map(m => `
        <div class="bg-white/60 dark:bg-slate-800/60 border border-white/80 dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <div class="flex justify-between items-start mb-3 border-b border-gray-200/50 dark:border-gray-700 pb-2">
                <h4 class="font-bold text-blue-500 text-lg">${m.name} <br><span class="text-sm text-gray-500 font-medium">${m.email}</span></h4>
                <span class="text-xs font-semibold text-gray-500 bg-white/50 dark:bg-slate-700 px-2 py-1 rounded-md border border-gray-200/50">${m.time}</span>
            </div>
            <p class="font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">${m.msg}</p>
        </div>
    `).join('');
}

function formatEmbedSource(url) {
    if (!url) return '';
    if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/').split('&')[0];
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
}

function handleAdminUpload(e) {
    e.preventDefault();
    const dest = document.getElementById('upload-dest').value;
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const submitBtn = document.getElementById('admin-submit-btn');

    let itemEntry = { 
        title: document.getElementById('upload-title').value, 
        desc: document.getElementById('upload-desc').value 
    };

    const finalizePublish = () => {
        progressContainer.classList.remove('hidden'); submitBtn.disabled = true; submitBtn.innerText = "Uploading...";
        let progress = 0;
        const uploadInterval = setInterval(async () => {
            progress += 20; progressBar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(uploadInterval);
                if(!siteData[dest]) siteData[dest] = [];
                siteData[dest].push(itemEntry);
                await saveSiteData(); 
                renderData();
                showToast(`Uploaded Successfully!`, 'success');
                document.getElementById('admin-upload-form').reset();
                adjustAdminFormView();
                setTimeout(() => {
                    progressContainer.classList.add('hidden'); progressBar.style.width = '0%';
                    submitBtn.disabled = false; submitBtn.innerText = "Publish Content!";
                }, 500);
            }
        }, 150);
    };

    if (dest === 'youtube') {
        const videoLink = document.getElementById('upload-video').value;
        if(!videoLink) { showToast('Missing YouTube link!', 'error'); return; }
        itemEntry.video = videoLink;
        finalizePublish();
    } else {
        const imgElement = document.getElementById('upload-img-file').files[0];
        const processWithImage = (imgSrc) => {
            itemEntry.img = imgSrc;
            if (dest === 'studio-assets') {
                itemEntry.category = document.getElementById('upload-category').value;
                const structBin = document.getElementById('upload-binary-file').files[0];
                if (structBin) {
                    const binReader = new FileReader();
                    binReader.onload = function(evt) {
                        itemEntry.file = evt.target.result;
                        itemEntry.filename = structBin.name;
                        finalizePublish();
                    };
                    binReader.readAsDataURL(structBin);
                } else {
                    itemEntry.file = '#'; itemEntry.filename = 'No_File.txt';
                    finalizePublish();
                }
            } else {
                finalizePublish();
            }
        };

        if(imgElement) {
            const imgReader = new FileReader();
            imgReader.onload = function(evt) { processWithImage(evt.target.result); };
            imgReader.readAsDataURL(imgElement);
        } else {
            processWithImage('https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=500&q=80');
        }
    }
}

async function deleteItem(category, index) {
    if (confirm("Delete this item forever?")) {
        siteData[category].splice(index, 1);
        await saveSiteData();
        renderData();
        showToast('Deleted!', 'success');
    }
}

function expandAssetView(imgUrl, titleText, descText, catText) {
    currentlyViewedAsset = titleText;
    document.getElementById('fullscreen-image').src = imgUrl;
    document.getElementById('fullscreen-title').innerText = titleText;
    document.getElementById('fullscreen-desc').innerText = descText;
    document.getElementById('fullscreen-category').innerText = catText;
    
    renderReviews();
    document.getElementById('fullscreen-overlay').classList.remove('hidden');
}

function closeAssetView() {
    const overlay = document.getElementById('fullscreen-overlay');
    if (overlay) overlay.classList.add('hidden');
    currentlyViewedAsset = '';
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    if(!currentUser) return;
    const textContent = document.getElementById('review-text').value;
    
    if(!siteData.reviews) siteData.reviews = [];
    siteData.reviews.push({
        assetTitle: currentlyViewedAsset,
        username: currentUser.name,
        profileImg: currentUser.img || fallbackMainLogo,
        text: textContent,
        date: 'Just now'
    });

    await saveSiteData();
    document.getElementById('review-text').value = '';
    showToast('Review posted!', 'success');
    renderReviews();
}

function renderReviews() {
    const displayStack = document.getElementById('reviews-display-stack');
    if(!siteData.reviews) siteData.reviews = [];
    const relevantReviews = siteData.reviews.filter(r => r.assetTitle === currentlyViewedAsset);
    
    if(relevantReviews.length === 0) {
        displayStack.innerHTML = `<p class="text-sm text-gray-500 italic py-4">No reviews for this asset yet. Be the first!</p>`;
        return;
    }
    displayStack.innerHTML = relevantReviews.slice().reverse().map(rev => `
        <div class="flex gap-3 items-start bg-white/60 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm pop-in">
            <img src="${rev.profileImg || fallbackMainLogo}" class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" onerror="this.src='${fallbackMainLogo}'">
            <div class="flex-grow">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-sm text-gray-900 dark:text-gray-100">${rev.username}</span>
                    <span class="text-xs font-semibold text-gray-400">${rev.date}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">${rev.text}</p>
            </div>
        </div>
    `).join('');
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
    
    const discordLink = document.getElementById('about-link-discord');
    if (discordLink) discordLink.href = p.discord || 'https://discord.com/invite/8BGb8jFKn7';
    
    const ytLink = document.getElementById('about-link-youtube');
    if (ytLink) ytLink.href = p.youtube || '#';
    
    const supportLink = document.getElementById('about-link-support');
    if (supportLink) {
        if (p.support && p.support !== '#') {
            supportLink.onclick = null;
            supportLink.href = p.support;
        } else {
            supportLink.href = 'https://discord.com/invite/8BGb8jFKn7';
            supportLink.onclick = function(e){ e.preventDefault(); switchTab('support'); };
        }
    }

    document.getElementById('display-home-badge1').innerText = h.badge1 || '';
    document.getElementById('display-home-title1').innerText = h.title1 || '';
    document.getElementById('display-home-title2').innerText = h.title2 || '';
    document.getElementById('display-home-desc').innerText = h.desc || '';
    document.getElementById('display-home-btn').innerText = h.btnText || '';
    document.getElementById('display-home-badge2').innerText = h.badge2 || '';
    
    const mainImg = document.getElementById('display-home-img');
    if (mainImg) {
        mainImg.src = h.imgUrl || 'https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=1200&q=80';
        mainImg.onerror = function() { 
            this.onerror=null; 
            this.src='https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=1200&q=80'; 
        };
    }

    document.getElementById('display-stat1-title').innerText = h.stat1Title || '';
    document.getElementById('display-stat1-desc').innerText = h.stat1Desc || '';
    document.getElementById('display-stat2-title').innerText = h.stat2Title || '';
    document.getElementById('display-stat2-desc').innerText = h.stat2Desc || '';
    document.getElementById('display-stat3-title').innerText = h.stat3Title || '';
    document.getElementById('display-stat3-desc').innerText = h.stat3Desc || '';
    document.getElementById('display-stat4-title').innerText = h.stat4Title || '';
    document.getElementById('display-stat4-desc').innerText = h.stat4Desc || '';

    if(!siteData['studio-assets']) siteData['studio-assets'] = [];
    
    const searchInput = document.getElementById('asset-search-input');
    const assetSearchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";
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
            assetsContainer.innerHTML = filteredAssets.map((item, index) => {
                const actualIndex = siteData['studio-assets'].indexOf(item);
                return `
                <div class="glass-card overflow-hidden hover-pop pop-in delay-${(index % 3) + 1} relative group flex flex-col cursor-pointer" onclick="expandAssetView('${item.img}', '${item.title}', '${item.desc}', '${item.category}')">
                    ${isAdmin ? `<button onclick="event.stopPropagation(); deleteItem('studio-assets', ${actualIndex})" class="absolute top-3 left-3 bg-red-500/90 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-sm z-10 hover:bg-red-600 transition backdrop-blur-sm"><i class="fa-solid fa-trash mr-1"></i> Delete</button>` : ''}
                    <div class="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-1 text-xs font-bold shadow-sm z-10 border border-gray-200 dark:border-gray-700">${item.category}</div>
                    <img src="${item.img}" class="w-full h-48 object-cover" onerror="this.src='https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=500&q=80'">
                    <div class="p-6 flex-grow flex flex-col justify-between">
                        <div>
                            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${item.title}</h3>
                            <p class="font-medium text-gray-600 dark:text-gray-400 mb-6 text-sm line-clamp-2">${item.desc}</p>
                        </div>
                        <a href="${item.file}" download="${item.filename || 'asset.lua'}" onclick="event.stopPropagation();" class="block text-center w-full btn-cartoon py-2 text-sm">
                            <i class="fa-solid fa-download mr-1"></i> Download
                        </a>
                    </div>
                </div>
            `}).join('');
        }
    }

    if(!siteData.achievement) siteData.achievement = [];
    const achievementsContainer = document.getElementById('achievements-container');
    if (achievementsContainer) {
        if(siteData.achievement.length === 0) {
            achievementsContainer.innerHTML = `<p class="text-gray-500 font-medium col-span-full py-4 text-center">No achievements posted yet.</p>`;
        } else {
            achievementsContainer.innerHTML = siteData.achievement.map((item, index) => `
                <div class="glass-card p-6 relative hover-pop pop-in delay-${(index % 3) + 1}">
                    ${isAdmin ? `<button onclick="deleteItem('achievement', ${index})" class="absolute top-4 left-4 bg-red-500/90 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-sm z-20 hover:bg-red-600 transition backdrop-blur-sm"><i class="fa-solid fa-trash mr-1"></i> Delete</button>` : ''}
                    <div class="absolute -top-5 -right-4 bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md z-10 text-white">
                        <i class="fa-solid fa-trophy"></i>
                    </div>
                    <img src="${item.img}" class="w-full h-48 object-cover rounded-xl shadow-sm mb-5" onerror="this.src='https://images.unsplash.com/photo-1605342417730-10ebcb1a1ab5?w=500&q=80'">
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${item.title}</h3>
                    <p class="font-medium text-gray-600 dark:text-gray-400 text-sm">${item.desc}</p>
                </div>
            `).join('');
        }
    }

    if(!siteData.youtube) siteData.youtube = [];
    const youtubeContainer = document.getElementById('youtube-container');
    if (youtubeContainer) {
        if(siteData.youtube.length === 0) {
            youtubeContainer.innerHTML = `<p class="text-gray-500 font-medium col-span-full py-4 text-center">No video tutorials uploaded yet.</p>`;
        } else {
            youtubeContainer.innerHTML = siteData.youtube.map((item, index) => {
                let frameOutput = item.video ? `<iframe class="w-full h-72 rounded-xl mb-5 shadow-sm" src="${formatEmbedSource(item.video)}" title="YouTube video view" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : '';
                return `
                <div class="glass-card p-6 hover-pop pop-in delay-${(index % 2) + 1} relative">
                    ${isAdmin ? `<button onclick="deleteItem('youtube', ${index})" class="absolute -top-3 -left-3 bg-red-500/90 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-md z-20 hover:bg-red-600 transition backdrop-blur-sm"><i class="fa-solid fa-trash mr-1"></i> Delete</button>` : ''}
                    ${frameOutput}
                    <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${item.title}</h3>
                    <p class="font-medium text-gray-600 dark:text-gray-400 text-sm">${item.desc}</p>
                </div>
                `;
            }).join('');
        }
    }
}
