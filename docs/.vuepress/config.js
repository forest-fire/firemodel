module.exports = {
  title: "FireModel",
  description: "Modeling, Access, and Mocking for Firebase Projects",
  head: [["link", { rel: "icon", href: "icon/icon-32.png" }]],
  serviceWorker: true,
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
          title: "Modeling Basics",
          children: ["/modeling/", "schemas", "model-class", "firebase-schemas"]
        },
        {
          title: "Functional Primitives",
          collapsable: false,
          children: ["properties", "constraints", "relationships"]
        },
        {
          title: "Other DOC Sections",
          collapsable: false,
          children: [
            ["/using/", "Using FireModel"],
            ["/mocking/", "Mocking in FireModel"]
          ]
        }
      ],
      "/using/": [
        ["/using/", "Getting Started"],
        {
          title: "Using FireModel",
          collapsable: false,
          children: ["reading", "writing", "listening"]
        },
        {
          title: "Advanced Topics",
          collapsable: false,
          children: ["auditing", "frontend-state-mgmt", "graphql"]
        },
        {
          title: "Other DOC Sections",
          collapsable: false,
          children: [
            ["/modeling/", "Modeling in FireModel"],
            ["/mocking/", "Mocking in FireModel"]
          ]
        }
      ],
      "/mocking/": [
        ["/mocking/", "Overview and Scope"],
        {
          title: "Mocking",
          collapsable: false,
          children: ["configure-mocking", "queuing"]
        },
        {
          title: "Other Sections",
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
