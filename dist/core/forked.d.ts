export declare enum ForkedMessageType {
    started = 0,
    options = 1,
    kill = 2,
    killed = 3,
    fail = 4
}
export declare class ForkedMessage {
    type: ForkedMessageType;
    body: unknown;
    constructor(type: ForkedMessageType, body: unknown);
}
