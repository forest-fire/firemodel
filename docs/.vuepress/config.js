module.exports = {
  title: "FireModel",
  description: "Modeling, Access, and Mocking for Firebase Projects",
  head: [["link", { rel: "icon", href: "home.png" }]],
  serviceWorker: true,
  themeConfig: {
    editLinks: true,
    nav: [
      {
        text: "Model",
        link: "/modeling/"
      },
      {
        text: "Access",
        link: "/access/"
      },
      {
        text: "Mock",
        link: "/mocking/"
      }
    ],
    sidebar: {
      "/modeling/": [
        {
          title: "Modeling",
          collapsable: false,
          children: ["", "basics", "constraints"]
        }
      ],
      "/access/": [
        {
          title: "Model & Schema",
          collapsable: false,
          children: ["bedroom-blue", "bedroom-fp", "bedroom-garden", "den"]
        },
        {
          title: "Record",
          collapsable: false,
          children: ["bathroom-on-ground", "bathroom-on-first", "bathroom-den"]
        },
        {
          title: "List",
          collapsable: false,
          children: ["bathroom-on-ground", "bathroom-on-first", "bathroom-den"]
        },
        {
          title: "=========",
          collapsable: false,
          children: ["../faq/", "../nearby/"]
        }
      ],
      "/nearby/": [
        {
          title: "Kensal Green/Rise",
          collapsable: false,
          children: ["restaurants", "local-parks", "local-cinema"]
        },
        {
          title: "Greater London",
          collapsable: false,
          children: ["shopping", "parks", "cinema"]
        },
        {
          title: "=========",
          collapsable: false,
          children: ["../faq/", "../rooms/"]
        }
      ],
      "/welcome/": [
        {
          title: "Choose from the following:",
          collapsable: false,
          children: ["../faq/", "../rooms/", "../nearby/"]
        }
      ]
    }
  }
};
