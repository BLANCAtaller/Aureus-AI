
(function () {
    // TICKET SCANNER LOGIC

    window.handleTicketUpload = function (event) {
        const file = event.target.files[0];
        if (!file) return;

        // Create Object URL for preview
        const imageUrl = URL.createObjectURL(file);

        // TODO: MIGRATION TO SUPABASE EDGE FUNCTIONS
        // The current Tesseract.js implementation is client-side only.
        // Future upgrade:
        // 1. Upload image to Supabase Storage
        // 2. Call supabase.functions.invoke('ticket-scanner', { body: { imageUrl } })
        // 3. Edge function uses Gemini Vision/OpenAI to parse receipt
        // 4. Return structured JSON

        // Show Loading with Progress
        Swal.fire({
            title: 'Analizando Ticket...',
            html: `Iniciando motor AI...<br><br><div class="w-full bg-slate-700 rounded-full h-2.5 dark:bg-slate-700">
  <div id="ocr-progress-bar" class="bg-indigo-600 h-2.5 rounded-full" style="width: 0%"></div>
</div><div id="ocr-status" class="text-xs text-slate-400 mt-2">Cargando modelo...</div>`,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            background: '#1e293b',
            color: '#fff'
        });

        // Perform OCR with Tesseract
        Tesseract.recognize(
            file,
            'spa', // Spanish
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const pct = Math.round(m.progress * 100);
                        const bar = document.getElementById('ocr-progress-bar');
                        const status = document.getElementById('ocr-status');
                        if (bar) bar.style.width = pct + '%';
                        if (status) status.innerText = `Leyendo texto: ${pct}%`;
                    } else {
                        const status = document.getElementById('ocr-status');
                        if (status) status.innerText = m.status;
                    }
                }
            }
        ).then(({ data: { text } }) => {
            console.log('OCR Output:', text);
            const { items, date } = parseReceiptText(text);

            Swal.close();
            openVerificationModal(items, imageUrl, date);
        }).catch(err => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error de Lectura',
                text: 'No se pudo leer el ticket. Intenta con una imagen más clara.',
                background: '#1e293b',
                color: '#fff'
            });
        });
    };

    function parseReceiptText(text) {
        console.log('--- OCR RAW TEXT ---');
        console.log(text);
        console.log('--- END RAW TEXT ---');

        // --- PRE-PROCESSING: Clean OCR Noise ---
        let cleanedText = text
            .replace(/[|*#@©®™«»°¬¦§¨´¯¿¡—–_\[\]{}<>]/g, '')
            // Join numbers split by spaces (e.g., "6 5.70" -> "65.70")
            .replace(/(\d)\s+(\d)/g, '$1$2')
            .replace(/\s{2,}/g, ' ')
            .replace(/\n{2,}/g, '\n')
            .replace(/-{3,}/g, ''); // Only remove long dashes (separators)

        const lines = cleanedText.split('\n');
        const items = [];
        const seenDescriptions = new Set();
        let detectedDate = null;

        // --- REGEX DEFINITIONS ---
        // Price: 1-5 digits + separator + 2 digits
        const priceRegex = /(\d{1,5}[,\.]\d{2})/g;
        const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;

        // Banned patterns - very specific to avoid false positives
        const bannedPatterns = [
            /\btotal\b/i, /\bsubtotal\b/i, /\biva\b/i, /1va/i, /lva/i, // IVA with OCR errors
            /\befectivo\b/i, /\bcambio\b/i, /\btarjeta\b/i, /\bfolio\b/i,
            /\bcajero\b/i, /\bticket\b/i, /\bgracias\b/i, /\bcompra\b/i,
            /\bsucursal\b/i, /\bcliente\b/i, /\brfc\b/i, /\bcaja\b/i,
            /\bcredito\b/i, /\bdebito\b/i, /\bvisa\b/i, /\bmastercard\b/i,
            /\bfactura\b/i, /\btelefono\b/i, /\bimporte\b/i,
            /descripcion.*precio/i, /precio\s*unit/i,
            /^\d+:\d+\s*(am|pm)/i, // Time only
            /\d+\s*%\s*$/  // Lines ending with percentage (IVA 16%)
        ];

        const unitSuffixes = /\s*(kg|kgs|gr|grs|lt|lts|pz|pzs|ml|oz|lb|lbs|un|unid|uni|rost|ke)\s*$/i;

        // Common OCR garbage at start of descriptions
        const ocrGarbageStart = /^([a-z]{1,3}\s+\d+\s+|[a-z]{1,4}\s+[a-z]{1,3}\s+\d+\s+|\d+\s+)/i;

        // --- FIRST PASS: Find date ---
        for (const line of lines) {
            const dateMatch = line.match(dateRegex);
            if (dateMatch && !detectedDate) {
                let p1 = parseInt(dateMatch[1]);
                let p2 = parseInt(dateMatch[2]);
                let p3 = dateMatch[3];

                let year = p3.length === 4 ? p3 : '20' + p3;
                let month, day;

                // Assume MM/DD if p1 <= 12
                if (p1 <= 12) {
                    month = p1;
                    day = p2;
                } else {
                    day = p1;
                    month = p2;
                }

                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    detectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    console.log(`Date found: ${detectedDate}`);
                    break;
                }
            }
        }

        // --- SECOND PASS: Parse items ---
        lines.forEach(line => {
            let cleanLine = line.trim();

            if (cleanLine.length < 5) return;
            if (/^\d+$/.test(cleanLine)) return;
            if (/^[^\w]+$/.test(cleanLine)) return;

            // Skip if matches any banned pattern
            if (bannedPatterns.some(pat => pat.test(cleanLine))) return;

            // Find all prices (2+ digits before decimal)
            const allPrices = [...cleanLine.matchAll(priceRegex)];
            if (allPrices.length > 0) {
                // Take the LAST price as the total
                const lastPriceMatch = allPrices[allPrices.length - 1];
                const priceStr = lastPriceMatch[1].replace(',', '.');
                const amount = parseFloat(priceStr);

                // Skip amounts less than $5 (likely not real prices)
                if (amount < 5.00) return;

                // Extract description (before the last price)
                const priceIndex = cleanLine.lastIndexOf(lastPriceMatch[0]);
                let description = cleanLine.substring(0, priceIndex).trim();

                // Remove OCR garbage patterns at start
                description = description.replace(ocrGarbageStart, '');

                // Remove unit suffixes
                description = description.replace(unitSuffixes, '');

                // Remove remaining leading/trailing numbers and punctuation
                description = description.replace(/^\d+\s*/, '');
                description = description.replace(/\s+\d+[\.\,]?\d*\s*$/, '');
                description = description.replace(/^[\.\-\*\s]+|[\.\-\*\s]+$/g, '');
                description = description.trim();

                // Capitalize nicely
                if (description.length > 0) {
                    description = description.charAt(0).toUpperCase() + description.slice(1).toLowerCase();
                }

                if (description.length < 3) return;

                // Duplicate check
                const descKey = description.toLowerCase().replace(/\s+/g, '');
                if (seenDescriptions.has(descKey)) return;
                seenDescriptions.add(descKey);

                console.log(`✓ "${description}" = $${amount}`);

                items.push({
                    description,
                    amount,
                    category: detectCategory(description)
                });
            }
        });

        if (!detectedDate) {
            detectedDate = new Date().toISOString().split('T')[0];
        }

        console.log(`=== Parsed ${items.length} items, date: ${detectedDate} ===`);
        return { items, date: detectedDate };
    }





    function detectCategory(text) {
        const lower = text.toLowerCase();
        const keywords = {
            'Food': ['pollo', 'carne', 'arroz', 'pan', 'huevo', 'tortilla', 'menu', 'comida', 'restaurante', 'burger', 'pizza', 'taco', 'sushi'],
            'Groceries': ['leche', 'agua', 'super', 'walmart', 'chedraui', 'soriana', 'costco', 'sams', 'kilo', 'litro', 'vegetales', 'fruta'],
            'Beer': ['vino', 'cerveza', 'alcohol', 'licor', 'botella', 'six', 'modelo', 'indio', 'xx'],
            'Health': ['farmacia', 'medicamento', 'shampoo', 'jabón', 'doctor', 'consulta'],
            'Gas': ['gasolina', 'magna', 'premium', 'litros'],
            'Transport': ['uber', 'didi', 'taxi', 'boleto'],
            'Junk Food': ['galletas', 'sabritas', 'dulces', 'refresco', 'coca', 'pepsi', 'chips']
        };

        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(w => lower.includes(w))) return cat;
        }
        return 'Others';
    }


    function openVerificationModal(items, imageUrl, detectedDate) {
        const modal = document.getElementById('modal-ticket-verification');
        const listContainer = document.getElementById('ticket-items-list');
        const totalEl = document.getElementById('ticket-total-display');
        const imgPreview = document.getElementById('ticket-preview-img');
        const dateInput = document.getElementById('ticket-date-input');

        if (!modal || !listContainer) return;

        // Set Date
        if (dateInput) {
            dateInput.value = detectedDate || new Date().toISOString().split('T')[0];
        }

        // Set Image Preview & Zoom
        if (imageUrl && imgPreview) {
            imgPreview.src = imageUrl;
            // Reset styles
            imgPreview.style.transform = 'scale(1)';
            imgPreview.style.transformOrigin = 'center center';
            imgPreview.style.cursor = 'zoom-in';
            imgPreview.style.transition = 'transform 0.3s ease'; // Smooth zoom

            let isZoomed = false;

            imgPreview.onclick = function (e) {
                isZoomed = !isZoomed;
                if (isZoomed) {
                    this.style.transform = 'scale(2.5)';
                    this.style.cursor = 'zoom-out';
                    // Set initial origin to click position
                    const rect = this.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    this.style.transformOrigin = `${x}% ${y}%`;
                } else {
                    this.style.transform = 'scale(1)';
                    this.style.transformOrigin = 'center center';
                    this.style.cursor = 'zoom-in';
                }
            };

            imgPreview.onmousemove = function (e) {
                if (isZoomed) {
                    const rect = this.getBoundingClientRect();
                    // Calculate % position of mouse within the rect
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;

                    // We need to clamp smooth movement. 
                    // However, changing transformOrigin generally requires 'transition: none' on it to be instant.
                    // Let's rely on the fact that 'transform' has transition, but origin might not inherit it or we set it explicitly.
                    // To make panning responsive, we temporarily disable transition for origin if needed, but let's try simple first.
                    this.style.transformOrigin = `${x}% ${y}%`;
                }
            };

            imgPreview.onmouseleave = function () {
                if (isZoomed) {
                    isZoomed = false;
                    this.style.transform = 'scale(1)';
                    this.style.transformOrigin = 'center center';
                    this.style.cursor = 'zoom-in';
                }
            };
        }

        // Clear list
        listContainer.innerHTML = '';
        let total = 0;

        // Sort items by Category for grouping
        items.sort((a, b) => (a.category || 'Others').localeCompare(b.category || 'Others'));

        // Group & Render
        let lastCategory = null;

        items.forEach((item, index) => {
            total += item.amount;
            const currentCategory = item.category || 'Others';

            // Insert Header if new category
            if (currentCategory !== lastCategory) {
                const headerRow = document.createElement('div');
                headerRow.className = 'col-span-12 py-1 px-2 mt-2 sticky top-0 bg-[#0B0D14]/90 backdrop-blur-md z-10 border-b border-white/5';
                headerRow.innerHTML = `<span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">${currentCategory}</span>`;
                listContainer.appendChild(headerRow);
                lastCategory = currentCategory;
            }

            const row = document.createElement('div');
            row.className = 'grid grid-cols-12 gap-2 items-center p-2 border-b border-white/5 hover:bg-white/5 transition group/row';
            row.innerHTML = `
                <!-- Remove Btn -->
                <div class="col-span-1">
                    <button onclick="removeTicketItem(${index})" class="text-red-400 hover:text-red-300 opacity-50 group-hover/row:opacity-100 transition">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
                <!-- Description -->
                <div class="col-span-5">
                    <input type="text" value="${item.description}" id="item-desc-${index}"
                        class="w-full bg-transparent text-xs text-white border-none focus:ring-0 p-0 font-medium" placeholder="Item">
                </div>
                <!-- Category Select -->
                <div class="col-span-3">
                     <select id="item-cat-${index}" onchange="updateItemCategory(${index}, this.value)" class="w-full bg-[#141724] text-[9px] text-slate-300 border border-white/10 rounded px-1 py-1 focus:outline-none focus:border-indigo-500/50">
                        ${getCategoryOptions(item.category)}
                     </select>
                </div>
                <!-- Amount -->
                <div class="col-span-3 relative">
                    <span class="absolute left-0 text-slate-500 text-xs">$</span>
                    <input type="number" value="${item.amount.toFixed(2)}" id="item-amt-${index}" onchange="recalcTicketTotal()"
                        class="w-full bg-transparent text-xs text-emerald-400 font-mono text-right border-none focus:ring-0 p-0" placeholder="0.00">
                </div>
            `;
            listContainer.appendChild(row);
        });

        // Update Total
        if (totalEl) totalEl.innerText = '$' + total.toFixed(2);

        // Store current items
        window.tempTicketItems = items;

        modal.classList.remove('hidden');
        lucide.createIcons();
    }

    // Helper to generate options
    function getCategoryOptions(selectedCat) {
        // We assume appState.categoryDefinitions exists. If not, fallback.
        const cats = window.appState && window.appState.categoryDefinitions ? window.appState.categoryDefinitions : [
            { id: 'Food' }, { id: 'Groceries' }, { id: 'Housing' }, { id: 'Transport' }, { id: 'Entertainment' },
            { id: 'Shopping' }, { id: 'Health' }, { id: 'Utilities' }, { id: 'Education' }, { id: 'Travel' },
            { id: 'Beer' }, { id: 'Junk Food' }, { id: 'Organic' }, { id: 'Love' }, { id: 'Gas' }, { id: 'Others' }
        ];

        return cats.map(c => `
            <option value="${c.id}" ${c.id === selectedCat ? 'selected' : ''}>${c.name || c.id}</option>
        `).join('');
    }

    window.addTicketItem = function () {
        if (!window.tempTicketItems) window.tempTicketItems = [];

        window.tempTicketItems.push({
            description: 'Nuevo Item',
            amount: 0,
            category: 'Others'
        });

        const currentImageUrl = document.getElementById('ticket-preview-img').src;
        const currentDetectedDate = document.getElementById('ticket-date-input').value;
        openVerificationModal(window.tempTicketItems, currentImageUrl, currentDetectedDate);
    };

    window.removeTicketItem = function (index) {
        window.tempTicketItems.splice(index, 1);
        const currentImageUrl = document.getElementById('ticket-preview-img').src;
        const currentDetectedDate = document.getElementById('ticket-date-input').value;
        openVerificationModal(window.tempTicketItems, currentImageUrl, currentDetectedDate);
    };

    window.updateItemCategory = function (index, newCategory) {
        if (window.tempTicketItems && window.tempTicketItems[index]) {
            window.tempTicketItems[index].category = newCategory;
            // Preserving UI State
            const currentImageUrl = document.getElementById('ticket-preview-img').src;
            const currentDetectedDate = document.getElementById('ticket-date-input').value;
            // Re-render to sort and group
            openVerificationModal(window.tempTicketItems, currentImageUrl, currentDetectedDate);
        }
    };

    window.recalcTicketTotal = function () {
        let total = 0;
        const inputs = document.querySelectorAll('[id^="item-amt-"]');
        inputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        document.getElementById('ticket-total-display').innerText = '$' + total.toFixed(2);
    };

    window.saveTicketTransactions = function () {
        // 1. Gather data from DOM
        const rows = document.getElementById('ticket-items-list').children; // Note: children includes headers now, need careful selection

        const newTransactions = [];
        const now = Date.now();
        const dateInput = document.getElementById('ticket-date-input');
        const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

        // 2. Build transactions using querySelectorAll to ensure index alignment
        const descInputs = Array.from(document.querySelectorAll('[id^="item-desc-"]'));
        const catInputs = Array.from(document.querySelectorAll('[id^="item-cat-"]'));
        const amtInputs = Array.from(document.querySelectorAll('[id^="item-amt-"]'));

        descInputs.forEach((input, i) => {
            let desc = input.value || 'Item Ticket';
            const cat = catInputs[i].value;
            const amt = parseFloat(amtInputs[i].value) || 0;

            // Add Prefix if not present (simple check)
            if (!desc.startsWith('Ticket Scanner - ')) {
                desc = 'Ticket Scanner - ' + desc;
            }

            if (amt > 0) {
                newTransactions.push({
                    id: now + i, // Unique ID
                    amount: amt,
                    category: cat,
                    categoryId: cat, // Set categoryId for compatibility
                    date: selectedDate,
                    description: desc, // Backend field
                    name: desc,        // UI Display field
                    type: 'expense',
                    account: 'pocket',
                    notes: 'Scanned via AI'
                });
            }
        });

        // 3. Add to App State
        if (!window.appState.transactions) window.appState.transactions = [];
        window.appState.transactions.push(...newTransactions);

        // 4. Save & Update UI
        if (window.saveState) window.saveState();
        if (window.renderWalletHistory) window.renderWalletHistory();
        if (window.updateMonthlyTotals) window.updateMonthlyTotals(); // Update Dashboard
        if (window.renderBudgetTab) window.renderBudgetTab();

        // 5. Success Feedback
        document.getElementById('modal-ticket-verification').classList.add('hidden');
        Swal.fire({
            icon: 'success',
            title: 'Tickets Processed!',
            text: `${newTransactions.length} items added to your wallet for ${selectedDate}.`,
            background: '#1e293b',
            color: '#fff',
            timer: 2000,
            showConfirmButton: false
        });
    };

    window.closeTicketModal = function () {
        document.getElementById('modal-ticket-verification').classList.add('hidden');
    }

})();
