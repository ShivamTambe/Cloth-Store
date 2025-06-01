
  const userIcon = document.getElementById('user-icon');
  const loginBox = document.getElementById('login-box');

  userIcon.addEventListener('click', () => {
    loginBox.classList.toggle('show');
  });