export interface DateEODRespons {
    success: boolean;
    data:    Data;
}

export interface Data {
    date_id:          number;
    start_date:       Date;
    prev_working_day: Date;
    next_working_day: Date;
    eod_time:         string;
}
