/* =========================================
   AUREUS LANDING PAGE SCRIPTS
   ========================================= */

// Translations for bilingual support
const translations = {
    es: {
        // Navigation
        'nav.features': 'Características',
        'nav.apps': 'Aplicaciones',
        'nav.pricing': 'Precios',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contacto',
        'nav.start_trial': 'Prueba Gratis',

        // Hero
        'hero.badge': '2 Apps Premium • 1 Precio Increíble',
        'hero.title_1': 'Tu Bienestar',
        'hero.title_2': 'Total.',
        'hero.subtitle': 'Nutrición clínica + Finanzas inteligentes. La suite completa que necesitas para optimizar tu salud física y financiera.',
        'hero.cta_primary': 'Comenzar Prueba Gratis',
        'hero.cta_secondary': 'Ver Características',
        'hero.stat_1': 'Alimentos',
        'hero.stat_2': 'Días Gratis',
        'hero.stat_3': 'MXN/mes',

        // Social Proof
        'proof.text': 'Diseñado para profesionales de salud y cualquier persona comprometida con su bienestar',
        'proof.doctors': 'Nutricionistas',
        'proof.athletes': 'Atletas',
        'proof.health': 'Pacientes',
        'proof.professionals': 'Profesionales',

        // Features
        'features.tag': 'Características',
        'features.title': 'Todo lo que necesitas para <span class="highlight">optimizar tu vida</span>',
        'features.subtitle': 'Herramientas poderosas diseñadas con precisión clínica y la mejor experiencia de usuario.',
        'features.macros_title': 'Seguimiento de Macros',
        'features.macros_desc': 'Monitorea calorías, proteínas, carbohidratos y grasas con visualizaciones avanzadas tipo radar.',
        'features.fasting_title': 'Timer de Ayuno',
        'features.fasting_desc': 'Protocolos 16:8, 12:12, 20:4 con interfaz circular premium y seguimiento de progreso.',
        'features.planner_title': 'Planificador de Comidas',
        'features.planner_desc': 'Organiza tu semana con planes personalizados y genera reportes PDF profesionales.',
        'features.hydration_title': 'Hidratación',
        'features.hydration_desc': 'Visualización interactiva de consumo de agua con recordatorios inteligentes.',
        'features.glycemic_title': 'Carga Glucémica',
        'features.glycemic_desc': 'Monitorea el impacto en tu azúcar en sangre. Ideal para diabéticos y prediabéticos.',
        'features.purine_title': 'Control de Purinas',
        'features.purine_desc': 'Predicción de ácido úrico para prevención de gota. Único en el mercado.',

        // Apps
        'apps.tag': '2 Apps, 1 Suite',
        'apps.title': 'El bundle perfecto para tu <span class="highlight">bienestar integral</span>',
        'apps.fit_tagline': 'Nutrición Clínica',
        'apps.fit_1': 'Seguimiento de macros y calorías',
        'apps.fit_2': 'Timer de ayuno intermitente',
        'apps.fit_3': 'Planificador de comidas',
        'apps.fit_4': 'Base de datos 500+ alimentos',
        'apps.fit_5': 'Control glucémico y purinas',
        'apps.fit_6': 'Reportes PDF profesionales',
        'apps.finance_tagline': 'Sistema Operativo Financiero',
        'apps.finance_1': 'Seguimiento de patrimonio neto',
        'apps.finance_2': 'Gestión de ahorros y deudas',
        'apps.finance_3': 'Calendario financiero con recordatorios',
        'apps.finance_4': 'Comparativa mensual ingresos/gastos',
        'apps.finance_5': 'Sincronización en la nube',
        'apps.finance_6': 'Exportar/Importar Excel',

        // How It Works
        'how.tag': 'Cómo Funciona',
        'how.title': 'Comienza en <span class="highlight">3 simples pasos</span>',
        'how.step1_title': 'Regístrate',
        'how.step1_desc': 'Crea tu cuenta y obtén 14 días de prueba gratis. Sin tarjeta de crédito.',
        'how.step2_title': 'Personaliza',
        'how.step2_desc': 'Configura tus metas de nutrición, ayuno y finanzas según tus necesidades.',
        'how.step3_title': 'Transforma',
        'how.step3_desc': 'Monitorea tu progreso y alcanza tus objetivos de salud y finanzas.',

        // Pricing
        'pricing.tag': 'Precios Increíbles',
        'pricing.title': 'Un precio que <span class="highlight">te sorprenderá</span>',
        'pricing.subtitle': 'Ambas aplicaciones por menos de lo que pagas por un café.',
        'pricing.individual': 'Individual',
        'pricing.couples': 'Parejas',
        'pricing.per_month': '/mes',
        'pricing.savings': 'Ahorra $10/mes',
        'pricing.popular': 'MÁS POPULAR',
        'pricing.f1': 'AUREUS FIT AI completo',
        'pricing.f2': 'AUREUS Finance OS completo',
        'pricing.f3': '1 usuario',
        'pricing.f4': 'Todas las características',
        'pricing.f5': 'Actualizaciones incluidas',
        'pricing.f6': 'Soporte por email',
        'pricing.f7': '2 usuarios',
        'pricing.f8': 'Soporte prioritario',
        'pricing.cta': 'Comenzar Prueba Gratis',
        'pricing.note': '14 días gratis • Cancela cuando quieras',
        'pricing.web': 'Disponible en Web',
        'pricing.coming': 'iOS & Android próximamente',

        // FAQ
        'faq.tag': 'Preguntas Frecuentes',
        'faq.title': '¿Tienes <span class="highlight">preguntas</span>?',
        'faq.q1': '¿Qué incluye la suscripción?',
        'faq.a1': 'Tu suscripción incluye acceso completo a AUREUS FIT AI (nutrición clínica) y AUREUS Finance OS (control financiero). Ambas aplicaciones con todas sus características premium.',
        'faq.q2': '¿Cómo funciona la prueba gratuita?',
        'faq.a2': 'Tienes 14 días para probar todas las funciones sin compromiso. No necesitas tarjeta de crédito para registrarte. Si te gusta, puedes suscribirte después.',
        'faq.q3': '¿Puedo cancelar en cualquier momento?',
        'faq.a3': 'Sí, puedes cancelar tu suscripción cuando quieras. Sin contratos, sin penalizaciones. Tu acceso continúa hasta el final del período pagado.',
        'faq.q4': '¿Es segura mi información personal?',
        'faq.a4': 'Absolutamente. Usamos encriptación de grado bancario para proteger tus datos. Tu información nunca se comparte con terceros.',
        'faq.q5': '¿Cuándo estarán disponibles las apps móviles?',
        'faq.a5': 'Estamos trabajando activamente en las versiones para iOS y Android. Los suscriptores actuales tendrán acceso automático cuando se lancen.',

        // Contact
        'contact.title': '¿Listo para transformar tu vida?',
        'contact.subtitle': 'Únete a nuestra comunidad y comienza tu viaje hacia un bienestar integral.',
        'contact.name': 'Tu nombre',
        'contact.email': 'Tu email',
        'contact.submit': 'Iniciar Prueba Gratis',

        // Footer
        'footer.tagline': 'Tu bienestar, simplificado.',
        'footer.product': 'Producto',
        'footer.apps': 'Aplicaciones',
        'footer.legal': 'Legal',
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Términos',
        'footer.rights': 'Todos los derechos reservados.'
    },
    en: {
        // Navigation
        'nav.features': 'Features',
        'nav.apps': 'Apps',
        'nav.pricing': 'Pricing',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contact',
        'nav.start_trial': 'Free Trial',

        // Hero
        'hero.badge': '2 Premium Apps • 1 Amazing Price',
        'hero.title_1': 'Your Total',
        'hero.title_2': 'Wellness.',
        'hero.subtitle': 'Clinical nutrition + Smart finances. The complete suite you need to optimize your physical and financial health.',
        'hero.cta_primary': 'Start Free Trial',
        'hero.cta_secondary': 'See Features',
        'hero.stat_1': 'Foods',
        'hero.stat_2': 'Free Days',
        'hero.stat_3': 'MXN/month',

        // Social Proof
        'proof.text': 'Designed for healthcare professionals and anyone committed to their wellness',
        'proof.doctors': 'Nutritionists',
        'proof.athletes': 'Athletes',
        'proof.health': 'Patients',
        'proof.professionals': 'Professionals',

        // Features
        'features.tag': 'Features',
        'features.title': 'Everything you need to <span class="highlight">optimize your life</span>',
        'features.subtitle': 'Powerful tools designed with clinical precision and the best user experience.',
        'features.macros_title': 'Macro Tracking',
        'features.macros_desc': 'Monitor calories, protein, carbs and fats with advanced radar visualizations.',
        'features.fasting_title': 'Fasting Timer',
        'features.fasting_desc': '16:8, 12:12, 20:4 protocols with premium circular interface and progress tracking.',
        'features.planner_title': 'Meal Planner',
        'features.planner_desc': 'Organize your week with personalized plans and generate professional PDF reports.',
        'features.hydration_title': 'Hydration',
        'features.hydration_desc': 'Interactive water intake visualization with smart reminders.',
        'features.glycemic_title': 'Glycemic Load',
        'features.glycemic_desc': 'Monitor blood sugar impact. Ideal for diabetics and prediabetics.',
        'features.purine_title': 'Purine Control',
        'features.purine_desc': 'Uric acid prediction for gout prevention. Unique in the market.',

        // Apps
        'apps.tag': '2 Apps, 1 Suite',
        'apps.title': 'The perfect bundle for your <span class="highlight">complete wellness</span>',
        'apps.fit_tagline': 'Clinical Nutrition',
        'apps.fit_1': 'Macro and calorie tracking',
        'apps.fit_2': 'Intermittent fasting timer',
        'apps.fit_3': 'Meal planner',
        'apps.fit_4': '500+ food database',
        'apps.fit_5': 'Glycemic and purine control',
        'apps.fit_6': 'Professional PDF reports',
        'apps.finance_tagline': 'Financial Operating System',
        'apps.finance_1': 'Net worth tracking',
        'apps.finance_2': 'Savings & debt management',
        'apps.finance_3': 'Financial calendar with reminders',
        'apps.finance_4': 'Monthly income/expenses comparison',
        'apps.finance_5': 'Cloud synchronization',
        'apps.finance_6': 'Excel export/import',

        // How It Works
        'how.tag': 'How It Works',
        'how.title': 'Start in <span class="highlight">3 simple steps</span>',
        'how.step1_title': 'Sign Up',
        'how.step1_desc': 'Create your account and get 14 days free trial. No credit card needed.',
        'how.step2_title': 'Customize',
        'how.step2_desc': 'Set your nutrition, fasting and finance goals according to your needs.',
        'how.step3_title': 'Transform',
        'how.step3_desc': 'Monitor your progress and achieve your health and finance goals.',

        // Pricing
        'pricing.tag': 'Amazing Prices',
        'pricing.title': 'A price that will <span class="highlight">surprise you</span>',
        'pricing.subtitle': 'Both apps for less than a coffee.',
        'pricing.individual': 'Individual',
        'pricing.couples': 'Couples',
        'pricing.per_month': '/month',
        'pricing.savings': 'Save $10/month',
        'pricing.popular': 'MOST POPULAR',
        'pricing.f1': 'Complete AUREUS FIT AI',
        'pricing.f2': 'Complete AUREUS Finance OS',
        'pricing.f3': '1 user',
        'pricing.f4': 'All features',
        'pricing.f5': 'Updates included',
        'pricing.f6': 'Email support',
        'pricing.f7': '2 users',
        'pricing.f8': 'Priority support',
        'pricing.cta': 'Start Free Trial',
        'pricing.note': '14 days free • Cancel anytime',
        'pricing.web': 'Available on Web',
        'pricing.coming': 'iOS & Android coming soon',

        // FAQ
        'faq.tag': 'FAQ',
        'faq.title': 'Have <span class="highlight">questions</span>?',
        'faq.q1': 'What\'s included in the subscription?',
        'faq.a1': 'Your subscription includes full access to AUREUS FIT AI (clinical nutrition) and AUREUS Finance OS (financial control). Both apps with all premium features.',
        'faq.q2': 'How does the free trial work?',
        'faq.a2': 'You have 14 days to try all features without commitment. No credit card needed to sign up. If you like it, you can subscribe later.',
        'faq.q3': 'Can I cancel anytime?',
        'faq.a3': 'Yes, you can cancel your subscription anytime. No contracts, no penalties. Your access continues until the end of the paid period.',
        'faq.q4': 'Is my personal information secure?',
        'faq.a4': 'Absolutely. We use bank-grade encryption to protect your data. Your information is never shared with third parties.',
        'faq.q5': 'When will mobile apps be available?',
        'faq.a5': 'We are actively working on iOS and Android versions. Current subscribers will have automatic access when they launch.',

        // Contact
        'contact.title': 'Ready to transform your life?',
        'contact.subtitle': 'Join our community and start your journey to complete wellness.',
        'contact.name': 'Your name',
        'contact.email': 'Your email',
        'contact.submit': 'Start Free Trial',

        // Footer
        'footer.tagline': 'Your wellness, simplified.',
        'footer.product': 'Product',
        'footer.apps': 'Apps',
        'footer.legal': 'Legal',
        'footer.privacy': 'Privacy',
        'footer.terms': 'Terms',
        'footer.rights': 'All rights reserved.'
    }
};

