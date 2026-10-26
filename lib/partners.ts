/** Partner Ads (partnerid 57858) — NextLevelGames + Kelz0r */

export const PARTNER_ADS_PARTNER_ID = 57858;

export type PartnerId = "nextlevelgames" | "kelzor";

export type Partner = {
  id: PartnerId;
  name: string;
  siteUrl: string;
  feed: {
    bannerId: number;
    feedId: number;
  };
};

export type BannerSize =
  | "160x600"
  | "300x250"
  | "300x600"
  | "320x160"
  | "728x90"
  | "930x180";

export type PartnerBanner = {
  id: string;
  partnerId: PartnerId;
  bannerId: number;
  width: number;
  height: number;
  size: BannerSize;
  /** Stored for later sidebar layouts; not used in current placements */
  active: boolean;
  alt: string;
};

export const partners: Record<PartnerId, Partner> = {
  nextlevelgames: {
    id: "nextlevelgames",
    name: "NextLevelGames.dk",
    siteUrl: "https://www.nextlevelgames.dk/",
    feed: { bannerId: 78189, feedId: 1826 },
  },
  kelzor: {
    id: "kelzor",
    name: "Kelz0r.dk",
    siteUrl: "https://www.kelz0r.dk/",
    feed: { bannerId: 94236, feedId: 2514 },
  },
};

export const partnerList: Partner[] = Object.values(partners);

export const banners: Record<string, PartnerBanner> = {
  // NextLevelGames — active placements
  nlg_728x90: {
    id: "nlg_728x90",
    partnerId: "nextlevelgames",
    bannerId: 78187,
    width: 728,
    height: 90,
    size: "728x90",
    active: true,
    alt: "NextLevelGames",
  },
  nlg_728x90_alt: {
    id: "nlg_728x90_alt",
    partnerId: "nextlevelgames",
    bannerId: 101888,
    width: 728,
    height: 90,
    size: "728x90",
    active: true,
    alt: "NextLevelGames",
  },
  nlg_300x250: {
    id: "nlg_300x250",
    partnerId: "nextlevelgames",
    bannerId: 101889,
    width: 300,
    height: 250,
    size: "300x250",
    active: true,
    alt: "NextLevelGames",
  },
  // NextLevelGames — reserved (sidebar / tall)
  nlg_160x600: {
    id: "nlg_160x600",
    partnerId: "nextlevelgames",
    bannerId: 78185,
    width: 160,
    height: 600,
    size: "160x600",
    active: false,
    alt: "NextLevelGames",
  },
  nlg_160x600_alt: {
    id: "nlg_160x600_alt",
    partnerId: "nextlevelgames",
    bannerId: 101885,
    width: 160,
    height: 600,
    size: "160x600",
    active: false,
    alt: "NextLevelGames",
  },
  nlg_300x600: {
    id: "nlg_300x600",
    partnerId: "nextlevelgames",
    bannerId: 101886,
    width: 300,
    height: 600,
    size: "300x600",
    active: false,
    alt: "NextLevelGames",
  },
  // Kelz0r — active placements
  kelzor_930x180: {
    id: "kelzor_930x180",
    partnerId: "kelzor",
    bannerId: 95333,
    width: 930,
    height: 180,
    size: "930x180",
    active: true,
    alt: "Kelz0r",
  },
  kelzor_320x160: {
    id: "kelzor_320x160",
    partnerId: "kelzor",
    bannerId: 95329,
    width: 320,
    height: 160,
    size: "320x160",
    active: true,
    alt: "Kelz0r",
  },
  kelzor_728x90: {
    id: "kelzor_728x90",
    partnerId: "kelzor",
    bannerId: 95335,
    width: 728,
    height: 90,
    size: "728x90",
    active: true,
    alt: "Kelz0r",
  },
  kelzor_300x250: {
    id: "kelzor_300x250",
    partnerId: "kelzor",
    bannerId: 95327,
    width: 300,
    height: 250,
    size: "300x250",
    active: true,
    alt: "Kelz0r",
  },
  kelzor_300x250_alt: {
    id: "kelzor_300x250_alt",
    partnerId: "kelzor",
    bannerId: 95328,
    width: 300,
    height: 250,
    size: "300x250",
    active: true,
    alt: "Kelz0r",
  },
  // Kelz0r — reserved (sidebar)
  kelzor_160x600: {
    id: "kelzor_160x600",
    partnerId: "kelzor",
    bannerId: 95336,
    width: 160,
    height: 600,
    size: "160x600",
    active: false,
    alt: "Kelz0r",
  },
  kelzor_160x600_alt: {
    id: "kelzor_160x600_alt",
    partnerId: "kelzor",
    bannerId: 95337,
    width: 160,
    height: 600,
    size: "160x600",
    active: false,
    alt: "Kelz0r",
  },
};

export type BannerSlot =
  | "homeBillboard"
  | "articleMedium"
  | "pageLeaderboard";

const articleMediumPool = ["nlg_300x250", "kelzor_300x250"] as const;
const pageLeaderboardPool = ["nlg_728x90", "kelzor_728x90"] as const;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function partnerAdsClickUrl(bannerId: number): string {
  return `https://www.partner-ads.com/dk/klikbanner.php?partnerid=${PARTNER_ADS_PARTNER_ID}&bannerid=${bannerId}`;
}

export function partnerAdsImageUrl(bannerId: number): string {
  return `https://www.partner-ads.com/dk/visbanner.php?partnerid=${PARTNER_ADS_PARTNER_ID}&bannerid=${bannerId}`;
}

export function partnerFeedUrl(partnerId: PartnerId): string {
  const { feed } = partners[partnerId];
  return `https://www.partner-ads.com/dk/feed_udlaes.php?partnerid=${PARTNER_ADS_PARTNER_ID}&bannerid=${feed.bannerId}&feedid=${feed.feedId}`;
}

export function getBanner(id: string): PartnerBanner {
  const banner = banners[id];
  if (!banner) {
    throw new Error(`Unknown partner banner: ${id}`);
  }
  return banner;
}

/** Home: Kelz0r billboard (desktop) + mobile fallback sizes */
export function getHomeBillboard(): {
  desktop: PartnerBanner;
  mobile: PartnerBanner;
} {
  return {
    desktop: getBanner("kelzor_930x180"),
    mobile: getBanner("kelzor_320x160"),
  };
}

/** Article end: rotate NLG / Kelz0r 300x250 by slug */
export function getArticleMediumBanner(slug: string): PartnerBanner {
  const index = hashSeed(slug) % articleMediumPool.length;
  return getBanner(articleMediumPool[index]);
}

/** Deck hub / Marked: rotate 728x90 by route key */
export function getPageLeaderboardBanner(routeKey: string): PartnerBanner {
  const index = hashSeed(routeKey) % pageLeaderboardPool.length;
  return getBanner(pageLeaderboardPool[index]);
}
