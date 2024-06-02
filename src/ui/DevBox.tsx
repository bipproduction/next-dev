'use client'
import { useHover, useLocalStorage, useShallowEffect } from '@mantine/hooks'
import React from 'react'
import { MdOpenInNew } from 'react-icons/md'
import { evn } from '../util/evn'
const DevBox = ({ path, children }: { path?: string | null, children: React.ReactNode }) => {
    const [isDev, setIsDev] = useLocalStorage({ key: "isDev", defaultValue: true })
    const { hovered, ref } = useHover()
    useShallowEffect(() => {
        evn.on("isDev", setIsDev)
        return () => {
            evn.off("isDev", setIsDev);
        };
    }, [setIsDev])

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