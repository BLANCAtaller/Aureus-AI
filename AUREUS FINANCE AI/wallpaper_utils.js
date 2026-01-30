// Wallpaper functionality
// Wallpaper functionality
function setWallpaper(type, value, buttonElement) {
    // 1. Reset Styles
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '';

    // 2. Apply New Style
    if (type === 'solid') {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = value;
    } else if (type === 'image') {
        document.body.style.backgroundColor = '#0B0D14'; // Fallback
        document.body.style.backgroundImage = `url('${value}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed'; // Parallax-ish
    } else if (type === 'class') {
        // Legacy support if needed, but HTML seems to use type/value
        const body = document.body;
        const existingClasses = Array.from(body.classList).filter(cls => cls.startsWith('bg-'));
        existingClasses.forEach(cls => body.classList.remove(cls));
        body.classList.add(value);
    }

    // 3. Update active UI state
    const allButtons = document.querySelectorAll('button[onclick^="setWallpaper"]');
    allButtons.forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-[#1a1d2e]');
        btn.style.transform = 'scale(1)';
    });

    if (buttonElement) {
        buttonElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'ring-offset-[#1a1d2e]');
        buttonElement.style.transform = 'scale(1.05)';
    }

    // 4. Persistence
    if (typeof window.appState !== 'undefined') {
        window.appState.settings = window.appState.settings || {};
        window.appState.settings.wallpaperType = type;
        window.appState.settings.wallpaperValue = value;

        if (typeof window.saveState === 'function') {
            window.saveState();
        }
    }

    // 5. Feedback
    if (typeof Swal !== 'undefined') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            background: '#1E293B',
            color: '#fff'
        });

        Toast.fire({
            icon: 'success',
            title: 'Wallpaper Updated'
        });
    }
}

// Upload custom wallpaper
function uploadWallpaper(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const imageUrl = e.target.result;
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';

        // Save custom wallpaper using standard format for granular sync
        if (window.appState) {
            window.appState.settings = window.appState.settings || {};
            window.appState.settings.wallpaperType = 'image';
            window.appState.settings.wallpaperValue = imageUrl;
            if (typeof window.saveState === 'function') {
                window.saveState();
            }
        }

        // Show success message
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true,
                position: 'top',
                icon: 'success',
                title: 'Custom wallpaper uploaded',
                background: '#1E293B',
                color: '#fff',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    reader.readAsDataURL(file);
}
