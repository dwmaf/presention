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


import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RangeDatePicker.css';

export default function RangeDatePicker({
    value = [null, null],
    onChange,
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

    const handleChange = (dates) => {
        if (onChange) {
            onChange(dates);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <DatePicker
                    selected={startDate}
                    onChange={(date) => handleChange([date, endDate])}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={disablePast ? new Date() : minDate}
                    maxDate={disableFuture ? new Date() : maxDate}
                    disabled={disabled}
                    dateFormat={format}
                    placeholderText={startLabel}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
            </div>
            <span className="text-gray-500">-</span>
            <div className="relative">
                <DatePicker
                    selected={endDate}
                    onChange={(date) => handleChange([startDate, date])}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || (disablePast ? new Date() : minDate)}
                    maxDate={disableFuture ? new Date() : maxDate}
                    disabled={disabled}
                    dateFormat={format}
                    placeholderText={endLabel}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
            </div>
        </div>
    );
}
