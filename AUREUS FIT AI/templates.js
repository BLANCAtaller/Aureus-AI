const SYSTEM_TEMPLATES = [
    // --- 1. 🔥 Pérdida de Peso (Keto) ---
    {
        id: "keto_base",
        name: "🔥 Pérdida de Peso (Keto)",
        desc: "Alto en grasas saludables, muy bajo en carbos.",
        planData: {
            mon: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }, { name: "Aguacate (Medio)" }], lunch: [{ name: "Carne Asada con Chorizo Premium" }], dinner: [{ name: "Gelatina (Sin sabor)" }, { name: "Nueces de la India" }] },
            tue: { breakfast: [{ name: "Queso de Cabra" }], lunch: [{ name: "Salmón a la Plancha (150g)" }, { name: "Espinaca" }], dinner: [{ name: "Chicharrón de Cerdo" }] },
            wed: { breakfast: [{ name: "Cafe Americano (Taza 250ml)" }, { name: "Mantequilla Ghee" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Aguachile Verde Premium" }], dinner: [{ name: "Atún Fresco (Medallón 150g)" }] },
            thu: { breakfast: [{ name: "Huevos Revueltos con Tocino" }], lunch: [{ name: "Costillas de Cerdo (220g)" }], dinner: [{ name: "Ceviche de Pescado" }] },
            fri: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Macadamia" }], lunch: [{ name: "Discada Norteña Premium" }], dinner: [{ name: "Sardinas en Tomate (Lata)" }] },
            sat: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Pato (Con piel)" }], dinner: [{ name: "Vino Tinto (Copa 150ml)" }] },
            sun: { breakfast: [{ name: "Queso Brie" }], lunch: [{ name: "Barbacoa (Tacos)" }], dinner: [{ name: "Aceitunas Negras" }] }
        }
    },
    {
        id: "keto_1",
        name: "🔥 Pérdida de Peso (Keto) - 1",
        desc: "Alto en grasas saludables, enfoque en quesos y carnes.",
        planData: {
            mon: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Salmón a la Plancha (150g)" }, { name: "Ensalada AUREUS Detox" }], dinner: [{ name: "Aguachile Verde Premium" }] },
            tue: { breakfast: [{ name: "Queso Brie" }, { name: "Jamón Ibérico (Bellota)" }], lunch: [{ name: "Pescado Empapelado al Aluminio" }], dinner: [{ name: "Alitas con Papas Fritas" }] },
            wed: { breakfast: [{ name: "Café Americano (Taza 250ml)" }, { name: "Mantequilla Ghee" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Queso Mascarpone" }], dinner: [{ name: "Ceviche de Pescado" }] },
            thu: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Costillas de Cerdo (220g)" }], dinner: [{ name: "Atún Fresco (Medallón 150g)" }] },
            fri: { breakfast: [{ name: "Queso Gouda" }, { name: "Avellanas" }], lunch: [{ name: "Carne Asada con Chorizo Premium" }], dinner: [{ name: "Gelatina (Sin sabor)" }] },
            sat: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Macadamia" }], lunch: [{ name: "Discada Norteña Premium" }], dinner: [{ name: "Sardinas en Tomate (Lata)" }] },
            sun: { breakfast: [{ name: "Café Americano (Taza 250ml)" }], lunch: [{ name: "Pato (Con piel)" }], dinner: [{ name: "Vino Tinto (Copa 150ml)" }] }
        }
    },
    {
        id: "keto_2",
        name: "🔥 Pérdida de Peso (Keto) - 2",
        desc: "Bajo en carbos, rico en pescados y mariscos.",
        planData: {
            mon: { breakfast: [{ name: "Queso de Cabra" }], lunch: [{ name: "Camarones a la Diabla (200g)" }], dinner: [{ name: "Atún Fresco (Medallón 150g)" }] },
            tue: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Asado de Boda Premium" }], dinner: [{ name: "Ceviche de Pescado" }] },
            wed: { breakfast: [{ name: "Chucrut" }, { name: "Salami" }], lunch: [{ name: "Hígado Encebollado (150g)" }], dinner: [{ name: "Ensalada AUREUS Detox" }] },
            thu: { breakfast: [{ name: "Queso Roquefort" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }], dinner: [{ name: "Aguachile Verde Premium" }] },
            fri: { breakfast: [{ name: "Café Americano (Taza 250ml)" }, { name: "Crema de Almendras" }], lunch: [{ name: "Salmón a la Plancha (150g)" }], dinner: [{ name: "Gelatina (Sin sabor)" }] },
            sat: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Discada Norteña Premium" }], dinner: [{ name: "Vino Tinto (Copa 150ml)" }] },
            sun: { breakfast: [{ name: "Queso Cottage" }], lunch: [{ name: "Pescado Empapelado al Aluminio" }], dinner: [{ name: "Aceitunas Negras" }] }
        }
    },
    {
        id: "keto_3",
        name: "🔥 Pérdida de Peso (Keto) - 3",
        desc: "Keto carnívoro: Cortes de carne y grasas animales.",
        planData: {
            mon: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Pavo (Muslo)" }], dinner: [{ name: "Ensalada AUREUS Detox" }] },
            tue: { breakfast: [{ name: "Queso Feta" }, { name: "Piñones" }], lunch: [{ name: "Discada Norteña Premium" }], dinner: [{ name: "Gelatina (Sin sabor)" }] },
            wed: { breakfast: [{ name: "Café Americano (Taza 250ml)" }], lunch: [{ name: "Cordero (Chuleta)" }], dinner: [{ name: "Aguachile Verde Premium" }] },
            thu: { breakfast: [{ name: "Jamón Ibérico (Bellota)" }], lunch: [{ name: "Salmón a la Plancha (150g)" }], dinner: [{ name: "Espinaca" }] },
            fri: { breakfast: [{ name: "Queso Mascarpone" }], lunch: [{ name: "Carne Asada con Chorizo Premium" }], dinner: [{ name: "Ceviche de Pescado" }] },
            sat: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Pato (Con piel)" }], dinner: [{ name: "Tequila (Caballito 45ml)" }] },
            sun: { breakfast: [{ name: "Leche de Coco" }], lunch: [{ name: "Costillas de Cerdo (220g)" }], dinner: [{ name: "Aceitunas Negras" }] }
        }
    },

    // --- 2. 🥗 Pérdida de Peso (Balanceada) ---
    {
        id: "balance_base",
        name: "🥗 Pérdida de Peso (Balanceada)",
        desc: "Déficit calórico controlado, equilibrado en macros.",
        planData: {
            mon: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Granola" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Arroz Integral" }], dinner: [{ name: "Tostadas de Atún Premium" }] },
            tue: { breakfast: [{ name: "Huevo con Toast de Aguacate" }], lunch: [{ name: "Ensalada César (Plato)" }, { name: "Atún en Agua" }], dinner: [{ name: "Sopa de Verduras" }], snack: [{ name: "Manzana" }] },
            wed: { breakfast: [{ name: "Avena Cocida" }], lunch: [{ name: "Bowl AUREUS Ancestral" }], dinner: [{ name: "Pescado Empapelado al Aluminio" }] },
            thu: { breakfast: [{ name: "Licuado de Fresa y Plátano" }], lunch: [{ name: "Tacos de Pollo Suaves" }], dinner: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }] },
            fri: { breakfast: [{ name: "Molletes con Jamón y Queso" }], lunch: [{ name: "Ceviche de Pescado" }], dinner: [{ name: "Ensalada Caprese" }], snack: [{ name: "Almendras" }] },
            sat: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Pasta con Camarones" }], dinner: [{ name: "Aguachile Verde Premium" }] },
            sun: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Frijoles Charros Premium" }], dinner: [{ name: "Merluza" }] }
        }
    },
    {
        id: "balance_1",
        name: "🥗 Pérdida de Peso (Balanceada) - 1",
        desc: "Equilibrio macro con porciones controladas.",
        planData: {
            mon: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Moras (Blackberries)" }], lunch: [{ name: "Ensalada AUREUS Detox" }, { name: "Pechuga de Pollo Asada (150g)" }], dinner: [{ name: "Tostadas de Atún Premium" }] },
            tue: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Sopa de Tortilla Premium" }], dinner: [{ name: "Pescado Empapelado al Aluminio" }] },
            wed: { breakfast: [{ name: "Molletes con Jamón y Queso" }], lunch: [{ name: "Bowl AUREUS Ancestral" }], dinner: [{ name: "Lentejas (Sopa 1 Taza)" }] },
            thu: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Relleno Negro Premium" }], dinner: [{ name: "Salmón a la Plancha (150g)" }] },
            fri: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Papaya Picada (1 Taza)" }], lunch: [{ name: "Ceviche de Pescado" }], dinner: [{ name: "Ensalada César (Plato)" }, { name: "Pechuga de Pollo Asada (150g)" }] },
            sat: { breakfast: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }], lunch: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }], dinner: [{ name: "Aguachile Verde Premium" }] },
            sun: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Frijoles Charros Premium" }], dinner: [{ name: "Merluza" }] }
        }
    },
    {
        id: "balance_2",
        name: "🥗 Pérdida de Peso (Balanceada) - 2",
        desc: "Menú mediterráneo: pescado y vegetales.",
        planData: {
            mon: { breakfast: [{ name: "Focaccia de Cebolla y Aceitunas" }], lunch: [{ name: "Pasta con Mejillones (350g)" }], dinner: [{ name: "Ensalada AUREUS Detox" }] },
            tue: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Salmón a la Plancha (150g)" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Crema de Almendras" }] },
            wed: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Cerezas (1 Taza)" }], lunch: [{ name: "Pollo (Alitas con piel)" }, { name: "Ensalada César (Plato)" }], dinner: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }] },
            thu: { breakfast: [{ name: "Jugo de Naranja (Natural 250ml)" }], lunch: [{ name: "Lentejas (Sopa 1 Taza)" }], dinner: [{ name: "Atún Fresco (Medallón 150g)" }] },
            fri: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Tacos de Camarón Ensenada Premium" }], dinner: [{ name: "Ceviche de Pescado" }] },
            sat: { breakfast: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }], lunch: [{ name: "Lasaña Italiana Premium" }], dinner: [{ name: "Pescado Empapelado al Aluminio" }] },
            sun: { breakfast: [{ name: "Papaya Picada (1 Taza)" }], lunch: [{ name: "Bacalao (Fresco)" }], dinner: [{ name: "Smoothie AUREUS Power" }] }
        }
    },
    {
        id: "balance_3",
        name: "🥗 Pérdida de Peso (Balanceada) - 3",
        desc: "Vegetariano flexible (Flexitariano).",
        planData: {
            mon: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Ensalada AUREUS Detox" }, { name: "Frijoles de la Olla (1 Taza)" }], dinner: [{ name: "Tostadas de Atún Premium" }] },
            tue: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Lentejas (Sopa 1 Taza)" }], dinner: [{ name: "Sopa de Tortilla Premium" }] },
            wed: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }], dinner: [{ name: "Ensalada AUREUS Detox" }] },
            thu: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Papaya Picada (1 Taza)" }], lunch: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }], dinner: [{ name: "Calabaza" }] },
            fri: { breakfast: [{ name: "Molletes con Jamón y Queso" }], lunch: [{ name: "Ceviche de Pescado" }], dinner: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }] },
            sat: { breakfast: [{ name: "Frijoles Charros Premium" }], lunch: [{ name: "Pasta con Mejillones (350g)" }], dinner: [{ name: "Ensalada César (Plato)" }] },
            sun: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Pozole Rojo de Cerdo (Plato)" }], dinner: [{ name: "Leche de Almendras" }] }
        }
    },

    // --- 3. ⚖️ Mantenimiento (Actual) ---
    {
        id: "maint_base",
        name: "⚖️ Mantenimiento (Actual)",
        desc: "Balance ideal para mantener tu peso y salud.",
        planData: {
            mon: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Milanesa de Pollo con Ensalada" }], dinner: [{ name: "Quesadillas Ligeras" }], snack: [{ name: "Jicaleta" }] },
            tue: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Albóndigas con Arroz" }], dinner: [{ name: "Sándwich de Pavo" }] },
            wed: { breakfast: [{ name: "Licuado de Plátano y Avena" }], lunch: [{ name: "Tacos Dorados de Pollo (3)" }], dinner: [{ name: "Pan Dulce (1 pieza)" }, { name: "Leche" }] },
            thu: { breakfast: [{ name: "Huevos Motuleños" }], lunch: [{ name: "Carne en su Jugo" }], dinner: [{ name: "Tostadas de Tinga (2)" }] },
            fri: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Pizza de Pepperoni (2 Rebanadas)" }], dinner: [{ name: "Sushi (California Roll)" }] },
            sat: { breakfast: [{ name: "Barbacoa (Tacos)" }], lunch: [{ name: "Hamburguesa Casera" }], dinner: [{ name: "Hot Dog (Sencillo)" }] },
            sun: { breakfast: [{ name: "Menudo / Pancita (Plato Grande)" }], lunch: [{ name: "Pollo Rostizado (Comprado)" }], dinner: [{ name: "Cereal con Leche y Fruta (Tazón)" }] }
        }
    },
    {
        id: "maint_1",
        name: "⚖️ Mantenimiento (Actual) - 1",
        desc: "Comidas caseras tradicionales equilibradas.",
        planData: {
            mon: { breakfast: [{ name: "Molletes con Jamón y Queso" }], lunch: [{ name: "Espagueti a la Boloñesa" }], dinner: [{ name: "Tostadas de Atún Premium" }] },
            tue: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Albóndigas con Espagueti" }], dinner: [{ name: "Cereal con Leche y Fruta (Tazón)" }] },
            wed: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Hot Dog (Sencillo)" }] },
            thu: { breakfast: [{ name: "Tacos de Carnitas (Orden de 3)" }], lunch: [{ name: "Ensalada César (Plato)" }], dinner: [{ name: "Café Americano (Taza 250ml)" }, { name: "Rol de Canela Glaseado (Pieza Grande 300g)" }] },
            fri: { breakfast: [{ name: "Molletes con Jamón y Queso" }], lunch: [{ name: "Tacos al Pastor Premium" }], dinner: [{ name: "Pizza de Pepperoni (2 Rebanadas)" }] },
            sat: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Hamburguesa Don Doblecarne" }], dinner: [{ name: "Tacos de Carnitas (Orden de 3)" }] },
            sun: { breakfast: [{ name: "Menudo / Pancita (Plato Grande)" }], lunch: [{ name: "Carnitas (Tacos)" }], dinner: [{ name: "Gelatina (Sin sabor)" }] }
        }
    },
    {
        id: "maint_2",
        name: "⚖️ Mantenimiento (Actual) - 2",
        desc: "Dieta variada con un toque internacional.",
        planData: {
            mon: { breakfast: [{ name: "Rol de Canela Glaseado (Pieza Grande 300g)" }], lunch: [{ name: "Ramen de Pollo Premium" }], dinner: [{ name: "Queso Brie" }, { name: "Galletas Polvorones" }], drinks: [{ name: "Agua de Jamaica (Sin Azúcar / 1 Vaso)" }] },
            tue: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Sushi (Rollo Empanizado)" }], dinner: [{ name: "Ramen de Pollo Premium" }] },
            wed: { breakfast: [{ name: "Hot Cakes (Orden de 2 pzas)" }], lunch: [{ name: "Espagueti a la Boloñesa" }], dinner: [{ name: "Ensalada César (Plato)" }] },
            thu: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Relleno Negro Premium" }], dinner: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }] },
            fri: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Tacos al Pastor Premium" }], dinner: [{ name: "Nachos con Queso y Frijoles" }] },
            sat: { breakfast: [{ name: "Focaccia de Cebolla y Aceitunas" }], lunch: [{ name: "Tacos de Carnitas (Orden de 3)" }], dinner: [{ name: "Alitas con Papas Fritas" }] },
            sun: { breakfast: [{ name: "Menudo / Pancita (Plato Grande)" }], lunch: [{ name: "Espagueti con Mejillones Premium" }], dinner: [{ name: "Gelatina (Sin sabor)" }] }
        }
    },
    {
        id: "maint_3",
        name: "⚖️ Mantenimiento (Actual) - 3",
        desc: "Práctico para personas con poco tiempo.",
        planData: {
            mon: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Moras (Blackberries)" }], lunch: [{ name: "Tostadas de Atún Premium" }], dinner: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }] },
            tue: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Hot Dog (Sencillo)" }], dinner: [{ name: "Ramen de Pollo Premium" }] },
            wed: { breakfast: [{ name: "Café Americano (Taza 250ml)" }, { name: "Rol de Canela Glaseado (Pieza Grande 300g)" }], lunch: [{ name: "Gorditas de Harina (Carne con Papas)" }], dinner: [{ name: "Molletes con Jamón y Queso" }], drinks: [{ name: "Refresco de Cola (600ml)" }] },
            thu: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }] },
            fri: { breakfast: [{ name: "Tacos de Carnitas (Orden de 3)" }], lunch: [{ name: "Elotes y Esquites Premium" }], dinner: [{ name: "Pizza de Pepperoni (2 Rebanadas)" }] },
            sat: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Alitas con Papas Fritas" }], dinner: [{ name: "Tacos al Pastor Premium" }] },
            sun: { breakfast: [{ name: "Tacos de Carnitas (Orden de 3)" }], lunch: [{ name: "Sushi (Rollo Empanizado)" }], dinner: [{ name: "Doritos Nacho (Bolsa 60g)" }] }
        }
    },

    // --- 4. 💪 Aumento Masa Muscular ---
    {
        id: "gain_base",
        name: "💪 Aumento Masa Muscular",
        desc: "Alto en proteína y superávit calórico.",
        planData: {
            mon: { breakfast: [{ name: "Huevos con Jamón (3 huevos)" }], lunch: [{ name: "Pasta con Salsa de Tomate y Carne" }, { name: "Pollo Asado" }], dinner: [{ name: "Sándwich de Atún Doble" }] },
            tue: { breakfast: [{ name: "Licuado de Proteína con Avena" }], lunch: [{ name: "Arroz con Frijoles y Bistec" }], dinner: [{ name: "Tacos de Bistec (3)" }] },
            wed: { breakfast: [{ name: "Hot Cakes con Miel y Huevo" }], lunch: [{ name: "Milanesa de Res Empanizada" }], dinner: [{ name: "Hamburguesa con Queso" }], snack: [{ name: "Yogur Griego" }] },
            thu: { breakfast: [{ name: "Omelet de Espinacas y Queso" }], lunch: [{ name: "Pechuga de Pollo Rellena" }], dinner: [{ name: "Quesadillas de Flor de Calabaza" }], snack: [{ name: "Nueces" }] },
            fri: { breakfast: [{ name: "Chilaquiles Rojos con Huevo" }], lunch: [{ name: "Pescado Zarandeado" }], dinner: [{ name: "Burrito de Carne Asada" }] },
            sat: { breakfast: [{ name: "Huevo con Machaca" }], lunch: [{ name: "Lasagna de Carne" }], dinner: [{ name: "Pizza de Carnes Frías (2 rebanadas)" }] },
            sun: { breakfast: [{ name: "Tamales de Pollo (2)" }], lunch: [{ name: "Costillas BBQ" }], dinner: [{ name: "Torta de Pierna" }] }
        }
    },
    {
        id: "gain_1",
        name: "💪 Aumento Masa Muscular - 1",
        desc: "Hipertrofia clásica: Pollo, arroz y pesas.",
        planData: {
            mon: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }, { name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Carne Asada con Chorizo Premium" }], snack: [{ name: "Smoothie AUREUS Power" }] },
            tue: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Albóndigas con Espagueti" }], dinner: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Ensalada César (Plato)" }] },
            wed: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Atún Fresco (Medallón 150g)" }, { name: "Arroz Blanco (250g)" }, { name: "Lentejas (Sopa 1 Taza)" }], dinner: [{ name: "Tilapia" }, { name: "Ensalada AUREUS Detox" }] },
            thu: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Relleno Negro Yucateco (Pavo y Albóndigas)" }], dinner: [{ name: "Tacos al Pastor Premium" }] },
            fri: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Lasaña Italiana Premium" }], dinner: [{ name: "AUREUS Burger XL" }] },
            sat: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Carne Asada con Chorizo Premium" }], dinner: [{ name: "Pizza de Pepperoni (2 Rebanadas)" }] },
            sun: { breakfast: [{ name: "Tacos de Carnitas (Orden de 3)" }], lunch: [{ name: "Costillas de Cerdo (220g)" }], dinner: [{ name: "Yogur Griego Natural (150g)" }, { name: "Moras (Blackberries)" }] }
        }
    },
    {
        id: "gain_2",
        name: "💪 Aumento Masa Muscular - 2",
        desc: "Volumen sucio controlado.",
        planData: {
            mon: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Hamburguesa Don Doblecarne" }], dinner: [{ name: "AUREUS Burger XL" }], snack: [{ name: "Smoothie AUREUS Power" }] },
            tue: { breakfast: [{ name: "Molletes con Jamón y Queso" }], lunch: [{ name: "Espagueti a la Boloñesa" }], dinner: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }] },
            wed: { breakfast: [{ name: "Hot Cakes (Orden de 2 pzas)" }], lunch: [{ name: "Tacos de Carnitas (Orden de 3)" }], dinner: [{ name: "Hot Dog con Tocino Premium" }] },
            thu: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Tacos de Carnitas (Orden de 3)" }], dinner: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }] },
            fri: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Pizza de Pepperoni (2 Rebanadas)" }], dinner: [{ name: "Alitas con Papas Fritas" }] },
            sat: { breakfast: [{ name: "Gorditas de Harina (Carne con Papas)" }], lunch: [{ name: "Hamburguesa Don Doblecarne" }], dinner: [{ name: "Tacos de Carnitas (Orden de 3)" }] },
            sun: { breakfast: [{ name: "Pozole Rojo de Cerdo (Plato)" }], lunch: [{ name: "Costillas de Cerdo (220g)" }], dinner: [{ name: "Rol de Canela Glaseado (Pieza Grande 300g)" }] }
        }
    },
    {
        id: "gain_3",
        name: "💪 Aumento Masa Muscular - 3",
        desc: "Ganancia limpia (Lean Bulk). Carbos complejos.",
        planData: {
            mon: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Salmón a la Plancha (150g)" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Bowl AUREUS Ancestral" }], snack: [{ name: "Avellanas" }] },
            tue: { breakfast: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Atún Fresco (Medallón 150g)" }], snack: [{ name: "Yogur Griego Natural (150g)" }] },
            wed: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Tacos al Pastor Premium" }, { name: "Frijoles de la Olla (1 Taza)" }], dinner: [{ name: "Ceviche de Pescado" }], snack: [{ name: "Huevo Duro" }] },
            thu: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Pavo (Pechuga)" }, { name: "Ensalada AUREUS Detox" }], dinner: [{ name: "Tostadas de Pollo" }] },
            fri: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Pescado Empapelado al Aluminio" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Ceviche de Pescado" }] },
            sat: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Pasta con Mejillones (350g)" }], dinner: [{ name: "Carne Asada con Chorizo Premium" }], snack: [{ name: "Avellanas" }] },
            sun: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Moras (Blackberries)" }], lunch: [{ name: "Pechuga de Pollo Asada (150g)" }], dinner: [{ name: "Ensalada César (Plato)" }] }
        }
    },

    // --- 5. ⚡ Rendimiento Deportivo ---
    {
        id: "perf_base",
        name: "⚡ Rendimiento Deportivo",
        desc: "Alto en carbohidratos complejos para energía máxima.",
        planData: {
            mon: { breakfast: [{ name: "Avena con Leche y Plátano" }], lunch: [{ name: "Pasta Integral con Pollo" }], dinner: [{ name: "Ensalada de Quinoa" }], snack: [{ name: "Barra Energética" }] },
            tue: { breakfast: [{ name: "Hot Cakes de Avena" }], lunch: [{ name: "Arroz al Vapor con Salmón" }], dinner: [{ name: "Batido de Proteína" }], snack: [{ name: "Fruta Deshidratada" }] },
            wed: { breakfast: [{ name: "Tostadas de Aguacate y Huevo" }], lunch: [{ name: "Sandwich de Roast Beef" }], dinner: [{ name: "Sopa de Lentejas" }], snack: [{ name: "Yogur con Granola" }] },
            thu: { breakfast: [{ name: "Waffles con Fruta" }], lunch: [{ name: "Bowl de Arroz, Frijoles y Pollo" }], dinner: [{ name: "Wrap de Atún" }], snack: [{ name: "Jugo Verde" }] },
            fri: { breakfast: [{ name: "Omelet con Papas" }], lunch: [{ name: "Spaghetti con Albóndigas" }], dinner: [{ name: "Quesadillas de Queso Panela" }], snack: [{ name: "Pretzels" }] },
            sat: { breakfast: [{ name: "Licuado de Chocolate y Plátano" }], lunch: [{ name: "Pizza Casera (Masa delgada)" }], dinner: [{ name: "Tacos de Pescado" }], snack: [{ name: "Cerezas" }] },
            sun: { breakfast: [{ name: "Pan Francés" }], lunch: [{ name: "Paella Mixta" }], dinner: [{ name: "Ensalada de Frutas con Requesón" }] }
        }
    },
    {
        id: "perf_1",
        name: "⚡ Rendimiento Deportivo - 1",
        desc: "Carga de carbohidratos para corredores y resistencia.",
        planData: {
            mon: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Espagueti a la Boloñesa" }, { name: "Pechuga de Pollo Asada (150g)" }], dinner: [{ name: "Molletes con Jamón y Queso" }], snack: [{ name: "Cereal con Leche y Fruta (Tazón)" }] },
            tue: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Arroz Blanco (250g)" }, { name: "Atún Fresco (Medallón 150g)" }], dinner: [{ name: "Papa (Cocida)" }], drinks: [{ name: "Agua de Jamaica (Sin Azúcar / 1 Vaso)" }] },
            wed: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Bowl AUREUS Ancestral" }], dinner: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }], snack: [{ name: "Fruta Deshidratada" }] },
            thu: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Lentejas (Sopa 1 Taza)" }, { name: "Arroz Blanco (250g)" }], dinner: [{ name: "Tostadas de Atún Premium" }] },
            fri: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Espagueti con Mejillones Premium" }], dinner: [{ name: "Pizza de Pepperoni (2 Rebanadas)" }] },
            sat: { breakfast: [{ name: "Focaccia de Cebolla y Aceitunas" }], lunch: [{ name: "Espagueti con Mejillones Premium" }], dinner: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }], snack: [{ name: "Pretzels" }] },
            sun: { breakfast: [{ name: "Hot Cakes (Orden de 2 pzas)" }], lunch: [{ name: "Espagueti a la Boloñesa" }], dinner: [{ name: "Yogur Griego Natural (150g)" }, { name: "Moras (Blackberries)" }], drinks: [{ name: "Jugo de Naranja (Natural 250ml)" }] }
        }
    },
    {
        id: "perf_2",
        name: "⚡ Rendimiento Deportivo - 2",
        desc: "Para deportes explosivos (Crossfit, HIIT).",
        planData: {
            mon: { breakfast: [{ name: "Molletes con Jamón y Queso" }], lunch: [{ name: "Bowl AUREUS Ancestral" }], dinner: [{ name: "Smoothie AUREUS Power" }], snack: [{ name: "Papaya Picada (1 Taza)" }] },
            tue: { breakfast: [{ name: "Yogur Griego Natural (150g)" }, { name: "Galletas Polvorones" }], lunch: [{ name: "Hot Dog (Sencillo)" }], dinner: [{ name: "Tostadas de Atún Premium" }] },
            wed: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Carne Asada con Chorizo Premium" }], dinner: [{ name: "Tostadas de Atún con Aguacate (2 pzas)" }], snack: [{ name: "Jugo de Naranja (Natural 250ml)" }] },
            thu: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Hamburguesa Don Doblecarne" }], dinner: [{ name: "Cereal con Leche y Fruta (Tazón)" }] },
            fri: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Pescado Empapelado al Aluminio" }], dinner: [{ name: "Tacos de Carnitas (Orden de 3)" }] },
            sat: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "AUREUS Burger XL" }], dinner: [{ name: "Club Sandwich" }] },
            sun: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Lasaña Italiana Premium" }], dinner: [{ name: "Quesadilla Harina con Aguacate (1 pza)" }] }
        }
    },
    {
        id: "perf_3",
        name: "⚡ Rendimiento Deportivo - 3",
        desc: "Recuperación intensiva y alta energía.",
        planData: {
            mon: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Arroz Blanco (250g)" }, { name: "Pechuga de Pollo Asada (150g)" }], dinner: [{ name: "Smoothie AUREUS Power" }], snack: [{ name: "Avellanas" }], drinks: [{ name: "Jugo de Naranja (Natural 250ml)" }] },
            tue: { breakfast: [{ name: "Crema de Almendras" }], lunch: [{ name: "Pasta con Mejillones (350g)" }], dinner: [{ name: "Pescado Empapelado al Aluminio" }] },
            wed: { breakfast: [{ name: "Omelet de Claras, Queso y Espinaca" }], lunch: [{ name: "Tostadas de Atún Premium" }], dinner: [{ name: "Sopa de Tortilla Premium" }] },
            thu: { breakfast: [{ name: "Smoothie AUREUS Power" }], lunch: [{ name: "Albóndigas con Espagueti" }], dinner: [{ name: "Molletes con Jamón y Queso" }] },
            fri: { breakfast: [{ name: "Hot Cakes Premium" }], lunch: [{ name: "Tacos de Carnitas (Orden de 3)" }], dinner: [{ name: "Pizza de Pepperoni (2 Rebanadas)" }], snack: [{ name: "Chocolate Amargo" }] },
            sat: { breakfast: [{ name: "Chilaquiles con Pollo (Rojos/Verdes)" }], lunch: [{ name: "Costillas de Cerdo (220g)" }], dinner: [{ name: "Tacos de Camarón Ensenada Premium" }], drinks: [{ name: "Agua de Jamaica (Sin Azúcar / 1 Vaso)" }] },
            sun: { breakfast: [{ name: "Cereal con Leche y Fruta (Tazón)" }], lunch: [{ name: "Sushi (Rollo Empanizado)" }], dinner: [{ name: "Helado" }] }
        }
    }
];

