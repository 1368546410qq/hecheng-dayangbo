# 合成大杨波

类似「合成大西瓜」的网页单机游戏，点击或触摸投放杨波，相同杨波碰撞后合成为更大的杨波（1→15，从小到大）。

## 玩法

- 鼠标 / 触摸移动瞄准，点击 / 触摸投放
- 两个相同等级的杨波碰撞后合成为下一级
- 杨波越过顶部红色警戒线后，若保持低速 3 秒（有倒计时提示）即游戏结束

## 账号与排行榜

- 打开游戏会先进入「登录 / 注册」页（`login.html`），登录后才进入游戏（邮箱 + 密码，云端认证）
- 登录后：合成过的新等级会自动记录到「合成图鉴」，右侧 1~15 级中合成过的显示对应图像、未合成的显示问号
- 排行榜按所有注册用户的最高分排序，你自己的名字会高亮
- 账号、图鉴、排行榜全部通过 Supabase 云端存储，换设备登录同一账号即可同步

## 🚀 Supabase 云端接入（一次性配置，约 10 分钟）

1. **注册项目**：用 GitHub 账号登录 https://supabase.com → New project（免费，无需绑卡）→ 随便起名、选区域（建议 `ap-northeast-1` 或离你近的）、设置数据库密码。
2. **拿密钥**：项目页 → 左侧 Settings → API → 记下 **Project URL**（形如 `https://xxxx.supabase.co`）和 **anon public key**。
3. **建表**：左侧 SQL Editor → New query，粘贴下面 SQL 并 Run：

   ```sql
   create table if not exists public.profiles (
     id uuid primary key references auth.users(id) on delete cascade,
     username text not null,
     best_score integer not null default 0,
     unlocked jsonb not null default '{}',
     created_at timestamptz not null default now()
   );
   alter table public.profiles enable row level security;
   create policy "board_read" on public.profiles for select using (true);
   create policy "own_insert" on public.profiles for insert with check (auth.uid() = id);
   create policy "own_update" on public.profiles for update using (auth.uid() = id);
   ```

4. **关邮箱确认（可选但推荐）**：Authentication → Sign In / Providers → Email → 关闭 **Confirm email**，这样注册后无需收验证邮件、直接进游戏。
5. **填 key**：打开 `store.js`，把最上面两行的 `YOUR-PROJECT.supabase.co` 和 `YOUR-ANON-PUBLIC-KEY` 换成第 2 步拿到的值。
6. **部署**：提交推送后，GitHub Pages 会自动更新。线上登录注册即可用，数据云端同步。

> 域名白名单：如果线上调用报 CORS / 401，去项目的 Authentication → URL Configuration 把 `https://1368546410qq.github.io` 加入 **Allowed Redirect URLs / Site URL**。

## 本地开发

直接用浏览器打开 `login.html` 即可游玩（登录页已注入 Supabase SDK）。
在线地址：https://1368546410qq.github.io/hecheng-dayangbo/