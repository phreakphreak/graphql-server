import { ApolloServer, UserInputError, gql } from "apollo-server";

import { v1 as uuid } from "uuid";

const persons = [{
  name: "zack", phone: "0123456789", street: " st Ave", city: "city", id: "1"
}, {
  name: "jack", phone: "0123456789", street: "street 2", city: "madrid", id: "2"
}, {
  name: "Itzi", street: "street 3", city: "barcelona", id: "3"
}];

const typeDefs = gql`
    enum YesNo {
        YES
        NO
    }

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
        allPersons(phone: YesNo): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person
        editNumber(name: String!, phone: String!): Person
    }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length, allPersons: (root, args) => {
      if (!args.phone) return persons;

      const byPhone = (person) => args.phone === "YES" ? person.phone : !person.phone;

      return persons.filter(byPhone);
    }, findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    }
  },

  Person: {
    address: (root) => {
      return {
        street: root.street, city: root.city
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
    },

    editNumber: (root, args) => {
      const person = persons.find((p) => p.name === args.name);
      const index = persons.indexOf(person);
      if (!person) return null;
      // {
      //   throw  new UserInputError("User does not exist", {
      //     invalidArgs: args.name
      //   });
      // }
      const updatePerson = {
        ...person, phone: args.phone
      };

      persons[index] = updatePerson

      return updatePerson


    }
  }
};

const server = new ApolloServer({
  typeDefs, resolvers
});

server.listen().then(({ url }) => {
  console.log("listening on", url);
});
