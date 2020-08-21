module.exports = {
  plugins: {
    "@vuepress/pwa": {
      serviceWorker: true,
      updatePopup: {
        message: "New Firemodel content is available",
        buttonText: "Refresh",
      },
    },
    // mermaid: true,
    "@vuepress/back-to-top": true,
    "@vuepress/last-updated": true,
    "@vuepress/medium-zoom": true,
    autometa: {
      site: {
        name: "Firemodel",
      },
      canonical_base: "https://firemodel.info",
      author: {
        name: "Ken Snyder",
        twitter: "yankeeinlondon",
      },
    },
  },
  title: "Firemodel",
  description: "Modeling, Access, and Mocking for Firebase Projects",
  head: [
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    ["meta", { name: "application-name", content: "FireModel" }],
    [
      "link",
      {
        rel: "favicon",
        href: "/icons/icon-16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    [
      "link",
      {
        rel: "favicon",
        href: "/icons/icon-32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    [
      "link",
      {
        rel: "favicon",
        href: "/icons/icon-48.png",
        type: "image/png",
        sizes: "48x48",
      },
    ],
    [
      "link",
      { rel: "icon", href: "/icons/icon-rounded-32.png", sizes: "32x32" },
    ],
    [
      "link",
      { rel: "icon", href: "/icons/icon-rounded-48.png", sizes: "48x48" },
    ],
    [
      "link",
      { rel: "icon", href: "/icons/icon-rounded-192.png", sizes: "192x192" },
    ],
    [
      "link",
      { rel: "icon", href: "/icons/icon-rounded-225.png", sizes: "225x225" },
    ],
    [
      "link",
      { rel: "icon", href: "/icons/icon-rounded-512.png", sizes: "512x512" },
    ],
    ["link", { rel: "manifest", href: "/manifest.json" }],
    [
      "link",
      {
        rel: "apple-touch-icon-precomposed",
        href: "/icons/icon-rounded-192.png",
        sizes: "192x192",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_2048.png",
        sizes: "2048x2732",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1668.png",
        sizes: "1668x2224",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1536.png",
        sizes: "1536x2048",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1125.png",
        sizes: "1125x2436",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1242.png",
        sizes: "1242x2208",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_750.png",
        sizes: "750x1334",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_640.png",
        sizes: "640x1136",
      },
    ],

    [
      "link",
      { rel: "apple-touch-icon", href: "touch-icon-iphone", sizes: "120x120" },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "152x152",
        href: "/icons/touch-icon-ipad",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "touch-icon-iphone-retina",
      },
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "167x167",
        href: "/icons/touch-icon-ipad-retina",
      },
    ],
  ],
  // markdown: {
  //   config: md => {
  //     // md.set({ breaks: false });
  //     md.use(require("./plugins/mermaid"));
  //   }
  // },
  themeConfig: {
    editLinks: true,
    serviceWorker: {
      updatePopup: true,
    },
    nav: [
      {
        text: "Getting Started",
        link: "/getting-started/",
      },
      {
        text: "Modeling",
        link: "/modeling/",
      },
      {
        text: "Using",
        link: "/using/",
      },
      {
        text: "Testing",
        link: "/testing/",
      },
    ],
    sidebar: {
      "/getting-started/": [
        {
          title: "Getting Started",
          children: ["/getting-started/", "configuring"],
        },
      ],
      "/modeling/": [
        {
          title: "Modeling in Firemodel",
          children: [
            "/modeling/",
            "the-model-class",
            "first-model",
            "model-constraints",
            "property-constraints",
            "dynamic-paths",
            "relationships",
            "permissions-and-indexes",
          ],
        },
        {
          title: "📓 Other Sections",
          collapsable: false,
          children: [
            ["/using/", "Using Firemodel"],
            ["/mocking/", "Mocking in Firemodel"],
          ],
        },
      ],
      "/using/": [
        {
          title: "Using Firemodel",
          collapsable: false,
          children: [
            "/using/",
            "reading",
            "writing",
            "relationships",
            "watching",
            "dispatch-and-events",
            "review-of-objects",
          ],
        },
        {
          title: "Advanced Topics",
          collapsable: false,
          children: [
            "frontend-state-mgmt",
            "dynamic-paths",
            "auditing",
            "dexie",
            "graphql",
          ],
        },
        {
          title: "📓 Other Sections",
          collapsable: false,
          children: [
            ["/modeling/", "Modeling in Firemodel"],
            ["/mocking/", "Mocking in Firemodel"],
          ],
        },
      ],
      "/mocking/": [
        {
          title: "Mocking",
          collapsable: false,
          children: [
            "/mocking/",
            "configure-mocking",
            "extending",
            "relationships",
            "auth-mocking",
          ],
        },
        {
          title: "📓 Other Sections",
          collapsable: false,
          children: [
            ["/modeling/", "Modeling in Firemodel"],
            ["/using/", "Using Firemodel"],
          ],
        },
      ],
    },
  },
};
