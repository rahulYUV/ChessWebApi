import { useState, useEffect } from "react"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

export function FeedbackForm() {
    const [comment, setComment] = useState("")
    const [formKey, setFormKey] = useState(0)
    const [loveCount, setLoveCount] = useState(34)

    useEffect(() => {
        const storedVisits = parseInt(localStorage.getItem('feedback_visits') || '0');
        const storedCount = parseInt(localStorage.getItem('feedback_love_count') || '34');

        const newVisits = storedVisits + 1;
        localStorage.setItem('feedback_visits', newVisits.toString());

        let newCount = storedCount;
        if (newVisits % 5 === 0 || newVisits % 7 === 0) {
            newCount = storedCount + 1;
            localStorage.setItem('feedback_love_count', newCount.toString());
        }

        setLoveCount(newCount);
    }, []);

    const placeholders = [
        "first rule of Fight Club?",
        "e4 checkmate!",
        "e5",
        "What features would you like to see?",
        "How can we improve your experience?",
        "Found a bug? Let us know!",
        "Share your thoughts on the game...",
        "Any suggestions?"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setComment(e.target.value);
    };

    const submitComment = async () => {
        if (!comment.trim()) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${apiUrl}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment }),
            });

            if (response.ok) {
                console.log("Comment saved successfully");
                setComment("");
                setFormKey(prev => prev + 1);
            } else {
                console.error("Failed to save comment");
            }
        } catch (error) {
            console.error("Error sending comment:", error);
        }
    }

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitComment();
    }

    return (
        <div className="w-full max-w-sm text-left space-y-4">
            <div className="w-full bg-white dark:bg-zinc-800 rounded-full h-12 flex items-center justify-start gap-4 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] pl-1 pr-4">
                <div className='flex -space-x-3'>
                    {avatars.map((avatar, index) => (
                        <Avatar key={index} className='ring-white dark:ring-zinc-800 size-8 ring-2'>
                            <AvatarImage src={avatar.src} alt={avatar.name} />
                            <AvatarFallback className='text-xs'>{avatar.fallback}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                <p className='text-sm text-muted-foreground'>
                    Loved by <strong className='text-foreground font-medium'>{loveCount}</strong> players.
                </p>
            </div>

            <p className="text-sm text-muted-foreground pl-2">
                We love to hear your comments and feedback
            </p>
            <PlaceholdersAndVanishInput
                key={formKey}
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={handleFormSubmit}
            />
            <Button onClick={() => submitComment()} size="sm" className="w-full">
                Send comment
            </Button>
        </div>
    )
}
