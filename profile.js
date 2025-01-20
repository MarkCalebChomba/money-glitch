document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.profile-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            if (tab) {
                // Update active states
                navButtons.forEach(btn => btn.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(tab).classList.add('active');
            }
        });
    });

    // Mpesa Integration
    const depositBtn = document.querySelector('.mpesa-btn.deposit');
    const withdrawBtn = document.querySelector('.mpesa-btn.withdraw');

    depositBtn?.addEventListener('click', async () => {
        const phone = depositBtn.parentElement.querySelector('input[type="tel"]').value;
        const amount = depositBtn.parentElement.querySelector('input[type="number"]').value;

        if (!phone || !amount) {
            alert('Please fill in all fields');
            return;
        }

        // Here you would integrate with your Mpesa API
        try {
            // Example API call
            // const response = await initiateDeposit(phone, amount);
            alert('Deposit initiated! Check your phone for STK push.');
        } catch (error) {
            alert('Error processing deposit. Please try again.');
        }
    });

    withdrawBtn?.addEventListener('click', async () => {
        const phone = withdrawBtn.parentElement.querySelector('input[type="tel"]').value;
        const amount = withdrawBtn.parentElement.querySelector('input[type="number"]').value;

        if (!phone || !amount) {
            alert('Please fill in all fields');
            return;
        }

        // Here you would integrate with your Mpesa API
        try {
            // Example API call
            // const response = await initiateWithdrawal(phone, amount);
            alert('Withdrawal initiated! Money will be sent to your M-PESA.');
        } catch (error) {
            alert('Error processing withdrawal. Please try again.');
        }
    });
});
