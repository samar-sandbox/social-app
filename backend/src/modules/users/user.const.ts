export const LIMITED_FIELDS = {
  firstName: 1,
  lastName: 1,
  image: 1,
  privacy: 1,
};

export const PUBLIC_FIELDS = {
  ...LIMITED_FIELDS,
  email: 1,
  coverImages: 1,
  age: 1,
  gender: 1,
  createdAt: 1,
};
