// import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
// import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
// import dayjs from 'dayjs';
// import 'dayjs/locale/id';

// export default function RangeDatePicker({
//     value = [null, null],
//     onChange,
//     label = "Pilih Rentang Tanggal",
//     startLabel = "Tanggal Mulai",
//     endLabel = "Tanggal Selesai",
//     disabled = false,
//     minDate = null,
//     maxDate = null,
//     disablePast = false,
//     disableFuture = false,
//     format = "DD/MM/YYYY",
//     className = "",
//     error = false,
//     helperText = "",
// }) {
//     const handleChange = (newValue) => {
//         if (onChange) {
//             onChange(newValue);
//         }
//     };

//     return (
//         <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="id">
//             <DateRangePicker
//                 value={value}
//                 onChange={handleChange}
//                 localeText={{
//                     start: startLabel,
//                     end: endLabel
//                 }}
//                 disabled={disabled}
//                 minDate={minDate ? dayjs(minDate) : undefined}
//                 maxDate={maxDate ? dayjs(maxDate) : undefined}
//                 disablePast={disablePast}
//                 disableFuture={disableFuture}
//                 format={format}
//                 slotProps={{
//                     textField: {
//                         error: error,
//                         helperText: helperText,
//                         fullWidth: true,
//                     },
//                 }}
//                 className={className}
//             />
//         </LocalizationProvider>
//     );
// }

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import "./RangeDatePicker.css";

export default function RangeDatePicker({
    value = [null, null],
    onChange,
    rangeLabel = "Pilih Rentang Tanggal",
    startLabel = "Tanggal Mulai",
    endLabel = "Tanggal Selesai",
    disabled = false,
    minDate = null,
    maxDate = null,
    disablePast = false,
    disableFuture = false,
    format = "dd/MM/yyyy",
    className = "",
}) {
    const [startDate, endDate] = value;

    const FormatRange = (start, end) => {
        if (!start) return "";
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        const startStr = start.toLocaleDateString("id-ID", opts);
        const endStr = end ? end.toLocaleDateString("id-ID", opts) : "";
        return end ? `${startStr} - ${endStr}` : startStr;
    };

    const handleChange = (dates) => {
        if (onChange) {
            onChange(dates);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    selected={startDate}
                    onChange={onChange}
                    minDate={disablePast ? new Date() : minDate}
                    maxDate={disableFuture ? new Date() : maxDate}
                    disabled={disabled}
                    dateFormat={format}
                    placeholderText={rangeLabel}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-80"
                    value={FormatRange(startDate, endDate)}
                    isClearable
                />
            </div>
        </div>
    );
}
