import { Link } from "@inertiajs/react";

function Sidebar() {
    return (
        <div className="bg-white w-64 flex flex-col gap-4 pt-8 fixed top-0 left-0 bottom-0 z-50">
            <div className="flex gap-2 items-center px-8">
                <img
                    src="foto/upa-pkk-logo.jpg.jpeg"
                    alt="Logo UPA"
                    className="w-16 aspect-square object-cover"
                />
                <div className="font-semibold">
                    <p className="text-2xl">UPA PKK</p>
                    <p className="text-gray-500">Administrator</p>
                </div>
            </div>
            <nav className="h-full">
                <ul className="flex flex-col h-full">
                    <li>
                        <Link
                            href={route("dashboard")}
                            className="flex items-center px-8 py-4 gap-2 hover:bg-blue-100 text-gray-400 hover:text-blue-700 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M1 20v-2.8q0-.85.438-1.562T2.6 14.55q1.55-.775 3.15-1.162T9 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T17 17.2V20zm18 0v-3q0-1.1-.612-2.113T16.65 13.15q1.275.15 2.4.513t2.1.887q.9.5 1.375 1.112T23 17v3zM6.175 10.825Q5 9.65 5 8t1.175-2.825T9 4t2.825 1.175T13 8t-1.175 2.825T9 12t-2.825-1.175m11.65 0Q16.65 12 15 12q-.275 0-.7-.062t-.7-.138q.675-.8 1.038-1.775T15 8t-.362-2.025T13.6 4.2q.35-.125.7-.163T15 4q1.65 0 2.825 1.175T19 8t-1.175 2.825"
                                />
                            </svg>
                            <p className="font-medium flex items-center">
                                Data Absensi
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route("interns.index")}
                            className="flex items-center px-8 py-4 gap-2 hover:bg-blue-100 text-gray-400 hover:text-blue-700 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M7.75 2.5a.75.75 0 0 0-1.5 0v1.58c-1.44.115-2.384.397-3.078 1.092c-.695.694-.977 1.639-1.093 3.078h19.842c-.116-1.44-.398-2.384-1.093-3.078c-.694-.695-1.639-.977-3.078-1.093V2.5a.75.75 0 0 0-1.5 0v1.513C15.585 4 14.839 4 14 4h-4c-.839 0-1.585 0-2.25.013z"
                                />
                                <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="M2 12c0-.839 0-1.585.013-2.25h19.974C22 10.415 22 11.161 22 12v2c0 3.771 0 5.657-1.172 6.828S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172S2 17.771 2 14zm15 2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-4-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6-3a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <p className="font-medium flex items-center">
                                Daftar Karyawan
                            </p>
                        </Link>
                    </li>

                    <li>
                        <Link
                            href={route("divisions.index")}
                            className="flex items-center px-8 py-4 gap-2 hover:bg-blue-100 text-gray-400 hover:text-blue-700 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1A2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5c1.5 0 2.7 1.2 2.7 2.7S5 16.2 3.5 16.2H2V20a2 2 0 0 0 2 2h3.8v-1.5c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5"
                                />
                            </svg>
                            <p className="font-medium flex items-center">
                                Divisi
                            </p>
                        </Link>
                    </li>

                    <li className="mt-auto">
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="flex items-center px-8 py-4 gap-2 hover:bg-red-100 text-gray-400 hover:text-red-700 transition-colors w-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="M2.5.351a40.5 40.5 0 0 1 5.74 0c1.136.081 2.072.874 2.264 1.932a2.25 2.25 0 0 0-2.108 2.28H4.754a2.25 2.25 0 0 0 0 4.5h3.642a2.25 2.25 0 0 0 2.145 2.281l-.004.085c-.06 1.2-1.06 2.132-2.296 2.22a40.5 40.5 0 0 1-5.742 0C1.263 13.561.263 12.63.203 11.43a91 91 0 0 1 0-8.859C.263 1.372 1.263.439 2.5.351m7.356 5.462L9.661 4.7a1 1 0 0 1 1.432-1.067c1.107.553 2.178 1.624 2.731 2.731a1 1 0 0 1 0 .895c-.553 1.107-1.624 2.178-2.731 2.731A1 1 0 0 1 9.66 8.924l.195-1.111H4.754a1 1 0 1 1 0-2z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <p className="font-medium flex items-center">
                                Logout
                            </p>
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
