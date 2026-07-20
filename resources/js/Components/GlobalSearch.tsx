import { useState, useEffect } from "react";
import { SearchIcon, UsersIcon, LayersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, router } from "@inertiajs/react";
import axios from "axios";

export function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ interns: [], divisions: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length === 0) {
                setResults({ interns: [], divisions: [] });
                setIsOpen(false);
                setSelectedIndex(-1);
                return;
            }

            try {
                const res = await axios.get(route("search", { q: query }));
                setResults(res.data);
                setIsOpen(true);
                setSelectedIndex(-1); // Reset selection when results change
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const hasResults =
        results.interns.length > 0 || results.divisions.length > 0;

    // Combine results for easier keyboard navigation mapping
    const combinedResults = [
        ...results.interns.map((i: any) => ({ ...i, type: "intern" })),
        ...results.divisions.map((d: any) => ({ ...d, type: "division" })),
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || !hasResults) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % combinedResults.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev - 1 < 0 ? combinedResults.length - 1 : prev - 1,
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < combinedResults.length) {
                const item = combinedResults[selectedIndex];
                const targetRoute =
                    item.type === "intern"
                        ? route("interns.index", { show: item.id })
                        : route("divisions.index", { show: item.id });

                router.visit(targetRoute);
                setIsOpen(false);
            }
        }
    };

    return (
        <div className="relative w-full max-w-xs md:max-w-sm">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
                type="search"
                placeholder="Cari karyawan, divisi..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (query) setIsOpen(true);
                }}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="bg-muted/20 focus-visible:ring-sidebar-ring focus-visible:border-primary h-9 w-full border pl-9 shadow-none focus-visible:ring-0"
            />

            {isOpen && hasResults && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-white p-2 shadow-md">
                    {results.interns.length > 0 && (
                        <div className="mb-2">
                            <h4 className="text-muted-foreground mb-1 px-2 text-xs font-semibold">
                                Karyawan
                            </h4>
                            {results.interns.map(
                                (intern: any, index: number) => {
                                    const isSelected = selectedIndex === index;
                                    return (
                                        <Link
                                            key={intern.id}
                                            href={route("interns.index", {
                                                show: intern.id,
                                            })}
                                            className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                                                isSelected
                                                    ? "bg-muted"
                                                    : "hover:bg-muted"
                                            }`}
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                            onMouseEnter={() =>
                                                setSelectedIndex(index)
                                            }
                                        >
                                            {intern.foto ? (
                                                <img
                                                    src={`/storage/${intern.foto}`}
                                                    alt={intern.name}
                                                    className="size-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <UsersIcon className="text-muted-foreground size-4" />
                                            )}
                                            <span>{intern.name}</span>
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    )}

                    {results.divisions.length > 0 && (
                        <div>
                            <h4 className="text-muted-foreground mb-1 px-2 text-xs font-semibold">
                                Divisi
                            </h4>
                            {results.divisions.map(
                                (div: any, index: number) => {
                                    // Offset index for divisions by the number of interns
                                    const globalIndex =
                                        results.interns.length + index;
                                    const isSelected =
                                        selectedIndex === globalIndex;
                                    return (
                                        <Link
                                            key={div.id}
                                            href={route("divisions.index", {
                                                show: div.id,
                                            })}
                                            className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                                                isSelected
                                                    ? "bg-muted"
                                                    : "hover:bg-muted"
                                            }`}
                                            onMouseDown={(e) =>
                                                e.preventDefault()
                                            }
                                            onMouseEnter={() =>
                                                setSelectedIndex(globalIndex)
                                            }
                                        >
                                            <LayersIcon className="size-4" />
                                            <span>{div.name}</span>
                                        </Link>
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
