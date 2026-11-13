import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    env[key] = val;
  }
}

const API_URL = env.NEXT_PUBLIC_COMMERCE_API_URL || 'https://store-api.brihot.com/api/v1';
const STORE_SLUG = env.NEXT_PUBLIC_COMMERCE_STORE || 'plant-world-bd';
const MERCHANT_KEY = env.COMMERCE_MERCHANT_KEY;

if (!MERCHANT_KEY) {
  console.error('Missing COMMERCE_MERCHANT_KEY in .env.local');
  process.exit(1);
}

// 1. Fetch store profile to get organizationId
console.log(`Connecting to ${API_URL} for store: ${STORE_SLUG}...`);
const profileRes = await fetch(`${API_URL}/stores/${STORE_SLUG}`);
if (!profileRes.ok) {
  throw new Error(`Failed to load store profile: ${profileRes.status} ${await profileRes.text()}`);
}
const profile = await profileRes.json();
const ORG_ID = profile.organizationId;
console.log(`Found Store: "${profile.name}" (Org: ${ORG_ID}, Currency: ${profile.currency})`);

const headers = {
  'Authorization': `ApiKey ${MERCHANT_KEY}`,
  'x-organization-id': ORG_ID,
  'Content-Type': 'application/json'
};

// Load sample menu
const sampleMenuPath = path.resolve(__dirname, '../src/lib/commerce/fixtures/sample-menu.json');
const sampleMenu = JSON.parse(fs.readFileSync(sampleMenuPath, 'utf8'));

// Helper for API calls
async function api(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

console.log('\n--- 1. Syncing Categories ---');
const existingCatsRes = await api('/categories');
const existingCats = existingCatsRes.ok && Array.isArray(existingCatsRes.data?.data) ? existingCatsRes.data.data : [];
const existingCatMap = new Map(existingCats.map(c => [c.slug, c._id]));

for (const cat of sampleMenu.categories) {
  const payload = {
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    displayOrder: cat.displayOrder ?? 0,
    isActive: true
  };

  if (existingCatMap.has(cat.slug)) {
    const id = existingCatMap.get(cat.slug);
    const updateRes = await api(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    console.log(`  Updated category: ${cat.name} (${cat.slug}) -> ${updateRes.status}`);
  } else {
    const createRes = await api('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    console.log(`  Created category: ${cat.name} (${cat.slug}) -> ${createRes.status}`);
  }
}

console.log('\n--- 2. Syncing Collections ---');
const existingColsRes = await api('/collections');
const existingCols = existingColsRes.ok && Array.isArray(existingColsRes.data?.data) ? existingColsRes.data.data : [];
const existingColMap = new Map(existingCols.map(c => [c.slug, c._id]));

for (const col of sampleMenu.collections) {
  const payload = {
    name: col.name,
    slug: col.slug,
    featured: col.featured ?? false,
    displayOrder: col.displayOrder ?? 0,
    isActive: true
  };

  if (existingColMap.has(col.slug)) {
    const id = existingColMap.get(col.slug);
    const updateRes = await api(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    console.log(`  Updated collection: ${col.name} (${col.slug}) -> ${updateRes.status}`);
  } else {
    const createRes = await api('/collections', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    console.log(`  Created collection: ${col.name} (${col.slug}) -> ${createRes.status}`);
  }
}

console.log('\n--- 3. Syncing Products ---');
const existingProdsRes = await api('/products?limit=100');
const existingProds = existingProdsRes.ok && Array.isArray(existingProdsRes.data?.data) ? existingProdsRes.data.data : [];
const existingProdMap = new Map(existingProds.map(p => [p.slug, p._id]));

for (const prod of sampleMenu.products) {
  const basePriceMinor = Math.round(prod.priceBdt * 100);
  const compareAtMinor = prod.compareAtBdt ? Math.round(prod.compareAtBdt * 100) : undefined;

  const images = (prod.images || []).map((img, idx) => ({
    url: img.src,
    alt: img.alt || prod.name,
    order: idx,
    isFeatured: idx === 0
  }));

  const pricing = {
    basePrice: {
      amount: basePriceMinor,
      currency: 'BDT'
    },
    currency: 'BDT',
    ...(compareAtMinor ? { compareAtPrice: { amount: compareAtMinor, currency: 'BDT' } } : {})
  };

  let variationAttributes = undefined;
  let variants = undefined;

  if (Array.isArray(prod.options) && prod.options.length > 0) {
    variationAttributes = prod.options.map(opt => ({
      code: opt.code,
      name: opt.name,
      values: opt.values.map(val => ({
        code: val.code,
        label: val.label
      }))
    }));

    // If single option group (e.g. size or spice)
    if (prod.options.length === 1) {
      const opt = prod.options[0];
      variants = opt.values.map(val => ({
        sku: `${prod.slug.toUpperCase()}-${val.code.toUpperCase()}`.slice(0, 32),
        attributes: { [opt.code]: val.code },
        priceModifier: Math.round((val.priceDeltaBdt || 0) * 100),
        isActive: true
      }));
    }
  }

  const payload = {
    name: prod.name,
    slug: prod.slug,
    description: prod.description || '',
    productType: 'physical',
    status: 'active',
    categorySlug: prod.category,
    collections: prod.collections || [],
    tags: prod.tags || [],
    images,
    defaultMonetization: {
      type: 'one_time',
      pricing
    },
    ...(variationAttributes ? { variationAttributes } : {}),
    ...(variants ? { variants } : {})
  };

  if (existingProdMap.has(prod.slug)) {
    const id = existingProdMap.get(prod.slug);
    const updateRes = await api(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    console.log(`  Updated product: ${prod.name} (${prod.slug}) -> ${updateRes.status}`);
  } else {
    const createRes = await api('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    console.log(`  Created product: ${prod.name} (${prod.slug}) -> ${createRes.status}`);
  }
}

console.log('\n--- Catalog Seed Complete! ---');
