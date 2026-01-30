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
        'nav.blog': 'Blog',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contacto',
        'nav.start_trial': 'Prueba Gratis',
        'nav.login': 'Iniciar Sesión',
        'nav.dashboard': 'Mi Panel',

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
        'proof.gyms': 'Gimnasios',
        'proof.diabetics': 'Diabéticos',
        'proof.entrepreneurs': 'Emprendedores',
        'proof.families': 'Familias',

        // Nav Dropdown Apps
        'nav.apps_fit_desc': 'Nutrición clínica, macros, ayuno y planificación de comidas',
        'nav.apps_finance_desc': 'Control financiero, presupuestos, ahorros e inversiones',
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

        // Core Tech
        'tech.tag_small': 'Potencia Invisible',
        'tech.title': 'Tecnología Core <span class="highlight">AUREUS</span>',
        'tech.ai_title': 'Motor de IA Clínico',
        'tech.ai_desc': 'Algoritmos entrenados con data médica real para recomendaciones precisas y seguras.',
        'tech.sec_title': 'Seguridad Bancaria',
        'tech.sec_desc': 'Encriptación AES-256 de extremo a extremo. Tus datos son solo tuyos.',
        'tech.sync_title': 'Sync Universal',
        'tech.sync_desc': 'Sincronización instantánea entre móvil, tablet y web. Empieza aquí, termina allá.',
        'tech.off_title': 'Modo Offline Smart',
        'tech.off_desc': 'La app funciona 100% sin internet. Los datos se suben cuando recuperas conexión.',
        'tech.rep_title': 'Reportes Pro',
        'tech.rep_desc': 'Exporta tu historial en formatos listos para tu nutriólogo o contador (PDF/XLS).',

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
        'pricing.savings': 'Ahorra $25/mes',
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
        'pricing.included_tag': 'Un precio, todo incluido',
        'pricing.included_title': 'Acceso completo a <span class="highlight">2 apps premium</span>',

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
        'faq.q6': '¿Necesito ser miembro de un gimnasio?',
        'faq.a6': 'No. AUREUS Nutrición AI adapta tus planes a tu estilo de vida, ya sea que entrenes en casa, gimnasio o no entrenes.',
        'faq.q7': '¿Necesito comprar equipo especial?',
        'faq.a7': 'No. AUREUS se adapta a tu entorno. Puedes entrenar en gimnasio, en casa con equipo básico o solo con tu peso corporal.',
        'faq.q8': '¿Puedo compartir mi cuenta?',
        'faq.a8': 'La suscripción Individual es personal. El plan Parejas permite dos cuentas independientes vinculadas para una gestión compartida.',

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
        'footer.rights': 'Todos los derechos reservados.',
        'footer.link_features': 'Características',
        'footer.link_pricing': 'Precios',
        'footer.link_faq': 'FAQ',
        'footer.link_blog': 'Blog',
        'footer.link_nutrition': 'AUREUS Nutrición AI',
        'footer.link_finance': 'AUREUS Finance OS',
        'footer.link_ambassadors': 'Embajadores',

        // CTA Section (Added)
        'cta.tag': 'Comienza Hoy',
        'cta.title': '¿Listo para retomar el <span class="highlight">control total</span>?',
        'cta.desc': 'Toma hoy la decisión que transformará tu salud y tus finanzas para siempre con la suite AUREUS.',
        'cta.btn': 'Comenzar Ahora',
        'cta.trust': 'Pruébalo gratis • Sin compromisos',

        // Academy Section (Added)
        'academy.tag': 'AUREUS Academy',
        'academy.title': 'Mastery <span class="highlight">Center</span>',
        'academy.read_more': 'Leer más',
        'academy.cat1': 'Finanzas',
        'academy.card1_title': 'El Arte del Control Financiero',
        'academy.card1_desc': 'Cómo asignar cada peso a un propósito para eliminar la ansiedad financiera.',
        'academy.cat2': 'Nutrición',
        'academy.card2_title': 'Nutrición, Ayuno y Claridad Mental',
        'academy.card2_desc': 'Optimiza tu biorritmo y nutrición celular para alcanzar un estado de enfoque profundo.',
        'academy.cat3': 'Wealth',
        'academy.card3_title': 'Dominio Metabólico: La Arquitectura de la Salud',
        'academy.card3_desc': 'Una guía técnica sobre TMB, Ayuno Intermitente, Keto y Nutrición Celular.',

        // Blog Page
        'blog.title': 'Últimas Noticias',
        'blog.subtitle': 'Diseñado para <span class="highlight">Tu Estilo de Vida</span>',
        'blog.persona_entrepreneurs': 'Entrepreneurs',
        'blog.persona_entrepreneurs_desc': 'Separa finanzas personales y de negocio. Controla tu flujo de caja y maximiza tu rendimiento mental y fiscal.',
        'blog.persona_families': 'Familias',
        'blog.persona_families_desc': 'Planifica el futuro de los tuyos. Presupuestos compartidos y menús saludables para todos en casa.',
        'blog.persona_performers': 'High Performers',
        'blog.persona_performers_desc': 'Optimiza cada aspecto de tu biología y economía. La herramienta definitiva para quienes no aceptan límites.',
        'blog.recent_articles': 'Artículos Recientes',
        'blog.filter_all': 'Todos',
        'blog.filter_nutrition': 'Nutrición',
        'blog.filter_finance': 'Finanzas',
        'blog.filter_mindset': 'Mentalidad',
        'blog.filter_updates': 'Updates',
        'blog.newsletter_title': 'Optimiza tu bandeja de entrada',
        'blog.newsletter_desc': 'Recibe los mejores consejos de nutrición clínica y finanzas inteligentes. Sin spam, solo valor.',
        'blog.newsletter_placeholder': 'ejemplo@correo.com',

        // Pricing Beta Section
        'beta.badge': 'Updates',
        'beta.title': 'Acceso Anticipado: Beta Exclusiva AUREUS 2.0',
        'beta.desc': 'Únete al grupo selecto de usuarios fundadores. Optimiza tu salud y finanzas antes que nadie con nuestra nueva suite integral.',
        'beta.btn': 'Unirse a la Beta',
        'beta.placeholder': 'Tu correo electrónico',

        // Pricing - Why Pay
        'pricing.whypay_title': '¿Por qué pagar por <span class="highlight">AUREUS</span>?',
        'pricing.whypay_subtitle': 'Invertir en ti mismo siempre es la mejor decisión.',
        'pricing.noads_title': 'Sin anuncios, nunca',
        'pricing.noads_desc': 'Tu experiencia siempre limpia y enfocada en lo que importa. No verás publicidad que interrumpa tu flujo.',
        'pricing.privacy_title': 'Tus datos son tuyos',
        'pricing.privacy_desc': 'Nunca vendemos tu información financiera o de salud. Tu privacidad es nuestra prioridad absoluta.',
        'pricing.dev_title': 'Desarrollo constante',
        'pricing.dev_desc': 'Nuevas funciones cada mes. Tu suscripción financia mejoras continuas que tú decides con tu feedback.',
        'pricing.support_title': 'Soporte real',
        'pricing.support_desc': 'Un equipo dedicado a ayudarte. Respuestas rápidas y humanas, no chatbots genéricos.',
        'pricing.sync_title': 'Sync Universal',
        'pricing.sync_desc': 'Tu progreso te sigue a donde vayas. Empieza en tu laptop, termina en tu móvil. Todo sincronizado al instante.',
        'pricing.reports_title': 'Reportes Profesionales',
        'pricing.reports_desc': 'Exporta tu data en PDF o Excel. Comparte tus avances con tu nutriólogo o contador en segundos.',

        // Pricing - FAQ
        'pricing.faq_tag': 'Preguntas Frecuentes',
        'pricing.faq_title': '¿Tienes <span class="highlight">preguntas</span>?',
        'pricing.faq_q1': '¿Qué incluye la suscripción?',
        'pricing.faq_a1': 'Tu suscripción incluye acceso completo a AUREUS Nutrición AI (nutrición clínica) y AUREUS Finance OS (control financiero). Ambas aplicaciones con todas sus características premium.',
        'pricing.faq_q2': '¿Cómo funciona la prueba gratuita?',
        'pricing.faq_a2': 'Tienes 7 días para probar todas las funciones sin compromiso. No necesitas tarjeta de crédito para registrarte. Si te gusta, puedes suscribirte después.',
        'pricing.faq_q3': '¿Puedo cancelar en cualquier momento?',
        'pricing.faq_a3': 'Sí, puedes cancelar tu suscripción cuando quieras. Sin contratos, sin penalizaciones. Tu acceso continúa hasta el final del período pagado.',
        'pricing.faq_q4': '¿Es segura mi información personal?',
        'pricing.faq_a4': 'Absolutamente. Usamos encriptación de grado bancario para proteger tus datos. Tu información nunca se comparte con terceros.',
        'pricing.faq_q5': '¿Cuándo estarán disponibles las apps móviles?',
        'pricing.faq_a5': 'Estamos trabajando activamente en las versiones para iOS y Android. Los suscriptores actuales tendrán acceso automático cuando se lancen.',
        'pricing.faq_q6': '¿Necesito ser miembro de un gimnasio?',
        'pricing.faq_a6': 'No. AUREUS Nutrición AI adapta tus planes a tu estilo de vida, ya sea que entrenes en casa, gimnasio o no entrenes.',
        'pricing.faq_q7': '¿Es apto para vegetarianos/veganos?',
        'pricing.faq_a7': 'Sí. Puedes personalizar tus preferencias dietéticas y el algoritmo generará menús completos basados en tus restricciones.',
        'pricing.faq_q8': '¿Puedo compartir mi cuenta?',
        'pricing.faq_a8': 'La suscripción Individual es personal. El plan Parejas permite dos cuentas independientes vinculadas para una gestión compartida.',

        // Pricing - Roadmap
        'roadmap.tag': 'Nuestra Visión',
        'roadmap.title': 'Hoja de Ruta <span class="highlight">AUREUS 2026</span>',
        'roadmap.subtitle': 'Estamos construyendo el ecosistema de bienestar más completo del mundo.',
        'roadmap.step1_title': 'Versiones Web Premium',
        'roadmap.step1_desc': 'Optimización total de la plataforma web, nuevas visualizaciones y sincronización cloud.',
        'roadmap.step2_title': 'Chase the Rabbit',
        'roadmap.step2_desc': 'Lanzamiento de Salud Psicológica: El tercer pilar del bienestar integral.',
        'roadmap.step3_title': 'Apps Móviles',
        'roadmap.step3_desc': 'Lanzamiento oficial en App Store y Google Play con notificaciones inteligentes.',
        'roadmap.step4_title': 'AUREUS AI Coach',
        'roadmap.step4_desc': 'Entrenador personal basado en IA que analiza tus hábitos en tiempo real.',
        'roadmap.step5_title': 'Banca Global',
        'roadmap.step5_desc': 'Sincronización automática con instituciones financieras de todo el mundo.',
        'roadmap.step6_title': 'Análisis Predictivo',
        'roadmap.step6_desc': 'Proyecciones basadas en IA sobre tu patrimonio y tendencias de salud.',
        'roadmap.step7_title': 'Family Hub',
        'roadmap.step7_desc': 'Herramientas compartidas para familias: finanzas conjuntas y metas grupales.',
        'roadmap.step8_title': 'Ecosistema Total',
        'roadmap.step8_desc': 'La integración final de los pilares del bienestar en una sola experiencia fluida.',
        'roadmap.step9_title': 'Gemelo Digital AUREUS',
        'roadmap.step9_desc': 'Tu réplica virtual evolutiva. Simula decisiones de salud y finanzas para ver su impacto antes de tomarlas.',

        // Blog Cards
        'blog.card_resource': 'Resource',
        'blog.card_infographic': 'Infographic',
        'blog.card1_title': 'Ayuno Intermitente y Claridad Mental',
        'blog.card2_title': 'El Arte del Control Financiero',
        'blog.card3_title': 'Presupuesto Base Cero: Infografía',
        'blog.card4_title': 'Domina tu Dopamina: Neurociencia',
        'blog.card5_title': 'La Disciplina se Entrena: De los Macros a tu Bienestar',
        'blog.card6_title': 'Control de Purinas: Prevención proactiva con IA',
        'blog.card7_title': 'Fondo de Emergencia: Tu Escudo de Tranquilidad',

        // Fit AI Page
        'fitai.how_title': 'El Protocolo AUREUS: Ciencia en 3 Pasos',
        'fitai.step1_title': 'Biometría Inicial',
        'fitai.step1_desc': 'Digitaliza tu perfil fisiológico. Ingresa tus datos clínicos y deja que nuestros algoritmos establezcan tu línea base metabólica con precisión de laboratorio.',
        'fitai.step2_title': 'Ingesta Inteligente',
        'fitai.step2_desc': 'Registro sin esfuerzo: Fotografía tu plato, usa comandos de voz o selecciona de tus favoritos. Nuestra IA procesa todo al instante, eliminando las búsquedas manuales.',
        'fitai.step3_title': 'Calibración Dinámica',
        'fitai.step3_desc': 'El plan evoluciona contigo. La IA recalibra tus macros semanalmente basándose en tu progreso real y bio-feedback, garantizando resultados continuos.',

        // Fit AI - Hero
        'fitai.hero_badge': 'Nutrición Clínica Inteligente',
        'fitai.hero_title': 'AUREUS Nutrición AI: Ingeniería Humana Alimentada por IA',
        'fitai.hero_subtitle': 'La plataforma definitiva para el control nutricional avanzado. Diseñada para deportistas, pacientes clínicos y entusiastas de la salud que buscan precisión milimétrica en su alimentación.',
        'fitai.hero_cta_primary': 'Comenzar Ahora',

        // Fit AI - AI Assistant
        'fitai.ai_tag': 'IA Generativa',
        'fitai.ai_title': 'El Nutriólogo que Vive en tu Bolsillo',
        'fitai.ai_planning_title': 'Planificación Inteligente',
        'fitai.ai_planning_desc': 'Nuestra Inteligencia Artificial avanzada no solo registra; planifica. Basándose en tus objetivos clínicos y preferencias, genera planes de alimentación dinámicos que se adaptan a tu ritmo de vida.',
        'fitai.ai_item1_title': 'Análisis de Inventario',
        'fitai.ai_item1_desc': 'Sugerencias basadas en lo que tienes disponible en tu despensa.',
        'fitai.ai_item2_title': 'Optimización de Macros',
        'fitai.ai_item2_desc': 'Ajuste en tiempo real para asegurar que cumples tus metas diarias.',
        'fitai.ai_item3_title': 'Listas Inteligentes',
        'fitai.ai_item3_desc': 'Exportación automática de ingredientes necesarios para la semana.',

        // Fit AI - Features / Ecosystem
        'fitai.features_tag': 'Capacidades Avanzadas',
        'fitai.features_title': 'Ecosistema de Salud de <span class="highlight">Siguiente Generación</span>',

        // Fit AI - Goals
        'fitai.goals_tag': 'Metas',
        'fitai.goals_title': 'Tus Metas, Cuantificadas',
        'fitai.goals_desc': 'Define metas de peso, porcentaje de grasa, hidratación o marcas atléticas. AUREUS Nutrición AI calcula el camino óptimo para lograrlas de forma saludable y sostenible.',
        'fitai.goal1_name': 'Pérdida de Peso',
        'fitai.goal1_target': 'Objetivo: 75kg',
        'fitai.goal2_name': 'Hidratación Diaria',
        'fitai.goal2_target': 'Objetivo: 2500ml',
        'fitai.goal3_name': 'Aumento de Masa',
        'fitai.goal3_date': 'Mantenimiento',
        'fitai.goal_status_in_progress': 'EN PROGRESO',
        'fitai.goal_initial': '84 kg INICIAL',
        'fitai.goal_meta_daily': 'META DIARIA',
        'fitai.goal_this_quarter': 'ESTE TRIMESTRE',

        // Fit AI - Clinical Control
        'fitai.clinical_tag': 'Análisis Profundo',
        'fitai.clinical_title': 'Biomarcadores y Precisión Clínica',
        'fitai.clinical_subtag': 'Control Clínico',
        'fitai.clinical_subtitle': 'Carga Glucémica y PRAL',
        'fitai.clinical_desc': 'No se trata solo de calorías. AUREUS Nutrición AI analiza el impacto metabólico real de cada alimento. Nuestro algoritmo calcula la Carga Glucémica para prevenir picos de insulina y el PRAL para monitorizar la carga renal ácida.',
        'fitai.clinical_item1_title': 'Monitorización de Insulina',
        'fitai.clinical_item1_desc': 'Evita inflamación sistémica controlando el índice glucémico diario.',
        'fitai.clinical_item2_title': 'Equilibrio Renal',
        'fitai.clinical_item2_desc': 'Optimiza tu pH corporal monitorizando el equilibrio ácido-base (PRAL).',
        'fitai.clinical_item3_title': 'Prevención de Gota',
        'fitai.clinical_item3_desc': 'Control exhaustivo de Purinas y Oxalatos para salud articular.',

        // Fit AI - Dashboard
        'fitai.dashboard_tag': 'Análisis',
        'fitai.dashboard_title': 'Bio-Dashboard: Análisis Metabólico en Tiempo Real',
        'fitai.dashboard_item1': 'Visualiza tu distribución de macros y micro-nutrientes en tiempo real.',
        'fitai.dashboard_item2': 'Monitorea tu balance calórico diario vs. gasto energético basal.',
        'fitai.dashboard_item3': 'Insights profundos sobre hidratación y carga glucémica.',
        'fitai.widget_macros': 'Distribución de Macros',
        'fitai.widget_protein_goal': 'Meta de Proteína alcanzada',
        'fitai.widget_glycemic': 'Carga Glucémica Diaria',
        'fitai.widget_glycemic_stat': '-15% vs. promedio',

        // Fit AI - Vitality
        'fitai.vitality_tag': 'Vitalidad',
        'fitai.vitality_title': 'Optimización de Rendimiento y Vitalidad',
        'fitai.vitality_subtag': 'Vitalidad',
        'fitai.vitality_subtitle': 'Rendimiento Atlético',
        'fitai.vitality_desc': 'Mantén tu rendimiento al máximo con un control inteligente de tu equilibrio hídrico. AUREUS calcula tus necesidades exactas basándose en tu nivel de actividad, clima y composición corporal.',
        'fitai.vitality_item1_title': 'Recordatorios Inteligentes',
        'fitai.vitality_item1_desc': 'Notificaciones adaptativas que te aseguran nunca estar en estado de deshidratación.',
        'fitai.vitality_item2_title': 'Balance Electrolítico',
        'fitai.vitality_item2_desc': 'Optimiza tu recuperación monitorizando la ingesta de minerales esenciales.',
        'fitai.vitality_item3_title': 'Rendimiento Atlético',
        'fitai.vitality_item3_desc': 'Visualiza cómo tu hidratación impacta directamente en tu fuerza y resistencia diaria.',

        // Finance OS Page
        'finance.hero_badge': 'Sistema Operativo Financiero',
        'finance.hero_title': 'Terminal de Comando de Riqueza',
        'finance.hero_subtitle': 'Toma el control absoluto de tus finanzas personales. Saldo neto, presupuestos inteligentes, gestión de deudas y ahorros en una sola interfaz premium y segura.',
        'finance.cta_launch': 'Lanzar App',

        'finance.assets_tag': 'Visión Integral',
        'finance.assets_title': 'Biometría de Activos en Tiempo Real',
        'finance.assets_subtag': 'Assets Tracking',
        'finance.assets_subtitle': 'Gestión de Cuentas y Saldos',
        'finance.assets_desc': 'AUREUS Finance OS no solo suma tus saldos; centraliza toda tu información financiera en tiempo real. Obtén una visión clara de tus fondos en efectivo, cuentas corrientes, ahorros y activos personales.',
        'finance.assets_step1_title': 'Resumen Mensual',
        'finance.assets_step1_desc': 'Visualiza el estado de todas tus cuentas de un vistazo con reportes detallados.',
        'finance.assets_step2_title': 'Análisis de Gastos',
        'finance.assets_step2_desc': 'Entiende en qué gastas tu dinero con una organización por categorías optimizada.',
        'finance.assets_step3_title': 'Proyección de Ahorro',
        'finance.assets_step3_desc': 'Herramientas inteligentes que te ayudan a planificar tu crecimiento financiero.',

        'finance.protocol_tag': 'Metodología de Riqueza',
        'finance.protocol_title': 'Protocolo de Ingeniería Financiera',
        'finance.protocol_card1_title': 'Diagnosis de Activos',
        'finance.protocol_card1_desc': 'Mapeo profundo de cada entrada y saldo para establecer tu configuración base con resolución clínica y precisión absoluta.',
        'finance.protocol_card2_title': 'Arquitectura Smart Flow',
        'finance.protocol_card2_desc': 'Reconfiguración matemática de flujos mediante algoritmos que eliminan la fricción operativa y optimizan tu liquidez diaria.',
        'finance.protocol_card3_title': 'Calibración Predictiva',
        'finance.protocol_card3_desc': 'Proyección continua de escenarios múltiples para asegurar un crecimiento patrimonial estable y blindar tu libertad futura.',

        'finance.features_tag': 'Capacidades Avanzadas',
        'finance.features_title': 'Capacidades de Inteligencia Financiera',
        'finance.feat_networth': 'Patrimonio Neto',
        'finance.feat_networth_desc': 'El valor real de todo lo que posees menos tus deudas, calculado al segundo.',
        'finance.feat_budget': 'Presupuestos',
        'finance.feat_budget_desc': 'Planificación dinámica que se adapta a tus ingresos y prioridades automáticamente.',
        'finance.feat_savings': 'Metas de Ahorro',
        'finance.feat_savings_desc': 'Huchas virtuales inteligentes para tus objetivos: viajes, casa, coche o fondo de emergencia.',
        'finance.feat_balance': 'Saldo Total',
        'finance.feat_balance_desc': 'Control unificado de todas tus cuentas bancarias y efectivo en tiempo real.',
        'finance.feat_reports': 'Reportes Mensuales',
        'finance.feat_reports_desc': 'Genera estados financieros claros y profesionales para entender tu salud financiera.',
        'finance.feat_subs': 'Control Recurrente',
        'finance.feat_subs_desc': 'Gestiona todas tus suscripciones y facturas fijas para evitar gastos hormiga no deseados.',
        'finance.feat_vault': 'Bóveda Digital',
        'finance.feat_subs_desc': 'Gestiona todas tus suscripciones y facturas fijas para evitar gastos hormiga no deseados.',
        'finance.feat_vault': 'Bóveda Digital',
        'finance.feat_vault_desc': 'Espacio ultra-seguro para digitalizar, centralizar y proteger tus contratos, pólizas y documentos financieros clave.',

        // Missing Finance OS Keys
        'showcase.wealth_title': 'Análisis de Wealth',
        'showcase.wealth_desc': 'Visualización avanzada de tus activos y crecimiento patrimonial a largo plazo.',
        'showcase.scan_title': 'Smart Scanning',
        'showcase.scan_desc': 'Digitalización instantánea de facturas con categorización automática por IA.',

        // Liquidity Section
        'finance.liquidity_title': 'Gestión de Liquidez en Tiempo Real',
        'finance.liquidity_desc': 'Gestiona tus entradas y salidas con una fluidez nunca antes vista. Categoriza automáticamente tus gastos y visualiza tu flujo de caja con gráficos de alta fidelidad.',
        'finance.liquidity_item1_title': 'Categorización AI',
        'finance.liquidity_item1_desc': 'Tus movimientos se organizan solos para que sepas exactamente a dónde va cada peso.',
        'finance.liquidity_item2_title': 'Alertas en Tiempo Real',
        'finance.liquidity_item2_desc': 'Recibe notificaciones inteligentes cuando estés cerca de tus límites establecidos.',
        'finance.liquidity_item3_title': 'Optimización de Gasto',
        'finance.liquidity_item3_desc': 'Descubre patrones de ahorro y optimiza tus suscripciones de forma automática.',

        // Goals Section
        'finance.goal_paris': 'Viaje a París',
        'finance.goal_home': 'Enganche Nueva Casa',
        'finance.goal_business': 'Capital para Negocio',


        'finance.security_tag': 'Seguridad Total',
        'finance.security_title': 'Blindaje de Nivel Bancario',
        'finance.security_desc': 'Tus datos financieros son sagrados. AUREUS implementa los más altos estándares de seguridad y cifrado para asegurar que solo tú tengas acceso a tu información financiera.',
        'finance.security_item1_title': 'Cifrado Local',
        'finance.security_item1_desc': 'Tus datos se cifran en tu dispositivo antes de siquiera tocar la nube.',
        'finance.security_item2_title': 'Acceso Biométrico',
        'finance.security_item2_desc': 'Compatible con FaceID y TouchID para un acceso instantáneo y seguro.',
        'finance.security_item3_title': 'Zero Knowledge',
        'finance.security_item3_desc': 'Nosotros no podemos leer tus credenciales bancarias. Ni siquiera nosotros.',

        // Finance OS - Deep Dives
        'finance.dash_tag': 'Dashboard',
        'finance.dash_title': 'Terminal de Mando de Patrimonio',
        'finance.dash_item1': 'Personaliza tu dashboard para que lo más importante esté al frente.',
        'finance.dash_item2': 'Arrastra y suelta widgets incluyendo patrimonio neto, transacciones y más.',
        'finance.dash_item3': 'Revisa tu resumen mensual para obtener insights rápidos de tus gastos.',

        'finance.goals_tag': 'Metas',
        'finance.goals_title': 'Arquitectura de Objetivos de Capital',
        'finance.goals_desc': 'Crea un plan claro para ahorrar para lo que importa, ya sea una casa, unas vacaciones o un fondo para imprevistos. Establece objetivos, sigue tu progreso y mantente motivado mientras ves crecer tus ahorros con el tiempo.',

        'finance.budget_tag': 'Presupuestos',
        'finance.budget_title': 'Flexibilidad Operativa Vital',
        'finance.budget_desc': 'Tener un presupuesto solo funciona si se adapta a tu estilo de vida. AUREUS ofrece formas flexibles de presupuestar, proporcionando la estructura que funciona para ti.',
        'finance.budget_mockup_date': 'Diciembre 2026',
        'finance.budget_mockup_remaining': 'Restante para presupuestar',
        'finance.budget_cat_housing': 'Vivienda',
        'finance.budget_cat_food': 'Comida',
        'finance.budget_cat_transport': 'Transporte',

        'finance.forecast_tag': 'Proyecciones',
        'finance.forecast_title': 'Simulación de Escenarios Futuros',
        'finance.forecast_feat1': '<strong>Modelado de Escenarios:</strong> Analiza cómo cada decisión de hoy impacta tus próximos 12 meses de estabilidad.',
        'finance.forecast_feat2': '<strong>Sincronización de Metas:</strong> Ajusta automáticamente tus proyecciones basándote en la velocidad de tus ahorros actuales.',
        'finance.forecast_feat3': '<strong>Estabilidad Proyectada:</strong> Identifica periodos de alta liquidez frente a picos de gastos estacionales con precisión matemática.',
        'finance.forecast_tab_past': 'Pasado',
        'finance.forecast_tab_present': 'Actual',
        'finance.forecast_tab_budget': 'Presupuesto',
        'finance.forecast_header_cat': 'CATEGORÍA',
        'finance.forecast_cat_salary': 'Salario Base',
        'finance.forecast_cat_extra': 'Ingresos Extras',
        'finance.forecast_cat_home': 'Casa',
        'finance.forecast_cat_grocery': 'Súper',
        'finance.forecast_cat_dining': 'Comida',
        'finance.forecast_cat_transport': 'Transp.',
        'finance.forecast_cat_leisure': 'Ocio',
        'finance.forecast_cat_travel': 'Viajes',
        'finance.forecast_cat_savings': 'Ahorro Meta',
        'finance.forecast_cat_margin': 'Margen Neto',

        // Widgets & Mockups
        'finance.widget_total_balance': 'saldo total',
        'finance.widget_spent': 'gastados',
        'finance.widget_this_month': 'este mes',
        'finance.widget_vs_prev_month': 'vs. mes pasado',
        'finance.goal_completed': 'COMPLETADO',
        'finance.goal_target': 'OBJETIVO',

        // Fit AI - Budgeting (Architecture)
        'fitai.budget_tag': 'Registro',
        'fitai.budget_title': 'Arquitectura de Nutrientes',
        'fitai.budget_desc': 'Gestiona tus calorías como si fuera dinero. Distribuye tu energía a lo largo del día y mantente dentro de tus límites metabólicos.',
        'fitai.budget_date': 'Registro de Hoy - 23 Ene',
        'fitai.budget_remaining_label': 'Restantes (Meta: 2200)',
        'fitai.budget_breakfast': 'Desayuno',
        'fitai.budget_lunch': 'Comida',
        'fitai.budget_dinner': 'Cena (Plan)',
        'fitai.budget_status_pending': 'Por consumir',
        'fitai.budget_status_ok': 'Ok',

        // Synergy Section
        'synergy.tag': 'Sinergia Exclusiva',
        'synergy.title': 'Ecosistema <span class="highlight">Conectado</span>',
        'synergy.subtitle': 'Tu salud física y financiera están entrelazadas. AUREUS es el puente que las optimiza en tiempo real.',
        'synergy.card1': '<strong>Alimentación Consciente:</strong> Menos gasto en ultraprocesados = Más ahorro para tu futuro.',
        'synergy.card2': '<strong>Longevidad Financiera:</strong> Mejor salud hoy = Menores gastos médicos y seguros mañana.',
        'synergy.card3': '<strong>Mentalidad de Éxito:</strong> La disciplina en tus macros se traduce en disciplina en tus finanzas.',

        // Detailed Features List (Pricing Page)
        'features_list.fit_1': 'Seguimiento ilimitado de macros y calorías',
        'features_list.fit_2': 'Control de ácido úrico y purinas',
        'features_list.fit_3': 'Timer de ayuno intermitente',
        'features_list.fit_4': 'Planificador de comidas semanal',
        'features_list.fit_5': 'Base de datos de alimentos premium',
        'features_list.fit_6': 'Análisis de progreso y tendencias',
        'features_list.fit_7': 'Sincronización en la nube',

        'features_list.finance_1': 'Dashboard de patrimonio neto',
        'features_list.finance_2': 'Presupuestos inteligentes adaptativos',
        'features_list.finance_3': 'Metas de ahorro personalizadas',
        'features_list.finance_4': 'Gestión de deudas (Snowball/Avalanche)',
        'features_list.finance_5': 'Tracker de inversiones',
        'features_list.finance_6': 'Control de suscripciones',
        'features_list.finance_7': 'Reportes y análisis financieros',

        'roadmap.step_label': 'Paso',

        // Footer
        'footer.tagline': 'Tu bienestar, simplificado.',
        'footer.product': 'Producto',
        'footer.link_features': 'Características',
        'footer.link_pricing': 'Precios',
        'footer.link_faq': 'FAQ',
        'footer.link_blog': 'Blog',
        'footer.apps': 'Aplicaciones',
        'footer.link_nutrition': 'AUREUS Nutrición AI',
        'footer.link_finance': 'AUREUS Finance OS',
        'footer.link_ambassadors': 'Embajadores',
        'footer.rights': 'Todos los derechos reservados.',

        // Ambassadors Page
        'ambassadors.hero_badge': 'Acceso Selectivo',
        'ambassadors.hero_title': 'Impulsa tu Impacto.<br>Sé un Ambassador Elite.',
        'ambassadors.hero_subtitle': 'No buscamos vendedores, buscamos visionarios. Únete a la red exclusiva de AUREUS y disfruta de la app gratis mientras transformas vidas con la IA más avanzada en salud y finanzas.',
        'ambassadors.hero_cta_primary': 'Unirme Ahora',
        'ambassadors.hero_cta_secondary': 'Ver Mecánica',
        'ambassadors.features_tag': 'Privilegios',
        'ambassadors.features_title': '¿Por qué ser un Ambassador?',
        'ambassadors.feature1_title': 'Semanas Premium',
        'ambassadors.feature1_desc': 'Obtén semanas de acceso total gratuito por cada referido activo. Vive la experiencia AUREUS sin costo.',
        'ambassadors.feature2_title': 'Estatus Verificado',
        'ambassadors.feature2_desc': 'Obtén el check dorado en tu perfil global de AUREUS y destaca como una autoridad en la comunidad.',
        'ambassadors.feature3_title': 'Formación de Élite',
        'ambassadors.feature3_desc': 'Acceso a seminarios exclusivos de Biohacking, Finanzas Descentralizadas y Estrategias de Crecimiento.',
        'ambassadors.steps_tag': 'El Camino',
        'ambassadors.steps_title': 'Cómo Formar Parte',
        'ambassadors.step1_title': 'Tu Cuenta',
        'ambassadors.step1_desc': 'Crea tu cuenta en AUREUS. Automáticamente tendrás habilitada la opción de "Referir" en tu perfil personal.',
        'ambassadors.step1_detail1': 'Acceso Inmediato',
        'ambassadors.step1_detail2': 'Sin Formularios',
        'ambassadors.step2_title': 'Comparte',
        'ambassadors.step2_desc': 'Encuentra tu código único o enlace en tu dashboard. Compártelo con tu red de futuros visionarios.',
        'ambassadors.step2_detail1': 'Código Único',
        'ambassadors.step2_detail2': 'Invita Fácil',
        'ambassadors.step3_title': 'Conexión',
        'ambassadors.step3_desc': 'Al registrarse, tu invitado ingresa tu código de referido. La conexión se valida al instante y ambos ganan.',
        'ambassadors.step3_detail1': 'Validación Real',
        'ambassadors.step3_detail2': 'Recompensa Auto',
        'ambassadors.ranks_tag': 'Progresión',
        'ambassadors.ranks_title': 'Tiers de Influencia',
        'ambassadors.rank1_badge': 'Tier 1',
        'ambassadors.rank1_title': 'Ambassador',
        'ambassadors.rank1_reward': '1 Semana Premium / Referido',
        'ambassadors.rank1_feat1': 'Dashboard de Impacto',
        'ambassadors.rank1_feat2': 'Acceso a la Academia',
        'ambassadors.rank1_feat3': 'Acceso a Versiones Beta',
        'ambassadors.rank1_feat4': 'Canal Discord Exclusivo',
        'ambassadors.rank2_badge': 'Tier 2',
        'ambassadors.rank2_title': 'Silver Elite',
        'ambassadors.rank2_reward': '1 Semana Premium / Referido',
        'ambassadors.rank2_feat1': 'Soporte Prioritario 24/7',
        'ambassadors.rank2_feat2': 'Eventos Presenciales',
        'ambassadors.rank2_feat3': 'Insignia de Perfil Silver',
        'ambassadors.rank2_feat4': 'Descuento en Masterclasses',
        'ambassadors.rank3_badge': 'Tier 3',
        'ambassadors.rank3_title': 'Gold Master',
        'ambassadors.rank3_reward': '2 Semanas Premium / Referido',
        'ambassadors.rank3_feat1': 'Perfil Verificado Global',
        'ambassadors.rank3_feat2': 'Voz en el Roadmap de IA',
        'ambassadors.rank3_feat3': 'Sesión 1v1 Trimestral',
        'ambassadors.rank3_feat4': 'Invitación a Retiros Anuales',
        'ambassadors.cta_title': '¿Listo para Trascender?',
        'ambassadors.cta_subtitle': 'El futuro no se espera, se construye. Empieza hoy tu camino con AUREUS.',
        'ambassadors.cta_btn': 'Unirme al Programa Elite',
        'nav.apps_ambassadors_desc': 'Programa Elite de referidos',
        'footer.copyright': '© 2026 AUREUS. Todos los derechos reservados.',
    },
    en: {
        // Navigation
        'nav.features': 'Features',
        'nav.apps': 'Apps',
        'nav.pricing': 'Pricing',
        'nav.blog': 'Blog',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contact',
        'nav.start_trial': 'Free Trial',
        'nav.login': 'Log In',
        'nav.dashboard': 'My Dashboard',

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
        'proof.gyms': 'Gyms',
        'proof.diabetics': 'Diabetics',
        'proof.entrepreneurs': 'Entrepreneurs',
        'proof.families': 'Families',

        // Nav Dropdown Apps
        'nav.apps_fit_desc': 'Clinical nutrition, macros, fasting and meal planning',
        'nav.apps_finance_desc': 'Financial control, budgets, savings and investments',

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
        'showcase.nutri_title': 'Bio-Individuality',
        'showcase.nutri_desc': 'Precision nutrition adapted to your metabolism and vital objectives.',
        'showcase.metabolic_title': 'Metabolic Control',
        'showcase.metabolic_desc': 'Personalized fasting protocols to optimize longevity and energy.',
        'features.sync_title': 'Total Synchronization',
        'features.sync_desc': 'Two-way connection with Apple Health and Google Fit to integrate physical activity into metabolic calculations.',

        // Missing Finance OS Keys
        'showcase.wealth_title': 'Wealth Analysis',
        'showcase.wealth_desc': 'Advanced visualization of your assets and long-term net worth growth.',
        'showcase.scan_title': 'Smart Scanning',
        'showcase.scan_desc': 'Instant bill digitization with automatic AI categorization.',

        // Liquidity Section
        'finance.liquidity_title': 'Real-Time Liquidity Management',
        'finance.liquidity_desc': 'Manage your inflows and outflows with unprecedented fluidity. Automatically categorize expenses and visualize cash flow with high-fidelity charts.',
        'finance.liquidity_item1_title': 'AI Categorization',
        'finance.liquidity_item1_desc': 'Your transactions organize themselves so you know exactly where every penny goes.',
        'finance.liquidity_item2_title': 'Real-Time Alerts',
        'finance.liquidity_item2_desc': 'Receive intelligent notifications when you are close to your set limits.',
        'finance.liquidity_item3_title': 'Expense Optimization',
        'finance.liquidity_item3_desc': 'Discover savings patterns and optimize your subscriptions automatically.',

        // Goals Section
        'finance.goal_paris': 'Trip to Paris',
        'finance.goal_home': 'New Home Down Payment',
        'finance.goal_business': 'Business Capital',


        // Core Tech
        'tech.tag_small': 'Invisible Power',
        'tech.title': 'Core Technology <span class="highlight">AUREUS</span>',
        'tech.ai_title': 'Clinical AI Engine',
        'tech.ai_desc': 'Algorithms trained with real medical data for precise and safe recommendations.',
        'tech.sec_title': 'Bank-Grade Security',
        'tech.sec_desc': 'End-to-end AES-256 encryption. Your data is yours alone.',
        'tech.sync_title': 'Universal Sync',
        'tech.sync_desc': 'Instant synchronization between mobile, tablet, and web. Start here, finish there.',
        'tech.off_title': 'Smart Offline Mode',
        'tech.off_desc': 'The app works 100% without internet. Data uploads when connection is restored.',
        'tech.rep_title': 'Pro Reports',
        'tech.rep_desc': 'Export your history in formats ready for your nutritionist or accountant (PDF/XLS).',

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
        'how.step1_desc': 'Create your account and get 7 days free trial. No credit card needed.',
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
        'pricing.savings': 'Save $25/month',
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
        'pricing.note': '7 days free • Cancel anytime',
        'pricing.web': 'Available on Web',
        'pricing.coming': 'iOS & Android coming soon',
        'pricing.included_tag': 'One price, everything included',
        'pricing.included_title': 'Full access to <span class="highlight">2 premium apps</span>',

        // FAQ
        'faq.tag': 'FAQ',
        'faq.title': 'Have <span class="highlight">questions</span>?',
        'faq.q1': 'What\'s included in the subscription?',
        'faq.a1': 'Your subscription includes full access to AUREUS FIT AI (clinical nutrition) and AUREUS Finance OS (financial control). Both apps with all premium features.',
        'faq.q2': 'How does the free trial work?',
        'faq.a2': 'You have 7 days to try all features without commitment. No credit card needed to sign up. If you like it, you can subscribe later.',
        'faq.q3': 'Can I cancel anytime?',
        'faq.a3': 'Yes, you can cancel your subscription anytime. No contracts, no penalties. Your access continues until the end of the paid period.',
        'faq.q4': 'Is my personal information secure?',
        'faq.a4': 'Absolutely. We use bank-grade encryption to protect your data. Your information is never shared with third parties.',
        'faq.q5': 'When will mobile apps be available?',
        'faq.a5': 'We are actively working on iOS and Android versions. Current subscribers will have automatic access when they launch.',
        'faq.q6': 'Do I need a gym membership?',
        'faq.a6': 'No. AUREUS Nutrition AI adapts your plans to your lifestyle, whether you train at home, gym, or don\'t train.',
        'faq.q7': 'Is it suitable for vegetarians/vegans?',
        'faq.a7': 'Yes. You can customize your dietary preferences and the algorithm will generate full menus based on your restrictions.',
        'faq.q8': 'Can I share my account?',
        'faq.a8': 'The Individual subscription is personal. The Couples plan allows two independent linked accounts for shared management.',

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
        'footer.rights': 'All rights reserved.',
        'footer.link_features': 'Features',
        'footer.link_pricing': 'Pricing',
        'footer.link_faq': 'FAQ',
        'footer.link_blog': 'Blog',
        'footer.link_nutrition': 'AUREUS Nutrition AI',
        'footer.link_finance': 'AUREUS Finance OS',
        'footer.link_ambassadors': 'Ambassadors',

        // CTA Section (Added)
        'cta.tag': 'Start Today',
        'cta.title': 'Ready to regain <span class="highlight">total control</span>?',
        'cta.desc': 'Make the decision today that will transform your health and finances forever with the AUREUS suite.',
        'cta.btn': 'Start Now',
        'cta.trust': 'Try it free • 14-day trial',

        // Academy Section (Added)
        'academy.tag': 'AUREUS Academy',
        'academy.title': 'Mastery <span class="highlight">Center</span>',
        'academy.read_more': 'Read more',
        'academy.cat1': 'Finance',
        'academy.card1_title': 'The Art of Financial Control',
        'academy.card1_desc': 'How to assign every dollar a purpose to eliminate financial anxiety.',
        'academy.cat2': 'Nutrition',
        'academy.card2_title': 'Nutrition, Fasting & Mental Clarity',
        'academy.card2_desc': 'Optimize your biorhythm and cellular nutrition to achieve a state of deep focus.',
        'academy.cat3': 'Wealth',
        'academy.card3_title': 'Metabolic Mastery: The Architecture of Health',
        'academy.card3_desc': 'A technical guide on BMR, Intermittent Fasting, Keto, and Cellular Nutrition.',

        // Blog Page
        'blog.title': 'Latest News',
        'blog.subtitle': 'Designed for <span class="highlight">Your Lifestyle</span>',
        'blog.persona_entrepreneurs': 'Entrepreneurs',
        'blog.persona_entrepreneurs_desc': 'Separate personal and business finances. Control your cash flow and maximize your mental and fiscal performance.',
        'blog.persona_families': 'Families',
        'blog.persona_families_desc': 'Plan your family\'s future. Shared budgets and healthy menus for everyone at home.',
        'blog.persona_performers': 'High Performers',
        'blog.persona_performers_desc': 'Optimize every aspect of your biology and economy. The ultimate tool for those who accept no limits.',
        'blog.recent_articles': 'Recent Articles',
        'blog.filter_all': 'All',
        'blog.filter_nutrition': 'Nutrition',
        'blog.filter_finance': 'Finance',
        'blog.filter_mindset': 'Mindset',
        'blog.filter_updates': 'Updates',
        'blog.newsletter_title': 'Optimize your inbox',
        'blog.newsletter_desc': 'Get the best clinical nutrition and smart finance tips. No spam, just value.',
        'blog.newsletter_placeholder': 'example@email.com',

        // Pricing Beta Section
        'beta.badge': 'Updates',
        'beta.title': 'Early Access: Exclusive Beta AUREUS 2.0',
        'beta.desc': 'Join the select group of founding users. Optimize your health and finances before anyone else with our new comprehensive suite.',
        'beta.btn': 'Join the Beta',
        'beta.placeholder': 'Your email address',

        // Pricing - Why Pay
        'pricing.whypay_title': 'Why pay for <span class="highlight">AUREUS</span>?',
        'pricing.whypay_subtitle': 'Investing in yourself is always the best decision.',
        'pricing.noads_title': 'No ads, ever',
        'pricing.noads_desc': 'Your experience is always clean and focused on what matters. You won\'t see ads interrupting your flow.',
        'pricing.privacy_title': 'Your data is yours',
        'pricing.privacy_desc': 'We never sell your financial or health information. Your privacy is our absolute priority.',
        'pricing.dev_title': 'Constant development',
        'pricing.dev_desc': 'New features every month. Your subscription funds continuous improvements that you decide with your feedback.',
        'pricing.support_title': 'Real support',
        'pricing.support_desc': 'A team dedicated to helping you. Fast and human responses, no generic chatbots.',
        'pricing.sync_title': 'Universal Sync',
        'pricing.sync_desc': 'Your progress follows you wherever you go. Start on your laptop, finish on your mobile. Everything synchronized instantly.',
        'pricing.reports_title': 'Professional Reports',
        'pricing.reports_desc': 'Export your data in PDF or Excel. Share your progress with your nutritionist or accountant in seconds.',

        // Pricing - FAQ
        'pricing.faq_tag': 'FAQ',
        'pricing.faq_title': 'Have <span class="highlight">questions</span>?',
        'pricing.faq_q1': 'What does the subscription include?',
        'pricing.faq_a1': 'Your subscription includes full access to AUREUS Nutrition AI (clinical nutrition) and AUREUS Finance OS (financial control). Both applications with all their premium features.',
        'pricing.faq_q2': 'How does the free trial work?',
        'pricing.faq_a2': 'You have 14 days to try all features without commitment. No credit card required to sign up. If you like it, you can subscribe later.',
        'pricing.faq_q3': 'Can I cancel at any time?',
        'pricing.faq_a3': 'Yes, you can cancel your subscription whenever you want. No contracts, no penalties. Your access continues until the end of the paid period.',
        'pricing.faq_q4': 'Is my personal information safe?',
        'pricing.faq_a4': 'Absolutely. We use bank-grade encryption to protect your data. Your information is never shared with third parties.',
        'pricing.faq_q5': 'When will mobile apps be available?',
        'pricing.faq_a5': 'We are actively working on iOS and Android versions. Current subscribers will have automatic access when they launch.',
        'pricing.faq_q6': 'Do I need a gym membership?',
        'pricing.faq_a6': 'No. AUREUS Nutrition AI adapts your plans to your lifestyle, whether you train at home, gym, or don\'t train.',
        'pricing.faq_q7': 'Do I need special equipment?',
        'pricing.faq_a7': 'No. AUREUS adapts to your environment. You can train at a gym, at home with basic equipment, or just with your body weight.',
        'pricing.faq_q8': 'Can I share my account?',
        'pricing.faq_a8': 'The Individual subscription is personal. The Couples plan allows two independent accounts linked for shared management.',

        // Pricing - Roadmap
        'roadmap.tag': 'Our Vision',
        'roadmap.title': 'Roadmap <span class="highlight">AUREUS 2026</span>',
        'roadmap.subtitle': 'We are building the most complete wellness ecosystem in the world.',
        'roadmap.step1_title': 'Premium Web Versions',
        'roadmap.step1_desc': 'Total optimization of the web platform, new visualizations, and cloud sync.',
        'roadmap.step2_title': 'Chase the Rabbit',
        'roadmap.step2_desc': 'Launch of Psychological Health: The third pillar of integral wellness.',
        'roadmap.step3_title': 'Mobile Apps',
        'roadmap.step3_desc': 'Official launch on App Store and Google Play with smart notifications.',
        'roadmap.step4_title': 'AUREUS AI Coach',
        'roadmap.step4_desc': 'AI-based personal trainer that analyzes your habits in real-time.',
        'roadmap.step5_title': 'Global Banking',
        'roadmap.step5_desc': 'Automatic synchronization with financial institutions worldwide.',
        'roadmap.step6_title': 'Predictive Analysis',
        'roadmap.step6_desc': 'AI-based projections on your net worth and health trends.',
        'roadmap.step7_title': 'Family Hub',
        'roadmap.step7_desc': 'Shared tools for families: joint finances and group goals.',
        'roadmap.step8_title': 'Total Ecosystem',
        'roadmap.step8_desc': 'The final integration of wellness pillars into a single seamless experience.',
        'roadmap.step9_title': 'AUREUS Digital Twin',
        'roadmap.step9_desc': 'Your evolving virtual replica. Simulate health and finance decisions to see their impact before making them.',

        // Synergy Section
        'synergy.tag': 'Exclusive Synergy',
        'synergy.title': 'Connected <span class="highlight">Ecosystem</span>',
        'synergy.subtitle': 'Your physical and financial health are intertwined. AUREUS is the bridge that optimizes them in real-time.',
        'synergy.card1': '<strong>Conscious Eating:</strong> Less spending on ultra-processed foods = More savings for your future.',
        'synergy.card2': '<strong>Financial Longevity:</strong> Better health today = Lower medical expenses and insurance tomorrow.',
        'synergy.card3': '<strong>Success Mindset:</strong> Discipline in your macros translates to discipline in your finances.',

        // Detailed Features List (Pricing Page)
        'features_list.fit_1': 'Unlimited macro and calorie tracking',
        'features_list.fit_2': 'Uric acid and purine control',
        'features_list.fit_3': 'Intermittent fasting timer',
        'features_list.fit_4': 'Weekly meal planner',
        'features_list.fit_5': 'Premium food database',
        'features_list.fit_6': 'Progress analysis and trends',
        'features_list.fit_7': 'Cloud synchronization',

        'features_list.finance_1': 'Net worth dashboard',
        'features_list.finance_2': 'Adaptive smart budgets',
        'features_list.finance_3': 'Personalized savings goals',
        'features_list.finance_4': 'Debt management (Snowball/Avalanche)',
        'features_list.finance_5': 'Investment tracker',
        'features_list.finance_6': 'Subscription control',
        'features_list.finance_7': 'Financial reports and analysis',

        'roadmap.step_label': 'Step',

        // Ambassadors Page
        'ambassadors.hero_badge': 'Selective Access',
        'ambassadors.hero_title': 'Boost Your Impact.<br>Be an Elite Ambassador.',
        'ambassadors.hero_subtitle': 'We are not looking for sellers, we are looking for visionaries. Join the exclusive AUREUS network and enjoy the app for free while transforming lives with the most advanced AI in health and finance.',
        'ambassadors.hero_cta_primary': 'Join Now',
        'ambassadors.hero_cta_secondary': 'See Mechanics',
        'ambassadors.features_tag': 'Privileges',
        'ambassadors.features_title': 'Why be an Ambassador?',
        'ambassadors.feature1_title': 'Premium Weeks',
        'ambassadors.feature1_desc': 'Get weeks of total free access for each active referral. Live the AUREUS experience at no cost.',
        'ambassadors.feature2_title': 'Verified Status',
        'ambassadors.feature2_desc': 'Get the golden check on your AUREUS global profile and stand out as an authority in the community.',
        'ambassadors.feature3_title': 'Elite Training',
        'ambassadors.feature3_desc': 'Access to exclusive seminars on Biohacking, Decentralized Finance, and Growth Strategies.',
        'ambassadors.steps_tag': 'The Path',
        'ambassadors.steps_title': 'How to Join',
        'ambassadors.step1_title': 'Your Account',
        'ambassadors.step1_desc': 'Create your account in AUREUS. You will automatically have the "Refer" option enabled in your personal profile.',
        'ambassadors.step1_detail1': 'Immediate Access',
        'ambassadors.step1_detail2': 'No Forms',
        'ambassadors.step2_title': 'Share',
        'ambassadors.step2_desc': 'Find your unique code or link in your dashboard. Share it with your network of future visionaries.',
        'ambassadors.step2_detail1': 'Unique Code',
        'ambassadors.step2_detail2': 'Easy Invite',
        'ambassadors.step3_title': 'Connection',
        'ambassadors.step3_desc': 'Upon registration, your guest enters your referral code. The connection is validated instantly and both win.',
        'ambassadors.step3_detail1': 'Real Validation',
        'ambassadors.step3_detail2': 'Auto Reward',
        'ambassadors.ranks_tag': 'Progression',
        'ambassadors.ranks_title': 'Tiers of Influence',
        'ambassadors.rank1_badge': 'Tier 1',
        'ambassadors.rank1_title': 'Ambassador',
        'ambassadors.rank1_reward': '1 Premium Week / Referral',
        'ambassadors.rank1_feat1': 'Impact Dashboard',
        'ambassadors.rank1_feat2': 'Academy Access',
        'ambassadors.rank1_feat3': 'Beta Access',
        'ambassadors.rank1_feat4': 'Exclusive Discord Channel',
        'ambassadors.rank2_badge': 'Tier 2',
        'ambassadors.rank2_title': 'Silver Elite',
        'ambassadors.rank2_reward': '1 Premium Week / Referral',
        'ambassadors.rank2_feat1': '24/7 Priority Support',
        'ambassadors.rank2_feat2': 'In-Person Events',
        'ambassadors.rank2_feat3': 'Silver Profile Badge',
        'ambassadors.rank2_feat4': 'Masterclass Discount',
        'ambassadors.rank3_badge': 'Tier 3',
        'ambassadors.rank3_title': 'Gold Master',
        'ambassadors.rank3_reward': '2 Premium Weeks / Referral',
        'ambassadors.rank3_feat1': 'Global Verified Profile',
        'ambassadors.rank3_feat2': 'Voice in AI Roadmap',
        'ambassadors.rank3_feat3': 'Quarterly 1v1 Session',
        'ambassadors.rank3_feat4': 'Invitation to Annual Retreats',
        'ambassadors.cta_title': 'Ready to Transcend?',
        'ambassadors.cta_subtitle': 'The future is not waited for, it is built. Start your path with AUREUS today.',
        'ambassadors.cta_btn': 'Join the Elite Program',
        'nav.apps_ambassadors_desc': 'Elite referral program',
        'footer.copyright': '© 2026 AUREUS. All rights reserved.',

        // Fit AI Page
        'fitai.how_title': 'The AUREUS Protocol: Science in 3 Steps',
        'fitai.step1_title': 'Initial Biometry',
        'fitai.step1_desc': 'Digitize your physiological profile. Enter your clinical data and let our algorithms establish your metabolic baseline with lab precision.',
        'fitai.step2_title': 'Smart Intake',
        'fitai.step2_desc': 'Effortless tracking: Snap your meal, use voice commands, or select from favorites. Our AI processes everything instantly, eliminating manual searches.',
        'fitai.step3_title': 'Dynamic Calibration',
        'fitai.step3_desc': 'The plan evolves with you. The AI recalibrates your macros weekly based on your actual progress and bio-feedback, guaranteeing continuous results.',

        // Fit AI - Hero
        'fitai.hero_badge': 'Smart Clinical Nutrition',
        'fitai.hero_title': 'AUREUS Nutrition AI: Human Engineering Powered by AI',
        'fitai.hero_subtitle': 'The ultimate platform for advanced nutritional control. Designed for athletes, clinical patients, and health enthusiasts seeking nanometric precision in their diet.',
        'fitai.hero_cta_primary': 'Start Now',

        // Fit AI - AI Assistant
        'fitai.ai_tag': 'Generative AI',
        'fitai.ai_title': 'The Nutritionist Living in Your Pocket',
        'fitai.ai_planning_title': 'Smart Planning',
        'fitai.ai_planning_desc': 'Our advanced AI doesn\'t just track; it plans. Based on your clinical goals and preferences, it generates dynamic meal plans that adapt to your lifestyle.',
        'fitai.ai_item1_title': 'Inventory Analysis',
        'fitai.ai_item1_desc': 'Suggestions based on what you have available in your pantry.',
        'fitai.ai_item2_title': 'Macro Optimization',
        'fitai.ai_item2_desc': 'Real-time adjustment to ensure you meet your daily goals.',
        'fitai.ai_item3_title': 'Smart Lists',
        'fitai.ai_item3_desc': 'Automatic export of necessary ingredients for the week.',

        // Fit AI - Features / Ecosystem
        'fitai.features_tag': 'Advanced Capabilities',
        'fitai.features_title': 'Next Generation <span class="highlight">Health Ecosystem</span>',

        // Fit AI - Goals
        'fitai.goals_tag': 'Goals',
        'fitai.goals_title': 'Your Goals, Quantified',
        'fitai.goals_desc': 'Define goals for weight, body fat, hydration, or athletic markers. AUREUS Nutrition AI calculates the optimal path to achieve them healthily and sustainably.',
        'fitai.goal1_name': 'Weight Loss',
        'fitai.goal1_target': 'Target: 75kg',
        'fitai.goal2_name': 'Daily Hydration',
        'fitai.goal3_name': 'Mass Gain',
        'fitai.goal3_date': 'Maintenance',
        'fitai.goal_status_in_progress': 'IN PROGRESS',
        'fitai.goal_initial': '84 kg INITIAL',
        'fitai.goal_meta_daily': 'DAILY GOAL',
        'fitai.goal_this_quarter': 'THIS QUARTER',

        // Fit AI - Clinical Control
        'fitai.clinical_tag': 'Deep Analysis',
        'fitai.clinical_title': 'Biomarkers and Clinical Precision',
        'fitai.clinical_subtag': 'Clinical Control',
        'fitai.clinical_subtitle': 'Glycemic Load and PRAL',
        'fitai.clinical_desc': 'It\'s not just about calories. AUREUS Nutrition AI analyzes the real metabolic impact of every food. Our algorithm calculates Glycemic Load to prevent insulin spikes and PRAL to monitor renal acid load.',
        'fitai.clinical_item1_title': 'Insulin Monitoring',
        'fitai.clinical_item1_desc': 'Prevent systemic inflammation by controlling daily glycemic index.',
        'fitai.clinical_item2_title': 'Renal Balance',
        'fitai.clinical_item2_desc': 'Optimize your body pH by monitoring acid-base balance (PRAL).',
        'fitai.clinical_item3_title': 'Gout Prevention',
        'fitai.clinical_item3_desc': 'Comprehensive control of Purines and Oxalates for joint health.',

        // Fit AI - Dashboard
        'fitai.dashboard_tag': 'Analysis',
        'fitai.dashboard_title': 'Bio-Dashboard: Real-Time Metabolic Analysis',
        'fitai.dashboard_item1': 'Visualize your macro and micro-nutrient distribution in real-time.',
        'fitai.dashboard_item2': 'Monitor your daily caloric balance vs. basal metabolic rate.',
        'fitai.dashboard_item3': 'Deep insights on hydration and glycemic load.',
        'fitai.widget_macros': 'Macro Distribution',
        'fitai.widget_protein_goal': 'Protein Goal Reached',
        'fitai.widget_glycemic': 'Daily Glycemic Load',
        'fitai.widget_glycemic_stat': '-15% vs. average',

        // Fit AI - Vitality
        'fitai.vitality_tag': 'Vitality',
        'fitai.vitality_title': 'Performance and Vitality Optimization',
        'fitai.vitality_subtag': 'Vitality',
        'fitai.vitality_subtitle': 'Athletic Performance',
        'fitai.vitality_desc': 'Keep your performance at its peak with smart hydration balance control. AUREUS calculates your exact needs based on activity level, climate, and body composition.',
        'fitai.vitality_item1_title': 'Smart Reminders',
        'fitai.vitality_item1_desc': 'Adaptive notifications ensuring you never reach dehydration.',
        'fitai.vitality_item2_title': 'Electrolyte Balance',
        'fitai.vitality_item2_desc': 'Optimize recovery by monitoring essential mineral intake.',
        'fitai.vitality_item3_title': 'Athletic Performance',
        'fitai.vitality_item3_desc': 'Visualize how hydration directly impacts your daily strength and endurance.',

        // Fit AI - Budgeting (Architecture)
        'fitai.budget_tag': 'Logging',
        'fitai.budget_title': 'Nutrient Architecture',
        'fitai.budget_desc': 'Manage your calories like money. Distribute your energy throughout the day and stay within your metabolic limits.',
        'fitai.budget_date': 'Today\'s Log - Jan 23',
        'fitai.budget_remaining_label': 'Remaining (Target: 2200)',
        'fitai.budget_breakfast': 'Breakfast',
        'fitai.budget_lunch': 'Lunch',
        'fitai.budget_dinner': 'Dinner (Plan)',
        'fitai.budget_status_pending': 'To consume',
        'fitai.budget_status_ok': 'Ok',
        'roadmap.title': 'Roadmap <span class="highlight">AUREUS 2026</span>',
        'roadmap.subtitle': 'We are building the most complete wellness ecosystem in the world.',
        'roadmap.step1_title': 'Premium Web Versions',
        'roadmap.step1_desc': 'Total optimization of the web platform, new visualizations, and cloud sync.',
        'roadmap.step2_title': 'Chase the Rabbit',
        'roadmap.step2_desc': 'Launch of Psychological Health: The third pillar of integral wellness.',
        'roadmap.step3_title': 'Mobile Apps',
        'roadmap.step3_desc': 'Official launch on App Store and Google Play with smart notifications.',
        'roadmap.step4_title': 'AUREUS AI Coach',
        'roadmap.step4_desc': 'AI-based personal trainer that analyzes your habits in real-time.',
        'roadmap.step5_title': 'Global Banking',
        'roadmap.step5_desc': 'Automatic synchronization with financial institutions worldwide.',
        'roadmap.step6_title': 'Predictive Analysis',
        'roadmap.step6_desc': 'AI-based projections on your wealth and health trends.',
        'roadmap.step7_title': 'Family Hub',
        'roadmap.step7_desc': 'Shared tools for families: joint finances and group goals.',
        'roadmap.step8_title': 'Total Ecosystem',
        'roadmap.step8_desc': 'The final integration of wellness pillars into a single seamless experience.',
        'roadmap.step9_title': 'AUREUS Digital Twin',
        'roadmap.step9_desc': 'Your evolutionary virtual replica. Simulate health and finance decisions to see their impact before making them.',

        // Blog Cards
        'blog.card_resource': 'Resource',
        'blog.card_infographic': 'Infographic',
        'blog.card1_title': 'Intermittent Fasting and Mental Clarity',
        'blog.card2_title': 'The Art of Financial Control',
        'blog.card3_title': 'Zero-Based Budgeting: Infographic',
        'blog.card4_title': 'Master Your Dopamine: Neuroscience',
        'blog.card5_title': 'Discipline is Trained: From Macros to Wellness',
        'blog.card6_title': 'Purine Control: Proactive Prevention with AI',
        'blog.card7_title': 'Emergency Fund: Your Shield of Tranquility',

        // Finance OS Page
        'finance.hero_badge': 'Financial Operating System',
        'finance.hero_title': 'Wealth Command Terminal',
        'finance.hero_subtitle': 'Take absolute control of your personal finances. Net worth, smart budgets, debt management, and savings in a single premium and secure interface.',
        'finance.cta_launch': 'Launch App',

        'finance.assets_tag': 'Integral Vision',
        'finance.assets_title': 'Real-Time Asset Biometry',
        'finance.assets_subtag': 'Assets Tracking',
        'finance.assets_subtitle': 'Account and Balance Management',
        'finance.assets_desc': 'AUREUS Finance OS doesn\'t just sum your balances; it centralizes all your financial information in real-time. Get a clear view of your cash, checking accounts, savings, and personal assets.',
        'finance.assets_step1_title': 'Monthly Summary',
        'finance.assets_step1_desc': 'Visualize the status of all your accounts at a glance with detailed reports.',
        'finance.assets_step2_title': 'Expense Analysis',
        'finance.assets_step2_desc': 'Understand where you spend your money with optimized category organization.',
        'finance.assets_step3_title': 'Savings Projection',
        'finance.assets_step3_desc': 'Smart tools that help you plan your financial growth.',

        'finance.protocol_tag': 'Wealth Methodology',
        'finance.protocol_title': 'Financial Engineering Protocol',
        'finance.protocol_card1_title': 'Asset Diagnosis',
        'finance.protocol_card1_desc': 'Deep mapping of every entry and balance to establish your baseline with clinical resolution and absolute precision.',
        'finance.protocol_card2_title': 'Smart Flow Architecture',
        'finance.protocol_card2_desc': 'Mathematical reconfiguration of flows using algorithms that eliminate operational friction and optimize your daily liquidity.',
        'finance.protocol_card3_title': 'Predictive Calibration',
        'finance.protocol_card3_desc': 'Continuous projection of multiple scenarios to ensure stable wealth growth and shield your future freedom.',

        'finance.features_tag': 'Advanced Capabilities',
        'finance.features_title': 'Financial Intelligence Capabilities',
        'finance.feat_networth': 'Net Worth',
        'finance.feat_networth_desc': 'The real value of everything you own minus your debts, calculated to the second.',
        'finance.feat_budget': 'Budgets',
        'finance.feat_budget_desc': 'Dynamic planning that automatically adapts to your income and priorities.',
        'finance.feat_savings': 'Savings Goals',
        'finance.feat_savings_desc': 'Smart virtual piggy banks for your goals: travel, home, car, or emergency fund.',
        'finance.feat_balance': 'Total Balance',
        'finance.feat_balance_desc': 'Unified control of all your bank accounts and cash in real-time.',
        'finance.feat_reports': 'Monthly Reports',
        'finance.feat_reports_desc': 'Generate clear and professional financial statements to understand your financial health.',
        'finance.feat_subs': 'Recurring Control',
        'finance.feat_subs_desc': 'Manage all your subscriptions and fixed bills to avoid unwanted phantom expenses.',
        'finance.feat_vault': 'Digital Vault',
        'finance.feat_vault_desc': 'Ultra-secure space to digitize, centralize, and protect your key financial documents.',

        'finance.security_tag': 'Total Security',
        'finance.security_title': 'Bank-Grade Shielding',
        'finance.security_desc': 'Your financial data is sacred. AUREUS implements the highest security and encryption standards to ensure that only you have access to your financial information.',
        'finance.security_item1_title': 'Local Encryption',
        'finance.security_item1_desc': 'Your data is encrypted on your device before even touching the cloud.',
        'finance.security_item2_title': 'Biometric Access',
        'finance.security_item2_desc': 'Compatible with FaceID and TouchID for instant and secure access.',
        'finance.security_item3_title': 'Zero Knowledge',
        'finance.security_item3_desc': 'We cannot read your bank login credentials. Not even us.',

        // Finance OS - Deep Dives
        'finance.dash_tag': 'Dashboard',
        'finance.dash_title': 'Wealth Command Terminal',
        'finance.dash_item1': 'Customize your dashboard so the most important info is upfront.',
        'finance.dash_item2': 'Drag and drop widgets including net worth, transactions, and more.',
        'finance.dash_item3': 'Review your monthly summary to get quick insights on your spending.',

        'finance.goals_tag': 'Goals',
        'finance.goals_title': 'Capital Goals Architecture',
        'finance.goals_desc': 'Create a clear plan to save for what matters, whether it\'s a house, a vacation, or an emergency fund. Set goals, track your progress, and stay motivated as you see your savings grow.',

        'finance.budget_tag': 'Budgets',
        'finance.budget_title': 'Vital Operational Flexibility',
        'finance.budget_desc': 'Having a budget only works if it adapts to your lifestyle. AUREUS offers flexible ways to budget, providing the structure that works for you.',
        'finance.budget_mockup_date': 'December 2026',
        'finance.budget_mockup_remaining': 'Left to budget',
        'finance.budget_cat_housing': 'Housing',
        'finance.budget_cat_food': 'Food',
        'finance.budget_cat_transport': 'Transport',

        'finance.forecast_tag': 'Projections',
        'finance.forecast_title': 'Future Scenario Simulation',
        'finance.forecast_feat1': '<strong>Scenario Modeling:</strong> Analyze how every decision today impacts your next 12 months of stability.',
        'finance.forecast_feat2': '<strong>Goal Synchronization:</strong> Automatically adjust your projections based on your current savings speed.',
        'finance.forecast_feat3': '<strong>Projected Stability:</strong> Identify periods of high liquidity vs. seasonal spending peaks with mathematical precision.',
        'finance.forecast_tab_past': 'Past',
        'finance.forecast_tab_present': 'Current',
        'finance.forecast_tab_budget': 'Budget',
        'finance.forecast_header_cat': 'CATEGORY',
        'finance.forecast_cat_salary': 'Base Salary',
        'finance.forecast_cat_extra': 'Extra Income',
        'finance.forecast_cat_home': 'Home',
        'finance.forecast_cat_grocery': 'Groceries',
        'finance.forecast_cat_dining': 'Dining',
        'finance.forecast_cat_transport': 'Transport',
        'finance.forecast_cat_leisure': 'Leisure',
        'finance.forecast_cat_travel': 'Travel',
        'finance.forecast_cat_savings': 'Goal Savings',
        'finance.forecast_cat_savings': 'Goal Savings',
        'finance.forecast_cat_margin': 'Net Margin',

        // Widgets & Mockups
        'finance.widget_total_balance': 'total balance',
        'finance.widget_spent': 'spent',
        'finance.widget_this_month': 'this month',
        'finance.widget_vs_prev_month': 'vs. last month',
        'finance.goal_completed': 'COMPLETED',
        'finance.goal_target': 'TARGET'
    }
}

