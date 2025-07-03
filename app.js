document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav-links');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('is-open');
        });
    }

    // Código para el acordeón de Preguntas Frecuentes (si la página actual es la correcta)
    const faqAccordion = document.querySelector('.faq-accordion');
    if (faqAccordion) {
        const faqQuestions = faqAccordion.querySelectorAll('.faq-question');
        faqQuestions.forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.nextElementSibling;
                button.classList.toggle('active');
                if (button.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = 0;
                }
            });
        });
    }

    // Código para el chat de Ayuda (si la página actual es la correcta)
    const chatInput = document.querySelector('#ayuda .input-area input');
    if(document.body.parentElement.id === "ayuda-page"){
        // Tu lógica de chat aquí...
    }
});