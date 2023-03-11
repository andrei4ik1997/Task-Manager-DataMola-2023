export const STRATEGY_NAME = {
  local: 'local',
  jwt: 'jwt',
};

export const LOCAL_STRATEGY_FIELD = {
  username: 'login',
  password: 'password',
};

export const SALT = 10;

export const AUTH_EXCEPTION = {
  existingUser: 'Login or userName is already taken',
  notEqualPasswords: 'Passwords are not identical',
};
