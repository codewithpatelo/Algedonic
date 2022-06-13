describe('Sapper template app', () => {
	beforeEach(() => {
		cy.visit('/')
	});

	it('has the correct <h1>', () => {
		cy.contains('h1', 'Orans 2')
	});
	
		it('is possible to change route', () => {
		cy.visit('/auth/login');
		cy.contains('h1', 'Sign In')

		cy.visit('/auth/register');
		cy.contains('h1', 'Sign up')

		cy.visit('/');
		cy.contains('h1', 'conduit')

		cy.visit('/auth/register');
		cy.contains('h1', 'Sign up')
	});

	it('navigates to /profile/dashboard', () => {
		cy.get('nav a').contains('about').click();
		cy.url().should('include', '/profile/dashboard');
	});

	it('navigates to /request/view', () => {
		cy.get('nav a').contains('blog').click();
		cy.url().should('include', '/request/view');
	});
});
