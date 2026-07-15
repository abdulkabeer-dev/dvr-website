/* ============================================================
   SREE DVR BROADBAND - GLOBAL APP SCRIPT (NAVIGATION, LEAD CMS & MODALS)
   ============================================================ */

import { DVR_SEED_DATA } from './seed-data.js';
import { db, isFirebaseReady } from './firebase-config.js';

// Global Data Store (Holds loaded settings)
export let siteSettings = DVR_SEED_DATA.settings;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // 1. Load Settings (Firestore or Seed Data)
    loadSiteSettings();

    // 2. Mobile Menu Toggle
    setupMobileMenu();

    // 3. Scroll Effects (Sticky Header, Scroll to Top)
    setupScrollEffects();

    // 4. Scroll Animation Observer
    setupScrollAnimations();

    // 5. Check if promotional ribbon should display
    setupPromoRibbon();

    // 6. Attach modals to window for global access
    window.openEnquiryModal = openEnquiryModal;
    window.closeEnquiryModal = closeEnquiryModal;
    window.submitEnquiry = submitEnquiry;
    window.dismissRibbon = dismissRibbon;
    window.scrollToTop = scrollToTop;
}

// ------------------------------------------------------------
// Load Settings
// ------------------------------------------------------------
async function loadSiteSettings() {
    if (isFirebaseReady && db) {
        try {
            const docRef = db.collection("settings").doc("site_settings");
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                siteSettings = docSnap.data();
                console.log("Loaded live settings from Firestore.");
            }
        } catch (e) {
            console.warn("Error reading site settings from Firestore, using seed fallback.", e);
        }
    }
    
    // Apply settings to footer & contact placeholders dynamically
    applySettingsToDOM();
}

function applySettingsToDOM() {
    // Address elements
    const footerAddr = document.querySelector(".footer-contact li span");
    if (footerAddr) footerAddr.textContent = siteSettings.address;
    
    const infoAddr = document.getElementById("infoAddress");
    if (infoAddr) infoAddr.textContent = siteSettings.address;

    // Phone elements
    const footerPhone = document.querySelector(".footer-contact li:nth-child(2) span");
    if (footerPhone) footerPhone.textContent = siteSettings.phone;
    
    const infoPhone = document.getElementById("infoPhone");
    if (infoPhone) infoPhone.textContent = siteSettings.phone;

    // WhatsApp elements
    const footerWa = document.querySelector(".footer-contact li:nth-child(3) span");
    if (footerWa) footerWa.textContent = "+91 " + siteSettings.whatsapp;
    
    const infoWa = document.getElementById("infoWhatsapp");
    if (infoWa) infoWa.textContent = "+91 " + siteSettings.whatsapp;

    // Email elements
    const footerEmail = document.querySelector(".footer-contact li:nth-child(4) span");
    if (footerEmail) footerEmail.textContent = siteSettings.email;
    
    const infoEmail = document.getElementById("infoEmail");
    if (infoEmail) infoEmail.textContent = siteSettings.email;
    
    // Hours elements
    const infoHours = document.getElementById("infoHours");
    if (infoHours) infoHours.textContent = siteSettings.workingHours;

    // Dynamic map iframe inside contact page
    const infoMap = document.getElementById("infoMap");
    if (infoMap && siteSettings.googleMapsUrl) {
        infoMap.src = siteSettings.googleMapsUrl;
    }

    // Brochure URL
    const brochureBtn = document.getElementById("downloadBrochureBtn");
    if (brochureBtn && siteSettings.brochureUrl) {
        brochureBtn.href = siteSettings.brochureUrl;
    }
}

// ------------------------------------------------------------
// Mobile Menu Hamburger Logic
// ------------------------------------------------------------
function setupMobileMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerClose = document.getElementById("drawerClose");
    const drawerOverlay = document.getElementById("drawerOverlay");
    
    function openDrawer() {
        if (mobileDrawer) mobileDrawer.classList.add("open");
        if (drawerOverlay) drawerOverlay.classList.add("open");
        if (menuToggle) menuToggle.classList.add("active");
        document.body.style.overflow = "hidden"; // lock page scroll
    }

    // Exported globally so that modal triggers can call it to dismiss the drawer
    window.closeMobileDrawer = function() {
        if (mobileDrawer) mobileDrawer.classList.remove("open");
        if (drawerOverlay) drawerOverlay.classList.remove("open");
        if (menuToggle) menuToggle.classList.remove("active");
        document.body.style.overflow = ""; // unlock page scroll
    };

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            if (mobileDrawer && mobileDrawer.classList.contains("open")) {
                window.closeMobileDrawer();
            } else {
                openDrawer();
            }
        });
    }

    if (drawerClose) {
        drawerClose.addEventListener("click", window.closeMobileDrawer);
    }

    if (drawerOverlay) {
        drawerOverlay.addEventListener("click", window.closeMobileDrawer);
    }

    if (mobileDrawer) {
        mobileDrawer.querySelectorAll(".drawer-link, .btn").forEach(link => {
            link.addEventListener("click", window.closeMobileDrawer);
        });
    }
}

