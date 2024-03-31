import { OperatorCondition } from "./operator-condition";
/**
 * An order execution condition with contract details.
 */
export interface ContractCondition extends OperatorCondition {
    /** The contract id. */
    conId: number;
    /** The exchange code. */
    exchange: string;
}
export default ContractCondition;
