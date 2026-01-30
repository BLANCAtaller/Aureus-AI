function openPlatformModal() {
    document.getElementById('platformModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closePlatformModal() {
    document.getElementById('platformModal').classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal when clicking outside
const platformModal = document.getElementById('platformModal');
if (platformModal) {
    platformModal.addEventListener('click', function (e) {
        if (e.target === this) {
            closePlatformModal();
        }
    });
}
