// FAQ dropdown logic

document.addEventListener('DOMContentLoaded', function () {
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(function (button) {
    button.addEventListener('click', function (event) {
      // Prevent the default action and stop the event from propagating
      event.preventDefault();
      event.stopPropagation();

      const answer = button.nextElementSibling;
      const chevron = button.querySelector('.chevron');
      const expanded = button.getAttribute('aria-expanded') === 'true';

      // Toggle answer visibility
      if (answer) {
        answer.style.display = expanded ? 'none' : 'block';
      }
      // Toggle aria-expanded
      button.setAttribute('aria-expanded', !expanded);
      // Toggle chevron direction
      if (chevron) {
        chevron.textContent = expanded ? '▼' : '▲';
      }
    });

    // Hide answers by default
    const answer = button.nextElementSibling;
    if (answer) {
      answer.style.display = 'none';
    }
  });
});