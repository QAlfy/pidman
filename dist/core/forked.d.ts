export declare enum ForkedMessageType {
    started = 0,
    closed = 1,
    options = 2,
    kill = 3,
    killed = 4,
    fail = 5
}
export declare class ForkedMessage {
    type: ForkedMessageType;
    body: unknown;
    constructor(type: ForkedMessageType, body: unknown);
}
