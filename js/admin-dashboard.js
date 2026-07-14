/* ============================================================
   SREE DVR BROADBAND - ADMIN PORTAL logic (CRUD CMS, SECURITY & LEADS)
   ============================================================ */

import { DVR_SEED_DATA } from './seed-data.js';
import { initializeFirebase, saveFirebaseConfig, clearFirebaseConfig, getStoredConfig, auth, db, isFirebaseReady } from './firebase-config.js';

// Local storage session key for admin auth
const AUTH_SESSION_KEY = "dvr_admin_session";

// State pointers (Syncs live Firestore or local cache)
let dbPlans = [...DVR_SEED_DATA.plans];
let dbOffers = [...DVR_SEED_DATA.offers];
let dbBanners = [...DVR_SEED_DATA.heroBanners];
let dbCoverage = [...DVR_SEED_DATA.coverage];
let dbTestimonials = [...DVR_SEED_DATA.testimonials];
let dbFaqs = [...DVR_SEED_DATA.faq];
let dbSettings = { ...DVR_SEED_DATA.settings };
let dbEnquiries = [];

// Track active mode
let isDemoMode = !isFirebaseReady;

document.addEventListener("DOMContentLoaded", () => {
    initAdmin();
});

async function initAdmin() {
    // 1. Initialize Firebase connector
    checkFirebaseConnStatus();

    // 2. Auth check
    checkSessionState();

    // 3. Attach actions to window for form buttons
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.switchAdminTab = switchAdminTab;
    window.saveFirebaseCredentials = saveFirebaseCredentials;
    window.resetFirebaseCredentials = resetFirebaseCredentials;
    window.openConfigModal = () => switchAdminTab('firebase-conn');
    
    // CRM Enquiries Action bindings
    window.filterLeads = filterLeads;
    window.updateLeadStatus = updateLeadStatus;
    window.deleteLead = deleteLead;
    window.exportLeadsCSV = exportLeadsCSV;

    // Plans CRUD
    window.openAddPlanModal = openAddPlanModal;
    window.openEditPlanModal = openEditPlanModal;
    window.savePlanData = savePlanData;
    window.duplicatePlan = duplicatePlan;
    window.deletePlan = deletePlan;

    // Banners CRUD
    window.openAddBannerModal = openAddBannerModal;
    window.openEditBannerModal = openEditBannerModal;
    window.saveBannerData = saveBannerData;
    window.deleteBanner = deleteBanner;

    // Coverage CRUD
    window.openAddCoverageModal = openAddCoverageModal;
    window.openEditCoverageModal = openEditCoverageModal;
    window.saveCoverageData = saveCoverageData;
    window.deleteCoverage = deleteCoverage;

    // Testimonial CRUD
    window.openAddTestimonialModal = openAddTestimonialModal;
    window.openEditTestimonialModal = openEditTestimonialModal;
    window.saveTestimonialData = saveTestimonialData;
    window.deleteTestimonial = deleteTestimonial;

    // FAQs CRUD
    window.openAddFaqModal = openAddFaqModal;
    window.openEditFaqModal = openEditFaqModal;
    window.saveFaqData = saveFaqData;
    window.deleteFaq = deleteFaq;

    // Settings
    window.saveSiteSettings = saveSiteSettings;
    window.saveRibbonSettings = saveRibbonSettings;

    // Close Modal helper
    window.closeModal = closeModal;
}

// ------------------------------------------------------------
// Firebase Connection & Alert logic
// ------------------------------------------------------------
function checkFirebaseConnStatus() {
    const alertBanner = document.getElementById("configAlertBanner");
    const liveBadge = document.getElementById("liveStatusBadge");

    if (!isFirebaseReady) {
        isDemoMode = true;
        if (alertBanner) alertBanner.style.display = "flex";
        if (liveBadge) {
            liveBadge.className = "status-badge badge-pending";
            liveBadge.textContent = "Demo fallbacks active";
        }
    } else {
        isDemoMode = false;
        if (alertBanner) alertBanner.style.display = "none";
        if (liveBadge) {
            liveBadge.className = "status-badge badge-closed";
            liveBadge.textContent = "Cloud Firestore Live";
        }
    }
}

// ------------------------------------------------------------
// Authentication Sessions Checks
// ------------------------------------------------------------
function checkSessionState() {
    const portal = document.getElementById("loginPortal");
    const layout = document.getElementById("adminLayout");
    const userEmailText = document.getElementById("adminUserEmail");

    const session = sessionStorage.getItem(AUTH_SESSION_KEY);

    if (session) {
        // Authenticated
        if (portal) portal.style.display = "none";
        if (layout) layout.style.display = "flex";
        if (userEmailText) userEmailText.textContent = session;
        
        // Sync lists and load layouts
        syncCMSData();
    } else {
        // Unauthorized
        if (portal) portal.style.display = "flex";
        if (layout) layout.style.display = "none";
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPassword").value;

    if (isDemoMode) {
        // Local validation logic
        if (email === "admin@dvrbroadband.com" && pass === "admin") {
            sessionStorage.setItem(AUTH_SESSION_KEY, email);
            checkSessionState();
        } else {
            alert("Invalid demo credentials! Use admin@dvrbroadband.com / admin");
        }
    } else {
        // Firebase Authentication
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, pass);
            // Verify if user is an admin document inside the database collection
            const adminDoc = await db.collection("admins").doc(userCredential.user.uid).get();
            
            if (adminDoc.exists || email === "admin@dvrbroadband.com") { // Backup credential check
                sessionStorage.setItem(AUTH_SESSION_KEY, email);
                checkSessionState();
            } else {
                await auth.signOut();
                alert("Unauthorized Access. Email is not listed in the admins database.");
            }
        } catch (e) {
            alert("Firebase Authentication Error: " + e.message);
        }
    }
}

