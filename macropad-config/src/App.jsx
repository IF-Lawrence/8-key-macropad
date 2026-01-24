
import React, { useState, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { useSerial } from './hooks/useSerial';
import { encodeKeyConfig, encodeLedConfig, encodeScriptConfig, encodeAliasConfig } from './utils/protocol';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { Usb, Zap, Keyboard as KeyboardIcon, Command, Type, FileCode, Monitor, Info, HelpCircle, Image as ImageIcon, Download, Upload } from 'lucide-react';

function App() {
  const serial = useSerial();
  const [profile, setProfile] = useState(1);
  const [activeKey, setActiveKey] = useState(null);
  const [macMode, setMacMode] = useState(true);
  const [showScriptHelp, setShowScriptHelp] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [scriptInput, setScriptInput] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [ledColor, setLedColor] = useState("#ffffff");
  const [ledBrightness, setLedBrightness] = useState(10);
  const [enableAlias, setEnableAlias] = useState(true);

  // Icon Generation State
  const [showIconGen, setShowIconGen] = useState(false);
  const [iconImages, setIconImages] = useState({});

  const keys = [1, 2, 3, 4, 5, 6, 7, 8];

  // Centralized Configuration State
  const [config, setConfig] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('macropad-config');
    return saved ? JSON.parse(saved) : {};
  });

  // Key Presets State
  const [keyPresets, setKeyPresets] = useState(() => {
    const saved = localStorage.getItem('macropad-key-presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPresetLibrary, setShowPresetLibrary] = useState(false);

  // Auto-save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('macropad-config', JSON.stringify(config));
  }, [config]);

  // Auto-save key presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('macropad-key-presets', JSON.stringify(keyPresets));
  }, [keyPresets]);

  // Auto-save icon images to localStorage
  useEffect(() => {
    localStorage.setItem('macropad-icon-images', JSON.stringify(iconImages));
  }, [iconImages]);

  // Load icon images from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('macropad-icon-images');
    if (saved) {
      setIconImages(JSON.parse(saved));
    }
  }, []);

  // Auto-save inputs to config when they change (debounced or effect)
  // This ensures 'Save Preset' captures everything even if not 'Saved to Device'
  useEffect(() => {
    if (!activeKey) return;
    const timer = setTimeout(() => {
      setConfig(prev => ({
        ...prev,
        [profile]: {
          ...prev[profile],
          [activeKey]: {
            ...(prev[profile]?.[activeKey] || {}),
            key: keyInput,
            script: scriptInput,
            alias: aliasInput
          }
        }
      }));
    }, 300);
    return () => clearTimeout(timer);
  }, [keyInput, scriptInput, aliasInput, activeKey, profile]);

  const updateConfigState = (type, value) => {
    // Legacy helper, might still be used by save functions
    setConfig(prev => ({
      ...prev,
      [profile]: {
        ...prev[profile],
        [activeKey]: {
          ...(prev[profile]?.[activeKey] || {}),
          [type]: value
        }
      }
    }));
  };

  const handleKeySelect = (key) => {
    setActiveKey(key);
    // Load from config or default to empty
    const current = config[profile]?.[key] || { key: "", script: "", alias: "" };
    setKeyInput(current.key || "");
    setScriptInput(current.script || "");
    setAliasInput(current.alias || "");
  };

  const handleIconUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 64, 64);
        const resized = canvas.toDataURL('image/png');
        setIconImages(prev => ({ ...prev, [key]: resized }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const downloadIcons = async () => {
    const zip = new JSZip();
    const folder = zip.folder("app_icons");
    Object.keys(iconImages).forEach(key => {
      // data:image/png;base64,... is the format from toDataURL
      const data = iconImages[key].split(',')[1];
      folder.file(`profile_${profile}_key_${key}.png`, data, { base64: true });
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `profile_${profile}_icons.zip`);
  };

  const handleVirtualKeyPress = (button) => {
    if (!activeKey) return;

    // Smart Mac Function Keys
    // Smart Mac Function Keys - Use Scripts for Media (Consumer Control)
    if (macMode) {
      const macMedia = {
        "{f3}": { script: "CONTROL UP", alias: "Mission Control" },
        "{f7}": { script: "PREV", alias: "Prev Track" },
        "{f8}": { script: "PP", alias: "Play/Pause" },
        "{f9}": { script: "NEXT", alias: "Next Track" },
        "{f10}": { script: "MUTE", alias: "Mute" },
        "{f11}": { script: "VOLDOWN", alias: "Vol Down" },
        "{f12}": { script: "VOLUP", alias: "Vol Up" }
      };
      if (macMedia[button]) {
        setScriptInput(macMedia[button].script);
        setAliasInput(macMedia[button].alias);
        setKeyInput(""); // CRITICAL: Clear key so script takes effect
        return;
      }
    }

    let toAdd = button;
    if (button === "{lock}") return;
    if (macMode) {
      if (button === "{lgui}") toAdd = "{lgui}";
      if (button === "{lalt}") toAdd = "{lalt}";
    }
    const newVal = keyInput + toAdd;
    setKeyInput(newVal);
  };

  const handleSaveAll = async () => {
    if (!serial.isConnected) return alert("Please connect device first");
    if (!activeKey) return;

    // 1. Key Config
    // Always send key config (even if empty, to clear)
    const encodedKey = encodeKeyConfig(profile.toString(), activeKey.toString(), keyInput);
    await serial.sendData(encodedKey);
    updateConfigState('key', keyInput);
    await new Promise(r => setTimeout(r, 50));

    // 2. Script Config
    if (scriptInput && scriptInput.trim().length > 0) {
      await serial.sendData(encodeScriptConfig(true, profile.toString(), activeKey.toString(), scriptInput));
      updateConfigState('script', scriptInput);
    } else {
      await serial.sendData(encodeScriptConfig(false, profile.toString(), activeKey.toString(), ""));
      updateConfigState('script', "");
    }
    await new Promise(r => setTimeout(r, 50));

    // 3. Alias Config
    if (aliasInput && aliasInput.trim().length > 0) {
      await serial.sendData(encodeAliasConfig(true, profile.toString(), activeKey.toString(), aliasInput));
      updateConfigState('alias', aliasInput);
    } else {
      await serial.sendData(encodeAliasConfig(false, profile.toString(), activeKey.toString(), ""));
      updateConfigState('alias', "");
    }

    // Visual Feedback
    alert(`Key ${activeKey} Saved!`);
  };

  const saveKeyConfig = handleSaveAll; // Alias for backward compatibility or direct replacement logic

  const saveScript = async (enable) => {
    if (!serial.isConnected) return alert("Please connect device first");
    if (!activeKey) return;

    // If deleting, send empty payload? No, standard logic. 
    // Protocol sends inputs even on delete if we provide them, but we want to clear local state.

    const encoded = encodeScriptConfig(enable, profile.toString(), activeKey.toString(), scriptInput);
    await serial.sendData(encoded);

    if (!enable) {
      setScriptInput("");
      updateConfigState('script', "");
    } else {
      updateConfigState('script', scriptInput);
    }
  };

  const saveAlias = async (enable) => {
    if (!serial.isConnected) return alert("Please connect device first");
    if (!activeKey) return;
    const encoded = encodeAliasConfig(enable, profile.toString(), activeKey.toString(), aliasInput);
    await serial.sendData(encoded);

    if (!enable) {
      setAliasInput("");
      updateConfigState('alias', "");
    } else {
      updateConfigState('alias', aliasInput);
    }
  };

  // Key Preset Management Functions
  const saveAsPreset = () => {
    if (!activeKey) return alert("Please select a key first");

    const currentConfig = config[profile]?.[activeKey];
    if (!currentConfig || (!currentConfig.key && !currentConfig.script && !currentConfig.alias)) {
      return alert("No configuration to save. Please configure the key first.");
    }

    const presetName = prompt("Enter a name for this preset:", currentConfig.alias || `Key ${activeKey} Preset`);
    if (!presetName) return;

    const newPreset = {
      id: Date.now(),
      name: presetName,
      key: currentConfig.key || "",
      script: currentConfig.script || "",
      alias: currentConfig.alias || "",
      icon: iconImages[activeKey] || null,
      createdAt: new Date().toISOString()
    };

    setKeyPresets(prev => [...prev, newPreset]);
    alert(`Preset "${presetName}" saved!`);
  };

  const deletePreset = (presetId) => {
    if (!confirm("Delete this preset?")) return;
    setKeyPresets(prev => prev.filter(p => p.id !== presetId));
  };

  const renamePreset = (presetId) => {
    const preset = keyPresets.find(p => p.id === presetId);
    if (!preset) return;

    const newName = prompt("Enter new name:", preset.name);
    if (!newName) return;

    setKeyPresets(prev => prev.map(p =>
      p.id === presetId ? { ...p, name: newName } : p
    ));
  };

  const exportKeyPresets = () => {
    if (keyPresets.length === 0) {
      return alert("No presets to export.");
    }

    const exportData = {
      version: "1.0",
      type: "key-presets",
      presets: keyPresets,
      exportedAt: new Date().toISOString()
    };

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `macropad-presets-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const importKeyPresets = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);

        if (parsed.type !== "key-presets" || !Array.isArray(parsed.presets)) {
          return alert("Invalid preset file format.");
        }

        // Merge with existing presets, avoiding duplicates by id
        const existingIds = new Set(keyPresets.map(p => p.id));
        const newPresets = parsed.presets.filter(p => !existingIds.has(p.id));

        if (newPresets.length === 0) {
          return alert("All presets in this file already exist.");
        }

        setKeyPresets(prev => [...prev, ...newPresets]);
        alert(`Imported ${newPresets.length} preset(s)!`);
      } catch (err) {
        alert("Invalid preset file.");
      }
    };
    event.target.value = ''; // Reset input
  };

  const applyPreset = (preset, targetKey = null) => {
    const key = targetKey || activeKey;
    if (!key) return alert("Please select a key first");

    // Update config
    setConfig(prev => ({
      ...prev,
      [profile]: {
        ...prev[profile],
        [key]: {
          key: preset.key,
          script: preset.script,
          alias: preset.alias
        }
      }
    }));

    // Update icon if preset has one
    if (preset.icon) {
      setIconImages(prev => ({ ...prev, [key]: preset.icon }));
    }

    // Update UI if this is the active key
    if (key === activeKey) {
      setKeyInput(preset.key);
      setScriptInput(preset.script);
      setAliasInput(preset.alias);
    }

    alert(`Preset "${preset.name}" applied to Key ${key}!`);
  };

  const handlePresetDragStart = (e, preset) => {
    e.dataTransfer.setData('preset', JSON.stringify(preset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleKeyDrop = (e, keyNumber) => {
    e.preventDefault();
    const presetData = e.dataTransfer.getData('preset');
    if (presetData) {
      const preset = JSON.parse(presetData);
      applyPreset(preset, keyNumber);
    }
  };

  const handleKeyDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Preset Management
  const exportPreset = () => {
    const fullPreset = {
      version: "2.0",
      config: config,
      icons: iconImages,
      led: {
        color: ledColor,
        brightness: ledBrightness
      },
      macMode: macMode,
      exportedAt: new Date().toISOString()
    };

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(fullPreset, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = "macropad-preset.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const importPreset = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);

        // Support both old and new format
        if (parsed.version === "2.0") {
          // New format with icons and LED settings
          setConfig(parsed.config || {});
          if (parsed.icons) setIconImages(parsed.icons);
          if (parsed.led) {
            setLedColor(parsed.led.color);
            setLedBrightness(parsed.led.brightness);
          }
          if (parsed.macMode !== undefined) setMacMode(parsed.macMode);
        } else {
          // Old format (just config object)
          setConfig(parsed);
        }

        alert("Preset loaded successfully! Please select a key to view updated configuration.");

        // Refresh current key view if active
        if (activeKey) {
          const configData = parsed.version === "2.0" ? parsed.config : parsed;
          const current = configData[profile]?.[activeKey] || { key: "", script: "", alias: "" };
          setKeyInput(current.key);
          setScriptInput(current.script);
          setAliasInput(current.alias);
        }
      } catch (err) {
        alert("Invalid preset file.");
      }
    };
  };

  /* Sync all keys in current profile */
  const syncProfile = async () => {
    if (!serial.isConnected) return alert("Please connect device first");
    if (!confirm("This will overwrite all keys in the current profile on the device with the current preset settings. Continue?")) return;

    // Iterate 1-8
    for (let k = 1; k <= 8; k++) {
      const cfg = config[profile]?.[k];
      if (!cfg) continue;

      // Delay to prevent flooding
      await new Promise(r => setTimeout(r, 100));

      // Send Key Config
      if (cfg.key) {
        const encoded = encodeKeyConfig(profile.toString(), k.toString(), cfg.key);
        await serial.sendData(encoded);
        await new Promise(r => setTimeout(r, 100));
      }

      // Send Alias Config
      if (cfg.alias) {
        const encoded = encodeAliasConfig(true, profile.toString(), k.toString(), cfg.alias);
        await serial.sendData(encoded);
        await new Promise(r => setTimeout(r, 100));
      }

      // Send Script Config
      if (cfg.script) {
        const encoded = encodeScriptConfig(true, profile.toString(), k.toString(), cfg.script);
        await serial.sendData(encoded);
      }
    }
    alert("Sync Complete!");
  };

  const updateLed = async () => {
    if (!serial.isConnected) return alert("Please connect device first");
    const encoded = encodeLedConfig(ledColor, ledBrightness.toString());
    await serial.sendData(encoded);
  };

  const insertScriptCommand = (cmd) => {
    setScriptInput(prev => prev + (prev ? "\n" : "") + cmd);
  };

  // Custom Layout for Virtual Keyboard
  const layout = {
    default: [
      "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} q w e r t y u i o p [ ] \\",
      "{lock} a s d f g h j k l ; ' {enter}",
      "{shift} z x c v b n m , . / {shift}",
      macMode
        ? "{lctrl} {lalt} {lgui} {space} {rgui} {ralt} {rctrl}" // Mac: Ctrl Opt Cmd Space
        : "{lctrl} {lgui} {lalt} {space} {ralt} {rgui} {rctrl}" // Win: Ctrl Win Alt Space
    ]
  };

  const display = {
    "{escape}": "esc ⎋",
    "{tab}": "tab ⇥",
    "{bksp}": "backspace ⌫",
    "{enter}": "enter ↵",
    "{lock}": "caps ⇪",
    "{shift}": "shift ⇧",
    "{space}": "space",
    "{lctrl}": "ctrl ⌃",
    "{rctrl}": "ctrl ⌃",
    "{lalt}": macMode ? "opt ⌥" : "alt",
    "{ralt}": macMode ? "opt ⌥" : "alt",
    "{lgui}": macMode ? "cmd ⌘" : "win ⊞",
    "{rgui}": macMode ? "cmd ⌘" : "win ⊞",
    "{f1}": "F1 🔅", "{f2}": "F2 🔆", "{f3}": "F3  Mission", "{f4}": "F4 🚀",
    "{f5}": "F5 🎤", "{f6}": "F6 🌙", "{f7}": "F7 ⏪", "{f8}": "F8 ⏯",
    "{f9}": "F9 ⏩", "{f10}": "F10 🔇", "{f11}": "F11 🔉", "{f12}": "F12 🔊"
  };

  // Recording State
  const [isRecording, setIsRecording] = useState(false);

  // Key Recording Handler
  useEffect(() => {
    if (!isRecording) return;

    const handleRecordKeyDown = (e) => {
      e.preventDefault();

      let code = "";

      // Map Modifiers
      if (e.key === "Control") code = "{lctrl}";
      else if (e.key === "Shift") code = "{shift}";
      else if (e.key === "Alt") code = "{lalt}";
      else if (e.key === "Meta") code = "{lgui}";
      else if (e.key === "Enter") code = "{enter}";
      else if (e.key === "Escape") code = "{escape}";
      else if (e.key === "Backspace") code = "{bksp}";
      else if (e.key === "Tab") code = "{tab}";
      else if (e.key === " ") code = "{space}";
      else if (e.key.length === 1) code = e.key.toLowerCase();

      // F-keys
      else if (/^F\d+$/.test(e.key)) code = `{${e.key.toLowerCase()}}`;
      // Arrows
      else if (e.key === "ArrowUp") code = "{arrowup}";
      else if (e.key === "ArrowDown") code = "{arrowdown}";
      else if (e.key === "ArrowLeft") code = "{arrowleft}";
      else if (e.key === "ArrowRight") code = "{arrowright}";

      if (code) {
        setKeyInput(prev => prev + code);
      }
    };

    window.addEventListener('keydown', handleRecordKeyDown);
    return () => window.removeEventListener('keydown', handleRecordKeyDown);
  }, [isRecording]);


  return (
    <div className="min-h-screen p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="glass-panel p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <KeyboardIcon className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Macropad Configurator</h1>
            <p className="text-xs text-gray-400">v2.0 • {macMode ? "macOS Mode" : "Windows Mode"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${serial.isConnected ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
            <Usb size={14} />
            {serial.isConnected ? "Connected" : "Disconnected"}
          </div>

          <button
            onClick={serial.isConnected ? serial.disconnect : serial.connect}
            className={`btn-primary ${serial.isConnected ? "bg-red-500 hover:bg-red-600" : ""}`}
          >
            {serial.isConnected ? "Disconnect" : "Connect Device"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-6 p-6 pt-0">

        {/* Preset Library Sidebar (Collapsible) */}
        <div className={`${showPresetLibrary ? 'w-64 flex-shrink-0' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          {showPresetLibrary && (
            <div className="glass-panel p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Preset Library</h3>
                <button
                  onClick={() => setShowPresetLibrary(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {keyPresets.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs py-8">
                    <p>No presets yet.</p>
                    <p className="mt-2">Configure a key and click "Save as Preset"</p>
                  </div>
                ) : (
                  keyPresets.map(preset => (
                    <div
                      key={preset.id}
                      draggable
                      onDragStart={(e) => handlePresetDragStart(e, preset)}
                      className="bg-slate-800/50 border border-white/10 rounded-lg p-3 cursor-move hover:bg-slate-700/50 hover:border-blue-500/30 transition group"
                    >
                      <div className="flex items-start gap-2">
                        {preset.icon && (
                          <img src={preset.icon} className="w-10 h-10 rounded border border-white/10" alt={preset.name} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-white truncate">{preset.name}</div>
                          {preset.key && (
                            <div className="text-[10px] text-gray-400 font-mono truncate">Key: {preset.key}</div>
                          )}
                          {preset.script && (
                            <div className="text-[10px] text-purple-400 truncate">Script: {preset.script.split('\n')[0]}...</div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => applyPreset(preset)}
                          className="flex-1 text-[10px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => renamePreset(preset.id)}
                          className="text-[10px] px-2 py-1 rounded bg-slate-700 text-gray-300 hover:bg-slate-600"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={exportKeyPresets}
                    className="flex-1 text-[10px] px-2 py-1.5 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 flex items-center justify-center gap-1"
                  >
                    <Download size={10} /> Export
                  </button>
                  <input
                    type="file"
                    id="presetLibraryImport"
                    className="hidden"
                    accept=".json"
                    onChange={importKeyPresets}
                  />
                  <button
                    onClick={() => document.getElementById('presetLibraryImport').click()}
                    className="flex-1 text-[10px] px-2 py-1.5 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 flex items-center justify-center gap-1"
                  >
                    <Upload size={10} /> Import
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 text-center">
                  💡 Drag presets onto keys to apply them
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Left Sidebar: Profiles & Visualization */}
        <div className="w-[420px] flex-shrink-0 flex flex-col gap-6">
          {/* Profile Selector */}
          <div className="glass-panel p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Profile</h3>
              <button
                onClick={() => setShowPresetLibrary(!showPresetLibrary)}
                className="text-[10px] px-2 py-1 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition shadow-lg shadow-purple-900/20"
              >
                {showPresetLibrary ? '← Hide' : '📚 Presets'}
              </button>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  onClick={() => { setProfile(p); setActiveKey(null); }}
                  className={`flex-1 aspect-square rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden
                    ${profile === p
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Preset Actions */}
            <div className="mt-4 flex gap-2">
              <button onClick={exportPreset} className="flex-1 py-1.5 rounded bg-slate-800 border border-white/5 text-[10px] text-gray-300 hover:bg-slate-700 transition flex items-center justify-center gap-1">
                Save Preset
              </button>
              <input type="file" id="presetImport" className="hidden" accept=".json" onChange={importPreset} />
              <button onClick={() => document.getElementById('presetImport').click()} className="flex-1 py-1.5 rounded bg-slate-800 border border-white/5 text-[10px] text-gray-300 hover:bg-slate-700 transition flex items-center justify-center gap-1">
                Load Preset
              </button>
            </div>
            <button onClick={syncProfile} className="mt-2 w-full py-1.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 text-[10px] text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-900/20">
              Sync Profile to Device
            </button>
          </div>


          {/* Key Visualization */}
          <div className="glass-panel p-6 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />

            <div className="w-full flex justify-end mb-4 px-2 absolute top-2 right-2">
              <button onClick={() => setShowIconGen(!showIconGen)} className="text-[10px] font-medium text-blue-400 hover:text-white flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-white/5 transition hover:bg-slate-700">
                {showIconGen ? <><KeyboardIcon size={12} /> Return to Config</> : <><ImageIcon size={12} /> Icon Tools</>}
              </button>
            </div>

            {!showIconGen ? (
              <>
                <div className="grid grid-cols-4 gap-4 w-full px-4 mt-6">
                  {keys.map(k => {
                    const cfg = config[profile]?.[k];
                    // Display Alias -> Key -> or Number
                    let label = k;
                    let isCustom = false;
                    if (cfg?.alias) { label = cfg.alias; isCustom = true; }
                    else if (cfg?.key) { label = cfg.key; isCustom = true; }
                    else if (cfg?.script) { label = cfg.script.split('\n')[0]; isCustom = true; }

                    // Truncate if too long (simple check, 4 chars limit for large font, else small)
                    const isLong = String(label).length > 2;
                    const isVeryLong = String(label).length > 6;

                    // Dynamic Font Sizing
                    let fontSize = "text-3xl font-bold";
                    if (isVeryLong) fontSize = "text-[10px] leading-tight break-all font-medium";
                    else if (isLong) fontSize = "text-sm font-bold";

                    return (
                      <button
                        key={k}
                        onClick={() => handleKeySelect(k)}
                        onDrop={(e) => handleKeyDrop(e, k)}
                        onDragOver={handleKeyDragOver}
                        className={`w-full aspect-square rounded-2xl border-2 flex items-center justify-center transition-all shadow-xl overflow-hidden p-1
                        ${activeKey === k
                            ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/30 scale-105"
                            : "bg-slate-800/50 border-white/5 text-gray-300 hover:bg-slate-700 hover:border-white/20 hover:scale-105"}`}
                      >
                        <span className={isCustom ? fontSize : "text-3xl font-bold"}>
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <p className="mt-8 text-sm text-gray-500 text-center">
                  Select a key to configure its function.<br />
                  Current Profile: <strong className="text-white">{profile}</strong>
                  {Object.keys(config[profile] || {}).length > 0 && <span className="block text-[10px] text-emerald-500 mt-1">● Config stored in preset</span>}
                </p>
              </>
            ) : (
              <>
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4 mt-2 font-semibold">Icon Generator (64x64)</h4>
                <div className="grid grid-cols-4 gap-4 w-full px-4 mb-4">
                  {keys.map(k => (
                    <div key={k} className="relative aspect-square rounded-xl bg-slate-800 border border-white/10 overflow-hidden group hover:border-blue-500/50 transition">
                      {iconImages[k] ? (
                        <img src={iconImages[k]} className="w-full h-full object-cover" alt={`Key ${k}`} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 group-hover:text-gray-400">
                          <Upload size={16} />
                          <span className="text-[9px] mt-1 font-mono">KEY_{k}</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" title={`Upload icon for Key ${k}`} className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleIconUpload(k, e.target.files[0])} />
                    </div>
                  ))}
                </div>
                <button onClick={downloadIcons} className="btn-primary w-5/6 text-xs py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 border-none shadow-lg shadow-orange-500/20">
                  <Download size={14} /> Download Icon Pack (.zip)
                </button>
                <div className="mt-3 text-[10px] text-gray-500 text-center px-4 leading-relaxed">
                  Upload images to auto-resize. <br />
                  Download ZIP, extract, and copy to <code>app_icons</code> folder on device.
                </div>
              </>
            )}
          </div>


          {/* LED Control */}
          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} /> Backlight Control
            </h3>
            <div className="flex gap-4 items-center mb-4">
              <input
                type="color"
                value={ledColor}
                onChange={(e) => setLedColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer bg-transparent border-none"
              />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Brightness</span>
                  <span>{ledBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="1" max="100"
                  value={ledBrightness}
                  onChange={(e) => setLedBrightness(e.target.value)}
                />
              </div>
            </div>
            <button onClick={updateLed} className="w-full btn-primary py-2 text-sm bg-purple-600 hover:bg-purple-700">
              Update Lighting
            </button>
          </div>
        </div>

        {/* Right Content: Editor */}
        <div className="flex-1 glass-panel p-6 flex flex-col overflow-hidden">

          {activeKey ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Configuring Key {activeKey}
                  <span className="text-base font-normal text-gray-400 px-2 py-0.5 bg-slate-800 rounded">Profile {profile}</span>
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={saveAsPreset}
                    className="px-3 py-1.5 rounded bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500/30 text-xs font-medium hover:from-green-500 hover:to-emerald-500 transition shadow-lg shadow-green-900/20"
                  >
                    💾 Save as Preset
                  </button>
                  <button
                    onClick={() => setMacMode(!macMode)}
                    className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition"
                  >
                    Mode: {macMode ? "Mac" : "Win"}
                  </button>
                </div>
              </div>

              {/* Tabs / Sections */}

              {/* 1. Key Map Section - Input Only */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-400">
                  <KeyboardIcon size={18} /> Key Mapping
                </h3>
                <div className="flex gap-2">
                  <input
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={isRecording ? "Press keys to record..." : "Click keys below or Record..."}
                    readOnly
                    className={`flex-1 border rounded-lg px-4 py-3 text-lg font-mono tracking-wide focus:outline-none transition text-white
                        ${isRecording ? "bg-red-900/20 border-red-500 animate-pulse" : "bg-slate-900 border-slate-700 focus:border-blue-500"}`}
                  />
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-4 rounded-lg border flex items-center gap-2 transition font-medium
                        ${isRecording ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30" : "bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700"}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-white animate-pulse" : "bg-red-500"}`} />
                    {isRecording ? "Stop" : "Record"}
                  </button>
                  <button onClick={() => setKeyInput("")} className="px-4 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 border border-transparent hover:border-red-500/50">Clear</button>
                  <button onClick={saveKeyConfig} className="btn-primary min-w-[100px]">Save</button>
                </div>
              </div>

              {/* 2. Virtual Keyboard */}
              <div className="mb-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <Keyboard
                  layout={layout}
                  display={display}
                  onKeyPress={handleVirtualKeyPress}
                  theme={"hg-theme-default dark-theme"}
                />
              </div>

              {/* 3. Two Column Layout: Script+QuickAction | Alias */}
              <div className="flex gap-4 items-start">
                {/* Left Column: Script + Quick Action */}
                <div className="flex-1 bg-slate-800/30 p-4 rounded-xl border border-white/5 relative">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-semibold flex items-center gap-2 text-purple-400">
                      <FileCode size={16} /> Advanced Script
                    </h3>
                    <button onClick={() => setShowScriptHelp(!showScriptHelp)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                      <HelpCircle size={12} /> Syntax
                    </button>
                  </div>

                  {showScriptHelp && (
                    <div className="absolute top-12 left-0 right-0 z-10 bg-slate-900 border border-slate-600 rounded-lg p-4 shadow-xl text-xs max-h-[300px] overflow-y-auto">
                      <div className="mb-2 font-bold text-white">Commands:</div>
                      <ul className="space-y-1 mb-3 text-gray-300">
                        <li><code className="text-purple-400">DELAY 500</code> - Wait 500ms</li>
                        <li><code className="text-purple-400">STRING hello</code> - Type text</li>
                        <li><code className="text-purple-400">REPEAT 5</code> - Repeat prev line</li>
                        <li><code className="text-purple-400">MOUSE_MOVE x y</code> - Move mouse</li>
                        <li><code className="text-purple-400">LMOUSE</code> - Left Click</li>
                        <li><code className="text-purple-400">RMOUSE</code> - Right Click</li>
                      </ul>
                      <div className="mb-2 font-bold text-white">Examples:</div>
                      <pre className="bg-black/30 p-2 rounded text-gray-400">
                        WINDOWS r{'\n'}
                        DELAY 200{'\n'}
                        STRING cmd{'\n'}
                        ENTER
                      </pre>
                    </div>
                  )}

                  <textarea
                    value={scriptInput}
                    onChange={(e) => setScriptInput(e.target.value)}
                    placeholder="Enter macro script..."
                    className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm font-mono mb-3 focus:outline-none focus:border-purple-500 text-white"
                  />

                  <div className="flex gap-2 mb-3 flex-wrap">
                    {["DELAY 100", "STRING text", "LMOUSE", "ENTER"].map(cmd => (
                      <button key={cmd} onClick={() => insertScriptCommand(cmd)} className="text-[10px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-gray-300 border border-slate-600">
                        + {cmd.split(" ")[0]}
                      </button>
                    ))}
                    {["VOLUP", "VOLDOWN", "MUTE", "PP", "NEXT", "PREV"].map(cmd => (
                      <button key={cmd} onClick={() => insertScriptCommand(cmd)} className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-900/40">
                        + {cmd}
                      </button>
                    ))}
                  </div>

                  {/* Quick Actions: Open App */}
                  <div className="mb-3 bg-slate-900/50 p-3 rounded border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs text-gray-400 font-medium">⚡️ Quick Action: Launch App</label>
                      <button
                        onClick={() => {
                          const el = document.getElementById('qa-settings');
                          el.classList.toggle('hidden');
                        }}
                        className="text-[10px] text-blue-400 hover:text-blue-300"
                      >
                        Configure
                      </button>
                    </div>

                    <div id="qa-settings" className="hidden mb-2 p-2 bg-slate-800 rounded border border-white/5 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Activation Sequence</label>
                        <textarea
                          id="qa-shortcut"
                          defaultValue={macMode ? "COMMAND SPACE" : "WINDOWS"}
                          className="w-full h-20 bg-slate-900 border-none rounded px-2 py-1 text-xs text-mono text-gray-300 resize-none font-mono"
                          placeholder="COMMAND SPACE"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">System Delay (ms)</label>
                        <input
                          id="qa-delay"
                          defaultValue="500"
                          className="w-full bg-slate-900 border-none rounded px-2 py-1 text-xs text-mono text-gray-300 mb-2"
                        />
                        <p className="text-[9px] text-gray-500 leading-tight">
                          <strong>Tip:</strong> Customize the start sequence here (e.g. use <code>COMMAND 1</code> to force App Search mode in Spotlight).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        id="appNameInput"
                        placeholder="App Name (e.g. Safari)"
                        className="flex-1 bg-slate-800 border-none rounded px-2 py-1 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const app = e.target.value;
                            const shortcut = document.getElementById('qa-shortcut').value;
                            const delay = document.getElementById('qa-delay').value;

                            if (!app) return;
                            const script = `${shortcut}\nDELAY ${delay}\nSTRING ${app}\nDELAY ${delay}\nENTER`;
                            setScriptInput(script);
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('appNameInput');
                          const app = input.value;
                          const shortcut = document.getElementById('qa-shortcut').value;
                          const delay = document.getElementById('qa-delay').value;

                          if (!app) return;
                          const script = `${shortcut}\nDELAY ${delay}\nSTRING ${app}\nDELAY ${delay}\nENTER`;
                          setScriptInput(script);
                          input.value = "";
                        }}
                        className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-500"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => saveScript(false)} className="text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                    <button onClick={() => saveScript(true)} className="text-xs px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-500">Save Script</button>
                  </div>
                </div>

                {/* Right Column: Alias */}
                <div className="w-80 flex-shrink-0 bg-slate-800/30 p-4 rounded-xl border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={enableAlias}
                      onChange={(e) => {
                        setEnableAlias(e.target.checked);
                        if (!e.target.checked) {
                          setAliasInput("");
                        }
                      }}
                      className="w-4 h-4 accent-green-500"
                    />
                    <span className="text-md font-semibold flex items-center gap-2 text-green-400">
                      <Type size={16} /> Display Alias
                    </span>
                  </label>

                  {enableAlias ? (
                    <>
                      <input
                        value={aliasInput}
                        onChange={(e) => setAliasInput(e.target.value)}
                        placeholder="Label (e.g. 'Copy')"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:border-green-500 text-white"
                        autoFocus
                      />
                      <div className="flex flex-col gap-2">
                        <button onClick={() => saveAlias(true)} className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-500">Save Alias</button>
                        <button onClick={() => { saveAlias(false); setEnableAlias(false); }} className="text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Delete</button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Check the box to set a display name.</p>
                  )}
                </div>
              </div>

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <Monitor size={64} className="mb-4" />
              <h2 className="text-2xl font-bold">No Key Selected</h2>
              <p>Click a key on the left to begin configuration.</p>
            </div>
          )}
        </div>

      </div>

      {/* Footer Log */}
      <div className="h-32 glass-panel p-4 overflow-y-auto font-mono text-xs text-gray-500 m-6 mt-0">
        {serial.log.map((entry, i) => (
          <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{entry}</div>
        ))}
        {serial.log.length === 0 && <div className="italic opacity-50">System ready. Waiting for connection...</div>}
      </div>
    </div>
  );
}

export default App;
