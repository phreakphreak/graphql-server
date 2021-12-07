import { ApolloServer, UserInputError, gql } from "apollo-server";

import { v1 as uuid } from "uuid";

const persons = [
  {
    name: "zack",
    phone: "0123456789",
    street: " st Ave",
    city: "city",
    id: "1"
  },
  {
    name: "jack",
    phone: "0123456789",
    street: "street 2",
    city: "madrid",
    id: "2"
  },
  {
    name: "Itzi",
    phone: "0123456789",
    street: "street 3",
    city: "barcelona",
    id: "3"
  }
];

const typeDefs = gql`
    type Address {
        street: String!
        city: String!
    }

    type Person {
        name: String!
        phone: String
        address: Address!
        id: String!
    }

    type Query {
        personCount: Int!
        allPersons: [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person
    }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    }
  },

  Person: {
    address: (root) => {

      return {
        street: root.street,
        city: root.city
      };
    }
  },

  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log("listening on", url);
});
