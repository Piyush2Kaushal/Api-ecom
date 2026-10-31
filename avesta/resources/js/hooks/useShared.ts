import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';

export function useShared() {
    return usePage().props as unknown as SharedProps;
}
