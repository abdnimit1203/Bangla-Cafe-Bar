import { cacheLife } from "next/cache";
import type {
  StorefrontCategory,
  StorefrontProduct,
  StorefrontProductPage,
  StorefrontProfile,
} from "@classytic/commerce-client/types";
import { createContentClient } from "@classytic/commerce-client/content";
import type { PublishedContent, StorefrontPageContent } from "@classytic/commerce-client/content";
import { isFixtureMode } from "@/lib/commerce/catalog-source";
import { getStorefrontClient } from "@/lib/commerce/client";
import { isNotFound } from "@/lib/commerce/errors";
import { previewCatalog } from "@/lib/commerce/fixtures/preview-catalog";
import { getStoreConnection } from "@/lib/config/store";
import { restaurantConfig } from "@/lib/config/restaurant";

/**
 * Server-side catalog loaders.
 *
 * Source is either the live Brihot store or, in preview mode, the labelled
 * local fixtures (never the test-shoe demo store). Every live loader is a
 * cached function (Cache Components); prices and stock shown are
 * informational and re-validated by the server at checkout.
 */

export interface MenuQuery {
  category?: string;
  q?: string;
  limit?: number;
  after?: string;
}

export async function loadStoreProfile(): Promise<StorefrontProfile> {
  "use cache";
  cacheLife("hours");
  return getStorefrontClient().profile();
}

export async function loadCategories(): Promise<StorefrontCategory[]> {
  if (isFixtureMode()) return previewCatalog.categories();
  return loadLiveCategories();
}

async function loadLiveCategories(): Promise<StorefrontCategory[]> {
  "use cache";
  cacheLife("minutes");
  const categories = await getStorefrontClient().categories();
  return [...categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function loadMenuPage(query: MenuQuery): Promise<StorefrontProductPage> {
  if (isFixtureMode()) return previewCatalog.products(query);
  return loadLiveMenuPage(query);
}

async function loadLiveMenuPage(query: MenuQuery): Promise<StorefrontProductPage> {
  "use cache";
  cacheLife("minutes");
  const q = query.q?.trim().slice(0, 100);
  return getStorefrontClient().products({
    limit: query.limit ?? restaurantConfig.catalog.menuPageSize,
    ...(query.category ? { category: query.category } : {}),
    ...(q ? { q } : {}),
    ...(query.after ? { after: query.after } : {}),
  });
}

export async function loadProduct(slug: string): Promise<StorefrontProduct | null> {
  if (isFixtureMode()) return previewCatalog.product(slug);
  return loadLiveProduct(slug);
}

async function loadLiveProduct(slug: string): Promise<StorefrontProduct | null> {
  "use cache";
  cacheLife("minutes");
  try {
    return await getStorefrontClient().product(slug);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** Products in a managed collection; an unknown/hidden collection yields an empty list. */
export async function loadCollectionProducts(collection: string, limit = 8): Promise<StorefrontProduct[]> {
  if (isFixtureMode()) return previewCatalog.collection(collection, limit);
  return loadLiveCollectionProducts(collection, limit);
}

async function loadLiveCollectionProducts(collection: string, limit: number): Promise<StorefrontProduct[]> {
  "use cache";
  cacheLife("minutes");
  try {
    const page = await getStorefrontClient().products({ collection, limit });
    return page.data;
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
}

export async function loadSpecialOffers(limit = 8): Promise<StorefrontProduct[]> {
  if (isFixtureMode()) return previewCatalog.onSale(limit);
  return loadLiveSpecialOffers(limit);
}

async function loadLiveSpecialOffers(limit: number): Promise<StorefrontProduct[]> {
  "use cache";
  cacheLife("minutes");
  const page = await getStorefrontClient().products({ onSale: true, limit });
  return page.data;
}

export async function loadNewest(limit = 8): Promise<StorefrontProduct[]> {
  if (isFixtureMode()) return previewCatalog.newest(limit);
  return loadLiveNewest(limit);
}

async function loadLiveNewest(limit: number): Promise<StorefrontProduct[]> {
  "use cache";
  cacheLife("minutes");
  const page = await getStorefrontClient().products({ sort: "newest", limit });
  return page.data;
}

/** Published CMS home page, or null when the store has not published one (or in preview mode). */
export async function loadHomeContent(): Promise<PublishedContent<StorefrontPageContent> | null> {
  if (isFixtureMode()) return null;
  return loadLiveHomeContent();
}

async function loadLiveHomeContent(): Promise<PublishedContent<StorefrontPageContent> | null> {
  "use cache";
  cacheLife("minutes");
  const content = createContentClient(getStoreConnection());
  try {
    return await content.page("home", { cache: "no-store" });
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}
