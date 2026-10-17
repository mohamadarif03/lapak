export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <img
                src="/Logo Kanopi dan Grafik Naik.png"
                alt="LAPAK Logo"
                onError={(e) => {
                    e.currentTarget.src = '/logo-icon.png';
                }}
                className="size-9 object-contain shrink-0"
            />
            <div className="flex flex-col text-left">
                <span className="font-heading text-base font-bold tracking-tight text-foreground">
                    LAPAK
                </span>
                <span className="text-[11px] leading-none text-muted-foreground">
                    Asisten Pintar UMKM
                </span>
            </div>
        </div>
    );
}
