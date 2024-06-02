'use client'
import React from "react"
import { useLocalStorage, useShallowEffect } from "@mantine/hooks"
import { evn } from "../util/evn"

const ButtonToogle = ({ children }: { children: (isDev: boolean) => React.ReactNode }) => {
    const [isDev, setIsDev] = useLocalStorage({ key: "isDev", defaultValue: false })

    const onclik = () => {
        evn.emit("isDev", !isDev)
    }

    useShallowEffect(() => {
        evn.on("isDev", setIsDev)
    }, [])

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