// French Translations
translations.fr = {
    // Navigation
    'nav.features': 'Fonctionnalités',
    'nav.apps': 'Applications',
    'nav.pricing': 'Tarifs',
    'nav.blog': 'Blog',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.start_trial': 'Essai Gratuit',
    'nav.login': 'Connexion',
    'nav.dashboard': 'Tableau de Bord',

    // Hero
    'hero.badge': '2 Apps Premium • 1 Prix Incroyable',
    'hero.title_1': 'Votre Bien-être',
    'hero.title_2': 'Total.',
    'hero.subtitle': 'Nutrition clinique + Finances intelligentes. La suite complète pour optimiser votre santé physique et financière.',
    'hero.cta_primary': 'Commencer l\'Essai Gratuit',
    'hero.cta_secondary': 'Voir Fonctionnalités',
    'hero.stat_1': 'Aliments',
    'hero.stat_2': 'Jours Gratuits',
    'hero.stat_3': 'MXN/mois',

    // Social Proof
    'proof.text': 'Conçu pour les professionnels de santé et toute personne engagée dans son bien-être',
    'proof.doctors': 'Nutritionnistes',
    'proof.athletes': 'Athlètes',
    'proof.health': 'Patients',
    'proof.professionals': 'Professionnels',
    'proof.gyms': 'Salles de sport',
    'proof.diabetics': 'Diabétiques',
    'proof.entrepreneurs': 'Entrepreneurs',
    'proof.families': 'Familles',

    // Nav Dropdown Apps
    'nav.apps_fit_desc': 'Nutrition clinique, macros, jeûne et planification des repas',
    'nav.apps_finance_desc': 'Contrôle financier, budgets, épargne et investissements',

    // Features
    'features.tag': 'Fonctionnalités',
    'features.title': 'Tout pour <span class="highlight">optimiser votre vie</span>',
    'features.subtitle': 'Outils puissants conçus avec précision clinique et la meilleure expérience utilisateur.',
    'features.macros_title': 'Suivi des Macros',
    'features.macros_desc': 'Surveillez calories, protéines, glucides et lipides avec des visualisations radars avancées.',
    'features.fasting_title': 'Minuteur de Jeûne',
    'features.fasting_desc': 'Protocoles 16:8, 12:12, 20:4 avec interface circulaire premium et suivi des progrès.',
    'features.planner_title': 'Planificateur de Repas',
    'features.planner_desc': 'Organisez votre semaine avec des plans personnalisés et générez des rapports PDF professionnels.',
    'features.hydration_title': 'Hydratation',
    'features.hydration_desc': 'Visualisation interactive de la consommation d\'eau avec rappels intelligents.',
    'features.glycemic_title': 'Charge Glycémique',
    'features.glycemic_desc': 'Surveillez l\'impact sur votre glycémie. Idéal pour diabétiques et prédiabétiques.',
    'features.purine_title': 'Contrôle des Purines',
    'features.purine_desc': 'Prédiction de l\'acide urique pour la prévention de la goutte. Unique sur le marché.',
    'showcase.nutri_title': 'Bio-Individualité',
    'showcase.nutri_desc': 'Nutrition de précision adaptée à votre métabolisme et objectifs vitaux.',
    'showcase.metabolic_title': 'Contrôle Métabolique',
    'showcase.metabolic_desc': 'Protocoles de jeûne personnalisés pour optimiser longévité et énergie.',
    'features.sync_title': 'Synchronisation Totale',
    'features.sync_desc': 'Connexion bidirectionnelle avec Apple Health et Google Fit pour intégrer l\'activité physique.',

    // Missing Finance OS Keys
    'showcase.wealth_title': 'Analyse de Richesse',
    'showcase.wealth_desc': 'Visualisation avancée de vos actifs et croissance du patrimoine à long terme.',
    'showcase.scan_title': 'Scan Intelligent',
    'showcase.scan_desc': 'Numérisation instantanée des factures avec catégorisation automatique par IA.',

    // Liquidity Section
    'finance.liquidity_title': 'Gestion de Liquidité Temps Réel',
    'finance.liquidity_desc': 'Gérez vos entrées et sorties avec une fluidité sans précédent. Catégorisation auto et flux de trésorerie haute fidélité.',
    'finance.liquidity_item1_title': 'Catégorisation IA',
    'finance.liquidity_item1_desc': 'Vos transactions s\'organisent d\'elles-mêmes pour savoir exactement où va chaque centime.',
    'finance.liquidity_item2_title': 'Alertes Temps Réel',
    'finance.liquidity_item2_desc': 'Recevez des notifications intelligentes quand vous approchez de vos limites.',
    'finance.liquidity_item3_title': 'Optimisation des Dépenses',
    'finance.liquidity_item3_desc': 'Découvrez des tendances d\'épargne et optimisez vos abonnements automatiquement.',

    // Goals Section
    'finance.goal_paris': 'Voyage à Paris',
    'finance.goal_home': 'Apport Nouvelle Maison',
    'finance.goal_business': 'Capital Entreprise',

    // Core Tech
    'tech.tag_small': 'Puissance Invisible',
    'tech.title': 'Technologie Core <span class="highlight">AUREUS</span>',
    'tech.ai_title': 'Moteur IA Clinique',
    'tech.ai_desc': 'Algorithmes entraînés avec des données médicales réelles pour des recos précises.',
    'tech.sec_title': 'Sécurité Bancaire',
    'tech.sec_desc': 'Chiffrement AES-256 de bout en bout. Vos données sont à vous seules.',
    'tech.sync_title': 'Sync Universelle',
    'tech.sync_desc': 'Synchro instantanée mobile, tablette et web. Commencez ici, finissez là.',
    'tech.off_title': 'Mode Offline Smart',
    'tech.off_desc': 'L\'app fonctionne 100% sans internet. Les données sont téléchargées au retour de la connexion.',
    'tech.rep_title': 'Rapports Pro',
    'tech.rep_desc': 'Exportez votre historique en formats prêts pour nutritionniste ou comptable (PDF/XLS).',

    // Apps
    'apps.tag': '2 Apps, 1 Suite',
    'apps.title': 'Le bundle parfait pour votre <span class="highlight">bien-être intégral</span>',
    'apps.fit_tagline': 'Nutrition Clinique',
    'apps.fit_1': 'Suivi macros et calories',
    'apps.fit_2': 'Minuteur jeûne intermittent',
    'apps.fit_3': 'Planificateur de repas',
    'apps.fit_4': 'Base de données 500+ aliments',
    'apps.fit_5': 'Contrôle glycémique et purines',
    'apps.fit_6': 'Rapports PDF professionnels',
    'apps.finance_tagline': 'Système d\'Exploitation Financier',
    'apps.finance_1': 'Suivi patrimoine net',
    'apps.finance_2': 'Gestion épargne & dettes',
    'apps.finance_3': 'Calendrier financier avec rappels',
    'apps.finance_4': 'Comparatif mensuel revenus/dépenses',
    'apps.finance_5': 'Synchronisation cloud',
    'apps.finance_6': 'Export/Import Excel',
};

