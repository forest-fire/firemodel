import { IDictionary } from "common-types";
import { NamedFakes } from "@/types";

export const PropertyNamePatterns: IDictionary<keyof typeof NamedFakes> = {
  id: "id",
  name: "name",
  age: "age",
  fullname: "name",
  firstName: "firstName",
  lastName: "lastName",
  address: "address",
  city: "city",
  state: "stateAbbr",
  country: "countryCode",
  street: "streetAddress",
  streetAddress: "streetAddress",
  lat: "latitude",
  latitude: "latitude",
  lon: "longitude",
  longitude: "longitude",
  avatar: "imageAvatar",
  phone: "phoneNumber",
  phoneNumber: "phoneNumber",
};
