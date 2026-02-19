document.addEventListener('DOMContentLoaded', () => {
    const refreshBtns = document.querySelectorAll('.btn');

    refreshBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const cellBody = event.target.closest('.c-body');
            const numElement = cellBody.querySelector('.num');

            // Visual feedback
            numElement.style.opacity = '0.3';
            
            setTimeout(() => {
                // Generate random 5-digit number
                const newNumber = Math.floor(10000 + Math.random() * 90000);
                numElement.textContent = newNumber;
                numElement.style.opacity = '1';
            }, 300);
        });
    });
});