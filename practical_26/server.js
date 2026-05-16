import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
  type Book {
    id: ID!
    title: String!
    pages: Int!
    year: Int!
    author: Author!
  }

  type Author {
    id: ID!
    fullName: String!
    birthYear: Int
    books: [Book!]!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
  }

  type Mutation {
    addBook(title: String!, pages: Int!, year: Int!, authorId: ID!): Book!
    addAuthor(fullName: String!, birthYear: Int): Author!
  }
`;

const books = [
  {
    id: "1",
    title: "Война и мир",
    authorId: "1",
    pages: 1300,
    year: 1869,
  },
  {
    id: "2",
    title: "Анна Каренина",
    authorId: "1",
    pages: 864,
    year: 1877,
  },
  {
    id: "3",
    title: "Преступление и наказание",
    authorId: "2",
    pages: 672,
    year: 1866,
  },
];

const authors = [
  { id: "1", fullName: "Лев Николаевич Толстой", birthYear: 1828 },
  { id: "2", fullName: "Фёдор Михайлович Достоевский", birthYear: 1821 },
];

const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find((b) => b.id === id),
    authors: () => authors,
  },

  Mutation: {
    addBook: (_, { title, pages, year, authorId }) => {
      const book = {
        id: String(books.length + 1),
        title,
        pages,
        year,
        authorId,
      };
      books.push(book);
      return book;
    },
    addAuthor: (_, { fullName, birthYear }) => {
      const author = {
        id: String(authors.length + 1),
        fullName,
        birthYear: birthYear || null,
      };
      authors.push(author);
      return author;
    },
  },

  Book: {
    author: (parent) => authors.find((a) => a.id === parent.authorId),
  },
  Author: {
    books: (parent) => books.filter((b) => b.authorId === parent.id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`GraphQL Server ready at: ${url}`);
