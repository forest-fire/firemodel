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
        link: "/using/getting-started"
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
        {
          title: "Using",
          collapsable: false,
          children: ["getting-started", "reading", "writing", "listening"]
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
