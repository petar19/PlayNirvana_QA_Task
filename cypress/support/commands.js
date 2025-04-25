const { faker } = require('@faker-js/faker');

Cypress.Commands.add('setCloudflareBypass', () => {
    cy.setCookie('CF_Authorization', 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdhMzc4NzM2NzY2MmIyOTZhNjQ2MTI4NDJlNThjNjM2ZmNjYzAyZDViMTcwOWI1YWEzZmQ0MWE1NjZiMzkxY2MifQ.eyJhdWQiOlsiYjE4OGQxMGI1ZDE5OWYzNzFjMjdmMGRmNTM0YmNiNWY5ZTE1YmNjMTc2ZmViM2RhNTk3NDZkMzJhYzk0MTcxYSJdLCJlbWFpbCI6InBldGFyLmxhemljLmZlckBnbWFpbC5jb20iLCJleHAiOjE3NDU2NzkyNDksImlhdCI6MTc0NTU5Mjg0OSwibmJmIjoxNzQ1NTkyODQ5LCJpc3MiOiJodHRwczovL3h0cmVtZS5jbG91ZGZsYXJlYWNjZXNzLmNvbSIsInR5cGUiOiJhcHAiLCJpZGVudGl0eV9ub25jZSI6Ino3VFhHRGlmWVl6eGlhUHIiLCJzdWIiOiI4OTQ5MWE4Mi1kODU2LTVjMWQtOWM1YS0yYWY4NTgxNTY2YjUiLCJjb3VudHJ5IjoiSFIifQ.qP82MnnEDWAaXVUnm8I5gmyEb2iMKWg2UmrJlA_0HyiraLWzEKm_iAauJrBY1HrRIY5pDXmHSk9nS1L5tjgPwjGh632fpohPZwHWvaB5Z4hqITBnEJBTNNjzmhcWSbK5RBm0NAB_pxCDBj7DlHCbypdbnWcz2OxtmNu1azllj2fFWM5i-pT2w70Q2zFhP1M4ivh0CKp0mrqRVKavtFtVB9XoDanomppN-MXX2lYwkS1vVrzwFl9a18B5mT5D40MkZ1yvlGycVuzgE87T7agiE0vkYZdduCK2fC23j6wRzBXbWronqafsKhNA07GmMUnrEERV8jcbyXYyNrrfiYzBgg', {
        domain: 'www.stage-volcano.com',
        path: '/',
        secure: true,
    });
});

Cypress.Commands.add('fillInputField', (field, value) => {
    const text = cy.wrap(value)
    text.then((generatedText) => {
        const el = typeof field === 'string' ? cy.get(field) : field;
        el.clear().type(generatedText);
    })
});


Cypress.Commands.add('checkNoError', () => {
    cy.get('.invalid-feedback').should('not.exist')
});

Cypress.Commands.add('checkError', () => {
    cy.get('.invalid-feedback').should('exist')
});

Cypress.Commands.add('dropdownSelect', (field, indexOverride = null, fillValue = null) => {
    if (fillValue != null) cy.fillInputField(field, fillValue)
    cy.get(field).click();
    cy.wait(300);
    cy.get('.ng-dropdown-panel .ng-option')
        .then(options => {
            const index = indexOverride ?? Math.floor(Math.random() * options.length);
            cy.wrap(options[index]).click();
        });
});


Cypress.Commands.add('checkIfLoggedIn', () => {
    cy.get('.user-controls').should('be.visible');
    cy.get('.user-controls').click()
    cy.wait(1000)

    cy.get('@valid_username').then((username) => {
    cy.get('.username')
        .invoke('text')
        .then((text) => {
        cy.wrap(text.trim()).should('equal', username);
        });
    });
});

Cypress.Commands.add('testInputField', (field, correctValue, options = {}) => {
    options = {
        incorrectValue: null,
        skipErrorCheck: false,
        fieldName: '',
        xpath: false,
        maxRetries: 5,
        ...options
    }
    if (options.incorrectValue != null) {
        cy.fillInputField(field, options.incorrectValue)
        cy.wait(500)
        cy.checkError()
    }

    if (typeof correctValue !== 'function') {
        cy.fillInputField(field, correctValue)
        if (!options.skipErrorCheck) cy.checkNoError()
    } else {
        function attempt(retriesLeft) {
            const value = correctValue();
    
            cy.fillInputField(field, value);
            cy.wait(2000);

            cy.then(() => {
                const errorVisible = Cypress.$('.invalid-feedback:visible').length > 0;
          
                if (errorVisible) {
                  if (retriesLeft > 0) {
                    cy.log(`Validation failed, retrying... (${options.maxRetries - retriesLeft + 1})`);
                    attempt(retriesLeft - 1);
                  } else {
                    throw new Error('Failed to input a valid value after multiple attempts');
                  }
                } else {
                    console.error('saving variable', value, `valid_${options.fieldName}`)
                    cy.wrap(value).as(`valid_${options.fieldName}`);
                }
            });
        }
    
        attempt(options.maxRetries);
    }
});


