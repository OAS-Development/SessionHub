// Method 1: Basic interface definition
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// Method 2: Using type aliases with union types
type UserId = number;
type UserName = string;
type UserEmail = string;
type UserAvatar = string | undefined;

interface UserWithTypes {
  id: UserId;
  name: UserName;
  email: UserEmail;
  avatar?: UserAvatar;
}

// Method 3: Using a class implementation
class UserClass implements User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public avatar?: string
  ) {}
}

// Method 4: Using Record type utility
type UserRecord = Record<'id', number> &
  Record<'name', string> &
  Record<'email', string> &
  Partial<Record<'avatar', string>>;

// Method 5: Using type intersection
type UserBase = {
  id: number;
  name: string;
};

type UserContact = {
  email: string;
};

type UserOptional = {
  avatar?: string;
};

type UserIntersection = UserBase & UserContact & UserOptional;

// Example usage:
const user1: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://example.com/avatar.jpg"
};

const user2: UserWithTypes = {
  id: 2,
  name: "Jane Smith",
  email: "jane@example.com"
  // avatar is optional, so we can omit it
};

const user3 = new UserClass(3, "Bob Johnson", "bob@example.com");

const user4: UserRecord = {
  id: 4,
  name: "Alice Brown",
  email: "alice@example.com",
  avatar: "https://example.com/alice.jpg"
};

const user5: UserIntersection = {
  id: 5,
  name: "Charlie Wilson",
  email: "charlie@example.com"
};