import { type DefaultTheme, defineConfig } from "vitepress"

import { createSideBarZH } from "../theme/utils/createSideBar"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "八阿哥的1024",
  description: "",
  lang: "zh-Hans", //语言

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "博客", link: "/" },
      { text: "归档", link: "/archive", activeMatch: "/archive" },
      {
        text: "蜂舟平台",
        items: [
          { text: "Bugs", link: "/bugs", activeMatch: "/bugs" },
          { text: "技巧", link: "/skills", activeMatch: "/skills" },
        ],
      },
      { text: "笔记", link: "/notes/", activeMatch: "/notes/" },
      { text: "工具", link: "/tools", activeMatch: "/tools" },
    ],
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    outlineTitle: "当前页面",
    lastUpdatedText: "最近更新时间",

    sidebar: createSideBarZH(),

    logo: "/logo.png",

    socialLinks: [
      { icon: "github", link: "https://github.com/yuuuuuyu" },
      { icon: "github", link: "https://github.com/yuuuuuyu" },
    ],

    editLink: {
      pattern:
        "https://github.com/Justin3go/justin3go.com/edit/master/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "目录",
    darkModeSwitchLabel: "深色模式",
  },
})

export const search: DefaultTheme.AlgoliaSearchOptions["locales"] = {
  root: {
    placeholder: "搜索文档",
    translations: {
      button: {
        buttonText: "搜索文档",
        buttonAriaLabel: "搜索文档",
      },
      modal: {
        searchBox: {
          resetButtonTitle: "清除查询条件",
          resetButtonAriaLabel: "清除查询条件",
          cancelButtonText: "取消",
          cancelButtonAriaLabel: "取消",
        },
        startScreen: {
          recentSearchesTitle: "搜索历史",
          noRecentSearchesText: "没有搜索历史",
          saveRecentSearchButtonTitle: "保存至搜索历史",
          removeRecentSearchButtonTitle: "从搜索历史中移除",
          favoriteSearchesTitle: "收藏",
          removeFavoriteSearchButtonTitle: "从收藏中移除",
        },
        errorScreen: {
          titleText: "无法获取结果",
          helpText: "你可能需要检查你的网络连接",
        },
        footer: {
          selectText: "选择",
          navigateText: "切换",
          closeText: "关闭",
          searchByText: "搜索提供者",
        },
        noResultsScreen: {
          noResultsText: "无法找到相关结果",
          suggestedQueryText: "你可以尝试查询",
          reportMissingResultsText: "你认为该查询应该有结果？",
          reportMissingResultsLinkText: "点击反馈",
        },
      },
    },
  },
}

