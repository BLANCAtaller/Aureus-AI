/**
 * Billing Logic Simulation for Aureus Finance
 * Handles the "Update Card" interaction by simulating a secure redirect to Stripe.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnUpdateCard = document.getElementById('btnUpdateCard');

    if (btnUpdateCard) {
        btnUpdateCard.addEventListener('click', async () => {
            // Visual Feedback
            const originalText = btnUpdateCard.innerHTML;
            btnUpdateCard.innerHTML = '<i class="fa-solid fa-circle-notch"></i> Conectando con Stripe...';
            btnUpdateCard.classList.add('btn-loading');

            // Simulate Network Delay for "Creating Portal Session"
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real app, we would redirect:
            // window.location.href = response.url; 

            // For Prototype: Show stylized alert or modal
            alert("🔐 Redirigiendo a Entorno Seguro de Stripe...\n\nAquí el usuario actualizaría sus datos bancarios en el portal encriptado.");

            // Reset Button
            btnUpdateCard.innerHTML = originalText;
            btnUpdateCard.classList.remove('btn-loading');
        });
    }
});
