import { type HeadConfig, type TransformContext } from "vitepress"

// 处理每个页面的元数据
export function handleHeadMeta(context: TransformContext) {
  const { description, title, relativePath, frontmatter } = context.pageData

  const curDesc = description || context.description
  const cover = frontmatter.cover || "https://justin3go.com/bg.jpg"
  const cardType = frontmatter.cover ? "summary_large_image" : "summary"

  // 预加载字体
  const preloadHead: HeadConfig[] = handleFontsPreload(context)

  return [...twitterHead, ...preloadHead]
}

export function addBase(relativePath: string) {
  const host = "https://justin3go.com"
  if (relativePath.startsWith("/")) {
    return host + relativePath
  } else {
    return host + "/" + relativePath
  }
}

export function handleFontsPreload({ assets }: TransformContext) {
  // 只预加载正文字体，代码字体不预加载，因为可能不会使用或者很少使用
  const SourceHanSerifCN = assets.find(
    file => /SourceHanSerifCN-VF\.\w+\.woff2/
  )

  if (SourceHanSerifCN) {
    return [
      [
        "link",
        {
          rel: "preload",
          href: SourceHanSerifCN,
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ],
    ] as HeadConfig[]
  }

  return []
}
