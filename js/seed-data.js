/* ============================================================
   SREE DVR BROADBAND - SEED DATA FOR LOCAL PREVIEW / FALLBACK
   ============================================================ */

export const DVR_SEED_DATA = {
    // Site-wide Settings
    settings: {
        companyName: "SREE DVR Broadband Pvt. Ltd.",
        tagline: "Connecting You to More",
        address: "D.No: 40/58 I-41, 2nd Floor, S.V. Complex, R.S. Road, Kurnool - 518001 (Near SBI Circle)",
        phone: "08518-442525",
        whatsapp: "9133310422",
        email: "sreedvrbroadbandpvtltd@gmail.com",
        workingHours: "8:00 AM to 10:00 PM (Daily Support)",
        facebook: "https://facebook.com/sreedvrbroadband",
        instagram: "https://instagram.com/sreedvrbroadband",
        linkedin: "https://linkedin.com/company/sreedvrbroadband",
        youtube: "https://youtube.com/@sreedvrbroadband",
        googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.077271926665!2d78.03730221480572!3d15.828695989033327!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb5e3afdc7e9be1%3A0x64319647485013ef!2sHotel%20SV%20Regency%20Kurnool!5e0!3m2!1sen!2sin!4v1689182390234!5m2!1sen!2sin",
        brochureUrl: "#", // Seed brochure download
        metaTitle: "SREE DVR Broadband | Best High-Speed Fiber Internet in Kurnool",
        metaDescription: "Experience lightning-fast unlimited fiber internet, IPTV, and OTT entertainment combos in Kurnool. Book your connection today with SREE DVR Broadband!"
    },

    // Hero Slider Banners
    heroBanners: [
        {
            id: "banner-1",
            image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1920&h=800",
            title: "Superfast Fiber Internet",
            subtitle: "Experience seamless browsing, high-definition streaming, and lag-free gaming with Kurnool's leading ISP.",
            primaryCtaText: "Explore Plans",
            primaryCtaUrl: "#plans",
            secondaryCtaText: "Check Availability",
            secondaryCtaUrl: "#availability",
            badge: "Popular Choice",
            order: 1,
            visible: true
        },
        {
            id: "banner-2",
            image: "https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?auto=format&fit=crop&q=80&w=1920&h=800",
            title: "Fiber Internet + IPTV + OTT Combos",
            subtitle: "Get Pioneer Digital TV with unlimited plans and 25+ premium OTT Apps free for 3 months.",
            primaryCtaText: "View Combo Deals",
            primaryCtaUrl: "#plans",
            secondaryCtaText: "Book Now",
            secondaryCtaUrl: "#book-connection",
            badge: "Monsoon Offer",
            order: 2,
            visible: true
        }
    ],

    // Promotional Ribbons
    offers: [
        {
            id: "promo-1",
            text: "🌧 Monsoon Offer – Free Installation on all 100 Mbps and above plans! Limited Time.",
            ctaText: "Book Now",
            ctaUrl: "#book-connection",
            color: "#F7941D",
            visible: true,
            priority: 1
        }
    ],

    // Why Choose DVR Cards
    whyDVR: [
        {
            id: "why-1",
            title: "Ultra Fast Speed",
            description: "Dedicated fiber lines deliver stable gigabit speeds for seamless streaming and gaming.",
            icon: "speed" // Material Icon name
        },
        {
            id: "why-2",
            title: "99.9% Uptime SLA",
            description: "Redundant network ring architectures guarantee your business or home is always online.",
            icon: "cloud_done"
        },
        {
            id: "why-3",
            title: "Unlimited Data Plans",
            description: "No daily data caps or throttling. Browse, download, and stream with true unlimited bandwidth.",
            icon: "all_inclusive"
        },
        {
            id: "why-4",
            title: "Free Fiber Installation",
            description: "Zero installation charges on select long-term packages. High-grade dual-band optical routers included.",
            icon: "construction"
        },
        {
            id: "why-5",
            title: "IPTV (No Set Top Box)",
            description: "Stream over 350+ live channels directly through our Pioneer Digital TV App on Smart TVs & Phones.",
            icon: "live_tv"
        },
        {
            id: "why-6",
            title: "24/7 Professional Support",
            description: "Our dedicated network operations team works round the clock to resolve issues in under 1 hour.",
            icon: "support_agent"
        }
    ],

    // Core Business Services
    services: [
        {
            id: "srv-1",
            title: "Fiber Internet (FTTH)",
            description: "Fiber-to-the-home connectivity delivering speeds up to 300 Mbps with symmetric uploads/downloads.",
            icon: "settings_ethernet",
            image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600",
            order: 1,
            visible: true
        },
        {
            id: "srv-2",
            title: "Pioneer IPTV",
            description: "Turn your Android/Smart TV into an entertainment hub with local and national live television without extra boxes.",
            icon: "tv",
            image: "https://images.unsplash.com/photo-1593789198777-f29bc259780e?auto=format&fit=crop&q=80&w=600",
            order: 2,
            visible: true
        },
        {
            id: "srv-3",
            title: "OTT Entertainment Bundle",
            description: "Free access to Netflix, Prime Video, Hotstar, ZEE5, SonyLIV, Aha and 20+ other standard OTTs.",
            icon: "movie",
            image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=600",
            order: 3,
            visible: true
        },
        {
            id: "srv-4",
            title: "Corporate & Business Leased Lines",
            description: "High reliability leased lines with static IPs, symmetric speeds, and low latency for enterprises.",
            icon: "business",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
            order: 4,
            visible: true
        }
    ],

    // OTT Apps Logos List
    ottApps: [
        { name: "JioHotstar", logo: "images/jiohotstar.png", visible: true, order: 1 },
        { name: "Sony LIV", logo: "images/sonyliv.png", visible: true, order: 2 },
        { name: "ZEE5", logo: "images/zee5.png", visible: true, order: 3 },
        { name: "ShemarooMe", logo: "images/shemaroo.png", visible: true, order: 4 },
        { name: "Discovery+", logo: "images/discoveryplus.png", visible: true, order: 5 },
        { name: "Prime Video", logo: "images/primevideo.png", visible: true, order: 6 },
        { name: "Sun NXT", logo: "images/sunnxt.png", visible: true, order: 7 },
        { name: "FanCode", logo: "images/fancode.png", visible: true, order: 8 },
        { name: "Distro TV", logo: "images/distrotv.png", visible: true, order: 9 },
        { name: "AAO NXT", logo: "images/aaonxt.png", visible: true, order: 10 },
        { name: "Epic ON", logo: "images/epicon.png", visible: true, order: 11 },
        { name: "iTAP", logo: "images/itap.png", visible: true, order: 12 },
        { name: "Raj Digital", logo: "images/raj.png", visible: true, order: 13 },
        { name: "ShortsTV", logo: "images/shortstv.png", visible: true, order: 14 },
        { name: "Namma Flix", logo: "images/nammaflix.png", visible: true, order: 15 },
        { name: "Aha", logo: "images/aha.png", visible: true, order: 16 },
        { name: "Chaupal", logo: "images/chaupal.png", visible: true, order: 17 },
        { name: "Aha Tamil", logo: "images/ahatamil.png", visible: true, order: 18 },
        { name: "Playflix", logo: "images/playflix.png", visible: true, order: 19 },
        { name: "Goldmines", logo: "images/goldmines.png", visible: true, order: 20 },
        { name: "Hungama Play", logo: "images/hungamaplay.png", visible: true, order: 21 },
        { name: "Kanccha Lannka", logo: "images/kancchalannka.png", visible: true, order: 22 },
        { name: "RunnTV", logo: "images/runntv.png", visible: true, order: 23 },
        { name: "OTT Play", logo: "images/ottplay.png", visible: true, order: 24 },
        { name: "hook", logo: "images/hook.png", visible: true, order: 25 },
        { name: "Stage", logo: "https://img.icons8.com/fluency/70/documentary.png", visible: true, order: 26 },
        { name: "Netflix", logo: "https://img.icons8.com/color/70/netflix.png", visible: true, order: 27 }
    ],

    // ISP Broadband Plans
    plans: [
        // Standard Unlimited Fiber Plans
        {
            id: "plan-40m-no-dish",
            name: "Fiber 40 Mbps Standard",
            speed: "40 Mbps",
            price: 299,
            deposit: 2500,
            planType: "Unlimited",
            dishType: "No Dish",
            ottIncluded: [],
            popular: false,
            displayOrder: 1,
            active: true,
            bestFor: "Basic Browsing, WFH, 2-3 Devices",
            features: ["True Unlimited Data", "Symmetric 40 Mbps Speeds", "Dual-band Router Included", "24/7 Phone Support"]
        },
        {
            id: "plan-40m-sd-dish",
            name: "IPTV Combo 40 Mbps SD",
            speed: "40 Mbps",
            price: 511,
            deposit: 2500,
            planType: "Internet + IPTV",
            dishType: "SD IPTV App",
            ottIncluded: ["JioHotstar", "ZEE5", "Aha"],
            popular: false,
            displayOrder: 2,
            active: true,
            bestFor: "Standard Smart TV + General Browsing",
            features: ["True Unlimited Data", "Pioneer IPTV App Included", "300+ Live Channels SD", "Dual-band Router Included"]
        },
        {
            id: "plan-40m-hd-dish",
            name: "IPTV Combo 40 Mbps HD",
            speed: "40 Mbps",
            price: 553,
            deposit: 2500,
            planType: "Internet + IPTV",
            dishType: "HD IPTV App",
            ottIncluded: ["JioHotstar", "ZEE5", "Aha", "Sony LIV"],
            popular: false,
            displayOrder: 3,
            active: true,
            bestFor: "Premium Smart TV + HD Live Channels",
            features: ["True Unlimited Data", "Pioneer IPTV App Included", "350+ Live Channels HD", "Dual-band Router Included"]
        },
        {
            id: "plan-100m-no-dish",
            name: "Fiber 100 Mbps Standard",
            speed: "100 Mbps",
            price: 499,
            deposit: 2500,
            planType: "Unlimited",
            dishType: "No Dish",
            ottIncluded: [],
            popular: true, // Mark popular
            displayOrder: 4,
            active: true,
            bestFor: "UHD Streaming, Gaming, WFH, 5+ Devices",
            features: ["True Unlimited Data", "Symmetric 100 Mbps Speeds", "Dual-band Gigabit Router", "Priority Support SLA"]
        },
        {
            id: "plan-100m-sd-dish",
            name: "IPTV Combo 100 Mbps SD",
            speed: "100 Mbps",
            price: 711,
            deposit: 2500,
            planType: "Internet + IPTV",
            dishType: "SD IPTV App",
            ottIncluded: ["JioHotstar", "ZEE5", "Aha", "Sun NXT"],
            popular: false,
            displayOrder: 5,
            active: true,
            bestFor: "Multi-device Home + Standard Television",
            features: ["True Unlimited Data", "Pioneer IPTV App Included", "300+ Live Channels SD", "Dual-band Gigabit Router"]
        },
        {
            id: "plan-100m-hd-dish",
            name: "IPTV Combo 100 Mbps HD",
            speed: "100 Mbps",
            price: 753,
            deposit: 2500,
            planType: "Internet + IPTV",
            dishType: "HD IPTV App",
            ottIncluded: ["JioHotstar", "ZEE5", "Aha", "Sony LIV", "Sun NXT", "Netflix"],
            popular: false,
            displayOrder: 6,
            active: true,
            bestFor: "4K Home Cinema + Heavy Downloaders",
            features: ["True Unlimited Data", "Pioneer IPTV App Included", "350+ Live Channels HD", "Dual-band Gigabit Router"]
        },
        {
            id: "plan-200m-no-dish",
            name: "Fiber 200 Mbps Premium",
            speed: "200 Mbps",
            price: 1099,
            deposit: 2500,
            planType: "Unlimited",
            dishType: "No Dish",
            ottIncluded: ["JioHotstar", "Netflix", "Prime Video", "ZEE5", "Sony LIV", "Aha", "Sun NXT"],
            popular: false,
            displayOrder: 7,
            active: true,
            bestFor: "Hardcore Gaming, 4K Streaming, Smart Homes",
            features: ["True Unlimited Data", "Symmetric 200 Mbps Speeds", "Premium Gigabit Mesh Router", "Dedicated VIP Line Support"]
        },
        {
            id: "plan-300m-no-dish",
            name: "Fiber 300 Mbps Enterprise",
            speed: "300 Mbps",
            price: 1299,
            deposit: 2500,
            planType: "Unlimited",
            dishType: "No Dish",
            ottIncluded: ["JioHotstar", "Netflix", "Prime Video", "ZEE5", "Sony LIV", "Aha", "Sun NXT", "Hungama Play"],
            popular: false,
            displayOrder: 8,
            active: true,
            bestFor: "Content Creators, Small Offices, Heavy Multi-tasking",
            features: ["True Unlimited Data", "Symmetric 300 Mbps Speeds", "Enterprise Grade Router", "24/7/365 Direct Engineer SLA"]
        },
        // Dedicated IPTV Economy Plans (20 Mbps)
        {
            id: "plan-iptv-telugu-sd",
            name: "IPTV Economy Telugu SD",
            speed: "20 Mbps",
            price: 499,
            deposit: 2500,
            planType: "IPTV Dedicated",
            dishType: "SD IPTV App",
            ottIncluded: ["Aha"],
            popular: false,
            displayOrder: 9,
            active: true,
            bestFor: "Basic Telugu TV Viewer + 20 Mbps Connection",
            features: ["True Unlimited Data", "Telugu Live Channels SD Pack", "IPTV Dedicated Stream QoS", "Symmetric 20 Mbps Speed"]
        },
        {
            id: "plan-iptv-telugu-hd",
            name: "IPTV Economy Telugu HD",
            speed: "20 Mbps",
            price: 549,
            deposit: 2500,
            planType: "IPTV Dedicated",
            dishType: "HD IPTV App",
            ottIncluded: ["Aha", "JioHotstar"],
            popular: false,
            displayOrder: 10,
            active: true,
            bestFor: "Telugu HD TV Viewer + Internet",
            features: ["True Unlimited Data", "Telugu Live Channels HD Pack", "IPTV Dedicated Stream QoS", "Symmetric 20 Mbps Speed"]
        },
        {
            id: "plan-iptv-royal-hd",
            name: "IPTV Royal HD",
            speed: "20 Mbps",
            price: 649,
            deposit: 2500,
            planType: "IPTV Dedicated",
            dishType: "HD IPTV App",
            ottIncluded: ["Aha", "JioHotstar", "Sony LIV"],
            popular: false,
            displayOrder: 11,
            active: true,
            bestFor: "Complete Royal Entertainment Combo",
            features: ["True Unlimited Data", "Royal HD Channels Pack", "IPTV Dedicated Stream QoS", "Symmetric 20 Mbps Speed"]
        },
        {
            id: "plan-iptv-premium-hd",
            name: "IPTV Premium Combo HD",
            speed: "20 Mbps",
            price: 899,
            deposit: 2500,
            planType: "IPTV Dedicated",
            dishType: "HD IPTV App",
            ottIncluded: ["Aha", "JioHotstar", "Sony LIV", "ZEE5", "Sun NXT"],
            popular: false,
            displayOrder: 12,
            active: true,
            bestFor: "Premium TV Experience with Top OTT Apps",
            features: ["True Unlimited Data", "Premium HD Channels Pack", "Multi-lingual Channel Support", "Symmetric 20 Mbps Speed"]
        }
    ],

    // Coverage Areas served
    coverage: [
        { id: "cov-1", city: "Kurnool", area: "Budhawara Peta", mandal: "Kurnool", district: "Kurnool", status: "available" },
        { id: "cov-2", city: "Kurnool", area: "R.S. Road & SV Complex", mandal: "Kurnool", district: "Kurnool", status: "available" },
        { id: "cov-3", city: "Kurnool", area: "Joharapuram", mandal: "Kurnool", district: "Kurnool", status: "available" },
        { id: "cov-4", city: "Kurnool", area: "Kallur", mandal: "Kurnool", district: "Kurnool", status: "available" },
        { id: "cov-5", city: "Kurnool", area: "NTR Nagar", mandal: "Kurnool", district: "Kurnool", status: "available" },
        { id: "cov-6", city: "Nandyal", area: "Srinivasa Nagar", mandal: "Nandyal", district: "Nandyal", status: "available" },
        { id: "cov-7", city: "Adoni", area: "Yemmiganur Road", mandal: "Adoni", district: "Kurnool", status: "available" },
        { id: "cov-8", city: "Yemmiganur", area: "Somalapuram", mandal: "Yemmiganur", district: "Kurnool", status: "coming-soon" },
        { id: "cov-9", city: "Kodumur", area: "Main Bazaar", mandal: "Kodumur", district: "Kurnool", status: "coming-soon" }
    ],

    // FAQ list
    faq: [
        {
            id: "faq-1",
            category: "Plans",
            question: "Are there any hidden costs or data limits on DVR Broadband plans?",
            answer: "No, SREE DVR Broadband offers true unlimited plans with zero FUP limits or throttling. You get fixed monthly pricing with symmetric download and upload speeds. GST is applicable extra as per government norms.",
            order: 1,
            visible: true
        },
        {
            id: "faq-2",
            category: "Installation",
            question: "How long does the installation and activation process take?",
            answer: "Once feasibility is verified for your area, installation is completed within 30 minutes to 2 hours. Our technician pulls a fiber optic link right inside your premises, installs the router, and activates the service immediately.",
            order: 2,
            visible: true
        },
        {
            id: "faq-3",
            category: "IPTV",
            question: "Do I need a separate Set-Top Box to watch IPTV live television channels?",
            answer: "No! SREE DVR Broadband uses the Pioneer Digital TV App which runs directly on any Android Smart TV, Smart Stick (like FireTV Stick), or smartphone. This means you do not require any set-top box or dual billing.",
            order: 3,
            visible: true
        },
        {
            id: "faq-4",
            category: "Technical Support",
            question: "Who should I contact if my fiber internet is down?",
            answer: "We offer professional support from 8 AM to 10 PM. You can call us directly on 08518-442525, or message us on WhatsApp at 9133310422. Most connection issues are resolved in under 1 hour.",
            order: 4,
            visible: true
        }
    ],

    // Customer Testimonials
    testimonials: [
        {
            id: "tst-1",
            name: "Vikas Reddy",
            location: "Kurnool City",
            rating: 5,
            comment: "Switched from a major national brand to SREE DVR and the difference in latency and upload speeds is huge. Best local customer support in Kurnool. Feasibility and cabling were done in 30 minutes!",
            visible: true
        },
        {
            id: "tst-2",
            name: "Ramadevi K.",
            location: "Budhawara Peta",
            rating: 5,
            comment: "The IPTV + Fiber Internet combo is excellent value for money. We watch Telugu HD channels directly on our smart TV through their app. High speed, no buffer at all.",
            visible: true
        },
        {
            id: "tst-3",
            name: "Srinivas G.",
            location: "Nandyal",
            rating: 4,
            comment: "Highly reliable internet for WFH. Uptime is almost 100%. Speeds are consistent even during peak hours. Prompt technician response.",
            visible: true
        }
    ]
};