// French Translations - Part 2
Object.assign(translations.fr, {
    // How It Works
    'how.tag': 'Comment Ça Marche',
    'how.title': 'Commencez en <span class="highlight">3 étapes simples</span>',
    'how.step1_title': 'Inscrivez-vous',
    'how.step1_desc': 'Créez votre compte et obtenez 14 jours d\'essai gratuit. Aucune carte de crédit requise.',
    'how.step2_title': 'Personnalisez',
    'how.step2_desc': 'Configurez vos objectifs de nutrition, jeûne et finances selon vos besoins.',
    'how.step3_title': 'Transformez-vous',
    'how.step3_desc': 'Suivez vos progrès et atteignez vos objectifs de santé et financiers.',

    // Pricing
    'pricing.tag': 'Prix Incroyables',
    'pricing.title': 'Un prix qui va <span class="highlight">vous surprendre</span>',
    'pricing.subtitle': 'Les deux applications pour moins que le prix d\'un café.',
    'pricing.individual': 'Individuel',
    'pricing.couples': 'Couples',
    'pricing.per_month': '/mois',
    'pricing.savings': 'Économisez 25$/mois',
    'pricing.popular': 'LE PLUS POPULAIRE',
    'pricing.f1': 'AUREUS FIT AI complet',
    'pricing.f2': 'AUREUS Finance OS complet',
    'pricing.f3': '1 utilisateur',
    'pricing.f4': 'Toutes les fonctionnalités',
    'pricing.f5': 'Mises à jour incluses',
    'pricing.f6': 'Support par email',
    'pricing.f7': '2 utilisateurs',
    'pricing.f8': 'Support prioritaire',
    'pricing.cta': 'Commencer l\'Essai Gratuit',
    'pricing.note': '14 jours gratuits • Annulez quand vous voulez',
    'pricing.web': 'Disponible sur Web',
    'pricing.coming': 'iOS & Android bientôt',
    'pricing.included_tag': 'Un prix, tout inclus',
    'pricing.included_title': 'Accès complet à <span class="highlight">2 apps premium</span>',
    'pricing.whypay_title': 'Pourquoi payer pour <span class="highlight">AUREUS</span>?',
    'pricing.whypay_subtitle': 'Investir en soi-même est toujours la meilleure décision.',
    'pricing.noads_title': 'Sans publicité, jamais',
    'pricing.noads_desc': 'Votre expérience toujours propre et concentrée sur l\'essentiel.',
    'pricing.privacy_title': 'Vos données sont à vous',
    'pricing.privacy_desc': 'Nous ne vendons jamais vos données financières ou de santé.',
    'pricing.dev_title': 'Développement constant',
    'pricing.dev_desc': 'Nouvelles fonctions chaque mois financées par votre abonnement.',
    'pricing.support_title': 'Support réel',
    'pricing.support_desc': 'Une équipe dédiée pour vous aider. Réponses rapides et humaines.',
    'pricing.sync_title': 'Sync Universelle',
    'pricing.sync_desc': 'Votre progrès vous suit partout. Laptop, mobile, tablette.',
    'pricing.reports_title': 'Rapports Professionnels',
    'pricing.reports_desc': 'Exportez vos données en PDF ou Excel pour vos pros.',

    // FAQ
    'faq.tag': 'FAQ',
    'faq.title': 'Des <span class="highlight">questions</span>?',
    'faq.q1': 'Que comprend l\'abonnement ?',
    'faq.a1': 'Votre abonnement inclut un accès complet à AUREUS FIT AI (nutrition clinique) et AUREUS Finance OS (contrôle financier).',
    'faq.q2': 'Comment fonctionne l\'essai gratuit ?',
    'faq.a2': 'Vous avez 14 jours pour tout essayer sans engagement. Aucune CB requise.',
    'faq.q3': 'Puis-je annuler à tout moment ?',
    'faq.a3': 'Oui, annulez quand vous voulez. Sans pénalités.',
    'faq.q4': 'Mes données sont-elles sécurisées ?',
    'faq.a4': 'Absolument. Chiffrement bancaire pour protéger vos données.',
    'faq.q5': 'Quand les apps mobiles seront-elles dispos ?',
    'faq.a5': 'Nous travaillons activement sur iOS et Android. Accès auto pour les abonnés actuels.',
    'faq.q6': 'Dois-je être inscrit à une salle de sport ?',
    'faq.a6': 'Non, AUREUS s\'adapte à votre style de vie, maison ou salle.',
    'faq.q7': 'Est-ce adapté aux végétariens/vegans ?',
    'faq.a7': 'Oui, personnalisez vos préférences et l\'algo s\'adapte.',
    'faq.q8': 'Puis-je partager mon compte ?',
    'faq.a8': 'L\'abonnement Individuel est perso. Le plan Couples permet deux comptes liés.',

    // Pricing FAQ
    'pricing.faq_tag': 'FAQ',
    'pricing.faq_title': 'Des <span class="highlight">questions</span>?',
    'pricing.faq_q1': 'Que comprend l\'abonnement ?',
    'pricing.faq_a1': 'Votre abonnement inclut un accès complet à AUREUS FIT AI et AUREUS Finance OS.',
    'pricing.faq_q2': 'Comment fonctionne l\'essai gratuit ?',
    'pricing.faq_a2': '14 jours pour tout essayer sans engagement. Pas de CB requise.',
    'pricing.faq_q3': 'Puis-je annuler à tout moment ?',
    'pricing.faq_a3': 'Oui, annulez quand vous voulez.',
    'pricing.faq_q4': 'Mes données sont-elles sécurisées ?',
    'pricing.faq_a4': 'Oui, chiffrement de grade bancaire.',
    'pricing.faq_q5': 'Quand les apps mobiles seront-elles dispos ?',
    'pricing.faq_a5': 'Bientôt sur iOS et Android.',
    'pricing.faq_q6': 'Dois-je être inscrit à une salle de sport ?',
    'pricing.faq_a6': 'Non, cela s\'adapte à vous.',
    'pricing.faq_q7': 'Est-ce adapté aux végétariens/vegans ?',
    'pricing.faq_a7': 'Oui, tout à fait.',
    'pricing.faq_q8': 'Puis-je partager mon compte ?',
    'pricing.faq_a8': 'Plan Couples uniquement.',

    // Contact
    'contact.title': 'Prêt à transformer votre vie ?',
    'contact.subtitle': 'Rejoignez notre communauté et commencez votre voyage.',
    'contact.name': 'Votre nom',
    'contact.email': 'Votre email',
    'contact.submit': 'Commencer l\'Essai',

    // Footer
    'footer.tagline': 'Votre bien-être, simplifié.',
    'footer.product': 'Produit',
    'footer.apps': 'Applications',
    'footer.legal': 'Légal',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'Conditions',
    'footer.rights': 'Tous droits réservés.',
    'footer.link_features': 'Fonctionnalités',
    'footer.link_pricing': 'Tarifs',
    'footer.link_faq': 'FAQ',
    'footer.link_blog': 'Blog',
    'footer.link_nutrition': 'AUREUS Nutrition AI',
    'footer.link_finance': 'AUREUS Finance OS',
    'footer.link_ambassadors': 'Ambassadeurs',

    // CTA Section
    'cta.tag': 'Commencez Aujourd\'hui',
    'cta.title': 'Prêt à reprendre le <span class="highlight">contrôle total</span> ?',
    'cta.desc': 'Prenez aujourd\'hui la décision qui transformera votre santé et vos finances pour toujours.',
    'cta.btn': 'Commencer Maintenant',
    'cta.trust': 'Essai gratuit • Sans engagement',

    // Academy
    'academy.tag': 'Académie AUREUS',
    'academy.title': 'Centre de <span class="highlight">Maîtrise</span>',
    'academy.read_more': 'Lire la suite',
    'academy.cat1': 'Finances',
    'academy.card1_title': 'L\'Art du Contrôle Financier',
    'academy.card1_desc': 'Comment assigner chaque euro à un but pour éliminer l\'anxiété financière.',
    'academy.cat2': 'Nutrition',
    'academy.card2_title': 'Nutrition, Jeûne et Clarté Mentale',
    'academy.card2_desc': 'Optimisez votre biorythme pour une concentration profonde.',
    'academy.cat3': 'Richesse',
    'academy.card3_title': 'Maîtrise Métabolique',
    'academy.card3_desc': 'Guide technique sur le métabolisme et la nutrition cellulaire.',

    // Blog Page
    'blog.title': 'Dernières Nouvelles',
    'blog.subtitle': 'Conçu pour <span class="highlight">Votre Style de Vie</span>',
    'blog.persona_entrepreneurs': 'Entrepreneurs',
    'blog.persona_entrepreneurs_desc': 'Séparez finances perso et pro. Maximisez votre rendement fiscal et mental.',
    'blog.persona_families': 'Familles',
    'blog.persona_families_desc': 'Planifiez l\'avenir des vôtres. Budgets partagés et menus sains.',
    'blog.persona_performers': 'High Performers',
    'blog.persona_performers_desc': 'Optimisez chaque aspect de votre biologie et économie.',
    'blog.recent_articles': 'Articles Récents',
    'blog.filter_all': 'Tous',
    'blog.filter_nutrition': 'Nutrition',
    'blog.filter_finance': 'Finances',
    'blog.filter_mindset': 'Mental',
    'blog.filter_updates': 'Mises à jour',
    'blog.newsletter_title': 'Optimisez votre boîte de réception',
    'blog.newsletter_desc': 'Recevez les meilleurs conseils. Pas de spam, juste de la valeur.',
    'blog.newsletter_placeholder': 'exemple@email.com',

    // Blog Cards
    'blog.card_resource': 'Ressource',
    'blog.card_infographic': 'Infographie',
    'blog.card1_title': 'Jeûne Intermittent et Clarté Mentale',
    'blog.card2_title': 'L\'Art du Contrôle Financier',
    'blog.card3_title': 'Budget Base Zéro : Infographie',
    'blog.card4_title': 'Maîtrisez votre Dopamine : Neurosciences',
    'blog.card5_title': 'La Discipline s\'Entraîne',
    'blog.card6_title': 'Contrôle des Purines : Prévention IA',
    'blog.card7_title': 'Fonds d\'Urgence : Votre Bouclier',

    // Finance OS Detailed
    'finance.hero_badge': 'Système d\'Exploitation Financier',
    'finance.hero_title': 'Terminal de Commande de Richesse',
    'finance.hero_subtitle': 'Prenez le contrôle absolu de vos finances personnelles.',
    'finance.cta_launch': 'Lancer l\'App',
    'finance.assets_tag': 'Vision Intégrale',
    'finance.assets_title': 'Biométrie des Actifs Temps Réel',
    'finance.assets_subtag': 'Suivi des Actifs',
    'finance.assets_subtitle': 'Gestion Comptes et Soldes',
    'finance.assets_desc': 'Centralisez toutes vos infos financières en temps réel.',
    'finance.assets_step1_title': 'Résumé Mensuel',
    'finance.assets_step1_desc': 'Visualisez l\'état de tous vos comptes en un coup d\'œil.',
    'finance.assets_step2_title': 'Analyse des Dépenses',
    'finance.assets_step2_desc': 'Comprenez où vous dépensez votre argent.',
    'finance.assets_step3_title': 'Projection d\'Épargne',
    'finance.assets_step3_desc': 'Outils intelligents pour planifier votre croissance.',
    'finance.protocol_tag': 'Méthodologie de Richesse',
    'finance.protocol_title': 'Protocole d\'Ingénierie Financière',
    'finance.protocol_card1_title': 'Diagnostic d\'Actifs',
    'finance.protocol_card1_desc': 'Cartographie profonde de chaque entrée et solde.',
    'finance.protocol_card2_title': 'Architecture Smart Flow',
    'finance.protocol_card2_desc': 'Reconfiguration mathématique des flux pour optimiser la liquidité.',
    'finance.protocol_card3_title': 'Calibration Prédictive',
    'finance.protocol_card3_desc': 'Projection continue de scénarios pour une croissance stable.',
    'finance.features_tag': 'Capacités Avancées',
    'finance.features_title': 'Capacités d\'Intelligence Financière',
    'finance.feat_networth': 'Patrimoine Net',
    'finance.feat_networth_desc': 'La valeur réelle de tout ce que vous possédez moins vos dettes.',
    'finance.feat_budget': 'Budgets',
    'finance.feat_budget_desc': 'Planification dynamique qui s\'adapte à vos revenus.',
    'finance.feat_savings': 'Objectifs d\'Épargne',
    'finance.feat_savings_desc': 'Tirelires virtuelles pour vos buts.',
    'finance.feat_balance': 'Solde Total',
    'finance.feat_balance_desc': 'Contrôle unifié de tous vos comptes.',
    'finance.feat_reports': 'Rapports Mensuels',
    'finance.feat_reports_desc': 'Générez des états financiers clairs.',
    'finance.feat_subs': 'Contrôle Récurrent',
    'finance.feat_subs_desc': 'Gérez abonnements et factures fixes.',
    'finance.feat_vault': 'Coffre-fort Numérique',
    'finance.feat_vault_desc': 'Espace ultra-sécurisé pour vos docs financiers.',
    'finance.security_tag': 'Sécurité Totale',
    'finance.security_title': 'Blindage Bancaire',
    'finance.security_desc': 'Vos données sont sacrées.',
    'finance.security_item1_title': 'Chiffrement Local',
    'finance.security_item1_desc': 'Données chiffrées sur votre appareil.',
    'finance.security_item2_title': 'Accès Biométrique',
    'finance.security_item2_desc': 'Compatible FaceID et TouchID.',
    'finance.security_item3_title': 'Zero Knowledge',
    'finance.security_item3_desc': 'Nous ne pouvons pas lire vos identifiants.',
    'finance.dash_tag': 'Tableau de Bord',
    'finance.dash_title': 'Terminal de Commande',
    'finance.dash_item1': 'Personnalisez votre tableau de bord.',
    'finance.dash_item2': 'Glissez-déposez des widgets.',
    'finance.dash_item3': 'Revue mensuelle rapide.',
    'finance.goals_tag': 'Objectifs',
    'finance.goals_title': 'Architecture d\'Objectifs',
    'finance.goals_desc': 'Créez un plan clair pour ce qui compte.',
    'finance.budget_tag': 'Budgets',
    'finance.budget_title': 'Flexibilité Opérationnelle',
    'finance.budget_desc': 'Le budget qui s\'adapte à votre vie.',
    'finance.budget_mockup_date': 'Décembre 2026',
    'finance.budget_mockup_remaining': 'Reste à budgéter',
    'finance.budget_cat_housing': 'Logement',
    'finance.budget_cat_food': 'Nourriture',
    'finance.budget_cat_transport': 'Transport',
    'finance.forecast_tag': 'Projections',
    'finance.forecast_title': 'Simulation de Scénarios',
    'finance.forecast_feat1': '<strong>Modélisation:</strong> Analysez l\'impact de chaque décision.',
    'finance.forecast_feat2': '<strong>Synchro Objectifs:</strong> Ajustement auto des projections.',
    'finance.forecast_feat3': '<strong>Stabilité Projetée:</strong> Identifiez les périodes de liquidité.',
    'finance.forecast_tab_past': 'Passé',
    'finance.forecast_tab_present': 'Actuel',
    'finance.forecast_tab_budget': 'Budget',
    'finance.forecast_header_cat': 'CATÉGORIE',
    'finance.forecast_cat_salary': 'Salaire Base',
    'finance.forecast_cat_extra': 'Revenu Extra',
    'finance.forecast_cat_home': 'Maison',
    'finance.forecast_cat_grocery': 'Courses',
    'finance.forecast_cat_dining': 'Resto',
    'finance.forecast_cat_transport': 'Transp.',
    'finance.forecast_cat_leisure': 'Loisirs',
    'finance.forecast_cat_travel': 'Voyage',
    'finance.forecast_cat_savings': 'Épargne Objectif',
    'finance.forecast_cat_margin': 'Marge Nette',
    'finance.widget_total_balance': 'solde total',
    'finance.widget_spent': 'dépensé',
    'finance.widget_this_month': 'ce mois',
    'finance.widget_vs_prev_month': 'vs mois dernier',
    'finance.goal_completed': 'COMPLÉTÉ',
    'finance.goal_target': 'CIBLE',

    // Fit AI Detailed
    'fitai.hero_badge': 'Nutrition Clinique Intelligente',
    'fitai.hero_title': 'AUREUS Nutrition AI : Ingénierie Humaine par IA',
    'fitai.hero_subtitle': 'La plateforme ultime pour le contrôle nutritionnel avancé.',
    'fitai.hero_cta_primary': 'Commencer Maintenant',
    'fitai.ai_tag': 'IA Générative',
    'fitai.ai_title': 'Le Nutritionniste dans votre Poche',
    'fitai.ai_planning_title': 'Planification Intelligente',
    'fitai.ai_planning_desc': 'Notre IA ne se contente pas d\'enregistrer ; elle planifie.',
    'fitai.ai_item1_title': 'Analyse d\'Inventaire',
    'fitai.ai_item1_desc': 'Suggestions basées sur votre garde-manger.',
    'fitai.ai_item2_title': 'Optimisation Macros',
    'fitai.ai_item2_desc': 'Ajustement temps réel pour vos buts.',
    'fitai.ai_item3_title': 'Listes Intelligentes',
    'fitai.ai_item3_desc': 'Export automatique des ingrédients.',
    'fitai.features_tag': 'Capacités Avancées',
    'fitai.features_title': 'Écosystème Santé <span class="highlight">Nouvelle Génération</span>',
    'fitai.goals_tag': 'Objectifs',
    'fitai.goals_title': 'Vos Objectifs, Quantifiés',
    'fitai.goals_desc': 'Définissez poids, % gras, hydratation ou performances.',
    'fitai.goal1_name': 'Perte de Poids',
    'fitai.goal1_target': 'Cible : 75kg',
    'fitai.goal2_name': 'Hydratation Quotidienne',
    'fitai.goal2_target': 'Cible : 2500ml',
    'fitai.goal3_name': 'Gain de Masse',
    'fitai.goal3_date': 'Maintenance',
    'fitai.goal_status_in_progress': 'EN PROGRÈS',
    'fitai.goal_initial': '84 kg INITIAL',
    'fitai.goal_meta_daily': 'CIBLE JOURNALIÈRE',
    'fitai.goal_this_quarter': 'CE TRIMESTRE',
    'fitai.clinical_tag': 'Analyse Profonde',
    'fitai.clinical_title': 'Biomarqueurs et Précision Clinique',
    'fitai.clinical_subtag': 'Contrôle Clinique',
    'fitai.clinical_subtitle': 'Charge Glycémique et PRAL',
    'fitai.clinical_desc': 'Pas juste des calories. Analyse de l\'impact métabolique réel.',
    'fitai.clinical_item1_title': 'Monitoring Insuline',
    'fitai.clinical_item1_desc': 'Évitez l\'inflammation systémique.',
    'fitai.clinical_item2_title': 'Équilibre Rénal',
    'fitai.clinical_item2_desc': 'Optimisez votre pH corporel (PRAL).',
    'fitai.clinical_item3_title': 'Prévention Goutte',
    'fitai.clinical_item3_desc': 'Contrôle des Purines et Oxalates.',
    'fitai.dashboard_tag': 'Analyse',
    'fitai.dashboard_title': 'Bio-Dashboard : Analyse Métabolique Temps Réel',
    'fitai.dashboard_item1': 'Visualisez distribution macros/micros.',
    'fitai.dashboard_item2': 'Monitorez balance calorique vs basal.',
    'fitai.dashboard_item3': 'Insights hydratation et charge glycémique.',
    'fitai.widget_macros': 'Distribution Macros',
    'fitai.widget_protein_goal': 'Objectif Protéine atteint',
    'fitai.widget_glycemic': 'Charge Glycémique Jour',
    'fitai.widget_glycemic_stat': '-15% vs moyenne',
    'fitai.vitality_tag': 'Vitalité',
    'fitai.vitality_title': 'Optimisation Performance',
    'fitai.vitality_subtag': 'Vitalité',
    'fitai.vitality_subtitle': 'Performance Athlétique',
    'fitai.vitality_desc': 'Maintenez votre niveau au max avec le contrôle hydrique.',
    'fitai.vitality_item1_title': 'Rappels Intelligents',
    'fitai.vitality_item1_desc': 'Notifications adaptatives.',
    'fitai.vitality_item2_title': 'Balance Électrolytique',
    'fitai.vitality_item2_desc': 'Optimisez la récupération.',
    'fitai.vitality_item3_title': 'Performance Athlétique',
    'fitai.vitality_item3_desc': 'Impact de l\'hydratation sur la force.',
    'fitai.budget_tag': 'Registre',
    'fitai.budget_title': 'Architecture des Nutriments',
    'fitai.budget_desc': 'Gérez vos calories comme de l\'argent.',
    'fitai.budget_date': 'Registre Aujourd\'hui - 23 Jan',
    'fitai.budget_remaining_label': 'Restant (Cible: 2200)',
    'fitai.budget_breakfast': 'Petit-déjeuner',
    'fitai.budget_lunch': 'Déjeuner',
    'fitai.budget_dinner': 'Dîner (Plan)',
    'fitai.budget_status_pending': 'À consommer',
    'fitai.budget_status_ok': 'Ok',
    'fitai.how_title': 'Le Protocole AUREUS : Science en 3 Étapes',
    'fitai.step1_title': 'Biométrie Initiale',
    'fitai.step1_desc': 'Digitalisez votre profil physiologique.',
    'fitai.step2_title': 'Apport Intelligent',
    'fitai.step2_desc': 'Enregistrement sans effort par IA.',
    'fitai.step3_title': 'Calibration Dynamique',
    'fitai.step3_desc': 'Le plan évolue avec vous.',

    // Synergy
    'synergy.tag': 'Synergie Exclusive',
    'synergy.title': 'Écosystème <span class="highlight">Connecté</span>',
    'synergy.subtitle': 'Santé physique et financière entrelacées.',
    'synergy.card1': '<strong>Alimentation Consciente:</strong> Moins de transformé = Plus d\'épargne.',
    'synergy.card2': '<strong>Longévité Financière:</strong> Meilleure santé = Moins de frais médicaux.',
    'synergy.card3': '<strong>Mental de Succès:</strong> Discipline macros = Discipline finances.',

    // Features List
    'features_list.fit_1': 'Suivi illimité macros/calories',
    'features_list.fit_2': 'Contrôle acide urique',
    'features_list.fit_3': 'Minuteur jeûne',
    'features_list.fit_4': 'Planificateur hebdo',
    'features_list.fit_5': 'Base aliments premium',
    'features_list.fit_6': 'Analyse tendances',
    'features_list.fit_7': 'Synchro cloud',
    'features_list.finance_1': 'Dashboard patrimoine',
    'features_list.finance_2': 'Budgets adaptatifs',
    'features_list.finance_3': 'Objectifs épargne',
    'features_list.finance_4': 'Gestion dettes',
    'features_list.finance_5': 'Tracker investissements',
    'features_list.finance_6': 'Contrôle abonnements',
    'features_list.finance_7': 'Rapports financiers',

    'roadmap.step_label': 'Étape',
    'roadmap.tag': 'Notre Vision',
    'roadmap.title': 'Feuille de Route <span class="highlight">AUREUS 2026</span>',
    'roadmap.subtitle': 'Nous construisons l\'écosystème le plus complet.',
    'roadmap.step1_title': 'Versions Web Premium',
    'roadmap.step1_desc': 'Optimisation totale plateforme web.',
    'roadmap.step2_title': 'Chase the Rabbit',
    'roadmap.step2_desc': 'Lancement Santé Psychologique.',
    'roadmap.step3_title': 'Apps Mobiles',
    'roadmap.step3_desc': 'Lancement App Store et Google Play.',
    'roadmap.step4_title': 'AUREUS AI Coach',
    'roadmap.step4_desc': 'Entraîneur personnel IA.',
    'roadmap.step5_title': 'Banque Globale',
    'roadmap.step5_desc': 'Synchro auto institutions.',
    'roadmap.step6_title': 'Analyse Prédictive',
    'roadmap.step6_desc': 'Projections patrimoine IA.',
    'roadmap.step7_title': 'Family Hub',
    'roadmap.step7_desc': 'Outils partagés familles.',
    'roadmap.step8_title': 'Écosystème Total',
    'roadmap.step8_desc': 'Intégration finale.',
    'roadmap.step9_title': 'Jumeau Numérique AUREUS',
    'roadmap.step9_desc': 'Votre réplique virtuelle.',

    // Ambassadors
    'ambassadors.hero_badge': 'Accès Sélectif',
    'ambassadors.hero_title': 'Propulsez votre Impact.<br>Soyez un Ambassadeur Élite.',
    'ambassadors.hero_subtitle': 'Rejoignez le réseau exclusif.',
    'ambassadors.hero_cta_primary': 'Rejoindre Maintenant',
    'ambassadors.hero_cta_secondary': 'Voir Mécanique',
    'ambassadors.features_tag': 'Privilèges',
    'ambassadors.features_title': 'Pourquoi être Ambassadeur ?',
    'ambassadors.feature1_title': 'Semaines Premium',
    'ambassadors.feature1_desc': 'Semaines gratuites par parrainage.',
    'ambassadors.feature2_title': 'Statut Vérifié',
    'ambassadors.feature2_desc': 'Check doré sur votre profil.',
    'ambassadors.feature3_title': 'Formation Élite',
    'ambassadors.feature3_desc': 'Accès séminaires exclusifs.',
    'ambassadors.steps_tag': 'Le Chemin',
    'ambassadors.steps_title': 'Comment Participer',
    'ambassadors.step1_title': 'Votre Compte',
    'ambassadors.step1_desc': 'Créez votre compte.',
    'ambassadors.step1_detail1': 'Accès Immédiat',
    'ambassadors.step1_detail2': 'Sans Formulaires',
    'ambassadors.step2_title': 'Partagez',
    'ambassadors.step2_desc': 'Partagez votre code unique.',
    'ambassadors.step2_detail1': 'Code Unique',
    'ambassadors.step2_detail2': 'Invitation Facile',
    'ambassadors.step3_title': 'Connexion',
    'ambassadors.step3_desc': 'Votre invité utilise votre code.',
    'ambassadors.step3_detail1': 'Validation Réelle',
    'ambassadors.step3_detail2': 'Récompense Auto',
    'ambassadors.ranks_tag': 'Progression',
    'ambassadors.ranks_title': 'Niveaux d\'Influence',
    'ambassadors.rank1_badge': 'Niveau 1',
    'ambassadors.rank1_title': 'Ambassadeur',
    'ambassadors.rank1_reward': '1 Semaine Premium / Invité',
    'ambassadors.rank1_feat1': 'Dashboard Impact',
    'ambassadors.rank1_feat2': 'Accès Académie',
    'ambassadors.rank1_feat3': 'Accès Bêtas',
    'ambassadors.rank1_feat4': 'Discord Exclusif',
    'ambassadors.rank2_badge': 'Niveau 2',
    'ambassadors.rank2_title': 'Silver Élite',
    'ambassadors.rank2_reward': '1 Semaine Premium / Invité',
    'ambassadors.rank2_feat1': 'Support Prioritaire',
    'ambassadors.rank2_feat2': 'Événements',
    'ambassadors.rank2_feat3': 'Badge Silver',
    'ambassadors.rank2_feat4': 'Rabais Masterclass',
    'ambassadors.rank3_badge': 'Niveau 3',
    'ambassadors.rank3_title': 'Gold Master',
    'ambassadors.rank3_reward': '2 Semaines Premium / Invité',
    'ambassadors.rank3_feat1': 'Profil Vérifié',
    'ambassadors.rank3_feat2': 'Voix Roadmap',
    'ambassadors.rank3_feat3': 'Session 1v1',
    'ambassadors.rank3_feat4': 'Retraits Annuels',
    'ambassadors.cta_title': 'Prêt à Transcender ?',
    'ambassadors.cta_subtitle': 'Le futur se construit.',
    'ambassadors.cta_btn': 'Rejoindre Programme Élite',
    'nav.apps_ambassadors_desc': 'Programme Élite de parrainage',
    'footer.copyright': '© 2026 AUREUS. Tous droits réservés.',

    // Fallbacks specific to French
    'beta.badge': 'Mises à jour',
    'beta.title': 'Accès Anticipé : Bêta Exclusive',
    'beta.desc': 'Rejoignez les fondateurs.',
    'beta.btn': 'Rejoindre la Bêta',
    'beta.placeholder': 'Votre email',
});

