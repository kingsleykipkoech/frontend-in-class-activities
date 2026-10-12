const newBookBtn = document.querySelector('.btn-new-book');
const navLinks = document.querySelectorAll('.nav-links a');

if (newBookBtn) {
    newBookBtn.addEventListener('click', () => {
        const title = prompt('Enter the title of the new book:');
        if (title && title.trim() !== '') {
            alert('"' + title.trim() + '" has been added to your vault!');
        }
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
    });
});
