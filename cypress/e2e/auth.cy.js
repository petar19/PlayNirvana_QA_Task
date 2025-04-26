import { generateUserData } from '../support/utils';
import { faker } from '@faker-js/faker';

describe('User Registration and Login Flow', () => {
    beforeEach(() => {
      cy.setCloudflareBypass();
    });

    let testData;
    let correctTestData = {}

    before(() => {
      testData = generateUserData(); 
    });

    it('registering the account, logging out and logging back in', () => {
      cy.visit('/user/sign-up-v2');
     
      cy.testInputField('input[id="username"]', testData.usernameGenerator, {fieldName: 'username'})
      cy.testInputField('#password input', testData.password)
      cy.testInputField('#password-confirm input', testData.password)

      cy.get('.x-bet-submit-btn').click()

      cy.testInputField('input[id="firstName"]', testData.firstname)
      cy.testInputField('input[id="lastName"]', testData.lastname)
      
      cy.dropdownSelect('ng-select[formcontrolname="month"]', testData.birthdate.getMonth() )
      cy.dropdownSelect('ng-select[formcontrolname="countryNumericCode"]', 1)
      
      cy.testInputField('input[id="day"]', testData.birthdate.getDay() + 1, {skipErrorCheck: true})
      cy.testInputField('input[id="year"]', testData.birthdate.getFullYear(), {skipErrorCheck: true})

      cy.testInputField('input[id="document-number"]', testData.documentnumberGenerator)

      cy.dropdownSelect('ng-select[formcontrolname="genderType"]')

      cy.get('.x-bet-submit-btn').click()
      
      cy.testInputField('input[id="emailAddress"]', testData.emailAddressGenerator)
      cy.testInputField('input[id="phoneNumber"]', testData.phoneNumber)
      cy.dropdownSelect('ng-select[formcontrolname="city"]', null, 'a')

      cy.testInputField('input[id="address"]', testData.address)
      cy.get('.x-bet-submit-btn').click()

      cy.wait(10000)
      cy.url().should('not.include', 'user/sign-up-v2');
      
      cy.checkIfLoggedIn()

      cy.get('.menu-item').contains('Odjava').click();
      cy.wait(3000)

      cy.get('.login-btn').should('be.visible');
      cy.get('.login-btn').click();

      cy.get('@valid_username').then((username) => {
        cy.testInputField('input[formcontrolname="username"]:visible', username)
        correctTestData.username = username
        correctTestData.password = testData.password
      });

      cy.testInputField('input[type="password"]:visible', testData.password)

      cy.get('button[type="submit"]:visible').click();

      cy.wait(3000)

      cy.checkIfLoggedIn()
    })

    it('logging in with incorrect data', () => {
      cy.visit('/');
     
      cy.get('.login-btn').should('be.visible');
      cy.get('.login-btn').click();

      cy.testInputField('input[formcontrolname="username"]:visible', 'abc')
      cy.testInputField('input[type="password"]:visible', correctTestData.password)
      cy.get('button[type="submit"]:visible').click();
      cy.wait(2500)
      cy.checkError()

      cy.testInputField('input[formcontrolname="username"]:visible', correctTestData.username)
      cy.testInputField('input[type="password"]:visible', correctTestData.username)
      cy.get('button[type="submit"]:visible').click();
      cy.wait(2500)
      cy.checkError()

      cy.testInputField('input[type="password"]:visible', 'abcd')
      cy.get('button[type="submit"]:visible').click();
      cy.wait(2500)
      cy.checkError()
    })

    it('registering with incorrect data', () => {
      cy.visit('/user/sign-up-v2');
     
      cy.testInputField('input[id="username"]', testData.usernameGenerator, {fieldName: 'username', incorrectValue: 'aa'})
      cy.testInputField('input[id="username"]', testData.usernameGenerator, {fieldName: 'username', incorrectValue: 'test123'})
      cy.testInputField('#password input', testData.password, {incorrectValue: 'aa'})
      cy.testInputField('#password input', testData.password, {incorrectValue: 'aabbccdd'})
      cy.testInputField('#password-confirm input', testData.password, {incorrectValue: 'aabbccdd'})

      cy.get('.x-bet-submit-btn').click()

      cy.dropdownSelect('ng-select[formcontrolname="countryNumericCode"]', 1)

      const unsupportedAge = new Date(faker.date.birthdate({ mode: 'age', min: 10, max: 15 }))
      cy.dropdownSelect('ng-select[formcontrolname="month"]', testData.birthdate.getMonth() )
      cy.testInputField('input[id="day"]', testData.birthdate.getDay() + 1, {skipErrorCheck: true})
      cy.testInputField('input[id="year"]', testData.birthdate.getFullYear(), {incorrectValue: unsupportedAge.getFullYear()})

      cy.testInputField('input[id="document-number"]', testData.documentnumberGenerator, {incorrectValue: 123})

      cy.dropdownSelect('ng-select[formcontrolname="genderType"]')

      cy.get('.x-bet-submit-btn').click()
      cy.wait(1000)
      cy.checkError()

      cy.testInputField('input[id="firstName"]', testData.firstname)
      cy.testInputField('input[id="lastName"]', testData.lastname)

      cy.get('.x-bet-submit-btn').click()
      
      cy.testInputField('input[id="emailAddress"]', testData.emailAddressGenerator, {incorrectValue: 'aaa@bbb'})
      cy.testInputField('input[id="phoneNumber"]', testData.phoneNumber, {incorrectValue: 1234})
      cy.dropdownSelect('ng-select[formcontrolname="city"]', null, 'a')

      cy.testInputField('input[id="address"]', testData.address, {incorrectValue: 'abc'})
    })
});