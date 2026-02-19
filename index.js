document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Controls ---
    const sidebar = document.getElementById("mySidebar");
    const openBtn = document.getElementById("openNavBtn");
    const closeBtn = document.getElementById("closeNavBtn");

    const openNav = () => { sidebar.style.width = "220px"; };
    const closeNav = () => { sidebar.style.width = "0"; };

    openBtn.addEventListener('click', openNav);
    closeBtn.addEventListener('click', closeNav);

    // --- Refresh Button Logic ---
    const refreshBtns = document.querySelectorAll('.btn');

    refreshBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const cellBody = event.target.closest('.c-body');
            const numElement = cellBody.querySelector('.num');

            // Add a "loading" effect
            numElement.style.opacity = '0.3';
            
            // Simulate a delay for fetching new numbers
            setTimeout(() => {
                // Generates a random 5-digit number
                const newNumber = Math.floor(10000 + Math.random() * 90000);
                numElement.textContent = newNumber;
                numElement.style.opacity = '1';
            }, 300);
        });
    });
});