const foodDatabase = [
    // --- MIS PLATILLOS / FAVORITOS ---
    {
        name: "Rol de Canela Glaseado (Pieza Grande 300g)",
        category: "Others", image: "images/foods/Rol de Canela Glaseado (Pieza Grande 300g).jpeg",
        icon: "fa-cookie-bite",
        cal: 1080, fat: 40, prot: 14, carb: 140, purines: 15, gi: 75,
        status: "caution",
        tip: "CUIDADO CON EL AZÚCAR. Tiene pocas purinas \"directas\", pero 140g de carbohidratos (azúcar refinada) dispararán tu ácido úrico endógeno. Además, la levadura de panadería contiene algunas purinas. Cómelo compartido, nunca entero.",
        favourite: true,
        ingredients: [
            { name: "Harina de trigo", amount: "150g" },
            { name: "Mantequilla", amount: "60g" },
            { name: "Azúcar morena", amount: "80g" },
            { name: "Canela en polvo", amount: "2 cdas" },
            { name: "Huevo", amount: "1 pieza" },
            { name: "Leche", amount: "50ml" },
            { name: "Levadura", amount: "10g" },
            { name: "Glaseado de azúcar", amount: "40g" }
        ]
    },
    {
        name: "Cereal con Leche y Fruta (Tazón)",
        category: "Others", image: "images/foods/Cereal con Leche y Fruta (Tazón).jpeg",
        icon: "fa-bowl-food",
        cal: 280, fat: 6, prot: 10, carb: 45, purines: 15, gi: 70,
        status: "safe",
        tip: "BUENA OPCIÓN. La mayoría de los cereales y la leche son seguros para el ácido úrico (especialmente si es descremada). Añadir fruta fresca (fresas/plátano) aporta Vitamina C, que ayuda a reducir niveles de ácido úrico.",
        favourite: true,
        ingredients: [
            { name: "Cereal integral", amount: "40g" },
            { name: "Leche semidescremada", amount: "200ml" },
            { name: "Fresas", amount: "5 piezas" },
            { name: "Plátano", amount: "1/2 pieza" },
            { name: "Miel", amount: "1 cdita" }
        ]
    },
    {
        name: "Chilaquiles con Pollo (Rojos/Verdes)",
        category: "Poultry", image: "images/foods/Chilaquiles.jpeg",
        icon: "fa-bowl-rice",
        cal: 530, fat: 22, prot: 28, carb: 55, purines: 85, gi: 52,
        status: "caution",
        tip: "MODERACIÓN. El pollo y la tortilla son seguros, pero la crema, el queso y la cocción de la salsa pueden sumar grasas. Pídelos con poca crema y pechuga de pollo desmenuzada (no piel) para mantener el riesgo bajo.",
        favourite: true,
        ingredients: [
            { name: "Totopos de tortilla", amount: "150g" },
            { name: "Pechuga de pollo deshebrada", amount: "100g" },
            { name: "Salsa roja/verde", amount: "200ml" },
            { name: "Crema ácida", amount: "2 cdas" },
            { name: "Queso fresco", amount: "30g" },
            { name: "Cebolla blanca", amount: "1/4 pieza" },
            { name: "Cilantro", amount: "al gusto" }
        ]
    },
    {
        name: "Hamburguesa Don Doblecarne",
        category: "Fast Food", image: "images/foods/Burger 1.jpeg",
        icon: "fa-burger",
        cal: 850, fat: 45, prot: 54, carb: 48, purines: 180, gi: 60,
        status: "avoid",
        tip: "MUY ALTO RIESGO. Doble carne roja significa doble carga de purinas y grasas saturadas. Es una bomba para el riñón. Si tienes antojo, es mejor una hamburguesa sencilla de pollo o vegetariana. Evita acompañarla con cerveza.",
        favourite: true,
        ingredients: [
            { name: "Pan de hamburguesa", amount: "1 pieza" },
            { name: "Carne de res (2 carnes)", amount: "200g" },
            { name: "Queso amarillo", amount: "2 rebanadas" },
            { name: "Lechuga", amount: "2 hojas" },
            { name: "Tomate", amount: "2 rodajas" },
            { name: "Cebolla", amount: "2 anillos" },
            { name: "Mayonesa", amount: "1 cda" },
            { name: "Catsup", amount: "1 cda" },
            { name: "Mostaza", amount: "1 cdita" }
        ]
    },
    { name: "Vino Tinto (Copa 150ml)", category: "Drinks", image: "images/foods/Vino Tinto (Copa 150ml).jpeg", icon: "fa-wine-glass", cal: 125, fat: 0, prot: 0, carb: 4, purines: 2, gi: 15, status: "caution", tip: "MEJOR OPCIÓN ALCOHÓLICA. El vino tinto tiene muy pocas purinas.", favourite: true },
    { name: "Vino Blanco (Copa 150ml)", category: "Drinks", image: "images/foods/Vino Blanco (Copa 150ml).jpeg", icon: "fa-wine-glass-empty", cal: 121, fat: 0, prot: 0, carb: 4, purines: 2, gi: 15, status: "caution", tip: "MODERADO. Bajo en purinas, pero con azúcar.", favourite: true },
    { name: "Cerveza Indio (Botella 355ml)", category: "Drinks", image: "images/foods/Cerveza Indio (Caguamon 1.18L).jpeg", icon: "fa-beer-mug-empty", cal: 150, fat: 0, prot: 1, carb: 14, purines: 35, gi: 66, status: "caution", tip: "RIESGO MODERADO. Cerveza oscura.", favourite: true },
    { name: "Cerveza Indio (Caguamón 1.18L)", category: "Drinks", image: "images/foods/Cerveza Indio (Caguamon 1.18L).jpeg", icon: "fa-beer-mug-empty", cal: 510, fat: 0, prot: 4, carb: 46, purines: 120, gi: 66, status: "avoid", tip: "PELIGRO GOTA. Demasiado alcohol y levadura.", favourite: true },
    { name: "Miller High Life (940 ml)", category: "Drinks", image: "images/foods/Cerveza  General.jpeg", icon: "fa-beer-mug-empty", cal: 373, fat: 0, prot: 2.7, carb: 32.3, purines: 110, gi: 66, status: "avoid", tip: "ALTO RIESGO. Cerveza Lager en gran volumen.", favourite: true },
    { name: "Cerveza XX Lager (Botella 355ml)", category: "Drinks", image: "images/foods/Cerveza XX.jpeg", icon: "fa-beer-mug-empty", cal: 130, fat: 0, prot: 1, carb: 11, purines: 25, gi: 66, status: "caution", tip: "LIGERAMENTE MEJOR. Tipo Lager clara.", favourite: true },
    { name: "Cerveza XX Ambar (Botella 355ml)", category: "Drinks", image: "images/foods/Cerveza XX.jpeg", icon: "fa-beer-mug-empty", cal: 145, fat: 0, prot: 1, carb: 13, purines: 32, gi: 66, status: "caution", tip: "ESTILO VIENA. Maltas tostadas.", favourite: true },
    { name: "Cerveza Victoria (Botella 355ml)", category: "Drinks", image: "images/foods/Cerveza  General.jpeg", icon: "fa-beer-mug-empty", cal: 140, fat: 0, prot: 1, carb: 13, purines: 30, gi: 66, status: "caution", tip: "RIESGO MEDIO. Cerveza tipo Viena.", favourite: true },
    { name: "Cerveza Victoria (Caguama 940ml)", category: "Drinks", image: "images/foods/Cerveza  General.jpeg", icon: "fa-beer-mug-empty", cal: 375, fat: 0, prot: 3, carb: 35, purines: 85, gi: 66, status: "avoid", tip: "ALTO RIESGO. Gran volumen satura el hígado.", favourite: true },
    { name: "Cerveza de Tarro / Michelada (1 Litro)", category: "Drinks", image: "images/foods/Cerveza de Tarro  Michelada.jpeg", icon: "fa-martini-glass-citrus", cal: 450, fat: 0, prot: 3, carb: 45, purines: 110, gi: 66, status: "avoid", tip: "LA PEOR OPCIÓN. Exceso de purinas y sodio.", favourite: true },
    { name: "Whisky (Copa 45ml)", category: "Drinks", icon: "fa-martini-glass-empty", cal: 105, fat: 0, prot: 0, carb: 0, purines: 0, gi: 0, status: "caution", tip: "SIN PURINAS PERO CUIDADO. Destilados.", favourite: true },
    { name: "Tequila (Caballito 45ml)", category: "Drinks", icon: "fa-wine-bottle", cal: 97, fat: 0, prot: 0, carb: 0, purines: 0, gi: 0, status: "caution", tip: "OPCIÓN NEUTRA. Opción limpia si vas a beber.", favourite: true },
    { name: "Refresco de Cola (600ml)", category: "Drinks", image: "images/foods/Refresco de Cola (600ml).jpeg", icon: "fa-bottle-water", cal: 252, fat: 0, prot: 0, carb: 63, purines: 0, gi: 63, status: "avoid", tip: "ENEMIGO SILENCIOSO. Fructosa eleva el ácido úrico.", favourite: true },
    { name: "Agua de Jamaica (Sin Azúcar / 1 Vaso)", category: "Drinks", icon: "fa-glass-water", cal: 10, fat: 0, prot: 0, carb: 2, purines: 0, gi: 10, status: "safe", tip: "MUY RECOMENDADO. La jamaica es un diurético natural.", favourite: true },
    { name: "Jugo de Naranja (Natural 250ml)", category: "Drinks", image: "images/foods/Jugo.jpeg", icon: "fa-lemon", cal: 112, fat: 0, prot: 2, carb: 26, purines: 0, gi: 50, status: "caution", tip: "CUIDADO FRUCTOSA. El jugo concentra el azúcar.", favourite: true },
    { name: "Menudo / Pancita (Plato Grande)", category: "Meats", image: "images/foods/Menudo   Pancita (Plato Grande).jpeg", icon: "fa-bowl-rice", cal: 380, fat: 18, prot: 35, carb: 15, purines: 300, gi: 45, status: "avoid", tip: "PROHIBIDO EN CRISIS. Las vísceras son fuentes concentradas de purinas.", favourite: true, ingredients: [{ name: "Panza de res", amount: "200g" }, { name: "Caldo de res", amount: "400ml" }, { name: "Maíz pozolero", amount: "50g" }, { name: "Chile guajillo", amount: "3 piezas" }, { name: "Orégano", amount: "1 cdita" }, { name: "Limón", amount: "1 pieza" }, { name: "Cebolla", amount: "al gusto" }] },
    { name: "Hígado Encebollado (150g)", category: "Meats", image: "images/foods/item_beef_liver.png", icon: "fa-cow", cal: 260, fat: 10, prot: 28, carb: 12, purines: 350, gi: 0, status: "avoid", tip: "PELIGRO MÁXIMO. El hígado tiene la carga más alta de purinas.", favourite: true, ingredients: [{ name: "Hígado de res", amount: "150g" }, { name: "Cebolla blanca", amount: "1 pieza" }, { name: "Aceite", amount: "1 cda" }, { name: "Ajo", amount: "2 dientes" }, { name: "Sal y pimienta", amount: "al gusto" }] },
    { name: "Pozole Rojo de Cerdo (Plato)", category: "Meats", image: "images/foods/diet_mexican.png", icon: "fa-bowl-rice", cal: 420, fat: 15, prot: 25, carb: 45, purines: 110, gi: 52, status: "caution", tip: "DEPENDE LA CARNE. El maíz pozolero es seguro.", favourite: true, ingredients: [{ name: "Carne de cerdo", amount: "120g" }, { name: "Maíz pozolero", amount: "100g" }, { name: "Chile guajillo", amount: "4 piezas" }, { name: "Lechuga", amount: "al gusto" }, { name: "Rábanos", amount: "3 piezas" }, { name: "Tostadas", amount: "2 piezas" }, { name: "Orégano", amount: "1 cdita" }] },
    { name: "Pechuga de Pollo Asada (150g)", category: "Poultry", image: "images/foods/Pechuga de pollo con ensalada.jpeg", icon: "fa-drumstick-bite", cal: 165, fat: 3.5, prot: 31, carb: 0, purines: 60, gi: 0, status: "safe", tip: "PROTEÍNA SEGURA. El pollo sin piel es moderado en purinas.", favourite: true },
    { name: "Salmón a la Plancha (150g)", category: "Seafood", image: "images/foods/Salmon con Aguacate.jpeg", icon: "fa-fish", cal: 310, fat: 18, prot: 34, carb: 0, purines: 110, gi: 0, status: "caution", tip: "BUENO CON MODERACIÓN. Tiene purinas moderadas.", favourite: true },
    { name: "Sardinas en Tomate (Lata)", category: "Seafood", image: "images/foods/item_sardines.png", icon: "fa-fish", cal: 220, fat: 15, prot: 20, carb: 2, purines: 300, gi: 15, status: "avoid", tip: "MUY ALTO EN PURINAS. Evitar sardinas y anchoas.", favourite: true },
    { name: "Frijoles de la Olla (1 Taza)", category: "Veggies", image: "images/foods/item_legumes.png", icon: "fa-leaf", cal: 230, fat: 1, prot: 15, carb: 40, purines: 60, gi: 40, status: "caution", tip: "MITO COMÚN. Tienen purinas vegetales.", favourite: true },
    { name: "Lentejas (Sopa 1 Taza)", category: "Veggies", image: "images/foods/item_legumes.png", icon: "fa-leaf", cal: 190, fat: 3, prot: 12, carb: 30, purines: 50, gi: 32, status: "safe", tip: "EXCELENTE FUENTE. Aportan fibra.", favourite: true },
    { name: "Ensalada César (Plato)", category: "Veggies", image: "images/foods/Ensalada.jpeg", icon: "fa-leaf", cal: 350, fat: 25, prot: 8, carb: 10, purines: 20, gi: 15, status: "safe", tip: "CUIDADO ADEREZO. Lechuga y queso son seguros.", favourite: true, ingredients: [{ name: "Lechuga romana", amount: "150g" }, { name: "Queso parmesano", amount: "20g" }, { name: "Crutones", amount: "30g" }, { name: "Aderezo César", amount: "2 cdas" }, { name: "Pechuga de pollo", amount: "50g" }] },
    { name: "Pizza de Pepperoni (2 Rebanadas)", category: "Fast Food", image: "images/foods/Pizza.jpeg", icon: "fa-pizza-slice", cal: 600, fat: 28, prot: 24, carb: 65, purines: 60, gi: 80, status: "caution", tip: "GRASA Y HARINA. Pepperoni tiene purinas.", favourite: true, ingredients: [{ name: "Masa de pizza", amount: "150g" }, { name: "Salsa de tomate", amount: "50ml" }, { name: "Queso mozzarella", amount: "80g" }, { name: "Pepperoni", amount: "20 rebanadas" }, { name: "Orégano", amount: "al gusto" }] },
    { name: "Hot Dog (Sencillo)", category: "Fast Food", image: "images/foods/Hot Dog Sencillo Premium.png", icon: "fa-hotdog", cal: 300, fat: 18, prot: 10, carb: 25, purines: 40, gi: 70, status: "caution", tip: "EMBUTIDOS. Salchichas procesadas.", favourite: true, ingredients: [{ name: "Pan de hot dog", amount: "1 pieza" }, { name: "Salchicha", amount: "1 pieza" }, { name: "Catsup", amount: "1 cda" }, { name: "Mostaza", amount: "1 cdita" }, { name: "Cebolla picada", amount: "1 cda" }] },
    { name: "Papaya Picada (1 Taza)", category: "Fruits", image: "images/foods/item_tropical_fruits.png", icon: "fa-apple-whole", cal: 60, fat: 0, prot: 1, carb: 15, purines: 0, gi: 60, status: "safe", tip: "ANTIINFLAMATORIO. Papaína ayuda digestión.", favourite: true },
    { name: "Cerezas (1 Taza)", category: "Fruits", image: "images/foods/Cerezas.jpeg", icon: "fa-apple-whole", cal: 90, fat: 0, prot: 1, carb: 22, purines: 0, gi: 22, status: "safe", tip: "MEDICINA NATURAL. Reduce ácido úrico.", favourite: true },
    { name: "Café Americano (Taza 250ml)", category: "Drinks", image: "images/foods/Café.jpeg", icon: "fa-mug-hot", cal: 2, fat: 0, prot: 0, carb: 0, purines: 0, gi: 0, status: "safe", tip: "PROTECTOR. Café ayuda a disminuir ácido úrico.", favourite: true },
    { name: "Yogur Griego Natural (150g)", category: "Dairy", image: "images/foods/item_greek_yogurt.png", icon: "fa-cow", cal: 90, fat: 0, prot: 15, carb: 6, purines: 0, gi: 11, status: "safe", tip: "EXCELENTE FUENTE. Proteínas lácteas ayudan.", favourite: true },
    { name: "Atún Fresco (Medallón 150g)", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 180, fat: 2, prot: 35, carb: 0, purines: 180, gi: 0, status: "caution", tip: "MEJOR QUE LATA. Purinas pero sin sodio.", favourite: true },
    // --- MIS FAVORITOS (Manual Restore) ---
    { name: "Hot Cakes (Orden de 2 pzas)", category: "Others", image: "images/foods/Pancaques con Cafe.jpeg", icon: "fa-utensils", cal: 227, fat: 10, prot: 6, carb: 28, purines: 12, gi: 67, status: "safe", tip: "CUIDADO CON EL JARABE.", favourite: true, ingredients: [{ name: "Harina para hot cakes", amount: "80g" }, { name: "Huevo", amount: "1 pieza" }, { name: "Leche", amount: "100ml" }, { name: "Mantequilla", amount: "20g" }, { name: "Miel de maple", amount: "2 cdas" }] },
    { name: "Negra Modelo (Mega 1.2L)", category: "Drinks", image: "images/foods/item_beer.png", icon: "fa-beer-mug-empty", cal: 581, fat: 0, prot: 5, carb: 53, purines: 140, gi: 66, status: "avoid", tip: "ALTO RIESGO GOTA.", favourite: true },
    { name: "Costillas de Cerdo (220g)", category: "Meats", image: "images/foods/Costillas de Cerdo.jpeg", icon: "fa-bone", cal: 638, fat: 46, prot: 52, carb: 0, purines: 264, gi: 0, status: "avoid", tip: "ALTO CONTENIDO GRASO.", favourite: true, ingredients: [{ name: "Costillas de cerdo", amount: "220g" }, { name: "Salsa BBQ", amount: "2 cdas" }, { name: "Ajo en polvo", amount: "1 cdita" }, { name: "Sal y pimienta", amount: "al gusto" }] },
    { name: "Tacos de Carnitas (Orden de 3)", category: "Fast Food", image: "images/foods/diet_mexican.png", icon: "fa-utensils", cal: 760, fat: 42, prot: 48, carb: 45, purines: 250, gi: 52, status: "avoid", tip: "BOMBA PARA GOTA.", favourite: true, ingredients: [{ name: "Carnitas de cerdo", amount: "180g" }, { name: "Tortillas de maíz", amount: "3 piezas" }, { name: "Cilantro", amount: "al gusto" }, { name: "Cebolla picada", amount: "2 cdas" }, { name: "Limón", amount: "1 pieza" }, { name: "Salsa verde", amount: "2 cdas" }] },
    { name: "Pasta con Mejillones (350g)", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 440, fat: 12, prot: 24, carb: 58, purines: 145, gi: 55, status: "caution", tip: "MODERACIÓN.", favourite: true, ingredients: [{ name: "Pasta espagueti", amount: "150g" }, { name: "Mejillones", amount: "150g" }, { name: "Ajo", amount: "3 dientes" }, { name: "Vino blanco", amount: "50ml" }, { name: "Perejil", amount: "al gusto" }, { name: "Aceite de oliva", amount: "2 cdas" }] },
    { name: "Omelet de Claras, Queso y Espinaca", category: "Others", image: "images/foods/item_eggs_breakfast.png", icon: "fa-egg", cal: 210, fat: 12, prot: 22, carb: 4, purines: 15, gi: 0, status: "safe", tip: "EXCELENTE PARA GOTA.", favourite: true, ingredients: [{ name: "Claras de huevo", amount: "4 piezas" }, { name: "Espinaca", amount: "50g" }, { name: "Queso panela", amount: "40g" }, { name: "Aceite de oliva", amount: "1 cdita" }, { name: "Sal", amount: "al gusto" }] },
    { name: "Albóndigas con Espagueti", category: "Meats", image: "images/foods/Albóndigas con Espagueti.jpg", icon: "fa-utensils", cal: 535, fat: 22, prot: 26, carb: 58, purines: 125, gi: 55, status: "caution", tip: "CUIDADO CON LA CARNE.", favourite: true, ingredients: [{ name: "Carne molida de res", amount: "150g" }, { name: "Espagueti", amount: "120g" }, { name: "Salsa de tomate", amount: "150ml" }, { name: "Cebolla", amount: "1/4 pieza" }, { name: "Ajo", amount: "2 dientes" }, { name: "Pan molido", amount: "2 cdas" }, { name: "Huevo", amount: "1 pieza" }] },
    { name: "Arroz Blanco (250g)", category: "Others", image: "images/foods/diet_flexitarian.png", icon: "fa-plate-wheat", cal: 325, fat: 1, prot: 7, carb: 70, purines: 15, gi: 73, status: "safe", tip: "ALIADO CONTRA LA GOTA.", favourite: true },
    { name: "Tortillas de Maíz (3 piezas)", category: "Others", image: "images/foods/diet_mexican.png", icon: "fa-plate-wheat", cal: 190, fat: 2, prot: 5, carb: 39, purines: 10, gi: 52, status: "safe", tip: "OPCIÓN SEGURA.", favourite: true },
    { name: "Tostadas de Atún con Aguacate (2 pzas)", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-shrimp", cal: 415, fat: 18, prot: 28, carb: 32, purines: 130, gi: 50, status: "caution", tip: "ATÚN CON MODERACIÓN.", favourite: true, ingredients: [{ name: "Tostadas de maíz", amount: "2 piezas" }, { name: "Atún en agua", amount: "1 lata" }, { name: "Aguacate", amount: "1/2 pieza" }, { name: "Mayonesa", amount: "1 cda" }, { name: "Limón", amount: "1 pieza" }, { name: "Cebolla morada", amount: "2 cdas" }] },
    { name: "Camarones a la Diabla (200g)", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 410, fat: 24, prot: 38, carb: 12, purines: 290, gi: 0, status: "avoid", tip: "PELIGROSO PARA GOTA.", favourite: true, ingredients: [{ name: "Camarones", amount: "200g" }, { name: "Chile guajillo", amount: "3 piezas" }, { name: "Chile de árbol", amount: "2 piezas" }, { name: "Ajo", amount: "3 dientes" }, { name: "Aceite", amount: "2 cdas" }, { name: "Cebolla", amount: "1/4 pieza" }] },
    { name: "Quesadilla Harina con Aguacate (1 pza)", category: "Fast Food", image: "images/foods/diet_mexican.png", icon: "fa-utensils", cal: 340, fat: 19, prot: 12, carb: 28, purines: 18, gi: 70, status: "safe", tip: "OPCIÓN SEGURA.", favourite: true, ingredients: [{ name: "Tortilla de harina", amount: "1 pieza grande" }, { name: "Queso Oaxaca", amount: "50g" }, { name: "Aguacate", amount: "1/4 pieza" }, { name: "Crema", amount: "1 cda" }] },

    // --- CARNES Y AVES ---
    { name: "Pato (Con piel)", category: "Poultry", image: "images/foods/cat_poultry.png", icon: "fa-dove", cal: 337, fat: 28, prot: 19, carb: 0, purines: 138, gi: 0, status: "caution", tip: "Keto friendly fat, but moderate purines." },
    { name: "Pato (Sin piel)", category: "Poultry", image: "images/foods/cat_poultry.png", icon: "fa-dove", cal: 201, fat: 11, prot: 24, carb: 0, purines: 138, gi: 0, status: "caution", tip: "Leaner poultry option with moderate purines." },
    { name: "Ganso", category: "Poultry", image: "images/foods/cat_poultry.png", icon: "fa-dove", cal: 371, fat: 33, prot: 16, carb: 0, purines: 165, gi: 0, status: "avoid", tip: "High purine levels make this risky for gout." },
    { name: "Codorniz (Con piel)", category: "Poultry", image: "images/foods/cat_poultry.png", icon: "fa-dove", cal: 234, fat: 14, prot: 25, carb: 0, purines: 150, gi: 0, status: "caution", tip: "Small bird, moderate purine density." },
    { name: "Pavo (Pechuga)", category: "Poultry", image: "images/foods/Pavo (Pechuga).jpg", icon: "fa-drumstick-bite", cal: 135, fat: 1, prot: 30, carb: 0, purines: 150, gi: 0, status: "caution", tip: "Lean protein, watch portion size for purines." },
    { name: "Pavo (Muslo)", category: "Poultry", image: "images/foods/cat_poultry.png", icon: "fa-drumstick-bite", cal: 187, fat: 10, prot: 28, carb: 0, purines: 150, gi: 0, status: "caution", tip: "Dark meat turkey with moderate purines." },
    { name: "Carne de Venado", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-paw", cal: 158, fat: 3, prot: 30, carb: 0, purines: 140, gi: 0, status: "caution", tip: "Game meat is often high in purines." },
    { name: "Carne de Conejo", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-paw", cal: 173, fat: 8, prot: 25, carb: 0, purines: 132, gi: 0, status: "caution", tip: "Lean alternative with moderate purines." },
    { name: "Cordero (Chuleta)", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-bone", cal: 294, fat: 21, prot: 25, carb: 0, purines: 182, gi: 0, status: "avoid", tip: "Lamb chops are significantly high in purines." },
    { name: "Cordero (Pierna)", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-bone", cal: 200, fat: 10, prot: 28, carb: 0, purines: 140, gi: 0, status: "caution", tip: "Better choice than chops but still moderate." },
    { name: "Ternera (Lengua)", category: "Meats", image: "images/foods/item_beef_liver.png", icon: "fa-cow", cal: 284, fat: 22, prot: 19, carb: 0, purines: 160, gi: 0, status: "avoid", tip: "Very high purines found in organ meats." },
    { name: "Mollejas", category: "Meats", image: "images/foods/item_beef_liver.png", icon: "fa-cloud-meatball", cal: 240, fat: 18, prot: 18, carb: 0, purines: 990, gi: 0, status: "avoid", tip: "Extremely high purines! Avoid at all costs." },
    { name: "Cerdo (Lomo)", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-bone", cal: 242, fat: 14, prot: 27, carb: 0, purines: 120, gi: 0, status: "caution", tip: "Standard pork cut, moderate purine risk." },
    { name: "Jamón Ibérico (Bellota)", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-bone", cal: 350, fat: 25, prot: 30, carb: 0, purines: 125, gi: 0, status: "caution", tip: "Delicious Keto fat, but purines are moderate." },
    { name: "Salami", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-bone", cal: 336, fat: 26, prot: 22, carb: 2, purines: 120, gi: 0, status: "caution", tip: "Processed meat with moderate purines." },
    { name: "Pepperoni", category: "Meats", image: "images/foods/Pepperoni.jpeg", icon: "fa-bone", cal: 504, fat: 46, prot: 23, carb: 0, purines: 120, gi: 0, status: "caution", tip: "High fat, moderate purines." },
    { name: "Mortadela", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-bone", cal: 311, fat: 25, prot: 16, carb: 3, purines: 90, gi: 0, status: "caution", tip: "Lower purine index for a cold cut." },
    { name: "Salchicha Frankfurt", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-bone", cal: 290, fat: 26, prot: 12, carb: 2, purines: 90, gi: 0, status: "caution", tip: "Relatively low purines, watch for carbs." },
    { name: "Carne de Cabra", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-cow", cal: 143, fat: 3, prot: 27, carb: 0, purines: 120, gi: 0, status: "caution", tip: "Lean and moderate in purines." },
    { name: "Bisonte", category: "Meats", image: "images/foods/cat_meat.png", icon: "fa-cow", cal: 143, fat: 2, prot: 28, carb: 0, purines: 110, gi: 0, status: "caution", tip: "Very lean, moderate purines." },
    { name: "Pollo (Alitas con piel)", category: "Poultry", image: "images/foods/cat_poultry.png", icon: "fa-drumstick-bite", cal: 290, fat: 19, prot: 27, carb: 0, purines: 110, gi: 0, status: "caution", tip: "Great for Keto, but watch the purines." },
    { name: "Gelatina (Sin sabor)", category: "Others", image: "images/foods/diet_flexitarian.png", icon: "fa-fire", cal: 335, fat: 0, prot: 85, carb: 0, purines: 10, gi: 0, status: "safe", tip: "Safe and protein rich." },

    // --- PESCADOS Y MARISCOS ---
    { name: "Bacalao (Fresco)", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 82, fat: 0.7, prot: 18, carb: 0, purines: 109, gi: 0, status: "safe", tip: "Lean fish with safe purine levels." },
    { name: "Merluza", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 78, fat: 1.8, prot: 15, carb: 0, purines: 70, gi: 0, status: "safe", tip: "Excellent choice, low purine content." },
    { name: "Lenguado", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish-fins", cal: 91, fat: 1.2, prot: 19, carb: 0, purines: 130, gi: 0, status: "caution", tip: "Moderate purines, enjoy in moderation." },
    { name: "Tilapia", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 96, fat: 1.7, prot: 20, carb: 0, purines: 100, gi: 0, status: "safe", tip: "Generally safe for gout patients." },
    { name: "Lubina", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 97, fat: 2, prot: 18, carb: 0, purines: 110, gi: 0, status: "caution", tip: "Moderate purine levels." },
    { name: "Dorada", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 115, fat: 4, prot: 19, carb: 0, purines: 120, gi: 0, status: "caution", tip: "Watch portion sizes due to moderate purines." },
    { name: "Trucha", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish-fins", cal: 148, fat: 6.6, prot: 20, carb: 0, purines: 297, gi: 0, status: "avoid", tip: "Surprisingly high in purines, avoid if possible." },
    { name: "Caballa (Mackerel)", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 305, fat: 25, prot: 19, carb: 0, purines: 145, gi: 0, status: "caution", tip: "High Omega-3, but caution on purines." },
    { name: "Arenque (Herring)", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-water", cal: 158, fat: 9, prot: 18, carb: 0, purines: 210, gi: 0, status: "avoid", tip: "Very high purines, avoid during flares." },
    { name: "Pez Espada", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish-fins", cal: 144, fat: 6.7, prot: 19.8, carb: 0, purines: 130, gi: 0, status: "caution", tip: "Large fish with moderate purines." },
    { name: "Mero", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 92, fat: 1, prot: 19, carb: 0, purines: 80, gi: 0, status: "safe", tip: "Safe white fish option." },
    { name: "Bagre (Catfish)", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 95, fat: 2.9, prot: 16, carb: 0, purines: 100, gi: 0, status: "safe", tip: "Relatively low purines." },
    { name: "Rodaballo", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 95, fat: 3, prot: 16, carb: 0, purines: 120, gi: 0, status: "caution", tip: "Moderate purine fish." },
    { name: "Anguila", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 184, fat: 11, prot: 18, carb: 0, purines: 115, gi: 0, status: "caution", tip: "Fatty and moderate in purines." },
    { name: "Caviar", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-gem", cal: 264, fat: 18, prot: 25, carb: 4, purines: 144, gi: 0, status: "caution", tip: "Luxury item with moderate purines." },
    { name: "Calamar", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 92, fat: 1.4, prot: 15.6, carb: 3, purines: 135, gi: 0, status: "caution", tip: "Moderate purines, watch for breading." },
    { name: "Pulpo", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 82, fat: 1, prot: 15, carb: 2.2, purines: 80, gi: 0, status: "safe", tip: "Octopus is generally lower in purines." },
    { name: "Mejillones", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 86, fat: 2.2, prot: 12, carb: 3.7, purines: 154, gi: 0, status: "avoid", tip: "Shellfish like mussels are high in purines." },
    { name: "Ostras", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 68, fat: 2.5, prot: 7, carb: 4, purines: 180, gi: 0, status: "avoid", tip: "Oysters are risky for gout flares." },
    { name: "Almejas", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 74, fat: 1, prot: 13, carb: 2.5, purines: 145, gi: 0, status: "caution", tip: "Moderate purines in clams." },
    { name: "Vieiras (Scallops)", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 88, fat: 0.8, prot: 17, carb: 2.4, purines: 136, gi: 0, status: "caution", tip: "Moderate purine levels." },
    { name: "Cangrejo", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 84, fat: 1, prot: 18, carb: 0, purines: 125, gi: 0, status: "caution", tip: "Moderate for gout, great for Keto." },
    { name: "Langosta", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 90, fat: 0.9, prot: 19, carb: 0, purines: 100, gi: 0, status: "safe", tip: "Surprisingly lower purines for a shellfish." },
    { name: "Langostinos", category: "Seafood", image: "images/foods/cat_seafood.png", icon: "fa-shrimp", cal: 106, fat: 1.7, prot: 20, carb: 0.9, purines: 147, gi: 0, status: "caution", tip: "King prawns have moderate purines." },
    { name: "Surimi", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish-fins", cal: 99, fat: 0.9, prot: 15, carb: 7, purines: 25, gi: 50, status: "caution", tip: "Low purines but watch the hidden carbs!" },
    { name: "Halibut", category: "Seafood", image: "images/foods/cat_fish.png", icon: "fa-fish", cal: 140, fat: 3, prot: 27, carb: 0, purines: 130, gi: 0, status: "caution", tip: "Moderate purines fish." },

    // --- VERDURAS Y HORTALIZAS ---
    { name: "Acelgas", category: "Veggies", image: "images/foods/item_spinach.png", icon: "fa-leaf", cal: 19, fat: 0.2, prot: 1.8, carb: 3.7, purines: 30, gi: 15, status: "safe", tip: "Safe and healthy green leafy veggie." },
    { name: "Alcachofa", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-seedling", cal: 47, fat: 0.2, prot: 3.3, carb: 10.5, purines: 78, gi: 20, status: "caution", tip: "Moderate purines and slightly higher carbs." },
    { name: "Berenjena", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-egg", cal: 25, fat: 0.2, prot: 1, carb: 6, purines: 10, gi: 15, status: "safe", tip: "Very safe for both Keto and gout." },
    { name: "Calabaza", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-sun", cal: 26, fat: 0.1, prot: 1, carb: 6.5, purines: 20, gi: 75, status: "caution", tip: "Relatively safe, watch carbs on strict Keto." },
    { name: "Chucrut", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-jar", cal: 19, fat: 0.1, prot: 0.9, carb: 4.3, purines: 15, gi: 15, status: "safe", tip: "Probiotic and safe for gout." },
    { name: "Coles de Bruselas", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-tree", cal: 43, fat: 0.3, prot: 3.4, carb: 9, purines: 69, gi: 15, status: "safe", tip: "Generally safe vegetable." },
    { name: "Col Rizada (Kale)", category: "Veggies", image: "images/foods/item_spinach.png", icon: "fa-leaf", cal: 49, fat: 0.9, prot: 4.3, carb: 8.8, purines: 48, gi: 15, status: "safe", tip: "Superfood green, safe and nutrient rich." },
    { name: "Endibias", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-clover", cal: 17, fat: 0.2, prot: 1.3, carb: 3.4, purines: 12, gi: 15, status: "safe", tip: "Excellent for salads, very low purine." },
    { name: "Hinojo", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-seedling", cal: 31, fat: 0.2, prot: 1.2, carb: 7, purines: 14, gi: 15, status: "safe", tip: "Low purine vegetable." },
    { name: "Jengibre (Raíz)", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-seedling", cal: 80, fat: 0.8, prot: 1.8, carb: 18, purines: 5, gi: 15, status: "safe", tip: "Safe to use as a flavoring." },
    { name: "Nabos", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-circle", cal: 28, fat: 0.1, prot: 0.9, carb: 6.4, purines: 10, gi: 62, status: "safe", tip: "Safe root vegetable alternative." },
    { name: "Pepinillos", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-pepper-hot", cal: 11, fat: 0.2, prot: 0.3, carb: 2.3, purines: 5, gi: 15, status: "safe", tip: "Low calorie and safe snack." },
    { name: "Puerro", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-wheat-awn", cal: 61, fat: 0.3, prot: 1.5, carb: 14, purines: 74, gi: 15, status: "caution", tip: "Higher carb count for a veggie." },
    { name: "Rábanos", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-circle-notch", cal: 16, fat: 0.1, prot: 0.7, carb: 3.4, purines: 15, gi: 15, status: "safe", tip: "Crisp and safe." },
    { name: "Remolacha", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-heart", cal: 43, fat: 0.2, prot: 1.6, carb: 9.6, purines: 20, gi: 64, status: "avoid", tip: "High sugar content is risky for Keto." },
    { name: "Rúcula", category: "Veggies", image: "images/foods/item_spinach.png", icon: "fa-leaf", cal: 25, fat: 0.7, prot: 2.6, carb: 3.7, purines: 20, gi: 15, status: "safe", tip: "Peppery green, completely safe." },
    { name: "Setas Shiitake", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-cloud-meatball", cal: 34, fat: 0.5, prot: 2.2, carb: 6.8, purines: 150, gi: 15, status: "caution", tip: "Mushrooms contain moderate purines." },
    { name: "Zanahoria", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-carrot", cal: 41, fat: 0.2, prot: 0.9, carb: 9.6, purines: 17, gi: 35, status: "caution", tip: "Watch carb count." },
    { name: "Papa (Cocida)", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-circle", cal: 87, fat: 0.1, prot: 1.9, carb: 20, purines: 20, gi: 78, status: "avoid", tip: "Too high in starch/carbs." },
    { name: "Maíz", category: "Veggies", image: "images/foods/maiz.jpeg", icon: "fa-wheat-awn", cal: 96, fat: 1.5, prot: 3.4, carb: 21, purines: 40, gi: 52, status: "avoid", tip: "Avoid on Keto starch limits." },
    { name: "Guisantes", category: "Veggies", image: "images/foods/item_legumes.png", icon: "fa-circle-dot", cal: 81, fat: 0.4, prot: 5.4, carb: 14, purines: 80, gi: 48, status: "avoid", tip: "High carb legume." },
    { name: "Algas Nori", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-clover", cal: 35, fat: 0.3, prot: 5.8, carb: 5, purines: 500, gi: 15, status: "avoid", tip: "DANGEROUS purge risk! Too high in purines." },
    { name: "Brotes de Soja", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-seedling", cal: 30, fat: 0.2, prot: 3, carb: 6, purines: 30, gi: 25, status: "safe", tip: "Safe crunchy veggie." },
    { name: "Palmitos", category: "Veggies", image: "images/foods/diet_detox.png", icon: "fa-tree", cal: 28, fat: 0.6, prot: 2.5, carb: 4.6, purines: 15, gi: 20, status: "safe", tip: "Low carb and safe." },
    { name: "Tomate Seco", category: "Veggies", image: "images/foods/Tomate Seco.jpeg", icon: "fa-sun", cal: 258, fat: 3, prot: 14, carb: 55, purines: 20, gi: 35, status: "avoid", tip: "Very high carb density." },

    // --- LÁCTEOS Y ALTERNATIVAS ---
    { name: "Leche Entera", category: "Dairy", image: "images/foods/cat_dairy.png", icon: "fa-cow", cal: 61, fat: 3.3, prot: 3.2, carb: 4.8, purines: 0, gi: 27, status: "caution", tip: "Purine safe, but watch the lactose (carbs) for Keto." },
    { name: "Leche de Almendras", category: "Dairy", image: "images/foods/cat_dairy.png", icon: "fa-bottle-droplet", cal: 13, fat: 1.1, prot: 0.5, carb: 0.1, purines: 0, gi: 25, status: "safe", tip: "Perfect Keto milk substitute. Gout safe." },
    { name: "Leche de Coco", category: "Dairy", image: "images/foods/cat_dairy.png", icon: "fa-bottle-water", cal: 197, fat: 21, prot: 2, carb: 2.8, purines: 0, gi: 40, status: "safe", tip: "High healthy fats, zero purines." },
    { name: "Queso Brie", category: "Dairy", image: "images/foods/Queso 1.jpeg", icon: "fa-cheese", cal: 334, fat: 28, prot: 21, carb: 0.5, purines: 8, gi: 0, status: "safe", tip: "Excellent for Keto, very low purine." },
    { name: "Queso Roquefort", category: "Dairy", image: "images/foods/Queso 2.jpeg", icon: "fa-cheese", cal: 369, fat: 31, prot: 22, carb: 2, purines: 10, gi: 0, status: "safe", tip: "Blue cheese is safe and Keto-gold." },
    { name: "Queso Feta", category: "Dairy", image: "images/foods/Queso 3.jpeg", icon: "fa-cheese", cal: 264, fat: 21, prot: 14, carb: 4, purines: 10, gi: 0, status: "safe", tip: "Safe dairy option." },
    { name: "Queso Gouda", category: "Dairy", image: "images/foods/Queso 4.jpeg", icon: "fa-cheese", cal: 356, fat: 27, prot: 25, carb: 2, purines: 10, gi: 0, status: "safe", tip: "Great high fat cheese." },
    { name: "Queso Cottage", category: "Dairy", image: "images/foods/Queso 5.jpeg", icon: "fa-cheese", cal: 98, fat: 4.3, prot: 11, carb: 3.4, purines: 8, gi: 27, status: "safe", tip: "Safe protein source." },
    { name: "Queso Mascarpone", category: "Dairy", image: "images/foods/Queso 6.jpeg", icon: "fa-cheese", cal: 455, fat: 47, prot: 3.6, carb: 4, purines: 0, gi: 0, status: "safe", tip: "High fat, zero purine." },
    { name: "Queso de Cabra", category: "Dairy", image: "images/foods/Queso 7.jpeg", icon: "fa-cheese", cal: 364, fat: 30, prot: 22, carb: 0.1, purines: 10, gi: 0, status: "safe", tip: "Very low carb, very safe." },
    { name: "Mantequilla Ghee", category: "Dairy", image: "images/foods/cat_dairy.png", icon: "fa-droplet", cal: 900, fat: 100, prot: 0, carb: 0, purines: 0, gi: 0, status: "safe", tip: "Pure fat, zero purine, infinite Keto fuel." },

    // --- FRUTAS ---
    { name: "Moras (Blackberries)", category: "Fruits", image: "images/foods/cat_fruit.png", icon: "fa-circle-nodes", cal: 43, fat: 0.5, prot: 1.4, carb: 9.6, purines: 15, gi: 25, status: "safe", tip: "The best fruit for Keto/Gout. Low carb/low purine." },
    { name: "Cerezas Frescas", category: "Fruits", image: "images/foods/cat_fruit.png", icon: "fa-heart", cal: 50, fat: 0.3, prot: 1, carb: 12, purines: 10, gi: 22, status: "caution", tip: "Helps lower uric acid, but watch the carbs." },
    { name: "Kiwi", category: "Fruits", image: "images/foods/item_tropical_fruits.png", icon: "fa-apple-whole", cal: 61, fat: 0.5, prot: 1.1, carb: 15, purines: 19, gi: 50, status: "avoid", tip: "Too high in sugar for Keto." },
    { name: "Mango", category: "Fruits", image: "images/foods/item_tropical_fruits.png", icon: "fa-sun", cal: 60, fat: 0.4, prot: 0.8, carb: 15, purines: 15, gi: 51, status: "avoid", tip: "Sugary fruit, avoid on strict diets." },
    { name: "Aceitunas Negras", category: "Fruits", image: "images/foods/diet_mediterranean.png", icon: "fa-circle-dot", cal: 115, fat: 11, prot: 0.8, carb: 6, purines: 0, gi: 15, status: "safe", tip: "Technically a fruit, safe and fatty." },
    { name: "Ruibarbo", category: "Fruits", image: "images/foods/cat_fruit.png", icon: "fa-leaf", cal: 21, fat: 0.2, prot: 0.9, carb: 4.5, purines: 10, gi: 15, status: "safe", tip: "Great low carb fruit alternative." },

    // --- FRUTOS SECOS Y SEMILLAS ---
    { name: "Avellanas", category: "Nuts", image: "images/foods/cat_nuts.png", icon: "fa-seedling", cal: 628, fat: 61, prot: 15, carb: 17, purines: 37, gi: 15, status: "safe", tip: "Keto favorable, safe purines." },
    { name: "Anacardos (Merey)", category: "Nuts", image: "images/foods/cat_nuts.png", icon: "fa-wheat-awn", cal: 553, fat: 44, prot: 18, carb: 30, purines: 50, gi: 25, status: "caution", tip: "Higher carb count for nuts." },
    { name: "Piñones", category: "Nuts", image: "images/foods/cat_nuts.png", icon: "fa-star", cal: 673, fat: 68, prot: 14, carb: 13, purines: 0, gi: 15, status: "safe", tip: "Pure fat and zero purine." },
    { name: "Semillas de Lino", category: "Nuts", image: "images/foods/cat_nuts.png", icon: "fa-dna", cal: 534, fat: 42, prot: 18, carb: 29, purines: 28, gi: 35, status: "safe", tip: "Great for fiber and safe." },
    { name: "Crema de Almendras", category: "Nuts", image: "images/foods/cat_nuts.png", icon: "fa-jar-wheat", cal: 614, fat: 56, prot: 21, carb: 19, purines: 37, gi: 15, status: "safe", tip: "Safe Keto spread." },
    { name: "Harina de Almendra", category: "Nuts", image: "images/foods/cat_nuts.png", icon: "fa-wheat-awn", cal: 571, fat: 50, prot: 21, carb: 22, purines: 37, gi: 15, status: "safe", tip: "Prime Keto baking staple." },

    // --- ORIGINAL / SPECIFIC ITEMS ---
    { name: "Salmon", category: "Seafood", image: "images/foods/item_salmon.png", icon: "fa-fish", cal: 208, fat: 13, prot: 20, carb: 0, purines: 150, gi: 0, status: "caution", tip: "Healthy Omega-3s." },
    { name: "Spinach", category: "Veggies", image: "images/foods/item_spinach.png", icon: "fa-leaf", cal: 23, fat: 0.4, prot: 2.9, carb: 1.4, purines: 57, gi: 15, status: "safe", tip: "Leafy green gold." },
    { name: "Beef Liver", category: "Meats", image: "images/foods/item_beef_liver.png", icon: "fa-cloud-meatball", cal: 175, fat: 5, prot: 27, carb: 3.8, purines: 554, gi: 0, status: "avoid", tip: "High purine danger." },
    { name: "Macadamia", category: "Nuts", image: "images/foods/item_macadamia.png", icon: "fa-seedling", cal: 718, fat: 76, prot: 8, carb: 1.5, purines: 0, gi: 10, status: "safe", tip: "Keto King." },
    { name: "Beer", category: "Drinks", image: "images/foods/item_beer.png", icon: "fa-beer-mug-empty", cal: 43, fat: 0, prot: 0.5, carb: 3.6, purines: 0, gi: 66, status: "avoid", tip: "Purine and Carb bomb." },
    { name: "Cauliflower", category: "Veggies", image: "images/foods/item_cauliflower.png", icon: "fa-tree", cal: 25, fat: 0.3, prot: 1.9, carb: 3, purines: 51, gi: 15, status: "safe", tip: "Keto staple." },
    // --- AUREUS ORIGINALS ---
    { name: "Cinnamon Roll (AUREUS Original)", category: "Originals", image: "images/foods/Rol de Canela Glaseado (Pieza Grande 300g).jpeg", icon: "fa-crown", cal: 450, fat: 12, prot: 8, carb: 42, purines: 10, gi: 70, status: "safe", tip: "Nuestro Rol de Canela especial, bajo en purinas." },
    { name: "AUREUS Burger XL", category: "Originals", image: "images/foods/Burger 2.jpeg", icon: "fa-gem", cal: 680, fat: 32, prot: 45, carb: 12, purines: 120, gi: 45, status: "caution", tip: "Versión controlada de hamburguesa, carne magra.", ingredients: [{ name: "Pan brioche artesanal", amount: "1 pieza" }, { name: "Carne de res premium", amount: "180g" }, { name: "Queso Gouda", amount: "30g" }, { name: "Cebolla caramelizada", amount: "20g" }, { name: "Lechuga y tomate", amount: "al gusto" }] },
    { name: "Ensalada AUREUS Detox", category: "Originals", image: "images/foods/diet_detox.png", icon: "fa-flask", cal: 320, fat: 15, prot: 12, carb: 18, purines: 25, gi: 20, status: "safe", tip: "Combinación ideal de hojas verdes y grasas buenas." },
    { name: "Smoothie AUREUS Power", category: "Originals", image: "images/foods/item_protein_shake.png", icon: "fa-blender", cal: 210, fat: 5, prot: 18, carb: 14, purines: 15, gi: 40, status: "safe", tip: "Batido de proteína con frutos rojos y espinaca.", ingredients: [{ name: "Proteína en polvo", amount: "30g" }, { name: "Leche de almendras", amount: "200ml" }, { name: "Frutos rojos", amount: "1/2 taza" }, { name: "Espinaca", amount: "1 puño" }, { name: "Hielo", amount: "al gusto" }] },
    { name: "Bowl AUREUS Ancestral", category: "Originals", image: "images/foods/diet_vegan_bowl.png", icon: "fa-dna", cal: 480, fat: 22, prot: 30, carb: 35, purines: 65, gi: 53, status: "safe", tip: "Base de quinoa con salmón y vegetales al vapor.", ingredients: [{ name: "Quinoa cocida", amount: "150g" }, { name: "Salmón a la plancha", amount: "120g" }, { name: "Brócoli al vapor", amount: "50g" }, { name: "Aguacate", amount: "1/4 pieza" }, { name: "Zanahoria rallada", amount: "20g" }] },
    // --- NUEVAS ADICIONES ---
    {
        name: "Ceviche de Pescado",
        category: "Seafood", image: "images/foods/cat_fish.png",
        icon: "fa-fish",
        cal: 160, fat: 3.5, prot: 27, carb: 5, purines: 110, gi: 15,
        status: "caution",
        tip: "FRESCO Y PROTEICO. Opción excelente baja en grasa. El limón 'cocina' el pescado, pero las purinas se mantienen. Evita acompañarlo con exceso de tostadas fritas o galletas saladas.",
        favourite: true,
        ingredients: [
            { name: "Pescado blanco (curado en limón)", amount: "150g" },
            { name: "Cebolla morada", amount: "50g" },
            { name: "Cilantro fresco", amount: "al gusto" },
            { name: "Jugo de limón", amount: "1/2 taza" },
            { name: "Chile habanero o serrano", amount: "al gusto" },
            { name: "Sal y pimienta", amount: "al gusto" }
        ]
    },
    {
        name: "Gorditas de Harina (Carne con Papas)",
        category: "Others", image: "images/foods/Gorditas de Harina (Carne con Papas).jpeg",
        icon: "fa-utensils",
        cal: 480, fat: 22, prot: 15, carb: 55, purines: 90, gi: 75,
        status: "avoid",
        tip: "ALTO EN CARBOHIDRATOS Y GRASAS. La combinación de harina de trigo y papa eleva mucho el índice glucémico. La carne de res aporta purinas. Si las consumes, limita a una pieza pequeña.",
        favourite: true,
        ingredients: [
            { name: "Harina de trigo (gordita)", amount: "2 piezas" },
            { name: "Carne de res molida", amount: "80g" },
            { name: "Papas cocidas en cubos", amount: "50g" },
            { name: "Cebolla y ajo", amount: "al gusto" },
            { name: "Salsa roja", amount: "al gusto" },
            { name: "Aceite vegetal", amount: "1 cda" }
        ]
    },
    {
        name: "Galletas Polvorones",
        category: "Others", image: "images/foods/cat_nuts.png",
        icon: "fa-cookie",
        cal: 510, fat: 24, prot: 5, carb: 65, purines: 15, gi: 85,
        status: "avoid",
        tip: "EXCESO DE AZÚCAR Y GRASAS TRANS. Aunque tienen pocas purinas directas, el azúcar refinado eleva el ácido úrico. Son detonantes de inflamación. Evitar en dietas Keto.",
        favourite: true,
        ingredients: [
            { name: "Harina de trigo", amount: "200g" },
            { name: "Manteca vegetal o mantequilla", amount: "100g" },
            { name: "Azúcar glass", amount: "80g" },
            { name: "Extracto de naranja o canela", amount: "1 cdita" }
        ]
    },
    {
        name: "Doritos Nacho (Bolsa 60g)",
        category: "Others", image: "images/foods/Doritos Nacho (Bolsa 60g).jpeg",
        icon: "fa-leaf",
        cal: 300, fat: 15, prot: 4, carb: 34, purines: 30, gi: 72,
        status: "avoid",
        tip: "SNACK PROCESADO. Alto contenido de sodio y glutamato monosódico que puede afectar la eliminación de ácido úrico. No apto para Keto por el maíz y almidones.",
        favourite: true,
        ingredients: [
            { name: "Maíz nixtamalizado", amount: "45g" },
            { name: "Aceite vegetal", amount: "12g" },
            { name: "Condimento (quesos y especias)", amount: "3g" },
            { name: "Sodio", amount: "380mg" }
        ]
    },
    {
        name: "Relleno Negro Yucateco (Pavo y Albóndigas)",
        category: "Poultry", image: "images/foods/Relleno Negro.jpeg",
        icon: "fa-drumstick-bite",
        cal: 725, fat: 35, prot: 43, carb: 6, purines: 150, gi: 15,
        status: "caution",
        tip: "PLATILLO TRADICIONAL COMPLEJO. El pavo es seguro, pero las albóndigas (but) suelen llevar cerdo y huevo. El recado negro (chiles quemados) no aporta purinas, pero el conjunto es pesado. Moderación.",
        favourite: true,
        ingredients: [
            { name: "Carne de pavo", amount: "150g" },
            { name: "Carne de cerdo (albóndigas)", amount: "100g" },
            { name: "Recado negro (chilmole)", amount: "50g" },
            { name: "Huevo cocido", amount: "1 pieza" },
            { name: "Epazote y especias", amount: "al gusto" }
        ]
    },
    {
        name: "Espagueti a la Boloñesa",
        category: "Others", image: "images/foods/Albóndigas con Espagueti.jpg",
        icon: "fa-utensils",
        cal: 550, fat: 18, prot: 22, carb: 45, purines: 85, gi: 55,
        status: "caution",
        tip: "CUIDADO CON LA CARNE Y PASTA. La pasta aporta muchos carbohidratos. La carne molida de res tiene purinas moderadas. Intenta usar pasta integral o de calabacín para una versión más segura.",
        favourite: true,
        ingredients: [
            { name: "Pasta espagueti", amount: "100g" },
            { name: "Carne molida de res", amount: "120g" },
            { name: "Salsa de tomate casera", amount: "150ml" },
            { name: "Queso parmesano", amount: "15g" },
            { name: "Cebolla, zanahoria y apio", amount: "50g" }
        ]
    },
    {
        name: "Pescado Empapelado al Aluminio",
        category: "Seafood", image: "images/foods/Pescado Empapelado al Aluminio.jpeg",
        icon: "fa-fish",
        cal: 210, fat: 8, prot: 25, carb: 10, purines: 100, gi: 10,
        status: "safe",
        tip: "TÉCNICA SALUDABLE. Al cocerse en su propio jugo con vegetales, conserva nutrientes y no suma grasas innecesarias. Es de las mejores formas de comer pescado para control de ácido úrico.",
        favourite: true,
        ingredients: [
            { name: "Filete de pescado blanco", amount: "150g" },
            { name: "Calabacita y zanahoria", amount: "100g" },
            { name: "Jitomate y cebolla", amount: "50g" },
            { name: "Aceite de oliva", amount: "1 cdita" },
            { name: "Especias (laurel, pimienta)", amount: "al gusto" }
        ]
    },
    {
        name: "Alitas con Papas Fritas",
        category: "Poultry", image: "images/foods/Alitas Buffalo Premium.png",
        icon: "fa-drumstick-bite",
        cal: 650, fat: 40, prot: 45, carb: 25, purines: 110, gi: 50,
        status: "caution",
        tip: "VERSION PREMIUM. Alitas horneadas con salsa buffalo y papas fritas. La combinación eleva las calorías y grasas. Evita comer la piel si estás en crisis.",
        favourite: true,
        ingredients: [
            { name: "Alitas de pollo", amount: "250g" },
            { name: "Salsa Buffalo (sin azúcar)", amount: "50ml" },
            { name: "Papas Fritas", amount: "100g" },
            { name: "Especias", amount: "al gusto" },
            { name: "Bastones de apio", amount: "50g" }
        ]
    },
    {
        name: "Tacos al Pastor Premium",
        category: "Fast Food", image: "images/foods/Tacos al Pastor Premium.png",
        icon: "fa-utensils",
        cal: 450, fat: 18, prot: 32, carb: 42, purines: 150, gi: 52,
        status: "avoid",
        tip: "TENTACIÓN TRADICIONAL. El cerdo marinado y la piña son deliciosos, pero las purinas y el azúcar de la piña pueden elevar el ácido úrico. Limita a 2 o 3 piezas y evita el alcohol.",
        favourite: true,
        ingredients: [
            { name: "Carne de cerdo marinada", amount: "120g" },
            { name: "Tortillas de maíz", amount: "3 piezas" },
            { name: "Piña", amount: "30g" },
            { name: "Cebolla y cilantro", amount: "al gusto" },
            { name: "Salsa roja", amount: "al gusto" }
        ]
    },
    {
        name: "Elotes y Esquites Premium",
        category: "Others", image: "images/foods/Elotes y Esquites Premium.png",
        icon: "fa-wheat-awn",
        cal: 320, fat: 22, prot: 6, carb: 35, purines: 40, gi: 65,
        status: "caution",
        tip: "SNACK MEXICANO. El maíz es seguro en purinas, pero alto en carbohidratos. El exceso de mayonesa y queso añade grasas. Disfrútalo preferentemente sin mucha crema.",
        favourite: true,
        ingredients: [
            { name: "Granos de elote cocidos", amount: "150g" },
            { name: "Mayonesa", amount: "2 cdas" },
            { name: "Queso Cotija", amount: "20g" },
            { name: "Chile en polvo", amount: "al gusto" },
            { name: "Limón", amount: "1 pieza" }
        ]
    },
    {
        name: "Aguachile Verde Premium",
        category: "Seafood", image: "images/foods/Aguachile Verde Premium.png",
        icon: "fa-shrimp",
        cal: 180, fat: 4, prot: 32, carb: 6, purines: 160, gi: 15,
        status: "caution",
        tip: "FRESCO Y PICANTE. El camarón es de purinas moderadas/altas. El pepino y el limón ayudan, pero no abuses de la porción. Ideal para una comida ligera sin carbohidratos.",
        favourite: true,
        ingredients: [
            { name: "Camarón limpio", amount: "180g" },
            { name: "Jugo de limón", amount: "100ml" },
            { name: "Chile serrano", amount: "2 piezas" },
            { name: "Pepino", amount: "1 pieza" },
            { name: "Cebolla morada", amount: "1/4 pieza" },
            { name: "Cilantro", amount: "al gusto" }
        ]
    },
    {
        name: "Sopa de Tortilla Premium",
        category: "Others", image: "images/foods/Sopa de Tortilla Premium.png",
        icon: "fa-bowl-rice",
        cal: 380, fat: 24, prot: 12, carb: 32, purines: 45, gi: 45,
        status: "safe",
        tip: "CONFORT MEXICANO. Una base de tomate y especias. Las tiras de tortilla aportan carbohidratos. El aguacate añade grasas saludables. Muy segura si el caldo es vegetal o de pollo ligero.",
        favourite: true,
        ingredients: [
            { name: "Tiras de tortilla fritas", amount: "50g" },
            { name: "Caldo de tomate", amount: "300ml" },
            { name: "Aguacate", amount: "1/2 pieza" },
            { name: "Queso panela", amount: "30g" },
            { name: "Crema", amount: "1 cda" },
            { name: "Chile pasilla", amount: "1/2 pieza" }
        ]
    }
];

// Add Batch 2 Favorites (2026-01-19)
foodDatabase.push(
    {
        name: "Lasaña Italiana Premium",
        category: "Meats", image: "images/foods/Lasana Italiana Premium.png",
        icon: "fa-layer-group",
        cal: 160, fat: 9, prot: 8, carb: 12, purines: 40, gi: 55,
        status: "safe",
        tip: "DELICIA ITALIANA. Preparada con boloñesa casera y quesos de calidad. Porción moderada es segura para ácido úrico. Evita salsas industriales.",
        favourite: true,
        ingredients: [
            { name: "Pasta para lasaña", amount: "1 lámina" },
            { name: "Carne molida (res/cerdo)", amount: "40g" },
            { name: "Salsa de tomate casera", amount: "50g" },
            { name: "Queso Mozzarella", amount: "30g" },
            { name: "Queso Parmesano", amount: "10g" }
        ]
    },
    {
        name: "Focaccia de Cebolla y Aceitunas",
        category: "Others", image: "images/foods/Focaccia de Cebolla y Aceitunas.png",
        icon: "fa-bread-slice",
        cal: 250, fat: 10, prot: 6, carb: 35, purines: 20, gi: 70,
        status: "safe",
        tip: "PAN ARTESANAL. Rico en carbohidratos pero bajo en purinas. El aceite de oliva es antiinflamatorio. Disfruta con moderación por el índice glucémico.",
        favourite: true,
        ingredients: [
            { name: "Harina de trigo", amount: "60g" },
            { name: "Aceite de Oliva Extra Virgen", amount: "15ml" },
            { name: "Cebolla caramelizada", amount: "30g" },
            { name: "Aceitunas negras", amount: "20g" },
            { name: "Romero fresco", amount: "al gusto" }
        ]
    },
    {
        name: "Relleno Negro Premium",
        category: "Poultry", image: "images/foods/Relleno Negro Premium.png",
        icon: "fa-bowl-food",
        cal: 140, fat: 5, prot: 18, carb: 6, purines: 90, gi: 20,
        status: "caution",
        tip: "TRADICIÓN YUCATECA. El pavo es moderado en purinas. El recado negro es especiado pero bajo en grasa. Cuidado con el huevo si tienes sensibilidad.",
        favourite: true,
        ingredients: [
            { name: "Pavo deshebrado", amount: "80g" },
            { name: "Recado negro", amount: "20g" },
            { name: "Huevo cocido", amount: "1 pieza" },
            { name: "Caldo de pavo", amount: "100ml" },
            { name: "Tortilla hecha a mano", amount: "1 pieza" }
        ]
    },
    {
        name: "Discada Norteña Premium",
        category: "Meats", image: "images/foods/Discada Norteña Premium.png",
        icon: "fa-drumstick-bite",
        cal: 280, fat: 20, prot: 22, carb: 4, purines: 180, gi: 15,
        status: "avoid",
        tip: "FIESTA DE CARNES.  Alta en purinas por la mezcla de carnes rojas y embutidos. Deliciosa pero consúmela esporádicamente y bebe mucha agua.",
        favourite: true,
        ingredients: [
            { name: "Carne de res picada", amount: "50g" },
            { name: "Carne de cerdo picada", amount: "50g" },
            { name: "Chorizo", amount: "20g" },
            { name: "Salchicha", amount: "20g" },
            { name: "Pimiento morrón y cebolla", amount: "50g" }
        ]
    },
    {
        name: "Asado de Boda Premium",
        category: "Meats", image: "images/foods/Asado de Boda Premium.png",
        icon: "fa-pepper-hot",
        cal: 220, fat: 15, prot: 16, carb: 8, purines: 110, gi: 45,
        status: "caution",
        tip: "SABOR DE ZACATECAS. Estofado de cerdo con chiles secos y un toque dulce. El cerdo requiere moderación. La salsa es rica en antioxidantes pero puede irritar.",
        favourite: true,
        ingredients: [
            { name: "Carne de cerdo troceada", amount: "100g" },
            { name: "Chile ancho y guajillo", amount: "2 piezas" },
            { name: "Chocolate de mesa (toque)", amount: "5g" },
            { name: "Jugo de naranja", amount: "20ml" },
            { name: "Arroz rojo (guarnición)", amount: "50g" }
        ]
    }
    ,
    {
        name: "Carne Asada con Chorizo Premium",
        category: "Meats", image: "images/foods/Carne Asada con Chorizo.png",
        icon: "fa-fire",
        cal: 650, fat: 45, prot: 40, carb: 15, purines: 200, gi: 50,
        status: "avoid",
        tip: "ALTO RIESGO. La carne roja a la parrilla y el chorizo argentino son bombas de purinas. Disfruta con moderación y evita el alcohol acompañante.",
        favourite: true,
        ingredients: [
            { name: "Arrachera marinada", amount: "150g" },
            { name: "Chorizo argentino", amount: "1 pieza" },
            { name: "Tortillas de maíz", amount: "3 piezas" },
            { name: "Guacamole", amount: "2 cdas" },
            { name: "Cebollitas asadas", amount: "2 piezas" }
        ]
    },
    {
        name: "Nachos con Queso y Frijoles",
        category: "Fast Food", image: "images/foods/Nachos con Queso.png",
        icon: "fa-cheese",
        cal: 580, fat: 32, prot: 14, carb: 55, purines: 60, gi: 75,
        status: "avoid",
        tip: "PROCESADO Y SAL. El queso amarillo procesado y los totopos fritos no son ideales. Los frijoles son seguros, pero el conjunto es inflamatorio. Mejor hazlos caseros.",
        favourite: true,
        ingredients: [
            { name: "Totopos de maíz", amount: "100g" },
            { name: "Queso amarillo fundido", amount: "80g" },
            { name: "Frijoles refritos", amount: "80g" },
            { name: "Jalapeños en vinagre", amount: "20g" },
            { name: "Pico de gallo", amount: "al gusto" }
        ]
    },
    {
        name: "Molletes con Jamón y Queso",
        category: "Others", image: "images/foods/Molletes con Jamon.png",
        icon: "fa-bread-slice",
        cal: 420, fat: 18, prot: 20, carb: 45, purines: 45, gi: 65,
        status: "caution",
        tip: "DESAYUNO CLÁSICO. El bolillo es harina refinada y el jamón procesado tiene sodio. Usa queso panela y pico de gallo para hacerlo más saludable.",
        favourite: true,
        ingredients: [
            { name: "Bolillo (mitades)", amount: "2 piezas" },
            { name: "Frijoles refritos", amount: "4 cdas" },
            { name: "Queso manchego", amount: "40g" },
            { name: "Jamón de pavo", amount: "2 rebanadas" },
            { name: "Pico de gallo", amount: "al gusto" }
        ]
    },
    {
        name: "Hot Dog con Tocino Premium",
        category: "Fast Food", image: "images/foods/Hot Dog con Tocino.png",
        icon: "fa-hotdog",
        cal: 480, fat: 35, prot: 16, carb: 28, purines: 90, gi: 70,
        status: "avoid",
        tip: "DOBLE RIESGO. Salchicha y tocino son embutidos altos en sodio y purinas. El pan blanco suma carga glucémica. Consumo muy ocasional.",
        favourite: true,
        ingredients: [
            { name: "Salchicha de pavo/res", amount: "1 pieza" },
            { name: "Tocino ahumado", amount: "2 tiras" },
            { name: "Pan de hot dog", amount: "1 pieza" },
            { name: "Mayonesa y mostaza", amount: "1 cda" },
            { name: "Cebolla y tomate", amount: "al gusto" }
        ]
    },
    {
        name: "Hot Cakes Premium",
        category: "Others", image: "images/foods/Hot Cakes Premium.png",
        icon: "fa-utensils",
        cal: 350, fat: 12, prot: 6, carb: 55, purines: 10, gi: 68,
        status: "safe",
        tip: "DULCE TENTACIÓN. Bajos en purinas, pero cuidado con el jarabe de maíz (fructosa pura). Usa miel natural o frutas para acompañar.",
        favourite: true,
        ingredients: [
            { name: "Hot Cakes esponjosos", amount: "2 piezas" },
            { name: "Mantequilla", amount: "10g" },
            { name: "Miel de maple", amount: "30ml" },
            { name: "Frutos rojos (opcional)", amount: "20g" }
        ]
    },
    {
        name: "Ramen de Pollo Premium",
        category: "Soup", image: "images/foods/Ramen de Pollo Premium.png",
        icon: "fa-bowl-food",
        cal: 500, fat: 20, prot: 25, carb: 55, purines: 150, gi: 50,
        status: "safe",
        tip: "RICO Y RECONFORTANTE. El caldo de pollo es nutritivo. Disfruta con moderación por el sodio.",
        favourite: true,
        ingredients: [
            { name: "Fideos ramen", amount: "100g" },
            { name: "Pechuga de pollo", amount: "80g" },
            { name: "Huevo cocido", amount: "1/2 pieza" },
            { name: "Cebollín", amount: "10g" },
            { name: "Alga nori", amount: "1 hoja" }
        ]
    },
    {
        name: "Tostadas de Atún Premium",
        category: "Seafood", image: "images/foods/Tostadas de Atun Premium.png",
        icon: "fa-fish",
        cal: 350, fat: 15, prot: 25, carb: 30, purines: 150, gi: 45,
        status: "safe",
        tip: "FRESCO Y LIGERO. Excelente fuente de proteína y omega-3. Una opción muy saludable.",
        favourite: true,
        ingredients: [
            { name: "Tostadas de maíz", amount: "2 piezas" },
            { name: "Atún fresco", amount: "100g" },
            { name: "Aguacate", amount: "30g" },
            { name: "Jitomate", amount: "20g" },
            { name: "Lechuga", amount: "20g" }
        ]
    },
    {
        name: "Frijoles Charros Premium",
        category: "Mexican", image: "images/foods/Frijoles Charros Premium.png",
        icon: "fa-bowl-rice",
        cal: 300, fat: 12, prot: 15, carb: 35, purines: 100, gi: 35,
        status: "caution",
        tip: "SABOR TRADICIONAL. Los frijoles son saludables, pero los embutidos añaden grasa. Modera la porción.",
        favourite: true,
        ingredients: [
            { name: "Frijoles bayos", amount: "200g" },
            { name: "Chorizo", amount: "20g" },
            { name: "Tocino", amount: "1 rebanada" },
            { name: "Jamón", amount: "20g" },
            { name: "Cilantro", amount: "al gusto" }
        ]
    },
    {
        name: "Espagueti con Mejillones Premium",
        category: "Pasta", image: "images/foods/Espagueti con Mejillones Premium.png",
        icon: "fa-shrimp", // Using shrimp icon for seafood pasta
        cal: 450, fat: 10, prot: 20, carb: 70, purines: 120, gi: 55,
        status: "safe",
        tip: "DELICIA DEL MAR. Rica en proteína y carbohidratos complejos. Los mejillones son nutritivos.",
        favourite: true,
        ingredients: [
            { name: "Espagueti", amount: "120g" },
            { name: "Mejillones", amount: "100g" },
            { name: "Ajo", amount: "2 dientes" },
            { name: "Aceite de oliva", amount: "1 cda" },
            { name: "Perejil", amount: "al gusto" }
        ]
    },
    {
        name: "Tacos de Camarón Ensenada Premium",
        category: "Tacos", image: "images/foods/Tacos de Camaron Ensenada Premium.png",
        icon: "fa-shrimp",
        cal: 400, fat: 22, prot: 18, carb: 35, purines: 150, gi: 50,
        status: "caution",
        tip: "ESTILO BAJA. El capeado añade calorías extra. Disfruta ocasionalmente como un gusto.",
        favourite: true,
        ingredients: [
            { name: "Tortilla de maíz", amount: "2 piezas" },
            { name: "Camarones capeados", amount: "100g" },
            { name: "Col rallada", amount: "30g" },
            { name: "Pico de gallo", amount: "20g" },
            { name: "Aderezo cremoso", amount: "1 cda" }
        ]
    }
);
