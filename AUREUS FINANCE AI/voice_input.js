
(function () {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let audioContext, analyser, dataArray, source, animationId;

    window.startVoiceInput = async function () {
        if (!SpeechRecognition) {
            Swal.fire({
                icon: 'error',
                title: 'No soportado',
                text: 'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.',
                background: '#1a1c23',
                color: '#fff',
                customClass: { popup: 'rounded-3xl border border-white/10' }
            });
            return;
        }

        // Check Permissions if possible
        try {
            const status = await navigator.permissions.query({ name: 'microphone' });
            if (status.state === 'denied') {
                showPermissionHelp();
                return;
            }
        } catch (e) {
            console.log("Permissions API not fully supported or restricted.");
        }

        let recognition;
        try {
            recognition = new SpeechRecognition();
        } catch (e) {
            console.error("Failed to init recognition", e);
            return;
        }

        recognition.lang = 'es-ES';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        let finalTranscript = '';

        // UI State for live detection
        let detectedType = 'expense';
        let detectedAmount = 0;
        let detectedCategory = 'Others';

        // Show "Listening" UI with Real-time Visualizer
        Swal.fire({
            title: '',
            html: `
                <div class="flex flex-col items-center gap-6 py-4">
                    <!-- Premium Visualizer Container -->
                    <div class="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-3xl bg-[#0b0d10]/50 border border-white/5 shadow-inner">
                        <canvas id="voice-visualizer" class="w-full h-full opacity-60"></canvas>
                        
                        <!-- Center Mic Icon -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div id="mic-pulse-circle" class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center text-white border border-white/10 transition-all duration-300">
                                <i data-lucide="mic" class="w-8 h-8 text-indigo-400"></i>
                            </div>
                        </div>
                    </div>

                    <div class="text-center w-full">
                        <h3 class="text-xl font-black text-white tracking-tight mb-1">Escuchando...</h3>
                        <p id="voice-interim" class="text-sm text-indigo-300 font-medium min-h-[2.5em] italic px-4 leading-relaxed line-clamp-2">"Esperando tu voz..."</p>
                    </div>

                    <!-- Real-time Detection Preview -->
                    <div id="voice-preview-pills" class="flex gap-2 flex-wrap justify-center opacity-0 transition-opacity duration-300">
                         <div id="pill-type" class="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                            <i data-lucide="arrow-up-right" class="w-3 h-3"></i> GASTO
                         </div>
                         <div id="pill-amount" class="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                            $0.00
                         </div>
                         <div id="pill-cat" class="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10">
                            Otros
                         </div>
                    </div>

                    <!-- Voice Guide Structure (Optimized) -->
                    <div class="w-full bg-[#161b22]/80 border border-white/5 rounded-2xl p-4 text-left shadow-lg overflow-hidden relative group">
                        <div class="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                            <i data-lucide="help-circle" class="w-12 h-12 text-white"></i>
                        </div>
                        <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">Comandos Rápidos</p>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <p class="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Ingresos</p>
                                <p class="text-[9px] text-slate-400 leading-tight">"Ganamos 2000"<br>"Sueldo de 500"</p>
                            </div>
                            <div class="space-y-1 text-right">
                                <p class="text-[10px] font-black text-rose-400 uppercase tracking-wider">Gastos</p>
                                <p class="text-[9px] text-slate-400 leading-tight">"Cena 40 pesos"<br>"Bus 5 dólares"</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 w-full">
                        <button onclick="Swal.close()" class="flex-1 py-3 bg-white/5 border border-white/5 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                            Cancelar
                        </button>
                        <button id="btn-stop-voice" class="flex-[2] py-3 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                            <i data-lucide="check-circle" class="w-4 h-4"></i> Finalizar y Procesar
                        </button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            background: '#0f1115',
            color: '#fff',
            customClass: { popup: 'rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden' },
            didOpen: () => {
                if (window.lucide) lucide.createIcons();
                document.getElementById('btn-stop-voice').addEventListener('click', () => {
                    recognition.stop();
                });
                startVisualizer();
            },
            willClose: () => {
                stopVisualizer();
            }
        });

        recognition.start();

        recognition.onstart = () => {
            console.log("Recognition started successfully.");
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const activeText = interimTranscript || finalTranscript;
            const display = document.getElementById('voice-interim');
            if (display) {
                display.innerText = `"${activeText}"`;

                // Real-time Preview Architecture
                const analysis = analyzePhrase(activeText);
                updatePreviewUI(analysis);
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice Error:', event.error);
            if (event.error === 'aborted') return;

            Swal.close();
            let msg = 'No se escuchó nada.';
            if (event.error === 'not-allowed') {
                showPermissionHelp();
                return;
            }
            if (event.error === 'network') msg = 'Error de conexión.';

            Swal.fire({
                toast: true, position: 'top-end', icon: 'warning', title: msg,
                background: '#1a1c23', color: '#fff', timer: 3000, showConfirmButton: false
            });
        };

        recognition.onend = () => {
            stopVisualizer();
            const interimText = document.getElementById('voice-interim')?.innerText.replace(/"/g, '') || '';
            const textToProcess = finalTranscript || (interimText !== 'Esperando tu voz...' ? interimText : '');

            if (textToProcess && textToProcess.trim().length > 0) {
                if (Swal.isVisible()) Swal.close();
                processVoiceCommand(textToProcess);
            } else {
                if (Swal.isVisible()) Swal.close();
            }
        };
    };

    // --- Audio Visualizer Core ---
    async function startVisualizer() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            const canvas = document.getElementById('voice-visualizer');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const pulseCircle = document.getElementById('mic-pulse-circle');

            function draw() {
                animationId = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const width = canvas.width;
                const height = canvas.height;
                const barWidth = (width / bufferLength) * 2.5;
                let x = 0;
                let totalVolume = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * height;
                    totalVolume += dataArray[i];

                    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
                    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.4)');

                    ctx.fillStyle = gradient;
                    // Mirroring the visualizer from center
                    ctx.fillRect(width / 2 + x, height / 2 - barHeight / 2, barWidth, barHeight);
                    ctx.fillRect(width / 2 - x, height / 2 - barHeight / 2, barWidth, barHeight);

                    x += barWidth + 1;
                }

                // Smooth Pulse based on overall volume
                const avgVolume = totalVolume / bufferLength;
                if (pulseCircle) {
                    const scale = 1 + (avgVolume / 255) * 0.4;
                    pulseCircle.style.transform = `scale(${scale})`;
                    pulseCircle.style.borderColor = `rgba(99, 102, 241, ${0.1 + (avgVolume / 255)})`;
                }
            }
            draw();
        } catch (err) {
            console.error("Visualizer Error:", err);
        }
    }

    function stopVisualizer() {
        if (animationId) cancelAnimationFrame(animationId);
        if (source) source.disconnect();
        if (audioContext) audioContext.close();
    }

    // --- Permission Help ---
    function showPermissionHelp() {
        Swal.fire({
            icon: 'info',
            title: 'Acceso al Micrófono',
            html: `
                <div class="text-left space-y-3 p-2">
                    <p class="text-sm text-slate-300">Para usar los comandos de voz, necesitamos tu permiso. Por favor:</p>
                    <ol class="text-xs text-slate-400 space-y-2 list-decimal pl-4">
                        <li>Haz clic en el icono del candado <i data-lucide="lock" class="inline w-3 h-3"></i> en la barra de direcciones.</li>
                        <li>Activa el interruptor de <b>Micrófono</b>.</li>
                        <li>Selecciona "Permitir siempre en este sitio" para una mejor experiencia.</li>
                    </ol>
                    <div class="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300">
                        <b>Pro Tip:</b> La opción "Permitir mientras visitas el sitio" recordará tu decisión.
                    </div>
                </div>
            `,
            confirmButtonText: 'Entendido',
            background: '#0f1115',
            color: '#fff',
            customClass: {
                popup: 'rounded-[2rem] border border-white/10 shadow-3xl',
                confirmButton: 'rounded-xl px-8 bg-indigo-500 font-bold uppercase tracking-widest text-xs py-3'
            },
            didOpen: () => { if (window.lucide) lucide.createIcons(); }
        });
    }

    // --- Analysis & Preview Logic ---
    function analyzePhrase(text) {
        const lower = text.toLowerCase();
        let type = 'expense';
        if (lower.match(/\b(ingreso|dep[oó]sito|recib[ií]|gan[eé]|venta|cobro|nomina)\b/)) {
            type = 'income';
        }

        const amountMatch = lower.match(/(\d+([\.,]\d+)?)/);
        let amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;

        let category = detectCategorySimple(lower);

        return { type, amount, category };
    }

    function updatePreviewUI(analysis) {
        const preview = document.getElementById('voice-preview-pills');
        if (!preview) return;

        preview.classList.remove('opacity-0');
        preview.classList.add('opacity-100');

        const pType = document.getElementById('pill-type');
        const pAmt = document.getElementById('pill-amount');
        const pCat = document.getElementById('pill-cat');

        if (analysis.type === 'income') {
            pType.className = "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5";
            pType.innerHTML = '<i data-lucide="arrow-down-left" class="w-3 h-3"></i> INGRESO';
        } else {
            pType.className = "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5";
            pType.innerHTML = '<i data-lucide="arrow-up-right" class="w-3 h-3"></i> GASTO';
        }

        pAmt.innerText = analysis.amount > 0 ? `$${analysis.amount.toLocaleString()}` : '$0.00';
        pCat.innerText = analysis.category;

        if (window.lucide) lucide.createIcons();
    }

    function processVoiceCommand(text) {
        const analysis = analyzePhrase(text);
        const description = text.charAt(0).toUpperCase() + text.slice(1);

        // --- APPLY TO UI ---
        const radioIncome = document.getElementById('wt-income');
        const radioExpense = document.getElementById('wt-expense');

        if (analysis.type === 'income' && radioIncome) {
            radioIncome.checked = true;
        } else if (radioExpense) {
            radioExpense.checked = true;
        }

        if (window.updateWalletCategories) window.updateWalletCategories();

        const amountInput = document.getElementById('w-amount');
        if (amountInput) amountInput.value = analysis.amount || '';

        const descInput = document.getElementById('w-desc');
        if (descInput) descInput.value = description;

        setTimeout(() => {
            selectCategoryByValue(analysis.category);
        }, 300);

        // Success Toast
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Comando detectado',
            text: `Se cargó un ${analysis.type === 'income' ? 'Ingreso' : 'Gasto'} de $${analysis.amount}`,
            background: '#161b22',
            color: '#fff',
            timer: 3000,
            showConfirmButton: false
        });
    }

    function selectCategoryByValue(catId) {
        const catGrid = document.getElementById('category-grid');
        if (!catGrid) return;

        if (typeof window.selectWalletCategory === 'function') {
            const buttons = catGrid.querySelectorAll('div[onclick*="selectWalletCategory"]');
            for (const btn of buttons) {
                const onClickStr = btn.getAttribute('onclick').toLowerCase();
                const catLower = catId.toLowerCase();
                if (onClickStr.includes(`'${catLower}'`) ||
                    onClickStr.includes(`"${catLower}"`) ||
                    btn.innerText.toLowerCase().includes(catLower)) {
                    btn.click();
                    return;
                }
            }
        }
    }

    function detectCategorySimple(text) {
        const lower = text.toLowerCase();
        const keywords = {
            'Food': ['comida', 'comer', 'hamburguesa', 'pizza', 'taco', 'restaurante', 'sushi', 'almuerzo', 'cena', 'cafe', 'starbucks', 'desayuno'],
            'Groceries': ['super', 'mandado', 'despensa', 'leche', 'pan', 'fruta', 'verdura', 'walmart', 'costco'],
            'Transport': ['uber', 'taxi', 'bus', 'camion', 'gasolina', 'transporte', 'pasaje', 'didi', 'estacionamiento'],
            'Health': ['medicina', 'doctor', 'farmacia', 'consulta', 'hospital', 'dentista'],
            'Entertainment': ['cine', 'pelicula', 'juego', 'salida', 'fiesta', 'netflix', 'spotify', 'bar', 'chelas'],
            'Shopping': ['ropa', 'zapatos', 'compra', 'regalo', 'amazon', 'mercado libre', 'tenis'],
            'Utilities': ['luz', 'agua', 'internet', 'telefono', 'gas', 'renta', 'alquiler'],
            'Salary': ['nomina', 'sueldo', 'pago', 'salario', 'quincenta'],
            'Business': ['negocio', 'venta', 'cliente', 'proyecto', 'honorarios']
        };

        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(w => lower.includes(w))) return cat;
        }
        return 'Otros';
    }

})();
