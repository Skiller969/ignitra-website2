document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const formMessage = document.getElementById('formMessage');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset message
        formMessage.classList.add('hidden');
        formMessage.classList.remove('text-green-500', 'text-red-500');

        // Loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        btnText.textContent = 'Submitting...';
        btnLoader.classList.remove('hidden');

        // Get data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                formMessage.textContent = 'Thanks! We will be in touch soon.';
                formMessage.classList.add('text-green-500');
                formMessage.classList.remove('hidden');
                form.reset();
            } else {
                throw new Error(result.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Submission error:', error);
            formMessage.textContent = error.message;
            formMessage.classList.add('text-red-500');
            formMessage.classList.remove('hidden');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.textContent = 'Get Free Consultation';
            btnLoader.classList.add('hidden');
        }
    });

    // Simple scroll animation observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

    // Apply fade-in animation to sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
        observer.observe(section);
    });
});
