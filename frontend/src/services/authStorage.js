const TOKEN_KEY = "ajs_token";
const USER_KEY = "ajs_user";

export function saveAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}
