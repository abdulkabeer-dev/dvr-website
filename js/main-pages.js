import { DVR_SEED_DATA } from './seed-data.js';
import { db, isFirebaseReady } from './firebase-config.js';
import { showCustomNotification, refreshScrollObserver } from './app.js';

// local copies of data
let plansList = DVR_SEED_DATA.plans;
let testimonialsList = DVR_SEED_DATA.testimonials;
let faqList = DVR_SEED_DATA.faq;
let coverageList = DVR_SEED_DATA.coverage;
let servicesList = DVR_SEED_DATA.services;
let heroBanners = DVR_SEED_DATA.heroBanners;

document.addEventListener("DOMContentLoaded", () => {
    initPages();
});

async function initPages() {
    // Attempt to pull live data from Firestore
    await fetchLiveCollections();

    // 1. Check if homepage widgets are present
    initHomepage();

    // 2. Check if plans page widgets are present
    initPlanspage();

    // 3. Check if services page widgets are present
    initServicespage();

    // 4. Check if coverage page widgets are present
    initCoveragepage();

    // 5. Check if contact page widgets are present
    initContactpage();
}

// ------------------------------------------------------------
// Fetch dynamic collections from Firestore
// ------------------------------------------------------------
async function fetchLiveCollections() {
    if (isFirebaseReady && db) {
        try {
            // Fetch Plans (client-side filter to avoid composite index requirement)
            const plansSnap = await db.collection("plans").orderBy("displayOrder", "asc").get();
            if (!plansSnap.empty) {
                plansList = plansSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(p => p.active === true);
            }
            
            // Fetch FAQ (client-side filter to avoid composite index requirement)
            const faqSnap = await db.collection("faq").orderBy("order", "asc").get();
            if (!faqSnap.empty) {
                faqList = faqSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(f => f.visible === true);
            }

            // Fetch Testimonials (client-side filter)
            const testSnap = await db.collection("testimonials").get();
            if (!testSnap.empty) {
                testimonialsList = testSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(t => t.visible === true);
            }

            // Fetch Coverage Areas
            const covSnap = await db.collection("coverage").get();
            if (!covSnap.empty) {
                coverageList = covSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            // Fetch Services (client-side filter to avoid composite index requirement)
            const srvSnap = await db.collection("services").orderBy("order", "asc").get();
            if (!srvSnap.empty) {
                servicesList = srvSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(s => s.visible === true);
            }

            // Fetch Hero Banners (no compound query to avoid needing a composite index)
            const heroSnap = await db.collection("hero_banners").orderBy("order", "asc").get();
            if (!heroSnap.empty) {
                heroBanners = heroSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(b => b.visible === true);
            }
        } catch (e) {
            console.warn("Firestore database live sync failed. Running on local seed configuration.", e);
        }
    }
}

// ------------------------------------------------------------
// Homepage Initializer
// ------------------------------------------------------------
function initHomepage() {
    const heroSlider = document.getElementById("heroSlider");
    const whyGrid = document.getElementById("whyGrid");
    const quickPlansGrid = document.getElementById("plansGrid");
    const testimonialsGrid = document.getElementById("testimonialsGrid");

    if (heroSlider) {
        renderHeroSlider();
    }
    if (whyGrid) {
        renderWhyChooseDVR();
    }
    // Only run quick plans on Homepage where heroSlider exists
    if (quickPlansGrid && heroSlider) {
        renderQuickPlans();
    }
    if (testimonialsGrid) {
        renderTestimonials();
    }
    
    // Check feasibility checker on Home
    window.checkFeasibility = checkFeasibility;
}

// Render Slider
let activeSlideIndex = 0;
function renderHeroSlider() {
    const sliderContainer = document.getElementById("heroSlider");
    const dotsContainer = document.getElementById("sliderDots");
    if (!sliderContainer) return;

    sliderContainer.innerHTML = "";
    if (dotsContainer) dotsContainer.innerHTML = "";

    heroBanners.forEach((banner, index) => {
        const slide = document.createElement("div");
        slide.className = "slide";
        slide.style.backgroundImage = `url('${banner.image}')`;
        
        slide.innerHTML = `
            <div class="container">
                <div class="slide-content">
                    ${banner.badge ? `<span class="slide-badge">${banner.badge}</span>` : ''}
                    <h1 class="slide-title">${banner.title}</h1>
                    <p class="slide-subtitle">${banner.subtitle}</p>
                    <div class="slide-actions">
                        <a href="${banner.primaryCtaUrl}" class="btn btn-secondary">${banner.primaryCtaText}</a>
                        <a href="${banner.secondaryCtaUrl}" class="btn btn-white">${banner.secondaryCtaText}</a>
                    </div>
                </div>
            </div>
        `;
        sliderContainer.appendChild(slide);

        // Add dot
        if (dotsContainer) {
            const dot = document.createElement("div");
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener("click", () => showSlide(index));
            dotsContainer.appendChild(dot);
        }
    });

    // Auto slide
    setInterval(() => {
        moveSlider(1);
    }, 6000);

    refreshScrollObserver();
}

window.moveSlider = function(direction) {
    let nextIndex = activeSlideIndex + direction;
    if (nextIndex >= heroBanners.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = heroBanners.length - 1;
    showSlide(nextIndex);
};

function showSlide(index) {
    const slider = document.getElementById("heroSlider");
    const dots = document.querySelectorAll(".slider-dot");
    if (!slider) return;

    activeSlideIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    
    dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === index);
    });
}