function handleLogout() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    if (!isDemoMode && auth) {
        auth.signOut();
    }
    checkSessionState();
}

// ------------------------------------------------------------
// Tab Switching logic
// ------------------------------------------------------------
function switchAdminTab(tabName, linkEl = null) {
    // 1. Hide all panels
    document.querySelectorAll(".admin-tab-content").forEach(el => el.style.display = "none");
    
    // 2. Active class toggles
    document.querySelectorAll(".sidebar-link").forEach(el => el.classList.remove("active"));
    
    // 3. Show correct panel
    const targetPanel = document.getElementById(`tab-${tabName}`);
    if (targetPanel) {
        targetPanel.style.display = "block";
    }
    
    if (linkEl) {
        linkEl.classList.add("active");
    }

    // Set top title
    const topTitle = document.getElementById("panelTabTitle");
    if (topTitle) {
        topTitle.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1).replace('-', ' ') + " Management";
    }

    // specific renders on tab view
    if (tabName === 'dashboard' || tabName === 'enquiries') {
        renderEnquiriesTable();
    }
    if (tabName === 'plans') {
        renderPlansTable();
    }
    if (tabName === 'offers') {
        prefillOffersForm();
    }
    if (tabName === 'banners') {
        renderBannersTable();
    }
    if (tabName === 'coverage') {
        renderCoverageTable();
    }
    if (tabName === 'testimonials') {
        renderTestimonialsTable();
    }
    if (tabName === 'faqs') {
        renderFaqTable();
    }
    if (tabName === 'settings') {
        prefillSettingsForm();
    }
    if (tabName === 'firebase-conn') {
        prefillFirebaseConfigForm();
    }
}

// ------------------------------------------------------------
// CMS Syncing & CRUD Builders
// ------------------------------------------------------------
async function syncCMSData() {
    if (isDemoMode) {
        // Pull enquiries list from local storage fallback
        try {
            const stored = localStorage.getItem("dvr_local_enquiries");
            dbEnquiries = stored ? JSON.parse(stored) : [];
        } catch (e) {
            dbEnquiries = [];
        }
        
        // Setup default plans local cache if not set
        if (!localStorage.getItem("dvr_local_plans")) {
            localStorage.setItem("dvr_local_plans", JSON.stringify(dbPlans));
        } else {
            dbPlans = JSON.parse(localStorage.getItem("dvr_local_plans"));
        }
    } else {
        // Live pulls
        try {
            const plansSnap = await db.collection("plans").orderBy("displayOrder", "asc").get();
            dbPlans = plansSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const enquiriesSnap = await db.collection("enquiries").orderBy("date", "desc").get();
            dbEnquiries = enquiriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const offerSnap = await db.collection("offers").get();
            if (!offerSnap.empty) dbOffers = offerSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const bannersSnap = await db.collection("hero_banners").orderBy("order", "asc").get();
            dbBanners = bannersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const covSnap = await db.collection("coverage").get();
            dbCoverage = covSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const tstSnap = await db.collection("testimonials").get();
            dbTestimonials = tstSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const faqSnap = await db.collection("faq").orderBy("order", "asc").get();
            dbFaqs = faqSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const settingsSnap = await db.collection("settings").doc("site_settings").get();
            if (settingsSnap.exists) dbSettings = settingsSnap.data();
        } catch (e) {
            console.error("Firestore sync error", e);
        }
    }

    // Update Dashboard counter stats
    renderDashboardStats();
}

function renderDashboardStats() {
    const totalEl = document.getElementById("statTotalEnquiries");
    const todayEl = document.getElementById("statTodayEnquiries");
    const pendingEl = document.getElementById("statPendingEnquiries");

    if (totalEl) totalEl.textContent = dbEnquiries.length;
    
    // Filter today's leads
    const todayStr = new Date().toISOString().split("T")[0];
    const todayCount = dbEnquiries.filter(e => e.date && e.date.startsWith(todayStr)).length;
    if (todayEl) todayEl.textContent = todayCount;

    // Filter pending
    const pendingCount = dbEnquiries.filter(e => e.status === "Pending").length;
    if (pendingEl) pendingEl.textContent = pendingCount;

    // Populate recent enquiries
    const recentBody = document.getElementById("recentLeadsTableBody");
    if (recentBody) {
        recentBody.innerHTML = "";
        const recent = dbEnquiries.slice(0, 5);
        
        if (recent.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No leads found. Use connection checker/booking form on Home page to submit leads.</td></tr>`;
            return;
        }

        recent.forEach(lead => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${lead.name}</strong></td>
                <td>${lead.phone}</td>
                <td>${lead.area}</td>
                <td>${lead.plan}</td>
                <td>${new Date(lead.date).toLocaleDateString()}</td>
                <td><span class="status-badge badge-${lead.status.toLowerCase()}">${lead.status}</span></td>
            `;
            recentBody.appendChild(tr);
        });
    }
}

