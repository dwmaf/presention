export default function InternCard({ intern, onClick }) {
    const poin = intern.poin ?? 0;
    const poinStyle =
        poin < 3 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";

    const fingerprint = intern.fingerprint_data;
    const fingerStyle = fingerprint
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

    return (
        <div
            onClick={onClick}
            className="bg-white w-fit space-y-2 rounded-lg shadow-lg pb-4 cursor-pointer hover:scale-[1.02] transition flex flex-col"
        >
            {intern.foto ? (
                <img
                    className="w-41 h-41 object-cover aspect-square rounded-t-lg object-top"
                    src={`/${intern.foto}`}
                    alt={intern.name}
                />
            ) : (
                <div>No Img</div>
            )}
            <div className="px-4 flex flex-col justify-center flex-1 ">
                <p className="font-bold text-lg flex items-center flex-1">
                    {intern.name}
                </p>
                <p className="font-medium mb-2 text-sm">
                    {intern.division ? intern.division.nama_divisi : "-"}
                </p>
                <div className="flex gap-2">
                    <p
                        className={`${poinStyle} w-fit py-0.5 px-2 rounded-lg text-xs font-semibold`}
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
    );
}