// Current language - persist in localStorage
let currentLang = localStorage.getItem('preferredLang') || 'es';

// Feature card mouse tracking for radial glow
function initFeatureGlows() {
    const cards = document.querySelectorAll('.feature-card, .app-card, .tech-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Newsletter Handling
function initNewsletter() {
    const newsletterContainers = document.querySelectorAll('.newsletter-inline');

    newsletterContainers.forEach(container => {
        const input = container.querySelector('input[type="email"]');
        const button = container.querySelector('button');

        if (!input || !button) return;

        button.addEventListener('click', async () => {
            const email = input.value.trim();
            const originalText = button.textContent;

            // Simple validation
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert(currentLang === 'es'
                    ? 'Por favor ingresa un correo electrónico válido'
                    : 'Please enter a valid email address');
                return;
            }

            // Loading state
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                // Write to Supabase - Check if client is available
                if (window.supabaseClient) {
                    const { error } = await window.supabaseClient
                        .from('newsletter_subscribers')
                        .insert([
                            {
                                email: email,
                                source: 'blog_inline',
                                lang: currentLang
                            }
                        ]);

                    if (error) throw error;

                    // Success state
                    button.innerHTML = '<i class="fa-solid fa-check"></i> ' + (currentLang === 'es' ? '¡Suscrito!' : 'Subscribed!');
                    button.classList.add('success');
                    input.value = '';

                    // Reset after 3 seconds
                    setTimeout(() => {
                        button.disabled = false;
                        button.textContent = originalText;
                        button.classList.remove('success');
                    }, 3000);
                } else {
                    console.error('Supabase client not initialized in window scope.');
                    // Fallback visual success
                    button.innerHTML = '<i class="fa-solid fa-check"></i> ' + (currentLang === 'es' ? '¡Suscrito!' : 'Subscribed!');
                    button.classList.add('success');
                    input.value = '';
                    setTimeout(() => {
                        button.disabled = false;
                        button.textContent = originalText;
                        button.classList.remove('success');
                    }, 3000);
                }
            } catch (error) {
                console.error('Newsletter error:', error);
                button.disabled = false;
                button.innerHTML = originalText;
                alert(currentLang === 'es'
                    ? 'Hubo un error. Inténtalo de nuevo.'
                    : 'Error subscribing. Please try again.');
            }
        });
    });
}

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

    // Early return if essential mobile menu elements are missing (for info pages)
    if (!drawer || !overlay) {
        console.log('Mobile drawer elements not found - skipping mobile menu init');
        return;
    }

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

    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Mobile dropdown toggle
    const mobileDropdowns = document.querySelectorAll('.mobile-dropdown');
    mobileDropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.mobile-dropdown-trigger');
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
        }
    });
}

