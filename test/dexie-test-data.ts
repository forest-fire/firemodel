import DeepPerson from "./testing/dynamicPaths/DeepPerson";
import { Car } from "./testing/Car";

export const carData: Array<Car & { id: string }> = [
  {
    id: "123",
    model: "Volt",
    cost: 23000,
    modelYear: 2018,
    lastUpdated: 231231,
    createdAt: 8980
  },
  {
    id: "456",
    model: "350e",
    cost: 46000,
    modelYear: 2016,
    lastUpdated: 231232,
    createdAt: 8981
  },
  {
    id: "789",
    model: "A3",
    cost: 50000,
    modelYear: 2019,
    lastUpdated: 231233,
    createdAt: 8982
  }
];

export const peopleData: DeepPerson[] = [
  {
    id: "123",
    name: { first: "Bob", last: "Marley" },
    age: 55,
    group: "musicians"
  },
  {
    id: "456",
    name: { first: "Peter", last: "Tosh" },
    age: 56,
    group: "musicians"
  },
  {
    id: "789",
    name: { first: "Jane", last: "Jacobs" },
    age: 78,
    group: "authors"
  },
  {
    id: "121",
    name: { first: "John", last: "Grisham" },
    age: 60,
    group: "authors"
  },
  {
    id: "111",
    name: { first: "Bugs", last: "Bunny" },
    age: 55,
    group: "fictional"
  }
];
