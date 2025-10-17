import { memo } from "react"
import type { urlType } from "./url"

const Youtube = memo((props : urlType) => {
    return (
        <>
            <iframe 
                src= { props.url!.replace("watch?v=","embed/") }
                className="w-full rounded-lg"
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
             </iframe>        
        </>
    )
})

export default Youtube ;