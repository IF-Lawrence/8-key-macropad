
import { useState, useRef, useEffect, useCallback } from 'react';
import { toU8Array } from '../utils/protocol';

export const useSerial = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [port, setPort] = useState(null);
    const [reader, setReader] = useState(null);
    const [writer, setWriter] = useState(null);
    const [log, setLog] = useState([]);
    const decoderRef = useRef(null);

    const addLog = useCallback((msg) => {
        console.log(msg);
        setLog(prev => [...prev.slice(-19), msg]);
    }, []);

    const connect = async () => {
        if (!navigator.serial) {
            alert("Web Serial API not supported in this browser.");
            return;
        }

        try {
            const filter = { usbVendorId: 0x303a, usbProductId: 18 };
            const selectedPort = await navigator.serial.requestPort({ filters: [filter] });
            await selectedPort.open({ baudRate: 115200 });

            const decoder = new TextDecoderStream();
            selectedPort.readable.pipeTo(decoder.writable);
            const inputStream = decoder.readable;
            const portReader = inputStream.getReader();
            const portWriter = selectedPort.writable.getWriter();

            setPort(selectedPort);
            setReader(portReader);
            setWriter(portWriter);
            decoderRef.current = decoder;
            setIsConnected(true);
            addLog("Connected to device.");

            // Start reading loop
            readLoop(portReader);

        } catch (error) {
            addLog(`Error connecting: ${error}`);
            console.error(error);
        }
    };

    const readLoop = async (portReader) => {
        try {
            while (true) {
                const { value, done } = await portReader.read();
                if (value) {
                    // Handle incoming data if needed (e.g., version info)
                    if (value.includes("APP-VER=")) {
                        addLog(`Device Version Recv: ${value}`);
                    }
                }
                if (done) {
                    portReader.releaseLock();
                    break;
                }
            }
        } catch (e) {
            console.error("Read Error", e);
        }
    };

    const disconnect = async () => {
        if (reader) {
            await reader.cancel();
            setReader(null);
        }
        if (writer) {
            writer.releaseLock();
            setWriter(null);
        }
        if (port) {
            await port.close();
            setPort(null);
        }
        setIsConnected(false);
        addLog("Disconnected.");
    };

    const sendData = async (encodedString) => {
        if (!writer) {
            addLog("Not connected: Cannot send data.");
            return;
        }
        try {
            const data = toU8Array(encodedString);
            await writer.write(data);
            addLog(`Sent: ${encodedString}`);
        } catch (error) {
            addLog(`Error sending: ${error}`);
        }
    };

    return {
        isConnected,
        connect,
        disconnect,
        sendData,
        log
    };
};