// ------------------------------------------------------------
// Leads Manager Tab
// ------------------------------------------------------------
function renderEnquiriesTable() {
    const allBody = document.getElementById("allLeadsTableBody");
    if (!allBody) return;

    allBody.innerHTML = "";
    if (dbEnquiries.length === 0) {
        allBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No enquiries found.</td></tr>`;
        return;
    }

    dbEnquiries.forEach(lead => {
        const tr = document.createElement("tr");
        tr.id = `lead-row-${lead.id || lead.date}`;
        tr.innerHTML = `
            <td><strong>${lead.name}</strong></td>
            <td>${lead.phone} <br><span style="font-size:0.75rem;color:var(--gray-500);">${lead.email || 'No Email'}</span></td>
            <td>${lead.area}</td>
            <td>${lead.plan} <br><span style="font-size:0.75rem;color:var(--gray-500);">${lead.source || 'Direct'}</span></td>
            <td>${lead.preferredContact || 'Phone'}</td>
            <td>${new Date(lead.date).toLocaleString()}</td>
            <td>
                <select onchange="updateLeadStatus('${lead.id || ''}', '${lead.date}', this.value)" class="form-control" style="padding:4px; font-size:0.8rem;">
                    <option value="Pending" ${lead.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </td>
            <td>
                <button onclick="deleteLead('${lead.id || ''}', '${lead.date}')" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;"><span class="material-icons" style="font-size:16px;">delete</span></button>
            </td>
        `;
        allBody.appendChild(tr);
    });
}

// Leads Filters
function filterLeads() {
    const search = document.getElementById("leadSearchInput").value.toLowerCase();
    const status = document.getElementById("leadStatusFilter").value;
    const allBody = document.getElementById("allLeadsTableBody");
    if (!allBody) return;

    allBody.innerHTML = "";
    const filtered = dbEnquiries.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(search) || 
                              lead.phone.includes(search) || 
                              lead.area.toLowerCase().includes(search) ||
                              lead.plan.toLowerCase().includes(search);
        const matchesStatus = status === 'All' || lead.status === status;
        return matchesSearch && matchesStatus;
    });

    filtered.forEach(lead => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${lead.name}</strong></td>
            <td>${lead.phone} <br><span style="font-size:0.75rem;color:var(--gray-500);">${lead.email || 'No Email'}</span></td>
            <td>${lead.area}</td>
            <td>${lead.plan} <br><span style="font-size:0.75rem;color:var(--gray-500);">${lead.source || 'Direct'}</span></td>
            <td>${lead.preferredContact || 'Phone'}</td>
            <td>${new Date(lead.date).toLocaleString()}</td>
            <td>
                <select onchange="updateLeadStatus('${lead.id || ''}', '${lead.date}', this.value)" class="form-control" style="padding:4px; font-size:0.8rem;">
                    <option value="Pending" ${lead.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
                </select>
            </td>
            <td>
                <button onclick="deleteLead('${lead.id || ''}', '${lead.date}')" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;"><span class="material-icons" style="font-size:16px;">delete</span></button>
            </td>
        `;
        allBody.appendChild(tr);
    });
}

// Update lead status
async function updateLeadStatus(id, date, newStatus) {
    if (isDemoMode) {
        dbEnquiries = dbEnquiries.map(e => (e.date === date ? { ...e, status: newStatus } : e));
        localStorage.setItem("dvr_local_enquiries", JSON.stringify(dbEnquiries));
        syncCMSData();
        showCustomNotification("✅ Status Updated", "Lead status updated locally.");
    } else {
        try {
            await db.collection("enquiries").doc(id).update({ status: newStatus });
            syncCMSData();
            showCustomNotification("✅ Status Updated", "Lead status synced to Cloud Firestore.");
        } catch (e) {
            alert("Error updating lead status in Firestore: " + e.message);
        }
    }
}

// Delete Lead
async function deleteLead(id, date) {
    if (!confirm("Are you sure you want to delete this enquiry lead?")) return;

    if (isDemoMode) {
        dbEnquiries = dbEnquiries.filter(e => e.date !== date);
        localStorage.setItem("dvr_local_enquiries", JSON.stringify(dbEnquiries));
        syncCMSData();
        filterLeads();
        showCustomNotification("🗑 Lead Deleted", "Lead deleted from Local Storage.");
    } else {
        try {
            await db.collection("enquiries").doc(id).delete();
            syncCMSData();
            filterLeads();
            showCustomNotification("🗑 Lead Deleted", "Lead deleted from Cloud Firestore.");
        } catch (e) {
            alert("Firestore delete error: " + e.message);
        }
    }
}

