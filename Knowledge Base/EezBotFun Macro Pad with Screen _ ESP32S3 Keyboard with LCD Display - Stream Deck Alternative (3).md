---
created: 2026-01-22T00:03:14+08:00
tags:
  - 📥/AI-Summary
  - 宏键盘, 脚本命令, 自动化操作
rating: ⭐⭐⭐
status: 🟢 To Read
source: "Auto-generated"
---

## 📌 核心速览

EezBotFun 宏键盘脚本使用指南，详细介绍了如何通过编写脚本模拟键盘和鼠标操作来实现自动化任务。

## 🧠 观点拆解

- **基础操作命令**：包括 DELAY（延迟）、STRING（输入文本）、REPEAT（重复）等核心脚本指令。
- **鼠标控制**：通过 MOUSE_MOVE、LMOUSE 等命令实现光标移动和点击。
- **配置文件管理**：使用 GOTO_PROFILE、PREV_PROFILE 命令在不同功能配置间切换。
- **全局延迟设置**：DEFAULTDURATION、DEFAULTCHARDELAY、DEFAULTDELAY 等参数控制操作节奏，避免被检测为非人工输入。
- **特殊功能键**：支持修饰键、导航键、系统键、功能键、媒体键和数字小键盘键的模拟。

## 💎 精选语录

> The EezBotFun Macro Pad allows each key to run a script that simulates keyboard and mouse actions.

> Values below 30 ms may be detected as “non-human input.”

> These three settings are global configurations, which means that once a script is executed, all subsequent script executions will follow the specified delays.

## 🔗 关联概念

[[EezBotFun Macro Pad]], [[DELAY]], [[STRING]], [[MOUSE_MOVE]], [[DEFAULTDURATION]]

___
## Knowledge Base

## Script Usage Guide

---

## 1\. Overview

The EezBotFun Macro Pad allows each key to run a script that simulates keyboard and mouse actions.  
Example:

```
WINDOWS r
DELAY 500
STRING www.itsmartreach.com
ENTER
```

---

## 2\. Supported Script Commands

## 2.1 DELAY

| Item | Description |
| --- | --- |
| **Function** | Pause script execution |
| **Syntax** | `DELAY <milliseconds>` |
| **Parameter** | `<milliseconds>`: Number of ms to wait |
| **Example** | `DELAY 500` |

---

## 2.2 STRING

| Item | Description |
| --- | --- |
| **Function** | Types text as keyboard input |
| **Syntax** | `STRING <text>` |
| **Parameter** | `<text>`: Any UTF-8 string |
| **Example** | `STRING this is a test` |

---

## 2.3 REPEAT

| Item | Description |
| --- | --- |
| **Function** | Repeat the previous script line `n` times |
| **Syntax** | `REPEAT <n>` |
| **Parameter** | `<n>`: Integer > 0 |
| **Example** | LMOUSE   REPEAT 1This results in **two** left-clicks. |

---

## 2.4 MOUSE\_MOVE

| Item | Description |
| --- | --- |
| **Function** | Move mouse cursor |
| **Syntax** | `MOUSE_MOVE X Y` |
| **X Range** | \-127 ~ 127 (negative = left, positive = right) |
| **Y Range** | \-127 ~ 127 (negative = up, positive = down) |
| **Example** | `MOUSE_MOVE 100 -20` (move right 100px, up 20px) |

---

## 2.5 LMOUSE / MMOUSE / RMOUSE

| Command | Action |
| --- | --- |
| `LMOUSE` | Left mouse click |
| `MMOUSE` | Middle mouse click |
| `RMOUSE` | Right mouse click |

---

## 2.6 GOTO\_PROFILE

| Item | Description |
| --- | --- |
| **Function** | Switch to a specific profile |
| **Syntax** | `GOTO_PROFILE <id>` |
| **Parameter** | `<id>`: Profile index (integer) |
| **Example** | `GOTO_PROFILE 5` |

---

## 2.7 PREV\_PROFILE / NEXT\_PROFILE

