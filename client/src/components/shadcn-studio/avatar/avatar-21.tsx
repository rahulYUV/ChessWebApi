import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'

const avatars = [
    {
        src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
        fallback: 'OS',
        name: 'Olivia Sparks'
    },
    {
        src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png',
        fallback: 'HL',
        name: 'Howard Lloyd'
    },
    {
        src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
        fallback: 'HR',
        name: 'Hallie Richards'
    }
]

const AvatarGroupPopularityIndicatorDemo = () => {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const incrementVisit = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const res = await fetch(`${apiUrl}/visit`, { method: 'POST' });
                const data = await res.json();
                setCount(data.count);
            } catch (error) {
                console.error("Failed to increment visit count", error);
            }
        };
        incrementVisit();
    }, []);

    return (
        <div className='bg-background flex flex-wrap items-center justify-center rounded-full border p-2 shadow-sm'>
            <div className='flex -space-x-3'>
                {avatars.map((avatar, index) => (
                    <Avatar key={index} className='ring-background size-9 ring-2'>
                        <AvatarImage src={avatar.src} alt={avatar.name} />
                        <AvatarFallback className='text-sm'>{avatar.fallback}</AvatarFallback>
                    </Avatar>
                ))}
            </div>
            <p className='text-muted-foreground px-3 text-base'>
                Loved by <strong className='text-foreground font-medium'>{count !== null ? count : '99+'}</strong> players.
            </p>
        </div>
    )
}

export default AvatarGroupPopularityIndicatorDemo
