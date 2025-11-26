import { FloatingDock } from "@/components/ui/floating-dock";
import {
    IconBrandGithub,
    IconStar,
} from "@tabler/icons-react";
import { useState } from "react";

function GitHubIcon() {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="h-full w-full flex items-center justify-center"
        >
            {hovered ? (
                <IconStar className="h-full w-full text-yellow-500 fill-yellow-500" />
            ) : (
                <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            )}
        </div>
    );
}

export default function FloatingDockDemo() {
    const links = [
        {
            title: "k1_rahul",
            icon: (
                <img
                    src="https://images.chesscomfiles.com/uploads/v1/user/195711081.1f8aa3a9.200x200o.fc2aa78e54e2.jpg"
                    className="h-full w-full rounded-full object-cover"
                    alt="k1_rahul"
                />
            ),
            href: "https://www.chess.com/member/k1_rahul",
        },
        {
            title: "Magnus Carlsen",
            icon: (
                <img
                    src="https://images.chesscomfiles.com/uploads/v1/user/3889224.121e2094.200x200o.361c2f8a59c2.jpg"
                    className="h-full w-full rounded-full object-cover"
                    alt="Magnus Carlsen"
                />
            ),
            href: "https://www.chess.com/member/magnuscarlsen",
        },
        {
            title: "Hikaru Nakamura",
            icon: (
                <img
                    src="https://images.chesscomfiles.com/uploads/v1/user/15448422.88c010c1.200x200o.3c5619f5441e.png"
                    className="h-full w-full rounded-full object-cover"
                    alt="Hikaru Nakamura"
                />
            ),
            href: "https://www.chess.com/member/hikaru",
        },
        {
            title: "Fabiano Caruana",
            icon: (
                <img
                    src="https://images.chesscomfiles.com/uploads/v1/user/11177810.9dfc8d31.200x200o.9a9eccebc07c.png"
                    className="h-full w-full rounded-full object-cover"
                    alt="Fabiano Caruana"
                />
            ),
            href: "https://www.chess.com/member/fabianocaruana",
        },
        {
            title: "Praggnanandhaa",
            icon: (
                <img
                    src="https://images.chesscomfiles.com/uploads/v1/user/28692936.02da0bac.200x200o.d0b1b8f66ac2.jpg"
                    className="h-full w-full rounded-full object-cover"
                    alt="Praggnanandhaa"
                />
            ),
            href: "https://www.chess.com/member/rpragchess",
        },
        {
            title: "Gukesh D",
            icon: (
                <img
                    src="https://images.chesscomfiles.com/uploads/v1/user/40996222.a634fe54.200x200o.391c8e0a4b0b.jpeg"
                    className="h-full w-full rounded-full object-cover"
                    alt="Gukesh D"
                />
            ),
            href: "https://www.chess.com/member/gukeshdommaraju",
        },
        {
            title: "Samay Raina",
            icon: (
                <img
                    src="https://images.chesscomfiles.com/uploads/v1/user/34666556.66f2552e.200x200o.cf3d51ee4698.jpeg"
                    className="h-full w-full rounded-full object-cover"
                    alt="Samay Raina"
                />
            ),
            href: "https://www.chess.com/member/samayraina",
        },
        {
            title: "Star on GitHub",
            icon: <GitHubIcon />,
            href: "https://github.com/rahulYUV/ChessWebApi/tree/master",
        },
    ];
    return (
        <div className="flex items-center justify-center h-auto py-10 w-full">
            <FloatingDock
                mobileClassName="translate-y-20"
                items={links}
            />
        </div>
    );
}
