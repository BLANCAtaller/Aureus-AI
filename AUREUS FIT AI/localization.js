const Translations = {
    en: {
        nav: {
            dashboard: "Dashboard",
            food_log: "Food Log",
            meal_planner: "Meal Planner",
            food_database: "Food Database",
            fasting_timer: "Fasting Timer",
            settings: "Settings",
            switch_user: "Switch User",
            logout: "Log Out"
        },
        header: {
            hello: "Hello",
            save_changes: "Save Changes",
            log_meal: "Log Meal"
        },
        dashboard: {
            calories_remaining: "Calories Remaining",
            consumed: "consumed",
            goal: "Goal",
            net_carbs: "Net Carbs",
            ketosis: "KETOSIS",
            loading: "Loading...",
            left: "left",
            impact: "Impact",
            optimal: "Optimal",
            purine_intake: "Purine Intake",
            low: "Low",
            moderate: "Moderate",
            high: "High",
            safe_zone: "Safe Zone",
            uric_prediction: "Your uric acid prediction is stable.",
            uric_prediction_low: "Keep it up! Your purine intake is within the optimal range.",
            uric_prediction_moderate: "Recommendation: Increase hydration to help flush out uric acid.",
            uric_prediction_high: "Action Required: Immediate hydration and avoid high-purine foods.",
            total_consumed: "TOTAL CONSUMED",
            macro_breakdown: "Macro Breakdown",
            fat: "Fat",
            protein: "Protein",
            carbs: "Carbs",
            hydration: "Hydration",
            add_water: "Add Water",
            daily_steps: "Daily Steps",

            quick_add: "Quick Add Meal",
            view_all: "View All",
            breakfast: "Breakfast",
            lunch: "Lunch",
            dinner: "Dinner",
            snack: "Snack"
        },
        settings: {
            title: "Settings",
            dietary_pref: "Dietary Preferences",
            appearance: "Appearance & Customization",
            primary_accent: "PRIMARY ACCENT COLOR",
            advanced_effects: "ADVANCED EFFECTS",
            enable_glass: "Enable Glassmorphism",
            card_roundness: "CARD ROUNDNESS",
            typography: "TYPOGRAPHY",
            language: "LANGUAGE",
            save_all: "Save All Settings",
            logout: "Log Out"
        },
        food_log: {
            title: "Food Logger",
            subtitle: "Track meals & monitor purine levels",
            todays_log: "Today's Log",
            nothing_logged: "Nothing logged yet",
            add: "Add",
            add_upper: "ADD",
            net_carbs: "Net Carbs",
            daily_macros: "Daily Macros",
            uric_risk: "Uric Acid Risk",
            risk_high: "HIGH RISK",
            risk_moderate: "MODERATE",
            risk_low: "LOW RISK",
            risk_warning: "Warning",
            risk_desc: "Approaching daily limit. Consider swapping red meat for eggs or tofu for dinner.",
            add_to_meal: "Add to Meal",
            favorites: "Favorites",
            manual_entry: "Manual Entry",
            ai_scan: "AI Scan",
            search_placeholder: "Search favorites...",
            no_matches: "No matches found.",
            no_favorites: "No favorites yet.",
            food_name: "Food Name",
            calories: "Calories",
            purines: "Purines",
            ingredients: "Ingredients",
            add_ingredient: "Add Ingredient",
            save_db: "Save to favorites database",
            add_item: "Add Item",
            scan_option: "Take Photo",
            upload_option: "Upload Image",
            scan_help: "Photo suggestions for better accuracy:",
            scan_hint_1: "Photo of a complete meal plate",
            scan_hint_2: "Screen capture with dish name",
            scan_hint_3: "Product packaging with nutrition table",
            scan_hint_4: "Clear images of any food",
            scan_note: "AI automatically analyzes calories, purines, carbs, fats, and proteins in ~5-10 seconds.",
            analyzing: "Analyzing food with AI...",
            save_favorite: "Save to favorites database",
            scan_again: "Scan Again",
            glycemic_factor: "Glycemic Factor",
            daily_gl: "Daily Glycemic Load",
            gl_low: "Low Risk",
            gl_moderate: "Moderate",
            gl_high: "High Risk",
            gl_optimal: "Optimal",
            gl_waiting: "WAITING DATA...",
            gl_msg_low: "Low daily glycemic load. Minimal risk.",
            gl_msg_mod: "Moderate glycemic load. Stay hydrated.",
            gl_msg_high: "HIGH glycemic load. Risk of inflammation and insulin spikes.",
            gl_high: "High GL Risk",
            glucose: "Glucose",
            add_glucose: "Glucose Monitoring",
            blood_glucose: "Blood Glucose",
            context: "Context",
            fasting: "Fasting",
            post_prandial: "Post-prandial (2h)",
            mg_dl: "mg/dL",
            glycemic_factor_unit: "GL",
            total_purines: "Total Purines",
            breakfast: "Breakfast",
            lunch: "Lunch",
            snacks: "Snacks",
            dinner: "Dinner",
            no_readings: "No records today",
            min_readings_chart: "Min 2 records for chart",
            hypo_alert: "HYPOGLYCEMIA ALERT! Low blood sugar.",
            hyper_alert: "HYPERGLYCEMIA ALERT! Significant high blood sugar.",
            recorded_at: "Recorded at",
            pdf_daily_report: {
                title: "DAILY NUTRITION REPORT",
                exec_summary_title: "1. Executive Summary",
                exec_summary_subtitle: "A quick glance at today's goal compliance.",
                nutritional_balance_title: "NUTRITIONAL BALANCE (INTAKE VS. GOAL %)",
                reading_guide_title: "READING GUIDE:",
                reading_guide_1: "• The gray area represents your ideal goal (100%).",
                reading_guide_2: "• If the green area is within the gray, you are meeting the goal.",
                reading_guide_3: "• If the green area exceeds, it indicates an excess in that nutrient.",
                keto_alert_title: "[!] KETO ALERT: {val}g Net Carbs",
                keto_alert_desc: "Consumption exceeds the suggested limit for Ketosis. Light physical activity is recommended.",
                food_list_title: "2. Food Log (Detail)",
                health_risks_title: "3. Health & Risk Analysis",
                weekly_trends_title: "4. Weekly Trends (Last 7 Days)",
                footer_page: "Page",
                risk_label: "RISK",
                risk_level: { high: "HIGH", moderate: "MODERATE", low: "LOW" },
                uric_acid_title: "URIC ACID RISK",
                uric_acid_rec_high: "Hydration suggested: +3L water.",
                uric_acid_rec_ok: "Safe levels.",
                gl_title: "GLYCEMIC LOAD",
                gl_label: "GL (Glycemic Load)",
                gl_low: "Low",
                gl_moderate: "Moderate",
                gl_high: "High",
                gl_rec_high: "• High GL: Suggested to walk 10min post-meal to reduce glycemic spike.",
                gl_rec_ok: "• Optimal GL: Maintain complex carbohydrate consumption.",
                glucose_title: "Glucose Readings",
                glucose_empty: "No glucose readings recorded.",
                macro_breakdown_title: "Macro Breakdown",
                net_carbs_limit: "Net Carbs limit: {val}g/day",
                total_daily: "TOTAL DAILY",
                table_headers: {
                    item: "ITEM",
                    kcal: "KCAL",
                    purine: "PURINE",
                    carb: "CARB",
                    prot: "PROT",
                    fat: "FAT"
                },
                labels: {
                    calories: "CALORIES",
                    protein: "PROTEIN",
                    carbs: "CARBS",
                    fats: "FATS",
                    water: "WATER",
                    optimal: "OPTIMAL",
                    exceeded: "EXCEEDED",
                    deficit: "DEFICIT",
                    low: "LOW",
                    high: "HIGH",
                    target: "Target"
                },
                sections: {
                    medical_analysis: "MEDICAL ANALYSIS & INSIGHTS",
                    energy_balance: "ENERGY BALANCE",
                    purine_profile: "PURINE PROFILE",
                    hydration: "HYDRATION",
                    activity: "ACTIVITY",
                    rest: "REST",
                    detailed_plan: "DETAILED DAILY PLAN",
                    chrono_dist: "CHRONOLOGICAL MEAL DISTRIBUTION"
                },
                analysis: {
                    cal_low: "Controlled hypocaloric plan.",
                    cal_high: "Hypercaloric volume plan.",
                    cal_optimal: "Optimal maintenance balance.",
                    prot_dist: "Protein distribution at {val}% of total.",
                    stable_consumption: "Stable consumption during period.",
                    purine_risk_high: "Risk: High Purine Levels.",
                    purine_risk_safe: "Safe: Purine levels under control.",
                    hydration_goal: "Goal: 2.5L - 3L daily.",
                    hydration_reason: "Vital for purine filtering.",
                    activity_freq: "Freq: 150 min/week.",
                    activity_desc: "Combine strength & cardio.",
                    rest_quality: "Quality: 7-8h nightly.",
                    rest_desc: "Hormonal regulation."
                }
            }
        },
        food_db: {
            header: {
                badge: "FOOD DATABASE V7.1",
                title: "Food Classification",
                subtitle: "Navigate your keto journey safely.",
                save_btn: "Save",
                new_food_btn: "New"
            },
            favorites: { title: "Favorites", manage_btn: "Manage" },
            search: { placeholder: "Search..." },
            filters: { all: "All" },
            load_more: "Load More",
            editor: {
                title: "Edit",
                cancel: "Cancel",
                save: "Save"
            },
            select_mode: {
                title: "Select Food",
                cancel: "Cancel",
                add_to_log: "Add to Log"
            }
        },

        fasting: {
            title: "Fasting Timer",
            subtitle: "Track your fasting windows to optimize autophagy and ketosis. Select a protocol below to begin your journey.",
            intermittent_fasting: "INTERMITTENT FASTING",
            protocol_16_8: "16:8 TRF",
            protocol_12_12: "12:12 Circadian",
            protocol_20_4: "20:4 Warrior",
            ready: "READY",
            active: "ACTIVE",
            target: "Target",
            adjust: "Adjust",
            start_fast: "Start Fast",
            end_fast: "End Fast",
            status_fasting_active: "Fasting Active",
            status_not_fasting: "Not Fasting",
            metabolic_phases: "Metabolic Phases",
            key_benefits: "Key Benefits",
            pro_tip: "Pro Tip",
            phase_start: "Start",
            phase_sugar_drop: "Sugar Drop",
            phase_ketosis: "Ketosis",
            phase_autophagy: "Autophagy",
            phase_deep_clean: "Deep Clean",
            phases: {
                start: {
                    desc: "Your body is digesting your last meal and using stored glucose for energy. Blood sugar levels are typically elevated.",
                    benefits: ["Glucose provided energy", "Normal metabolic function", "Nutrient absorption"],
                    tip: "Drink water to prepare for the fast ahead."
                },
                sugar_drop: {
                    desc: "Insulin levels drop and your body starts to burn through stored glycogen. You might feel hungry as your body adapts.",
                    benefits: ["Blood sugar stabilizes", "Insulin levels decrease", "Digestive system rests"],
                    tip: "Stay hydrated to manage hunger pangs."
                },
                ketosis: {
                    desc: "Your body runs out of glucose and switches to burning fat for fuel. The liver begins producing ketones.",
                    benefits: ["Fat burning mode active", "Increased mental clarity", "Reduced cravings"],
                    tip: "Great time for light to moderate exercise."
                },
                autophagy: {
                    desc: "Cellular cleanup begins. Your cells start recycling old components and repairing themselves.",
                    benefits: ["Cellular repair & renewal", "Anti-aging effects", "Immune system boost"],
                    tip: "Deep focus work is often easier now."
                },
                deep_clean: {
                    desc: "Peak autophagy and growth hormone production. Significant reduction in inflammation and deep tissue repair.",
                    benefits: ["Maximal inflammation reduction", "Growth hormone surge", "Gut lining repair"],
                    tip: "Listen to your body; break fast if unwell."
                }
            },
            reports: "Reports & Insights",
            weekly_analysis: "Weekly Analysis",
            metabolic_flexibility: "Metabolic Flexibility",
            ketosis_efficiency: "Ketosis Efficiency",
            optimal: "Optimal",
            good: "Good",
            developing: "Developing",
            insights: {
                improvement: "Excellent improvement! Your body is becoming more efficient at accessing stored fat during deeper fasting windows.",
                consistent: "Consistent ketosis levels. Maintaining these windows promotes cellular repair and stable blood glucose levels.",
                focus: "Focus on reaching the 12h-16h mark to unlock deep ketosis benefits like improved mental clarity and fat adaptation.",
                summary_exceeded: "Exceptional performance! You completed your goal, reaching deep ketosis and maximizing cellular repair.",
                summary_close: "Great effort! You entered metabolic switching. Close to your target, keep pushing for that extra cellular cleanup!",
                summary_start: "Good start. Remember that the magic of autophagy and deep repair usually starts after 16 hours of fasting.",
                summary_none: "No fasting data recorded for this day. Small steps lead to giant metabolic transformations!"
            },
            weekly_score: "Weekly Score",
            weekly_goal: "Weekly Goal",
            weekly_ketosis: "Weekly Ketosis",
            ketones_delta: "Ketones Δ",
            history: "History",
            total_time: "Total Time",
            days_fasted: "Days Fasted",
            best_streak: "Best Streak",
            hydration: "Hydration",
            hydration_goal: "Goal",
            goal_updated: "Daily goal updated!",
            reset_confirm: "Reset today's water log to 0?",

            fasted: "Fasted"
        },
        meal_planner: {
            title: "Weekly Planner",
            subtitle: "View and manage your entire week's meals. Ensure your macros and purines are balanced.",
            plan_week: "PLAN: WEEK",
            shopping_list: "Shopping List",
            pdf_report: "PDF Report",
            save_changes: "Save Changes",
            templates_title: "Plan Templates",
            manage: "Manage",
            food_library: "Food Library",
            search_placeholder: "Search foods...",
            filters: {
                all: "All",
                favorites: "Favorites",
                meats: "Meats",
                poultry: "Poultry",
                seafood: "Seafood",
                veggies: "Veggies",
                dairy: "Dairy",
                fruits: "Fruits",
                nuts: "Nuts",
                drinks: "Drinks",
                fast_food: "Fast Food"
            },
            weekly_grid_title: "Weekly Planner Meal",
            days: {
                mon: "MON",
                tue: "TUE",
                wed: "WED",
                thu: "THU",
                fri: "FRI",
                sat: "SAT",
                sun: "SUN"
            },
            full_days: {
                mon: "MONDAY",
                tue: "TUESDAY",
                wed: "WEDNESDAY",
                thu: "THURSDAY",
                fri: "FRIDAY",
                sat: "SATURDAY",
                sun: "SUNDAY"
            },
            modals: {
                save_template_title: "Save Plan Template",
                template_name: "Template Name",
                template_desc: "Description (Optional)",
                saved_templates: "Saved Templates",
                overwrite_hint: "(Click to overwrite)",
                cancel: "Cancel",
                save_template: "Save Template",
                shopping_list_title: "Shopping List",
                based_on: "Based on your Weekly Meal Plan:",
                close: "Close",
                print_copy: "Print / Copy",
                edit_meal_title: "Edit Meal",
                edit: "Edit",
                add: "Add",
                delete: "Delete"
            },
            pdf: {
                title: "Weekly Nutrition Plan",
                generated: "Generated",
                intro: "Below is your weekly nutrition breakdown, macro distribution, and detailed daily plan to optimize your uric acid and nutritional levels.",
                macro_dist: "Macro Distribution (Average)",
                cal_trend: "Weekly Calorie Trend",
                weekly_summary: "WEEKLY SUMMARY",
                daily_avgs: "Daily Averages",
                ingredients: "INGREDIENT",
                amount: "AMOUNT",
                no_meals: "No meals logged.",
                footer_text: "Page {0} of {1}  |  AUREUS Nutrición AI"
            },
            units: {
                kcal: "kcal",
                prot: "prot",
                fat: "fat",
                carb: "carb"
            },
            alerts: {
                enter_template_name: "Please enter a name for the template.",
                overwrite_confirm: "A template named \"{0}\" already exists. Do you want to overwrite it?",
                template_updated: "Template updated successfully!",
                template_saved: "Template saved successfully!",
                save_error: "There was an error saving: "
            }
        }
    },
    es: {
        nav: {
            dashboard: "Panel Principal",
            food_log: "Registro de Comidas",
            meal_planner: "Planificador",
            food_database: "Base de Datos",
            fasting_timer: "Temporizador",
            settings: "Configuración",
            switch_user: "Cambiar Usuario",
            logout: "Cerrar Sesión"
        },
        header: {
            hello: "Hola",
            save_changes: "Guardar Cambios",
            log_meal: "Registrar Comida"
        },
        dashboard: {
            calories_remaining: "Calorías Restantes",
            consumed: "consumidas",
            goal: "Meta",
            net_carbs: "Carbos Netos",
            ketosis: "CETOSIS",
            loading: "Cargando...",
            left: "restantes",
            impact: "Impacto",
            optimal: "Óptimo",
            purine_intake: "Ingesta de Purinas",
            low: "Bajo",
            moderate: "Moderado",
            high: "Alto",
            safe_zone: "Zona Segura",
            uric_prediction: "Tu predicción de ácido úrico es estable.",
            uric_prediction_low: "¡Sigue así! Tu ingesta de purinas está en el rango óptimo.",
            uric_prediction_moderate: "Recomendación: Aumenta tu hidratación para facilitar la eliminación.",
            uric_prediction_high: "Acción Crítica: Hidratación inmediata y evitar carnes rojas/mariscos.",
            total_consumed: "TOTAL CONSUMIDO",
            macro_breakdown: "Desglose de Macros",
            fat: "Grasa",
            protein: "Proteína",
            carbs: "Carbos",
            hydration: "Hidratación",
            add_water: "Añadir Agua",
            daily_steps: "Pasos Diarios",

            quick_add: "Añadir Rápido",
            view_all: "Ver Todo",
            breakfast: "Desayuno",
            lunch: "Almuerzo",
            dinner: "Cena",
            snack: "Merienda"
        },
        settings: {
            title: "Configuración",
            dietary_pref: "Preferencias Dietéticas",
            appearance: "Apariencia y Personalización",
            primary_accent: "COLOR DE ACENTO PRIMARIO",
            advanced_effects: "EFECTOS AVANZADOS",
            enable_glass: "Activar Glassmorphism",
            typography: "TIPOGRAFÍA",
            language: "IDIOMA",
            save_all: "Guardar Cambios",
            logout: "Cerrar Sesión"
        },
        food_log: {
            title: "Registro de Comidas",
            subtitle: "Sigue tus comidas y purinas",
            todays_log: "Diario de Hoy",
            nothing_logged: "Nada registrado aún",
            add: "Añadir",
            add_upper: "AÑADIR",
            net_carbs: "Carbos Netos",
            glycemic_factor: "Factor Glucémico",
            daily_gl: "Carga Glucémica Diaria",
            gl_low: "RIESGO BAJO",
            gl_moderate: "MODERADO",
            gl_high: "RIESGO ALTO",
            gl_optimal: "ÓPTIMO",
            gl_waiting: "ESPERANDO DATOS...",
            gl_msg_low: "Carga glucémica diaria baja. Riesgo mínimo.",
            gl_msg_mod: "Carga glucémica moderada. Mantente hidratado.",
            gl_msg_high: "Carga glucémica ALTA. Riesgo de inflamación y picos de insulina.",
            gl_high: "Riesgo GL Alto",
            glucose: "Glucosa",
            add_glucose: "Monitoreo Glucosa",
            blood_glucose: "Glucosa en Sangre",
            context: "Contexto",
            fasting: "Ayunando",
            post_prandial: "Post-prandial (2h)",
            mg_dl: "mg/dL",
            glycemic_factor_unit: "GL",
            total_purines: "Purinas Totales",
            breakfast: "Desayuno",
            lunch: "Almuerzo",
            snacks: "Meriendas",
            dinner: "Cena",
            no_readings: "Sin registros hoy",
            min_readings_chart: "Mínimo 2 registros para gráfico",
            hypo_alert: "¡ALERTA DE HIPOGLUCEMIA! Azúcar bajo.",
            hyper_alert: "¡ALERTA DE HIPERGLUCEMIA! Azúcar significativamente alto.",
            recorded_at: "Registrado a las",
            pdf_daily_report: {
                title: "REPORTE NUTRICIONAL DIARIO",
                exec_summary_title: "1. Resumen Ejecutivo",
                exec_summary_subtitle: "Un vistazo rápido al cumplimiento de objetivos del día.",
                nutritional_balance_title: "BALANCE NUTRICIONAL (CONSUMO VS. META %)",
                reading_guide_title: "GUÍA DE LECTURA:",
                reading_guide_1: "• El área gris representa tu objetivo ideal (100%).",
                reading_guide_2: "• Si el área verde está dentro de la gris, estás cumpliendo el objetivo.",
                reading_guide_3: "• Si el área verde sobresale, indica un exceso en ese nutriente específico.",
                keto_alert_title: "[!] ALERTA KETO: {val}g Carbos Netos",
                keto_alert_desc: "El consumo excede el límite sugerido para Cetosis. Se recomienda actividad física ligera.",
                food_list_title: "2. Registro de Alimentos (Detalle)",
                health_risks_title: "3. Análisis de Salud y Riesgos",
                weekly_trends_title: "4. Tendencia Semanal (Últimos 7 días)",
                footer_page: "Página",
                risk_label: "RIESGO",
                risk_level: { high: "ALTO", moderate: "MODERADO", low: "BAJO" },
                uric_acid_title: "RIESGO ÁCIDO ÚRICO",
                uric_acid_rec_high: "Hidratación sugerida: +3L agua.",
                uric_acid_rec_ok: "Niveles seguros.",
                gl_title: "CARGA GLUCÉMICA",
                gl_label: "CG (Carga Glucémica)",
                gl_rec_high: "• CG Alto: Se sugiere caminar 10min post-comida para reducir pico glucémico.",
                gl_rec_ok: "• CG Óptimo: Mantener consumo de carbohidratos complejos.",
                glucose_title: "Lecturas de Glucosa",
                glucose_empty: "No hay lecturas de glucosa registradas.",
                macro_breakdown_title: "Desglose de Macros",
                net_carbs_limit: "Límite Carbos Netos: {val}g/día",
                total_daily: "TOTAL DIARIO",
                table_headers: {
                    item: "ÍTEM",
                    kcal: "KCAL",
                    purine: "PURINA",
                    carb: "CARB",
                    prot: "PROT",
                    fat: "GRASA"
                },
                labels: {
                    calories: "CALORÍAS",
                    protein: "PROTEÍNA",
                    carbs: "CARBOHIDRATOS",
                    fats: "GRASAS",
                    water: "AGUA",
                    optimal: "ÓPTIMO",
                    exceeded: "EXCEDIDO",
                    deficit: "DÉFICIT",
                    low: "BAJO",
                    high: "ALTO",
                    target: "Meta"
                },
                sections: {
                    medical_analysis: "ANÁLISIS MÉDICO & INSIGHTS",
                    energy_balance: "BALANCE ENERGÉTICO",
                    purine_profile: "PERFIL DE PURINAS",
                    hydration: "HIDRATACIÓN",
                    activity: "ACTIVIDAD",
                    rest: "DESCANSO",
                    detailed_plan: "PLAN DIARIO DETALLADO",
                    chrono_dist: "DISTRIBUCIÓN CRONOLÓGICA DE COMIDAS"
                },
                analysis: {
                    cal_low: "Plan hipocalórico controlado.",
                    cal_high: "Plan hipercalórico de volumen.",
                    cal_optimal: "Balance de mantenimiento óptimo.",
                    prot_dist: "Distribución de proteína al {val}% del total.",
                    stable_consumption: "Consumo estable durante el periodo.",
                    purine_risk_high: "Riesgo: Niveles altos de purinas.",
                    purine_risk_safe: "Seguro: Niveles bajo control.",
                    hydration_goal: "Meta: 2.5L - 3L diarios.",
                    hydration_reason: "Vital para filtrado de purinas.",
                    activity_freq: "Frec: 150 min/sem.",
                    activity_desc: "Combinar fuerza y cardio.",
                    rest_quality: "Calidad: 7-8h nocturnas.",
                    rest_desc: "Regulación hormonal y recup."
                }
            }
        },
        food_db: {
            header: {
                badge: "BASE DE DATOS V2.4",
                title: "Clasificación de Alimentos",
                subtitle: "Navega tu viaje cetogénico de forma segura.",
                save_btn: "Guardar",
                new_food_btn: "Nuevo"
            },
            favorites: { title: "Favoritos" },
            search: { placeholder: "Buscar..." },
            filters: { all: "Todos" },
            load_more: "Cargar Más",
            editor: {
                title: "Editar",
                cancel: "Cancelar",
                save: "Guardar"
            },
            select_mode: {
                title: "Seleccionar",
                cancel: "Cancelar",
                add_to_log: "Añadir al Registro"
            }
        },
        meal_planner: {
            title: "Planificador Semanal",
            subtitle: "Visualiza y gestiona las comidas de toda la semana. Asegura el equilibrio de tus macros y purinas.",
            plan_week: "PLAN: SEMANA",
            shopping_list: "Lista de Compras",
            pdf_report: "Reporte PDF",
            save_changes: "Guardar Cambios",
            templates_title: "Plantillas de Plan",
            manage: "Gestionar",
            food_library: "Biblioteca de Alimentos",
            search_placeholder: "Buscar alimentos...",
            filters: {
                all: "Todos",
                favorites: "Favoritos",
                meats: "Carnes",
                poultry: "Aves",
                seafood: "Mariscos",
                veggies: "Vegetales",
                dairy: "Lácteos",
                fruits: "Frutas",
                nuts: "Frutos Secos",
                drinks: "Bebidas",
                fast_food: "Comida Rápida"
            },
            weekly_grid_title: "Comidas del Plan Semanal",
            days: {
                mon: "LUN",
                tue: "MAR",
                wed: "MIÉ",
                thu: "JUE",
                fri: "VIE",
                sat: "SÁB",
                sun: "DOM"
            },
            full_days: {
                mon: "LUNES",
                tue: "MARTES",
                wed: "MIÉRCOLES",
                thu: "JUEVES",
                fri: "VIERNES",
                sat: "SÁBADO",
                sun: "DOMINGO"
            },
            modals: {
                save_template_title: "Guardar Plantilla",
                template_name: "Nombre de la Plantilla",
                template_desc: "Descripción (Opcional)",
                saved_templates: "Plantillas Guardadas",
                overwrite_hint: "(Click para sobrescribir)",
                cancel: "Cancelar",
                save_template: "Guardar Plantilla",
                shopping_list_title: "Lista de Compras",
                based_on: "Basado en tu Plan Semanal:",
                close: "Cerrar",
                print_copy: "Imprimir / Copiar",
                edit_meal_title: "Editar Comida",
                edit: "Editar",
                add: "Añadir",
                delete: "Eliminar"
            },
            pdf: {
                title: "Plan Nutricional Semanal",
                generated: "Generado",
                intro: "A continuación detallamos tu desglose nutricional semanal, distribución de macros y plan diario detallado para optimizar tus niveles de ácido úrico y nutrición.",
                macro_dist: "Distribución de Macros (Promedio)",
                cal_trend: "Tendencia Semanal de Calorías",
                weekly_summary: "RESUMEN SEMANAL",
                daily_avgs: "Promedios Diarios",
                ingredients: "INGREDIENTE",
                amount: "CANTIDAD",
                no_meals: "No hay comidas registradas.",
                footer_text: "Página {0} de {1}  |  AUREUS Nutrición AI"
            },
            units: {
                kcal: "kcal",
                prot: "prot",
                fat: "gras",
                carb: "carb"
            },
            alerts: {
                enter_template_name: "Por favor, introduce un nombre para la plantilla.",
                overwrite_confirm: "¿Ya existe una plantilla llamada \"{0}\". ¿Deseas sobrescribirla?",
                template_updated: "¡Plantilla actualizada con éxito!",
                template_saved: "¡Plantilla guardada con éxito!",
            },
        },
        fasting: {
            title: "Temporizador de Ayuno",
            subtitle: "Sigue tus ventanas de ayuno para optimizar la autofagia y la cetosis. Selecciona un protocolo para comenzar.",
            intermittent_fasting: "AYUNO INTERMITENTE",
            protocol_16_8: "16:8 TRF",
            protocol_12_12: "12:12 Circadiano",
            protocol_20_4: "20:4 Guerrero",
            ready: "LISTO",
            active: "ACTIVO",
            target: "Meta",
            adjust: "Ajustar",
            start_fast: "Iniciar Ayuno",
            end_fast: "Terminar Ayuno",
            status_fasting_active: "Ayuno Activo",
            status_not_fasting: "No Ayunando",
            metabolic_phases: "Fases Metabólicas",
            key_benefits: "Beneficios Clave",
            pro_tip: "Consejo Pro",
            phase_start: "Inicio",
            phase_sugar_drop: "Caída de Azúcar",
            phase_ketosis: "Cetosis",
            phase_autophagy: "Autofagia",
            phase_deep_clean: "Limpieza Profunda",
            phases: {
                start: {
                    desc: "Tu cuerpo está digiriendo tu última comida y usando la glucosa almacenada para obtener energía.",
                    benefits: ["Glucosa proporciona energía", "Función metabólica normal", "Absorción de nutrientes"],
                    tip: "Bebe agua para prepararte para el ayuno."
                },
                sugar_drop: {
                    desc: "Los niveles de insulina bajan y tu cuerpo comienza a quemar el glucógeno almacenado.",
                    benefits: ["El azúcar en sangre se estabiliza", "Los niveles de insulina disminuyen", "El sistema digestivo descansa"],
                    tip: "Mantente hidratado para controlar el hambre."
                },
                ketosis: {
                    desc: "Tu cuerpo se queda sin glucosa y cambia a quemar grasa como combustible.",
                    benefits: ["Modo quema grasa activo", "Mayor claridad mental", "Reducción de antojos"],
                    tip: "Excelente momento para ejercicio ligero a moderado."
                },
                autophagy: {
                    desc: "Tus células comienzan a reciclar componentes dañados y a limpiarse.",
                    benefits: ["Renovación celular", "Reducción de la inflamación", "Mejora inmunológica"],
                    tip: "Prioriza el descanso para apoyar la reparación."
                },
                deep_clean: {
                    desc: "La autofagia alcanza su punto máximo y tu cuerpo se somete a una limpieza profunda.",
                    benefits: ["Máxima regeneración", "Sensibilidad a la insulina", "Resiliencia metabólica"],
                    tip: "Escucha a tu cuerpo y rompe el ayuno con suavidad."
                }
            }
        },
        languages: {
            en: "English",
            es: "Español",
            fr: "Français"
        }
    },
    fr: {
        nav: {
            dashboard: "Tableau de Bord",
            food_log: "Journal Alimentaire",
            meal_planner: "Planificateur",
            food_database: "Base de Données",
            fasting_timer: "Minuteur de Jeûne",
            settings: "Paramètres",
            switch_user: "Changer d'Utilisateur",
            logout: "Déconnexion"
        },
        header: {
            hello: "Bonjour",
            save_changes: "Enregistrer",
            log_meal: "Ajouter Repas"
        },
        dashboard: {
            calories_remaining: "Calories Restantes",
            consumed: "consommées",
            goal: "Objectif",
            net_carbs: "Glucides Nets",
            ketosis: "CÉTOSE",
            loading: "Chargement...",
            left: "restants",
            impact: "Impact",
            optimal: "Optimal",
            purine_intake: "Apport en Purines",
            low: "Faible",
            moderate: "Modéré",
            high: "Élevé",
            safe_zone: "Zone Sûre",
            uric_prediction: "Votre prédiction d'acide urique est stable.",
            uric_prediction_low: "Continuez ! Votre apport en purines est dans la zone optimale.",
            uric_prediction_moderate: "Recommandation : Augmentez l'hydratation pour faciliter l'élimination.",
            uric_prediction_high: "Action Critique : Hydratation immédiate et éviter les viandes rouges.",
            total_consumed: "TOTAL CONSOMMÉ",
            macro_breakdown: "Répartition Macros",
            fat: "Lipides",
            protein: "Protéines",
            carbs: "Glucides",
            hydration: "Hydratation",
            add_water: "Ajouter Eau",
            daily_steps: "Pas Quotidiens",
            quick_add: "Ajout Rapide",
            view_all: "Voir Tout",
            breakfast: "Petit Déj",
            lunch: "Déjeuner",
            dinner: "Dîner",
            snack: "Collation"
        },
        settings: {
            title: "Paramètres",
            dietary_pref: "Préférences Alimentaires",
            appearance: "Apparence et Personnalisation",
            primary_accent: "COULEUR D'ACCENT",
            advanced_effects: "EFFETS AVANCÉS",
            enable_glass: "Activer Glassmorphism",
            card_roundness: "ARRONDI DES CARTES",
            typography: "TYPOGRAPHIE",
            language: "LANGUE",
            save_all: "Tout Enregistrer",
            logout: "Déconnexion"
        },
        food_log: {
            title: "Journal Alimentaire",
            subtitle: "Suivez vos repas et surveillez les purines",
            todays_log: "Journal d'Aujourd'hui",
            nothing_logged: "Rien d'enregistré",
            add: "Ajouter",
            daily_macros: "Macros Journaliers",
            uric_risk: "Risque d'Acide Urique",
            risk_high: "RISQUE ÉLEVÉ",
            risk_moderate: "MODÉRÉ",
            risk_low: "RISQUE FAIBLE",
            risk_warning: "Attention",
            risk_desc: "Approche de la limite quotidienne. Envisagez de remplacer la viande rouge par des œufs ou du tofu.",
            add_to_meal: "Ajouter au Repas",
            favorites: "Favoris",
            manual_entry: "Entrée Manuelle",
            ai_scan: "Scan IA",
            search_placeholder: "Rechercher favoris...",
            no_matches: "Aucun résultat trouvé.",
            no_favorites: "Pas encore de favoris.",
            food_name: "Nom de l'Aliment",
            calories: "Calories",
            purines: "Purines",
            ingredients: "Ingrédients",
            add_ingredient: "Ajouter Ingrédient",
            save_db: "Enregistrer dans les favoris",
            add_item: "Ajouter Élément",
            scan_option: "Prendre Photo",
            upload_option: "Télécharger Image",
            scan_help: "Suggestions de photos pour une meilleure précision :",
            scan_hint_1: "Photo d'une assiette complète",
            scan_hint_2: "Capture d'écran avec le nom du plat",
            scan_hint_3: "Photo d'emballage avec tableau nutritionnel",
            scan_hint_4: "Images claires de tout aliment",
            scan_note: "L'IA analyse automatiquement calories, purines, glucides, lipides et protéines en ~5-10 secondes.",
            analyzing: "Analyse des aliments par l'IA...",
            save_favorite: "Enregistrer dans les favoris",
            scan_again: "Scanner à Nouveau",
            pdf_daily_report: {
                title: "RAPPORT NUTRITIONNEL QUOTIDIEN",
                exec_summary_title: "1. Résumé Exécutif",
                exec_summary_subtitle: "Un aperçu rapide de la conformité aux objectifs du jour.",
                nutritional_balance_title: "ÉQUILIBRE NUTRITIONNEL (CONSOMMATION VS. OBJECTIF %)",
                reading_guide_title: "GUIDE DE LECTURE :",
                reading_guide_1: "• La zone grise représente votre objectif idéal (100%).",
                reading_guide_2: "• Si la zone verte est à l'intérieur de la zone grise, vous atteignez l'objectif.",
                reading_guide_3: "• Si la zone verte dépasse, cela indique un excès de ce nutriment.",
                keto_alert_title: "[!] ALERTE KETO : {val}g Glucides Nets",
                keto_alert_desc: "La consommation dépasse la limite suggérée pour la Cétose. Une activité physique légère est recommandée.",
                food_list_title: "2. Journal Alimentaire (Détail)",
                health_risks_title: "3. Analyse Santé & Risques",
                weekly_trends_title: "4. Tendances Hebdomadaires (7 derniers jours)",
                footer_page: "Page",
                risk_label: "RISQUE",
                risk_level: { high: "ÉLEVÉ", moderate: "MODÉRÉ", low: "FAIBLE" },
                uric_acid_title: "RISQUE ACIDE URIQUE",
                uric_acid_rec_high: "Hydratation suggérée : +3L eau.",
                uric_acid_rec_ok: "Niveaux sûrs.",
                gl_title: "CHARGE GLYCÉMIQUE",
                gl_label: "CG (Charge Glycémique)",
                gl_rec_high: "• CG Élevé : Marche de 10 min après repas suggérée pour réduire le pic.",
                gl_rec_ok: "• CG Optimal : Maintenir la consommation de glucides complexes.",
                glucose_title: "Lectures de Glucose",
                glucose_empty: "Aucune lecture de glucose enregistrée.",
                macro_breakdown_title: "Répartition des Macros",
                net_carbs_limit: "Limite Glucides Nets : {val}g/jour",
                total_daily: "TOTAL QUOTIDIEN",
                table_headers: {
                    item: "ARTICLE",
                    kcal: "KCAL",
                    purine: "PURINE",
                    carb: "GLU",
                    prot: "PROT",
                    fat: "LIP"
                },
                labels: {
                    calories: "CALORIES",
                    protein: "PROTÉINES",
                    carbs: "GLUCIDES",
                    fats: "LIPIDES",
                    water: "EAU",
                    optimal: "OPTIMAL",
                    exceeded: "DÉPASSÉ",
                    deficit: "DÉFICIT",
                    low: "FAIBLE",
                    high: "ÉLEVÉ",
                    target: "Cible"
                }
            }
        },
        food_db: {
            header: {
                badge: "BASE DE DONNÉES V7.1",
                title: "Classification des Aliments",
                subtitle: "Naviguez votre parcours céto en toute sécurité.",
                save_btn: "Enregistrer",
                new_food_btn: "Nouveau"
            },
            favorites: { title: "Favoris" },
            search: { placeholder: "Rechercher..." },
            filters: { all: "Tous" },
            load_more: "Charger Plus",
            editor: {
                title: "Modifier",
                cancel: "Annuler",
                save: "Enregistrer"
            },
            select_mode: {
                title: "Sélectionner",
                cancel: "Annuler",
                add_to_log: "Ajouter au Journal"
            }
        },

        fasting: {
            title: "Minuteur de Jeûne",
            subtitle: "Suivez vos fenêtres de jeûne pour optimiser l'autophagie et la cétose. Sélectionnez un protocole pour commencer.",
            intermittent_fasting: "JEÛNE INTERMITTENT",
            protocol_16_8: "16:8 TRF",
            protocol_12_12: "12:12 Circadien",
            protocol_20_4: "20:4 Guerrier",
            ready: "PRÊT",
            active: "ACTIF",
            target: "Cible",
            adjust: "Ajuster",
            start_fast: "Démarrer",
            end_fast: "Terminer",
            status_fasting_active: "Jeûne Actif",
            status_not_fasting: "Pas de Jeûne",
            metabolic_phases: "Phases Métaboliques",
            key_benefits: "Bénéfices Clés",
            pro_tip: "Conseil Pro",
            phase_start: "Début",
            phase_sugar_drop: "Chute Sucre",
            phase_ketosis: "Cétose",
            phase_autophagy: "Autophagie",
            phase_deep_clean: "Nettoyage Profond",
            phases: {
                start: {
                    desc: "Votre corps digère votre dernier repas et utilise le glucose stocké.",
                    benefits: ["Énergie du glucose", "Fonction métabolique normale", "Absorption nutriments"],
                    tip: "Buvez de l'eau pour vous préparer."
                },
                sugar_drop: {
                    desc: "L'insuline baisse et votre corps brûle le glycogène. Vous pourriez avoir faim.",
                    benefits: ["Sucre stabilisé", "Insuline diminue", "Repos digestif"],
                    tip: "Restez hydraté pour gérer la faim."
                },
                ketosis: {
                    desc: "Votre corps utilise les graisses comme carburant. Production de cétones.",
                    benefits: ["Mode brûle-graisse", "Clarté mentale", "Moins de fringales"],
                    tip: "Bon moment pour un exercice léger."
                },
                autophagy: {
                    desc: "Nettoyage cellulaire. Vos cellules se réparent.",
                    benefits: ["Réparation cellulaire", "Anti-âge", "Boost immunitaire"],
                    tip: "Le travail profond est souvent plus facile."
                },
                deep_clean: {
                    desc: "Pic d'autophagie et hormone de croissance. Réduction de l'inflammation.",
                    benefits: ["Réduction inflammation", "Pic hormone croissance", "Réparation intestinale"],
                    tip: "Écoutez votre corps ; arrêtez si besoin."
                }
            },
            reports: "Rapports et Analyses",
            weekly_analysis: "Analyse Hebdomadaire",
            metabolic_flexibility: "Flexibilité Métabolique",
            ketosis_efficiency: "Efficacité Cétose",
            optimal: "Optimal",
            good: "Bon",
            developing: "En progrès",
            insights: {
                improvement: "Excellente amélioration ! Votre corps devient plus efficace.",
                consistent: "Niveaux de cétose cohérents. Favorise la réparation cellulaire.",
                focus: "Visez 12h-16h pour débloquer la cétose profonde.",
                summary_exceeded: "Performance exceptionnelle ! Objectif atteint, cétose profonde.",
                summary_close: "Bel effort ! Vous êtes proche de l'objectif.",
                summary_start: "Bon début. L'autophagie commence souvent après 16h.",
                summary_none: "Pas de données aujourd'hui."
            },
            weekly_score: "Score Hebdo",
            weekly_goal: "Objectif Hebdo",
            weekly_ketosis: "Cétose Hebdo",
            ketones_delta: "Cétones Δ",
            history: "Historique",
            total_time: "Temps Total",
            days_fasted: "Jours Jeûnés",
            best_streak: "Meilleure Série",
            hydration: "Hydratation",
            hydration_goal: "Objectif",
            goal_updated: "Objectif quotidien mis à jour !",
            reset_confirm: "Réinitialiser l'eau à 0 ?",
            fasted: "Jeûné"
        },
        meal_planner: {
            title: "Planificador Hebdomadaire",
            subtitle: "Gérez vos repas de la semaine. Équilibrez vos macros et purines.",
            plan_week: "PLAN: SEMAINE",
            shopping_list: "Liste de Courses",
            pdf_report: "Rapport PDF",
            save_changes: "Sauvegarder",
            templates_title: "Modèles de Plan",
            manage: "Gérer",
            food_library: "Bibliothèque Alimentaire",
            search_placeholder: "Rechercher aliments...",
            filters: {
                all: "Tous",
                favorites: "Favoris",
                meats: "Viandes",
                poultry: "Volaille",
                seafood: "Fruits de Mer",
                veggies: "Légumes",
                dairy: "Produits Laitiers",
                fruits: "Fruits",
                nuts: "Noix",
                drinks: "Boissons",
                fast_food: "Fast Food"
            },
            weekly_grid_title: "Repas de la Semaine",
            days: {
                mon: "LUN",
                tue: "MAR",
                wed: "MER",
                thu: "JEU",
                fri: "VEN",
                sat: "SAM",
                sun: "DIM"
            },
            modals: {
                save_template_title: "Sauvegarder le Modèle",
                template_name: "Nom du Modèle",
                template_desc: "Description (Optionnel)",
                saved_templates: "Modèles Enregistrés",
                overwrite_hint: "(Cliquez pour écraser)",
                cancel: "Annuler",
                save_template: "Sauvegarder",
                shopping_list_title: "Liste de Courses",
                based_on: "Basé sur votre plan hebdomadaire :",
                close: "Fermer",
                print_copy: "Imprimer / Copier",
                edit_meal_title: "Modifier Repas",
                delete: "Supprimer"
            },
            pdf: {
                title: "Plan Nutritionnel Hebdomadaire",
                generated: "Généré",
                intro: "Voici votre analyse nutritionnelle hebdomadaire, la répartition des macros et le plan quotidien détaillé pour optimiser vos niveaux d'acide urique et nutritionnels.",
                macro_dist: "Répartition Macros (Moyenne)",
                cal_trend: "Tendance Calorique Hebdomadaire",
                weekly_summary: "RÉSUMÉ HEBDOMADAIRE",
                daily_avgs: "Moyennes Quotidiennes",
                ingredients: "INGRÉDIENT",
                amount: "QUANTITÉ",
                no_meals: "Aucun repas enregistré.",
                footer_text: "Page {0} de {1}  |  AUREUS Nutrition IA",
                sections: {
                    medical_analysis: "ANALYSE MÉDICALE & INSIGHTS",
                    energy_balance: "BALANCE ÉNERGÉTIQUE",
                    purine_profile: "PROFIL DE PURINES",
                    hydration: "HYDRATATION",
                    activity: "ACTIVITÉ",
                    rest: "REPOS",
                    detailed_plan: "PLAN QUOTIDIEN DÉTAILLÉ",
                    chrono_dist: "DISTRIBUTION CHRONOLOGIQUE DES REPAS"
                },
                analysis: {
                    cal_low: "Plan hypocalorique contrôlé.",
                    cal_high: "Plan hypercalorique de volume.",
                    cal_optimal: "Équilibre de maintien optimal.",
                    prot_dist: "Distribution de protéines à {val}% du total.",
                    stable_consumption: "Consommation stable pendant la période.",
                    purine_risk_high: "Risque : Niveaux élevés de purines.",
                    purine_risk_safe: "Sûr : Niveaux sous contrôle.",
                    hydration_goal: "Objectif : 2.5L - 3L par jour.",
                    hydration_reason: "Vital pour la filtration des purines.",
                    activity_freq: "Fréq : 150 min/sem.",
                    activity_desc: "Combiner force et cardio.",
                    rest_quality: "Qualité : 7-8h par nuit.",
                    rest_desc: "Régulation hormonale."
                }
            }
        }
    }
};