// Current language
let currentLang = 'es';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initFAQ();
    initLanguageToggle();
    initSmoothScroll();
    initContactForm();
    initScrollAnimations();
});

// Navbar scroll effect
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile menu
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('mobileNavOverlay');
    const drawer = document.getElementById('mobileNavDrawer');
    const closeBtn = document.getElementById('drawerClose');
    const navLinks = drawer.querySelectorAll('a');

    function openMenu() {
        overlay.classList.add('active');
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);
    closeBtn.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// FAQ accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// Language toggle
function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    const currentLangSpan = document.getElementById('currentLang');

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        currentLangSpan.textContent = currentLang.toUpperCase();
        document.documentElement.lang = currentLang;
        applyTranslations();
    });
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    // Handle placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });
}

// Smooth scroll
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80; // Account for fixed navbar
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact form
function initContactForm() {
    const form = document.getElementById('contactForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        // Simple validation
        if (!name || !email) {
            alert(currentLang === 'es'
                ? 'Por favor completa todos los campos'
                : 'Please fill all fields');
            return;
        }

        // Show success message
        alert(currentLang === 'es'
            ? `¡Gracias ${name}! Te contactaremos pronto a ${email}`
            : `Thank you ${name}! We will contact you soon at ${email}`);

        form.reset();
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animateElements = document.querySelectorAll(
        '.feature-card, .app-card, .step-card, .pricing-card, .faq-item'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add animate-in class styles
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);
