import { Truck } from 'lucide-react';
import { useMoney } from '@/hooks/useMoney';

export function FreeShippingBar({ info }: { info: { threshold: number; remaining: number; qualified: boolean } }) {
    const money = useMoney();
    const pct = Math.min(100, ((info.threshold - info.remaining) / info.threshold) * 100);
    return (
        <div>
            <div className="mb-2 flex items-center gap-2 text-[13px]">
                <Truck className="size-4 text-violet-600" />
                {info.qualified ? (
                    <span className="font-medium">You have unlocked <strong>free delivery</strong>.</span>
                ) : (
                    <span>
                        Add <strong className="tabular">{money(info.remaining)}</strong> more for free delivery
                    </span>
                )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700 ease-[var(--ease-premium)]" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