class LocalizationManager {
    constructor() {
        this.currentLang = localStorage.getItem('app_language') || 'en';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.translatePage();
            this.updateActiveState();
        });
    }

    setLanguage(lang) {
        if (!Translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('app_language', lang);
        this.translatePage();
        this.updateActiveState();
        document.dispatchEvent(new CustomEvent('language-changed', { detail: { language: lang } }));
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.dataset.i18n;
            const translation = this.getTranslation(key);
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.placeholder = translation;
                    }
                } else {
                    const icon = el.querySelector('i');
                    if (icon && el.childNodes[0] === icon) {
                        if (el.children.length === 0) {
                            el.innerText = translation;
                        } else {
                            el.childNodes.forEach(node => {
                                if (node.nodeType === 3 && node.textContent.trim().length > 0) {
                                    node.textContent = translation;
                                }
                            });
                        }
                    } else {
                        el.innerText = translation;
                    }
                }
            }
        });
        document.documentElement.lang = this.currentLang;

        // Update Chart Labels if present
        if (window.updateChartStats) window.updateChartStats();
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = Translations[this.currentLang];

        for (const k of keys) {
            value = value && value[k];
        }

        // Fallback to EN if missing
        if (value === undefined || value === null) {
            value = Translations['en'];
            for (const k of keys) {
                value = value && value[k];
            }
        }

        return value;
    }

    updateActiveState() {
        const chips = document.querySelectorAll('.lang-chip');
        chips.forEach(chip => {
            if (chip.dataset.lang === this.currentLang) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }
}

window.Locales = new LocalizationManager();
