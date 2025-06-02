type UserType = {
  id: number;
  value: string;
};

type UserWithoutId = Omit<UserType, 'id'>;

// const user : UserWithoutId = {
//   id: 1, // ✅ Wont compile because there should not be user id
//   name: 'Alex'
// }
