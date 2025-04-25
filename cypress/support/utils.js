import { faker } from '@faker-js/faker';

export function generateUserData(overrides = {}) {
  return {
    usernameGenerator: () => faker.person.firstName() + faker.finance.accountNumber(3),
    password: faker.internet.password({ pattern: /[A-Z0-9]/ }),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    birthdate: new Date(faker.date.birthdate({ mode: 'age', min: 18, max: 65 })),
    documentnumberGenerator: () => faker.finance.accountNumber(5),
    emailAddressGenerator: () => faker.internet.exampleEmail(),
    phoneNumber: faker.finance.accountNumber(8),
    address: faker.location.streetAddress(),
    ...overrides
  };
}