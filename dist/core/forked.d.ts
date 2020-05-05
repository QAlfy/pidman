export declare enum ForkedMessageType {
    started = 0,
    closed = 1,
    options = 2,
    errored = 3,
    kill = 4,
    killed = 5,
    killfail = 6
}
export declare class ForkedMessage {
    type: ForkedMessageType;
    body: unknown;
    constructor(type: ForkedMessageType, body: unknown);
}