// ------------------------------------------------------------
// Scroll Effects (Sticky Navigation & To-Top Button)
// ------------------------------------------------------------
function setupScrollEffects() {
    const header = document.querySelector(".main-header");
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const stickyCtaBar = document.getElementById("stickyCtaBar");

    window.addEventListener("scroll", () => {
        const scrollPos = window.scrollY;
        
        // Header Scroll
        if (header) {
            if (scrollPos > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }

        // Scroll to Top Button
        if (scrollToTopBtn) {
            if (scrollPos > 400) {
                scrollToTopBtn.style.display = "flex";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        }

        // Sticky CTA Bar (Home and Plans page only, past hero fold)
        if (stickyCtaBar) {
            if (scrollPos > 500) {
                stickyCtaBar.style.display = "block";
            } else {
                stickyCtaBar.style.display = "none";
            }
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ------------------------------------------------------------
// Dismissible Ribbon Banner
// ------------------------------------------------------------
function setupPromoRibbon() {
    const ribbon = document.getElementById("promoRibbon");
    const textElement = document.getElementById("promoText");
    const dismissState = sessionStorage.getItem("dvr_ribbon_dismissed");

    if (ribbon && !dismissState) {
        // Load dynamic promo from local list or Firestore
        let activeOffer = DVR_SEED_DATA.offers.find(o => o.visible);
        
        // Real-time Firestore ribbon load
        if (isFirebaseReady && db) {
            db.collection("offers").where("visible", "==", true).orderBy("priority", "asc").limit(1).get()
                .then(snap => {
                    if (!snap.empty) {
                        const offerData = snap.docs[0].data();
                        renderOfferText(ribbon, textElement, offerData);
                    } else if (activeOffer) {
                        renderOfferText(ribbon, textElement, activeOffer);
                    } else {
                        ribbon.style.display = "none";
                    }
                })
                .catch(() => {
                    if (activeOffer) renderOfferText(ribbon, textElement, activeOffer);
                });
        } else if (activeOffer) {
            renderOfferText(ribbon, textElement, activeOffer);
        } else {
            ribbon.style.display = "none";
        }
    } else if (ribbon) {
        ribbon.style.display = "none";
    }
}

function renderOfferText(ribbon, textEl, offer) {
    ribbon.style.display = "flex";
    ribbon.style.backgroundColor = offer.color || "var(--secondary)";
    
    if (offer.ctaText && offer.ctaUrl) {
        textEl.innerHTML = `${offer.text} <a href="${offer.ctaUrl}">${offer.ctaText} &rarr;</a>`;
    } else {
        textEl.textContent = offer.text;
    }
}

function dismissRibbon() {
    const ribbon = document.getElementById("promoRibbon");
    if (ribbon) {
        ribbon.style.display = "none";
        sessionStorage.setItem("dvr_ribbon_dismissed", "true");
    }
}

// ------------------------------------------------------------
// Scroll Animations (Intersection Observer)
// ------------------------------------------------------------
let observer = null;

function setupScrollAnimations() {
    const animators = document.querySelectorAll(".animate-on-scroll");
    
    if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animated");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        animators.forEach(element => observer.observe(element));
    } else {
        // Fallback for older browsers
        animators.forEach(element => element.classList.add("animated"));
    }
}

export function refreshScrollObserver() {
    const animators = document.querySelectorAll(".animate-on-scroll:not(.animated)");
    if (observer && animators.length > 0) {
        animators.forEach(element => observer.observe(element));
    } else if (!observer) {
        animators.forEach(element => element.classList.add("animated"));
    }
}

// ------------------------------------------------------------
// Quick Connection Enquiry Modal Handlers
// ------------------------------------------------------------
function openEnquiryModal(source = "General Modal", planName = "") {
    const modal = document.getElementById("enquiryModal");
    const sourceInput = document.getElementById("selectedSource");
    const planSelect = document.getElementById("clientPlan");
    
    if (modal) {
        modal.classList.add("active");
        if (sourceInput) sourceInput.value = source;
        if (planSelect && planName) {
            // Match select value if preset plan matches option
            for (let i = 0; i < planSelect.options.length; i++) {
                if (planSelect.options[i].value.toLowerCase().includes(planName.toLowerCase())) {
                    planSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }
}

function closeEnquiryModal() {
    const modal = document.getElementById("enquiryModal");
    if (modal) {
        modal.classList.remove("active");
    }
}

// ------------------------------------------------------------
// Connection Form Submittal (Dynamic Firestore Leads Capture)
// ------------------------------------------------------------
async function submitEnquiry(event) {
    event.preventDefault();
    const form = event.target;
    
    const name = form.querySelector("#clientName").value.trim();
    const phone = form.querySelector("#clientPhone").value.trim();
    const email = form.querySelector("#clientEmail") ? form.querySelector("#clientEmail").value.trim() : "";
    const plan = form.querySelector("#clientPlan").value;
    const area = form.querySelector("#clientArea").value.trim();
    const source = form.querySelector("#selectedSource") ? form.querySelector("#selectedSource").value : "General Form";
    const msg = form.querySelector("#clientMsg").value.trim();
    const preferredContact = form.querySelector('input[name="contactMode"]:checked') ? form.querySelector('input[name="contactMode"]:checked').value : "Phone Call";

    const leadData = {
        name,
        phone,
        email,
        plan,
        area,
        message: msg,
        preferredContact,
        source,
        date: new Date().toISOString(),
        status: "Pending" // Default status is Pending
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Booking Connection...";

    if (isFirebaseReady && db) {
        try {
            await db.collection("enquiries").add(leadData);
            handleBookingSuccess(form, submitBtn, originalText);
        } catch (error) {
            console.error("Firebase lead submittal error:", error);
            fallbackLocalSave(leadData);
            handleBookingSuccess(form, submitBtn, originalText);
        }
    } else {
        // Fallback: Save to LocalStorage so local admin dashboard can display leads
        fallbackLocalSave(leadData);
        // Simulate net delay for fidelity
        setTimeout(() => {
            handleBookingSuccess(form, submitBtn, originalText);
        }, 800);
    }
}

function fallbackLocalSave(leadData) {
    let localLeads = [];
    try {
        const stored = localStorage.getItem("dvr_local_enquiries");
        localLeads = stored ? JSON.parse(stored) : [];
    } catch (e) {
        localLeads = [];
    }
    localLeads.push(leadData);
    localStorage.setItem("dvr_local_enquiries", JSON.stringify(localLeads));
    console.log("Saved lead locally in LocalStorage due to offline Firebase mode.");
}

function handleBookingSuccess(form, btn, originalText) {
    btn.disabled = false;
    btn.textContent = originalText;
    form.reset();
    closeEnquiryModal();
    
    // Premium custom notification alert
    showCustomNotification("✅ Connection Requested!", "Thank you. Our executive will call you back in 15-30 minutes.");
}

export function showCustomNotification(title, text) {
    const notifyEl = document.createElement("div");
    notifyEl.style.position = "fixed";
    notifyEl.style.bottom = "80px";
    notifyEl.style.right = "30px";
    notifyEl.style.backgroundColor = "var(--navy)";
    notifyEl.style.color = "var(--bg-white)";
    notifyEl.style.padding = "var(--space-md) var(--space-lg)";
    notifyEl.style.borderRadius = "var(--radius-lg)";
    notifyEl.style.boxShadow = "var(--shadow-xl)";
    notifyEl.style.borderLeft = "5px solid var(--secondary)";
    notifyEl.style.zIndex = "99999";
    notifyEl.style.opacity = "0";
    notifyEl.style.transform = "translateY(20px)";
    notifyEl.style.transition = "var(--transition-normal)";
    
    notifyEl.innerHTML = `<h4 style="color:var(--bg-white);margin-bottom:var(--space-xs);font-size:0.95rem;">${title}</h4><p style="font-size:0.85rem;opacity:0.85;">${text}</p>`;
    
    document.body.appendChild(notifyEl);
    
    setTimeout(() => {
        notifyEl.style.opacity = "1";
        notifyEl.style.transform = "translateY(0)";
    }, 100);

    setTimeout(() => {
        notifyEl.style.opacity = "0";
        notifyEl.style.transform = "translateY(20px)";
        setTimeout(() => notifyEl.remove(), 400);
    }, 5000);
}
