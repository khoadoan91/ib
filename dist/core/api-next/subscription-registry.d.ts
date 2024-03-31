import { Observable } from "rxjs";
import { EventName } from "../..";
import { IBApiNext, IBApiNextError, ItemListUpdate } from "../../api-next";
import { IBApiAutoConnection } from "./auto-connection";
import { IBApiNextSubscription } from "./subscription";
/** An id that uniquely identifies the type of a subscription. */
export type SubscriptionTypeId = string;
/** An id that uniquely identifies the subscription instance. */
export type SubscriptionInstanceId = string;
/**
 * @internal
 *
 * The subscription registry as used by [[IBApiNext]].
 *
 * The subscription registry maintains the list of all currently
 * registered subscriptions. See [[IBApiNext.register]] about how
 * register a subscription.
 */
export declare class IBApiNextSubscriptionRegistry {
    private readonly api;
    private readonly apiNext;
    /**
     * Create an [[IBApiNextSubscriptionRegistry]] instance.
     *
     * @param api The [[IBApiAutoConnection]] instance for event listener registration and
     * invoking TWS API.
     * @param apiNext The [[IBApiNext]] instance for observing the connection state.
     */
    constructor(api: IBApiAutoConnection, apiNext: IBApiNext);
    /** A Map containing the subscription registry, with event name as key. */
    private readonly entires;
    /**
     * Register a subscription.
     *
     * @param requestFunction A callback, invoked when the start request shall be send to TWS.
     * @param cancelFunction A callback, invoked when the cancel request shall be send to TWS.
     * @param eventHandler Array of IB API event, callback function to handle this event.
     * @param instanceId When not undefined, this an id that uniquely identifies
     * the subscription instance. This can be used to avoid creation of multiple subscriptions,
     * that will end up on same TWS request (i.e. request same market data multiple times), but an
     * existing subscription instance will be re-used if same instanceId does already exist.
     * As a general rule: don't use instanceId when there is no reqId or when you want to return
     * a Promise (single emitted value). Use it everywhere else.
     */
    register<T>(requestFunction: (reqId: number) => void, cancelFunction: (reqId: number) => void | null | undefined, eventHandler: [
        EventName,
        (subscriptions: Map<number, IBApiNextSubscription<T>>, ...eventArgs: unknown[]) => void
    ][], instanceId?: string): Observable<ItemListUpdate<T>>;
    /**
     * Dispatch an error into the subscription that owns the given request id.
     */
    dispatchError(reqId: number, error: IBApiNextError): void;
}
