export interface Capability {
  title: string;
  body: string;
}

export interface ProductRoute {
  label: string;
  title: string;
  body: string;
  points: string[];
}

export interface MarketingContent {
  locale: string;
  languageName: string;
  seo: {
    title: string;
    description: string;
  };
  nav: {
    product: string;
    ios: string;
    selfHosted: string;
    privacy: string;
    docs: string;
    menu: string;
    language: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    lead: string;
    testflight: string;
    selfHosted: string;
  };
  routes: {
    eyebrow: string;
    heading: string;
    ios: ProductRoute;
    selfHosted: ProductRoute;
  };
  capabilities: {
    eyebrow: string;
    heading: string;
    items: Capability[];
  };
  showcase: {
    eyebrow: string;
    heading: string;
    temporary: string;
    mobileLibrary: string;
    mobileAdd: string;
    mobileDetail: string;
    desktopLibrary: string;
    desktopDetail: string;
  };
  trust: {
    eyebrow: string;
    heading: string;
    body: string;
    noTrackingTitle: string;
    noTrackingBody: string;
    controlTitle: string;
    controlBody: string;
  };
  comparison: {
    eyebrow: string;
    heading: string;
    route: string;
    bestFor: string;
    setup: string;
    iosBest: string;
    iosSetup: string;
    selfBest: string;
    selfSetup: string;
  };
  community: {
    eyebrow: string;
    heading: string;
    discord: string;
    issues: string;
    support: string;
    finalTitle: string;
  };
  footer: {
    tagline: string;
    source: string;
    legacy: string;
    privacy: string;
    terms: string;
    support: string;
  };
}