| Command | Action |
| --- | --- |
| `PREV_PROFILE` | Switch to previous profile |
| `NEXT_PROFILE` | Switch to next profile |

---

## 2.8 DEFAULTDURATION

| Item | Description |
| --- | --- |
| **Function** | Delay between pressing and releasing a single key |
| **Syntax** | `DEFAULTDURATION <ms>` |
| **Default Value** | 10 ms |
| **Note** | Values below 30 ms may be detected as “non-human input.” |
| **Example** | `DEFAULTDURATION 35` |

## 2.9 DEFAULTCHARDELAY

| Item | Description |
| --- | --- |
| **Function** | The interval between characters when sending a string |
| **Syntax** | `DEFAULTDURATION <ms>` |
| **Default Value** | 18 ms |
| **Note** | too fast may be detected as “non-human input.” |
| **Example** | `DEFAULTCHARDELAY 35` |

## 2.10 DEFAULTDELAY

| Item | Description |
| --- | --- |
| **Function** | The delay between executing each line of the script |
| **Syntax** | `DEFAULTDURATION <ms>` |
| **Default Value** | 18 ms |
| **Note** | too fast may be detected as “non-human input.” |
| **Example** | `DEFAULTDELAY 35` |

- Please Note  
	2.8 ~ 2.10 These three settings are global configurations, which means that once a script is executed, all subsequent script executions will follow the specified delays.  
	They are also stored in Flash memory, so the values remain the same after powering off and restarting.

## 3\. Special Function Keys

Below are all supported special key keywords.

## 3.1 Modifier Keys

| Key |
| --- |
| CONTROL |
| SHIFT |
| ALT |
| WINDOWS |
| COMMAND |
| OPTION |

---

## 3.2 Navigation / Editing Keys

| Key |
| --- |
| ESC |
| ENTER |
| UP / DOWN / LEFT / RIGHT |
| SPACE |
| BACKSPACE |
| TAB |
| CAPLOCKS |
| INSERT |
| DELETE |
| HOME |
| END |
| PAGEUP |
| PAGEDOWN |

---

## 3.3 System Keys

| Key |
| --- |
| PRINTSCREEN |
| SCROLLLOCK |
| PAUSE |
| BREAK |
| MENU |
| POWER |

---

## 3.4 Function Keys

| Keys |
| --- |
| F1 ~ F12 |

---

## 3.5 Media Keys

| Command | Description |
| --- | --- |
| VOLUP | Increase volume |
| VOLDOWN | Decrease volume |
| MUTE | Mute audio |
| PREV | Previous track |
| NEXT | Next track |
| PP | Play/Pause |
| STOP | Stop media |

---

## 3.6 Numeric Keypad Keys

| Keys |
| --- |
| NUMLOCK |
| KP\_SLASH |
| KP\_ASTERISK |
| KP\_MINUS |
| KP\_PLUS |
| KP\_ENTER |
| KP\_DOT |
| KP\_EQUAL |
| KP\_0 ~ KP\_9 |

---

## 4\. Key Combination Examples

| Function | Script |
| --- | --- |
| Copy | `CONTROL c` |
| Paste | `CONTROL v` |
| Task Manager | `CONTROL SHIFT ESC` |
| Windows Screenshot | `WINDOWS SHIFT s` |
| Open Run Dialog | `WINDOWS r` |

---

## 5\. Sample Scripts

### Open Website

```
WINDOWS r
DELAY 500
STRING www.example.com
ENTER
```

### Double Left-Click

```
LMOUSE
REPEAT 1
```

### Move Mouse Slightly Right

```
MOUSE_MOVE 10 0
```

---

Last updated:2025/12/1[Previous](https://www.eezbotfun.com/en/wiki/8-key-macro-pad-icon-customize)

[

How To Customize Key Icon

](https://www.eezbotfun.com/en/wiki/8-key-macro-pad-icon-customize)[Next](https://www.eezbotfun.com/en/wiki/1-knob-macro-pad-specification)

[

Specifications

](https://www.eezbotfun.com/en/wiki/1-knob-macro-pad-specification)