import { memo, useEffect } from "react";
import type { urlType } from "./url";

const Tweet = memo((props : urlType) => {
    // Lazy Loading Twitter Script
    useEffect(() => {
    if (!(window as any).twttr) {  // .twttr object form when the script is loaded first time
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
    } 
    else (window as any).twttr.widgets.load();
    }, [props.url]);

    return(
        <div className="w-70">
            <blockquote className = "twitter-tweet">
            <a href = {props.url?.replace("x.com","twitter.com")}></a> 
            </blockquote>
        </div>
    );
})


export default Tweet ;