// Render Why Us
function renderWhyChooseDVR() {
    const grid = document.getElementById("whyGrid");
    if (!grid) return;
    grid.innerHTML = "";
    
    DVR_SEED_DATA.whyDVR.forEach(why => {
        const card = document.createElement("div");
        card.className = "card feature-card animate-on-scroll fade-up";
        card.innerHTML = `
            <div class="feature-icon-wrapper">
                <span class="material-icons">${why.icon}</span>
            </div>
            <h3 class="feature-title">${why.title}</h3>
            <p style="color:var(--gray-600);font-size:0.9rem;">${why.description}</p>
        `;
        grid.appendChild(card);
    });

    refreshScrollObserver();
}

// Render 3 popular plans on Home
function renderQuickPlans() {
    const grid = document.getElementById("plansGrid");
    if (!grid) return;
    grid.innerHTML = "";

    // Safely retrieve exactly 3 plans for home page layout to prevent blank space
    let renderSource = plansList.filter(p => p.popular).slice(0, 3);
    if (renderSource.length < 3) {
        const remaining = plansList.filter(p => !p.popular).slice(0, 3 - renderSource.length);
        renderSource = [...renderSource, ...remaining];
    }

    // Ensure the popular plan is in the middle (index 1) of the 3 cards
    if (renderSource.length === 3) {
        const popIdx = renderSource.findIndex(p => p.popular);
        if (popIdx !== -1 && popIdx !== 1) {
            const temp = renderSource[1];
            renderSource[1] = renderSource[popIdx];
            renderSource[popIdx] = temp;
        }
    }

    renderSource.forEach(plan => {
        const card = buildPlanCard(plan);
        grid.appendChild(card);
    });

    refreshScrollObserver();
}

