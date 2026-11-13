/**
 * Where catalog data comes from.
 *
 * - `store`    : the live Brihot store named by NEXT_PUBLIC_COMMERCE_STORE.
 * - `fixtures` : clearly labelled local preview data (src/lib/commerce/fixtures),
 *                for design review while the real store is still empty.
 *
 * Fixture mode never talks to the store for catalog reads, and ordering is
 * disabled because fixture ids do not exist on the server.
 */
export type CatalogSource = "store" | "fixtures";

export function catalogSource(): CatalogSource {
  return process.env.NEXT_PUBLIC_CATALOG_SOURCE === "fixtures" ? "fixtures" : "store";
}

export function isFixtureMode(): boolean {
  return catalogSource() === "fixtures";
}
