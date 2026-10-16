// Stable update API verified on 2026-10-16: 3.4.2 / 304003.
export const androidReleases = [
  {
    version: "3.4.2",
    date: "2026-10-15",
    summary: "学期浏览、账号切换与体验通道",
    source:
      "https://github.com/OpenAHU/AHUTong-Android/compare/be8e507d7123c9bf3d189a18d327669c5cd60b4b...e6829e89f00242ae0b5575afa78861c9ccbde78d",
    changes: [
      "支持浏览不同学期课表，增加课程冲突提示并优化重叠课程展示。",
      "新增已保存账号切换，切换后重新建立首页与校园卡状态，避免沿用上一账号的数据。",
      "新增内测邀请及加入、暂缓、退出操作，区分稳定版与预览版更新。",
      "修复桌面课表组件在系统组件选择器中不可见的问题。",
      "修复通知缓存与更新候选选择问题，恢复登录页和付款码页面截图。",
    ],
  },
  {
    version: "3.4.1",
    date: "2026-10-09",
    summary: "更多校园工具，更稳的日常使用",
    source:
      "https://github.com/OpenAHU/AHUTong-Android/compare/acd85a02ca5b013e0dc0fee847b01b5a3e23eddf...be8e507d7123c9bf3d189a18d327669c5cd60b4b",
    changes: [
      "新增校园公告、学生邮箱、培养方案工具，以及插件安装与管理能力。",
      "接入研究生登录与课表，支持研究生桌面课表组件。",
      "增加节假日与调休提示，离线保留已有提示；完善课程提醒与倒计时。",
      "学习通作业支持跳转官方应用，优化学习通登录页面稳定性。",
      "优化自定义背景、玻璃效果性能与设置开关点按体验。",
      "修复弱网下付款码访问、换号隐私清理及发布版公告缓存崩溃。",
    ],
  },
  {
    version: "3.4.0",
    date: "2026-09-23",
    summary: "校园卡账单与自定义主页背景",
    source:
      "https://github.com/OpenAHU/AHUTong-Android/blob/acd85a02ca5b013e0dc0fee847b01b5a3e23eddf/docs/changelog-v3.4.0.md",
    changes: [
      "新增校园卡交易流水、收支筛选与消费统计。",
      "支持相册图片作为主页背景，调整明暗遮罩并从背景提取主题色。",
      "首页天气收为胶囊入口，今日课程结束后可预告明日课程。",
      "整合外观设置，优化课程卡片与多页面显示。",
      "完善隐私政策全文阅读、会话失败恢复与跨天课程刷新。",
    ],
  },
  {
    version: "3.3.0",
    date: "2026-09-06",
    summary: "主题、学习通与生活缴费",
    source:
      "https://github.com/OpenAHU/AHUTong-Android/blob/044ef83605f9db86fd9d2ea90a77cc587235c54a/CHANGELOG.md",
    changes: [
      "新增 miuix 与 RadiantUI 主题。",
      "新增学习通日历与课程页面。",
      "新增电控缴费 A、B，统一招商银行校园卡充值逻辑。",
      "调整部分二级页面排版，优化操作体验。",
    ],
  },
];

export const iosPreview = {
  version: "1.0.0",
  date: "2026-10-14",
  source: "https://github.com/OpenAHU/AHUTong-iOS/pull/3",
  changes: [
    "弱网冷启动先进入页面，后台继续校验会话。",
    "首页优先预取付款二维码，再刷新余额；付款码显示不再等待慢余额请求。",
    "修复教学周解析与课表顶部日期，统一校园时区和周一换周计算。",
    "保留有效离线周数，防止退出登录及切换学期后的旧请求覆盖新状态。",
  ],
};
