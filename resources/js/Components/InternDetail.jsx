import { useState } from "react";

export default function InternDetail({ intern }) {
    if (!intern) return null;

    const [upload, setUpload] = useState(false);

    const poin = intern.poin ?? 0;
    const poinStyle =
        poin < 3 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";

    const fingerprint = intern.fingerprint_data;
    const fingerStyle = fingerprint
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

    const renderJadwal = () => {
        const days = [];
        if (intern.senin) days.push("Senin");
        if (intern.selasa) days.push("Selasa");
        if (intern.rabu) days.push("Rabu");
        if (intern.kamis) days.push("Kamis");
        if (intern.jumat) days.push("Jumat");

        if (days.length === 5) return "Setiap hari";

        return days.length > 0 ? days.join(", ") : "-";
    };

    const handlePhotoClick = () => {
        document.getElementById("photo-upload").click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi file
        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
            alert("Format file harus JPG, JPEG, atau PNG");
            return;
        }

        if (file.size > 2048000) {
            // 2MB
            alert("Ukuran file maksimal 2MB");
            return;
        }

        // Upload foto
        setUploading(true);
        const formData = new FormData();
        formData.append("foto", file);
        formData.append("_method", "PUT");

        router.post(`/interns/${intern.id}/update-photo`, formData, {
            onSuccess: () => {
                setUploading(false);
                alert("Foto berhasil diubah");
            },
            onError: (errors) => {
                setUploading(false);
                alert(
                    "Gagal mengubah foto: " + Object.values(errors).join(", "),
                );
            },
        });
    };

    return (
        <div className="px-8 py-6">
            <div className="flex justify-between">
                {/* Foto & Detail Singkat Karyawan */}
                <div className="flex gap-4">
                    <div className="w-40 h-40 relative group cursor-pointer">
                        {intern.foto ? (
                            <>
                                <img
                                    src={`/storage/${intern.foto}`}
                                    alt={intern.name}
                                    className="w-full h-full object-cover object-top rounded-xl"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <span className="text-white font-medium">
                                        {upload ? "Mengupload..." : "Ubah Foto"}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="w-48 h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                {upload ? "Mengupload..." : "Upload Foto"}
                            </div>
                        )}
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            className="hidden"
                            onChange={handlePhotoChange}
                            disabled={upload}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-2xl">{intern.name}</p>
                            {/* <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23px"
                                height="23px"
                                viewBox="0 0 24 24"
                                className="cursor-pointer"
                            >
                                <g class="edit-outline">
                                    <g
                                        fill="oklch(55.1% 0.027 264.364)"
                                        fill-rule="evenodd"
                                        class="Vector"
                                        clip-rule="evenodd"
                                    >
                                        <path d="M2 6.857A4.857 4.857 0 0 1 6.857 2H12a1 1 0 1 1 0 2H6.857A2.857 2.857 0 0 0 4 6.857v10.286A2.857 2.857 0 0 0 6.857 20h10.286A2.857 2.857 0 0 0 20 17.143V12a1 1 0 1 1 2 0v5.143A4.857 4.857 0 0 1 17.143 22H6.857A4.857 4.857 0 0 1 2 17.143z" />
                                        <path d="m15.137 13.219l-2.205 1.33l-1.033-1.713l2.205-1.33l.003-.002a1.2 1.2 0 0 0 .232-.182l5.01-5.036a3 3 0 0 0 .145-.157c.331-.386.821-1.15.228-1.746c-.501-.504-1.219-.028-1.684.381a6 6 0 0 0-.36.345l-.034.034l-4.94 4.965a1.2 1.2 0 0 0-.27.41l-.824 2.073a.2.2 0 0 0 .29.245l1.032 1.713c-1.805 1.088-3.96-.74-3.18-2.698l.825-2.072a3.2 3.2 0 0 1 .71-1.081l4.939-4.966l.029-.029c.147-.15.641-.656 1.24-1.02c.327-.197.849-.458 1.494-.508c.74-.059 1.53.174 2.15.797a2.9 2.9 0 0 1 .845 1.75a3.15 3.15 0 0 1-.23 1.517c-.29.717-.774 1.244-.987 1.457l-5.01 5.036q-.28.281-.62.487m4.453-7.126s-.004.003-.013.006z" />
                                    </g>
                                </g>
                            </svg> */}
                        </div>

                        <div className="flex items-center gap-2">
                            <p className="font-medium text-md">
                                {intern.division?.nama_divisi || "-"}
                            </p>
                            {/* <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18px"
                                height="18px"
                                viewBox="0 0 24 24"
                                className="cursor-pointer"
                            >
                                <g class="edit-outline">
                                    <g
                                        fill="oklch(55.1% 0.027 264.364)"
                                        fill-rule="evenodd"
                                        class="Vector"
                                        clip-rule="evenodd"
                                    >
                                        <path d="M2 6.857A4.857 4.857 0 0 1 6.857 2H12a1 1 0 1 1 0 2H6.857A2.857 2.857 0 0 0 4 6.857v10.286A2.857 2.857 0 0 0 6.857 20h10.286A2.857 2.857 0 0 0 20 17.143V12a1 1 0 1 1 2 0v5.143A4.857 4.857 0 0 1 17.143 22H6.857A4.857 4.857 0 0 1 2 17.143z" />
                                        <path d="m15.137 13.219l-2.205 1.33l-1.033-1.713l2.205-1.33l.003-.002a1.2 1.2 0 0 0 .232-.182l5.01-5.036a3 3 0 0 0 .145-.157c.331-.386.821-1.15.228-1.746c-.501-.504-1.219-.028-1.684.381a6 6 0 0 0-.36.345l-.034.034l-4.94 4.965a1.2 1.2 0 0 0-.27.41l-.824 2.073a.2.2 0 0 0 .29.245l1.032 1.713c-1.805 1.088-3.96-.74-3.18-2.698l.825-2.072a3.2 3.2 0 0 1 .71-1.081l4.939-4.966l.029-.029c.147-.15.641-.656 1.24-1.02c.327-.197.849-.458 1.494-.508c.74-.059 1.53.174 2.15.797a2.9 2.9 0 0 1 .845 1.75a3.15 3.15 0 0 1-.23 1.517c-.29.717-.774 1.244-.987 1.457l-5.01 5.036q-.28.281-.62.487m4.453-7.126s-.004.003-.013.006z" />
                                    </g>
                                </g>
                            </svg> */}
                        </div>

                        {/* Jadwal */}
                        <div className="flex items-center gap-2">
                            <p className="text-sm">Jadwal : {renderJadwal()}</p>
                            {/* <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18px"
                                height="18px"
                                viewBox="0 0 24 24"
                                className="cursor-pointer"
                            >
                                <g class="edit-outline">
                                    <g
                                        fill="oklch(55.1% 0.027 264.364)"
                                        fill-rule="evenodd"
                                        class="Vector"
                                        clip-rule="evenodd"
                                    >
                                        <path d="M2 6.857A4.857 4.857 0 0 1 6.857 2H12a1 1 0 1 1 0 2H6.857A2.857 2.857 0 0 0 4 6.857v10.286A2.857 2.857 0 0 0 6.857 20h10.286A2.857 2.857 0 0 0 20 17.143V12a1 1 0 1 1 2 0v5.143A4.857 4.857 0 0 1 17.143 22H6.857A4.857 4.857 0 0 1 2 17.143z" />
                                        <path d="m15.137 13.219l-2.205 1.33l-1.033-1.713l2.205-1.33l.003-.002a1.2 1.2 0 0 0 .232-.182l5.01-5.036a3 3 0 0 0 .145-.157c.331-.386.821-1.15.228-1.746c-.501-.504-1.219-.028-1.684.381a6 6 0 0 0-.36.345l-.034.034l-4.94 4.965a1.2 1.2 0 0 0-.27.41l-.824 2.073a.2.2 0 0 0 .29.245l1.032 1.713c-1.805 1.088-3.96-.74-3.18-2.698l.825-2.072a3.2 3.2 0 0 1 .71-1.081l4.939-4.966l.029-.029c.147-.15.641-.656 1.24-1.02c.327-.197.849-.458 1.494-.508c.74-.059 1.53.174 2.15.797a2.9 2.9 0 0 1 .845 1.75a3.15 3.15 0 0 1-.23 1.517c-.29.717-.774 1.244-.987 1.457l-5.01 5.036q-.28.281-.62.487m4.453-7.126s-.004.003-.013.006z" />
                                    </g>
                                </g>
                            </svg> */}
                        </div>

                        {/* Poin & Status Fingerprint */}
                        <div className="flex gap-2">
                            <p
                                className={`${poinStyle} w-fit  py-0.5 px-2 rounded-lg text-xs font-semibold`}
                            >
                                {poin} Poin
                            </p>
                            <div
                                className={`${fingerStyle} rounded-full flex items-center `}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14px"
                                    height="14px"
                                    viewBox="0 0 14 14"
                                >
                                    <path
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        d="M1.265 4.185A6.022 6.022 0 0 1 9.512.547a.625.625 0 0 1-.522 1.135a4.772 4.772 0 0 0-6.534 2.883a.625.625 0 1 1-1.191-.38M11.95 2.593a.625.625 0 0 0-1.028.712c.534.77.847 1.705.847 2.714v1.962A4.77 4.77 0 0 1 7 12.75A.625.625 0 1 0 7 14a6.02 6.02 0 0 0 6.02-6.02V6.019a6 6 0 0 0-1.07-3.426M2.23 6.76a.625.625 0 1 0-1.25 0v1.22a6.02 6.02 0 0 0 3.303 5.374a.625.625 0 1 0 .565-1.115A4.77 4.77 0 0 1 2.23 7.981zm2.584-1.513a.625.625 0 1 0-1.179-.417a3.6 3.6 0 0 0-.203 1.19v1.96a3.568 3.568 0 0 0 5.947 2.66a.625.625 0 0 0-.834-.932A2.318 2.318 0 0 1 4.682 7.98V6.02c0-.272.047-.532.132-.772m1.458-2.721a3.568 3.568 0 0 1 4.296 3.493v1.47a.625.625 0 1 1-1.25 0V6.02a2.318 2.318 0 0 0-2.792-2.27a.625.625 0 1 1-.254-1.223M7.625 6.02a.625.625 0 1 0-1.25 0v1.962a.625.625 0 1 0 1.25 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Kehadiran Karyawan */}
                <div className="flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm">Total Kehadiran</p>
                            <p className="font-bold text-lg">
                                {intern.total_kehadiran || 0} hari
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">Total Jam</p>
                            <p className="font-bold text-lg">
                                {intern.total_jam || 0} jam
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Jam Masuk{" "}
                                <span className="text-xs">(rata-rata)</span>
                            </p>
                            <p className="font-bold text-lg">
                                {intern.avg_jam_masuk || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm">
                                Jam Pulang{" "}
                                <span className="text-xs">(rata-rata)</span>
                            </p>
                            <p className="font-bold text-lg">
                                {intern.avg_jam_pulang || "-"}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center border-2 border-gray-300 text-center rounded-lg text-sm ">
                        <p className="flex items-center gap-1 font-medium">
                            {" "}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23px"
                                height="23px"
                                viewBox="0 0 15 15"
                            >
                                <path
                                    fill="oklch(72.3% 0.219 149.579)"
                                    d="M7.5 5.125a2.375 2.375 0 1 1 0 4.75a2.375 2.375 0 0 1 0-4.75"
                                />
                            </svg>
                            <span className="text-gray-500">
                                {intern.total_kehadiran || 0}
                            </span>{" "}
                            Hadir
                        </p>
                        <p className="border-r-2 border-l-2 border-gray-300 flex items-center gap-1 font-medium">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23px"
                                height="23px"
                                viewBox="0 0 15 15"
                            >
                                <path
                                    fill="oklch(79.5% 0.184 86.047)"
                                    d="M7.5 5.125a2.375 2.375 0 1 1 0 4.75a2.375 2.375 0 0 1 0-4.75"
                                />
                            </svg>
                            <span className="text-gray-500">
                                {intern.total_izin || 0}
                            </span>{" "}
                            Izin
                        </p>
                        <p className="flex items-center gap-1 font-medium">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23px"
                                height="23px"
                                viewBox="0 0 15 15"
                            >
                                <path
                                    fill="oklch(63.7% 0.237 25.331)"
                                    d="M7.5 5.125a2.375 2.375 0 1 1 0 4.75a2.375 2.375 0 0 1 0-4.75"
                                />
                            </svg>
                            <span className="text-gray-500">
                                {intern.total_alpha || 0}
                            </span>{" "}
                            Alpha
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
