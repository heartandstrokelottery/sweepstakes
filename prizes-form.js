// JavaScript for handling the newsletter form submission on the prizes page
document.addEventListener('DOMContentLoaded', function() {
    // Get the newsletter form
    const newsletterForm = document.querySelector('.bottom-newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email2').value.trim();
            const recaptchaChecked = document.getElementById('recaptcha2').checked;
            
            // Simple validation
            if (!fullname) {
                showMessage('Please enter your full name', 'error');
                return;
            }
            
            if (!email) {
                showMessage('Please enter your email address', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            if (!recaptchaChecked) {
                showMessage('Please verify you are not a robot', 'error');
                return;
            }
            
            // Disable submit button to prevent multiple submissions
            const submitBtn = newsletterForm.querySelector('.subscribe-btn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
            
            // Prepare form data
            const formData = new FormData();
            formData.append('fullname', fullname);
            formData.append('email2', email);
            formData.append('recaptcha2', recaptchaChecked ? 'on' : 'off');
            
            // Submit the form to Google Apps Script
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbzJxHG37YZvISe_SFdV9pd6Y_EzHgDri_c-f4a75jzMzbHIlotZwChmS47V5m7a7Pym/exec';
            
            fetch(scriptUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // This is required for Google Apps Script
            })
            .then(response => {
                // Since we're using no-cors mode, we can't read the response
                // We'll assume it was successful
                showMessage('Thank you for subscribing to our newsletter!', 'success');
                newsletterForm.reset();
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                showMessage('An error occurred. Please try again later.', 'error');
            })
            .finally(() => {
                // Re-enable the submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        });
    }
    
    // Function to show messages to the user
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Style the message
        messageElement.style.padding = '10px 15px';
        messageElement.style.marginTop = '10px';
        messageElement.style.borderRadius = '4px';
        messageElement.style.fontSize = '14px';
        
        if (type === 'success') {
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
            messageElement.style.border = '1px solid #c3e6cb';
        } else {
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
            messageElement.style.border = '1px solid #f5c6cb';
        }
        
        // Insert the message after the form
        newsletterForm.appendChild(messageElement);
        
        // Remove the message after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
    
    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});