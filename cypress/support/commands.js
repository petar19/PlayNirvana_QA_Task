const { faker } = require('@faker-js/faker');

const authToken = Cypress.env('authToken');
console.error('auth token', authToken)

Cypress.Commands.add('setCloudflareBypass', () => {
    cy.setCookie('CF_Authorization', authToken, {
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


