module.exports = {
  title: "FireModel",
  description: "Modeling, Access, and Mocking for Firebase Projects",
  head: [["link", { rel: "icon", href: "icon/icon-32.png" }]],
  serviceWorker: true,
  themeConfig: {
    editLinks: true,
    nav: [
      {
        text: "Modeling",
        link: "/modeling/concepts"
      },
      {
        text: "Using",
        link: "/using/"
      },
      {
        text: "Mocking",
        link: "/mocking/overview"
      }
    ],
    sidebar: {
      "/modeling/": [
        {
          title: "Modeling",
          collapsable: false,
          children: ["concepts", "properties", "constraints", "relationships"]
        }
      ],
      "/using/": [
        ["/using/", "Getting Started"],
        {
          title: "Using",
          collapsable: false,
          children: ["reading", "writing", "listening"]
        },
        {
          title: "Advanced Topics",
          collapsable: false,
          children: ["auditing", "frontend-state-mgmt"]
        }
      ],
      "/mocking/": [
        {
          title: "Mocking",
          collapsable: false,
          children: ["overview", "queuing", "execution"]
        }
      ]
    }
  }
};
