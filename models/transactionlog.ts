export interface Welcome {
    transfer_id:       number;
    transfer_date:     Date | null;
    transfer_reason:   null | string;
    transfer_cost:     null;
    condition_before:  null | string;
    condition_after:   null | string;
    transport_method:  null | string;
    requested_by:      number | null;
    approved_by:       number | null;
    received_by:       number | null;
    handover_date:     Date | null;
    received_date:     null;
    status:            null;
    insurance_covered: string;
    estimated_arrival: Date | null;
    actual_arrival:    Date | null;
    notes:             null | string;
    Record_Status:     string;
    Maker_DT_Stamp:    Date;
    Checker_DT_Stamp:  null;
    asset_list_id:     string;
    from_location_id:  number;
    to_location_id:    number | null;
    Maker_Id:          string;
    Checker_Id:        null;
}
