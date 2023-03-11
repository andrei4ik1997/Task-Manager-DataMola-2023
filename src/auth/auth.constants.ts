export const StrategyName = {
  local: 'local',
  jwt: 'jwt',
};

export const LocalStrategyFields = {
  username: 'login',
  password: 'password',
};

export const SALT = 10;

export const Exception = {
  existingUser: 'Login or userName is already taken',
  notEqualPasswords: 'Passwords are not identical',
};
