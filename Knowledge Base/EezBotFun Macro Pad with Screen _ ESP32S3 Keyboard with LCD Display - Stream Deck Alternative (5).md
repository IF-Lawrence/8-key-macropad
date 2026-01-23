---
created: 2026-01-22T00:04:02+08:00
tags:
  - 📥/AI-Summary
  - 信息栏自定义, 图标替换, 宏键盘配置
rating: ⭐⭐⭐
status: 🟢 To Read
source: "Auto-generated"
---

## 📌 核心速览

本文档介绍了如何通过替换特定文件夹中的PNG图标文件来自定义宏键盘底部信息栏的显示内容。

## 🧠 观点拆解

- **自定义方法**：在`app_icons`文件夹中放置或替换指定的PNG图标文件即可。
- **图标功能**：前6个图标（如profile、clock）会动态显示系统信息，后4个图标（fun_1至fun_4）仅作静态显示。
- **显示规则**：宏键盘会优先选择其中的4个图标进行显示。
- **格式要求**：图标必须为32x32像素的PNG格式。

## 💎 精选语录

> 在屏幕底部，有一个信息栏，其中显示4个图标。
> 前6个的行为是预定义的，如下所示，数据将相应动态更新。
> 宏键盘将从中选择4个进行显示（优先级很重要）。

## 🔗 关联概念

[[信息栏]], [[app_icons文件夹]], [[PNG格式]], [[32x32像素]], [[宏键盘]]

___
## Knowledge Base

## Customise Info Bar

## Where Is Info Bar

On the bottom of the screen, the is an information bar where 4 icons displayed.  
![info-bar.png](https://yknwbmkdasdhxxklotha.supabase.co/storage/v1/object/public/wiki-images/f03d1331-7944-4cf3-affe-bc11f3cf0d1a/1765512880089-65fz8.png)

## How To Customise

Put or change following files under folder app\_icons will do the trick.

- profile.png
- clock.png
- uptime.png
- cpu.png
- gpu.png
- network.png
- fun\_1.png
- fun\_2.png
- fun\_3.png
- fun\_4.png

Behavior of the first 6 is pre-defined as illustrated below and the data will dynamically updated accordingly:

- profile – dynamically display current/total profiles
- clock – show current time
- uptime – show computer has been running time
- cpu – show computer cpu info
- gpu – show computer gpu info
- network – show computer network traffic

The last 4 are just for fun: simply display the icon of your own, but no data will be updated.

## Things Need To Know

- Then macro pad will choose 4 out of them to display（priority matters）.
- The icon file must be png format with resolution of 32 x 32 pixels.

Last updated:2025/12/29[Previous](https://www.eezbotfun.com/en/wiki/how-to-config-macropad-locally)

[

How To Config MacroPad Locally

](https://www.eezbotfun.com/en/wiki/how-to-config-macropad-locally)[Next](https://www.eezbotfun.com/en/wiki/security-concern)

[

Security Concern

](https://www.eezbotfun.com/en/wiki/security-concern)