// Final safe-check replacements to ensure no 404s in new base templates
SYSTEM_TEMPLATES.forEach(t => {
    Object.values(t.planData).forEach(day => {
        Object.values(day).forEach(meal => {
            meal.forEach((item, index) => {
                // Add any new replacements needed for the base templates
                if (item.name === "Carne Asada con Chorizo Premium") return; // valid
                if (item.name === "Chicharrón de Cerdo") meal[index].name = "Costillas de Cerdo (220g)";
                if (item.name === "Huevos Revueltos con Tocino") meal[index].name = "Omelet de Claras, Queso y Espinaca";
                // ... (keep previous safe checks)
                if (item.name === "Carne de Res (Corte Graso)") meal[index].name = "Discada Norteña Premium";
                if (item.name === "Chiles Rellenos de Queso (Sin Capear)") meal[index].name = "Quesadilla Harina con Aguacate (1 pza)";
                if (item.name === "Brotes de Soja") meal[index].name = "Ensalada AUREUS Detox";
                if (item.name === "Carnitas (Tacos)") meal[index].name = "Tacos de Carnitas (Orden de 3)";
                if (item.name === "Sushi (Rollo Empanizado)") meal[index].name = "Tostadas de Atún Premium";
                if (item.name === "Club Sandwich") meal[index].name = "Molletes con Jamón y Queso";
                if (item.name === "Chocolate Amargo") meal[index].name = "Galletas Polvorones";
                if (item.name === "Helado") meal[index].name = "Gelatina (Sin sabor)";
                if (item.name === "Fruta Deshidratada") meal[index].name = "Moras (Blackberries)";
                if (item.name === "Pretzels") meal[index].name = "Galletas Polvorones";
                if (item.name === "Tostadas de Pollo") meal[index].name = "Tostadas de Atún Premium";
                if (item.name === "Huevo Duro") meal[index].name = "Omelet de Claras, Queso y Espinaca";
                if (item.name === "Tacos de Bistec (Sin grasa)") meal[index].name = "Tacos al Pastor Premium";
                if (item.name === "Machaca con Huevo Generosa") meal[index].name = "Omelet de Claras, Queso y Espinaca";

                // Specific fixes for the new Base templates:
                if (item.name === "Huevos con Jamón (3 huevos)") meal[index].name = "Omelet de Claras, Queso y Espinaca";
                if (item.name === "Pasta con Salsa de Tomate y Carne") meal[index].name = "Espagueti a la Boloñesa";
                if (item.name === "Pollo Asado") meal[index].name = "Pechuga de Pollo Asada (150g)";
                if (item.name === "Sándwich de Atún Doble") meal[index].name = "Tostadas de Atún Premium";
                if (item.name === "Arroz con Frijoles y Bistec") meal[index].name = "Carne Asada con Chorizo Premium"; // Approx
                if (item.name === "Tacos de Bistec (3)") meal[index].name = "Tacos al Pastor Premium";
                if (item.name === "Hot Cakes con Miel y Huevo") meal[index].name = "Hot Cakes Premium";
                if (item.name === "Milanesa de Res Empanizada") meal[index].name = "Milanesa de Pollo con Espagueti"; // Fallback
                if (item.name === "Hamburguesa con Queso") meal[index].name = "Hamburguesa Don Doblecarne";
                if (item.name === "Omelet de Espinacas y Queso") meal[index].name = "Omelet de Claras, Queso y Espinaca";
                if (item.name === "Pechuga de Pollo Rellena") meal[index].name = "Pechuga de Pollo Asada (150g)";
                if (item.name === "Quesadillas de Flor de Calabaza") meal[index].name = "Quesadilla Harina con Aguacate (1 pza)";
                if (item.name === "Chilaquiles Rojos con Huevo") meal[index].name = "Chilaquiles con Pollo (Rojos/Verdes)";
                if (item.name === "Pescado Zarandeado") meal[index].name = "Pescado Empapelado al Aluminio";
                if (item.name === "Burrito de Carne Asada") meal[index].name = "Tacos de Carnitas (Orden de 3)";
                if (item.name === "Huevo con Machaca") meal[index].name = "Omelet de Claras, Queso y Espinaca"; // Or Machaca if in DB, assuming Omelet safest
                if (item.name === "Lasagna de Carne") meal[index].name = "Lasaña Italiana Premium";
                if (item.name === "Pizza de Carnes Frías (2 rebanadas)") meal[index].name = "Pizza de Pepperoni (2 Rebanadas)";
                if (item.name === "Tamales de Pollo (2)") meal[index].name = "Tamal de Verde (1 pieza)";
                if (item.name === "Costillas BBQ") meal[index].name = "Costillas de Cerdo (220g)";
                if (item.name === "Torta de Pierna") meal[index].name = "Molletes con Jamón y Queso";
                if (item.name === "Avena con Leche y Plátano") meal[index].name = "Avena Cocida";
                if (item.name === "Pasta Integral con Pollo") meal[index].name = "Espagueti con Mejillones Premium"; // Swap
                if (item.name === "Ensalada de Quinoa") meal[index].name = "Bowl AUREUS Ancestral";
                if (item.name === "Barra Energética") meal[index].name = "Cereal con Leche y Fruta (Tazón)";
                if (item.name === "Hot Cakes de Avena") meal[index].name = "Hot Cakes Premium";
                if (item.name === "Arroz al Vapor con Salmón") meal[index].name = "Salmón a la Plancha (150g)";
                if (item.name === "Batido de Proteína") meal[index].name = "Smoothie AUREUS Power";
                if (item.name === "Tostadas de Aguacate y Huevo") meal[index].name = "Tostadas de Atún con Aguacate (2 pzas)";
                if (item.name === "Sandwich de Roast Beef") meal[index].name = "Molletes con Jamón y Queso";
                if (item.name === "Sopa de Lentejas") meal[index].name = "Lentejas (Sopa 1 Taza)";
                if (item.name === "Waffles con Fruta") meal[index].name = "Hot Cakes Premium";
                if (item.name === "Bowl de Arroz, Frijoles y Pollo") meal[index].name = "Bowl AUREUS Ancestral";
                if (item.name === "Wrap de Atún") meal[index].name = "Tostadas de Atún Premium";
                if (item.name === "Jugo Verde") meal[index].name = "Smoothie AUREUS Power";
                if (item.name === "Omelet con Papas") meal[index].name = "Omelet de Claras, Queso y Espinaca";
                if (item.name === "Spaghetti con Albóndigas") meal[index].name = "Albóndigas con Espagueti";
                if (item.name === "Quesadillas de Queso Panela") meal[index].name = "Quesadilla Harina con Aguacate (1 pza)";
                if (item.name === "Licuado de Chocolate y Plátano") meal[index].name = "Smoothie AUREUS Power";
                if (item.name === "Pizza Casera (Masa delgada)") meal[index].name = "Pizza de Pepperoni (2 Rebanadas)";
                if (item.name === "Tacos de Pescado") meal[index].name = "Tacos de Camarón Ensenada Premium";
                if (item.name === "Pan Francés") meal[index].name = "Hot Cakes Premium";
                if (item.name === "Paella Mixta") meal[index].name = "Paella Valenciana"; // Assuming DB item
                if (item.name === "Ensalada de Frutas con Requesón") meal[index].name = "Yogur Griego Natural (150g)";
                if (item.name === "Granola") meal[index].name = "Cereal con Leche y Fruta (Tazón)";
                if (item.name === "Arroz Integral") meal[index].name = "Arroz Blanco (250g)";
                if (item.name === "Huevo con Toast de Aguacate") meal[index].name = "Omelet de Claras, Queso y Espinaca";
                if (item.name === "Sopa de Verduras") meal[index].name = "Sopa de Tortilla Premium";
                if (item.name === "Licuado de Fresa y Plátano") meal[index].name = "Smoothie AUREUS Power";
                if (item.name === "Tacos de Pollo Suaves") meal[index].name = "Tostadas de Atún con Aguacate (2 pzas)";
                if (item.name === "Ensalada Caprese") meal[index].name = "Ensalada AUREUS Detox";
                if (item.name === "Pasta con Camarones") meal[index].name = "Pasta con Mejillones (350g)";
                if (item.name === "Milanesa de Pollo con Ensalada") meal[index].name = "Milanesa de Pollo con Espagueti"; // approx
                if (item.name === "Quesadillas Ligeras") meal[index].name = "Quesadilla Harina con Aguacate (1 pza)";
                if (item.name === "Jicaleta") meal[index].name = "Papaya Picada (1 Taza)";
                if (item.name === "Albóndigas con Arroz") meal[index].name = "Albóndigas con Espagueti";
                if (item.name === "Sándwich de Pavo") meal[index].name = "Molletes con Jamón y Queso";
                if (item.name === "Licuado de Plátano y Avena") meal[index].name = "Smoothie AUREUS Power";
                if (item.name === "Tacos Dorados de Pollo (3)") meal[index].name = "Tacos de Carnitas (Orden de 3)";
                if (item.name === "Huevos Motuleños") meal[index].name = "Huevos Divorciados"; // or Omelet
                if (item.name === "Carne en su Jugo") meal[index].name = "Frijoles Charros Premium";
                if (item.name === "Tostadas de Tinga (2)") meal[index].name = "Tostadas de Atún con Aguacate (2 pzas)";
                if (item.name === "Sushi (California Roll)") meal[index].name = "Tostadas de Atún Premium";
                if (item.name === "Hamburguesa Casera") meal[index].name = "Hamburguesa Don Doblecarne";
            });
        });
    });
});
