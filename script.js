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
        support: "#"
    },
    homeSettings: {
        badge1: 'Developer Hub',
        title1: 'Build Epic',
        title2: 'Roblox Games',
        desc: 'Download advanced Lua scripts, share your game milestones, watch tutorials, and grow your player base.',
        btnText: 'Browse Assets!',
        badge2: 'System Online',
        imgUrl: 'hero-showcase.png',
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

// Quality of Life: Character Count Handler
function updateCharCounter(fieldId, counterId, maxLength) {
    const currentLength = document.getElementById(fieldId).value.length;
    document.getElementById(counterId).innerText = `${currentLength} / ${maxLength}`;
}

// Quality of Life: Password Mask Reveal Control Toggle
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

// Quality of Life: Back To Top Tracker Monitor Logic
window.addEventListener('scroll', () => {
    const topBtn = document.getElementById('btn-back-to-top');
    if (window.scrollY > 400) {
        topBtn.classList.add('visible');
    } else {
        topBtn.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadSiteData() {
    const savedData = localStorage.getItem('agentSimSiteData');
    if(savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if(parsed && parsed.homeSettings) siteData = {...siteData, ...parsed};
        } catch(e) { console.error("Error loading layout configs:", e); }
    }
    
    const savedUsers = localStorage.getItem('agentSimRegisteredUsers');
    if(savedUsers) {
        try { registeredUsers = JSON.parse(savedUsers); } catch(e) { console.error(e); }
    }
}

function saveSiteData() {
    localStorage.setItem('agentSimSiteData', JSON.stringify(siteData));
}

window.onload = () => {
    if (localStorage.getItem('themeMode') === 'light') {
        document.documentElement.classList.remove('dark');
        document.getElementById('dark-icon').className = 'fa-solid fa-moon';
    } else {
        document.documentElement.classList.add('dark');
        document.getElementById('dark-icon').className = 'fa-solid fa-sun';
    }

    loadSiteData();

    const savedUser = localStorage.getItem('agentSimUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (currentUser && currentUser.role === 'admin') {
                document.getElementById('nav-admin').classList.remove('hidden');
                document.getElementById('nav-admin-mobile').classList.remove('hidden');
            }
            updateUserUI();
        } catch(e) { currentUser = null; }
    }
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
    
    // QoL Tab Line Highlight Transitions
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'text-black', 'dark:text-white');
        btn.classList.add('text-gray-600', 'dark:text-gray-300');
    });
    const activeNav = document.querySelector(`.nav-btn[data-target="${tabId}"]`);
    if(activeNav) {
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
    const user = document.getElementById('auth-user').value;
    const pass = document.getElementById('auth-pass').value;

    if (isRegistering) {
        const exists = registeredUsers.find(u => u.username.toLowerCase() === user.toLowerCase());
        if (exists) { showToast('Username taken!', 'error'); return; }
        const first = document.getElementById('reg-first').value || user;
        const age = document.getElementById('reg-age').value || 'Unknown';
        
        const fileInput = document.getElementById('reg-pic-file');
        
        const proceedRegistration = (avatarData) => {
            const newUser = { role: 'user', name: first, username: user, password: pass, img: avatarData, age: age, email: '' };
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
            currentUser = { role: 'admin', name: 'Admin', img: fallbackMainLogo };
            document.getElementById('nav-admin').classList.remove('hidden');
            document.getElementById('nav-admin-mobile').classList.remove('hidden');
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

function openUserEditModal() {
    if(!currentUser) return;
    document.getElementById('user-edit-name').value = currentUser.name || '';
    document.getElementById('user-edit-age').value = currentUser.age || '';
    document.getElementById('user-edit-email').value = currentUser.email || '';
    document.getElementById('user-edit-modal').classList.remove('hidden');
    document.getElementById('profile-dropdown').classList.add('hidden');
}

function closeUserEditModal() {
    document.getElementById('user-edit-modal').classList.add('hidden');
}

function handleUserEditSubmit(e) {
    e.preventDefault();
    if(!currentUser) return;
    
    const newName = document.getElementById('user-edit-name').value;
    const newAge = document.getElementById('user-edit-age').value;
    const newEmail = document.getElementById('user-edit-email').value;
    const fileInput = document.getElementById('user-edit-pic');
    
    const finalizeUserEdit = (imgData) => {
        currentUser.name = newName;
        currentUser.age = newAge;
        currentUser.email = newEmail;
        if(imgData) currentUser.img = imgData;
        
        if(currentUser.role !== 'admin') {
            const userIndex = registeredUsers.findIndex(u => u.username === currentUser.username);
            if(userIndex !== -1) {
                registeredUsers[userIndex] = currentUser;
                localStorage.setItem('agentSimRegisteredUsers', JSON.stringify(registeredUsers));
            }
        }
        
        localStorage.setItem('agentSimUser', JSON.stringify(currentUser));
        updateUserUI();
        closeUserEditModal();
        showToast('Account Info Updated!', 'success');
    };
    
    if (fileInput.files && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(evt) { finalizeUserEdit(evt.target.result); };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeUserEdit(null);
    }
}

function toggleProfileMenu(e) {
    e.stopPropagation();
    document.getElementById('profile-dropdown').classList.toggle('hidden');
}

window.addEventListener('click', () => {
    document.getElementById('profile-dropdown').classList.add('hidden');
});

function updateUserUI() {
    if(!currentUser) return;
    const contentStructure = `
        <div onclick="toggleProfileMenu(event)" class="flex items-center gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-slate-700 shadow-sm px-4 py-2 rounded-2xl hover-pop cursor-pointer pop-in select-none">
            <img src="${currentUser.img || fallbackMainLogo}" class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm">
            <div class="flex flex-col text-left">
                <span class="font-bold text-sm text-gray-900 dark:text-white leading-tight">${currentUser.name}</span>
                ${currentUser.age ? `<span class="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">Age: ${currentUser.age}</span>` : ''}
            </div>
            <i class="fa-solid fa-chevron-down text-xs text-gray-400 ml-1"></i>
        </div>
    `;
    document.getElementById('user-controls').innerHTML = contentStructure;
    document.getElementById('user-controls-mobile').innerHTML = contentStructure;
    document.getElementById('review-auth-block').classList.add('hidden');
    document.getElementById('review-form').classList.remove('hidden');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('agentSimUser');
    document.getElementById('nav-admin').classList.add('hidden');
    document.getElementById('nav-admin-mobile').classList.add('hidden');
    document.getElementById('profile-dropdown').classList.add('hidden');
    
    switchTab('home');
    showToast('Logged out successfully.');

    const standardButton = `<button onclick="document.getElementById('auth-modal').classList.remove('hidden')" class="w-full md:w-auto btn-cartoon px-6 py-2 pop-in">Login</button>`;
    document.getElementById('user-controls').innerHTML = standardButton;
    document.getElementById('user-controls-mobile').innerHTML = standardButton;

    document.getElementById('review-auth-block').classList.remove('hidden');
    document.getElementById('review-form').classList.add('hidden');
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
    document.getElementById('edit-profile-name').value = p.displayName || '';
    document.getElementById('edit-profile-age').value = p.age || '';
    document.getElementById('edit-profile-email').value = p.email || '';
    document.getElementById('edit-profile-desc').value = p.desc || '';
    document.getElementById('edit-profile-inspired').value = p.inspired || '';
    document.getElementById('edit-profile-discord').value = p.discord || '';
    document.getElementById('edit-profile-youtube').value = p.youtube || '';
    document.getElementById('edit-profile-support').value = p.support || '';
}

function handleProfileEdit(e) {
    e.preventDefault();
    const logoInput = document.getElementById('edit-profile-logo-file');
    
    const finalizeProfileSave = (logoBase64) => {
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
        saveSiteData();
        renderData();
        showToast('Profile Settings Updated!', 'success');
    };

    if (logoInput.files && logoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(evt) { finalizeProfileSave(evt.target.result); };
        reader.readAsDataURL(logoInput.files[0]);
    } else {
        finalizeProfileSave(null);
    }
}

function handleHomeEdit(e) {
    e.preventDefault();
    const fileInput = document.getElementById('edit-home-img-file');
    
    const finalizeHomeEdit = (imgData) => {
        siteData.homeSettings = {
            badge1: document.getElementById('edit-badge1').value,
            title1: document.getElementById('edit-title1').value,
            title2: document.getElementById('edit-title2').value,
            desc: document.getElementById('edit-desc').value,
            btnText: document.getElementById('edit-btn-text').value,
            badge2: document.getElementById('edit-badge2').value,
            imgUrl: imgData || siteData.homeSettings.imgUrl || 'hero-showcase.png',
            stat1Title: document.getElementById('edit-stat1-title').value,
            stat1Desc: document.getElementById('edit-stat1-desc').value,
            stat2Title: document.getElementById('edit-stat2-title').value,
            stat2Desc: document.getElementById('edit-stat2-desc').value,
            stat3Title: document.getElementById('edit-stat3-title').value,
            stat3Desc: document.getElementById('edit-stat3-desc').value,
            stat4Title: document.getElementById('edit-stat4-title').value,
            stat4Desc: document.getElementById('edit-stat4-desc').value
        };

        saveSiteData();
        renderData();
        showToast('Home Page Configuration Updated!', 'success');
    };

    if (fileInput.files && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(evt) { finalizeHomeEdit(evt.target.result); };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeHomeEdit(null);
    }
}

function handleSupportMail(e) {
    e.preventDefault();
    siteData.messages.push({ 
        name: document.getElementById('sup-name').value, 
        email: document.getElementById('sup-email').value, 
        msg: document.getElementById('sup-msg').value, 
        time: new Date().toLocaleTimeString() 
    });
    saveSiteData();
    showToast('Sent to Admin!', 'success');
    document.getElementById('support-form').reset();
    document.getElementById('msg-char-counter').innerText = '0 / 500';
    renderMessages();
}

function clearAllMails() {
    if(confirm("Are you sure you want to delete all messages permanently?")) {
        siteData.messages = [];
        saveSiteData();
        renderMessages();
        showToast('All messages deleted!', 'success');
    }
}

function renderMessages() {
    const container = document.getElementById('admin-messages-container');
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
        const uploadInterval = setInterval(() => {
            progress += 20; progressBar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(uploadInterval);
                if(!siteData[dest]) siteData[dest] = [];
                siteData[dest].push(itemEntry);
                saveSiteData(); 
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

function deleteItem(category, index) {
    if (confirm("Delete this item forever?")) {
        siteData[category].splice(index, 1);
        saveSiteData();
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
    document.getElementById('fullscreen-overlay').classList.add('hidden');
    currentlyViewedAsset = '';
}

function handleReviewSubmit(e) {
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

    saveSiteData();
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
            <img src="${rev.profileImg || fallbackMainLogo}" class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm">
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
    const h = siteData.homeSettings;
    const p = siteData.profile;

    // Header Elements
    document.getElementById('nav-logo').src = p.logo || fallbackMainLogo;
    document.getElementById('nav-display-name').innerText = p.displayName || 'Agent Simulator';

    // About Me Elements
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
        document.getElementById('about-link-support').href = '#';
        document.getElementById('about-link-support').onclick = function(e){ e.preventDefault(); switchTab('support'); };
    }

    // Home Editor Elements
    document.getElementById('display-home-badge1').innerText = h.badge1 || '';
    document.getElementById('display-home-title1').innerText = h.title1 || '';
    document.getElementById('display-home-title2').innerText = h.title2 || '';
    document.getElementById('display-home-desc').innerText = h.desc || '';
    document.getElementById('display-home-btn').innerText = h.btnText || '';
    document.getElementById('display-home-badge2').innerText = h.badge2 || '';
    document.getElementById('display-home-img').src = h.imgUrl || 'hero-showcase.png';

    document.getElementById('display-stat1-title').innerText = h.stat1Title || '';
    document.getElementById('display-stat1-desc').innerText = h.stat1Desc || '';
    document.getElementById('display-stat2-title').innerText = h.stat2Title || '';
    document.getElementById('display-stat2-desc').innerText = h.stat2Desc || '';
    document.getElementById('display-stat3-title').innerText = h.stat3Title || '';
    document.getElementById('display-stat3-desc').innerText = h.stat3Desc || '';
    document.getElementById('display-stat4-title').innerText = h.stat4Title || '';
    document.getElementById('display-stat4-desc').innerText = h.stat4Desc || '';

    // Assets Tab
    if(!siteData['studio-assets']) siteData['studio-assets'] = [];
    const filteredAssets = siteData['studio-assets'].filter(item => 
        currentCategoryFilter === 'All' || item.category === currentCategoryFilter
    );

    if(filteredAssets.length === 0) {
        document.getElementById('assets-container').innerHTML = `<p class="text-gray-500 font-medium col-span-full py-4 text-center">No items found in this category.</p>`;
    } else {
        document.getElementById('assets-container').innerHTML = filteredAssets.map((item, index) => {
            const actualIndex = siteData['studio-assets'].indexOf(item);
            return `
            <div class="glass-card overflow-hidden hover-pop pop-in delay-${(index % 3) + 1} relative group flex flex-col cursor-pointer" onclick="expandAssetView('${item.img}', '${item.title}', '${item.desc}', '${item.category}')">
                ${isAdmin ? `<button onclick="event.stopPropagation(); deleteItem('studio-assets', ${actualIndex})" class="absolute top-3 left-3 bg-red-500/90 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-sm z-10 hover:bg-red-600 transition backdrop-blur-sm"><i class="fa-solid fa-trash mr-1"></i> Delete</button>` : ''}
                <div class="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-1 text-xs font-bold shadow-sm z-10 border border-gray-200 dark:border-gray-700">${item.category}</div>
                <img src="${item.img}" class="w-full h-48 object-cover">
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

    // Achievements Tab
    if(!siteData.achievement) siteData.achievement = [];
    document.getElementById('achievements-container').innerHTML = siteData.achievement.map((item, index) => `
        <div class="glass-card p-6 relative hover-pop pop-in delay-${(index % 3) + 1}">
            ${isAdmin ? `<button onclick="deleteItem('achievement', ${index})" class="absolute top-4 left-4 bg-red-500/90 text-white rounded-lg px-3 py-1 text-sm font-bold shadow-sm z-20 hover:bg-red-600 transition backdrop-blur-sm"><i class="fa-solid fa-trash mr-1"></i> Delete</button>` : ''}
            <div class="absolute -top-5 -right-4 bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md z-10 text-white">
                <i class="fa-solid fa-trophy"></i>
            </div>
            <img src="${item.img}" class="w-full h-48 object-cover rounded-xl shadow-sm mb-5">
            <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">${item.title}</h3>
            <p class="font-medium text-gray-600 dark:text-gray-400 text-sm">${item.desc}</p>
        </div>
    `).join('');

    // YouTube Tab
    if(!siteData.youtube) siteData.youtube = [];
    document.getElementById('youtube-container').innerHTML = siteData.youtube.map((item, index) => {
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