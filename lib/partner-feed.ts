import {
  partnerFeedUrl,
  type PartnerId,
  partners,
} from "@/lib/partners";

export type PartnerFeedProduct = {
  partnerId: PartnerId;
  merchant: string;
  category: string;
  brand: string;
  name: string;
  productId: string;
  ean: string;
  description: string;
  price: number | null;
  oldPrice: number | null;
  shipping: number | null;
  inStock: boolean | null;
  deliveryTime: string;
  imageUrl: string;
  /** Tracked Partner Ads click URL */
  productUrl: string;
};

function tagValue(block: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = block.match(re);
  if (!match) return "";
  return decodeXmlEntities(match[1].trim());
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) =>
      String.fromCharCode(Number.parseInt(n, 10)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) =>
      String.fromCharCode(Number.parseInt(n, 16)),
    );
}

function parsePrice(raw: string): number | null {
  if (!raw) return null;
  const normalized = raw.replace(",", ".").replace(/[^\d.-]/g, "");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseStock(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (
    v === "yes" ||
    v === "in stock" ||
    v === "på lager" ||
    v === "pa lager" ||
    v === "1" ||
    v === "true"
  ) {
    return true;
  }
  if (
    v === "no" ||
    v === "out of stock" ||
    v === "ikke på lager" ||
    v === "ikke pa lager" ||
    v === "0" ||
    v === "false"
  ) {
    return false;
  }
  const asNum = Number.parseInt(v, 10);
  if (Number.isFinite(asNum)) return asNum > 0;
  return null;
}

function parseProduktBlock(
  block: string,
  partnerId: PartnerId,
): PartnerFeedProduct | null {
  const name = tagValue(block, "produktnavn");
  const productUrl = tagValue(block, "vareurl");
  if (!name || !productUrl) return null;

  return {
    partnerId,
    merchant: tagValue(block, "forhandler"),
    category: tagValue(block, "kategorinavn"),
    brand: tagValue(block, "brand"),
    name,
    productId: tagValue(block, "produktid"),
    ean: tagValue(block, "ean"),
    description: tagValue(block, "beskrivelse"),
    price: parsePrice(tagValue(block, "nypris")),
    oldPrice: parsePrice(tagValue(block, "glpris")),
    shipping: parsePrice(tagValue(block, "fragtomk")),
    inStock: parseStock(tagValue(block, "lagerantal")),
    deliveryTime: tagValue(block, "leveringstid"),
    imageUrl: tagValue(block, "billedurl"),
    productUrl,
  };
}

/** Parse Partner Ads product feed XML into typed products. */
export function parsePartnerFeedXml(
  xml: string,
  partnerId: PartnerId,
): PartnerFeedProduct[] {
  const products: PartnerFeedProduct[] = [];
  const re = /<produkt>([\s\S]*?)<\/produkt>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const product = parseProduktBlock(match[1], partnerId);
    if (product) products.push(product);
  }
  return products;
}

export type FetchPartnerFeedOptions = {
  /** Abort / timeout signal */
  signal?: AbortSignal;
  /** Skip out-of-stock when stock is known */
  inStockOnly?: boolean;
  limit?: number;
};

/** Fetch and parse a partner product feed. Ready for article widgets later. */
export async function fetchPartnerFeed(
  partnerId: PartnerId,
  options: FetchPartnerFeedOptions = {},
): Promise<PartnerFeedProduct[]> {
  if (!partners[partnerId]) {
    throw new Error(`Unknown partner: ${partnerId}`);
  }

  const res = await fetch(partnerFeedUrl(partnerId), {
    signal: options.signal,
    // Feeds change often; callers can override via Next cache options if needed
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(
      `Partner feed ${partnerId} failed: ${res.status} ${res.statusText}`,
    );
  }

  const buffer = await res.arrayBuffer();
  // Partner Ads feeds are typically iso-8859-1
  const xml = new TextDecoder("iso-8859-1").decode(buffer);
  let products = parsePartnerFeedXml(xml, partnerId);

  if (options.inStockOnly) {
    products = products.filter((p) => p.inStock !== false);
  }
  if (typeof options.limit === "number" && options.limit >= 0) {
    products = products.slice(0, options.limit);
  }

  return products;
}