// CSV Leads Exporter
function exportLeadsCSV() {
    if (dbEnquiries.length === 0) {
        alert("No leads available to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Phone,Email,Area,Plan,Source,PreferredContact,Date,Status\n";

    dbEnquiries.forEach(e => {
        const row = [
            `"${e.name.replace(/"/g, '""')}"`,
            `"${e.phone}"`,
            `"${e.email || ''}"`,
            `"${e.area.replace(/"/g, '""')}"`,
            `"${e.plan}"`,
            `"${e.source || ''}"`,
            `"${e.preferredContact || ''}"`,
            `"${e.date}"`,
            `"${e.status}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DVR_Broadband_Leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ------------------------------------------------------------
// Dynamic Plans CRUD CMS Module
// ------------------------------------------------------------
function renderPlansTable() {
    const body = document.getElementById("adminPlansTableBody");
    if (!body) return;
    body.innerHTML = "";

    dbPlans.forEach(plan => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${plan.name}</strong> ${plan.popular ? '<span class="status-badge badge-closed">Popular</span>' : ''}</td>
            <td>${plan.speed}</td>
            <td>₹${plan.price}</td>
            <td>₹${plan.deposit}</td>
            <td>${plan.planType}</td>
            <td>${plan.dishType || 'No IPTV'}</td>
            <td><span class="status-badge ${plan.active ? 'badge-closed' : 'badge-pending'}">${plan.active ? 'Active' : 'Disabled'}</span></td>
            <td>
                <button onclick="openEditPlanModal('${plan.id || ''}', ${plansList.indexOf(plan)})" class="btn btn-primary btn-sm"><span class="material-icons" style="font-size:16px;">edit</span></button>
                <button onclick="duplicatePlan(${plansList.indexOf(plan)})" class="btn btn-accent btn-sm" title="Duplicate Plan"><span class="material-icons" style="font-size:16px;">content_copy</span></button>
                <button onclick="deletePlan('${plan.id || ''}', ${plansList.indexOf(plan)})" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;"><span class="material-icons" style="font-size:16px;">delete</span></button>
            </td>
        `;
        body.appendChild(tr);
    });
}

function openAddPlanModal() {
    const modal = document.getElementById("planModal");
    const form = document.getElementById("planForm");
    const title = document.getElementById("planModalTitle");
    
    if (modal && form) {
        form.reset();
        document.getElementById("editPlanId").value = "";
        if (title) title.textContent = "Create Broadband Package";
        modal.classList.add("active");
    }
}

function openEditPlanModal(id, localIdx) {
    const modal = document.getElementById("planModal");
    const form = document.getElementById("planForm");
    const title = document.getElementById("planModalTitle");
    
    if (modal && form) {
        const plan = dbPlans[localIdx];
        document.getElementById("editPlanId").value = id || localIdx.toString();
        document.getElementById("planFormName").value = plan.name;
        document.getElementById("planFormSpeed").value = plan.speed;
        document.getElementById("planFormPrice").value = plan.price;
        document.getElementById("planFormDeposit").value = plan.deposit;
        document.getElementById("planFormType").value = plan.planType;
        document.getElementById("planFormDish").value = plan.dishType || "";
        document.getElementById("planFormBest").value = plan.bestFor || "";
        document.getElementById("planFormFeatures").value = plan.features.join("\n");
        document.getElementById("planFormPopular").checked = plan.popular;
        document.getElementById("planFormActive").checked = plan.active;

        if (title) title.textContent = `Edit plan: ${plan.name}`;
        modal.classList.add("active");
    }
}

async function savePlanData(event) {
    event.preventDefault();
    const id = document.getElementById("editPlanId").value;
    
    const name = document.getElementById("planFormName").value.trim();
    const speed = document.getElementById("planFormSpeed").value.trim();
    const price = parseInt(document.getElementById("planFormPrice").value);
    const deposit = parseInt(document.getElementById("planFormDeposit").value);
    const planType = document.getElementById("planFormType").value;
    const dishType = document.getElementById("planFormDish").value.trim();
    const bestFor = document.getElementById("planFormBest").value.trim();
    const features = document.getElementById("planFormFeatures").value.split("\n").map(f => f.trim()).filter(f => f.length > 0);
    const popular = document.getElementById("planFormPopular").checked;
    const active = document.getElementById("planFormActive").checked;

    const planData = {
        name,
        speed,
        price,
        deposit,
        planType,
        dishType,
        bestFor,
        features,
        popular,
        active,
        displayOrder: dbPlans.length + 1
    };

    if (isDemoMode) {
        if (id !== "") {
            // Edit
            if (isNaN(id)) {
                // mock update
                dbPlans = dbPlans.map(p => p.id === id ? { ...p, ...planData } : p);
            } else {
                dbPlans[parseInt(id)] = { ...dbPlans[parseInt(id)], ...planData };
            }
        } else {
            // Create
            planData.id = "plan-" + Date.now();
            dbPlans.push(planData);
        }
        localStorage.setItem("dvr_local_plans", JSON.stringify(dbPlans));
        closeModal("planModal");
        renderPlansTable();
        showCustomNotification("✅ Plan Saved", "Plan configuration updated locally.");
    } else {
        try {
            if (id !== "") {
                await db.collection("plans").doc(id).update(planData);
            } else {
                await db.collection("plans").add(planData);
            }
            await syncCMSData();
            closeModal("planModal");
            renderPlansTable();
            showCustomNotification("✅ Plan Saved", "Plan configuration synced to Cloud Firestore.");
        } catch (e) {
            alert("Error writing to Firestore: " + e.message);
        }
    }
}

function duplicatePlan(idx) {
    const original = dbPlans[idx];
    const dup = { ...original };
    dup.name = `${original.name} (Copy)`;
    dup.popular = false;
    dup.id = "plan-" + Date.now();
    dup.displayOrder = dbPlans.length + 1;
    
    dbPlans.push(dup);
    if (isDemoMode) {
        localStorage.setItem("dvr_local_plans", JSON.stringify(dbPlans));
        renderPlansTable();
    } else {
        db.collection("plans").add(dup).then(() => {
            syncCMSData().then(() => renderPlansTable());
        });
    }
    showCustomNotification("📋 Plan Duplicated", "New package copy generated.");
}

async function deletePlan(id, idx) {
    if (!confirm("Are you sure you want to delete this broadband plan?")) return;

    if (isDemoMode) {
        dbPlans.splice(idx, 1);
        localStorage.setItem("dvr_local_plans", JSON.stringify(dbPlans));
        renderPlansTable();
        showCustomNotification("🗑 Plan Deleted", "Plan configuration removed.");
    } else {
        try {
            await db.collection("plans").doc(id).delete();
            await syncCMSData();
            renderPlansTable();
            showCustomNotification("🗑 Plan Deleted", "Plan configuration removed from Firestore.");
        } catch (e) {
            alert("Firestore delete error: " + e.message);
        }
    }
}

// ------------------------------------------------------------
// Offers Ribbon CMS Module
// ------------------------------------------------------------
function prefillOffersForm() {
    const activeOffer = dbOffers.find(o => o.visible) || dbOffers[0];
    if (!activeOffer) return;

    document.getElementById("offerText").value = activeOffer.text;
    document.getElementById("offerCtaText").value = activeOffer.ctaText || "";
    document.getElementById("offerCtaUrl").value = activeOffer.ctaUrl || "";
    document.getElementById("offerColor").value = activeOffer.color || "#F7941D";
    
    const radios = document.getElementsByName("offerVisible");
    radios.forEach(r => {
        r.checked = (r.value === "true") === activeOffer.visible;
    });
}

async function saveRibbonSettings(event) {
    event.preventDefault();
    const text = document.getElementById("offerText").value.trim();
    const ctaText = document.getElementById("offerCtaText").value.trim();
    const ctaUrl = document.getElementById("offerCtaUrl").value.trim();
    const color = document.getElementById("offerColor").value;
    const visible = document.querySelector('input[name="offerVisible"]:checked').value === "true";

    const offerData = { text, ctaText, ctaUrl, color, visible, priority: 1 };

    if (isDemoMode) {
        dbOffers[0] = { ...dbOffers[0], ...offerData };
        showCustomNotification("✅ Ribbon Saved", "Promotional ribbon details updated locally.");
    } else {
        try {
            const firstDoc = dbOffers[0];
            if (firstDoc && firstDoc.id) {
                await db.collection("offers").doc(firstDoc.id).set(offerData);
            } else {
                await db.collection("offers").add(offerData);
            }
            await syncCMSData();
            showCustomNotification("✅ Ribbon Saved", "Ribbon details synced to Cloud Firestore.");
        } catch (e) {
            alert("Firestore write error: " + e.message);
        }
    }
}

// ------------------------------------------------------------
// Hero Slider Banners CMS
// ------------------------------------------------------------
function renderBannersTable() {
    const body = document.getElementById("adminBannersTableBody");
    if (!body) return;
    body.innerHTML = "";

    dbBanners.forEach(banner => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${banner.order}</td>
            <td><strong>${banner.badge || 'None'}</strong></td>
            <td>${banner.title}</td>
            <td><span style="font-size:0.75rem; color:var(--gray-500);">${banner.image.slice(0, 45)}...</span></td>
            <td><span class="status-badge ${banner.visible ? 'badge-closed' : 'badge-pending'}">${banner.visible ? 'Visible' : 'Hidden'}</span></td>
            <td>
                <button onclick="openEditBannerModal('${banner.id || ''}', ${dbBanners.indexOf(banner)})" class="btn btn-primary btn-sm"><span class="material-icons" style="font-size:16px;">edit</span></button>
                <button onclick="deleteBanner('${banner.id || ''}', ${dbBanners.indexOf(banner)})" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;"><span class="material-icons" style="font-size:16px;">delete</span></button>
            </td>
        `;
        body.appendChild(tr);
    });
}

function openAddBannerModal() {
    const modal = document.getElementById("bannerModal");
    if (modal) {
        document.getElementById("bannerForm").reset();
        document.getElementById("editBannerId").value = "";
        document.getElementById("bannerModalTitle").textContent = "Create Slider Banner";
        modal.classList.add("active");
    }
}

function openEditBannerModal(id, localIdx) {
    const modal = document.getElementById("bannerModal");
    if (modal) {
        const banner = dbBanners[localIdx];
        document.getElementById("editBannerId").value = id || localIdx.toString();
        document.getElementById("bannerFormTitle").value = banner.title;
        document.getElementById("bannerFormSubtitle").value = banner.subtitle;
        document.getElementById("bannerFormImage").value = banner.image;
        document.getElementById("bannerFormBadge").value = banner.badge || "";
        document.getElementById("bannerFormOrder").value = banner.order;
        document.getElementById("bannerModalTitle").textContent = `Edit Banner: ${banner.title}`;
        modal.classList.add("active");
    }
}

async function saveBannerData(event) {
    event.preventDefault();
    const id = document.getElementById("editBannerId").value;
    
    const title = document.getElementById("bannerFormTitle").value.trim();
    const subtitle = document.getElementById("bannerFormSubtitle").value.trim();
    const image = document.getElementById("bannerFormImage").value.trim();
    const badge = document.getElementById("bannerFormBadge").value.trim();
    const order = parseInt(document.getElementById("bannerFormOrder").value);

    const bannerData = { title, subtitle, image, badge, order, visible: true };

    if (isDemoMode) {
        if (id !== "") {
            if (isNaN(id)) {
                dbBanners = dbBanners.map(b => b.id === id ? { ...b, ...bannerData } : b);
            } else {
                dbBanners[parseInt(id)] = { ...dbBanners[parseInt(id)], ...bannerData };
            }
        } else {
            bannerData.id = "banner-" + Date.now();
            dbBanners.push(bannerData);
        }
        closeModal("bannerModal");
        renderBannersTable();
        showCustomNotification("✅ Banner Saved", "Banner details saved locally.");
    } else {
        try {
            if (id !== "") {
                await db.collection("hero_banners").doc(id).update(bannerData);
            } else {
                await db.collection("hero_banners").add(bannerData);
            }
            await syncCMSData();
            closeModal("bannerModal");
            renderBannersTable();
            showCustomNotification("✅ Banner Saved", "Banner details synced to Firestore.");
        } catch (e) {
            alert("Firestore write error: " + e.message);
        }
    }
}

async function deleteBanner(id, idx) {
    if (!confirm("Are you sure you want to delete this hero slider banner?")) return;

    if (isDemoMode) {
        dbBanners.splice(idx, 1);
        renderBannersTable();
        showCustomNotification("🗑 Banner Deleted", "Banner removed.");
    } else {
        try {
            await db.collection("hero_banners").doc(id).delete();
            await syncCMSData();
            renderBannersTable();
            showCustomNotification("🗑 Banner Deleted", "Banner removed from Firestore.");
        } catch (e) {
            alert("Firestore delete error: " + e.message);
        }
    }
}

// ------------------------------------------------------------
// Coverage Areas CRUD CMS
// ------------------------------------------------------------
function renderCoverageTable() {
    const body = document.getElementById("adminCoverageTableBody");
    if (!body) return;
    body.innerHTML = "";

    dbCoverage.forEach(cov => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${cov.area}</strong></td>
            <td>${cov.city}</td>
            <td>${cov.mandal || 'Kurnool'}</td>
            <td>${cov.district}</td>
            <td><span class="status-badge ${cov.status === 'available' ? 'badge-closed' : 'badge-pending'}">${cov.status}</span></td>
            <td>
                <button onclick="openEditCoverageModal('${cov.id || ''}', ${dbCoverage.indexOf(cov)})" class="btn btn-primary btn-sm"><span class="material-icons" style="font-size:16px;">edit</span></button>
                <button onclick="deleteCoverage('${cov.id || ''}', ${dbCoverage.indexOf(cov)})" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;"><span class="material-icons" style="font-size:16px;">delete</span></button>
            </td>
        `;
        body.appendChild(tr);
    });
}

function openAddCoverageModal() {
    const modal = document.getElementById("coverageModal");
    if (modal) {
        document.getElementById("coverageForm").reset();
        document.getElementById("editCoverageId").value = "";
        document.getElementById("coverageModalTitle").textContent = "Add Feasibility Location";
        modal.classList.add("active");
    }
}

function openEditCoverageModal(id, localIdx) {
    const modal = document.getElementById("coverageModal");
    if (modal) {
        const cov = dbCoverage[localIdx];
        document.getElementById("editCoverageId").value = id || localIdx.toString();
        document.getElementById("covFormArea").value = cov.area;
        document.getElementById("covFormCity").value = cov.city;
        document.getElementById("covFormMandal").value = cov.mandal || "Kurnool";
        document.getElementById("covFormDist").value = cov.district;
        document.getElementById("covFormStatus").value = cov.status;
        document.getElementById("coverageModalTitle").textContent = `Edit Location: ${cov.area}`;
        modal.classList.add("active");
    }
}

async function saveCoverageData(event) {
    event.preventDefault();
    const id = document.getElementById("editCoverageId").value;
    
    const area = document.getElementById("covFormArea").value.trim();
    const city = document.getElementById("covFormCity").value.trim();
    const mandal = document.getElementById("covFormMandal").value.trim();
    const district = document.getElementById("covFormDist").value.trim();
    const status = document.getElementById("covFormStatus").value;

    const covData = { area, city, mandal, district, status };

    if (isDemoMode) {
        if (id !== "") {
            if (isNaN(id)) {
                dbCoverage = dbCoverage.map(c => c.id === id ? { ...c, ...covData } : c);
            } else {
                dbCoverage[parseInt(id)] = { ...dbCoverage[parseInt(id)], ...covData };
            }
        } else {
            covData.id = "cov-" + Date.now();
            dbCoverage.push(covData);
        }
        closeModal("coverageModal");
        renderCoverageTable();
        showCustomNotification("✅ Location Saved", "Coverage parameters saved locally.");
    } else {
        try {
            if (id !== "") {
                await db.collection("coverage").doc(id).update(covData);
            } else {
                await db.collection("coverage").add(covData);
            }
            await syncCMSData();
            closeModal("coverageModal");
            renderCoverageTable();
            showCustomNotification("✅ Location Saved", "Location details synced to Cloud Firestore.");
        } catch (e) {
            alert("Firestore write error: " + e.message);
        }
    }
}

async function deleteCoverage(id, idx) {
    if (!confirm("Are you sure you want to delete this coverage area?")) return;

    if (isDemoMode) {
        dbCoverage.splice(idx, 1);
        renderCoverageTable();
        showCustomNotification("🗑 Location Deleted", "Area removed.");
    } else {
        try {
            await db.collection("coverage").doc(id).delete();
            await syncCMSData();
            renderCoverageTable();
            showCustomNotification("🗑 Location Deleted", "Area removed from Firestore.");
        } catch (e) {
            alert("Firestore delete error: " + e.message);
        }
    }
}

// ------------------------------------------------------------
// Testimonial CRUD
// ------------------------------------------------------------
function renderTestimonialsTable() {
    const body = document.getElementById("adminTestimonialsTableBody");
    if (!body) return;
    body.innerHTML = "";

    dbTestimonials.forEach(tst => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${tst.name}</strong></td>
            <td>${tst.location}</td>
            <td>${tst.rating} Stars</td>
            <td><span style="font-size:0.8rem;color:var(--gray-500);">${tst.comment.slice(0, 45)}...</span></td>
            <td><span class="status-badge ${tst.visible ? 'badge-closed' : 'badge-pending'}">${tst.visible ? 'Visible' : 'Hidden'}</span></td>
            <td>
                <button onclick="openEditTestimonialModal('${tst.id || ''}', ${dbTestimonials.indexOf(tst)})" class="btn btn-primary btn-sm"><span class="material-icons" style="font-size:16px;">edit</span></button>
                <button onclick="deleteTestimonial('${tst.id || ''}', ${dbTestimonials.indexOf(tst)})" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;"><span class="material-icons" style="font-size:16px;">delete</span></button>
            </td>
        `;
        body.appendChild(tr);
    });
}

function openAddTestimonialModal() {
    const modal = document.getElementById("testimonialModal");
    if (modal) {
        document.getElementById("testimonialForm").reset();
        document.getElementById("editTestimonialId").value = "";
        document.getElementById("testimonialModalTitle").textContent = "Create Customer Feedback";
        modal.classList.add("active");
    }
}

function openEditTestimonialModal(id, localIdx) {
    const modal = document.getElementById("testimonialModal");
    if (modal) {
        const tst = dbTestimonials[localIdx];
        document.getElementById("editTestimonialId").value = id || localIdx.toString();
        document.getElementById("tstFormName").value = tst.name;
        document.getElementById("tstFormLoc").value = tst.location;
        document.getElementById("tstFormRating").value = tst.rating.toString();
        document.getElementById("tstFormComment").value = tst.comment;
        document.getElementById("testimonialModalTitle").textContent = `Edit Feedback: ${tst.name}`;
        modal.classList.add("active");
    }
}

async function saveTestimonialData(event) {
    event.preventDefault();
    const id = document.getElementById("editTestimonialId").value;
    
    const name = document.getElementById("tstFormName").value.trim();
    const location = document.getElementById("tstFormLoc").value.trim();
    const rating = parseInt(document.getElementById("tstFormRating").value);
    const comment = document.getElementById("tstFormComment").value.trim();

    const tstData = { name, location, rating, comment, visible: true };

    if (isDemoMode) {
        if (id !== "") {
            if (isNaN(id)) {
                dbTestimonials = dbTestimonials.map(t => t.id === id ? { ...t, ...tstData } : t);
            } else {
                dbTestimonials[parseInt(id)] = { ...dbTestimonials[parseInt(id)], ...tstData };
            }
        } else {
            tstData.id = "tst-" + Date.now();
            dbTestimonials.push(tstData);
        }
        closeModal("testimonialModal");
        renderTestimonialsTable();
        showCustomNotification("✅ Feedback Saved", "Customer review saved locally.");
    } else {
        try {
            if (id !== "") {
                await db.collection("testimonials").doc(id).update(tstData);
            } else {
                await db.collection("testimonials").add(tstData);
            }
            await syncCMSData();
            closeModal("testimonialModal");
            renderTestimonialsTable();
            showCustomNotification("✅ Feedback Saved", "Review synced to Cloud Firestore.");
        } catch (e) {
            alert("Firestore write error: " + e.message);
        }
    }
}

async function deleteTestimonial(id, idx) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    if (isDemoMode) {
        dbTestimonials.splice(idx, 1);
        renderTestimonialsTable();
        showCustomNotification("🗑 Feedback Deleted", "Review removed.");
    } else {
        try {
            await db.collection("testimonials").doc(id).delete();
            await syncCMSData();
            renderTestimonialsTable();
            showCustomNotification("🗑 Feedback Deleted", "Review removed from Firestore.");
        } catch (e) {
            alert("Firestore delete error: " + e.message);
        }
    }
}

// ------------------------------------------------------------
// FAQs CRUD CMS
// ------------------------------------------------------------
function renderFaqTable() {
    const body = document.getElementById("adminFaqTableBody");
    if (!body) return;
    body.innerHTML = "";

    dbFaqs.forEach(faq => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${faq.order}</td>
            <td><strong>${faq.category}</strong></td>
            <td>${faq.question}</td>
            <td><span style="font-size:0.8rem;color:var(--gray-500);">${faq.answer.slice(0, 45)}...</span></td>
            <td><span class="status-badge ${faq.visible ? 'badge-closed' : 'badge-pending'}">${faq.visible ? 'Visible' : 'Hidden'}</span></td>
            <td>
                <button onclick="openEditFaqModal('${faq.id || ''}', ${dbFaqs.indexOf(faq)})" class="btn btn-primary btn-sm"><span class="material-icons" style="font-size:16px;">edit</span></button>
                <button onclick="deleteFaq('${faq.id || ''}', ${dbFaqs.indexOf(faq)})" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#EF4444;"><span class="material-icons" style="font-size:16px;">delete</span></button>
            </td>
        `;
        body.appendChild(tr);
    });
}

function openAddFaqModal() {
    const modal = document.getElementById("faqModal");
    if (modal) {
        document.getElementById("faqForm").reset();
        document.getElementById("editFaqId").value = "";
        document.getElementById("faqModalTitle").textContent = "Create FAQ Accordion";
        modal.classList.add("active");
    }
}

function openEditFaqModal(id, localIdx) {
    const modal = document.getElementById("faqModal");
    if (modal) {
        const faq = dbFaqs[localIdx];
        document.getElementById("editFaqId").value = id || localIdx.toString();
        document.getElementById("faqFormQuestion").value = faq.question;
        document.getElementById("faqFormAnswer").value = faq.answer;
        document.getElementById("faqFormCat").value = faq.category;
        document.getElementById("faqFormOrder").value = faq.order;
        document.getElementById("faqModalTitle").textContent = `Edit FAQ`;
        modal.classList.add("active");
    }
}

async function saveFaqData(event) {
    event.preventDefault();
    const id = document.getElementById("editFaqId").value;
    
    const question = document.getElementById("faqFormQuestion").value.trim();
    const answer = document.getElementById("faqFormAnswer").value.trim();
    const category = document.getElementById("faqFormCat").value;
    const order = parseInt(document.getElementById("faqFormOrder").value);

    const faqData = { question, answer, category, order, visible: true };

    if (isDemoMode) {
        if (id !== "") {
            if (isNaN(id)) {
                dbFaqs = dbFaqs.map(f => f.id === id ? { ...f, ...faqData } : f);
            } else {
                dbFaqs[parseInt(id)] = { ...dbFaqs[parseInt(id)], ...faqData };
            }
        } else {
            faqData.id = "faq-" + Date.now();
            dbFaqs.push(faqData);
        }
        closeModal("faqModal");
        renderFaqTable();
        showCustomNotification("✅ FAQ Saved", "Accordion question details saved locally.");
    } else {
        try {
            if (id !== "") {
                await db.collection("faq").doc(id).update(faqData);
            } else {
                await db.collection("faq").add(faqData);
            }
            await syncCMSData();
            closeModal("faqModal");
            renderFaqTable();
            showCustomNotification("✅ FAQ Saved", "FAQ details synced to Cloud Firestore.");
        } catch (e) {
            alert("Firestore write error: " + e.message);
        }
    }
}

async function deleteFaq(id, idx) {
    if (!confirm("Are you sure you want to delete this FAQ question?")) return;

    if (isDemoMode) {
        dbFaqs.splice(idx, 1);
        renderFaqTable();
        showCustomNotification("🗑 FAQ Deleted", "Accordion question removed.");
    } else {
        try {
            await db.collection("faq").doc(id).delete();
            await syncCMSData();
            renderFaqTable();
            showCustomNotification("🗑 FAQ Deleted", "FAQ removed from Firestore.");
        } catch (e) {
            alert("Firestore delete error: " + e.message);
        }
    }
}

// ------------------------------------------------------------
// Site Settings CMS
// ------------------------------------------------------------
function prefillSettingsForm() {
    document.getElementById("settingPhone").value = dbSettings.phone;
    document.getElementById("settingWhatsapp").value = dbSettings.whatsapp;
    document.getElementById("settingEmail").value = dbSettings.email;
    document.getElementById("settingHours").value = dbSettings.workingHours;
    document.getElementById("settingAddress").value = dbSettings.address;
    document.getElementById("settingMap").value = dbSettings.googleMapsUrl || "";
    document.getElementById("settingMetaTitle").value = dbSettings.metaTitle || "";
    document.getElementById("settingMetaDesc").value = dbSettings.metaDescription || "";
}

async function saveSiteSettings(event) {
    event.preventDefault();
    const phone = document.getElementById("settingPhone").value.trim();
    const whatsapp = document.getElementById("settingWhatsapp").value.trim();
    const email = document.getElementById("settingEmail").value.trim();
    const workingHours = document.getElementById("settingHours").value.trim();
    const address = document.getElementById("settingAddress").value.trim();
    const googleMapsUrl = document.getElementById("settingMap").value.trim();
    const metaTitle = document.getElementById("settingMetaTitle").value.trim();
    const metaDescription = document.getElementById("settingMetaDesc").value.trim();

    const newSettings = { ...dbSettings, phone, whatsapp, email, workingHours, address, googleMapsUrl, metaTitle, metaDescription };

    if (isDemoMode) {
        dbSettings = newSettings;
        showCustomNotification("✅ Settings Saved", "Site contact details saved locally.");
    } else {
        try {
            await db.collection("settings").doc("site_settings").set(newSettings);
            await syncCMSData();
            showCustomNotification("✅ Settings Saved", "Site contact details synced to Cloud Firestore.");
        } catch (e) {
            alert("Firestore settings error: " + e.message);
        }
    }
}

// ------------------------------------------------------------
// Firebase Connect logic Panel
// ------------------------------------------------------------
function prefillFirebaseConfigForm() {
    const config = getStoredConfig() || {};
    document.getElementById("fbApiKey").value = config.apiKey || "";
    document.getElementById("fbProjId").value = config.projectId || "";
    document.getElementById("fbAuthDomain").value = config.authDomain || "";
    document.getElementById("fbStorageBucket").value = config.storageBucket || "";
    document.getElementById("fbAppId").value = config.appId || "";
}

function saveFirebaseCredentials(event) {
    event.preventDefault();
    const apiKey = document.getElementById("fbApiKey").value.trim();
    const projectId = document.getElementById("fbProjId").value.trim();
    const authDomain = document.getElementById("fbAuthDomain").value.trim() || `${projectId}.firebaseapp.com`;
    const storageBucket = document.getElementById("fbStorageBucket").value.trim() || `${projectId}.appspot.com`;
    const appId = document.getElementById("fbAppId").value.trim() || "";

    const config = { apiKey, projectId, authDomain, storageBucket, appId };

    if (saveFirebaseConfig(config)) {
        alert("Firebase credentials saved successfully! The admin panel will now reload to establish sync connections.");
        window.location.reload();
    } else {
        alert("Error saving credentials to local settings.");
    }
}

function resetFirebaseCredentials() {
    if (confirm("Are you sure you want to clear your Firebase credentials? This will reconnect the local fallback database.")) {
        clearFirebaseConfig();
        window.location.reload();
    }
}

// Close modal helper
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("active");
    }
}
