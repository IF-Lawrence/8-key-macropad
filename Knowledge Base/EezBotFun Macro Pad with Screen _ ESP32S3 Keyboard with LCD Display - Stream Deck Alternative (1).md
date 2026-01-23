---
created: 2026-01-22T00:02:25+08:00
tags:
  - 📥/AI-Summary
  - 宏键盘配置, 配置应用程序, 操作序列
rating: ⭐⭐⭐
status: 🟢 To Read
source: "Auto-generated"
---

## 📌 核心速览

本文介绍了8键宏键盘专用配置应用的使用场景、核心功能、安装方法及界面概览。

## 🧠 观点拆解

- **配置应用的必要性**：当需要配置按键功能或使用HID模式不支持的特性时，必须运行此应用。
- **核心设计理念**：尽可能让宏键盘作为标准HID设备工作，以实现跨平台（Windows, MacOS, Linux）兼容。
- **操作与模式限制**：并非所有“操作”都支持HID模式；若按键分配了任一“非HID模式”操作，则配置应用需在后台持续运行。
- **应用功能与界面**：应用提供配置文件选择、设备管理、动作序列配置（通过拖拽）、参数设置及配置同步等功能。

## 💎 精选语录

> 我们的设计哲学是尽可能让宏键盘作为标准HID设备工作，允许它在不同的计算机（Windows, MacOs, Linux，...）上工作。
> 然而，并非所有***操作***都支持HID模式。在这种情况下（如果只有一个***非HID模式***操作被分配给按键），应用程序必须在后台保持运行。
> 由于应用程序需要启动程序并访问计算机信息（如CPU温度），它需要***管理员权限***。

## 🔗 关联概念

[[HID模式]], [[配置应用程序]], [[操作序列]], [[管理员权限]], [[8键宏键盘]]

___
## Knowledge Base

## Configuration App

To make configuring the macro pad easier, we have developed a dedicated configuration application.

## When To Use

When you need to configure key functions, or use features that are not supported in HID mode, you will need to run the app.

## Things Need To Know Before Using APP

- Each key can be configured with a sequence of actions, which will be executed in order. The currently supported actions are as follows:

| Action | Support HID Mode | Workaround |
| --- | --- | --- |
| Access Website | No |  |
| Launch APP | No | You can use ***Shortcut Action*** combined with following tricks: [Windows](https://www.minitool.com/news/open-a-program-with-keyboard-shortcut-win-10-11.html) / [MacOs](https://www.computerhope.com/issues/ch002051.htm) |
| Open Folder | No |  |
| Input Text | Yes |  |
| Shortcut | Yes |  |
| Wait | Yes |  |
| Mouse Move | No |  |
| Mouse Click | Yes |  |
| Media Control | Yes |  |
| Change Profile | Yes |  |
| Functional Key | Yes |  |
| Device Ctrl | Yes |  |

- Our design philosophy is to make the macro pad function as a standard HID device as much as possible, allowing it to work across different computers ( Windows, MacOs, Linux，... ).
- However, not all ***Actions*** are supported in HID mod. In this case ( If only there is one ***Non-HID Mode*** action has assigned to the key ) the APP must keep running in the background.

## Where To Get APP

You can download here: [Latest Config APP](https://github.com/eezbotfun/8-key-macropad/releases)

## Install

Simply run the downloaded exe file to install the config APP.

Please note Since the app needs to launch programs and access computer information such as CPU temperature, it requires ***administrator privileges***.

## APP UI Overview

![UI-Overview-illustrated.PNG](https://yknwbmkdasdhxxklotha.supabase.co/storage/v1/object/public/wiki-images/f03d1331-7944-4cf3-affe-bc11f3cf0d1a/1764051751066-gi6ts.PNG)

### Profile & Key Selection

Here you can select the profile (also called layout) and keys of the macro pad that you want to configure.

### Device List

This area displays the connected MicroPAD devices.  
After selecting a device, the ***right-click menu*** includes: Setting RGB backlight, Synchronizing configuration to the computer, switching between light and dark themes, Clearing pairing information (only applicable to the 2.4G wireless dongle), and Upgrading the firmware.

### Configuration

- In this area, you can configure the parameters of each action and the order in which they are executed.
- By right-clicking an action in the list above, you can move it up, move it down, or delete it.
- ***Blue italic text*** provides configuration guidance.
- Click the ***Import button*** to load pre-configured key layouts (including icons, titles, and configurations) from existing setups or from the official Presets Gallery.
- After completing the configuration, click the ***Save button*** to synchronize the settings to the device.

### Actions List

All available actions are listed here.  
***Drag any action icon into the action list*** in the configuration area on the left to set up your key configuration.

Last updated:2025/11/30[Previous](https://www.eezbotfun.com/en/wiki/8-key-macro-pad-with-screen-compatibility)

[

Compatibility

](https://www.eezbotfun.com/en/wiki/8-key-macro-pad-with-screen-compatibility)[Next](https://www.eezbotfun.com/en/wiki/8-key-macro-pad-with-screen-presets-gallery)

[

Presets Gallery

](https://www.eezbotfun.com/en/wiki/8-key-macro-pad-with-screen-presets-gallery)