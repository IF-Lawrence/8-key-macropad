
// Protocol utilities for 8-key macropad

export const replaceModifier = (input) => {
    let placed = input.replace(/{lctrl}/g, "\xe0");
    placed = placed.replace(/{lshift}/g, "\xe1");
    placed = placed.replace(/{lalt}/g, "\xe2");
    placed = placed.replace(/{lgui}/g, "\xe3"); // Win/Cmd Left
    placed = placed.replace(/{rctrl}/g, "\xe4");
    placed = placed.replace(/{rshift}/g, "\xe5");
    placed = placed.replace(/{ralt}/g, "\xe6");
    placed = placed.replace(/{rgui}/g, "\xe7"); // Win/Cmd Right

    placed = placed.replace(/{arrowup}/g, "\xd2");
    placed = placed.replace(/{arrowdown}/g, "\xd1");
    placed = placed.replace(/{arrowleft}/g, "\xd0");
    placed = placed.replace(/{arrowright}/g, "\xcf");
    placed = placed.replace(/{pagedown}/g, "\xce");
    placed = placed.replace(/{end}/g, "\xcd");
    placed = placed.replace(/{delete}/g, "\xcc");
    placed = placed.replace(/{pageup}/g, "\xcb");
    placed = placed.replace(/{home}/g, "\xca");
    placed = placed.replace(/{insert}/g, "\xc9");
    placed = placed.replace(/{pause}/g, "\xc8");
    placed = placed.replace(/{scrolllock}/g, "\xc7");
    placed = placed.replace(/{prtscr}/g, "\xc6");

    placed = placed.replace(/{f12}/g, "\xc5");
    placed = placed.replace(/{f11}/g, "\xc4");
    placed = placed.replace(/{f10}/g, "\xc3");
    placed = placed.replace(/{f9}/g, "\xc2");
    placed = placed.replace(/{f8}/g, "\xc1");
    placed = placed.replace(/{f7}/g, "\xc0");
    placed = placed.replace(/{f6}/g, "\xbf");
    placed = placed.replace(/{f5}/g, "\xbe");
    placed = placed.replace(/{f4}/g, "\xbd");
    placed = placed.replace(/{f3}/g, "\xbc");
    placed = placed.replace(/{f2}/g, "\xbb");
    placed = placed.replace(/{f1}/g, "\xba");

    placed = placed.replace(/{enter}/g, "\xa8");
    placed = placed.replace(/{escape}/g, "\xa9");
    placed = placed.replace(/{bkspace}/g, "\xaa"); // Note: kb.js used {bkspace} but simple-keyboard uses {bksp} or {backspace}. We should handle both.
    placed = placed.replace(/{backspace}/g, "\xaa");
    placed = placed.replace(/{bksp}/g, "\xaa");
    placed = placed.replace(/{tab}/g, "\xaB");
    placed = placed.replace(/{space}/g, "\xac");

    return placed;
};

export const getModifierNum = (input) => {
    let modifierNum = 0;
    // Note: The original code only checked for inclusion, so multiple of same modifier didn't count? 
    // "input.includes" returns boolean.
    // We will stick to original logic: if present, count 1.
    modifierNum += input.includes("{lctrl}") ? 1 : 0;
    modifierNum += input.includes("{lshift}") ? 1 : 0;
    modifierNum += input.includes("{lalt}") ? 1 : 0;
    modifierNum += input.includes("{lgui}") ? 1 : 0;
    modifierNum += input.includes("{rctrl}") ? 1 : 0;
    modifierNum += input.includes("{rshift}") ? 1 : 0;
    modifierNum += input.includes("{ralt}") ? 1 : 0;
    modifierNum += input.includes("{rgui}") ? 1 : 0;
    return modifierNum;
};

export const toU8Array = (input_str) => {
    let len = input_str.length;
    let u8Array = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        u8Array[i] = input_str.charCodeAt(i);
    }

    // 填写协议里 负荷长度（不包含 magic_str 以及长度本身这个字节）
    // ebf + len_byte + payload
    // 0 1 2   3        4...
    // Magic is 3 chars which are bytes 0,1,2.
    // Byte 3 is length.
    // So actual payload is everything after byte 3.
    // Length to write at [3] is (Total - 4).
    if (len >= 4) {
        u8Array[3] = len - 4;
    }

    return u8Array;
};

// Type 0: Key Config
export const encodeKeyConfig = (profile, keyNumber, input) => {
    let modifierNum = getModifierNum(input);
    let replaced = replaceModifier(input);

    // [MAGIC_STR][PAYLOAD_LEN][TYPE][PROFILE].[KEY_NUM]:CONFIG 
    let encoded = "ebf";
    encoded += '0'; // Placeholder for length
    encoded += '0'; // Type 0 = Key Config
    encoded += profile;
    encoded += ".";
    encoded += keyNumber;
    encoded += ":";
    encoded += (modifierNum > 0 ? '1' : '0');
    encoded += replaced;

    return encoded;
};

// Type 1: LED Config
export const encodeLedConfig = (color, brightness) => {
    // ebf + len + 1 + color(no #) + brightness(1 byte)
    let encoded = "ebf";
    encoded += '0'; // Payload len placeholder
    encoded += '1'; // Type 1 = LED
    encoded += color.replace('#', '');
    // Convert brightness (0-100) to a single byte character
    encoded += String.fromCharCode(parseInt(brightness, 10));

    return encoded;
};


// Type 2/3: Alias Config
export const encodeAliasConfig = (enable, profile, keyNumber, input) => {
    let encoded = "ebf";
    encoded += '0';
    encoded += enable ? '2' : '3'; // 2=Add, 3=Delete
    encoded += profile;
    encoded += ".";
    encoded += keyNumber;
    encoded += ":";
    if (enable) encoded += input;

    return encoded;
};

// Type 6/7: Script Config
export const encodeScriptConfig = (enable, profile, keyNumber, input) => {
    let encoded = "ebf";
    encoded += '0';
    encoded += enable ? '6' : '7'; // 6=Add, 7=Delete
    encoded += profile;
    encoded += ".";
    encoded += keyNumber;
    encoded += ":";
    if (enable) encoded += input;

    return encoded;
};
