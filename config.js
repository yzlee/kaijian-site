/* ══════════════════════════════════════════════════════════════════════
   发布配置 —— 上线只改这一个文件，改完 git push，Cloudflare Pages 自动发布。

   downloadUrl : 安装包直链。用 GitHub Release 的固定直链最省事：
                 https://github.com/<你>/<仓库>/releases/latest/download/快剪辑-Setup.exe
                 （latest/download 会自动指向最新一版，不用每次改这里）
   mirrorUrl   : 国内加速镜像（Cloudflare R2 / 对象存储的直链）。留空则按钮不显示。
   repoUrl     : 源码仓库地址；不开源就留空，页脚「源码」自动消失。
   contact     : 联系方式，比如 mailto:you@example.com。留空则不显示。
   ══════════════════════════════════════════════════════════════════════ */
window.SITE_CONFIG = {
  version: 'v0.1.0',
  channel: '内测',
  sizeLabel: '约 90 MB',
  runtimeLabel: '约 2–3 GB',
  downloadUrl: '',
  mirrorUrl: '',
  repoUrl: '',
  contact: ''
};
