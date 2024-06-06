'use client'
import { useHover, useLocalStorage, useShallowEffect } from '@mantine/hooks'
import React from 'react'
import { MdOpenInNew } from 'react-icons/md'

const DevBox = ({ path, children }: { path?: string | null, children: React.ReactNode }) => {
    const [isDev, setIsDev] = useLocalStorage({ key: "isDev", defaultValue: true })
    const { hovered, ref } = useHover()

    return (
        <div
            ref={ref}
            style={{
                border: isDev && hovered ? "0.2px solid red" : "none",
                position: "relative"
            }}>
            <a
                href={path ? Buffer.from(path!, "base64").toString() : ""}
                style={{
                    visibility: isDev && path && hovered ? "visible" : "hidden",
                    cursor: "pointer",
                    position: "absolute",
                    right: 0,
                    top: 0,
                    color: "red",
                    zIndex: 1000
                }}>
                <MdOpenInNew />
            </a>
            {children}
        </div>
    )
}

export default DevBox