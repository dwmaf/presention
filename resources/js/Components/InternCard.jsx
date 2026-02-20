export default function InternCard({ intern, onClick }) {
    const poin = intern.poin ?? 0;
    const poinStyle =
        poin < 3 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";

    return (
        <div
            onClick={onClick}
            className="bg-white w-fit space-y-2 rounded-lg shadow-lg pb-4 cursor-pointer hover:scale-[1.02] transition flex flex-col"
        >
            {intern.foto ? (
                <img
                    className="w-41 h-41 object-cover aspect-square rounded-t-lg object-top"
                    src={`/storage/${intern.foto}`}
                    alt={intern.name}
                />
            ) : (
                <div>No Img</div>
            )}
            <div className="px-4 flex flex-col justify-center flex-1 ">
                <p className="font-bold text-lg flex items-center flex-1">
                    {intern.name}
                </p>
                <p className="font-medium mb-2">
                    {intern.division ? intern.division.nama_divisi : "-"}
                </p>
                <p
                    className={`${poinStyle} w-fit text-green-800 py-0.5 px-2 rounded-lg text-xs font-semibold`}
                >
                    {poin} Poin
                </p>
            </div>
        </div>
    );
}
