import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CustomDatePicker({
    value,
    onChange,
    dateFormat = "yyyy-MM-dd",
    placeholder = "Pilih tanggal",
    className = "",
    ...props
}) {
    return (
        <DatePicker
            selected={value}
            onChange={onChange}
            dateFormat={dateFormat}
            placeholderText={placeholder}
            className={`py-2 border-2 focus:ring-0 ${className} w-32`}
            calendarClassName="z-50"
            {...props}
        />
    );
}
