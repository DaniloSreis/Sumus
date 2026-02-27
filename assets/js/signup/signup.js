// {
//     "iss": "https://accounts.google.com",
//     "azp": "844537015586-58ehm3cbcfqjgbilgvk0f9rdv1mh4sd4.apps.googleusercontent.com",
//     "aud": "844537015586-58ehm3cbcfqjgbilgvk0f9rdv1mh4sd4.apps.googleusercontent.com",
//     "sub": "104522674578202786643",
//     "email": "danilofatec27@gmail.com",
//     "email_verified": true,
//     "nbf": 1769719101,
//     "name": "A",
//     "picture": "https://lh3.googleusercontent.com/a/ACg8ocLuqltyUoYb6F_JBvMShBUwIheaxj-Tmve_sRz-0ZDlb8x-Uw=s96-c",
//     "given_name": "A",
//     "iat": 1769719401,
//     "exp": 1769723001,
//     "jti": "554c0ed6a007b1478424c99974dde11b5cf3239f"
// }

function handleCredentialResponse(reponse) {
  const data = jwtDecode(reponse.credential);
  const user = { email: '', name: '', picture: '', sub: '' };

  if (data) {
    const { picture, name, email, sub } = data;
    Object.assign(user, { picture, name, email, sub });
    localStorage.setItem("user", JSON.stringify(user))
    window.location = 'http://localhost:5500/pages/request-ride.html';
  }
}

window.onload = function () {
  google.accounts.id.initialize({
    client_id:
      '844537015586-58ehm3cbcfqjgbilgvk0f9rdv1mh4sd4.apps.googleusercontent.com',
    callback: handleCredentialResponse, // função que recebe as credenciais do usuário
  });

  google.accounts.id.renderButton(
    document.querySelector('.signup-form__google-btn'),
    {
      type: 'standard',
      shape: 'rectangular',
      theme: 'filled_white',
      text: 'continue_with',
      size: 'large',
      logo_alignment: 'center',
      width: '400px',
    },
  );
};
