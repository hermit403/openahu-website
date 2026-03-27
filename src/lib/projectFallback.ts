import type { CollectionEntry } from "astro:content";

export const ahutongFallbackProject = {
  id: "ahutong",
  collection: "projects",
  data: {
    title: "安大通",
    slug: "ahutong",
    desc: "安大通是一个立足于安徽大学，由安徽大学学生自主开发的集校园一卡通、电子课表、成绩查询、考试查询等实用功能于一体的App",
    downloadUrl: "",
    screenshots: ["/images/projects/ahutong/preview.png"],
    techstack: ["Kotlin", "Java", "Rust"],
    links: [
      {
        name: "GitHub",
        url: "https://github.com/OpenAHU/AHUTong",
      },
    ],
  },
} as CollectionEntry<"projects">;

export const ahutongFallbackBodyHtml = `
  <p>安大通是一款专为安徽大学师生设计的校园生活服务应用。它集成了校园卡服务、教务系统查询（课表、成绩、考试）、生活缴费等功能。项目采用现代化的 Android 技术栈开发。</p>
  <h2>Changelogs</h2>
  <h3>v3.0.9</h3>
  <ol>
    <li>合并pr，新增滑动切换周课表</li>
    <li>新增实验性岛卡提醒</li>
    <li>新增首页时间与余额自动刷新</li>
    <li>更新电话本部分号码</li>
    <li>修复部分页面异常显示</li>
    <li>修复一些 bug, 并成功引入了新的 bug</li>
    <li>清理部分冗余代码</li>
  </ol>
  <h3>v3.0.8</h3>
  <ol>
    <li>新增了一些功能</li>
    <li>优化了课表响应速度</li>
    <li>修复了一些小组件的bug</li>
    <li>修复了一些更新的bug</li>
    <li>修复了一些 bug, 并成功引入了新的 bug</li>
    <li>合并pr, 增加了自动删除更新包的功能</li>
  </ol>
  <h3>v3.0.7</h3>
  <ol>
    <li>修复了上个版本遗留的一些bug，如：充值问题，考场查询问题，课表问题等，详见commits</li>
    <li>更新了免责声明</li>
    <li>完成了热更新，将爬虫类接口使用rust进行了重写，并实现了动态下发.so文件以实现热更新</li>
  </ol>
  <h3>v3.0.6</h3>
  <ol>
    <li>重构自适应课表桌面小组件</li>
    <li>修复桌面小组件显示与刷新问题</li>
    <li>优化更新安装链路：处理 APK 更新标记与清理逻辑，增强更新处理稳定性</li>
    <li>清理部分冗余代码</li>
  </ol>
  <h3>v3.0.5</h3>
  <ol>
    <li>回滚到更稳定的数据接口路径，暂避不稳定 Rust 路径导致的问题</li>
    <li>新增了拒绝更新</li>
    <li>优化了下载体验</li>
    <li>修复了课表与小组件相关问题：默认课表数据源、首页今日课程名、Schedule 小组件等</li>
    <li>更新混淆规则并移除未使用 so，提升稳定性</li>
    <li>新增校历文件缓存，减少重复下载</li>
  </ol>
  <h3>v3.0.4</h3>
  <ol>
    <li>修复了多项核心功能异常</li>
    <li>重构更新与安装流程</li>
    <li>新增独立校历页面与保存流程</li>
    <li>调整底部导航与多个页面交互逻辑</li>
    <li>修复若干使用体验问题</li>
  </ol>
  <h3>v3.0.3</h3>
  <ol>
    <li>优化考试信息展示与排序逻辑</li>
    <li>修复若干使用体验问题</li>
  </ol>
  <h3>v3.0.2</h3>
  <ol>
    <li>修复首页余额显示异常</li>
    <li>引入本地 HTTP 客户端，保留 JNI 回退，增强稳定性</li>
    <li>优化成绩/课表/考试/登录与 Cookie 同步链路，增强异常处理</li>
    <li>优化电费充值相关体验及部分页面交互细节</li>
  </ol>
  <h3>v3.0.1</h3>
  <ol>
    <li>将服务器迁移至带宽更高、稳定性更强的新服务器</li>
    <li>全面将 HTTP 升级为 HTTPS，使用ED25519对动态下发的文件进行签名，防止中间人攻击，提升数据传输安全性</li>
    <li>更新校历查看逻辑，支持先预览后自主选择是否下载</li>
    <li>修改 allowBackup="false"，提高安全性</li>
    <li>修改课表教室名称对应 mmap</li>
    <li>增加电话本搜索功能</li>
    <li>充值改为数字键盘</li>
    <li>添加意见反馈功能</li>
    <li>增加app内请求更新功能，一次下载，终身使用，再也不用手动更新了</li>
  </ol>
  <p>p.s. 意见交流，bug反馈等问题欢迎加 qq 群讨论：1006203134</p>
`.trim();
