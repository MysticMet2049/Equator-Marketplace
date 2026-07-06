import FooterBrand from "./footer/FooterBrand";
import FooterLinks from "./footer/FooterLinks";
import { FOOTER_LINKS } from "./footer/footerLinksData";

/** Global Equator footer shared by all pages. */
export default function Footer() {
  return (
    <footer
      data-testid="global-footer"
      className="mt-0"
      style={{ background: "linear-gradient(135deg, #1f6f4a 0%, #145437 100%)", color: "white" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-14">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <FooterBrand />

          <div className="w-full lg:w-auto lg:min-w-[430px]">
            <FooterLinks title="Navigation" links={FOOTER_LINKS} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs md:text-sm" style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-body)" }}>
            © 2026 EQUATOR DIGITAL MARKETPLACE. ALL RIGHTS RESERVED.
          </p>

          <p
            className="text-xs md:text-sm tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-body)" }}
          >
            EQUATOR · YATA EXPERTS
          </p>
        </div>
      </div>
    </footer>
  );
}
