const memoryjs = require("memoryjs");
const Debugger = memoryjs.Debugger;

type Process = {
    handle: number;
    th32ProcessID: number;
};

type DebugEvent = {
    register: number;
}

type MemoryReaderConfig = {
    dllAddressOffset: number;
    processName: string;
    dllName: string;
}

export class MemoryReader {
    private config: MemoryReaderConfig;

    constructor(config: MemoryReaderConfig) {
        this.config = config;
    }

    canReadProcess() {
        try {
            memoryjs.openProcess(this.config.processName);
            return true;
        } catch (e) {
            return false;
        }
    }

    readProcessLoop() {
        this.getProcessData().then((p) => {
            setTimeout(() => {
                this.readProcessLoop();
            }, 1000);
        });
    }

    getProcess(processName: string) {
        return memoryjs.openProcess(processName) as Process;
    }

    async getProcessData() {
        const process = this.getProcess(this.config.processName);

        const clientModule = memoryjs.findModule(
            this.config.dllName,
            process.th32ProcessID
        );

        const gameStateAddress =
            clientModule.modBaseAddr + this.config.dllAddressOffset;

        const gameState = memoryjs.readMemory(
            process.handle,
            gameStateAddress,
            memoryjs.INT
        );

        return {
            gameState,
        };
    }

}
