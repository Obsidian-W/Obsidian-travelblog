describe("Obsidian Travels", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("opens the home page", () => {
    cy.get("h1").contains("Obsidian Travels");
  });

  it("navigates to the blog page", () => {
    cy.get('a[href="/blog/"]').first().click();
    cy.url().should("include", "/blog/");
    cy.get("h1").contains(/Travel Blog/i);
  });

  it("navigates to the about page", () => {
    cy.get('a[href="/about/"]').first().click();
    cy.url().should("include", "/about/");
    cy.get("h1").contains(/About/i);
  });

  it("navigates to the categories page", () => {
    cy.get('a[href="/categories/"]').first().click();
    cy.url().should("include", "/categories/");
    cy.get("h1").contains(/Categories/i);
  });

  it("serves the French home page", () => {
    cy.visit("/fr/");
    cy.get("h1").contains("Obsidian Travels");
  });
});
