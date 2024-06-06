'use client'
import React from "react"
import { useLocalStorage, useShallowEffect } from "@mantine/hooks"

const ButtonToogle = ({ children }: { children: (isDev: boolean) => React.ReactNode }) => {
    const [isDev, setIsDev] = useLocalStorage({ key: "isDev", defaultValue: false })

    const onclik = () => {
        setIsDev(!isDev)

    }
    return <div
        onClick={onclik}
        style={{
            cursor: "pointer",
            position: "relative",
        }}>
        {children(isDev)}
    </div>
}

export default ButtonToogle