// FAQ accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return; // Skip if no FAQ items on page

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

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

    if (!langToggle) return; // Skip if toggle not on page

    langToggle.addEventListener('click', () => {
        if (currentLang === 'es') {
            currentLang = 'en';
        } else if (currentLang === 'en') {
            currentLang = 'fr';
        } else {
            currentLang = 'es';
        }
        localStorage.setItem('preferredLang', currentLang);
        if (currentLangSpan) currentLangSpan.textContent = currentLang.toUpperCase();
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
    if (!form) return; // Skip if form not on page

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const name = nameEl ? nameEl.value : '';
        const email = emailEl ? emailEl.value : '';

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

// Beta registration form (Formspree adaptation)
function initBetaForm() {
    const form = document.getElementById('betaForm');
    const successOverlay = document.getElementById('betaSuccess');

    if (!form || !successOverlay) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-beta-submit');
        const originalBtnText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success!
                successOverlay.classList.add('active');
                form.reset();
            } else {
                const data = await response.json();
                alert(data.errors ? data.errors.map(error => error.message).join(", ") : "Hubo un error al enviar el formulario.");
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor. Inténtalo de nuevo.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

function closeBetaSuccess() {
    const successOverlay = document.getElementById('betaSuccess');
    if (successOverlay) {
        successOverlay.classList.remove('active');
    }
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

// Auth state detection - Update nav buttons based on login status
function initAuthState() {
    // Check if Supabase client is available (initialized in supabase-config.js)
    if (typeof supabaseClient === 'undefined') {
        console.log('Supabase client not available - skipping auth state detection');
        return;
    }

    const navAuthBtn = document.getElementById('navAuthBtn');
    const drawerAuthBtn = document.getElementById('drawerAuthBtn');

    supabaseClient.auth.onAuthStateChange((event, session) => {
        const user = session ? session.user : null;
        if (user) {
            // User is logged in - change buttons to show dashboard access
            if (navAuthBtn) {
                navAuthBtn.href = 'user-selection.html'; // Direct to user selection
                navAuthBtn.textContent = translations[currentLang]['nav.dashboard'] || 'Mi Panel';
                navAuthBtn.setAttribute('data-i18n', 'nav.dashboard');
            }
            if (drawerAuthBtn) {
                drawerAuthBtn.href = 'user-selection.html';
                drawerAuthBtn.textContent = translations[currentLang]['nav.dashboard'] || 'Mi Panel';
                drawerAuthBtn.setAttribute('data-i18n', 'nav.dashboard');
            }
        } else {
            // User is not logged in - show login buttons
            if (navAuthBtn) {
                navAuthBtn.href = 'login.html';
                navAuthBtn.textContent = translations[currentLang]['nav.login'] || 'Iniciar Sesión';
                navAuthBtn.setAttribute('data-i18n', 'nav.login');
            }
            if (drawerAuthBtn) {
                drawerAuthBtn.href = 'login.html';
                drawerAuthBtn.textContent = translations[currentLang]['nav.login'] || 'Iniciar Sesión';
                drawerAuthBtn.setAttribute('data-i18n', 'nav.login');
            }
        }
    });
}

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initFAQ();
    initLanguageToggle();
    initSmoothScroll();
    initContactForm();
    initBetaForm();
    initNewsletter();
    initScrollAnimations();
    initAuthState();
    initFeatureGlows();

    // Initial language setup
    const currentLangSpan = document.getElementById('currentLang');
    if (currentLangSpan) currentLangSpan.textContent = currentLang.toUpperCase();
    document.documentElement.lang = currentLang;

    // Initial translation apply
    applyTranslations();
});
