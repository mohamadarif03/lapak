import { Link, router, usePage } from '@inertiajs/react';

export function DemoBanner() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    if (!user?.is_demo) {
        return null;
    }

    const handleExitDemo = () => {
        router.post('/api/demo/exit');
    };

    return (
        <aside
            role="status"
            aria-label="Pemberitahuan mode demo"
            className="w-full bg-amber-500 text-stone-900 px-4 py-2.5 text-xs sm:text-sm font-medium flex flex-wrap items-center justify-between gap-3 shadow-sm border-b border-amber-600"
        >
            <div className="flex items-center gap-2">
                <span>Mode demo. Data akan dihapus otomatis.</span>
            </div>
            <div className="flex items-center gap-3">
                <Link
                    href="/masuk"
                    className="underline font-semibold hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 rounded px-1"
                >
                    Daftar sekarang
                </Link>
                <button
                    type="button"
                    onClick={handleExitDemo}
                    className="bg-stone-900 text-white hover:bg-stone-800 px-3 py-1 rounded text-xs font-semibold shadow-xs transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 cursor-pointer min-h-[32px] inline-flex items-center"
                >
                    Keluar dari demo
                </button>
            </div>
        </aside>
    );
}

export default DemoBanner;
