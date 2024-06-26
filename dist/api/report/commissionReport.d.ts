/**
 * Represents the commissions generated by an execution
 */
export interface CommissionReport {
    /**  The execution's id this commission belongs to. */
    execId?: string;
    /** The commissions cost. */
    commission?: number;
    /** The reporting currency. */
    currency?: string;
    /** The realized profit and loss */
    realizedPNL?: number;
    /** The income return. */
    yield?: number;
    /** Date expressed in yyyymmdd format. */
    yieldRedemptionDate?: number;
}
export default CommissionReport;
