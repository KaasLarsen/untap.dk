import {
  getBanner,
  partnerAdsClickUrl,
  partnerAdsImageUrl,
  type PartnerBanner as PartnerBannerDef,
} from "@/lib/partners";

type PartnerBannerProps = {
  bannerId?: string;
  banner?: PartnerBannerDef;
  className?: string;
  /** When set with mobileBanner*, show desktop above `sm` and mobile below */
  mobileBannerId?: string;
  mobileBanner?: PartnerBannerDef;
};

function BannerLink({
  banner,
  className = "",
}: {
  banner: PartnerBannerDef;
  className?: string;
}) {
  return (
    <a
      href={partnerAdsClickUrl(banner.bannerId)}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={`inline-block max-w-full ${className}`}
    >
      {/* Partner Ads tracking redirect — plain img, not next/image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={partnerAdsImageUrl(banner.bannerId)}
        width={banner.width}
        height={banner.height}
        alt={banner.alt}
        className="h-auto max-w-full"
        loading="lazy"
      />
    </a>
  );
}

export function PartnerBanner({
  bannerId,
  banner: bannerProp,
  className = "",
  mobileBannerId,
  mobileBanner: mobileBannerProp,
}: PartnerBannerProps) {
  const banner = bannerProp ?? (bannerId ? getBanner(bannerId) : null);
  if (!banner) {
    throw new Error("PartnerBanner requires banner or bannerId");
  }

  const mobile =
    mobileBannerProp ?? (mobileBannerId ? getBanner(mobileBannerId) : null);

  return (
    <aside
      className={`flex flex-col items-center gap-2 ${className}`}
      aria-label="Annonce"
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-parchment-muted/70">
        Annonce
      </p>
      {mobile ? (
        <>
          <BannerLink banner={mobile} className="sm:hidden" />
          <BannerLink banner={banner} className="hidden sm:inline-block" />
        </>
      ) : (
        <BannerLink banner={banner} />
      )}
    </aside>
  );
}
