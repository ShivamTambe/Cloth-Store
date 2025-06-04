
  const userIcon = document.getElementById('user-icon');
  const loginBox = document.getElementById('login-box');

  userIcon.addEventListener('click', () => {
    loginBox.classList.toggle('show');
  });


  
  const addCart = document.getElementById('ad-to-cart');
  const loginBox2 = document.getElementById('login-box2');

  addCart.addEventListener('click', () => {
    loginBox2.classList.toggle('show');
  });