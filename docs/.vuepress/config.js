module.exports = {
  plugins: {
    "@vuepress/pwa": {
      serviceWorker: true,
      updatePopup: {
        message: "New FireModel content is available",
        buttonText: "Refresh"
      }
    },
    "@vuepress/back-to-top": true,
    "@vuepress/last-updated": true,
    "@vuepress/medium-zoom": true
  },
  title: "FireModel",
  description: "Modeling, Access, and Mocking for Firebase Projects",
  head: [
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    ["meta", { name: "application-name", content: "FireModel" }],
    ["link", { rel: "favicon", href: "icon/icon-48.png" }],
    ["link", { rel: "icon", href: "icon/icon-225.png" }],
    ["link", { rel: "manifest", href: "manifest.json" }],
    [
      "link",
      { rel: "apple-touch-icon-precomposed", href: "icon/icon-192.png" }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_2048.png",
        sizes: "2048x2732"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1668.png",
        sizes: "1668x2224"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1536.png",
        sizes: "1536x2048"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1125.png",
        sizes: "1125x2436"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_1242.png",
        sizes: "1242x2208"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_750.png",
        sizes: "750x1334"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-startup-image",
        href: "icons/apple_splash_640.png",
        sizes: "640x1136"
      }
    ],

    ["link", { rel: "apple-touch-icon", href: "touch-icon-iphone" }],
    [
      "link",
      { rel: "apple-touch-icon", sizes: "152x152", href: "touch-icon-ipad" }
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "touch-icon-iphone-retina"
      }
    ],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "167x167",
        href: "touch-icon-ipad-retina"
      }
    ]
  ],
  // serviceWorker: true,
  themeConfig: {
    editLinks: true,
    nav: [
      {
        text: "Getting Started",
        link: "/getting-started/"
      },
      {
        text: "Modeling",
        link: "/modeling/"
      },
      {
        text: "Using",
        link: "/using/"
      },
      {
        text: "Mocking",
        link: "/mocking/"
      }
    ],
    sidebar: {
      "/getting-started/": [
        {
          title: "Getting Started",
          children: ["/getting-started/", "configuring"]
        }
      ],
      "/modeling/": [
        {
          title: "Modeling in FireModel",
          children: [
            "/modeling/",
            "first-model",
            "model-constraints",
            "property-constraints",
            "relationships",
            "security-constraints",
            "the-model-class"
          ]
        },
        {
          title: "📓 Other Sections",
          collapsable: false,
          children: [
            ["/using/", "Using FireModel"],
            ["/mocking/", "Mocking in FireModel"]
          ]
        }
      ],
      "/using/": [
        {
          title: "Using FireModel",
          collapsable: false,
          children: [
            "/using/",
            "reading",
            "writing",
            "relationships",
            "watching",
            "review-of-objects"
          ]
        },
        {
          title: "Advanced Topics",
          collapsable: false,
          children: [
            "frontend-state-mgmt",
            "dynamic-paths",
            "auditing",
            "graphql",
            "dexie",
            "proxy-objects"
          ]
        },
        {
          title: "📓 Other Sections",
          collapsable: false,
          children: [
            ["/modeling/", "Modeling in FireModel"],
            ["/mocking/", "Mocking in FireModel"]
          ]
        }
      ],
      "/mocking/": [
        {
          title: "Mocking",
          collapsable: false,
          children: [
            "/mocking/",
            "configure-mocking",
            "extending",
            "relationships"
          ]
        },
        {
          title: "📓 Other Sections",
          collapsable: false,
          children: [
            ["/modeling/", "Modeling in FireModel"],
            ["/using/", "Using FireModel"]
          ]
        }
      ]
    }
  }
};