// Render Testimonials Grid
function renderTestimonials() {
    const grid = document.getElementById("testimonialsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    testimonialsList.forEach((tst, index) => {
        const card = document.createElement("div");
        card.className = `card testimonial-card animate-on-scroll fade-up stagger-${(index % 4) + 1}`;
        
        let stars = "";
        for (let i = 0; i < 5; i++) {
            stars += i < tst.rating ? "★" : "☆";
        }

        const initial = tst.name.charAt(0);

        card.innerHTML = `
            <div class="testimonial-quote">“</div>
            <div class="testimonial-stars">${stars}</div>
            <p class="testimonial-text">"${tst.comment}"</p>
            <div class="testimonial-author">
                <div class="author-avatar">${initial}</div>
                <div>
                    <div class="author-name">${tst.name}</div>
                    <div class="author-loc">${tst.location}</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    refreshScrollObserver();
}

// Feasibility logic
function checkFeasibility() {
    const areaInput = document.getElementById("areaInput");
    const results = document.getElementById("checkerResults");
    if (!areaInput || !results) return;

    const val = areaInput.value.trim().toLowerCase();
    if (!val) {
        results.style.display = "block";
        results.className = "checker-results unavailable";
        results.textContent = "Please enter your Area/Locality name.";
        return;
    }

    // Search in coverage area list
    const match = coverageList.find(c => c.area.toLowerCase().includes(val) || c.city.toLowerCase().includes(val));
    results.style.display = "block";
    
    if (match) {
        if (match.status === "available") {
            results.className = "checker-results available";
            results.innerHTML = `✅ Service is Available in ${match.area}, ${match.city}! <button onclick="openEnquiryModal('Feasibility Checker Match', '100 Mbps')" class="btn btn-secondary btn-sm" style="margin-left:var(--space-md);">Book Connection</button>`;
        } else {
            results.className = "checker-results coming-soon";
            results.innerHTML = `⚠ service is Coming Soon to ${match.area}, ${match.city}! <button onclick="openEnquiryModal('Feasibility Checker Soon')" class="btn btn-primary btn-sm" style="margin-left:var(--space-md);">Notify Me</button>`;
        }
    } else {
        results.className = "checker-results unavailable";
        results.innerHTML = `❌ Currently Not Available in "${areaInput.value}". <button onclick="openEnquiryModal('Feasibility Checker Unmatched')" class="btn btn-primary btn-sm" style="margin-left:var(--space-md);">Request Expansion</button>`;
    }
}

// ------------------------------------------------------------
// Plans Page Initializer
// ------------------------------------------------------------
function renderOttShowcase() {
    const grid = document.querySelector(".ott-apps-grid");
    if (!grid) return;
    grid.innerHTML = "";
    
    // Sort ottApps by order
    const sortedApps = [...DVR_SEED_DATA.ottApps].sort((a, b) => a.order - b.order);
    
    sortedApps.forEach(app => {
        const item = document.createElement("div");
        item.className = "ott-showcase-item animate-on-scroll fade-up";
        item.innerHTML = `
            <img src="${app.logo}" alt="${app.name}" title="${app.name}">
            <span>${app.name}</span>
        `;
        grid.appendChild(item);
    });
    refreshScrollObserver();
}

function initPlanspage() {
    const plansGrid = document.getElementById("plansGrid");
    const wizardBox = document.getElementById("wizardBox");
    // Only run on Plans page if wizardBox exists (unique to plans.html)
    if (!plansGrid || !wizardBox) return;

    // Render all plans
    filterPlans('all');

    // Render OTT platform logos showcase
    renderOttShowcase();

    // Attach calculators/wizard helpers to window
    window.filterPlans = filterPlans;
    window.selectWizardOpt = selectWizardOpt;
    window.nextWizardStep = nextWizardStep;
    window.prevWizardStep = prevWizardStep;
    window.generateWizardRecommendation = generateWizardRecommendation;
    window.resetWizard = resetWizard;
    
    window.runSpeedCalc = runSpeedCalc;
    window.selectCalcQuality = selectCalcQuality;
    window.selectCalcWfh = selectCalcWfh;

    // Run initial speed calculator calculation
    runSpeedCalc();
}

// Filter plans handler
function filterPlans(type, btn = null) {
    const grid = document.getElementById("plansGrid");
    if (!grid) return;
    grid.innerHTML = "";

    // Toggle active tab buttons
    if (btn) {
        document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }

    const filtered = type === 'all' ? plansList : plansList.filter(p => p.planType === type);

    filtered.forEach(plan => {
        const card = buildPlanCard(plan);
        grid.appendChild(card);
    });

    refreshScrollObserver();
}

function buildPlanCard(plan) {
    const card = document.createElement("div");
    card.className = "card plan-card animate-on-scroll fade-up";
    
    let planImage = "";
    if (plan.name.toLowerCase().includes("40 mbps")) {
        planImage = "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=400&h=180";
    } else if (plan.name.toLowerCase().includes("100 mbps")) {
        planImage = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400&h=180";
    } else if (plan.name.toLowerCase().includes("200 mbps")) {
        planImage = "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?auto=format&fit=crop&q=80&w=400&h=180";
    } else if (plan.name.toLowerCase().includes("300 mbps")) {
        planImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400&h=180";
    } else {
        planImage = "https://images.unsplash.com/photo-1593789198777-f29bc259780e?auto=format&fit=crop&q=80&w=400&h=180";
    }

    let ottLogosHTML = "";
    if (plan.ottIncluded && plan.ottIncluded.length > 0) {
        plan.ottIncluded.forEach(ottName => {
            const ottApp = DVR_SEED_DATA.ottApps.find(o => o.name === ottName);
            if (ottApp) {
                ottLogosHTML += `<img class="plan-ott-logo" src="${ottApp.logo}" alt="${ottName}" title="${ottName}">`;
            }
        });
    }

    card.innerHTML = `
        ${plan.popular ? `<div class="plan-badge">Popular</div>` : ''}
        <div class="plan-card-image">
            <img src="${planImage}" alt="${plan.name}">
        </div>
        <div class="plan-header">
            <h3 class="plan-name">${plan.name}</h3>
            <div class="plan-speed">${plan.speed}</div>
            <div class="plan-price-wrapper">
                <span class="plan-currency">₹</span>
                <span class="plan-price">${plan.price}</span>
                <span class="plan-period">/month</span>
            </div>
            <p style="font-size:0.85rem;color:var(--gray-500);margin-top:var(--space-xs);">${plan.bestFor || 'High speed internet connection'}</p>
        </div>
        <ul class="plan-features">
            ${plan.features.map(f => `<li><i class="material-icons">check_circle</i><span>${f}</span></li>`).join('')}
            <li><i class="material-icons">lock</i><span>Condition's apply</span></li>
            <li><i class="material-icons">settings_input_hdmi</i><span>IPTV Mode: ${plan.dishType || 'No Dish'}</span></li>
        </ul>
        ${ottLogosHTML ? `<div class="plan-otts">${ottLogosHTML}</div>` : ''}
        <button onclick="openEnquiryModal('Plans Grid Book', '${plan.name}')" class="btn ${plan.popular ? 'btn-secondary' : 'btn-primary'} btn-block">Book Connection</button>
    `;
    return card;
}

// Recommendation Wizard
let wizardAnswers = {};
function selectWizardOpt(step, val) {
    // highlight selected option style
    const stepEl = document.getElementById(`step-${step}`);
    if (stepEl) {
        stepEl.querySelectorAll(".wizard-option").forEach(opt => opt.classList.remove("selected"));
        event.currentTarget.classList.add("selected");
    }
    wizardAnswers[step] = val;
}

function nextWizardStep(stepNum) {
    // Check if answered
    if (!wizardAnswers[stepNum - 1]) {
        showCustomNotification("⚠ Selection Required", "Please choose an option first.");
        return;
    }
    document.querySelectorAll(".wizard-step").forEach(s => s.classList.remove("active"));
    document.getElementById(`step-${stepNum}`).classList.add("active");
}

function prevWizardStep(stepNum) {
    document.querySelectorAll(".wizard-step").forEach(s => s.classList.remove("active"));
    document.getElementById(`step-${stepNum}`).classList.add("active");
}

function generateWizardRecommendation() {
    if (!wizardAnswers[3]) {
        showCustomNotification("⚠ Selection Required", "Please choose an option first.");
        return;
    }
    
    document.querySelectorAll(".wizard-step").forEach(s => s.classList.remove("active"));
    document.getElementById("step-result").classList.add("active");

    const resultBox = document.getElementById("wizardResultContent");
    const bookBtn = document.getElementById("wizardBookBtn");
    
    // Simple logic tree to find recommended speed
    let recommendedPlan = null;

    if (wizardAnswers[1] === 'office') {
        recommendedPlan = plansList.find(p => p.speed === '300.00' || p.speed.includes('300')) || plansList[plansList.length - 1];
    } else {
        if (wizardAnswers[2] === 'high' && wizardAnswers[3] === 'heavy') {
            recommendedPlan = plansList.find(p => p.speed.includes('200')) || plansList[4];
        } else if (wizardAnswers[2] === 'high' || wizardAnswers[3] === 'heavy') {
            recommendedPlan = plansList.find(p => p.speed.includes('100') && p.popular) || plansList[3];
        } else {
            recommendedPlan = plansList.find(p => p.speed.includes('40') && !p.name.includes('IPTV')) || plansList[0];
        }
    }

    if (recommendedPlan) {
        resultBox.innerHTML = `
            <div style="font-size:1.5rem;font-weight:700;color:var(--primary);margin-bottom:var(--space-xs);">${recommendedPlan.name}</div>
            <div style="font-size:2.25rem;font-weight:800;color:var(--navy);margin-bottom:var(--space-sm);">${recommendedPlan.speed} at ₹${recommendedPlan.price}/mo</div>
            <p style="color:var(--gray-600);line-height:1.6;">Optimal allocation for your selection (${wizardAnswers[1] === 'home' ? 'Home' : 'Office'} profiling with ${wizardAnswers[2] === 'high' ? 'multiple devices' : 'light user counts'}). true unlimited data with symmetric speed routing included.</p>
        `;
        
        bookBtn.setAttribute("onclick", `openEnquiryModal('Wizard Recommendation', '${recommendedPlan.name}')`);
    }
}

function resetWizard() {
    wizardAnswers = {};
    document.querySelectorAll(".wizard-option").forEach(o => o.classList.remove("selected"));
    document.querySelectorAll(".wizard-step").forEach(s => s.classList.remove("active"));
    document.getElementById("step-1").classList.add("active");
}

// Speed usage Calculator
let calcQuality = "SD";
let calcWfh = false;
function selectCalcQuality(q) {
    calcQuality = q;
    document.getElementById("quality-sd").classList.remove("selected");
    document.getElementById("quality-hd").classList.remove("selected");
    document.getElementById("quality-uhd").classList.remove("selected");
    event.currentTarget.classList.add("selected");
    runSpeedCalc();
}

function selectCalcWfh(w) {
    calcWfh = w;
    document.getElementById("wfh-no").classList.remove("selected");
    document.getElementById("wfh-yes").classList.remove("selected");
    event.currentTarget.classList.add("selected");
    runSpeedCalc();
}

function runSpeedCalc() {
    const userVal = document.getElementById("calcUsers");
    const textVal = document.getElementById("calcUserVal");
    const speedOut = document.getElementById("calcSpeedOutput");
    const descOut = document.getElementById("calcPlanDesc");
    const bookBtn = document.getElementById("calcBookBtn");

    if (!userVal) return;
    const users = parseInt(userVal.value);
    if (textVal) textVal.textContent = users;

    // Calculate bandwidth required
    let speed = 0;
    // base speed based on quality
    const baseMult = calcQuality === 'SD' ? 5 : (calcQuality === 'HD' ? 15 : 35);
    speed = users * baseMult;
    
    // Add extra for WFH
    if (calcWfh) speed += 30;

    // Suggest plan
    let suggestedPlan = plansList[0];
    if (speed > 200) {
        suggestedPlan = plansList.find(p => p.speed.includes('300')) || plansList[plansList.length - 1];
    } else if (speed > 100) {
        suggestedPlan = plansList.find(p => p.speed.includes('200')) || plansList[plansList.length - 2];
    } else if (speed > 40) {
        suggestedPlan = plansList.find(p => p.speed.includes('100') && p.popular) || plansList[3];
    } else {
        suggestedPlan = plansList.find(p => p.speed.includes('40')) || plansList[0];
    }

    if (speedOut && descOut && bookBtn) {
        speedOut.textContent = suggestedPlan.speed;
        descOut.innerHTML = `Recommended plan: <strong>${suggestedPlan.name}</strong> for ₹${suggestedPlan.price}/month.<br>Estimate matches ${users} active users at ${calcQuality} streams.`;
        bookBtn.setAttribute("onclick", `openEnquiryModal('Calculator Suggestion', '${suggestedPlan.name}')`);
    }
}

// ------------------------------------------------------------
// Services Page Initializer
// ------------------------------------------------------------
function initServicespage() {
    const srvLayout = document.getElementById("servicesLayout");
    if (!srvLayout) return;

    srvLayout.innerHTML = "";
    servicesList.forEach(srv => {
        const row = document.createElement("div");
        row.className = "service-row animate-on-scroll fade-up";
        row.innerHTML = `
            <div class="service-info">
                <span class="service-tag">${srv.title.split(' ')[0]}</span>
                <h2 style="font-size:1.85rem;margin-bottom:var(--space-sm);">${srv.title}</h2>
                <p style="color:var(--gray-600);margin-bottom:var(--space-lg);line-height:1.7;">${srv.description}</p>
                <button onclick="openEnquiryModal('Services Page', '${srv.title}')" class="btn btn-outline">Enquire about service</button>
            </div>
            <div class="service-image-panel">
                <img src="${srv.image || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600'}" alt="${srv.title}">
            </div>
        `;
        srvLayout.appendChild(row);
    });

    refreshScrollObserver();
}

// ------------------------------------------------------------
// Coverage Page Initializer
// ------------------------------------------------------------
function initCoveragepage() {
    const grid = document.getElementById("coverageGrid");
    if (!grid) return;

    grid.innerHTML = "";
    coverageList.forEach(cov => {
        const card = document.createElement("div");
        card.className = "area-card animate-on-scroll fade-up";
        
        let statusLabel = "";
        if (cov.status === "available") {
            statusLabel = `<span class="area-status status-available">Live Feasibility</span>`;
        } else {
            statusLabel = `<span class="area-status status-soon">Coming Soon</span>`;
        }

        card.innerHTML = `
            <div>
                <h3 style="font-size:1.15rem;margin-bottom:var(--space-xs);">${cov.area}</h3>
                <p style="font-size:0.85rem;color:var(--gray-500);">${cov.city}, ${cov.district} Dist.</p>
            </div>
            ${statusLabel}
        `;
        grid.appendChild(card);
    });
    
    // feasibility connector
    window.checkFeasibility = checkFeasibility;

    refreshScrollObserver();
}

// ------------------------------------------------------------
// Contact Us Page FAQ Accordion Initializer
// ------------------------------------------------------------
function initContactpage() {
    const accordion = document.getElementById("faqAccordion");
    if (!accordion) return;

    accordion.innerHTML = "";
    faqList.forEach(faq => {
        const item = document.createElement("div");
        item.className = "accordion-item animate-on-scroll fade-up";
        
        item.innerHTML = `
            <button class="accordion-header">
                <span>${faq.question}</span>
                <span class="material-icons accordion-icon">add</span>
            </button>
            <div class="accordion-content">
                <div class="accordion-body">
                    ${faq.answer}
                </div>
            </div>
        `;

        // accordion action
        const header = item.querySelector(".accordion-header");
        header.addEventListener("click", () => {
            const isActive = item.classList.contains("active");
            
            // close other accordions for premium clean layout
            document.querySelectorAll(".accordion-item").forEach(i => {
                i.classList.remove("active");
                const otherContent = i.querySelector(".accordion-content");
                if (otherContent) otherContent.style.maxHeight = "0";
            });

            if (!isActive) {
                item.classList.add("active");
                const content = item.querySelector(".accordion-content");
                if (content) content.style.maxHeight = content.scrollHeight + "px";
            }
        });

        accordion.appendChild(item);
    });

    refreshScrollObserver();
}
