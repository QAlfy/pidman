interface PidmanOptions {
    id: string;
}
export declare class Pidman {
    private options;
    constructor(options: PidmanOptions);
    getOptions(): PidmanOptions;
}
export {};
