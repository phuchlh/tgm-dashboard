"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = Cookies.get("isAuthenticated");
        if (isAuthenticated) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    }, [router]);

    return null;
}
