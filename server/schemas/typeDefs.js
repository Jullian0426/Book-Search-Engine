const typeDefs = gql`
  type Query {
    user(username: String, userId: ID): User
  }

  type Mutation {
    login(email: String, username: String, password: String!): Auth
    createUser(username: String!, email: String!, password: String!): Auth
    saveBook(book: Book!): User
    deleteBook( bookId: ID!): User
  }

  type Auth {
    token: ID!
    user: User
  }

  type User {
    _id: ID
    username: String
    email: String
    password: String
    savedBooks: [Book]
  }

  type Book {
    _id: ID
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }
`;