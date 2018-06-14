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
          title: "Modeling in FireModel",
          children: [
            "/modeling/",
            "first-model",
            "model-constraints",
            "property-constraints",
            "relationships",
            "the-model-class"
          ]
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
        {
          title: "Using FireModel",
          collapsable: true,
          children: ["/using/", "reading", "writing", "watching"]
        },
        {
          title: "Advanced Topics",
          collapsable: true,
          children: ["auditing", "frontend-state-mgmt", "graphql", "proxy-objects"]
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
        {
          title: "Mocking",
          collapsable: false,
          children: ["/mocking/", "configure-mocking", "extending", "relationships"]
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
