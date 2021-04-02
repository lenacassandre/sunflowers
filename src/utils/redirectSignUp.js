export default function redirectSignUp() {
  const location = window.location.href;

  const regexSignUp = /\?inscription=(.*)&/;
  let inscription = location.match(regexSignUp);

  if (inscription) {
    inscription = inscription[1];
  }

  return inscription;
}
