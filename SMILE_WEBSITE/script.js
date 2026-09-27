const registerButtons = document.querySelectorAll('button');

registerButtons.forEach(button => {
    button.addEventListener('click', () => {
        alert('Welcome to SmileSchool and thank you for registering.');
    });
});

const faqItems = document.querySelectorAll('.faq > div > div');

faqItems.forEach(item => {
    const question = item.querySelector('h3');
    const answer = item.querySelector('p');

    question.style.cursor = 'pointer';

    question.addEventListener('click', () => {
        if (answer.style.display === 'none') {
            answer.style.display = 'block';
        } else {
            answer.style.display = 'none';
        }
    });
});