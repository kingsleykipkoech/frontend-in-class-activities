document.getElementById('regForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value;
    const address = document.getElementById('address').value.trim();
    const message = document.getElementById('message');

    message.style.color = 'red';

    const namepattern = /^[A-Za-z]+ [A-Za-z]+$/;
    if (!namepattern.test(name)) {
        message.innerText = 'Name must be in format <firstname> <lastname>';
        return;
    }

    const usernamepattern = /^@\w+$/;
    if (!usernamepattern.test(username)) {
        message.innerText = 'Username must be in format @<username>';
        return;
    }

    const emailpattern = /^\S+@\S+\.\S+$/;
    if (!emailpattern.test(email)) {
        message.innerText = 'Email must be in format <string>@<string>.<xxx>';
        return;
    }

    const passwordpattern = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W)/;
    if (!passwordpattern.test(password)) {
        message.innerText = 'Password must have at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol';
        return;
    }

    const phonepattern = /^\+250\d+$/;
    if (!phonepattern.test(phone)) {
        message.innerText = 'Phone number must start with +250 followed by numbers';
        return;
    }

    if (gender === '') {
        message.innerText = 'Gender should not be empty';
        return;
    }

    if (address === '') {
        message.innerText = 'Address should not be empty';
        return;
    }

    message.style.color = 'blue';
    message.innerText = 'Submitted Successfully!';
    alert('Submitted Successfully!');
    document.getElementById('regForm').reset();
});
